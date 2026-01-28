/**
 * Airbnb Email Parser
 * Extracts reservation data from Airbnb notification emails
 */

export interface ParsedReservation {
  confirmationCode: string
  guestName: string
  checkIn: Date
  checkOut: Date
  nights: number
  adults?: number
  children?: number
  babies?: number
  propertyName?: string
  // Financial data (from payout emails)
  roomTotal?: number
  cleaningFee?: number
  hostServiceFee?: number
  hostEarnings?: number
  currency?: string
}

export type EmailType =
  | 'RESERVATION_CONFIRMED'
  | 'RESERVATION_CANCELLED'
  | 'PAYOUT_SENT'
  | 'RESERVATION_REQUEST'
  | 'REIMBURSEMENT'
  | 'RESOLUTION_PAYOUT'
  | 'UNKNOWN'

/**
 * Detect the type of Airbnb email
 */
export function detectEmailType(subject: string, body: string): EmailType {
  const subjectLower = subject.toLowerCase()
  const bodyLower = body.toLowerCase()

  // Reservation confirmed
  if (
    subjectLower.includes('reserva confirmada') ||
    subjectLower.includes('reservation confirmed') ||
    subjectLower.includes('nueva reserva') ||
    subjectLower.includes('new reservation') ||
    bodyLower.includes('tu reserva está confirmada') ||
    bodyLower.includes('your reservation is confirmed')
  ) {
    return 'RESERVATION_CONFIRMED'
  }

  // Reservation cancelled
  if (
    subjectLower.includes('cancelada') ||
    subjectLower.includes('cancelled') ||
    subjectLower.includes('cancelación') ||
    subjectLower.includes('cancellation')
  ) {
    return 'RESERVATION_CANCELLED'
  }

  // Payout sent - but NOT discarded requests or payment not made
  const isDiscardedOrNotPaid =
    subjectLower.includes('descartado') ||
    subjectLower.includes('no se ha efectuado') ||
    subjectLower.includes('discarded') ||
    subjectLower.includes('not been paid')

  if (
    !isDiscardedOrNotPaid && (
      subjectLower.includes('te hemos enviado') ||
      subjectLower.includes('hemos enviado un cobro') ||
      subjectLower.includes('payout') ||
      subjectLower.includes('transferencia enviada') ||
      subjectLower.includes("you've been paid") ||
      subjectLower.includes('we sent you') ||
      bodyLower.includes('te hemos enviado') ||
      bodyLower.includes('we sent you')
    )
  ) {
    return 'PAYOUT_SENT'
  }

  // Reimbursement / Resolution payout from Airbnb
  if (
    subjectLower.includes('reembolso') ||
    subjectLower.includes('reimbursement') ||
    subjectLower.includes('resolución') ||
    subjectLower.includes('resolution') ||
    bodyLower.includes('airbnb te ha reembolsado') ||
    bodyLower.includes('airbnb has reimbursed') ||
    bodyLower.includes('resolution center') ||
    bodyLower.includes('centro de resoluciones')
  ) {
    return 'REIMBURSEMENT'
  }

  // Ajustes / Adjustments
  if (
    subjectLower.includes('ajuste') ||
    subjectLower.includes('adjustment') ||
    bodyLower.includes('hemos ajustado') ||
    bodyLower.includes('we adjusted')
  ) {
    return 'RESOLUTION_PAYOUT'
  }

  // Reservation request - SKIP these (solicitudes)
  if (
    subjectLower.includes('solicitud') ||
    subjectLower.includes('request') ||
    bodyLower.includes('quiere reservar') ||
    bodyLower.includes('wants to book')
  ) {
    return 'RESERVATION_REQUEST'
  }

  return 'UNKNOWN'
}

/**
 * Parse confirmation code from email
 */
function parseConfirmationCode(text: string): string | null {
  // Pattern: HMXXXXXX (Airbnb format)
  const patterns = [
    /código(?:\s+de)?\s+(?:confirmación|reserva)[:\s]+([A-Z0-9]{8,12})/i,
    /confirmation\s+code[:\s]+([A-Z0-9]{8,12})/i,
    /código[:\s]+([A-Z0-9]{8,12})/i,
    /reserva\s+([A-Z0-9]{8,12})/i,
    /HM[A-Z0-9]{6,10}/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      // Return the captured group or the full match
      return (match[1] || match[0]).toUpperCase()
    }
  }

  return null
}

/**
 * Parse guest name from email
 */
function parseGuestName(text: string): string | null {
  const patterns = [
    /huésped[:\s]+([A-Za-záéíóúñÁÉÍÓÚÑ\s]+?)(?:\n|$|ha reservado|quiere)/i,
    /guest[:\s]+([A-Za-z\s]+?)(?:\n|$|has booked|wants)/i,
    /reserva\s+de\s+([A-Za-záéíóúñÁÉÍÓÚÑ\s]+?)(?:\n|$|para)/i,
    /([A-Za-záéíóúñÁÉÍÓÚÑ\s]+?)\s+ha\s+reservado/i,
    /([A-Za-z\s]+?)\s+has\s+booked/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const name = match[1].trim()
      // Filter out common false positives
      if (name.length > 2 && name.length < 50 && !name.toLowerCase().includes('airbnb')) {
        return name
      }
    }
  }

  return null
}

/**
 * Parse dates from email
 */
function parseDates(text: string): { checkIn: Date | null; checkOut: Date | null } {
  const result = { checkIn: null as Date | null, checkOut: null as Date | null }

  // Pattern: "15 de enero de 2025 - 18 de enero de 2025"
  const spanishPattern = /(\d{1,2})\s+de\s+(\w+)\s+(?:de\s+)?(\d{4})\s*[-–]\s*(\d{1,2})\s+de\s+(\w+)\s+(?:de\s+)?(\d{4})/i
  const spanishMatch = text.match(spanishPattern)

  if (spanishMatch) {
    result.checkIn = parseSpanishDate(spanishMatch[1], spanishMatch[2], spanishMatch[3])
    result.checkOut = parseSpanishDate(spanishMatch[4], spanishMatch[5], spanishMatch[6])
    return result
  }

  // Pattern: "Jan 15, 2025 - Jan 18, 2025"
  const englishPattern = /(\w{3})\s+(\d{1,2}),?\s+(\d{4})\s*[-–]\s*(\w{3})\s+(\d{1,2}),?\s+(\d{4})/i
  const englishMatch = text.match(englishPattern)

  if (englishMatch) {
    result.checkIn = parseEnglishDate(englishMatch[1], englishMatch[2], englishMatch[3])
    result.checkOut = parseEnglishDate(englishMatch[4], englishMatch[5], englishMatch[6])
    return result
  }

  // Pattern: "15/01/2025 - 18/01/2025" or "2025-01-15 - 2025-01-18"
  const numericPattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s*[-–]\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/
  const numericMatch = text.match(numericPattern)

  if (numericMatch) {
    // Assume DD/MM/YYYY format for European dates
    result.checkIn = new Date(
      parseInt(numericMatch[3]),
      parseInt(numericMatch[2]) - 1,
      parseInt(numericMatch[1])
    )
    result.checkOut = new Date(
      parseInt(numericMatch[6]),
      parseInt(numericMatch[5]) - 1,
      parseInt(numericMatch[4])
    )
    return result
  }

  return result
}

const SPANISH_MONTHS: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
  ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
  jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11,
}

const ENGLISH_MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  jan: 0, feb: 1, mar: 2, apr: 3, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
}

function parseSpanishDate(day: string, month: string, year: string): Date | null {
  const monthNum = SPANISH_MONTHS[month.toLowerCase()]
  if (monthNum === undefined) return null
  return new Date(parseInt(year), monthNum, parseInt(day))
}

function parseEnglishDate(month: string, day: string, year: string): Date | null {
  const monthNum = ENGLISH_MONTHS[month.toLowerCase()]
  if (monthNum === undefined) return null
  return new Date(parseInt(year), monthNum, parseInt(day))
}

/**
 * Parse financial amounts from email (works for both confirmation and payout emails)
 */
function parseAmounts(text: string): {
  roomTotal?: number
  cleaningFee?: number
  hostServiceFee?: number
  hostEarnings?: number
  currency?: string
} {
  const result: {
    roomTotal?: number
    cleaningFee?: number
    hostServiceFee?: number
    hostEarnings?: number
    currency?: string
  } = {}

  // Detect currency
  if (text.includes('€') || text.includes('EUR')) {
    result.currency = 'EUR'
  } else if (text.includes('$') || text.includes('USD')) {
    result.currency = 'USD'
  }

  // Room/accommodation total - expanded patterns
  const roomPatterns = [
    /alojamiento[:\s]*([€$]?\s?[\d.,]+)\s*€?/i,
    /accommodation[:\s]*([€$]?\s?[\d.,]+)/i,
    /precio\s+(?:por\s+)?(?:\d+\s+)?noches?[:\s]*([€$]?\s?[\d.,]+)/i,
    /(?:precio|price)[:\s]*([€$]?\s?[\d.,]+)/i,
    /(\d+)\s*noches?\s*[x×]\s*([€$]?\s?[\d.,]+)/i, // "3 noches x €50"
    /subtotal[:\s]*([€$]?\s?[\d.,]+)/i,
    /room\s+(?:rate|price)[:\s]*([€$]?\s?[\d.,]+)/i,
  ]
  for (const pattern of roomPatterns) {
    const match = text.match(pattern)
    if (match) {
      // For "3 noches x €50" pattern, calculate total
      if (match[2]) {
        const nights = parseInt(match[1])
        const perNight = parseAmount(match[2])
        result.roomTotal = nights * perNight
      } else {
        result.roomTotal = parseAmount(match[1])
      }
      if (result.roomTotal > 0) break
    }
  }

  // Cleaning fee - expanded patterns
  const cleaningPatterns = [
    /limpieza[:\s]*([€$]?\s?[\d.,]+)\s*€?/i,
    /cleaning(?:\s+fee)?[:\s]*([€$]?\s?[\d.,]+)/i,
    /tarifa\s+de\s+limpieza[:\s]*([€$]?\s?[\d.,]+)/i,
    /gastos?\s+de\s+limpieza[:\s]*([€$]?\s?[\d.,]+)/i,
  ]
  for (const pattern of cleaningPatterns) {
    const match = text.match(pattern)
    if (match) {
      result.cleaningFee = parseAmount(match[1])
      if (result.cleaningFee > 0) break
    }
  }

  // Host service fee (Airbnb commission) - expanded patterns
  const feePatterns = [
    /comisión(?:\s+(?:de\s+)?(?:airbnb|servicio))?[:\s]*-?\s*([€$]?\s?[\d.,]+)/i,
    /service\s+fee[:\s]*-?\s*([€$]?\s?[\d.,]+)/i,
    /tarifa\s+de\s+servicio[:\s]*-?\s*([€$]?\s?[\d.,]+)/i,
    /host\s+(?:service\s+)?fee[:\s]*-?\s*([€$]?\s?[\d.,]+)/i,
    /airbnb\s+fee[:\s]*-?\s*([€$]?\s?[\d.,]+)/i,
  ]
  for (const pattern of feePatterns) {
    const match = text.match(pattern)
    if (match) {
      result.hostServiceFee = parseAmount(match[1])
      if (result.hostServiceFee > 0) break
    }
  }

  // Host earnings (payout amount) - expanded patterns for both confirmation and payout emails
  const earningsPatterns = [
    // Payout email patterns - SUBJECT LINE: "Te hemos enviado un cobro de 297,78 € EUR"
    /te\s+hemos\s+enviado\s+(?:un\s+)?(?:cobro|pago)\s+de\s+([\d.,]+)\s*€/i,
    /hemos\s+enviado\s+(?:un\s+)?(?:cobro|pago)\s+de\s+([\d.,]+)\s*€/i,
    /enviado\s+(?:un\s+)?(?:cobro|pago)\s+de\s+([\d.,]+)\s*€/i,
    /cobro\s+de\s+([\d.,]+)\s*€/i,
    // Other payout patterns
    /te\s+(?:hemos\s+)?(?:enviado|pagado)[:\s]*([€$]?\s?[\d.,]+)/i,
    /(?:hemos\s+)?(?:enviado|transferido)[:\s]*([€$]?\s?[\d.,]+)/i,
    /you(?:'ll)?\s+(?:receive|earn|get|been\s+paid)[:\s]*([€$]?\s?[\d.,]+)/i,
    /we(?:'ve)?\s+(?:sent|paid)\s+(?:you)?[:\s]*([€$]?\s?[\d.,]+)/i,
    /([€$]\s?[\d.,]+)\s+(?:se\s+ha\s+)?(?:enviado|transferido)/i,
    /payout[:\s]*([€$]?\s?[\d.,]+)/i,
    // Confirmation email patterns - total you'll earn
    /(?:ganarás|you(?:'ll)?\s+earn)[:\s]*([€$]?\s?[\d.,]+)/i,
    /(?:total\s+)?(?:ganancias?|earnings?)[:\s]*([€$]?\s?[\d.,]+)/i,
    /(?:tu\s+)?pago[:\s]*([€$]?\s?[\d.,]+)/i,
    /total(?:\s+a\s+recibir)?[:\s]*([€$]?\s?[\d.,]+)/i,
    /recibirás[:\s]*([€$]?\s?[\d.,]+)/i,
    // Generic total pattern (last resort)
    /total[:\s]*([€$]?\s?[\d.,]+)\s*€/i,
  ]
  for (const pattern of earningsPatterns) {
    const match = text.match(pattern)
    if (match) {
      const amount = parseAmount(match[1])
      // Only accept if it's a reasonable amount (more than €10)
      if (amount > 10) {
        result.hostEarnings = amount
        break
      }
    }
  }

  return result
}

/**
 * Parse amount string to number
 */
function parseAmount(str: string): number {
  if (!str) return 0

  // Remove currency symbols and spaces
  let cleaned = str.replace(/[€$£\s]/g, '')

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
    cleaned = cleaned.replace(',', '.')
  }

  return parseFloat(cleaned) || 0
}

/**
 * Parse property name from email
 *
 * Airbnb email formats:
 * 1. Subject: "¡Nueva reserva confirmada! Pilar llega el 26 ene." (no property name)
 *    Body contains: "The Nook Terrace Central Station\nCasa/apto. entero"
 *
 * 2. Subject: "Reserva confirmada – The Nook Terrace – 15-18 de enero"
 *
 * 3. Payout emails: "Pago enviado por The Nook Terrace"
 */
function parsePropertyName(text: string): string | null {
  const firstLine = text.split('\n')[0]

  // Helper to validate property name
  const isValidPropertyName = (name: string): boolean => {
    const trimmed = name.trim()
    if (trimmed.length < 3 || trimmed.length > 100) return false
    const lowerName = trimmed.toLowerCase()
    // Filter out common invalid matches
    const invalidTerms = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
      'airbnb', 'envía un mensaje', 'send a message', 'identidad verificada',
      'verified identity', 'más información', 'more info', 'ver itinerario',
      'código de confirmación', 'confirmation code'
    ]
    if (invalidTerms.some(term => lowerName.includes(term))) return false
    if (/^HM[A-Z0-9]+$/i.test(trimmed)) return false
    if (/^\d/.test(trimmed)) return false
    return true
  }

  // PATTERN 1 (MOST RELIABLE): Property name followed by "Casa/apto. entero" or "Entire home/apt"
  // This is how Airbnb shows the property in the email body
  const propertyTypePatterns = [
    /([^\n]+)\n\s*(?:Casa\/apto\.?\s*entero|Entire\s+home\/apt|Habitación\s+privada|Private\s+room|Habitación\s+compartida|Shared\s+room)/i,
    /([^\n]+)\n\s*(?:Apartamento|Apartment|Casa|House|Loft|Studio|Estudio|Villa|Chalet)/i,
  ]
  for (const pattern of propertyTypePatterns) {
    const match = text.match(pattern)
    if (match && match[1] && isValidPropertyName(match[1])) {
      return match[1].trim()
    }
  }

  // PATTERN 2: "... – Property Name – ..." in subject (older format)
  const dashPattern = /[–—-]\s*([^–—\-\n]+?)\s*[–—-]/
  const dashMatch = firstLine.match(dashPattern)
  if (dashMatch && dashMatch[1] && isValidPropertyName(dashMatch[1])) {
    return dashMatch[1].trim()
  }

  // PATTERN 3: "Pago enviado por Property Name" in payout emails
  const payoutPatterns = [
    /(?:pago|payout)\s+(?:enviado|sent)\s+(?:por|for)\s+([^–—\-\n]+?)(?:\s*[–—-]|\s*$)/i,
    /(?:te\s+hemos\s+enviado|we\s+sent\s+you).+?(?:por|for)\s+([^–—\-\n]+?)(?:\s*[–—-]|\s*$)/i,
  ]
  for (const pattern of payoutPatterns) {
    const match = text.match(pattern)
    if (match && match[1] && isValidPropertyName(match[1])) {
      return match[1].trim()
    }
  }

  // PATTERN 4: Look for property name before "Llegada" or "Check-in"
  const beforeArrivalPattern = /([A-Z][^\n]{3,60})\n[^\n]*\n?\s*(?:Llegada|Check-?in|Arrival)/i
  const beforeArrivalMatch = text.match(beforeArrivalPattern)
  if (beforeArrivalMatch && beforeArrivalMatch[1] && isValidPropertyName(beforeArrivalMatch[1])) {
    return beforeArrivalMatch[1].trim()
  }

  // PATTERN 5: "en Property Name" in subject
  const inPropertyPattern = /(?:reserva|estancia)\s+(?:de\s+.+?\s+)?en\s+([^–—\-\n]+?)(?:\s+(?:del|desde|ha\s+sido|para)|\s*$)/i
  const inMatch = firstLine.match(inPropertyPattern)
  if (inMatch && inMatch[1] && isValidPropertyName(inMatch[1])) {
    return inMatch[1].trim()
  }

  return null
}

/**
 * Parse number of guests
 */
function parseGuests(text: string): { adults?: number; children?: number; babies?: number } {
  const result: { adults?: number; children?: number; babies?: number } = {}

  // Adults
  const adultsMatch = text.match(/(\d+)\s*(?:adultos?|adults?)/i)
  if (adultsMatch) {
    result.adults = parseInt(adultsMatch[1])
  }

  // Children
  const childrenMatch = text.match(/(\d+)\s*(?:niños?|children)/i)
  if (childrenMatch) {
    result.children = parseInt(childrenMatch[1])
  }

  // Babies
  const babiesMatch = text.match(/(\d+)\s*(?:bebés?|infants?)/i)
  if (babiesMatch) {
    result.babies = parseInt(babiesMatch[1])
  }

  // Total guests pattern
  if (!result.adults) {
    const totalMatch = text.match(/(\d+)\s*(?:huéspedes?|guests?)/i)
    if (totalMatch) {
      result.adults = parseInt(totalMatch[1])
    }
  }

  return result
}

/**
 * Main function to parse an Airbnb email
 */
export function parseAirbnbEmail(
  subject: string,
  body: string
): { type: EmailType; data: Partial<ParsedReservation> | null } {
  const type = detectEmailType(subject, body)

  if (type === 'UNKNOWN') {
    return { type, data: null }
  }

  const fullText = `${subject}\n${body}`

  // Parse common fields
  const confirmationCode = parseConfirmationCode(fullText)
  const guestName = parseGuestName(fullText)
  const { checkIn, checkOut } = parseDates(fullText)
  const propertyName = parsePropertyName(fullText)
  const guests = parseGuests(fullText)

  // Calculate nights
  let nights = 0
  if (checkIn && checkOut) {
    nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  }

  const data: Partial<ParsedReservation> = {
    confirmationCode: confirmationCode || undefined,
    guestName: guestName || undefined,
    checkIn: checkIn || undefined,
    checkOut: checkOut || undefined,
    nights: nights || undefined,
    propertyName: propertyName || undefined,
    ...guests,
  }

  // Parse financial data from ALL email types (not just payout)
  // Confirmation emails may also contain pricing info
  const amounts = parseAmounts(fullText)
  if (amounts.hostEarnings || amounts.roomTotal || amounts.cleaningFee) {
    Object.assign(data, amounts)
  }

  // Only return data if we have at least confirmation code or dates
  if (!confirmationCode && !checkIn) {
    return { type, data: null }
  }

  return { type, data }
}

/**
 * Pick the best numeric value - prefers non-zero values
 */
function pickBestNumber(newVal: number | undefined, existingVal: number | undefined): number | undefined {
  const newNum = newVal ?? 0
  const existingNum = existingVal ?? 0
  // Prefer the higher non-zero value
  if (newNum > 0) return newNum
  if (existingNum > 0) return existingNum
  return undefined
}

/**
 * Merge data from multiple emails about the same reservation
 * Uses null-coalescing for strings/dates and picks best value for numbers
 */
export function mergeReservationData(
  existing: Partial<ParsedReservation>,
  newData: Partial<ParsedReservation>
): Partial<ParsedReservation> {
  return {
    confirmationCode: newData.confirmationCode ?? existing.confirmationCode,
    guestName: newData.guestName ?? existing.guestName,
    checkIn: newData.checkIn ?? existing.checkIn,
    checkOut: newData.checkOut ?? existing.checkOut,
    nights: newData.nights ?? existing.nights,
    adults: newData.adults ?? existing.adults,
    children: newData.children ?? existing.children,
    babies: newData.babies ?? existing.babies,
    propertyName: newData.propertyName ?? existing.propertyName,
    // For financial fields, prefer non-zero values
    roomTotal: pickBestNumber(newData.roomTotal, existing.roomTotal),
    cleaningFee: pickBestNumber(newData.cleaningFee, existing.cleaningFee),
    hostServiceFee: pickBestNumber(newData.hostServiceFee, existing.hostServiceFee),
    hostEarnings: pickBestNumber(newData.hostEarnings, existing.hostEarnings),
    currency: newData.currency ?? existing.currency,
  }
}
