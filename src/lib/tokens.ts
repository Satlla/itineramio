import crypto from 'crypto'

/**
 * Genera un token único y seguro para descarga de lead magnets
 */
export function generateDownloadToken(subscriberId: string, leadMagnetSlug: string): string {
  const payload = {
    subscriberId,
    leadMagnetSlug,
    timestamp: Date.now(),
    random: crypto.randomBytes(8).toString('hex')
  }

  // Crear token base64 del payload
  const token = Buffer.from(JSON.stringify(payload)).toString('base64url')

  return token
}

/**
 * Valida y decodifica un token de descarga
 */
export function validateDownloadToken(token: string): {
  valid: boolean
  subscriberId?: string
  leadMagnetSlug?: string
  error?: string
} {
  try {
    // Decodificar token
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const payload = JSON.parse(decoded)

    // Validar estructura
    if (!payload.subscriberId || !payload.leadMagnetSlug || !payload.timestamp) {
      return { valid: false, error: 'Token inválido' }
    }

    // Validar expiración (30 días)
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000
    const tokenAge = Date.now() - payload.timestamp

    if (tokenAge > thirtyDaysInMs) {
      return { valid: false, error: 'Token expirado' }
    }

    return {
      valid: true,
      subscriberId: payload.subscriberId,
      leadMagnetSlug: payload.leadMagnetSlug
    }
  } catch (error) {
    return { valid: false, error: 'Token malformado' }
  }
}

/**
 * Genera un token corto para URLs más limpias (alternativa)
 */
export function generateShortToken(): string {
  return crypto.randomBytes(16).toString('base64url')
}
