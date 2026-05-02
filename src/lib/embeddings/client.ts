/**
 * Embedding client — abstraction over the embedding provider.
 *
 * Current provider: OpenAI text-embedding-3-small (1536 dim).
 * Implementation uses native fetch to avoid adding the openai SDK as a
 * dependency. Switching providers requires:
 *   1. Updating EMBEDDING_MODEL constant.
 *   2. Updating ZoneEmbedding.embedding column type if dimensions change.
 *   3. Regenerating all existing embeddings (the model field on each row
 *      lets us know which were generated with the old provider).
 *
 * This file is intentionally thin: keep provider logic isolated for easy swap.
 */

export const EMBEDDING_MODEL = 'text-embedding-3-small'
export const EMBEDDING_DIMENSIONS = 1536

const OPENAI_EMBEDDINGS_URL = 'https://api.openai.com/v1/embeddings'

interface OpenAIEmbeddingResponse {
  data: Array<{ embedding: number[]; index: number }>
  model: string
  usage: { prompt_tokens: number; total_tokens: number }
}

interface OpenAIErrorResponse {
  error?: { message?: string; type?: string; code?: string }
}

function getApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is required for embeddings. Set it in .env.local and Vercel.',
    )
  }
  return apiKey
}

async function callOpenAIEmbeddings(input: string | string[]): Promise<number[][]> {
  const response = await fetch(OPENAI_EMBEDDINGS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  })

  if (!response.ok) {
    let detail = `OpenAI embeddings API ${response.status}`
    try {
      const body = (await response.json()) as OpenAIErrorResponse
      if (body.error?.message) detail += `: ${body.error.message}`
    } catch {
      // Ignore JSON parse errors — keep status code only
    }
    throw new Error(detail)
  }

  const json = (await response.json()) as OpenAIEmbeddingResponse
  if (!json.data || json.data.length === 0) {
    throw new Error('OpenAI embeddings API returned empty data')
  }

  // Sort by index to preserve input order
  const sorted = [...json.data].sort((a, b) => a.index - b.index)
  return sorted.map(d => {
    if (!d.embedding || d.embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Unexpected embedding dimensions: got ${d.embedding?.length}, expected ${EMBEDDING_DIMENSIONS}`,
      )
    }
    return d.embedding
  })
}

/**
 * Generate an embedding vector for the given text.
 * Throws if the API call fails — caller decides whether to retry or fall back.
 */
export async function embedText(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('embedText: input text cannot be empty')
  }

  // OpenAI accepts up to 8191 tokens; truncate aggressively for safety.
  // Roughly 4 chars per token → keep under 30000 chars to leave headroom.
  const trimmed = text.length > 30000 ? text.slice(0, 30000) : text

  const vectors = await callOpenAIEmbeddings(trimmed)
  return vectors[0]
}

/**
 * Batch embedding for multiple texts in a single API call.
 * More efficient when generating embeddings for many zones at once.
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []

  const trimmed = texts.map(t => (t.length > 30000 ? t.slice(0, 30000) : t))
  return callOpenAIEmbeddings(trimmed)
}
