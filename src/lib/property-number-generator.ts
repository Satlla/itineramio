/**
 * Sistema de Numeración Unificado para Itineramio
 *
 * PROPIEDADES: ITN-XXXXX (secuencial, 5 dígitos)
 *   Ejemplo: ITN-00001, ITN-00547, ITN-43221
 *
 * SUSCRIPCIONES: SUB-XXXXX (secuencial, 5 dígitos)
 *   Ejemplo: SUB-00001, SUB-00234, SUB-12345
 *
 * PAGOS: PAY-XXXXXX (aleatorio, 6 caracteres alfanuméricos)
 *   Ejemplo: PAY-A1B2C3, PAY-9X4K2L
 */

/**
 * Genera un código alfanumérico aleatorio de 6 caracteres
 * Solo usa caracteres fáciles de leer (sin O/0, I/1 para evitar confusión)
 */
function generateRandomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // Sin O, I, 0, 1
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Genera una referencia única para pagos (Bizum/Transferencia)
 * Formato: PAY-XXXXXX (6 caracteres aleatorios)
 * Ejemplo: PAY-A1B2C3, PAY-9X4K2L
 */
export function generatePaymentReference(): string {
  return `PAY-${generateRandomCode()}`
}

/**
 * Genera un número de referencia para propiedades
 * Formato: ITN-XXXXX (5 dígitos secuenciales)
 * Ejemplo: ITN-00001, ITN-00547
 *
 * @param lastNumber - Último número usado (se incrementará en 1)
 */
export function generatePropertyNumber(lastNumber: number = 0): string {
  const nextNumber = lastNumber + 1
  const paddedNumber = String(nextNumber).padStart(5, '0')
  return `ITN-${paddedNumber}`
}

/**
 * Genera un número de referencia para suscripciones
 * Formato: SUB-XXXXX (5 dígitos secuenciales)
 * Ejemplo: SUB-00001, SUB-00234
 *
 * @param lastNumber - Último número usado (se incrementará en 1)
 */
export function generateSubscriptionNumber(lastNumber: number = 0): string {
  const nextNumber = lastNumber + 1
  const paddedNumber = String(nextNumber).padStart(5, '0')
  return `SUB-${paddedNumber}`
}

/**
 * Valida que una referencia tenga el formato correcto
 * @param reference - Referencia a validar (ITN-XXXXX, SUB-XXXXX, o PAY-XXXXXX)
 */
export function isValidReference(reference: string): boolean {
  const patterns = {
    property: /^ITN-\d{5}$/,          // ITN-00001
    subscription: /^SUB-\d{5}$/,      // SUB-00234
    payment: /^PAY-[2-9A-HJ-NP-Z]{6}$/ // PAY-A1B2C3
  }

  return patterns.property.test(reference) ||
         patterns.subscription.test(reference) ||
         patterns.payment.test(reference)
}

/**
 * Extrae el número de una referencia
 * @param reference - Referencia (ITN-XXXXX o SUB-XXXXX)
 * @returns El número extraído o null si no es válida
 */
export function extractNumberFromReference(reference: string): number | null {
  if (!reference) return null

  const match = reference.match(/^(ITN|SUB)-(\d{5})$/)
  if (!match) return null

  return parseInt(match[2], 10)
}

/**
 * Obtiene el tipo de referencia
 * @param reference - Referencia a analizar
 * @returns 'property', 'subscription', 'payment', o null si es inválida
 */
export function getReferenceType(reference: string): 'property' | 'subscription' | 'payment' | null {
  if (/^ITN-\d{5}$/.test(reference)) return 'property'
  if (/^SUB-\d{5}$/.test(reference)) return 'subscription'
  if (/^PAY-[2-9A-HJ-NP-Z]{6}$/.test(reference)) return 'payment'
  return null
}

// Backwards compatibility
export const generatePropertyReference = generatePropertyNumber
