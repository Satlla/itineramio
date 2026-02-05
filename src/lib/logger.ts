/**
 * Conditional logger that only outputs in development
 * Use this instead of console.log to avoid exposing sensitive data in production
 */

const isDev = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args)
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args)
  },
  warn: (...args: unknown[]) => {
    // Warnings are useful in production too
    console.warn(...args)
  },
  error: (...args: unknown[]) => {
    // Errors should always be logged
    console.error(...args)
  },
  debug: (...args: unknown[]) => {
    if (isDev) console.debug(...args)
  },
}

// For backwards compatibility - can be used as drop-in replacement
export default logger
