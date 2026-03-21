import { ParsedReservation } from '../types'

/**
 * Parser para emails de confirmación de Booking.com
 * Extrae todos los datos relevantes de una reserva
 *
 * Booking envía emails en varios idiomas y formatos.
 * Este parser cubre los casos más comunes en español e inglés.
 */
export function parseBookingEmail(
  subject: string,
  htmlBody: string,
  textBody: string
): ParsedReservation | null {
  try {
    const text = textBody || htmlBody.replace(/<[^>]*>/g, ' ')

    const eventType = detectBookingEventType(subject, text)

    const confirmationCode = extractBookingConfirmationCode(text, subject)
    if (!confirmationCode) {
      return null
    }

    const propertyName = extractBookingPropertyName(text)
    const guestData = extractBookingGuestData(text)
    const dates = extractBookingDates(text, subject)

    if (!dates) {
      return null
    }

    const amounts = extractBookingAmounts(text)
    const travelers = extractBookingTravelers(text)

    return {
      platform: 'BOOKING',
      confirmationCode,
      propertyName: propertyName || 'Propiedad no detectada',
      guestName: guestData.name || 'Huésped',
      guestCountry: guestData.country ?? undefined,
      guestMessage: guestData.message ?? undefined,
      guestVerified: false, // Booking no indica verificación en emails
      travelers,
      checkIn: dates.checkIn,
      checkInTime: dates.checkInTime ?? undefined,
      checkOut: dates.checkOut,
      checkOutTime: dates.checkOutTime ?? undefined,
      nights: dates.nights,
      roomTotal: amounts.roomTotal,
      cleaningFee: amounts.cleaningFee,
      guestServiceFee: undefined,
      hostServiceFee: amounts.hostServiceFee,
      totalPaid: amounts.totalPaid,
      hostEarnings: amounts.hostEarnings,
      currency: amounts.currency || 'EUR',
      eventType,
      cancellationPolicy: undefined,
      rawEmail: text.substring(0, 5000)
    }
  } catch (error) {
    return null
  }
}

function detectBookingEventType(subject: string, text: string): ParsedReservation['eventType'] {
  const subjectLower = subject.toLowerCase()
  const textLower = text.toLowerCase()

  if (
    subjectLower.includes('cancelad') ||
    subjectLower.includes('cancelled') ||
    subjectLower.includes('canceled') ||
    textLower.includes('ha sido cancelada') ||
    textLower.includes('has been cancelled')
  ) {
    return 'CANCELLATION'
  }

  if (
    subjectLower.includes('modificad') ||
    subjectLower.includes('modified') ||
    subjectLower.includes('cambiada') ||
    subjectLower.includes('changed') ||
    textLower.includes('ha sido modificada') ||
    textLower.includes('has been modified')
  ) {
    return 'MODIFICATION'
  }

  if (
    subjectLower.includes('nueva reserva') ||
    subjectLower.includes('new reservation') ||
    subjectLower.includes('new booking') ||
    subjectLower.includes('reserva confirmada') ||
    subjectLower.includes('booking confirmed') ||
    textLower.includes('nueva reserva') ||
    textLower.includes('new reservation')
  ) {
    return 'NEW_RESERVATION'
  }

  return 'UNKNOWN'
}

function extractBookingConfirmationCode(text: string, subject: string): string | null {
  // Booking usa números de reserva de 10 dígitos
  const patterns = [
    // "Número de reserva: 1234567890"
    /[Nn]úmero de reserva[:\s]*([0-9]{8,12})/,
    // "Booking number: 1234567890"
    /[Bb]ooking number[:\s]*([0-9]{8,12})/,
    // "Reserva número 1234567890"
    /[Rr]eserva\s+(?:número|n[°º]?|#)\s*([0-9]{8,12})/i,
    // "Reservation number: 1234567890"
    /[Rr]eservation\s+(?:number|n[°º]?|#)[:\s]*([0-9]{8,12})/i,
    // "PIN: 1234567890" (Booking usa PIN como código)
    /\bPIN[:\s]+([0-9]{6,10})\b/i,
    // Código en el asunto: "Reserva 1234567890"
    /(?:Reserva|Booking)[:\s#]*([0-9]{8,12})/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern) || subject.match(pattern)
    if (match) return match[1]
  }

  // Fallback: buscar secuencias de 10 dígitos que parezcan número de reserva Booking
  const tenDigits = text.match(/\b([0-9]{10})\b/)
  if (tenDigits) return tenDigits[1]

  return null
}

function extractBookingPropertyName(text: string): string | null {
  const patterns = [
    // "Se han realizado reservas en: Nombre del alojamiento"
    /[Ss]e han realizado reservas en[:\s]+([^\n]+)/,
    // "Reserva en: Nombre"
    /[Rr]eserva en[:\s]+([^\n]+)/,
    // "Booked at: Property name"
    /[Bb]ooked at[:\s]+([^\n]+)/,
    // "Propiedad:" o "Property:"
    /(?:[Pp]ropiedad|[Pp]roperty)[:\s]+([^\n]+)/,
    // "Alojamiento:"
    /[Aa]lojamiento[:\s]+([^\n]+)/,
    // "Accommodation:"
    /[Aa]ccommodation[:\s]+([^\n]+)/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1].trim().length > 2) {
      return match[1].trim()
    }
  }

  return null
}

function extractBookingGuestData(text: string): {
  name: string | null
  country: string | null
  message: string | null
} {
  let name: string | null = null
  let country: string | null = null
  let message: string | null = null

  // Extraer nombre del huésped
  const namePatterns = [
    // "Nombre del huésped: John Smith"
    /[Nn]ombre del (?:huésped|cliente)[:\s]+([A-Za-zÀ-ÿ\s\-']+?)(?:\n|$)/,
    // "Guest name: John Smith"
    /[Gg]uest name[:\s]+([A-Za-zÀ-ÿ\s\-']+?)(?:\n|$)/,
    // "Reservado por: John Smith"
    /[Rr]eservado por[:\s]+([A-Za-zÀ-ÿ\s\-']+?)(?:\n|$)/,
    // "Booked by: John Smith"
    /[Bb]ooked by[:\s]+([A-Za-zÀ-ÿ\s\-']+?)(?:\n|$)/,
    // "Cliente: John Smith"
    /[Cc]liente[:\s]+([A-Za-zÀ-ÿ\s\-']+?)(?:\n|$)/,
    // "Nombre: John Smith"
    /[Nn]ombre[:\s]+([A-Za-zÀ-ÿ\s\-']+?)(?:\n|$)/,
  ]

  for (const pattern of namePatterns) {
    const match = text.match(pattern)
    if (match && match[1].trim().length > 1) {
      name = match[1].trim()
      break
    }
  }

  // Extraer país
  const countryPatterns = [
    /[Pp]aís[:\s]+([A-Za-zÀ-ÿ\s]+?)(?:\n|$)/,
    /[Cc]ountry[:\s]+([A-Za-zÀ-ÿ\s]+?)(?:\n|$)/,
    /[Oo]rigen[:\s]+([A-Za-zÀ-ÿ\s]+?)(?:\n|$)/,
  ]

  for (const pattern of countryPatterns) {
    const match = text.match(pattern)
    if (match && match[1].trim().length > 1) {
      country = match[1].trim()
      break
    }
  }

  // Extraer mensaje del huésped
  const messagePatterns = [
    /[Mm]ensaje del (?:huésped|cliente)[:\s]*\n([^]*?)(?=\n\n|\n[A-Z])/,
    /[Gg]uest message[:\s]*\n([^]*?)(?=\n\n|\n[A-Z])/,
    /[Pp]eticiones especiales?[:\s]+([^\n]+)/i,
    /[Ss]pecial requests?[:\s]+([^\n]+)/i,
  ]

  for (const pattern of messagePatterns) {
    const match = text.match(pattern)
    if (match && match[1].trim().length > 5) {
      message = match[1].trim()
      break
    }
  }

  return { name, country, message }
}

function extractBookingDates(
  text: string,
  subject: string
): {
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

  // Patrón 1: "Llegada: 15 de marzo de 2025" / "Check-in: 15 March 2025"
  const checkInPatterns = [
    /(?:[Ll]legada|[Cc]heck-?in|[Ee]ntrada)[:\s]*(?:[a-záéíóú]+,?\s*)?(\d{1,2})\s+(?:de\s+)?([a-záéíóúA-Z]+)(?:\s+de\s+|\s+)(\d{4})(?:\s*[–-]\s*(\d{1,2}:\d{2}))?/i,
    /(?:[Ll]legada|[Cc]heck-?in|[Ee]ntrada)[:\s]*(\d{4}-\d{2}-\d{2})/i,
    /(?:[Ll]legada|[Cc]heck-?in|[Ee]ntrada)[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/i,
  ]

  const checkOutPatterns = [
    /(?:[Ss]alida|[Cc]heck-?out|[Ss]alida)[:\s]*(?:[a-záéíóú]+,?\s*)?(\d{1,2})\s+(?:de\s+)?([a-záéíóúA-Z]+)(?:\s+de\s+|\s+)(\d{4})(?:\s*[–-]\s*(\d{1,2}:\d{2}))?/i,
    /(?:[Ss]alida|[Cc]heck-?out)[:\s]*(\d{4}-\d{2}-\d{2})/i,
    /(?:[Ss]alida|[Cc]heck-?out)[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/i,
  ]

  // Intentar extraer check-in
  for (const pattern of checkInPatterns) {
    const match = text.match(pattern)
    if (match) {
      if (match[2]) {
        // Formato "DD mes YYYY"
        const day = parseInt(match[1], 10)
        const monthStr = match[2].toLowerCase()
        const year = parseInt(match[3], 10)
        const monthNum = months[monthStr]
        if (monthNum !== undefined) {
          checkIn = new Date(year, monthNum, day)
          checkInTime = match[4] || null
        }
      } else {
        // Formato ISO o DD/MM/YYYY
        const dateStr = match[1]
        const parsed = parseDateString(dateStr)
        if (parsed) checkIn = parsed
      }
      if (checkIn) break
    }
  }

  // Intentar extraer check-out
  for (const pattern of checkOutPatterns) {
    const match = text.match(pattern)
    if (match) {
      if (match[2]) {
        const day = parseInt(match[1], 10)
        const monthStr = match[2].toLowerCase()
        const year = parseInt(match[3], 10)
        const monthNum = months[monthStr]
        if (monthNum !== undefined) {
          checkOut = new Date(year, monthNum, day)
          checkOutTime = match[4] || null
        }
      } else {
        const dateStr = match[1]
        const parsed = parseDateString(dateStr)
        if (parsed) checkOut = parsed
      }
      if (checkOut) break
    }
  }

  // Patrón 2: "del 15 de marzo al 18 de marzo de 2025"
  if (!checkIn || !checkOut) {
    const rangePattern = /del?\s+(\d{1,2})\s+(?:de\s+)?([a-záéíóú]+)(?:\s+de\s+(\d{4}))?\s+al?\s+(\d{1,2})\s+(?:de\s+)?([a-záéíóú]+)\s+(?:de\s+)?(\d{4})/i
    const rangeMatch = text.match(rangePattern)
    if (rangeMatch) {
      const inDay = parseInt(rangeMatch[1], 10)
      const inMonth = months[rangeMatch[2].toLowerCase()]
      const outDay = parseInt(rangeMatch[4], 10)
      const outMonth = months[rangeMatch[5].toLowerCase()]
      const year = parseInt(rangeMatch[6] || rangeMatch[3], 10)

      if (inMonth !== undefined && outMonth !== undefined && year) {
        checkIn = checkIn || new Date(year, inMonth, inDay)
        checkOut = checkOut || new Date(year, outMonth, outDay)
        // Si el check-out mes es menor al check-in mes, el check-out es año siguiente
        if (outMonth < inMonth) {
          checkOut = new Date(year + 1, outMonth, outDay)
        }
      }
    }
  }

  // Patrón 3: Fechas ISO en el texto "2025-03-15"
  if (!checkIn || !checkOut) {
    const isoMatches = text.match(/\b(\d{4}-\d{2}-\d{2})\b/g)
    if (isoMatches && isoMatches.length >= 2) {
      checkIn = checkIn || new Date(isoMatches[0])
      checkOut = checkOut || new Date(isoMatches[1])
    }
  }

  // Extraer noches
  const nightsPatterns = [
    /(\d+)\s*(?:noche|night)/i,
    /[Dd]uración[:\s]+(\d+)\s*(?:noche|night)/i,
  ]

  for (const pattern of nightsPatterns) {
    const match = text.match(pattern)
    if (match) {
      nights = parseInt(match[1], 10)
      break
    }
  }

  if (!nights && checkIn && checkOut) {
    nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (!checkIn || !checkOut) return null

  return { checkIn, checkOut, checkInTime, checkOutTime, nights }
}

function parseDateString(str: string): Date | null {
  if (!str) return null

  // ISO format YYYY-MM-DD
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) {
    return new Date(parseInt(iso[1]), parseInt(iso[2]) - 1, parseInt(iso[3]))
  }

  // DD/MM/YYYY
  const dmy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (dmy) {
    return new Date(parseInt(dmy[3]), parseInt(dmy[2]) - 1, parseInt(dmy[1]))
  }

  return null
}

function extractBookingAmounts(text: string): {
  roomTotal: number
  cleaningFee: number
  hostServiceFee: number
  totalPaid: number
  hostEarnings: number
  currency: string
} {
  const parseAmount = (str: string): number => {
    if (!str) return 0
    const cleaned = str.replace(/[€$£\s]/g, '').replace(/EUR|USD|GBP/gi, '').trim()
    // European format: 1.234,56 -> 1234.56
    if (cleaned.includes(',') && cleaned.includes('.')) {
      const lastComma = cleaned.lastIndexOf(',')
      const lastDot = cleaned.lastIndexOf('.')
      if (lastComma > lastDot) {
        return parseFloat(cleaned.replace(/\./g, '').replace(',', '.')) || 0
      }
      return parseFloat(cleaned.replace(/,/g, '')) || 0
    }
    if (cleaned.includes(',')) {
      return parseFloat(cleaned.replace(',', '.')) || 0
    }
    return parseFloat(cleaned) || 0
  }

  let roomTotal = 0
  let cleaningFee = 0
  let hostServiceFee = 0
  let totalPaid = 0
  let hostEarnings = 0
  let currency = 'EUR'

  // Detectar moneda
  if (text.includes('$') && !text.includes('€')) currency = 'USD'
  else if (text.includes('£')) currency = 'GBP'

  // También detectar en string de moneda
  const currencyMatch = text.match(/\b(EUR|USD|GBP|CHF)\b/i)
  if (currencyMatch) currency = currencyMatch[1].toUpperCase()

  // Total a recibir (lo más importante para el anfitrión)
  const earningsPatterns = [
    /[Ii]mporte que (?:recibirás|vas a recibir)[:\s]*([0-9.,]+)\s*(?:€|EUR)?/i,
    /[Ii]mporte a (?:cobrar|recibir)[:\s]*([0-9.,]+)\s*(?:€|EUR)?/i,
    /[Yy]ou will (?:receive|earn|be paid)[:\s]*([0-9.,]+)/i,
    /[Pp]ayout[:\s]*([0-9.,]+)/i,
    /[Tt]u (?:ganancia|ingreso|pago)[:\s]*([0-9.,]+)\s*(?:€|EUR)?/i,
    /[Pp]ago (?:al|del) (?:propietario|anfitrión)[:\s]*([0-9.,]+)/i,
  ]

  for (const pattern of earningsPatterns) {
    const match = text.match(pattern)
    if (match) {
      hostEarnings = parseAmount(match[1])
      if (hostEarnings > 0) break
    }
  }

  // Total pagado por el huésped
  const totalPatterns = [
    /[Tt]otal[:\s]*([0-9.,]+)\s*(?:€|EUR)?/i,
    /[Pp]recio total[:\s]*([0-9.,]+)/i,
    /[Tt]otal price[:\s]*([0-9.,]+)/i,
    /[Ii]mporte total[:\s]*([0-9.,]+)/i,
  ]

  for (const pattern of totalPatterns) {
    const match = text.match(pattern)
    if (match) {
      totalPaid = parseAmount(match[1])
      if (totalPaid > 0) break
    }
  }

  // Comisión de Booking (lo que te cobra)
  const commissionPatterns = [
    /[Cc]omisión de Booking\.com[:\s]*([0-9.,]+)/i,
    /[Cc]omisión[:\s]*([0-9.,]+)\s*(?:€|EUR)?/i,
    /[Bb]ooking commission[:\s]*([0-9.,]+)/i,
    /[Cc]ommission[:\s]*([0-9.,]+)/i,
  ]

  for (const pattern of commissionPatterns) {
    const match = text.match(pattern)
    if (match) {
      hostServiceFee = parseAmount(match[1])
      if (hostServiceFee > 0) break
    }
  }

  // Precio de alojamiento (sin limpieza)
  const roomPatterns = [
    /[Pp]recio (?:de la )?(?:habitación|estancia|alojamiento)[:\s]*([0-9.,]+)/i,
    /[Rr]oom rate[:\s]*([0-9.,]+)/i,
    /[Aa]ccommodation[:\s]*([0-9.,]+)/i,
    /([0-9.,]+)\s*(?:€|EUR)\s*x\s*\d+\s*noche/i,
  ]

  for (const pattern of roomPatterns) {
    const match = text.match(pattern)
    if (match) {
      roomTotal = parseAmount(match[1])
      if (roomTotal > 0) break
    }
  }

  // Si no tenemos hostEarnings pero sí total y comisión
  if (hostEarnings === 0 && totalPaid > 0 && hostServiceFee > 0) {
    hostEarnings = totalPaid - hostServiceFee
  }

  // Si no tenemos nada, usar el total como hostEarnings
  if (hostEarnings === 0 && totalPaid > 0) {
    hostEarnings = totalPaid
  }

  // roomTotal fallback
  if (roomTotal === 0 && hostEarnings > 0) {
    roomTotal = hostEarnings
  }

  return {
    roomTotal,
    cleaningFee,
    hostServiceFee,
    totalPaid,
    hostEarnings,
    currency
  }
}

function extractBookingTravelers(text: string): {
  adults: number
  children: number
  babies: number
} {
  let adults = 1
  let children = 0
  const babies = 0

  const adultsMatch = text.match(/(\d+)\s*adulto/i) || text.match(/(\d+)\s*adult/i)
  if (adultsMatch) adults = parseInt(adultsMatch[1], 10)

  const childrenMatch = text.match(/(\d+)\s*ni[ñn]o/i) || text.match(/(\d+)\s*child/i) || text.match(/(\d+)\s*children/i)
  if (childrenMatch) children = parseInt(childrenMatch[1], 10)

  // Fallback: "X personas" / "X guests"
  if (adults === 1) {
    const guestsMatch = text.match(/(\d+)\s*(?:personas|huéspedes|guests)/i)
    if (guestsMatch) adults = parseInt(guestsMatch[1], 10)
  }

  return { adults, children, babies }
}
