import { NextResponse } from 'next/server'
import logger from './logger'

/**
 * Standard error handler for API routes.
 * Logs the real error server-side and returns a safe message to the client.
 *
 * Usage in catch blocks:
 *   } catch (error) {
 *     return apiError(error, 'invoice-issue', 'Error al emitir la factura')
 *   }
 */
export function apiError(
  error: unknown,
  context: string,
  userMessage = 'Error interno del servidor',
  status = 500
) {
  // Log the real error server-side with context
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined

  logger.error(`[API ERROR] ${context}:`, errorMessage)
  if (errorStack) {
    logger.error(`[API STACK] ${context}:`, errorStack)
  }

  // Return safe message to client
  return NextResponse.json(
    { error: userMessage, _context: context },
    { status }
  )
}
