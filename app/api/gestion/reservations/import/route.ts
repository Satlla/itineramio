import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * POST /api/gestion/reservations/import
 * Import reservations from Airbnb CSV file
 *
 * Expected Airbnb CSV columns:
 * - Código de confirmación
 * - Estado
 * - Nombre del huésped
 * - Nº de adultos
 * - Nº de niños
 * - Nº de bebés
 * - Fecha de inicio (check-in)
 * - Fecha de finalización (check-out)
 * - Nº de noches
 * - Alojamiento
 * - Limpieza
 * - Ganancias brutas (total pagado por el huésped antes de comisiones)
 * - Comisión servicio anfitrión
 * - Ganancias netas
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const formData = await request.formData()
    const file = formData.get('file') as File
    const propertyId = formData.get('propertyId') as string
    const skipDuplicates = formData.get('skipDuplicates') !== 'false'

    if (!file) {
      return NextResponse.json(
        { error: 'Archivo CSV requerido' },
        { status: 400 }
      )
    }

    // Verify property belongs to user and get billing config
    let billingConfig: {
      id: string
      commissionType: string
      commissionValue: any
      cleaningFeeRecipient: string
      cleaningFeeSplitPct: any
    } | null = null

    if (propertyId) {
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

      if (property.billingConfig) {
        billingConfig = property.billingConfig
      }
    }

    // If no billing config, we need one
    if (!billingConfig) {
      return NextResponse.json(
        { error: 'Configure la facturación de la propiedad primero' },
        { status: 400 }
      )
    }

    // Read and parse CSV
    const csvText = await file.text()
    const rows = parseCSV(csvText)

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'El archivo CSV está vacío o no tiene el formato correcto' },
        { status: 400 }
      )
    }

    // Generate batch ID for this import (for rollback capability)
    const importBatchId = `IMP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const results = {
      totalRows: rows.length,
      importedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: [] as Array<{ row: number; error: string; data?: any }>,
      importBatchId,
      listingsFound: new Set<string>()
    }

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2 // +2 for header row and 1-based index

      try {
        const parsed = parseAirbnbRow(row)

        if (!parsed) {
          // Not an error - just not a reservation row (e.g., Payout, Resolution, etc.)
          results.skippedCount++
          continue
        }

        // Check for duplicate
        if (skipDuplicates) {
          const existing = await prisma.reservation.findFirst({
            where: {
              userId,
              platform: 'AIRBNB',
              confirmationCode: parsed.confirmationCode
            }
          })

          if (existing) {
            results.skippedCount++
            continue
          }
        }

        // Calculate financial split
        const financials = calculateFinancialSplit(
          parsed.hostEarnings,
          parsed.cleaningFee,
          billingConfig
        )

        // Track listing name for info
        if (parsed.listingName) {
          results.listingsFound.add(parsed.listingName)
        }

        // Create reservation
        await prisma.reservation.create({
          data: {
            userId,
            billingConfigId: billingConfig.id,
            platform: 'AIRBNB',
            confirmationCode: parsed.confirmationCode,
            guestName: parsed.guestName,
            travelers: parsed.travelers,
            checkIn: parsed.checkIn,
            checkOut: parsed.checkOut,
            nights: parsed.nights,
            roomTotal: parsed.roomTotal,
            cleaningFee: parsed.cleaningFee,
            hostServiceFee: parsed.hostServiceFee,
            hostEarnings: parsed.hostEarnings,
            currency: 'EUR',
            status: parsed.status,
            type: 'BOOKING',
            importSource: 'CSV',
            importBatchId,
            sourceListingName: parsed.listingName,
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
        fileName: file.name,
        source: 'AIRBNB',
        totalRows: results.totalRows,
        importedCount: results.importedCount,
        skippedCount: results.skippedCount,
        errorCount: results.errorCount,
        errors: results.errors.length > 0 ? results.errors : undefined,
        propertyId: propertyId || null,
        importBatchId: results.importBatchId,
        listingsFound: Array.from(results.listingsFound)
      }
    })

    return NextResponse.json({
      success: true,
      results: {
        totalRows: results.totalRows,
        importedCount: results.importedCount,
        skippedCount: results.skippedCount,
        errorCount: results.errorCount,
        errors: results.errors,
        importBatchId: results.importBatchId,
        listingsFound: Array.from(results.listingsFound)
      }
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
 * Parse CSV text into array of objects
 */
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  if (lines.length < 2) {
    return []
  }

  // Parse header
  const headerLine = lines[0]
  const headers = parseCSVLine(headerLine)

  // Parse data rows
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const row: Record<string, string> = {}

    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || ''
    }

    rows.push(row)
  }

  return rows
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if ((char === ',' || char === ';') && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  values.push(current.trim())
  return values
}

/**
 * Parse an Airbnb CSV row into reservation data
 */
function parseAirbnbRow(row: Record<string, string>): {
  confirmationCode: string
  guestName: string
  travelers: { adults: number; children: number; babies: number }
  checkIn: Date
  checkOut: Date
  nights: number
  roomTotal: number
  cleaningFee: number
  hostServiceFee: number
  hostEarnings: number
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  listingName: string | null
} | null {
  // Check row type - only import "Reserva" type rows
  const rowType = findValue(row, ['Tipo', 'Type'])
  if (rowType && !rowType.toLowerCase().includes('reserva') && !rowType.toLowerCase().includes('reservation')) {
    // Skip Payout, Resolution, Credit rows etc.
    return null
  }

  // Try to find confirmation code (optional - we'll generate one if missing)
  let confirmationCode = findValue(row, [
    'Código de confirmación',
    'Confirmation code',
    'Código confirmación',
    'Confirmation Code'
  ])

  // Guest name - include 'Viajero' which is used in some Airbnb export formats
  const guestName = findValue(row, [
    'Nombre del huésped',
    'Guest name',
    'Huésped',
    'Guest',
    'Viajero',
    'Nombre del viajero'
  ]) || 'Huésped'

  // Travelers
  const adults = parseInt(findValue(row, ['Nº de adultos', 'Adults', 'Adultos']) || '1', 10)
  const children = parseInt(findValue(row, ['Nº de niños', 'Children', 'Niños']) || '0', 10)
  const babies = parseInt(findValue(row, ['Nº de bebés', 'Infants', 'Bebés']) || '0', 10)

  // Dates
  const checkInStr = findValue(row, [
    'Fecha de inicio',
    'Start date',
    'Check-in',
    'Fecha entrada'
  ])
  const checkOutStr = findValue(row, [
    'Fecha de finalización',
    'End date',
    'Check-out',
    'Fecha salida'
  ])

  if (!checkInStr || !checkOutStr) {
    return null
  }

  const checkIn = parseDate(checkInStr)
  const checkOut = parseDate(checkOutStr)

  if (!checkIn || !checkOut) {
    return null
  }

  // Generate confirmation code if missing (from dates + guest name)
  if (!confirmationCode) {
    const dateStr = checkIn.toISOString().slice(0, 10).replace(/-/g, '')
    const guestHash = guestName.substring(0, 3).toUpperCase().padEnd(3, 'X')
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    confirmationCode = `GEN-${dateStr}-${guestHash}-${randomSuffix}`
  }

  // Nights
  const nightsStr = findValue(row, ['Nº de noches', 'Nights', 'Noches'])
  const nights = nightsStr
    ? parseInt(nightsStr, 10)
    : Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

  // Amounts
  const roomTotal = parseAmount(findValue(row, [
    'Alojamiento',
    'Accommodation',
    'Precio alojamiento'
  ]) || '0')

  const cleaningFee = parseAmount(findValue(row, [
    'Limpieza',
    'Cleaning fee',
    'Gastos de limpieza',
    'Tarifa de limpieza'
  ]) || '0')

  const hostServiceFee = parseAmount(findValue(row, [
    'Comisión servicio anfitrión',
    'Host service fee',
    'Comisión anfitrión',
    'Comisión de servicio del anfitrión'
  ]) || '0')

  const hostEarnings = parseAmount(findValue(row, [
    'Ganancias netas',
    'Net earnings',
    'Ganancias',
    'You earn',
    'Importe',
    'Tus ganancias'
  ]) || '0')

  // Status
  const statusStr = findValue(row, ['Estado', 'Status']) || ''
  let status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' = 'CONFIRMED'

  if (statusStr.toLowerCase().includes('cancel')) {
    status = 'CANCELLED'
  } else if (statusStr.toLowerCase().includes('complet') || statusStr.toLowerCase().includes('past')) {
    status = 'COMPLETED'
  }

  // Listing name (for traceability - allows future separation by property)
  // Note: 'Anuncio' is the correct column in Airbnb exports (not 'Alojamiento' which is the price)
  const listingName = findValue(row, [
    'Anuncio',
    'Listing',
    'Listing name',
    'Nombre del alojamiento',
    'Property',
    'Propiedad'
  ])

  return {
    confirmationCode,
    guestName,
    travelers: { adults, children, babies },
    checkIn,
    checkOut,
    nights,
    roomTotal,
    cleaningFee,
    hostServiceFee,
    hostEarnings,
    status,
    listingName
  }
}

/**
 * Find a value in a row by trying multiple possible column names
 */
function findValue(row: Record<string, string>, possibleKeys: string[]): string | null {
  for (const key of possibleKeys) {
    // Try exact match
    if (row[key] !== undefined && row[key] !== '') {
      return row[key]
    }

    // Try case-insensitive match
    const lowerKey = key.toLowerCase()
    for (const [k, v] of Object.entries(row)) {
      if (k.toLowerCase() === lowerKey && v !== '') {
        return v
      }
    }
  }

  return null
}

/**
 * Parse a date string in various formats
 * AIRBNB uses MM/DD/YYYY format!
 * Uses UTC noon to avoid timezone issues
 */
function parseDate(str: string): Date | null {
  if (!str) return null

  const clean = str.trim()

  // Try YYYY-MM-DD (ISO format)
  const yyyymmdd = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (yyyymmdd) {
    const y = parseInt(yyyymmdd[1])
    const m = parseInt(yyyymmdd[2])
    const d = parseInt(yyyymmdd[3])
    return new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  }

  // Try XX/XX/YYYY format - need to determine if DD/MM or MM/DD
  const slashFormat = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slashFormat) {
    const first = parseInt(slashFormat[1])
    const second = parseInt(slashFormat[2])
    const year = parseInt(slashFormat[3])

    // If second number > 12, it MUST be the day (first is month) = MM/DD/YYYY
    if (second > 12) {
      return new Date(Date.UTC(year, first - 1, second, 12, 0, 0))
    }
    // If first number > 12, it MUST be the day = DD/MM/YYYY
    if (first > 12) {
      return new Date(Date.UTC(year, second - 1, first, 12, 0, 0))
    }
    // Both <= 12: AIRBNB uses MM/DD/YYYY format
    return new Date(Date.UTC(year, first - 1, second, 12, 0, 0))
  }

  // Try DD-MM-YYYY
  const dashFormat = clean.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
  if (dashFormat) {
    const first = parseInt(dashFormat[1])
    const second = parseInt(dashFormat[2])
    const year = parseInt(dashFormat[3])

    if (second > 12) {
      return new Date(Date.UTC(year, first - 1, second, 12, 0, 0))
    }
    if (first > 12) {
      return new Date(Date.UTC(year, second - 1, first, 12, 0, 0))
    }
    // Default to DD/MM/YYYY for dash format
    return new Date(Date.UTC(year, second - 1, first, 12, 0, 0))
  }

  // Try native Date parsing
  const parsed = new Date(clean)
  if (!isNaN(parsed.getTime())) {
    return parsed
  }

  return null
}

/**
 * Parse an amount string (handles European format with comma as decimal)
 */
function parseAmount(str: string): number {
  if (!str) return 0

  // Remove currency symbols and spaces
  let cleaned = str.replace(/[€$£\s]/g, '')

  // Handle European format (1.234,56 -> 1234.56)
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // If comma comes after dot, it's decimal separator
    const lastComma = cleaned.lastIndexOf(',')
    const lastDot = cleaned.lastIndexOf('.')
    if (lastComma > lastDot) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.')
    } else {
      cleaned = cleaned.replace(/,/g, '')
    }
  } else if (cleaned.includes(',')) {
    // Single comma, assume decimal separator
    cleaned = cleaned.replace(',', '.')
  }

  return parseFloat(cleaned) || 0
}

/**
 * Calculate financial split between owner and manager
 */
function calculateFinancialSplit(
  hostEarnings: number,
  cleaningFee: number,
  config: {
    commissionType: string
    commissionValue: any
    cleaningFeeRecipient: string
    cleaningFeeSplitPct: any
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

/**
 * GET /api/gestion/reservations/import
 * Get import history
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const imports = await prisma.reservationImport.findMany({
      where: { userId },
      orderBy: { importDate: 'desc' },
      take: 20
    })

    return NextResponse.json({
      imports: imports.map(i => ({
        id: i.id,
        fileName: i.fileName,
        source: i.source,
        importDate: i.importDate.toISOString(),
        totalRows: i.totalRows,
        importedCount: i.importedCount,
        skippedCount: i.skippedCount,
        errorCount: i.errorCount,
        errors: i.errors
      }))
    })
  } catch (error) {
    console.error('Error fetching import history:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
