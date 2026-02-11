/**
 * Simple in-memory rate limiting utility
 * Suitable for single-server deployments
 *
 * For production with multiple servers, consider using Redis-based rate limiting
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

// Store rate limit records by key
const rateLimitStore = new Map<string, RateLimitRecord>()

// Cleanup old records periodically to prevent memory leaks
const CLEANUP_INTERVAL = 60 * 60 * 1000 // 1 hour
let lastCleanup = Date.now()

function cleanupExpiredRecords() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return

  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
  lastCleanup = now
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean
  /** Current request count */
  current: number
  /** Maximum allowed requests */
  limit: number
  /** Milliseconds until the rate limit resets */
  resetIn: number
  /** Number of remaining requests */
  remaining: number
}

/**
 * Check if a request is allowed under rate limiting rules
 *
 * @param key - Unique identifier for the rate limit (e.g., userId, IP, or endpoint+userId)
 * @param config - Rate limit configuration
 * @returns Rate limit result with status and metadata
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  cleanupExpiredRecords()

  const now = Date.now()
  const record = rateLimitStore.get(key)

  // No existing record or window expired - create new record
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    })

    return {
      allowed: true,
      current: 1,
      limit: config.maxRequests,
      resetIn: config.windowMs,
      remaining: config.maxRequests - 1
    }
  }

  // Check if limit exceeded
  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      current: record.count,
      limit: config.maxRequests,
      resetIn: record.resetTime - now,
      remaining: 0
    }
  }

  // Increment count
  record.count++

  return {
    allowed: true,
    current: record.count,
    limit: config.maxRequests,
    resetIn: record.resetTime - now,
    remaining: config.maxRequests - record.count
  }
}

/**
 * Create a rate limiter with pre-configured settings
 *
 * @param config - Rate limit configuration
 * @returns Function to check rate limit
 */
export function createRateLimiter(config: RateLimitConfig) {
  return (key: string) => checkRateLimit(key, config)
}

// Pre-configured rate limiters for common use cases

/** Rate limiter for checkout/payment operations: 10 requests per minute per user */
export const paymentRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000 // 1 minute
})

/** Rate limiter for coupon validation: 20 requests per minute per user */
export const couponRateLimiter = createRateLimiter({
  maxRequests: 20,
  windowMs: 60 * 1000 // 1 minute
})

/** Rate limiter for API endpoints: 100 requests per minute per user */
export const apiRateLimiter = createRateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000 // 1 minute
})

// ============================================
// Gestion module rate limiters
// ============================================

/** Rate limiter for gestion read operations: 60 requests per minute per user */
export const gestionReadRateLimiter = createRateLimiter({
  maxRequests: 60,
  windowMs: 60 * 1000 // 1 minute
})

/** Rate limiter for gestion write operations: 30 requests per minute per user */
export const gestionWriteRateLimiter = createRateLimiter({
  maxRequests: 30,
  windowMs: 60 * 1000 // 1 minute
})

/** Rate limiter for CSV import: 5 imports per hour per user */
export const gestionImportRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 60 * 60 * 1000 // 1 hour
})

/** Rate limiter for liquidation generation: 10 per hour per user */
export const gestionLiquidationRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 60 * 1000 // 1 hour
})

/** Rate limiter for PDF generation: 20 per hour per user */
export const gestionPdfRateLimiter = createRateLimiter({
  maxRequests: 20,
  windowMs: 60 * 60 * 1000 // 1 hour
})

/** Rate limiter for AI translation: 30 translations per hour per user */
export const translationRateLimiter = createRateLimiter({
  maxRequests: 30,
  windowMs: 60 * 60 * 1000 // 1 hour
})

/**
 * Get client identifier from request for rate limiting
 * Uses user ID if authenticated, falls back to IP address
 */
export function getRateLimitKey(
  request: Request,
  userId?: string | null,
  prefix?: string
): string {
  if (userId) {
    return prefix ? `${prefix}:user:${userId}` : `user:${userId}`
  }

  // Extract IP from headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown'

  return prefix ? `${prefix}:ip:${ip}` : `ip:${ip}`
}
