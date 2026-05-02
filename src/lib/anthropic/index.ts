/**
 * @module anthropic
 *
 * Singleton + helpers del SDK de Anthropic para AlexAI (PR4).
 * No usado en runtime aún — los endpoints existentes siguen con su propia
 * implementación. Cuando se decida migrar, ver el ejemplo del README.
 */

export { getAnthropicClient, __resetAnthropicClientForTests } from './client'

export {
  AnthropicMissingApiKeyError,
  classifyAnthropicError,
} from './errors'
export type { AnthropicErrorCategory } from './errors'

export { createCachedMessage, DEFAULT_ANTHROPIC_MODEL } from './messages'
export type { AlexAiMessageInput, AlexAiMessageResult } from './messages'
