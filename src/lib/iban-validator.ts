/**
 * IBAN Validator
 * Validates International Bank Account Numbers
 */

/**
 * Clean IBAN by removing spaces and converting to uppercase
 */
export function cleanIBAN(iban: string): string {
  return iban.replace(/\s/g, '').toUpperCase()
}

/**
 * Format IBAN with spaces every 4 characters
 */
export function formatIBAN(iban: string): string {
  const clean = cleanIBAN(iban)
  return clean.replace(/(.{4})/g, '$1 ').trim()
}

/**
 * Validate IBAN checksum using MOD 97-10 algorithm
 */
export function validateIBAN(iban: string): { valid: boolean; error?: string } {
  const clean = cleanIBAN(iban)

  // Check minimum length
  if (clean.length < 15) {
    return { valid: false, error: 'IBAN demasiado corto' }
  }

  // Check maximum length
  if (clean.length > 34) {
    return { valid: false, error: 'IBAN demasiado largo' }
  }

  // Check format: 2 letters + 2 digits + alphanumeric
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(clean)) {
    return { valid: false, error: 'Formato de IBAN inválido' }
  }

  // Country-specific length validation
  const countryLengths: Record<string, number> = {
    ES: 24, // Spain
    DE: 22, // Germany
    FR: 27, // France
    IT: 27, // Italy
    PT: 25, // Portugal
    GB: 22, // UK
    NL: 18, // Netherlands
    BE: 16, // Belgium
    AT: 20, // Austria
    CH: 21, // Switzerland
    AD: 24, // Andorra
  }

  const country = clean.substring(0, 2)
  if (countryLengths[country] && clean.length !== countryLengths[country]) {
    return {
      valid: false,
      error: `IBAN de ${country} debe tener ${countryLengths[country]} caracteres`
    }
  }

  // Spanish IBAN validation (ES + 22 digits)
  if (country === 'ES') {
    if (!/^ES[0-9]{22}$/.test(clean)) {
      return { valid: false, error: 'IBAN español debe tener ES + 22 dígitos' }
    }
  }

  // MOD 97-10 checksum validation
  // Move first 4 characters to the end
  const rearranged = clean.substring(4) + clean.substring(0, 4)

  // Convert letters to numbers (A=10, B=11, ..., Z=35)
  let numericString = ''
  for (const char of rearranged) {
    if (/[A-Z]/.test(char)) {
      numericString += (char.charCodeAt(0) - 55).toString()
    } else {
      numericString += char
    }
  }

  // Calculate MOD 97 using string division for large numbers
  const remainder = mod97(numericString)

  if (remainder !== 1) {
    return { valid: false, error: 'Dígito de control inválido' }
  }

  return { valid: true }
}

/**
 * Calculate MOD 97 for a large number represented as string
 */
function mod97(numStr: string): number {
  let checksum = 0

  for (let i = 0; i < numStr.length; i++) {
    checksum = (checksum * 10 + parseInt(numStr[i], 10)) % 97
  }

  return checksum
}

/**
 * Extract bank info from Spanish IBAN
 */
export function extractSpanishIBANInfo(iban: string): {
  bankCode: string
  branchCode: string
  controlDigits: string
  accountNumber: string
} | null {
  const clean = cleanIBAN(iban)

  if (!/^ES[0-9]{22}$/.test(clean)) {
    return null
  }

  return {
    bankCode: clean.substring(4, 8),
    branchCode: clean.substring(8, 12),
    controlDigits: clean.substring(12, 14),
    accountNumber: clean.substring(14, 24)
  }
}

/**
 * Validate IBAN and return formatted version if valid
 */
export function validateAndFormatIBAN(iban: string): {
  valid: boolean
  formatted?: string
  error?: string
} {
  const result = validateIBAN(iban)

  if (result.valid) {
    return {
      valid: true,
      formatted: formatIBAN(iban)
    }
  }

  return result
}
