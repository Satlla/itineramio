/**
 * Tests for client.ts — mocks fetch to avoid hitting OpenAI.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { embedText, embedBatch, EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from '../../../src/lib/embeddings/client'

const ORIGINAL_FETCH = globalThis.fetch
const ORIGINAL_KEY = process.env.OPENAI_API_KEY

function mockFetchOnce(response: { ok: boolean; status?: number; json: () => unknown }) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status ?? 200,
    json: async () => response.json(),
  }) as unknown as typeof fetch
}

function makeFakeVector(dims = EMBEDDING_DIMENSIONS): number[] {
  return Array.from({ length: dims }, (_, i) => Math.sin(i))
}

beforeEach(() => {
  process.env.OPENAI_API_KEY = 'sk-test-fake-key'
})

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH
  if (ORIGINAL_KEY === undefined) delete process.env.OPENAI_API_KEY
  else process.env.OPENAI_API_KEY = ORIGINAL_KEY
  vi.restoreAllMocks()
})

describe('embedText', () => {
  it('throws if input is empty', async () => {
    await expect(embedText('')).rejects.toThrow('input text cannot be empty')
    await expect(embedText('   ')).rejects.toThrow('input text cannot be empty')
  })

  it('throws if OPENAI_API_KEY is not set', async () => {
    delete process.env.OPENAI_API_KEY
    await expect(embedText('hello')).rejects.toThrow('OPENAI_API_KEY')
  })

  it('returns a vector of correct dimensions on success', async () => {
    mockFetchOnce({
      ok: true,
      json: () => ({
        data: [{ embedding: makeFakeVector(), index: 0 }],
        model: EMBEDDING_MODEL,
        usage: { prompt_tokens: 10, total_tokens: 10 },
      }),
    })

    const result = await embedText('hello world')
    expect(result).toHaveLength(EMBEDDING_DIMENSIONS)
    expect(result[0]).toBeCloseTo(Math.sin(0))
  })

  it('throws on non-OK response from OpenAI', async () => {
    mockFetchOnce({
      ok: false,
      status: 401,
      json: () => ({ error: { message: 'Invalid API key', type: 'invalid_request_error' } }),
    })

    await expect(embedText('hello')).rejects.toThrow(/401.*Invalid API key/)
  })

  it('throws if response shape is wrong (empty data)', async () => {
    mockFetchOnce({
      ok: true,
      json: () => ({ data: [], model: EMBEDDING_MODEL, usage: { prompt_tokens: 0, total_tokens: 0 } }),
    })

    await expect(embedText('hello')).rejects.toThrow('empty data')
  })

  it('throws if dimensions mismatch', async () => {
    mockFetchOnce({
      ok: true,
      json: () => ({
        data: [{ embedding: [0.1, 0.2, 0.3], index: 0 }],
        model: EMBEDDING_MODEL,
        usage: { prompt_tokens: 10, total_tokens: 10 },
      }),
    })

    await expect(embedText('hello')).rejects.toThrow(/Unexpected embedding dimensions/)
  })

  it('truncates very long input before sending', async () => {
    let capturedInput = ''
    globalThis.fetch = vi.fn().mockImplementation(async (_url, init) => {
      const body = JSON.parse((init as RequestInit).body as string)
      capturedInput = body.input
      return {
        ok: true,
        status: 200,
        json: async () => ({
          data: [{ embedding: makeFakeVector(), index: 0 }],
          model: EMBEDDING_MODEL,
          usage: { prompt_tokens: 1, total_tokens: 1 },
        }),
      }
    }) as unknown as typeof fetch

    const longText = 'x'.repeat(50000)
    await embedText(longText)
    expect(capturedInput.length).toBeLessThanOrEqual(30000)
  })

  it('sends correct Authorization header', async () => {
    let capturedHeaders: Record<string, string> = {}
    globalThis.fetch = vi.fn().mockImplementation(async (_url, init) => {
      capturedHeaders = (init as RequestInit).headers as Record<string, string>
      return {
        ok: true,
        status: 200,
        json: async () => ({
          data: [{ embedding: makeFakeVector(), index: 0 }],
          model: EMBEDDING_MODEL,
          usage: { prompt_tokens: 1, total_tokens: 1 },
        }),
      }
    }) as unknown as typeof fetch

    await embedText('test')
    expect(capturedHeaders.Authorization).toBe('Bearer sk-test-fake-key')
    expect(capturedHeaders['Content-Type']).toBe('application/json')
  })
})

describe('embedBatch', () => {
  it('returns empty array for empty input without calling fetch', async () => {
    const fetchMock = vi.fn()
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const result = await embedBatch([])
    expect(result).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('preserves input order via response index sorting', async () => {
    mockFetchOnce({
      ok: true,
      json: () => ({
        data: [
          // Return out of order, with distinguishable first values
          { embedding: makeFakeVector().map((v, i) => (i === 0 ? 3 : v)), index: 2 },
          { embedding: makeFakeVector().map((v, i) => (i === 0 ? 1 : v)), index: 0 },
          { embedding: makeFakeVector().map((v, i) => (i === 0 ? 2 : v)), index: 1 },
        ],
        model: EMBEDDING_MODEL,
        usage: { prompt_tokens: 30, total_tokens: 30 },
      }),
    })

    const result = await embedBatch(['a', 'b', 'c'])
    expect(result).toHaveLength(3)
    expect(result[0][0]).toBe(1)
    expect(result[1][0]).toBe(2)
    expect(result[2][0]).toBe(3)
  })
})
