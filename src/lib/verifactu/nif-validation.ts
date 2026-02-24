/**
 * Spanish NIF/CIF/NIE Validation
 * Required for VeriFactu compliance — all invoices must have valid tax IDs.
 */

const NIF_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE'

/**
 * Validates a Spanish NIF (Número de Identificación Fiscal) for individuals.
 * Format: 8 digits + 1 letter (e.g. 12345678Z)
 */
export function validateNIF(nif: string): boolean {
  if (!nif) return false
  const cleaned = nif.toUpperCase().replace(/[\s.-]/g, '')

  const match = cleaned.match(/^(\d{8})([A-Z])$/)
  if (!match) return false

  const number = parseInt(match[1], 10)
  const letter = match[2]
  const expectedLetter = NIF_LETTERS[number % 23]

  return letter === expectedLetter
}

/**
 * Validates a Spanish NIE (Número de Identidad de Extranjero).
 * Format: X/Y/Z + 7 digits + 1 letter
 */
export function validateNIE(nie: string): boolean {
  if (!nie) return false
  const cleaned = nie.toUpperCase().replace(/[\s.-]/g, '')

  const match = cleaned.match(/^([XYZ])(\d{7})([A-Z])$/)
  if (!match) return false

  const prefix = match[1]
  const digits = match[2]
  const letter = match[3]

  // Replace X=0, Y=1, Z=2
  const prefixMap: Record<string, string> = { X: '0', Y: '1', Z: '2' }
  const fullNumber = parseInt(prefixMap[prefix] + digits, 10)
  const expectedLetter = NIF_LETTERS[fullNumber % 23]

  return letter === expectedLetter
}

/**
 * Validates a Spanish CIF (Código de Identificación Fiscal) for companies.
 * Format: 1 letter + 7 digits + 1 control char (digit or letter)
 */
export function validateCIF(cif: string): boolean {
  if (!cif) return false
  const cleaned = cif.toUpperCase().replace(/[\s.-]/g, '')

  const match = cleaned.match(/^([ABCDEFGHJKLMNPQRSUVW])(\d{7})([A-J0-9])$/)
  if (!match) return false

  const societyLetter = match[1]
  const digits = match[2]
  const control = match[3]

  // Calculate control digit
  let sumEven = 0
  let sumOdd = 0

  for (let i = 0; i < 7; i++) {
    const digit = parseInt(digits[i], 10)
    if (i % 2 === 0) {
      // Odd positions (1-indexed): multiply by 2
      const doubled = digit * 2
      sumOdd += doubled > 9 ? doubled - 9 : doubled
    } else {
      // Even positions (1-indexed): sum directly
      sumEven += digit
    }
  }

  const totalSum = sumOdd + sumEven
  const controlDigit = (10 - (totalSum % 10)) % 10

  // Some society types use letter, others use digit
  const letterControlTypes = 'KLMNPQRSW'
  const digitControlTypes = 'ABEH'

  if (letterControlTypes.includes(societyLetter)) {
    // Control must be a letter (A=0, B=1, ..., J=9)
    const expectedLetter = String.fromCharCode(65 + controlDigit) // A=65
    return control === expectedLetter
  } else if (digitControlTypes.includes(societyLetter)) {
    // Control must be a digit
    return control === String(controlDigit)
  } else {
    // Either format is valid
    const expectedLetter = String.fromCharCode(65 + controlDigit)
    return control === String(controlDigit) || control === expectedLetter
  }
}

/**
 * Validates any Spanish tax identifier (NIF, NIE, or CIF).
 * Returns the type and whether it's valid.
 */
export function validateTaxId(taxId: string): {
  valid: boolean
  type: 'NIF' | 'NIE' | 'CIF' | 'UNKNOWN'
} {
  if (!taxId) return { valid: false, type: 'UNKNOWN' }
  const cleaned = taxId.toUpperCase().replace(/[\s.-]/g, '')

  // CIF starts with a letter from the CIF alphabet
  if (/^[ABCDEFGHJKLMNPQRSUVW]/.test(cleaned)) {
    return { valid: validateCIF(cleaned), type: 'CIF' }
  }

  // NIE starts with X, Y, or Z
  if (/^[XYZ]/.test(cleaned)) {
    return { valid: validateNIE(cleaned), type: 'NIE' }
  }

  // NIF starts with a digit
  if (/^\d/.test(cleaned)) {
    return { valid: validateNIF(cleaned), type: 'NIF' }
  }

  return { valid: false, type: 'UNKNOWN' }
}

/**
 * Normalizes a tax ID by removing spaces, dots, and hyphens, and uppercasing.
 */
export function normalizeTaxId(taxId: string): string {
  return taxId.toUpperCase().replace(/[\s.-]/g, '')
}
