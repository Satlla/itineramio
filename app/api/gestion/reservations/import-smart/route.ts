import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import * as XLSX from 'xlsx'

interface ListingMapping {
  billingUnitId: string
  saveAsAlias: boolean
}

interface ImportSmartRequest {
  rows: string[][]
  headers: string[]
  platform: 'AIRBNB' | 'BOOKING'
  skipDuplicates: boolean
  listingMappings: Record<string, ListingMapping>
  skipUnmappedListings?: boolean
  defaultBillingUnitId?: string
}

/**
 * POST /api/gestion/reservations/import-smart
 * Smart import that assigns reservations to multiple BillingUnits based on listing mappings
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body: ImportSmartRequest = await request.json()
    const { rows, headers, platform, skipDuplicates, listingMappings, skipUnmappedListings, defaultBillingUnitId } = body

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'No hay datos para importar' },
        { status: 400 }
      )
    }

    // Get all BillingUnits for the user to validate mappings
    const billingUnits = await prisma.billingUnit.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        name: true,
        commissionType: true,
        commissionValue: true,
        cleaningType: true,
        cleaningValue: true,
        cleaningFeeRecipient: true,
        cleaningFeeSplitPct: true,
        airbnbNames: true,
        bookingNames: true,
        vrboNames: true
      }
    })

    const billingUnitMap = new Map(billingUnits.map(u => [u.id, u]))

    // Validate all mapping targets exist
    for (const [listingName, mapping] of Object.entries(listingMappings)) {
      if (!billingUnitMap.has(mapping.billingUnitId)) {
        return NextResponse.json(
          { error: `BillingUnit no encontrado para "${listingName}"` },
          { status: 400 }
        )
      }
    }

    // Validate default billing unit if provided
    let defaultBillingUnit = null
    if (defaultBillingUnitId) {
      defaultBillingUnit = billingUnitMap.get(defaultBillingUnitId)
      if (!defaultBillingUnit) {
        return NextResponse.json(
          { error: 'BillingUnit por defecto no encontrado' },
          { status: 400 }
        )
      }
    }

    // Get column indices based on platform
    const colIndices = getColumnIndices(headers, platform)

    // Generate batch ID for this import
    const importBatchId = `SMART-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const results = {
      totalRows: rows.length,
      importedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: [] as Array<{ row: number; error: string; data?: any }>,
      importBatchId,
      byBillingUnit: new Map<string, { name: string; count: number }>(),
      aliasesSaved: [] as { billingUnitId: string; billingUnitName: string; alias: string }[]
    }

    // Track aliases to save (deduplicated)
    const aliasesToSave = new Map<string, Set<string>>()

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2 // +1 for header, +1 for 1-based

      try {
        const parsed = platform === 'BOOKING'
          ? parseBookingRowFromArray(row, colIndices)
          : parseAirbnbRowFromArray(row, colIndices)

        if (!parsed) {
          // Not a reservation row (e.g., Payout, empty row)
          results.skippedCount++
          continue
        }

        // Find the BillingUnit for this listing
        const listingName = parsed.listingName || ''
        const mapping = listingMappings[listingName]

        let targetBillingUnit: typeof billingUnits[0] | null = null

        if (mapping) {
          targetBillingUnit = billingUnitMap.get(mapping.billingUnitId) || null

          // Track alias to save if requested
          if (mapping.saveAsAlias && listingName && targetBillingUnit) {
            if (!aliasesToSave.has(mapping.billingUnitId)) {
              aliasesToSave.set(mapping.billingUnitId, new Set())
            }
            aliasesToSave.get(mapping.billingUnitId)!.add(listingName)
          }
        } else if (defaultBillingUnit) {
          targetBillingUnit = defaultBillingUnit
        }

        if (!targetBillingUnit) {
          if (skipUnmappedListings) {
            // Skip this row silently when skipUnmappedListings is enabled
            results.skippedCount++
            continue
          }
          results.errors.push({
            row: rowNum,
            error: `No se encontró BillingUnit para "${listingName || 'sin listing'}". Configura el mapeo.`,
            data: { listingName, guestName: parsed.guestName }
          })
          results.errorCount++
          continue
        }

        // Check for duplicate
        if (skipDuplicates && parsed.confirmationCode) {
          const existing = await prisma.reservation.findFirst({
            where: {
              userId,
              platform,
              confirmationCode: parsed.confirmationCode
            }
          })

          if (existing) {
            results.skippedCount++
            continue
          }
        }

        // Calculate cleaning fee from BillingUnit config if not provided by platform
        // (Booking doesn't separate cleaning fees in their CSV)
        let cleaningFee = parsed.cleaningFee
        if (cleaningFee === 0 && targetBillingUnit.cleaningValue) {
          const cleaningValue = Number(targetBillingUnit.cleaningValue) || 0
          if (targetBillingUnit.cleaningType === 'PER_NIGHT') {
            cleaningFee = cleaningValue * parsed.nights
          } else {
            // FIXED_PER_RESERVATION (default)
            cleaningFee = cleaningValue
          }
        }

        // Calculate financial split
        const financials = calculateFinancialSplit(
          parsed.hostEarnings,
          cleaningFee,
          targetBillingUnit
        )

        // Create reservation
        await prisma.reservation.create({
          data: {
            userId,
            billingUnitId: targetBillingUnit.id,
            platform,
            confirmationCode: parsed.confirmationCode,
            guestName: parsed.guestName,
            travelers: parsed.travelers,
            checkIn: parsed.checkIn,
            checkOut: parsed.checkOut,
            nights: parsed.nights,
            roomTotal: parsed.roomTotal,
            cleaningFee: cleaningFee,
            hostServiceFee: parsed.hostServiceFee,
            hostEarnings: parsed.hostEarnings,
            currency: 'EUR',
            status: parsed.status,
            type: 'BOOKING',
            importSource: 'CSV',
            importBatchId,
            sourceListingName: parsed.listingName,
            ownerAmount: financials.ownerAmount,
            managerAmount: financials.managerAmount,
            cleaningAmount: financials.cleaningAmount
          }
        })

        results.importedCount++

        // Track by billing unit
        if (!results.byBillingUnit.has(targetBillingUnit.id)) {
          results.byBillingUnit.set(targetBillingUnit.id, { name: targetBillingUnit.name, count: 0 })
        }
        results.byBillingUnit.get(targetBillingUnit.id)!.count++

      } catch (error) {
        results.errors.push({
          row: rowNum,
          error: error instanceof Error ? error.message : 'Error desconocido',
          data: row
        })
        results.errorCount++
      }
    }

    // Save new aliases to BillingUnits
    for (const entry of aliasesToSave.entries()) {
      const [billingUnitId, aliases] = entry
      const unit = billingUnitMap.get(billingUnitId)
      if (!unit) continue

      const existingAliases = platform === 'AIRBNB'
        ? unit.airbnbNames
        : platform === 'BOOKING'
          ? unit.bookingNames
          : unit.vrboNames

      const newAliases = Array.from(aliases).filter(a => !existingAliases.includes(a))

      if (newAliases.length > 0) {
        const updateField = platform === 'AIRBNB'
          ? 'airbnbNames'
          : platform === 'BOOKING'
            ? 'bookingNames'
            : 'vrboNames'

        await prisma.billingUnit.update({
          where: { id: billingUnitId },
          data: {
            [updateField]: [...existingAliases, ...newAliases]
          }
        })

        for (const alias of newAliases) {
          results.aliasesSaved.push({
            billingUnitId,
            billingUnitName: unit.name,
            alias
          })
        }
      }
    }

    // Log the import
    await prisma.reservationImport.create({
      data: {
        userId,
        fileName: `smart-import-${platform.toLowerCase()}`,
        source: platform,
        totalRows: results.totalRows,
        importedCount: results.importedCount,
        skippedCount: results.skippedCount,
        errorCount: results.errorCount,
        errors: results.errors.length > 0 ? results.errors : undefined,
        importBatchId,
        listingsFound: Object.keys(listingMappings)
      }
    })

    return NextResponse.json({
      success: true,
      results: {
        totalRows: results.totalRows,
        importedCount: results.importedCount,
        skippedCount: results.skippedCount,
        errorCount: results.errorCount,
        errors: results.errors.slice(0, 20), // Limit errors in response
        importBatchId,
        byBillingUnit: Array.from(results.byBillingUnit.entries()).map(([id, data]) => ({
          id,
          name: data.name,
          count: data.count
        })),
        aliasesSaved: results.aliasesSaved
      }
    })

  } catch (error) {
    console.error('Error in smart import:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

function getColumnIndices(headers: string[], platform: string) {
  const find = (names: string[]) => {
    const headersLower = headers.map(h => h.toLowerCase().trim())
    for (const name of names) {
      const idx = headersLower.findIndex(h => h.includes(name.toLowerCase()))
      if (idx !== -1) return idx
    }
    return -1
  }

  if (platform === 'BOOKING') {
    return {
      confirmationCode: find(['número de reserva', 'reservation number']),
      guestName: find(['nombre del cliente', 'guest name', 'reservado por']),
      checkIn: find(['entrada', 'check-in', 'arrival']),
      checkOut: find(['salida', 'check-out', 'departure']),
      nights: find(['duración', 'noches', 'nights']),
      listingName: find(['tipo de unidad', 'unit type', 'room type']),
      roomTotal: find(['precio', 'price', 'total']),
      commission: find(['importe de la comisión', 'commission amount']),
      status: find(['estado', 'status'])
    }
  } else {
    return {
      confirmationCode: find(['código de confirmación', 'confirmation code']),
      guestName: find(['viajero', 'nombre del viajero', 'guest name', 'nombre del huésped']),
      checkIn: find(['fecha de inicio', 'start date', 'check-in']),
      checkOut: find(['fecha de finalización', 'end date', 'check-out']),
      nights: find(['nº de noches', 'noches', 'nights']),
      listingName: find(['anuncio', 'listing', 'property']),
      roomTotal: find(['alojamiento', 'accommodation']),
      cleaningFee: find(['limpieza', 'cleaning fee', 'gastos de limpieza']),
      hostServiceFee: find(['comisión servicio anfitrión', 'host service fee']),
      hostEarnings: find(['ganancias netas', 'net earnings', 'importe', 'tus ganancias']),
      status: find(['estado', 'status']),
      type: find(['tipo', 'type'])
    }
  }
}

function parseAirbnbRowFromArray(row: string[], colIndices: any): {
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
  if (colIndices.type !== -1) {
    const rowType = row[colIndices.type]?.toLowerCase() || ''
    if (rowType && !rowType.includes('reserva') && !rowType.includes('reservation')) {
      return null
    }
  }

  const checkInStr = colIndices.checkIn !== -1 ? row[colIndices.checkIn]?.trim() : ''
  const checkOutStr = colIndices.checkOut !== -1 ? row[colIndices.checkOut]?.trim() : ''

  if (!checkInStr || !checkOutStr) {
    return null
  }

  const checkIn = parseDate(checkInStr)
  const checkOut = parseDate(checkOutStr)

  if (!checkIn || !checkOut) {
    return null
  }

  let confirmationCode = colIndices.confirmationCode !== -1 ? row[colIndices.confirmationCode]?.trim() : ''
  if (!confirmationCode) {
    const dateStr = checkIn.toISOString().slice(0, 10).replace(/-/g, '')
    const guestName = colIndices.guestName !== -1 ? row[colIndices.guestName]?.trim() : ''
    const guestHash = (guestName || 'XXX').substring(0, 3).toUpperCase().padEnd(3, 'X')
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    confirmationCode = `GEN-${dateStr}-${guestHash}-${randomSuffix}`
  }

  const nightsStr = colIndices.nights !== -1 ? row[colIndices.nights]?.trim() : ''
  const nights = nightsStr
    ? parseInt(nightsStr, 10)
    : Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

  const roomTotal = colIndices.roomTotal !== -1 ? parseAmount(row[colIndices.roomTotal]) : 0
  const cleaningFee = colIndices.cleaningFee !== -1 ? parseAmount(row[colIndices.cleaningFee]) : 0
  const hostServiceFee = colIndices.hostServiceFee !== -1 ? parseAmount(row[colIndices.hostServiceFee]) : 0
  const hostEarnings = colIndices.hostEarnings !== -1 ? parseAmount(row[colIndices.hostEarnings]) : 0

  const statusStr = colIndices.status !== -1 ? row[colIndices.status]?.toLowerCase() || '' : ''
  let status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' = 'CONFIRMED'
  if (statusStr.includes('cancel')) {
    status = 'CANCELLED'
  } else if (statusStr.includes('complet') || statusStr.includes('past')) {
    status = 'COMPLETED'
  }

  const listingName = colIndices.listingName !== -1 ? row[colIndices.listingName]?.trim() || null : null

  return {
    confirmationCode,
    guestName: colIndices.guestName !== -1 ? row[colIndices.guestName]?.trim() || 'Huésped' : 'Huésped',
    travelers: { adults: 1, children: 0, babies: 0 },
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

function parseBookingRowFromArray(row: string[], colIndices: any): {
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
  const confirmationCode = colIndices.confirmationCode !== -1 ? row[colIndices.confirmationCode]?.trim() : ''
  if (!confirmationCode) {
    return null
  }

  const checkInStr = colIndices.checkIn !== -1 ? row[colIndices.checkIn]?.trim() : ''
  const checkOutStr = colIndices.checkOut !== -1 ? row[colIndices.checkOut]?.trim() : ''

  if (!checkInStr || !checkOutStr) {
    return null
  }

  const checkIn = parseDate(checkInStr)
  const checkOut = parseDate(checkOutStr)

  if (!checkIn || !checkOut) {
    return null
  }

  const nightsStr = colIndices.nights !== -1 ? row[colIndices.nights]?.trim() : ''
  const nights = nightsStr
    ? parseInt(nightsStr, 10)
    : Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

  const roomTotal = colIndices.roomTotal !== -1 ? parseAmount(row[colIndices.roomTotal]) : 0
  const commission = colIndices.commission !== -1 ? parseAmount(row[colIndices.commission]) : 0
  const hostEarnings = roomTotal - commission

  const statusStr = colIndices.status !== -1 ? row[colIndices.status]?.toLowerCase() || '' : ''
  let status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' = 'CONFIRMED'
  if (statusStr.includes('cancel') || statusStr === 'cancelled_by_guest' || statusStr === 'no_show') {
    status = 'CANCELLED'
  } else if (statusStr === 'ok' && checkOut < new Date()) {
    status = 'COMPLETED'
  }

  const listingName = colIndices.listingName !== -1 ? row[colIndices.listingName]?.trim() || null : null

  return {
    confirmationCode,
    guestName: colIndices.guestName !== -1 ? row[colIndices.guestName]?.trim() || 'Huésped' : 'Huésped',
    travelers: { adults: 1, children: 0, babies: 0 },
    checkIn,
    checkOut,
    nights,
    roomTotal,
    cleaningFee: 0, // Booking doesn't separate cleaning fee
    hostServiceFee: commission,
    hostEarnings,
    status,
    listingName
  }
}

function parseDate(str: string): Date | null {
  if (!str) return null
  const clean = str.trim()

  // ISO: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    const [y, m, d] = clean.split('-').map(Number)
    return new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  }

  // XX/XX/YYYY or XX-XX-YYYY
  const match = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (match) {
    const [, first, second, year] = match
    const num1 = parseInt(first)
    const num2 = parseInt(second)
    const y = parseInt(year)

    if (num2 > 12) {
      return new Date(Date.UTC(y, num1 - 1, num2, 12, 0, 0))
    }
    if (num1 > 12) {
      return new Date(Date.UTC(y, num2 - 1, num1, 12, 0, 0))
    }
    // Airbnb uses MM/DD/YYYY
    return new Date(Date.UTC(y, num1 - 1, num2, 12, 0, 0))
  }

  const date = new Date(clean)
  return isNaN(date.getTime()) ? null : date
}

function parseAmount(str: string): number {
  if (!str) return 0
  let cleaned = str.replace(/[€$£\s]/g, '').replace(/EUR|USD|GBP|CHF/gi, '').trim()

  if (cleaned.includes(',') && cleaned.includes('.')) {
    const lastComma = cleaned.lastIndexOf(',')
    const lastDot = cleaned.lastIndexOf('.')
    if (lastComma > lastDot) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.')
    } else {
      cleaned = cleaned.replace(/,/g, '')
    }
  } else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.')
  }

  return parseFloat(cleaned) || 0
}

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

  const accommodationEarnings = hostEarnings - cleaningFee

  let managerCommission = 0
  if (config.commissionType === 'PERCENTAGE') {
    managerCommission = accommodationEarnings * (commissionValue / 100)
  } else if (config.commissionType === 'FIXED_PER_RESERVATION') {
    managerCommission = commissionValue
  }

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

  const managerAmount = managerCommission + managerCleaningAmount
  const ownerAmount = hostEarnings - managerAmount
  const cleaningAmount = managerCleaningAmount

  return {
    ownerAmount: Math.round(ownerAmount * 100) / 100,
    managerAmount: Math.round(managerAmount * 100) / 100,
    cleaningAmount: Math.round(cleaningAmount * 100) / 100
  }
}
