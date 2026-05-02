import type Anthropic from '@anthropic-ai/sdk'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock del SDK ANTES de importar el módulo bajo test, para que cuando el
// singleton haga `new Anthropic({ apiKey })` reciba nuestra implementación.
const messagesCreateMock = vi.fn<
  (
    params: Anthropic.MessageCreateParamsNonStreaming
  ) => Promise<Anthropic.Message>
>()

vi.mock('@anthropic-ai/sdk', () => {
  class MockAnthropic {
    messages = { create: messagesCreateMock }
    constructor(_opts: { apiKey: string }) {}
  }
  return { default: MockAnthropic }
})

import { __resetAnthropicClientForTests } from '../../../src/lib/anthropic/client'
import {
  createCachedMessage,
  DEFAULT_ANTHROPIC_MODEL,
} from '../../../src/lib/anthropic/messages'

function mockResponse(overrides: Partial<Anthropic.Message> = {}): Anthropic.Message {
  return {
    id: 'msg_test',
    type: 'message',
    role: 'assistant',
    model: DEFAULT_ANTHROPIC_MODEL,
    stop_reason: 'end_turn',
    stop_sequence: null,
    content: [{ type: 'text', text: 'A las 16:00.', citations: null }],
    usage: {
      input_tokens: 10,
      output_tokens: 5,
      cache_creation_input_tokens: 100,
      cache_read_input_tokens: 0,
      server_tool_use: null,
      service_tier: 'standard',
    },
    container: null,
    ...overrides,
  } as Anthropic.Message
}

describe('createCachedMessage', () => {
  beforeEach(() => {
    __resetAnthropicClientForTests()
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test'
    messagesCreateMock.mockReset()
  })

  afterEach(() => {
    __resetAnthropicClientForTests()
  })

  it('uses claude-sonnet-4-6 by default', async () => {
    messagesCreateMock.mockResolvedValueOnce(mockResponse())

    await createCachedMessage({
      systemPrompt: 'You are AlexAI',
      propertyContext: 'Property: Loft Luceros',
      guestMessage: '¿hora de check-in?',
    })

    const call = messagesCreateMock.mock.calls[0][0]
    expect(call.model).toBe('claude-sonnet-4-6')
  })

  it('respects custom model override', async () => {
    messagesCreateMock.mockResolvedValueOnce(mockResponse())

    await createCachedMessage({
      systemPrompt: 's',
      propertyContext: 'c',
      guestMessage: 'g',
      model: 'claude-opus-4-7',
    })

    expect(messagesCreateMock.mock.calls[0][0].model).toBe('claude-opus-4-7')
  })

  it('places cache_control on the system block', async () => {
    messagesCreateMock.mockResolvedValueOnce(mockResponse())

    await createCachedMessage({
      systemPrompt: 'STABLE SYSTEM',
      propertyContext: 'c',
      guestMessage: 'g',
    })

    const call = messagesCreateMock.mock.calls[0][0]
    const system = call.system as Anthropic.TextBlockParam[]
    expect(system).toHaveLength(1)
    expect(system[0].type).toBe('text')
    expect(system[0].text).toBe('STABLE SYSTEM')
    expect(system[0].cache_control).toEqual({ type: 'ephemeral' })
  })

  it('places cache_control on the property context user block', async () => {
    messagesCreateMock.mockResolvedValueOnce(mockResponse())

    await createCachedMessage({
      systemPrompt: 's',
      propertyContext: 'PROPERTY MANUAL',
      guestMessage: 'g',
    })

    const call = messagesCreateMock.mock.calls[0][0]
    const firstUserMsg = call.messages[0]
    expect(firstUserMsg.role).toBe('user')
    const firstBlock = (firstUserMsg.content as Anthropic.TextBlockParam[])[0]
    expect(firstBlock.text).toBe('PROPERTY MANUAL')
    expect(firstBlock.cache_control).toEqual({ type: 'ephemeral' })
  })

  it('does NOT place cache_control on the guest message (volatile)', async () => {
    messagesCreateMock.mockResolvedValueOnce(mockResponse())

    await createCachedMessage({
      systemPrompt: 's',
      propertyContext: 'c',
      guestMessage: '¿wifi?',
    })

    const call = messagesCreateMock.mock.calls[0][0]
    const lastMsg = call.messages[call.messages.length - 1]
    expect(lastMsg.role).toBe('user')
    expect(lastMsg.content).toBe('¿wifi?') // string, no cache_control posible
  })

  it('uses 1h TTL when cacheTtl is "1h"', async () => {
    messagesCreateMock.mockResolvedValueOnce(mockResponse())

    await createCachedMessage({
      systemPrompt: 's',
      propertyContext: 'c',
      guestMessage: 'g',
      cacheTtl: '1h',
    })

    const call = messagesCreateMock.mock.calls[0][0]
    const system = call.system as Anthropic.TextBlockParam[]
    expect(system[0].cache_control).toEqual({ type: 'ephemeral', ttl: '1h' })
  })

  it('inserts conversation history between context and current message', async () => {
    messagesCreateMock.mockResolvedValueOnce(mockResponse())

    const history: Anthropic.MessageParam[] = [
      { role: 'user', content: 'first turn' },
      { role: 'assistant', content: 'first reply' },
    ]

    await createCachedMessage({
      systemPrompt: 's',
      propertyContext: 'c',
      conversationHistory: history,
      guestMessage: 'second turn',
    })

    const msgs = messagesCreateMock.mock.calls[0][0].messages
    expect(msgs).toHaveLength(4) // context + 2 history + current
    expect(msgs[1].content).toBe('first turn')
    expect(msgs[2].content).toBe('first reply')
    expect(msgs[3].content).toBe('second turn')
  })

  it('does NOT include thinking by default (latency-first)', async () => {
    messagesCreateMock.mockResolvedValueOnce(mockResponse())

    await createCachedMessage({
      systemPrompt: 's',
      propertyContext: 'c',
      guestMessage: 'g',
    })

    expect(messagesCreateMock.mock.calls[0][0].thinking).toBeUndefined()
  })

  it('includes adaptive thinking when explicitly requested', async () => {
    messagesCreateMock.mockResolvedValueOnce(mockResponse())

    await createCachedMessage({
      systemPrompt: 's',
      propertyContext: 'c',
      guestMessage: 'g',
      thinking: 'adaptive',
    })

    expect(messagesCreateMock.mock.calls[0][0].thinking).toEqual({
      type: 'adaptive',
    })
  })

  it('uses 4096 max_tokens by default', async () => {
    messagesCreateMock.mockResolvedValueOnce(mockResponse())

    await createCachedMessage({
      systemPrompt: 's',
      propertyContext: 'c',
      guestMessage: 'g',
    })

    expect(messagesCreateMock.mock.calls[0][0].max_tokens).toBe(4096)
  })

  it('returns extracted text concatenated from all text blocks', async () => {
    messagesCreateMock.mockResolvedValueOnce(
      mockResponse({
        content: [
          { type: 'text', text: 'Parte 1. ', citations: null },
          { type: 'text', text: 'Parte 2.', citations: null },
        ],
      })
    )

    const result = await createCachedMessage({
      systemPrompt: 's',
      propertyContext: 'c',
      guestMessage: 'g',
    })

    expect(result.text).toBe('Parte 1. Parte 2.')
  })

  it('exposes usage metrics including cache fields', async () => {
    messagesCreateMock.mockResolvedValueOnce(
      mockResponse({
        usage: {
          input_tokens: 12,
          output_tokens: 7,
          cache_creation_input_tokens: 200,
          cache_read_input_tokens: 1500,
          server_tool_use: null,
          service_tier: 'standard',
        } as Anthropic.Message['usage'],
      })
    )

    const result = await createCachedMessage({
      systemPrompt: 's',
      propertyContext: 'c',
      guestMessage: 'g',
    })

    expect(result.usage).toEqual({
      inputTokens: 12,
      outputTokens: 7,
      cacheCreationInputTokens: 200,
      cacheReadInputTokens: 1500,
    })
  })

  it('exposes the raw SDK message for callers needing more detail', async () => {
    const raw = mockResponse()
    messagesCreateMock.mockResolvedValueOnce(raw)

    const result = await createCachedMessage({
      systemPrompt: 's',
      propertyContext: 'c',
      guestMessage: 'g',
    })

    expect(result.raw).toBe(raw)
    expect(result.stopReason).toBe('end_turn')
  })

  it('propagates SDK errors without wrapping', async () => {
    const sdkError = new Error('rate limited')
    messagesCreateMock.mockRejectedValueOnce(sdkError)

    await expect(
      createCachedMessage({
        systemPrompt: 's',
        propertyContext: 'c',
        guestMessage: 'g',
      })
    ).rejects.toBe(sdkError)
  })
})
