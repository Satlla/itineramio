import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  __resetAnthropicClientForTests,
  AnthropicMissingApiKeyError,
  getAnthropicClient,
} from '../../../src/lib/anthropic'

describe('getAnthropicClient', () => {
  const originalKey = process.env.ANTHROPIC_API_KEY

  beforeEach(() => {
    __resetAnthropicClientForTests()
    delete process.env.ANTHROPIC_API_KEY
  })

  afterEach(() => {
    __resetAnthropicClientForTests()
    if (originalKey === undefined) {
      delete process.env.ANTHROPIC_API_KEY
    } else {
      process.env.ANTHROPIC_API_KEY = originalKey
    }
  })

  it('throws AnthropicMissingApiKeyError when env var is missing', () => {
    expect(() => getAnthropicClient()).toThrow(AnthropicMissingApiKeyError)
  })

  it('error has discriminant code for caller branching', () => {
    try {
      getAnthropicClient()
      expect.unreachable('should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(AnthropicMissingApiKeyError)
      expect((err as AnthropicMissingApiKeyError).code).toBe('ANTHROPIC_MISSING_API_KEY')
    }
  })

  it('returns a client instance when env var is set', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key'
    const client = getAnthropicClient()
    expect(client).toBeDefined()
    expect(typeof client.messages.create).toBe('function')
  })

  it('returns the same singleton across calls (lazy + cached)', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key'
    const a = getAnthropicClient()
    const b = getAnthropicClient()
    expect(a).toBe(b)
  })

  it('after reset, returns a new instance', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key'
    const a = getAnthropicClient()
    __resetAnthropicClientForTests()
    const b = getAnthropicClient()
    expect(a).not.toBe(b)
  })
})
