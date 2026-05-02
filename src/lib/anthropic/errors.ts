/**
 * Errores tipados con `code` discriminante para que el caller decida recovery
 * sin acoplarse al SDK ni al string del mensaje.
 *
 * Para errores HTTP del SDK (`Anthropic.AuthenticationError`, `RateLimitError`,
 * etc.), reusamos las clases del propio SDK — son `instanceof` chequeables.
 * Solo añadimos los errores propios (config faltante, etc.).
 */

import Anthropic from '@anthropic-ai/sdk'

/**
 * `ANTHROPIC_API_KEY` no está definida en el entorno.
 *
 * Recovery: configurar la env var. NO reintentar, NO degradar.
 */
export class AnthropicMissingApiKeyError extends Error {
  readonly code = 'ANTHROPIC_MISSING_API_KEY' as const

  constructor(message: string) {
    super(message)
    this.name = 'AnthropicMissingApiKeyError'
  }
}

/**
 * Helper de clasificación: ¿qué tipo de error nos devolvió el SDK?
 *
 * Devuelve un código discriminante que el caller puede usar en un switch
 * sin importar el SDK ni hacer `instanceof` para cada subclase.
 */
export type AnthropicErrorCategory =
  | 'missing_api_key'
  | 'auth'
  | 'rate_limit'
  | 'bad_request'
  | 'permission'
  | 'not_found'
  | 'overloaded'
  | 'server_error'
  | 'unknown'

export function classifyAnthropicError(err: unknown): AnthropicErrorCategory {
  if (err instanceof AnthropicMissingApiKeyError) return 'missing_api_key'
  if (err instanceof Anthropic.AuthenticationError) return 'auth'
  if (err instanceof Anthropic.RateLimitError) return 'rate_limit'
  if (err instanceof Anthropic.PermissionDeniedError) return 'permission'
  if (err instanceof Anthropic.NotFoundError) return 'not_found'
  if (err instanceof Anthropic.BadRequestError) return 'bad_request'
  if (err instanceof Anthropic.InternalServerError) return 'server_error'
  if (err instanceof Anthropic.APIError) {
    if (err.status === 529) return 'overloaded'
    return 'server_error'
  }
  return 'unknown'
}
