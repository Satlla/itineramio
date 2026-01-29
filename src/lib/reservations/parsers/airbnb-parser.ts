import { ParsedReservation } from '../types'

/**
 * Parser para emails de confirmación de Airbnb
 * Extrae todos los datos relevantes de una reserva
 */
export function parseAirbnbEmail(
  subject: string,
  htmlBody: string,
  textBody: string
): ParsedReservation | null {
  try {
    // Usar el texto plano que es más fácil de parsear
    const text = textBody || htmlBody.replace(/<[^>]*>/g, ' ')

    // Detectar tipo de evento
    const eventType = detectEventType(subject, text)

    // Extraer código de confirmación
    const confirmationCode = extractConfirmationCode(text)
    if (!confirmationCode) {
      console.error('No se encontró código de confirmación')
      return null
    }

    // Extraer nombre de la propiedad
    const propertyName = extractPropertyName(text)

    // Extraer datos del huésped
    const guestData = extractGuestData(text)

    // Extraer fechas
    const dates = extractDates(text, subject)
    if (!dates) {
      console.error('No se encontraron fechas')
      return null
    }

    // Extraer importes
    const amounts = extractAmounts(text)

    // Extraer viajeros
    const travelers = extractTravelers(text)

    // Extraer política de cancelación
    const cancellationPolicy = extractCancellationPolicy(text)

    return {
      platform: 'AIRBNB',
      confirmationCode,
      propertyName: propertyName || 'Propiedad no detectada',
      guestName: guestData.name || 'Huésped',
      guestCountry: guestData.country ?? undefined,
      guestMessage: guestData.message ?? undefined,
      guestVerified: guestData.verified,
      guestReviews: guestData.reviews ?? undefined,
      travelers,
      checkIn: dates.checkIn,
      checkInTime: dates.checkInTime ?? undefined,
      checkOut: dates.checkOut,
      checkOutTime: dates.checkOutTime ?? undefined,
      nights: dates.nights,
      roomTotal: amounts.roomTotal,
      cleaningFee: amounts.cleaningFee,
      guestServiceFee: amounts.guestServiceFee ?? undefined,
      hostServiceFee: amounts.hostServiceFee,
      totalPaid: amounts.totalPaid,
      hostEarnings: amounts.hostEarnings,
      currency: amounts.currency || 'EUR',
      eventType,
      cancellationPolicy: cancellationPolicy ?? undefined,
      rawEmail: text.substring(0, 5000) // Guardar primeros 5000 chars para debug
    }
  } catch (error) {
    console.error('Error parseando email de Airbnb:', error)
    return null
  }
}

function detectEventType(subject: string, text: string): ParsedReservation['eventType'] {
  const subjectLower = subject.toLowerCase()
  const textLower = text.toLowerCase()

  if (subjectLower.includes('cancelada') || subjectLower.includes('cancelled')) {
    return 'CANCELLATION'
  }
  if (subjectLower.includes('modificada') || subjectLower.includes('modified') || subjectLower.includes('cambio')) {
    return 'MODIFICATION'
  }
  if (subjectLower.includes('confirmada') || subjectLower.includes('confirmed') ||
      subjectLower.includes('nueva reserva') || subjectLower.includes('new reservation') ||
      textLower.includes('nueva reserva confirmada') || textLower.includes('reservation confirmed')) {
    return 'NEW_RESERVATION'
  }

  return 'UNKNOWN'
}

function extractConfirmationCode(text: string): string | null {
  // Buscar "Código de confirmación" seguido del código
  const patterns = [
    /[Cc]ódigo de confirmación\s*[:\s]*([A-Z0-9]{8,12})/,
    /[Cc]onfirmation code\s*[:\s]*([A-Z0-9]{8,12})/,
    /[Cc]onfirmación\s*[:\s]*([A-Z0-9]{8,12})/,
    /\b(HM[A-Z0-9]{6,10})\b/  // Códigos Airbnb suelen empezar con HM
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

function extractPropertyName(text: string): string | null {
  // Buscar patrón común en Airbnb: nombre | capacidad | ubicación (PRIMERO)
  const pipePattern = text.match(/([^|\n]{3,})\s*\|\s*([^|\n]+)\s*\|\s*([^|\n]+)/)
  if (pipePattern) {
    return pipePattern[0].trim()
  }

  // El nombre de la propiedad suele aparecer ANTES de "Casa/apto. entero"
  const beforeCasaMatch = text.match(/mensaje a [A-Za-zÀ-ÿ]+\s*\n*([^\n]+)\s*\n*Casa\/apto/i)
  if (beforeCasaMatch) {
    return beforeCasaMatch[1].trim()
  }

  // El nombre de la propiedad suele aparecer después de ciertos patrones
  const patterns = [
    /Casa\/apto\. entero\s*\n*([^\n]+)/i,
    /Entire home\/apt\s*\n*([^\n]+)/i,
    /Habitación privada\s*\n*([^\n]+)/i,
    /Private room\s*\n*([^\n]+)/i
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && !match[1].toLowerCase().includes('llegada')) {
      return match[1].trim()
    }
  }

  return null
}

function extractGuestData(text: string): {
  name: string | null
  country: string | null
  message: string | null
  verified: boolean
  reviews: number | null
} {
  let name: string | null = null
  let country: string | null = null
  let message: string | null = null
  let verified = false
  let reviews: number | null = null

  // Extraer nombre del huésped del asunto o contenido
  const namePatterns = [
    // "¡Nueva reserva confirmada! Salvador llega el 5 feb"
    /reserva confirmada!\s*([A-Za-zÀ-ÿ]+)\s*llega/i,
    // "Envía un mensaje a Salvador"
    /Envía un mensaje a\s*([A-Za-zÀ-ÿ]+)/i,
    // "Salvador llega el 5 feb"
    /([A-Za-zÀ-ÿ]+)\s*llega el/i,
    // Nombre solo en una línea después de la intro
    /bienvenida a\s*([A-Za-zÀ-ÿ]+)\./i
  ]

  for (const pattern of namePatterns) {
    const match = text.match(pattern)
    if (match && match[1].length > 1) {
      name = match[1].trim()
      break
    }
  }

  // Extraer país
  const countryMatch = text.match(/Identidad verificada[^\n]*\n*([A-Za-zÀ-ÿ\s]+)\n/i)
  if (countryMatch) {
    country = countryMatch[1].trim()
  }

  // Verificar si tiene identidad verificada
  verified = /[Ii]dentidad verificada/.test(text)

  // Extraer número de evaluaciones
  const reviewsMatch = text.match(/(\d+)\s*evaluacion/i)
  if (reviewsMatch) {
    reviews = parseInt(reviewsMatch[1], 10)
  }

  // Extraer mensaje del huésped
  const messagePatterns = [
    /España\s*\n*([^]*?)(?=Envía un mensaje)/i,
    /verificada[^\n]*\n*[A-Za-z]+\n*([^]*?)(?=Envía un mensaje)/i
  ]

  for (const pattern of messagePatterns) {
    const match = text.match(pattern)
    if (match) {
      const potentialMessage = match[1].trim()
      // Solo usar si parece un mensaje (más de 10 caracteres, no es solo un país)
      if (potentialMessage.length > 10 && !potentialMessage.match(/^[A-Za-z]+$/)) {
        message = potentialMessage
        break
      }
    }
  }

  // Método alternativo para extraer mensaje
  if (!message) {
    const helloMatch = text.match(/(?:Hola|Hello|Buenos días|Buenas tardes)[^]*?(?=Envía un mensaje)/i)
    if (helloMatch) {
      message = helloMatch[0].trim()
    }
  }

  return { name, country, message, verified, reviews }
}

function extractDates(text: string, subject: string): {
  checkIn: Date
  checkInTime: string | null
  checkOut: Date
  checkOutTime: string | null
  nights: number
} | null {
  // Mapeo de meses en español e inglés
  const months: Record<string, number> = {
    'ene': 0, 'enero': 0, 'jan': 0, 'january': 0,
    'feb': 1, 'febrero': 1, 'february': 1,
    'mar': 2, 'marzo': 2, 'march': 2,
    'abr': 3, 'abril': 3, 'apr': 3, 'april': 3,
    'may': 4, 'mayo': 4,
    'jun': 5, 'junio': 5, 'june': 5,
    'jul': 6, 'julio': 6, 'july': 6,
    'ago': 7, 'agosto': 7, 'aug': 7, 'august': 7,
    'sep': 8, 'sept': 8, 'septiembre': 8, 'september': 8,
    'oct': 9, 'octubre': 9, 'october': 9,
    'nov': 10, 'noviembre': 10, 'november': 10,
    'dic': 11, 'diciembre': 11, 'dec': 11, 'december': 11
  }

  let checkIn: Date | null = null
  let checkOut: Date | null = null
  let checkInTime: string | null = null
  let checkOutTime: string | null = null
  let nights = 0

  // Buscar patrón "Llegada ... Salida"
  // Ejemplo: "Llegada jue, 5 feb 16:00 Salida dom, 8 feb 11:00"
  const llegadaMatch = text.match(/[Ll]legada\s*(?:[a-záéíóú]+,?\s*)?(\d{1,2})\s*([a-záéíóú]+)(?:\s*\d{4})?\s*(\d{1,2}:\d{2})?/i)
  const salidaMatch = text.match(/[Ss]alida\s*(?:[a-záéíóú]+,?\s*)?(\d{1,2})\s*([a-záéíóú]+)(?:\s*\d{4})?\s*(\d{1,2}:\d{2})?/i)

  if (llegadaMatch && salidaMatch) {
    const currentYear = new Date().getFullYear()

    const checkInDay = parseInt(llegadaMatch[1], 10)
    const checkInMonthStr = llegadaMatch[2].toLowerCase()
    const checkInMonth = months[checkInMonthStr]
    checkInTime = llegadaMatch[3] || null

    const checkOutDay = parseInt(salidaMatch[1], 10)
    const checkOutMonthStr = salidaMatch[2].toLowerCase()
    const checkOutMonth = months[checkOutMonthStr]
    checkOutTime = salidaMatch[3] || null

    if (checkInMonth !== undefined && checkOutMonth !== undefined) {
      // Determinar el año (si check-in es en diciembre y check-out en enero, ajustar)
      let checkInYear = currentYear
      let checkOutYear = currentYear

      // Si estamos en diciembre y la reserva es para enero-febrero, es para el próximo año
      const currentMonth = new Date().getMonth()
      if (currentMonth >= 10 && checkInMonth <= 2) {
        checkInYear = currentYear + 1
        checkOutYear = currentYear + 1
      }

      // Si check-out es en un mes anterior a check-in, es año siguiente
      if (checkOutMonth < checkInMonth) {
        checkOutYear = checkInYear + 1
      }

      checkIn = new Date(checkInYear, checkInMonth, checkInDay)
      checkOut = new Date(checkOutYear, checkOutMonth, checkOutDay)
    }
  }

  // Extraer número de noches
  const nightsMatch = text.match(/(\d+)\s*noche/i)
  if (nightsMatch) {
    nights = parseInt(nightsMatch[1], 10)
  } else if (checkIn && checkOut) {
    nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (!checkIn || !checkOut) {
    return null
  }

  return { checkIn, checkOut, checkInTime, checkOutTime, nights }
}

function extractAmounts(text: string): {
  roomTotal: number
  cleaningFee: number
  guestServiceFee: number
  hostServiceFee: number
  totalPaid: number
  hostEarnings: number
  currency: string
} {
  // Función helper para extraer número de un string con formato europeo
  const parseAmount = (str: string): number => {
    if (!str) return 0
    // Quitar símbolo de moneda y espacios, convertir coma a punto
    const cleaned = str.replace(/[€$£\s]/g, '').replace(/\./g, '').replace(',', '.')
    return parseFloat(cleaned) || 0
  }

  let roomTotal = 0
  let cleaningFee = 0
  let guestServiceFee = 0
  let hostServiceFee = 0
  let totalPaid = 0
  let hostEarnings = 0
  let currency = 'EUR'

  // Detectar moneda
  if (text.includes('$')) currency = 'USD'
  else if (text.includes('£')) currency = 'GBP'
  else if (text.includes('€')) currency = 'EUR'

  // Precio por noches (para el huésped)
  const roomMatch = text.match(/(\d+[.,]\d{2})\s*€?\s*por\s*\d+\s*noche/i)
  if (roomMatch) {
    roomTotal = parseAmount(roomMatch[1])
  }

  // Precio de habitación separado
  const precioMatch = text.match(/[Pp]recio[^€\d]*(\d+[.,]?\d*)\s*€/i) ||
                      text.match(/(\d+[.,]\d{2})\s*€\s*\n\s*Gastos de limpieza/i)
  if (precioMatch) {
    roomTotal = parseAmount(precioMatch[1])
  }

  // Gastos de limpieza
  const cleaningMatch = text.match(/[Gg]astos de limpieza\s*(\d+[.,]?\d*)\s*€/i) ||
                        text.match(/[Ll]impieza\s*(\d+[.,]?\d*)\s*€/i) ||
                        text.match(/[Cc]leaning fee\s*(\d+[.,]?\d*)/i)
  if (cleaningMatch) {
    cleaningFee = parseAmount(cleaningMatch[1])
  }

  // Comisión del viajero (lo que Airbnb cobra al huésped)
  const guestFeeMatch = text.match(/[Cc]omisión de servicio del viajero\s*(\d+[.,]?\d*)\s*€/i) ||
                        text.match(/[Gg]uest service fee\s*(\d+[.,]?\d*)/i)
  if (guestFeeMatch) {
    guestServiceFee = parseAmount(guestFeeMatch[1])
  }

  // Total pagado por el huésped
  const totalMatch = text.match(/[Tt]otal\s*\(EUR\)\s*(\d+[.,]?\d*)\s*€?/i) ||
                     text.match(/[Tt]otal[^\d]*(\d+[.,]\d{2})\s*€/i)
  if (totalMatch) {
    totalPaid = parseAmount(totalMatch[1])
  }

  // Comisión del anfitrión (lo que te cobra Airbnb a ti)
  // Buscar patrón "Comisión de servicio del anfitrión (3.0 % + IVA) -11,51 €"
  const hostFeeMatch = text.match(/[Cc]omisión[^€]*anfitrión[^€]*-\s*(\d+[.,]\d+)\s*€/i) ||
                       text.match(/[Hh]ost service fee[^€]*-?\s*(\d+[.,]\d+)/i) ||
                       text.match(/-(\d+[.,]\d+)\s*€\s*\n*\s*Ganas/i)
  if (hostFeeMatch) {
    hostServiceFee = parseAmount(hostFeeMatch[1])
  }

  // Lo que ganas (tu ingreso neto)
  const earningsMatch = text.match(/[Gg]anas\s*(\d+[.,]?\d*)\s*€/i) ||
                        text.match(/[Yy]ou earn\s*(\d+[.,]?\d*)/i) ||
                        text.match(/[Tt]u ingreso\s*(\d+[.,]?\d*)\s*€/i)
  if (earningsMatch) {
    hostEarnings = parseAmount(earningsMatch[1])
  }

  // Si no encontramos roomTotal pero tenemos hostEarnings y fees, calcular
  if (roomTotal === 0 && hostEarnings > 0) {
    roomTotal = hostEarnings + hostServiceFee - cleaningFee
    if (roomTotal < 0) roomTotal = hostEarnings // Fallback
  }

  return {
    roomTotal,
    cleaningFee,
    guestServiceFee,
    hostServiceFee,
    totalPaid,
    hostEarnings,
    currency
  }
}

function extractTravelers(text: string): {
  adults: number
  children: number
  babies: number
} {
  let adults = 1
  let children = 0
  let babies = 0

  // Buscar patrón "2 adultos, 1 niño, 1 bebé"
  const adultsMatch = text.match(/(\d+)\s*adulto/i)
  if (adultsMatch) {
    adults = parseInt(adultsMatch[1], 10)
  }

  const childrenMatch = text.match(/(\d+)\s*niño/i)
  if (childrenMatch) {
    children = parseInt(childrenMatch[1], 10)
  }

  const babiesMatch = text.match(/(\d+)\s*bebé/i)
  if (babiesMatch) {
    babies = parseInt(babiesMatch[1], 10)
  }

  return { adults, children, babies }
}

function extractCancellationPolicy(text: string): string | null {
  const policyMatch = text.match(/[Pp]olítica de cancelación[^:]*:\s*([A-Za-záéíóúÁÉÍÓÚñÑ]+)/i) ||
                      text.match(/[Cc]ancellation policy[^:]*:\s*([A-Za-z]+)/i) ||
                      text.match(/que tienes establecida[^:]*es\s*([A-Za-záéíóúÁÉÍÓÚñÑ]+)/i)

  if (policyMatch) {
    return policyMatch[1].trim()
  }

  return null
}
