import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import * as XLSX from 'xlsx'

/**
 * POST /api/gestion/reservations/import-preview
 * Analiza un CSV/XLS y devuelve estadísticas ANTES de importar
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

    if (!file) {
      return NextResponse.json(
        { error: 'No se ha proporcionado ningún archivo' },
        { status: 400 }
      )
    }

    // Leer contenido del archivo (CSV o XLS)
    const fileName = file.name.toLowerCase()
    let rows: string[][]

    if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
      // Archivo Excel
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]

      // Convertir a array de arrays (incluye header)
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
        raw: false,
        defval: '',
        header: 1 // Retorna array de arrays en lugar de objetos
      }) as string[][]

      rows = jsonData.filter(row => row.some(cell => cell && String(cell).trim()))
    } else {
      // Archivo CSV
      const content = await file.text()
      rows = parseCSV(content)
    }

    if (rows.length < 2) {
      return NextResponse.json(
        { error: 'El archivo está vacío o no tiene datos' },
        { status: 400 }
      )
    }

    const headers = rows[0]
    const dataRows = rows.slice(1)

    // Detectar plataforma
    const platform = detectPlatform(headers)

    // Encontrar índices de columnas
    const colIndices = getColumnIndices(headers, platform)

    // Obtener códigos de confirmación existentes del usuario
    const existingReservations = await prisma.reservation.findMany({
      where: { userId },
      select: {
        confirmationCode: true,
        platform: true,
        billingConfigId: true,
        billingConfig: {
          select: {
            property: {
              select: { name: true }
            }
          }
        }
      }
    })

    // Crear mapa de códigos existentes por plataforma
    const existingByPlatform = new Map<string, { propertyName: string }>()
    for (const r of existingReservations) {
      const key = `${r.platform}:${r.confirmationCode}`
      existingByPlatform.set(key, {
        propertyName: r.billingConfig?.property?.name || 'Desconocida'
      })
    }

    // Analizar filas del CSV
    const analysis = {
      totalRows: dataRows.length,
      validRows: 0,
      newReservations: 0,
      duplicates: 0,
      invalidRows: 0,
      listingsFound: new Map<string, number>(),
      dateRange: { min: null as Date | null, max: null as Date | null },
      duplicateDetails: [] as { code: string; guestName: string; existsIn: string }[],
      newDetails: [] as { code: string; guestName: string; checkIn: string; amount: number; listing: string }[],
      invalidDetails: [] as { row: number; reason: string }[]
    }

    const detectedPlatform = platform === 'BOOKING' ? 'BOOKING' : 'AIRBNB'

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      const rowNum = i + 2 // +1 for header, +1 for 1-based

      // Extraer datos
      const checkInStr = colIndices.checkIn !== -1 ? row[colIndices.checkIn]?.trim() : ''
      const checkOutStr = colIndices.checkOut !== -1 ? row[colIndices.checkOut]?.trim() : ''
      const guestName = colIndices.guestName !== -1 ? row[colIndices.guestName]?.trim() : ''
      const confirmationCode = colIndices.confirmationCode !== -1 ? row[colIndices.confirmationCode]?.trim() : ''
      const listingName = colIndices.listingName !== -1 ? row[colIndices.listingName]?.trim() : ''
      const amountStr = colIndices.amount !== -1 ? row[colIndices.amount]?.trim() : ''

      // Validar fila - necesita fechas para ser válida
      if (!checkInStr || !checkOutStr) {
        // Podría ser una fila de payout o vacía, la ignoramos
        continue
      }

      const checkIn = parseDate(checkInStr)
      const checkOut = parseDate(checkOutStr)

      if (!checkIn || !checkOut) {
        analysis.invalidRows++
        analysis.invalidDetails.push({ row: rowNum, reason: 'Fechas inválidas' })
        continue
      }

      // Actualizar rango de fechas
      if (!analysis.dateRange.min || checkIn < analysis.dateRange.min) {
        analysis.dateRange.min = checkIn
      }
      if (!analysis.dateRange.max || checkOut > analysis.dateRange.max) {
        analysis.dateRange.max = checkOut
      }

      // Contar listing
      if (listingName) {
        analysis.listingsFound.set(listingName, (analysis.listingsFound.get(listingName) || 0) + 1)
      }

      analysis.validRows++

      // Verificar si es duplicado
      const amount = parseAmount(amountStr)
      const key = `${detectedPlatform}:${confirmationCode}`

      if (confirmationCode && existingByPlatform.has(key)) {
        analysis.duplicates++
        const existing = existingByPlatform.get(key)!
        analysis.duplicateDetails.push({
          code: confirmationCode,
          guestName: guestName || 'Sin nombre',
          existsIn: existing.propertyName
        })
      } else {
        analysis.newReservations++
        if (analysis.newDetails.length < 20) { // Solo guardar los primeros 20
          analysis.newDetails.push({
            code: confirmationCode || 'Se generará',
            guestName: guestName || 'Sin nombre',
            checkIn: checkInStr,
            amount,
            listing: listingName || '-'
          })
        }
      }
    }

    // Convertir Map a array para JSON
    const listingsArray = Array.from(analysis.listingsFound.entries()).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count)

    return NextResponse.json({
      success: true,
      platform: detectedPlatform,
      analysis: {
        totalRows: analysis.totalRows,
        validRows: analysis.validRows,
        newReservations: analysis.newReservations,
        duplicates: analysis.duplicates,
        invalidRows: analysis.invalidRows,
        listingsFound: listingsArray,
        dateRange: {
          min: analysis.dateRange.min?.toISOString().slice(0, 10) || null,
          max: analysis.dateRange.max?.toISOString().slice(0, 10) || null
        },
        duplicateDetails: analysis.duplicateDetails.slice(0, 10), // Solo los primeros 10
        newDetails: analysis.newDetails,
        invalidDetails: analysis.invalidDetails.slice(0, 5)
      }
    })

  } catch (error) {
    console.error('Error analyzing file:', error)
    return NextResponse.json(
      { error: 'Error al analizar el archivo' },
      { status: 500 }
    )
  }
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
        currentField += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        currentField += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',' || char === ';') {
        currentLine.push(currentField.trim())
        currentField = ''
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        if (char === '\r') i++
        currentLine.push(currentField.trim())
        if (currentLine.some(f => f)) {
          lines.push(currentLine)
        }
        currentLine = []
        currentField = ''
      } else {
        currentField += char
      }
    }
  }

  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField.trim())
    if (currentLine.some(f => f)) {
      lines.push(currentLine)
    }
  }

  return lines
}

function detectPlatform(headers: string[]): 'AIRBNB' | 'BOOKING' | 'UNKNOWN' {
  const headersLower = headers.map(h => h.toLowerCase().trim())
  const headersStr = headersLower.join(' ')

  // Booking indicators
  if (headersLower.some(h => h.includes('número de reserva') || h.includes('tipo de unidad'))) {
    return 'BOOKING'
  }

  // Airbnb indicators
  const airbnbIndicators = [
    'código de confirmación',
    'viajero',
    'fecha de inicio',
    'fecha de finalización',
    'gastos de limpieza',
    'fecha de llegada estimada'
  ]
  const airbnbScore = airbnbIndicators.filter(ind => headersStr.includes(ind)).length
  if (airbnbScore >= 2) {
    return 'AIRBNB'
  }

  return 'UNKNOWN'
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
      listingName: find(['tipo de unidad', 'unit type', 'room type']),
      amount: find(['precio', 'price', 'total'])
    }
  } else {
    return {
      confirmationCode: find(['código de confirmación', 'confirmation code']),
      guestName: find(['viajero', 'nombre del viajero', 'guest name', 'nombre del huésped']),
      checkIn: find(['fecha de inicio', 'start date', 'check-in']),
      checkOut: find(['fecha de finalización', 'end date', 'check-out']),
      listingName: find(['anuncio', 'listing', 'property']),
      amount: find(['importe', 'ganancias netas', 'net earnings', 'tus ganancias'])
    }
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

    // Si el segundo número > 12, es el día (formato MM/DD/YYYY)
    if (num2 > 12) {
      return new Date(Date.UTC(y, num1 - 1, num2, 12, 0, 0))
    }
    // Si el primero > 12, es el día (formato DD/MM/YYYY)
    if (num1 > 12) {
      return new Date(Date.UTC(y, num2 - 1, num1, 12, 0, 0))
    }
    // Ambos <= 12: AIRBNB usa MM/DD/YYYY
    return new Date(Date.UTC(y, num1 - 1, num2, 12, 0, 0))
  }

  const date = new Date(clean)
  return isNaN(date.getTime()) ? null : date
}

function parseAmount(str: string): number {
  if (!str) return 0
  let cleaned = str.replace(/[€$£\s]/g, '')

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
