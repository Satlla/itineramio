/**
 * Anthropic SDK singleton.
 *
 * Lazy-initializes el cliente la primera vez que se necesita. Valida
 * ANTHROPIC_API_KEY al construir; si falta, lanza AnthropicMissingApiKeyError
 * con mensaje claro en lugar de un fallo opaco del SDK.
 *
 * Razón del singleton: cada `new Anthropic()` crea su propio HTTP keep-alive
 * pool. En un servidor con muchas rutas que usan AlexAI conviene compartir
 * un único pool entre llamadas para amortizar conexiones y socket reuse.
 *
 * NO usado en runtime aún (PR4 — solo infraestructura). Las rutas existentes
 * (admin/blog/generate-ai, cron/generate-daily) NO se tocan en este PR; cuando
 * se decida migrarlas, basta con sustituir el `fetch(api.anthropic.com)` por
 * `getAnthropicClient().messages.create(...)`.
 */

import Anthropic from '@anthropic-ai/sdk'

import { AnthropicMissingApiKeyError } from './errors'

let cachedClient: Anthropic | null = null

/**
 * Devuelve el singleton del cliente Anthropic. Lazy-init.
 *
 * @throws {AnthropicMissingApiKeyError} si `ANTHROPIC_API_KEY` no está definida
 */
export function getAnthropicClient(): Anthropic {
  if (cachedClient) return cachedClient

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new AnthropicMissingApiKeyError(
      'ANTHROPIC_API_KEY is not set. Define it in .env (or Vercel env vars) before calling getAnthropicClient().'
    )
  }

  cachedClient = new Anthropic({ apiKey })
  return cachedClient
}

/**
 * Resetea el singleton. Solo para tests — no usar en producción.
 *
 * @internal
 */
export function __resetAnthropicClientForTests(): void {
  cachedClient = null
}
