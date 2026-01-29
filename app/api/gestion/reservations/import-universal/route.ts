import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import type { ColumnMapping, ImportConfig, UniversalImportRequest } from '@/types/import'

/**
 * POST /api/gestion/reservations/import-universal
 * Universal import endpoint that accepts mapped data
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body: UniversalImportRequest = await request.json()
    const { rows, mapping, config, propertyId, skipDuplicates } = body

    // Validate input
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: 'No hay filas para importar' },
        { status: 400 }
      )
    }

    if (!mapping || !config || !propertyId) {
      return NextResponse.json(
        { error: 'Mapeo, configuración y propiedad son requeridos' },
        { status: 400 }
      )
    }

    // Verify property belongs to user and get billing config
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        hostId: userId
      },
      include: {
        billingConfig: {
          select: {
            id: true,
            commissionType: true,
            commissionValue: true,
            cleaningValue: true,
            cleaningFeeRecipient: true,
            cleaningFeeSplitPct: true
          }
        }
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    if (!property.billingConfig) {
      return NextResponse.json(
        { error: 'Configure la facturación de la propiedad primero' },
        { status: 400 }
      )
    }

    const billingConfig = property.billingConfig

    const results = {
      totalRows: rows.length,
      importedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: [] as Array<{ row: number; error: string; data?: unknown }>
    }

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2 // +2 for header row and 1-based index

      try {
        const parsed = parseRow(row, mapping, config, rowNum)

        if (!parsed.isValid) {
          results.errors.push({ row: rowNum, error: parsed.errors.join(', '), data: row })
          results.errorCount++
          continue
        }

        // Check for duplicate (only within the same property)
        if (skipDuplicates && parsed.confirmationCode) {
          const existing = await prisma.reservation.findFirst({
            where: {
              userId,
              confirmationCode: parsed.confirmationCode,
              billingConfigId: billingConfig.id
            }
          })

          if (existing) {
            results.skippedCount++
            continue
          }
        }

        // Always use property config cleaning value for consistency
        const configCleaningFee = Number(billingConfig.cleaningValue) || 0

        // Calculate financial split
        const financials = calculateFinancialSplit(
          parsed.amount,
          configCleaningFee,
          billingConfig
        )

        // Map platform string to enum
        const platformMap: Record<string, 'AIRBNB' | 'BOOKING' | 'VRBO' | 'DIRECT' | 'OTHER'> = {
          'AIRBNB': 'AIRBNB',
          'BOOKING': 'BOOKING',
          'VRBO': 'VRBO',
          'DIRECT': 'DIRECT',
          'OTHER': 'OTHER'
        }
        const platform = platformMap[config.platform] || 'OTHER'

        // Create reservation
        await prisma.reservation.create({
          data: {
            userId,
            billingConfigId: billingConfig.id,
            platform,
            confirmationCode: parsed.confirmationCode,
            guestName: parsed.guestName,
            checkIn: parsed.checkIn!,
            checkOut: parsed.checkOut!,
            nights: parsed.nights,
            roomTotal: config.amountType === 'GROSS' ? parsed.amount : parsed.amount + parsed.commission,
            cleaningFee: configCleaningFee,
            hostServiceFee: parsed.commission,
            hostEarnings: config.amountType === 'NET' ? parsed.amount : parsed.amount - parsed.commission,
            currency: 'EUR',
            status: mapStatus(parsed.status),
            type: 'BOOKING',
            importSource: 'CSV_UNIVERSAL',
            // Financial split
            ownerAmount: financials.ownerAmount,
            managerAmount: financials.managerAmount,
            cleaningAmount: financials.cleaningAmount
          }
        })

        results.importedCount++
      } catch (error) {
        results.errors.push({
          row: rowNum,
          error: error instanceof Error ? error.message : 'Error desconocido',
          data: row
        })
        results.errorCount++
      }
    }

    // Log the import
    await prisma.reservationImport.create({
      data: {
        userId,
        fileName: `universal_import_${new Date().toISOString().slice(0, 10)}.csv`,
        source: config.platform || 'MANUAL',
        totalRows: results.totalRows,
        importedCount: results.importedCount,
        skippedCount: results.skippedCount,
        errorCount: results.errorCount,
        errors: results.errors.length > 0 ? results.errors : undefined,
        propertyId
      }
    })

    return NextResponse.json({
      success: true,
      results
    })
  } catch (error) {
    console.error('Error importing reservations:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * Parse a single row using the provided mapping and config
 */
function parseRow(
  row: string[],
  mapping: ColumnMapping,
  config: ImportConfig,
  rowNum: number
): {
  isValid: boolean
  errors: string[]
  confirmationCode: string
  guestName: string
  checkIn: Date | null
  checkOut: Date | null
  nights: number
  amount: number
  cleaningFee: number
  commission: number
  status: string
} {
  const errors: string[] = []

  // Get values from mapped columns
  const guestName = row[mapping.guestName]?.trim() || ''
  const checkInStr = row[mapping.checkIn]?.trim() || ''
  const checkOutStr = row[mapping.checkOut]?.trim() || ''
  const amountStr = row[mapping.amount]?.trim() || ''

  // Optional fields
  let confirmationCode = mapping.confirmationCode !== undefined
    ? row[mapping.confirmationCode]?.trim() || ''
    : ''
  const nightsStr = mapping.nights !== undefined
    ? row[mapping.nights]?.trim() || ''
    : ''
  const cleaningFeeStr = mapping.cleaningFee !== undefined
    ? row[mapping.cleaningFee]?.trim() || ''
    : '0'
  const commissionStr = mapping.commission !== undefined
    ? row[mapping.commission]?.trim() || ''
    : '0'
  const status = mapping.status !== undefined
    ? row[mapping.status]?.trim() || ''
    : 'CONFIRMED'

  // Validate required fields
  if (!guestName) {
    errors.push('Nombre de huésped vacío')
  }

  // Parse dates
  const checkIn = parseDate(checkInStr, config.dateFormat)
  const checkOut = parseDate(checkOutStr, config.dateFormat)

  if (!checkIn) {
    errors.push(`Fecha de entrada inválida: "${checkInStr}"`)
  }
  if (!checkOut) {
    errors.push(`Fecha de salida inválida: "${checkOutStr}"`)
  }

  // Parse amounts
  const amount = parseAmount(amountStr, config.numberFormat)
  const cleaningFee = parseAmount(cleaningFeeStr, config.numberFormat)
  const commission = parseAmount(commissionStr, config.numberFormat)

  if (amount <= 0 && !errors.length) {
    errors.push(`Importe inválido: "${amountStr}"`)
  }

  // Calculate nights if not provided
  let nights = nightsStr ? parseInt(nightsStr, 10) : 0
  if (!nights && checkIn && checkOut) {
    nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Generate confirmation code if not provided
  if (!confirmationCode && checkIn) {
    const dateStr = checkIn.toISOString().slice(0, 10).replace(/-/g, '')
    const guestHash = guestName.substring(0, 3).toUpperCase().padEnd(3, 'X')
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    confirmationCode = `UNI-${dateStr}-${guestHash}-${randomSuffix}`
  }

  return {
    isValid: errors.length === 0,
    errors,
    confirmationCode,
    guestName,
    checkIn,
    checkOut,
    nights,
    amount,
    cleaningFee,
    commission,
    status
  }
}

/**
 * Parse date string - auto-detects format
 */
function parseDate(str: string, _format?: ImportConfig['dateFormat']): Date | null {
  if (!str) return null

  const cleanStr = str.trim()
  let day: number, month: number, year: number

  // Try ISO format first: YYYY-MM-DD (most unambiguous)
  const isoMatch = cleanStr.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/)
  if (isoMatch) {
    year = parseInt(isoMatch[1], 10)
    month = parseInt(isoMatch[2], 10)
    day = parseInt(isoMatch[3], 10)
  } else {
    // Try DD/MM/YYYY or MM/DD/YYYY
    const match = cleanStr.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/)
    if (!match) return null

    const first = parseInt(match[1], 10)
    const second = parseInt(match[2], 10)
    year = parseInt(match[3], 10)

    // Smart detection: if first > 12, it must be day (European format)
    // if second > 12, it must be day (American format)
    if (first > 12) {
      day = first
      month = second
    } else if (second > 12) {
      month = first
      day = second
    } else {
      // Both <= 12: ambiguous, default to European (DD/MM/YYYY)
      day = first
      month = second
    }
  }

  // Validate
  if (month < 1 || month > 12) return null
  if (day < 1 || day > 31) return null
  if (year < 2000 || year > 2100) return null

  return new Date(year, month - 1, day)
}

/**
 * Parse amount string according to number format
 */
function parseAmount(str: string, format: ImportConfig['numberFormat']): number {
  if (!str) return 0

  // Remove currency symbols and spaces
  let cleaned = str.replace(/[€$£\s]/g, '')

  if (format === 'EU') {
    // European format: 1.234,56
    // Remove thousands separator (.) and replace decimal separator (,) with .
    if (cleaned.includes(',') && cleaned.includes('.')) {
      // Has both - assume . is thousands, , is decimal
      cleaned = cleaned.replace(/\./g, '').replace(',', '.')
    } else if (cleaned.includes(',')) {
      // Only comma - assume decimal separator
      cleaned = cleaned.replace(',', '.')
    }
  } else {
    // US format: 1,234.56
    // Remove thousands separator (,) - decimal separator (.) is correct
    cleaned = cleaned.replace(/,/g, '')
  }

  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

/**
 * Map status string to reservation status
 */
function mapStatus(statusStr: string): 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' {
  const lower = statusStr.toLowerCase()

  if (lower.includes('cancel')) return 'CANCELLED'
  if (lower.includes('complet') || lower.includes('past') || lower.includes('finaliz')) return 'COMPLETED'
  if (lower.includes('pending') || lower.includes('pendiente')) return 'PENDING'
  if (lower.includes('no show') || lower.includes('no-show')) return 'NO_SHOW'

  return 'CONFIRMED'
}

/**
 * Calculate financial split between owner and manager
 */
function calculateFinancialSplit(
  hostEarnings: number,
  cleaningFee: number,
  config: {
    commissionType: string
    commissionValue: unknown
    cleaningFeeRecipient: string
    cleaningFeeSplitPct: unknown
  }
): {
  ownerAmount: number
  managerAmount: number
  cleaningAmount: number
} {
  const commissionValue = Number(config.commissionValue) || 0
  const cleaningFeeSplitPct = Number(config.cleaningFeeSplitPct) || 0

  // Base amount for commission calculation (hostEarnings includes cleaning)
  const accommodationEarnings = hostEarnings - cleaningFee

  // Calculate manager commission based on type
  let managerCommission = 0
  if (config.commissionType === 'PERCENTAGE') {
    managerCommission = accommodationEarnings * (commissionValue / 100)
  } else if (config.commissionType === 'FIXED_PER_RESERVATION') {
    managerCommission = commissionValue
  }
  // FIXED_MONTHLY is handled separately in liquidations

  // Calculate cleaning distribution
  let managerCleaningAmount = 0
  let ownerCleaningAmount = 0

  switch (config.cleaningFeeRecipient) {
    case 'MANAGER':
      managerCleaningAmount = cleaningFee
      break
    case 'OWNER':
      ownerCleaningAmount = cleaningFee
      break
    case 'SPLIT':
      managerCleaningAmount = cleaningFee * (cleaningFeeSplitPct / 100)
      ownerCleaningAmount = cleaningFee - managerCleaningAmount
      break
  }

  // Final amounts
  const managerAmount = managerCommission + managerCleaningAmount
  const ownerAmount = hostEarnings - managerAmount
  const cleaningAmount = managerCleaningAmount

  return {
    ownerAmount: Math.round(ownerAmount * 100) / 100,
    managerAmount: Math.round(managerAmount * 100) / 100,
    cleaningAmount: Math.round(cleaningAmount * 100) / 100
  }
}
