import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import * as XLSX from 'xlsx'

/**
 * POST /api/gestion/reservations/import-booking
 * Import reservations from Booking.com CSV/XLS file
 *
 * Expected Booking CSV columns:
 * - Número de reserva
 * - Reservado por / Nombre del cliente
 * - Entrada (check-in)
 * - Salida (check-out)
 * - Estado (ok, cancelled_by_guest, no_show)
 * - Precio (con moneda, ej: "295.1 EUR")
 * - Comisión %
 * - Importe de la comisión
 * - Tipo de unidad (habitación/suite)
 * - Duración (noches)
 * - Adultos, Niños
 * - País del huésped
 * - Comentarios
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
    const propertyId = formData.get('propertyId') as string | null
    const skipDuplicates = formData.get('skipDuplicates') !== 'false'

    if (!file) {
      return NextResponse.json(
        { error: 'Archivo requerido' },
        { status: 400 }
      )
    }

    // Get all user properties with billing config for matching
    const userProperties = await prisma.property.findMany({
      where: { hostId: userId },
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

    if (userProperties.length === 0) {
      return NextResponse.json(
        { error: 'No tienes propiedades configuradas' },
        { status: 400 }
      )
    }

    // If propertyId specified, verify it exists
    let defaultProperty = propertyId
      ? userProperties.find(p => p.id === propertyId)
      : userProperties.length === 1 ? userProperties[0] : null

    // Read and parse file (CSV or XLS)
    const rows = await parseFile(file)

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'El archivo está vacío o no tiene el formato correcto' },
        { status: 400 }
      )
    }

    const results = {
      totalRows: rows.length,
      importedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: [] as Array<{ row: number; error: string; data?: any }>,
      unmatchedUnits: [] as string[]
    }

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2 // +2 for header row and 1-based index

      try {
        const parsed = parseBookingRow(row)

        if (!parsed) {
          results.errors.push({ row: rowNum, error: 'No se pudo parsear la fila', data: row })
          results.errorCount++
          continue
        }

        // Skip cancelled reservations without earnings
        if (parsed.status === 'CANCELLED' && parsed.hostEarnings <= 0) {
          results.skippedCount++
          continue
        }

        // Find matching property by unit name
        let matchedProperty = defaultProperty

        if (parsed.unit) {
          // Try to match unit name with property name
          const unitLower = parsed.unit.toLowerCase().trim()
          const matched = userProperties.find(p => {
            const nameLower = p.name.toLowerCase().trim()
            return nameLower.includes(unitLower) || unitLower.includes(nameLower)
          })

          if (matched) {
            matchedProperty = matched
          } else if (!defaultProperty) {
            // Track unmatched units
            if (!results.unmatchedUnits.includes(parsed.unit)) {
              results.unmatchedUnits.push(parsed.unit)
            }
          }
        }

        // If still no property, skip or error
        if (!matchedProperty) {
          results.errors.push({
            row: rowNum,
            error: `No se encontró propiedad para "${parsed.unit || 'sin unidad'}". Selecciona una propiedad por defecto.`,
            data: row
          })
          results.errorCount++
          continue
        }

        if (!matchedProperty.billingConfig) {
          results.errors.push({
            row: rowNum,
            error: `La propiedad "${matchedProperty.name}" no tiene configuración de facturación`,
            data: row
          })
          results.errorCount++
          continue
        }

        // Check for duplicate (only within the same property)
        if (skipDuplicates) {
          const existing = await prisma.reservation.findFirst({
            where: {
              platform: 'BOOKING',
              confirmationCode: parsed.confirmationCode,
              billingConfigId: matchedProperty.billingConfig.id
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
          0, // Booking doesn't separate cleaning fee
          matchedProperty.billingConfig
        )

        // Create reservation
        await prisma.reservation.create({
          data: {
            userId,
            billingConfigId: matchedProperty.billingConfig.id,
            platform: 'BOOKING',
            confirmationCode: parsed.confirmationCode,
            guestName: parsed.guestName,
            guestCountry: parsed.guestCountry,
            travelers: parsed.travelers,
            checkIn: parsed.checkIn,
            checkOut: parsed.checkOut,
            nights: parsed.nights,
            roomTotal: parsed.roomTotal,
            cleaningFee: 0,
            hostServiceFee: parsed.bookingCommission,
            hostEarnings: parsed.hostEarnings,
            currency: parsed.currency,
            status: parsed.status,
            type: 'BOOKING',
            importSource: 'CSV',
            unit: parsed.unit,
            guestMessage: parsed.comments,
            // Financial split
            ownerAmount: financials.ownerAmount,
            managerAmount: financials.managerAmount,
            cleaningAmount: 0
          }
        })

        results.importedCount++
      } catch (error) {
        console.error(`Row ${rowNum} error:`, error)
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
        source: 'BOOKING',
        totalRows: results.totalRows,
        importedCount: results.importedCount,
        skippedCount: results.skippedCount,
        errorCount: results.errorCount,
        errors: results.errors.length > 0 ? results.errors : undefined,
        propertyId: propertyId || null
      }
    })

    return NextResponse.json({
      success: true,
      results
    })
  } catch (error) {
    console.error('Error importing Booking reservations:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * Parse file (CSV or XLS/XLSX) into array of objects
 */
async function parseFile(file: File): Promise<Record<string, string>[]> {
  const fileName = file.name.toLowerCase()

  // XLS/XLSX file
  if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]

    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
      raw: false, // Get formatted strings
      defval: ''  // Default value for empty cells
    })

    // Convert all values to strings
    return jsonData.map(row => {
      const stringRow: Record<string, string> = {}
      for (const [key, value] of Object.entries(row)) {
        stringRow[key] = String(value ?? '')
      }
      return stringRow
    })
  }

  // CSV file
  const text = await file.text()
  return parseCSV(text)
}

/**
 * Parse CSV text into array of objects
 */
function parseCSV(text: string): Record<string, string>[] {
  // Remove BOM if present
  const cleanText = text.replace(/^\uFEFF/, '')
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0)

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
 * Parse a Booking CSV row into reservation data
 */
function parseBookingRow(row: Record<string, string>): {
  confirmationCode: string
  guestName: string
  guestCountry: string | null
  travelers: { adults: number; children: number; babies: number }
  checkIn: Date
  checkOut: Date
  nights: number
  roomTotal: number
  bookingCommission: number
  hostEarnings: number
  currency: string
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  unit: string | null
  comments: string | null
} | null {
  // Confirmation code
  const confirmationCode = findValue(row, [
    'Número de reserva',
    'Reservation number',
    'Booking number',
    'Nº reserva'
  ])

  if (!confirmationCode) {
    return null
  }

  // Guest name
  const guestName = findValue(row, [
    'Nombre del cliente (o clientes)',
    'Nombre del cliente',
    'Guest name',
    'Reservado por',
    'Booked by'
  ]) || findValue(row, ['Reservado por', 'Booked by']) || 'Huésped'

  // Guest country
  const guestCountry = findValue(row, [
    'Booker country',
    'País',
    'Country'
  ])

  // Travelers
  const adults = parseInt(findValue(row, ['Adultos', 'Adults']) || '1', 10)
  const children = parseInt(findValue(row, ['Niños', 'Children']) || '0', 10)
  const personas = parseInt(findValue(row, ['Personas', 'Guests']) || '0', 10)

  // Dates - Booking uses YYYY-MM-DD format
  const checkInStr = findValue(row, [
    'Entrada',
    'Check-in',
    'Arrival',
    'Llegada'
  ])
  const checkOutStr = findValue(row, [
    'Salida',
    'Check-out',
    'Departure'
  ])

  if (!checkInStr || !checkOutStr) {
    return null
  }

  const checkIn = parseDate(checkInStr)
  const checkOut = parseDate(checkOutStr)

  if (!checkIn || !checkOut) {
    return null
  }

  // Nights
  const nightsStr = findValue(row, ['Duración (noches)', 'Nights', 'Noches', 'Duration'])
  const nights = nightsStr
    ? parseInt(nightsStr, 10)
    : Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

  // Amounts - Booking format: "295.1 EUR"
  const priceStr = findValue(row, ['Precio', 'Price', 'Total'])
  const { amount: roomTotal, currency } = parseAmountWithCurrency(priceStr || '0')

  const commissionStr = findValue(row, [
    'Importe de la comisión',
    'Commission amount',
    'Comisión'
  ])
  const bookingCommission = parseAmount(commissionStr || '0')

  // Host earnings = Price - Commission
  const hostEarnings = roomTotal - bookingCommission

  // Status
  const statusStr = findValue(row, ['Estado', 'Status']) || ''
  let status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' = 'CONFIRMED'

  if (statusStr.toLowerCase().includes('cancel') || statusStr === 'cancelled_by_guest') {
    status = 'CANCELLED'
  } else if (statusStr === 'no_show') {
    status = 'CANCELLED'
  } else if (statusStr === 'ok') {
    // Check if checkout is in the past
    if (checkOut < new Date()) {
      status = 'COMPLETED'
    } else {
      status = 'CONFIRMED'
    }
  }

  // Unit (room/suite type)
  const unit = findValue(row, [
    'Tipo de unidad',
    'Unit type',
    'Room type',
    'Habitación',
    'Room'
  ])

  // Comments
  const comments = findValue(row, [
    'Comentarios',
    'Comments',
    'Guest comments',
    'Notas'
  ])

  return {
    confirmationCode,
    guestName,
    guestCountry,
    travelers: {
      adults: adults || Math.max(1, personas),
      children,
      babies: 0
    },
    checkIn,
    checkOut,
    nights,
    roomTotal,
    bookingCommission,
    hostEarnings,
    currency,
    status,
    unit,
    comments
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
 */
function parseDate(str: string): Date | null {
  if (!str) return null

  // Try YYYY-MM-DD (Booking format)
  const yyyymmdd = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (yyyymmdd) {
    return new Date(parseInt(yyyymmdd[1]), parseInt(yyyymmdd[2]) - 1, parseInt(yyyymmdd[3]))
  }

  // Try DD/MM/YYYY
  const ddmmyyyy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (ddmmyyyy) {
    return new Date(parseInt(ddmmyyyy[3]), parseInt(ddmmyyyy[2]) - 1, parseInt(ddmmyyyy[1]))
  }

  // Try DD-MM-YYYY
  const ddmmyyyy2 = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
  if (ddmmyyyy2) {
    return new Date(parseInt(ddmmyyyy2[3]), parseInt(ddmmyyyy2[2]) - 1, parseInt(ddmmyyyy2[1]))
  }

  // Try native Date parsing
  const parsed = new Date(str)
  if (!isNaN(parsed.getTime())) {
    return parsed
  }

  return null
}

/**
 * Parse an amount string with currency (e.g., "295.1 EUR")
 */
function parseAmountWithCurrency(str: string): { amount: number; currency: string } {
  if (!str) return { amount: 0, currency: 'EUR' }

  // Extract currency
  const currencyMatch = str.match(/(EUR|USD|GBP|CHF)/i)
  const currency = currencyMatch ? currencyMatch[1].toUpperCase() : 'EUR'

  // Parse amount
  const amount = parseAmount(str)

  return { amount, currency }
}

/**
 * Parse an amount string (handles European format with comma as decimal)
 */
function parseAmount(str: string): number {
  if (!str) return 0

  // Remove currency symbols and spaces
  let cleaned = str.replace(/[€$£\s]/g, '').replace(/EUR|USD|GBP|CHF/gi, '').trim()

  // Handle European format (1.234,56 -> 1234.56)
  if (cleaned.includes(',') && cleaned.includes('.')) {
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

  // Base amount for commission calculation
  const accommodationEarnings = hostEarnings - cleaningFee

  // Calculate manager commission based on type
  let managerCommission = 0
  if (config.commissionType === 'PERCENTAGE') {
    managerCommission = accommodationEarnings * (commissionValue / 100)
  } else if (config.commissionType === 'FIXED_PER_RESERVATION') {
    managerCommission = commissionValue
  }

  // Final amounts
  const managerAmount = managerCommission
  const ownerAmount = hostEarnings - managerAmount

  return {
    ownerAmount: Math.round(ownerAmount * 100) / 100,
    managerAmount: Math.round(managerAmount * 100) / 100,
    cleaningAmount: 0
  }
}
