import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { gestionImportRateLimiter, getRateLimitKey } from '@/lib/rate-limit'

// Batch size for chunked processing
const BATCH_SIZE = 100

/**
 * Multi-platform CSV Import
 *
 * Supports:
 * - Airbnb (Spanish/English)
 * - Booking.com (Spanish)
 *
 * Auto-detects platform based on column headers.
 */

type Platform = 'AIRBNB' | 'BOOKING' | 'OTHER'

// Column name mappings for Airbnb (multiple export formats)
const AIRBNB_COLUMNS = {
  confirmationCode: ['código de confirmación', 'confirmation code', 'codigo confirmacion', 'conf code', 'código', 'code'],
  listingName: ['anuncio', 'listing', 'alojamiento', 'property'],
  // IMPORTANT: 'fecha de inicio' must come BEFORE 'llegada' to avoid matching 'Fecha de llegada estimada'
  checkIn: ['fecha de inicio', 'entrada', 'start date', 'check-in', 'checkin', 'fecha entrada'],
  checkOut: ['fecha de finalización', 'salida', 'end date', 'check-out', 'checkout', 'fecha salida', 'departure'],
  nights: ['noches', 'nights', '# nights', 'numero noches'],
  guestName: ['nombre del viajero', 'guest name', 'guest', 'huésped', 'huesped', 'viajero'],
  guestContact: ['contacto', 'contact', 'email', 'correo'],
  grossEarnings: ['bruto', 'gross earnings', 'gross', 'total bruto'],
  cleaningFee: ['tarifa de limpieza del anfitrión', 'host cleaning fee', 'cleaning fee', 'limpieza', 'gastos de limpieza'],
  hostServiceFee: ['comisión del servicio del anfitrión', 'host service fee', 'service fee'],
  hostEarnings: ['tus ganancias', 'your earnings', 'total', 'earnings', 'ganancias', 'neto', 'importe']
}

// Column name mappings for Booking.com
const BOOKING_COLUMNS = {
  confirmationCode: ['número de reserva', 'reservation number', 'booking number'],
  guestName: ['nombre del cliente', 'guest name', 'customer name'],
  checkIn: ['entrada', 'check-in', 'arrival'],
  checkOut: ['salida', 'check-out', 'departure'],
  nights: ['duración (noches)', 'duration', 'nights'],
  status: ['estado', 'status'],
  price: ['precio', 'price', 'total'],
  commissionPercent: ['comisión %', 'commission %'],
  commissionAmount: ['importe de la comisión', 'commission amount'],
  propertyName: ['tipo de unidad', 'unit type', 'room type', 'accommodation'],
  bookerCountry: ['booker country', 'country'],
  comments: ['comentarios', 'comments', 'notes']
}

// Detect platform from headers
function detectPlatform(headers: string[]): Platform {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim())
  const headersStr = normalizedHeaders.join(' ')

  // Booking.com specific columns
  if (normalizedHeaders.some(h => h.includes('número de reserva') || h.includes('tipo de unidad') || h.includes('importe de la comisión'))) {
    return 'BOOKING'
  }

  // Airbnb specific columns - check for multiple indicators
  const airbnbIndicators = [
    'código de confirmación',
    'confirmation code',
    'nombre del viajero',
    'viajero',
    'fecha de inicio',
    'fecha de finalización',
    'gastos de limpieza',
    'fecha de llegada estimada',
    'fecha de la reserva',
    'ganancias netas',
    'comisión servicio anfitrión'
  ]

  const airbnbScore = airbnbIndicators.filter(ind => headersStr.includes(ind)).length
  if (airbnbScore >= 2) {
    return 'AIRBNB'
  }

  return 'OTHER'
}

// For backwards compatibility
const COLUMN_MAPS = AIRBNB_COLUMNS

function normalizeColumnName(name: string): string {
  // Remove BOM and other special characters
  return name
    .replace(/^\uFEFF/, '') // Remove BOM
    .toLowerCase()
    .trim()
    .replace(/[""]/g, '')
    .replace(/\s+/g, ' ')
}

function findColumnIndex(headers: string[], columnNames: string[]): number {
  const normalizedHeaders = headers.map(normalizeColumnName)
  for (const name of columnNames) {
    const index = normalizedHeaders.findIndex(h => h.includes(name))
    if (index !== -1) return index
  }
  return -1
}

function parseAmount(value: string): number {
  if (!value) return 0
  // Remove currency symbols, spaces, and handle both comma and dot as decimal separator
  const cleaned = value.replace(/[€$£\s]/g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

function parseDate(value: string): Date | null {
  if (!value) return null

  const cleanValue = value.trim()

  // ISO format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(cleanValue)) {
    const [y, m, d] = cleanValue.split('-').map(Number)
    return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)) // Noon UTC to avoid timezone issues
  }

  // Slash or dash separated: could be DD/MM/YYYY or MM/DD/YYYY
  const match = cleanValue.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (match) {
    const [, first, second, year] = match
    const num1 = parseInt(first)
    const num2 = parseInt(second)
    const y = parseInt(year)

    // If second number > 12, it MUST be the day (so first is month = MM/DD/YYYY)
    if (num2 > 12) {
      return new Date(Date.UTC(y, num1 - 1, num2, 12, 0, 0))
    }
    // If first number > 12, it MUST be the day (so format is DD/MM/YYYY)
    if (num1 > 12) {
      return new Date(Date.UTC(y, num2 - 1, num1, 12, 0, 0))
    }
    // Both <= 12: AIRBNB uses MM/DD/YYYY format
    return new Date(Date.UTC(y, num1 - 1, num2, 12, 0, 0))
  }

  // Fallback to Date.parse
  const date = new Date(cleanValue)
  return isNaN(date.getTime()) ? null : date
}

function parseCSV(content: string): string[][] {
  const lines: string[][] = []
  let currentLine: string[] = []
  let currentField = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i++) {
    const char = content[i]
    const nextChar = content[i + 1]

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        currentField += '"'
        i++
      } else if (char === '"') {
        // End of quoted field
        inQuotes = false
      } else {
        currentField += char
      }
    } else {
      if (char === '"') {
        // Start of quoted field
        inQuotes = true
      } else if (char === ',' || char === ';') {
        // Field separator
        currentLine.push(currentField.trim())
        currentField = ''
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        // Line break
        if (char === '\r') i++ // Skip the \n
        currentLine.push(currentField.trim())
        if (currentLine.some(f => f)) { // Only add non-empty lines
          lines.push(currentLine)
        }
        currentLine = []
        currentField = ''
      } else {
        currentField += char
      }
    }
  }

  // Don't forget the last field
  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField.trim())
    if (currentLine.some(f => f)) {
      lines.push(currentLine)
    }
  }

  return lines
}

/**
 * POST /api/gestion/reservations/import-csv
 * Import reservations from Airbnb CSV
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Rate limiting: max 5 imports per hour
    const rateLimitKey = getRateLimitKey(request, userId, 'gestion-import')
    const rateLimitResult = gestionImportRateLimiter(rateLimitKey)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Demasiadas importaciones. Espera antes de intentar de nuevo.',
          resetIn: Math.ceil(rateLimitResult.resetIn / 1000 / 60) // minutes
        },
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const propertyIdOverride = formData.get('propertyId') as string | null
    const skipDuplicates = formData.get('skipDuplicates') !== 'false'

    if (!file) {
      return NextResponse.json(
        { error: 'No se ha proporcionado ningún archivo' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB to prevent memory issues)
    const MAX_FILE_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Máximo permitido: 5MB' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain']
    const fileName = file.name?.toLowerCase() || ''
    if (!validTypes.includes(file.type) && !fileName.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Tipo de archivo no válido. Solo se permiten archivos CSV' },
        { status: 400 }
      )
    }

    // Read file content
    const content = await file.text()
    const rows = parseCSV(content)

    if (rows.length < 2) {
      return NextResponse.json(
        { error: 'El archivo CSV está vacío o no tiene datos' },
        { status: 400 }
      )
    }

    // Limit maximum rows to prevent server overload
    const MAX_ROWS = 5000
    if (rows.length > MAX_ROWS + 1) { // +1 for header
      return NextResponse.json(
        { error: `El archivo tiene demasiadas filas (${rows.length - 1}). Máximo permitido: ${MAX_ROWS} filas. Divide el archivo en partes más pequeñas.` },
        { status: 400 }
      )
    }

    // Get headers and data
    const headers = rows[0]
    const dataRows = rows.slice(1)

    // Detect platform from headers
    const detectedPlatform = detectPlatform(headers)
    console.log('Detected platform:', detectedPlatform, 'Headers:', headers.slice(0, 5))

    // Find column indices based on platform
    let colIndices: Record<string, number>

    if (detectedPlatform === 'BOOKING') {
      colIndices = {
        confirmationCode: findColumnIndex(headers, BOOKING_COLUMNS.confirmationCode),
        propertyName: findColumnIndex(headers, BOOKING_COLUMNS.propertyName),
        checkIn: findColumnIndex(headers, BOOKING_COLUMNS.checkIn),
        checkOut: findColumnIndex(headers, BOOKING_COLUMNS.checkOut),
        nights: findColumnIndex(headers, BOOKING_COLUMNS.nights),
        guestName: findColumnIndex(headers, BOOKING_COLUMNS.guestName),
        status: findColumnIndex(headers, BOOKING_COLUMNS.status),
        price: findColumnIndex(headers, BOOKING_COLUMNS.price),
        commissionPercent: findColumnIndex(headers, BOOKING_COLUMNS.commissionPercent),
        commissionAmount: findColumnIndex(headers, BOOKING_COLUMNS.commissionAmount),
        comments: findColumnIndex(headers, BOOKING_COLUMNS.comments)
      }
    } else {
      // Airbnb or Other - use Airbnb columns
      colIndices = {
        confirmationCode: findColumnIndex(headers, AIRBNB_COLUMNS.confirmationCode),
        listingName: findColumnIndex(headers, AIRBNB_COLUMNS.listingName),
        checkIn: findColumnIndex(headers, AIRBNB_COLUMNS.checkIn),
        checkOut: findColumnIndex(headers, AIRBNB_COLUMNS.checkOut),
        nights: findColumnIndex(headers, AIRBNB_COLUMNS.nights),
        guestName: findColumnIndex(headers, AIRBNB_COLUMNS.guestName),
        guestContact: findColumnIndex(headers, AIRBNB_COLUMNS.guestContact),
        grossEarnings: findColumnIndex(headers, AIRBNB_COLUMNS.grossEarnings),
        cleaningFee: findColumnIndex(headers, AIRBNB_COLUMNS.cleaningFee),
        hostServiceFee: findColumnIndex(headers, AIRBNB_COLUMNS.hostServiceFee),
        hostEarnings: findColumnIndex(headers, AIRBNB_COLUMNS.hostEarnings)
      }
    }

    // Validate required columns (confirmation code is optional - we'll generate if missing)
    if (colIndices.checkIn === -1 || colIndices.checkOut === -1) {
      return NextResponse.json(
        { error: 'No se encontraron las columnas de fechas', headers, detectedPlatform },
        { status: 400 }
      )
    }

    // Get user's properties with billing configs
    const userProperties = await prisma.property.findMany({
      where: { hostId: userId },
      select: {
        id: true,
        name: true,
        billingConfig: {
          select: {
            id: true,
            commissionValue: true,
            cleaningValue: true
          }
        }
      }
    })

    console.log('User properties:', userProperties.map(p => ({ id: p.id, name: p.name, hasBillingConfig: !!p.billingConfig })))
    console.log('Property ID override:', propertyIdOverride)

    // Get existing confirmation codes to skip duplicates
    // If propertyIdOverride is set, only check codes for that property
    let existingCodesQuery: any = { userId }
    if (propertyIdOverride) {
      const targetBillingConfig = await prisma.propertyBillingConfig.findFirst({
        where: { propertyId: propertyIdOverride }
      })
      if (targetBillingConfig) {
        existingCodesQuery.billingConfigId = targetBillingConfig.id
      }
    }

    const existingCodes = skipDuplicates
      ? new Set(
          (await prisma.reservation.findMany({
            where: existingCodesQuery,
            select: { confirmationCode: true }
          })).map(r => r.confirmationCode)
        )
      : new Set()

    console.log('Existing confirmation codes count:', existingCodes.size)
    console.log('Skip duplicates:', skipDuplicates)

    // Generate batch ID for this import (for rollback capability)
    const importBatchId = `IMP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Parse and process rows
    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as { row: number; reason: string; data?: any }[],
      importBatchId,
      listingsFound: new Set<string>()
    }

    // Find "Tipo" column for Airbnb to filter only reservation rows
    const tipoColIndex = headers.findIndex(h =>
      h.toLowerCase().includes('tipo') || h.toLowerCase() === 'type'
    )

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      const rowNum = i + 2 // Account for header and 0-index

      try {
        // For Airbnb: only import "Reserva" type rows, skip Payout/Resolution/Credit
        if (detectedPlatform === 'AIRBNB' && tipoColIndex !== -1) {
          const rowType = row[tipoColIndex]?.trim().toLowerCase() || ''
          if (rowType && !rowType.includes('reserva') && !rowType.includes('reservation')) {
            results.skipped++
            continue
          }
        }

        // For Booking: skip cancelled/no-show reservations
        if (detectedPlatform === 'BOOKING' && colIndices.status !== -1) {
          const status = row[colIndices.status]?.trim().toLowerCase()
          if (status !== 'ok') {
            results.skipped++
            continue
          }
        }

        // Parse dates first (to skip empty rows)
        const checkInRaw = row[colIndices.checkIn]?.trim()
        const checkOutRaw = row[colIndices.checkOut]?.trim()

        // Skip rows without check-in/check-out (placeholder rows in Airbnb exports)
        if (!checkInRaw || !checkOutRaw) {
          results.skipped++
          continue
        }

        const checkIn = parseDate(checkInRaw)
        const checkOut = parseDate(checkOutRaw)

        // Skip rows with unparseable dates
        if (!checkIn || !checkOut) {
          results.errors.push({
            row: rowNum,
            reason: 'Fechas inválidas',
            data: { checkIn: checkInRaw, checkOut: checkOutRaw }
          })
          continue
        }

        // Get guest name first (needed for generating confirmation code)
        const guestName = colIndices.guestName !== -1
          ? row[colIndices.guestName]?.trim() || 'Huésped'
          : 'Huésped'

        // Get confirmation code or generate one
        let confirmationCode = colIndices.confirmationCode !== -1
          ? row[colIndices.confirmationCode]?.trim()
          : null

        if (!confirmationCode) {
          // Generate a unique code from guest name + dates
          const dateStr = `${checkIn.toISOString().slice(0,10)}-${checkOut.toISOString().slice(0,10)}`
          const guestSlug = guestName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase()
          confirmationCode = `GEN-${guestSlug}-${dateStr}`
        }

        // Skip duplicates
        if (skipDuplicates && existingCodes.has(confirmationCode)) {
          console.log(`Row ${rowNum}: Skipping duplicate ${confirmationCode}`)
          results.skipped++
          continue
        }

        console.log(`Row ${rowNum}: Processing ${confirmationCode} for guest ${guestName}`)

        // Calculate nights
        const nights = colIndices.nights !== -1
          ? parseInt(row[colIndices.nights]) || Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
          : Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

        // Guest contact info
        const guestContact = colIndices.guestContact !== undefined && colIndices.guestContact !== -1
          ? row[colIndices.guestContact]?.trim()
          : undefined
        const guestEmail = guestContact?.includes('@') ? guestContact : undefined

        // Match property - user should specify propertyIdOverride
        let billingConfigId: string | undefined = undefined
        let matchedProperty: typeof userProperties[0] | null = null

        if (propertyIdOverride) {
          matchedProperty = userProperties.find(p => p.id === propertyIdOverride) || null
          if (!matchedProperty) {
            console.log(`Row ${rowNum}: Property override ${propertyIdOverride} not found in userProperties`)
          } else {
            console.log(`Row ${rowNum}: Using override property ${matchedProperty.name}, billingConfig: ${matchedProperty.billingConfig?.id}`)
          }
        } else {
          // Fallback: try to match by name from CSV
          const propertyNameCol = detectedPlatform === 'BOOKING'
            ? colIndices.propertyName
            : colIndices.listingName

          if (propertyNameCol !== undefined && propertyNameCol !== -1) {
            const listingName = row[propertyNameCol]?.trim().toLowerCase()
            if (listingName) {
              matchedProperty = userProperties.find(p =>
                p.name.toLowerCase().includes(listingName) ||
                listingName.includes(p.name.toLowerCase())
              ) || null
            }
          }
        }

        // Parse amounts - different for each platform
        let grossEarnings = 0
        let hostEarnings = 0
        let cleaningFee = 0
        let platformServiceFee = 0

        if (detectedPlatform === 'BOOKING') {
          // Booking: Price is gross, commission is what Booking takes
          grossEarnings = colIndices.price !== -1 ? parseAmount(row[colIndices.price]) : 0
          const bookingCommission = colIndices.commissionAmount !== -1
            ? parseAmount(row[colIndices.commissionAmount])
            : 0
          hostEarnings = grossEarnings - bookingCommission
          platformServiceFee = bookingCommission

          // Cleaning comes from property config (Booking doesn't separate it)
          if (matchedProperty?.billingConfig) {
            cleaningFee = Number(matchedProperty.billingConfig.cleaningValue) || 0
          }
        } else {
          // Airbnb: has separate columns
          hostEarnings = colIndices.hostEarnings !== -1
            ? parseAmount(row[colIndices.hostEarnings])
            : 0
          grossEarnings = colIndices.grossEarnings !== -1
            ? parseAmount(row[colIndices.grossEarnings])
            : hostEarnings
          // Always use property config cleaning value (not CSV) for consistency
          cleaningFee = matchedProperty?.billingConfig
            ? Number(matchedProperty.billingConfig.cleaningValue) || 0
            : 0
          platformServiceFee = colIndices.hostServiceFee !== -1
            ? parseAmount(row[colIndices.hostServiceFee])
            : 0
        }

        // Get billing config - MUST exist, we don't auto-create
        if (matchedProperty) {
          if (matchedProperty.billingConfig) {
            billingConfigId = matchedProperty.billingConfig.id
          } else {
            // Check if it was created in a previous iteration (not in our cached list)
            const existingConfig = await prisma.propertyBillingConfig.findUnique({
              where: { propertyId: matchedProperty.id }
            })
            if (existingConfig) {
              billingConfigId = existingConfig.id
              // Update our cached reference
              matchedProperty = {
                ...matchedProperty,
                billingConfig: {
                  id: existingConfig.id,
                  commissionValue: existingConfig.commissionValue,
                  cleaningValue: existingConfig.cleaningValue
                }
              }
              // Also update in userProperties array for future iterations
              const idx = userProperties.findIndex(p => p.id === matchedProperty!.id)
              if (idx !== -1) {
                userProperties[idx] = matchedProperty
              }
            }
          }
        }

        // Skip if no billingConfigId (required field)
        if (!billingConfigId) {
          console.log(`Row ${rowNum}: No billingConfigId. matchedProperty: ${matchedProperty?.name || 'null'}, billingConfig: ${matchedProperty?.billingConfig?.id || 'null'}`)
          results.errors.push({
            row: rowNum,
            reason: `No se encontró propiedad asociada para "${detectedPlatform === 'BOOKING' ? row[colIndices.propertyName] : row[colIndices.listingName]}"`,
            data: { propertyName: detectedPlatform === 'BOOKING' ? row[colIndices.propertyName] : row[colIndices.listingName] }
          })
          continue
        }

        // Calculate owner/manager amounts
        let ownerAmount = hostEarnings
        let managerAmount = 0

        if (matchedProperty?.billingConfig) {
          const commissionPct = Number(matchedProperty.billingConfig.commissionValue) / 100
          // Manager commission is on earnings minus cleaning (cleaning goes separate)
          managerAmount = (hostEarnings - cleaningFee) * commissionPct
          ownerAmount = hostEarnings - managerAmount
        }

        // Find or create guest
        let guestId: string | undefined = undefined
        if (guestEmail) {
          const existingGuest = await prisma.guest.findFirst({
            where: { userId, email: guestEmail }
          })
          if (existingGuest) {
            guestId = existingGuest.id
          } else {
            const newGuest = await prisma.guest.create({
              data: {
                userId,
                name: guestName,
                email: guestEmail
              }
            })
            guestId = newGuest.id
          }
        } else if (guestName !== 'Huésped') {
          const existingGuest = await prisma.guest.findFirst({
            where: {
              userId,
              name: { equals: guestName, mode: 'insensitive' },
              email: null
            }
          })
          if (existingGuest) {
            guestId = existingGuest.id
          } else {
            const newGuest = await prisma.guest.create({
              data: {
                userId,
                name: guestName
              }
            })
            guestId = newGuest.id
          }
        }

        // Get original listing name for traceability
        const propertyNameCol = detectedPlatform === 'BOOKING'
          ? colIndices.propertyName
          : colIndices.listingName
        const sourceListingName = propertyNameCol !== undefined && propertyNameCol !== -1
          ? row[propertyNameCol]?.trim() || null
          : null

        // Track listing names found
        if (sourceListingName) {
          results.listingsFound.add(sourceListingName)
        }

        // Create reservation
        await prisma.reservation.create({
          data: {
            userId,
            billingConfigId,
            guestId,
            platform: detectedPlatform === 'BOOKING' ? 'BOOKING' : 'AIRBNB',
            confirmationCode,
            guestName,
            guestEmail,
            checkIn,
            checkOut,
            nights,
            hostEarnings,
            roomTotal: grossEarnings,
            cleaningFee,
            hostServiceFee: platformServiceFee,
            guestServiceFee: 0,
            status: 'CONFIRMED',
            importSource: 'CSV',
            importBatchId,
            sourceListingName,
            ownerAmount,
            managerAmount,
            cleaningAmount: cleaningFee
          }
        })

        existingCodes.add(confirmationCode)
        results.imported++

      } catch (error: any) {
        console.error(`Row ${rowNum} INSERT error:`, error)
        results.errors.push({
          row: rowNum,
          reason: error.message || 'Error desconocido',
          data: row
        })
      }
    }

    // Update guest statistics for all affected guests
    if (results.imported > 0) {
      // This is a batch operation, so we do it in the background
      // In production, you might want to use a queue
    }

    console.log('Import complete:', {
      total: dataRows.length,
      imported: results.imported,
      skipped: results.skipped,
      errors: results.errors.length,
      importBatchId: results.importBatchId,
      listingsFound: Array.from(results.listingsFound)
    })

    // Log the import for history and rollback capability
    await prisma.reservationImport.create({
      data: {
        userId,
        fileName: file.name,
        source: detectedPlatform,
        totalRows: dataRows.length,
        importedCount: results.imported,
        skippedCount: results.skipped,
        errorCount: results.errors.length,
        errors: results.errors.length > 0 ? results.errors : undefined,
        propertyId: propertyIdOverride || null,
        importBatchId: results.importBatchId,
        listingsFound: Array.from(results.listingsFound)
      }
    })

    return NextResponse.json({
      success: true,
      platform: detectedPlatform,
      results: {
        imported: results.imported,
        skipped: results.skipped,
        errors: results.errors,
        importBatchId: results.importBatchId,
        listingsFound: Array.from(results.listingsFound)
      },
      summary: {
        total: dataRows.length,
        imported: results.imported,
        skipped: results.skipped,
        errors: results.errors.length
      }
    })

  } catch (error: any) {
    console.error('Error importing CSV:', error)
    return NextResponse.json(
      { error: 'Error al procesar el archivo CSV' },
      { status: 500 }
    )
  }
}
