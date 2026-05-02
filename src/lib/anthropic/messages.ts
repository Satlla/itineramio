/**
 * Helper para crear mensajes con prompt caching configurado.
 *
 * Cache strategy (ver shared/prompt-caching.md de la skill claude-api):
 *   1. Render order del API: tools → system → messages
 *   2. Marker de cache en el ÚLTIMO bloque del system → cachea todo system + tools
 *   3. Marker de cache en el bloque de contexto del manual (que va como user
 *      message previo al mensaje del huésped) → cachea ese contexto cuando
 *      hay varias preguntas seguidas sobre la misma propiedad
 *   4. La pregunta del huésped va al final, sin marker → no contamina el cache
 *
 * Invariante crítica: el system prompt y el contexto deben ser DETERMINISTAS.
 * No interpolar Date.now(), UUIDs ni nada que cambie request a request — eso
 * invalida el cache silenciosamente y `cache_read_input_tokens` queda en 0.
 *
 * Default model: Sonnet 4.6 (claude-sonnet-4-6) — best speed/intelligence
 * balance para responder a huéspedes con baja latencia y coste razonable.
 *
 * Adaptive thinking habilitado por default — el modelo decide cuándo y cuánto
 * pensar. Para casos de baja latencia se puede desactivar pasando
 * `thinking: 'disabled'`.
 */

import type Anthropic from '@anthropic-ai/sdk'

import { getAnthropicClient } from './client'

export const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-6'

export interface AlexAiMessageInput {
  /**
   * System prompt completo y FROZEN (no interpolar variables que cambien por
   * request). Cacheado vía `cache_control: ephemeral`.
   */
  systemPrompt: string

  /**
   * Contexto de la propiedad (manual, zonas relevantes, info host, etc.)
   * — texto grande estable para una conversación. Cacheado.
   *
   * Si es muy corto (<2048 tokens en Sonnet), el cache no se aplicará pero
   * el código sigue funcionando. Ver shared/prompt-caching.md.
   */
  propertyContext: string

  /**
   * Mensaje del huésped. NO se cachea — cambia por request.
   */
  guestMessage: string

  /**
   * Historial previo de la conversación (opcional). Va antes del mensaje
   * actual del huésped, después del contexto cacheado. Cada mensaje es un
   * `MessageParam` estándar del SDK.
   */
  conversationHistory?: Anthropic.MessageParam[]

  /**
   * Modelo a usar. Default: claude-sonnet-4-6.
   */
  model?: string

  /**
   * Tokens máximos de respuesta. Default 4096 (respuestas a huéspedes son
   * cortas; subir si se espera generar contenido largo).
   */
  maxTokens?: number

  /**
   * Adaptive thinking. Default `'disabled'` para minimizar latencia en
   * respuestas a huéspedes (la mayoría son preguntas simples). Pasar
   * `'adaptive'` para casos complejos donde el modelo debe razonar antes
   * de contestar (ej. resolver disputas, escalar a humano con reasoning).
   *
   * Nota: en Sonnet 4.6 adaptive es la forma correcta — `budget_tokens` está
   * deprecado en 4.6 y removido en Opus 4.7.
   */
  thinking?: 'adaptive' | 'disabled'

  /**
   * TTL del cache. Default `'5m'` (cache_control ephemeral default).
   * Usar `'1h'` para conversaciones largas con la misma propiedad — paga 2x
   * en escritura pero amortiza si hay >3 lecturas en la hora.
   */
  cacheTtl?: '5m' | '1h'
}

export interface AlexAiMessageResult {
  /** Texto plano concatenado de todos los bloques `text` de la respuesta. */
  text: string

  /** Razón de parada del modelo. `'end_turn'` es el caso normal. */
  stopReason: Anthropic.Message['stop_reason']

  /**
   * Métricas de uso. `cacheReadInputTokens > 0` confirma que el cache
   * funcionó (cuesta ~10% del precio normal de input).
   */
  usage: {
    inputTokens: number
    outputTokens: number
    cacheCreationInputTokens: number
    cacheReadInputTokens: number
  }

  /** Mensaje completo del SDK por si el caller necesita más detalle. */
  raw: Anthropic.Message
}

/**
 * Crea un mensaje a Claude con prompt caching configurado para AlexAI.
 *
 * @example
 * ```typescript
 * const res = await createCachedMessage({
 *   systemPrompt: ALEXAI_SYSTEM_PROMPT,         // estable
 *   propertyContext: buildPropertyContext(prop), // estable durante la conversación
 *   guestMessage: '¿A qué hora es el check-in?',
 * })
 * console.log(res.text)
 * ```
 */
export async function createCachedMessage(
  input: AlexAiMessageInput
): Promise<AlexAiMessageResult> {
  const client = getAnthropicClient()

  const model = input.model ?? DEFAULT_ANTHROPIC_MODEL
  const maxTokens = input.maxTokens ?? 4096
  const ttl = input.cacheTtl ?? '5m'

  const cacheControl: Anthropic.CacheControlEphemeral =
    ttl === '1h' ? { type: 'ephemeral', ttl: '1h' } : { type: 'ephemeral' }

  // System prompt como bloque cacheado (cachea también tools si las hubiera).
  const system: Anthropic.TextBlockParam[] = [
    {
      type: 'text',
      text: input.systemPrompt,
      cache_control: cacheControl,
    },
  ]

  // Mensajes: contexto cacheado → historial (si hay) → mensaje actual del huésped.
  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: input.propertyContext,
          cache_control: cacheControl,
        },
      ],
    },
    ...(input.conversationHistory ?? []),
    {
      role: 'user',
      content: input.guestMessage,
    },
  ]

  const requestParams: Anthropic.MessageCreateParamsNonStreaming = {
    model,
    max_tokens: maxTokens,
    system,
    messages,
  }

  if (input.thinking === 'adaptive') {
    // Cast porque algunos tipos de SDK aún no incluyen 'adaptive' aunque la
    // API ya lo acepta en Sonnet 4.6+. Reemplazar cuando los tipos del SDK
    // se actualicen.
    requestParams.thinking = { type: 'adaptive' } as Anthropic.ThinkingConfigParam
  }

  const response = await client.messages.create(requestParams)

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map(block => block.text)
    .join('')

  return {
    text,
    stopReason: response.stop_reason,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cacheCreationInputTokens: response.usage.cache_creation_input_tokens ?? 0,
      cacheReadInputTokens: response.usage.cache_read_input_tokens ?? 0,
    },
    raw: response,
  }
}
