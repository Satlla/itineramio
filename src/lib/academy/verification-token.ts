import crypto from 'crypto'

/**
 * Genera un token seguro para verificación de email
 * @returns Token único de 32 bytes en formato hexadecimal
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Calcula la fecha de expiración del token (24 horas desde ahora)
 * @returns Fecha de expiración
 */
export function getTokenExpiration(): Date {
  const expiration = new Date()
  expiration.setHours(expiration.getHours() + 24) // 24 horas
  return expiration
}

/**
 * Verifica si un token ha expirado
 * @param expiresAt Fecha de expiración del token
 * @returns true si el token ha expirado, false si aún es válido
 */
export function isTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true
  return new Date() > expiresAt
}
