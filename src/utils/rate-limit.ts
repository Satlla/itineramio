/**
 * Rate Limiting System
 * Tracks requests by IP address and enforces limits
 */

// In-memory storage (para producción usar Redis o DB)
const requestCounts = new Map<string, { count: number; resetAt: number }>()

interface RateLimitConfig {
  maxRequests: number
  windowMs: number  // Ventana de tiempo en milisegundos
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  error?: string
}

/**
 * Extrae la IP del request de Next.js
 */
export function getClientIP(headers: Headers): string {
  // Intenta obtener IP de headers comunes (Vercel, Cloudflare, etc.)
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback (no debería llegar aquí en producción)
  return 'unknown'
}

/**
 * Verifica si una IP ha excedido el límite de requests
 */
export function checkRateLimit(
  identifier: string,  // Puede ser IP o email
  config: RateLimitConfig = {
    maxRequests: 3,
    windowMs: 24 * 60 * 60 * 1000  // 24 horas por defecto
  }
): RateLimitResult {
  const now = Date.now()
  const record = requestCounts.get(identifier)

  // Si no hay registro o el tiempo expiró, crear nuevo
  if (!record || now > record.resetAt) {
    const resetAt = now + config.windowMs
    requestCounts.set(identifier, {
      count: 1,
      resetAt
    })

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt
    }
  }

  // Si ya excedió el límite
  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
      error: 'Has alcanzado el límite de cálculos gratuitos. Por favor, proporciona tu email para continuar.'
    }
  }

  // Incrementar contador
  record.count++
  requestCounts.set(identifier, record)

  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetAt: record.resetAt
  }
}

/**
 * Limpia registros expirados (llamar periódicamente)
 */
export function cleanupExpiredRecords(): void {
  const now = Date.now()
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetAt) {
      requestCounts.delete(key)
    }
  }
}

/**
 * Rate limit específico para cálculos sin email
 */
export function checkCalculationRateLimit(ip: string): RateLimitResult {
  return checkRateLimit(ip, {
    maxRequests: 3,  // 3 cálculos gratis
    windowMs: 24 * 60 * 60 * 1000  // 24 horas
  })
}

/**
 * Rate limit para cálculos con email validado
 */
export function checkEmailRateLimit(email: string): RateLimitResult {
  return checkRateLimit(`email:${email}`, {
    maxRequests: 10,  // 10 cálculos con email
    windowMs: 24 * 60 * 60 * 1000  // 24 horas
  })
}

/**
 * Obtiene información del rate limit actual sin incrementar
 */
export function getRateLimitInfo(identifier: string): RateLimitResult {
  const record = requestCounts.get(identifier)
  const now = Date.now()

  if (!record || now > record.resetAt) {
    return {
      allowed: true,
      remaining: 3,  // Default max
      resetAt: now + (24 * 60 * 60 * 1000)
    }
  }

  return {
    allowed: record.count < 3,
    remaining: Math.max(0, 3 - record.count),
    resetAt: record.resetAt
  }
}

/**
 * Resetea el contador para una IP/email específico
 * (útil para testing o casos especiales)
 */
export function resetRateLimit(identifier: string): void {
  requestCounts.delete(identifier)
}

// Cleanup automático cada hora
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredRecords, 60 * 60 * 1000)
}
