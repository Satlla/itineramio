/**
 * Universal date parser — handles ANY date format from ANY CSV/XLSX export.
 *
 * Supported formats:
 * - ISO: "2026-03-04", "2026-03-04T15:00:00Z"
 * - European: "04/03/2026", "04-03-2026", "04.03.2026"
 * - American: "03/04/2026" (when configured or auto-detected)
 * - Short year: "4/3/26", "04/03/26"
 * - English month: "4 Mar 2026", "Mar 4, 2026", "March 4, 2026", "4-Mar-2026"
 * - Spanish month: "4 Mar 2026", "4 marzo 2026", "6Dic", "27Ene"
 * - French month: "4 mars 2026", "4 déc 2026"
 * - Ranges: "4 Mar - 7 Mar", "04/03/2026 - 07/03/2026", "6Dic - 10Dic"
 */

// Month names in multiple languages (all lowercase)
const MONTH_NAMES: Record<string, number> = {
  // English
  'jan': 0, 'january': 0, 'feb': 1, 'february': 1, 'mar': 2, 'march': 2,
  'apr': 3, 'april': 3, 'may': 4, 'jun': 5, 'june': 5,
  'jul': 6, 'july': 6, 'aug': 7, 'august': 7, 'sep': 8, 'sept': 8, 'september': 8,
  'oct': 9, 'october': 9, 'nov': 10, 'november': 10, 'dec': 11, 'december': 11,
  // Spanish
  'ene': 0, 'enero': 0, 'feb': 1, 'febrero': 1, 'mar': 2, 'marzo': 2,
  'abr': 3, 'abril': 3, 'mayo': 4, 'jun': 5, 'junio': 5,
  'jul': 6, 'julio': 6, 'ago': 7, 'agosto': 7, 'sep': 8, 'septiembre': 8,
  'oct': 9, 'octubre': 9, 'nov': 10, 'noviembre': 10, 'dic': 11, 'diciembre': 11,
  // French
  'janv': 0, 'janvier': 0, 'févr': 1, 'février': 1, 'mars': 2, 'avr': 3, 'avril': 3,
  'mai': 4, 'juin': 5, 'juil': 6, 'juillet': 6, 'août': 7, 'aoû': 7,
  'septembre': 8, 'octobre': 9, 'novembre': 10, 'déc': 11, 'décembre': 11,
  // Italian
  'gen': 0, 'gennaio': 0, 'feb': 1, 'febbraio': 1, 'mar': 2, 'marzo': 2,
  'apr': 3, 'aprile': 3, 'mag': 4, 'maggio': 4, 'giu': 5, 'giugno': 5,
  'lug': 6, 'luglio': 6, 'ago': 7, 'agosto': 7, 'set': 8, 'settembre': 8,
  'ott': 9, 'ottobre': 9, 'nov': 10, 'novembre': 10, 'dic': 11, 'dicembre': 11,
  // Portuguese
  'jan': 0, 'janeiro': 0, 'fev': 1, 'fevereiro': 1, 'mar': 2, 'março': 2,
  'abr': 3, 'abril': 3, 'mai': 4, 'maio': 4, 'jun': 5, 'junho': 5,
  'jul': 6, 'julho': 6, 'ago': 7, 'agosto': 7, 'set': 8, 'setembro': 8,
  'out': 9, 'outubro': 9, 'nov': 10, 'novembro': 10, 'dez': 11, 'dezembro': 11,
  // German
  'jan': 0, 'januar': 0, 'feb': 1, 'februar': 1, 'mär': 2, 'märz': 2,
  'apr': 3, 'mai': 4, 'jun': 5, 'juni': 5,
  'jul': 6, 'juli': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'oktober': 9,
  'nov': 10, 'dez': 11, 'dezember': 11,
}

function lookupMonth(str: string): number | undefined {
  return MONTH_NAMES[str.toLowerCase().replace(/[.]/g, '')]
}

function fixYear(y: number): number {
  if (y < 100) return y + 2000
  return y
}

function validDate(year: number, month: number, day: number): Date | null {
  if (month < 0 || month > 11 || day < 1 || day > 31) return null
  const d = new Date(year, month, day)
  // Verify the date didn't overflow (e.g., Feb 31 → Mar 3)
  if (d.getMonth() !== month) return null
  return d
}

/**
 * Parse ANY single date string into a Date object.
 * Tries all known formats in priority order.
 *
 * @param str - The date string
 * @param preferredFormat - Optional hint: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'SPANISH'
 * @returns Date or null
 */
export function parseAnyDate(str: string, preferredFormat?: string): Date | null {
  if (!str) return null
  const s = str.trim().replace(/\s+/g, ' ')
  if (!s) return null

  // Strip time portion if present (T15:00:00, T15:00:00Z, etc.)
  const withoutTime = s.replace(/T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/i, '')

  // 1. ISO: YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  const iso = withoutTime.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/)
  if (iso) {
    return validDate(parseInt(iso[1]), parseInt(iso[2]) - 1, parseInt(iso[3]))
  }

  // 2. Numeric: DD/MM/YYYY, MM/DD/YYYY, DD-MM-YYYY, DD.MM.YYYY (with 2 or 4 digit year)
  const numeric = withoutTime.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/)
  if (numeric) {
    const a = parseInt(numeric[1])
    const b = parseInt(numeric[2])
    const y = fixYear(parseInt(numeric[3]))

    if (preferredFormat === 'MM/DD/YYYY') {
      return validDate(y, a - 1, b)
    }
    if (preferredFormat === 'DD/MM/YYYY' || preferredFormat === 'DD-MM-YYYY') {
      return validDate(y, b - 1, a)
    }
    // Auto-detect: if first number > 12, it must be day (DD/MM)
    if (a > 12) return validDate(y, b - 1, a)
    // If second number > 12, it must be day (MM/DD)
    if (b > 12) return validDate(y, a - 1, b)
    // Ambiguous — default to DD/MM/YYYY (European, most common in Spanish market)
    return validDate(y, b - 1, a)
  }

  // 3. Day + Month name + Year: "4 Mar 2026", "4-Mar-2026", "4 marzo 2026", "04 March 2026"
  const dayMonthYear = withoutTime.match(/^(\d{1,2})[/\-.\s]+([A-Za-záéíóúàèìòùäëïöüâêîôûçñ]+)[/\-.,\s]+(\d{2,4})$/i)
  if (dayMonthYear) {
    const day = parseInt(dayMonthYear[1])
    const month = lookupMonth(dayMonthYear[2])
    const year = fixYear(parseInt(dayMonthYear[3]))
    if (month !== undefined) return validDate(year, month, day)
  }

  // 4. Month name + Day + Year: "Mar 4, 2026", "March 4, 2026", "Mar 4 2026"
  const monthDayYear = withoutTime.match(/^([A-Za-záéíóúàèìòùäëïöüâêîôûçñ]+)[.\s]+(\d{1,2})[,\s]+(\d{2,4})$/i)
  if (monthDayYear) {
    const month = lookupMonth(monthDayYear[1])
    const day = parseInt(monthDayYear[2])
    const year = fixYear(parseInt(monthDayYear[3]))
    if (month !== undefined) return validDate(year, month, day)
  }

  // 5. Day + Month name (no year — assume current year): "6Dic", "27Ene", "4 Mar", "4Mar"
  const dayMonth = withoutTime.match(/^(\d{1,2})\s*[-/.]?\s*([A-Za-záéíóúàèìòùäëïöüâêîôûçñ]+)$/i)
  if (dayMonth) {
    const day = parseInt(dayMonth[1])
    const month = lookupMonth(dayMonth[2])
    if (month !== undefined) return validDate(new Date().getFullYear(), month, day)
  }

  // 6. Month name + Day (no year): "Mar 4", "March 4"
  const monthDay = withoutTime.match(/^([A-Za-záéíóúàèìòùäëïöüâêîôûçñ]+)\s+(\d{1,2})$/i)
  if (monthDay) {
    const month = lookupMonth(monthDay[1])
    const day = parseInt(monthDay[2])
    if (month !== undefined) return validDate(new Date().getFullYear(), month, day)
  }

  // 7. Numeric without year: DD/MM or MM/DD (assume current year)
  const shortNumeric = withoutTime.match(/^(\d{1,2})[/\-.](\d{1,2})$/)
  if (shortNumeric) {
    const a = parseInt(shortNumeric[1])
    const b = parseInt(shortNumeric[2])
    const y = new Date().getFullYear()
    if (preferredFormat === 'MM/DD/YYYY') return validDate(y, a - 1, b)
    if (a > 12) return validDate(y, b - 1, a)
    if (b > 12) return validDate(y, a - 1, b)
    return validDate(y, b - 1, a) // Default DD/MM
  }

  // 8. Last resort: native Date.parse (handles many edge cases)
  const native = new Date(withoutTime)
  if (!isNaN(native.getTime()) && native.getFullYear() > 1990) return native

  return null
}

/**
 * Parse a date range string into checkIn and checkOut dates.
 * Supports: "4 Mar - 7 Mar", "04/03/2026 - 07/03/2026", "6Dic - 10Dic", etc.
 */
export function parseAnyDateRange(
  str: string,
  preferredFormat?: string
): { checkIn: Date; checkOut: Date } | null {
  if (!str) return null

  // Split by range separators: " - ", " – ", " a ", " al ", " to "
  // Require at least one space on each side to avoid splitting "4Mar"
  const parts = str.split(/\s+[-–]\s+|\s+a(?:l)?\s+|\s+to\s+/i)
  if (parts.length !== 2) return null

  const part1 = parts[0].trim()
  const part2 = parts[1].trim()
  if (!part1 || !part2) return null

  let checkIn = parseAnyDate(part1, preferredFormat)
  let checkOut = parseAnyDate(part2, preferredFormat)

  if (!checkIn || !checkOut) return null

  // Handle year rollover (Dec → Jan)
  if (checkOut < checkIn) {
    const nextYear = new Date(checkOut)
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    checkOut = nextYear
  }

  return { checkIn, checkOut }
}

// Re-export old names for backwards compatibility
export { parseAnyDate as tryParseSpanishDate }
export { parseAnyDateRange as parseDateRange }
