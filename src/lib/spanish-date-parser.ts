/**
 * Parser for Spanish abbreviated date formats (e.g., "6Dic", "27Dic - 3Ene")
 */

const SPANISH_MONTHS: Record<string, number> = {
  'ene': 0, 'enero': 0,
  'feb': 1, 'febrero': 1,
  'mar': 2, 'marzo': 2,
  'abr': 3, 'abril': 3,
  'may': 4, 'mayo': 4,
  'jun': 5, 'junio': 5,
  'jul': 6, 'julio': 6,
  'ago': 7, 'agosto': 7,
  'sep': 8, 'sept': 8, 'septiembre': 8,
  'oct': 9, 'octubre': 9,
  'nov': 10, 'noviembre': 10,
  'dic': 11, 'diciembre': 11,
}

/**
 * Parse a single Spanish date like "6Dic" or "27Ene" into a Date.
 * @param str - The date string (e.g., "6Dic", "27Ene")
 * @param year - The base year to use
 * @returns Date or null if parsing fails
 */
export function parseSpanishDate(str: string, year: number): Date | null {
  if (!str) return null

  const cleaned = str.trim()
  // Match: optional spaces, 1-2 digit day, optional space/separator, Spanish month abbreviation
  const match = cleaned.match(/^(\d{1,2})\s*[-/]?\s*([A-Za-záéíóú]+)$/i)
  if (!match) return null

  const day = parseInt(match[1], 10)
  const monthStr = match[2].toLowerCase()

  const month = SPANISH_MONTHS[monthStr]
  if (month === undefined) return null
  if (day < 1 || day > 31) return null

  return new Date(year, month, day)
}

/**
 * Parse a Spanish date range like "6Dic - 10Dic" or "27Dic - 3Ene".
 * Handles year rollover (e.g., Dec → Jan means checkOut is next year).
 * @param str - The date range string
 * @param year - The base year
 * @returns { checkIn, checkOut } or null if parsing fails
 */
export function parseSpanishDateRange(str: string, year: number): { checkIn: Date; checkOut: Date } | null {
  if (!str) return null

  // Split by common separators: " - ", " – ", "-", "–", "/"
  const parts = str.split(/\s*[-–/]\s*/)
  if (parts.length !== 2) return null

  const checkIn = parseSpanishDate(parts[0], year)
  let checkOut = parseSpanishDate(parts[1], year)

  if (!checkIn || !checkOut) return null

  // Handle year rollover: if checkOut is before checkIn, it's next year
  if (checkOut < checkIn) {
    checkOut = parseSpanishDate(parts[1], year + 1)
    if (!checkOut) return null
  }

  return { checkIn, checkOut }
}

/**
 * Try to parse a string as a Spanish date. Returns null if it doesn't match.
 * This is meant to be used as a fallback in the date parsing pipeline.
 */
export function tryParseSpanishDate(str: string, referenceYear?: number): Date | null {
  const year = referenceYear || new Date().getFullYear()
  return parseSpanishDate(str, year)
}

/**
 * Parse a generic date from a string using a specific format.
 */
function parseStandardDate(str: string, format: string): Date | null {
  if (!str) return null
  const cleaned = str.trim()

  let day: number, month: number, year: number

  switch (format) {
    case 'DD/MM/YYYY':
    case 'DD-MM-YYYY': {
      const match = cleaned.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/)
      if (!match) return null
      day = parseInt(match[1], 10)
      month = parseInt(match[2], 10)
      year = parseInt(match[3], 10)
      if (year < 100) year += 2000
      break
    }
    case 'MM/DD/YYYY': {
      const match = cleaned.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/)
      if (!match) return null
      month = parseInt(match[1], 10)
      day = parseInt(match[2], 10)
      year = parseInt(match[3], 10)
      if (year < 100) year += 2000
      break
    }
    case 'YYYY-MM-DD': {
      const match = cleaned.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/)
      if (!match) return null
      year = parseInt(match[1], 10)
      month = parseInt(match[2], 10)
      day = parseInt(match[3], 10)
      break
    }
    case 'SPANISH':
      return tryParseSpanishDate(cleaned)
    default:
      return null
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  return new Date(year, month - 1, day)
}

/**
 * Parse a date range string into checkIn and checkOut dates.
 * Supports multiple formats:
 * - Spanish: "6Dic - 10Dic", "27Dic - 3Ene"
 * - Standard: "01/01/2025 - 05/01/2025", "2025-01-01 - 2025-01-05"
 * - Short: "01/01 - 05/01" (assumes current year)
 *
 * Handles year rollover automatically.
 */
export function parseDateRange(
  str: string,
  dateFormat: string
): { checkIn: Date; checkOut: Date } | null {
  if (!str) return null

  // Split by common range separators: " - ", " – ", " a ", " al ", " to "
  const parts = str.split(/\s*(?:[-–]|a(?:l)?|to)\s*/i)
  if (parts.length !== 2) return null

  const part1 = parts[0].trim()
  const part2 = parts[1].trim()

  if (!part1 || !part2) return null

  // Try Spanish format first if configured or auto-detect
  if (dateFormat === 'SPANISH') {
    const year = new Date().getFullYear()
    return parseSpanishDateRange(str, year)
  }

  // Try parsing each part with the specified format
  let checkIn = parseStandardDate(part1, dateFormat)
  let checkOut = parseStandardDate(part2, dateFormat)

  // If standard format fails, try Spanish as fallback
  if (!checkIn || !checkOut) {
    const year = new Date().getFullYear()
    const spanishResult = parseSpanishDateRange(str, year)
    if (spanishResult) return spanishResult
    return null
  }

  // Handle year rollover
  if (checkOut < checkIn) {
    const nextYear = new Date(checkOut)
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    checkOut = nextYear
  }

  return { checkIn, checkOut }
}
