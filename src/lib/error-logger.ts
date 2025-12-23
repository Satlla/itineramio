/**
 * Consistent error logging helper
 *
 * Usage:
 *   import { logError } from '@/lib/error-logger'
 *
 *   try {
 *     // code
 *   } catch (error) {
 *     logError('auth', 'login failed', error, { userId: '123' })
 *   }
 */

interface ErrorContext {
  [key: string]: unknown
}

export function logError(
  module: string,
  message: string,
  error: unknown,
  context?: ErrorContext
): void {
  const timestamp = new Date().toISOString()
  const errorDetails = error instanceof Error
    ? { name: error.name, message: error.message, stack: error.stack }
    : { raw: String(error) }

  console.error(JSON.stringify({
    timestamp,
    level: 'error',
    module,
    message,
    error: errorDetails,
    ...(context && { context })
  }))
}

export function logWarn(
  module: string,
  message: string,
  context?: ErrorContext
): void {
  const timestamp = new Date().toISOString()

  console.warn(JSON.stringify({
    timestamp,
    level: 'warn',
    module,
    message,
    ...(context && { context })
  }))
}

export function logInfo(
  module: string,
  message: string,
  context?: ErrorContext
): void {
  // Only log in development or when DEBUG is enabled
  if (process.env.NODE_ENV !== 'development' && !process.env.DEBUG) {
    return
  }

  const timestamp = new Date().toISOString()

  console.log(JSON.stringify({
    timestamp,
    level: 'info',
    module,
    message,
    ...(context && { context })
  }))
}
