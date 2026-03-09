/**
 * Rate limiting utility — soporta dos modos:
 *
 * 1. Upstash Redis (producción/serverless): Se activa cuando están configuradas
 *    las variables UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN.
 *    Usa sliding window distribuido — funciona correctamente en Vercel con
 *    múltiples instancias simultáneas.
 *
 * 2. In-memory fallback (desarrollo/single-server): Se usa cuando no hay Redis
 *    configurado. NO es fiable en serverless (cada invocación es nueva instancia).
 */

// ============================================
// Tipos públicos (sin cambios de interfaz)
// ============================================

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  current: number
  limit: number
  resetIn: number
  remaining: number
}

// ============================================
// In-memory fallback
// ============================================

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitRecord>()
const CLEANUP_INTERVAL = 60 * 60 * 1000
let lastCleanup = Date.now()

function cleanupExpiredRecords() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) rateLimitStore.delete(key)
  }
  lastCleanup = now
}

function checkRateLimitInMemory(key: string, config: RateLimitConfig): RateLimitResult {
  cleanupExpiredRecords()
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs })
    return { allowed: true, current: 1, limit: config.maxRequests, resetIn: config.windowMs, remaining: config.maxRequests - 1 }
  }

  if (record.count >= config.maxRequests) {
    return { allowed: false, current: record.count, limit: config.maxRequests, resetIn: record.resetTime - now, remaining: 0 }
  }

  record.count++
  return { allowed: true, current: record.count, limit: config.maxRequests, resetIn: record.resetTime - now, remaining: config.maxRequests - record.count }
}

// ============================================
// Upstash Redis (distributed, serverless-safe)
// ============================================

let upstashRatelimit: any = null
let upstashRedis: any = null

function getUpstashClient() {
  if (upstashRedis) return upstashRedis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  try {
    // Dynamic require to avoid breaking if package not installed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Redis } = require('@upstash/redis')
    upstashRedis = new Redis({ url, token })
    return upstashRedis
  } catch {
    return null
  }
}

async function checkRateLimitUpstash(key: string, config: RateLimitConfig): Promise<RateLimitResult | null> {
  const redis = getUpstashClient()
  if (!redis) return null

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Ratelimit } = require('@upstash/ratelimit')
    if (!upstashRatelimit) {
      upstashRatelimit = new Map()
    }

    const cacheKey = `${config.maxRequests}:${config.windowMs}`
    if (!upstashRatelimit.has(cacheKey)) {
      upstashRatelimit.set(cacheKey, new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.maxRequests, `${config.windowMs} ms`),
        analytics: false,
      }))
    }

    const limiter = upstashRatelimit.get(cacheKey)
    const result = await limiter.limit(key)

    return {
      allowed: result.success,
      current: config.maxRequests - result.remaining,
      limit: result.limit,
      resetIn: result.reset - Date.now(),
      remaining: result.remaining,
    }
  } catch {
    // Redis error — degrade gracefully to in-memory
    return null
  }
}

// ============================================
// API pública — compatible con código existente
// ============================================

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  // Sync fallback: in-memory (se usa cuando no hay Redis)
  return checkRateLimitInMemory(key, config)
}

/**
 * Versión async — usa Redis si está configurado, in-memory si no.
 * Preferir esta función en rutas nuevas.
 */
export async function checkRateLimitAsync(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  const upstashResult = await checkRateLimitUpstash(key, config)
  if (upstashResult) return upstashResult
  return checkRateLimitInMemory(key, config)
}

export function createRateLimiter(config: RateLimitConfig) {
  return (key: string) => checkRateLimit(key, config)
}

export function createRateLimiterAsync(config: RateLimitConfig) {
  return (key: string) => checkRateLimitAsync(key, config)
}

// ============================================
// Pre-configured rate limiters (sin cambios)
// ============================================

export const paymentRateLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60 * 1000 })
export const couponRateLimiter = createRateLimiter({ maxRequests: 20, windowMs: 60 * 1000 })
export const apiRateLimiter = createRateLimiter({ maxRequests: 100, windowMs: 60 * 1000 })
export const gestionReadRateLimiter = createRateLimiter({ maxRequests: 60, windowMs: 60 * 1000 })
export const gestionWriteRateLimiter = createRateLimiter({ maxRequests: 30, windowMs: 60 * 1000 })
export const gestionImportRateLimiter = createRateLimiter({ maxRequests: 5, windowMs: 60 * 60 * 1000 })
export const gestionLiquidationRateLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60 * 60 * 1000 })
export const gestionPdfRateLimiter = createRateLimiter({ maxRequests: 20, windowMs: 60 * 60 * 1000 })
export const translationRateLimiter = createRateLimiter({ maxRequests: 30, windowMs: 60 * 60 * 1000 })
export const publicApiRateLimiter = createRateLimiter({ maxRequests: 60, windowMs: 60 * 1000 })
export const webhookRateLimiter = createRateLimiter({ maxRequests: 30, windowMs: 60 * 1000 })

// Async versions — recomendadas para rutas nuevas
export const paymentRateLimiterAsync = createRateLimiterAsync({ maxRequests: 10, windowMs: 60 * 1000 })
export const gestionImportRateLimiterAsync = createRateLimiterAsync({ maxRequests: 5, windowMs: 60 * 60 * 1000 })
export const gestionLiquidationRateLimiterAsync = createRateLimiterAsync({ maxRequests: 10, windowMs: 60 * 60 * 1000 })

export function getRateLimitKey(request: Request, userId?: string | null, prefix?: string): string {
  if (userId) {
    return prefix ? `${prefix}:user:${userId}` : `user:${userId}`
  }
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown'
  return prefix ? `${prefix}:ip:${ip}` : `ip:${ip}`
}
