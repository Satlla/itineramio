import Anthropic from '@anthropic-ai/sdk'
import { describe, expect, it } from 'vitest'

import {
  AnthropicMissingApiKeyError,
  classifyAnthropicError,
} from '../../../src/lib/anthropic'

/**
 * Helper para construir una instancia que pase `instanceof Anthropic.XError`
 * sin invocar el constructor (que en SDK 0.92 requiere un objeto Headers real).
 *
 * Usamos `Object.create(Cls.prototype)` — produce un objeto cuya cadena
 * prototípica es la de `Cls`, pero sin pasar por el constructor. Suficiente
 * para que `instanceof` (y por tanto el clasificador) funcione.
 */
type AnthropicErrorCtor = new (...args: never[]) => InstanceType<typeof Anthropic.APIError>

function makeError<T extends AnthropicErrorCtor>(Cls: T, status: number): InstanceType<T> {
  const err = Object.create(Cls.prototype) as InstanceType<T>
  ;(err as unknown as { status: number }).status = status
  return err
}

describe('classifyAnthropicError', () => {
  it('classifies AnthropicMissingApiKeyError', () => {
    const err = new AnthropicMissingApiKeyError('missing')
    expect(classifyAnthropicError(err)).toBe('missing_api_key')
  })

  it('classifies SDK AuthenticationError as auth', () => {
    const err = makeError(Anthropic.AuthenticationError, 401)
    expect(classifyAnthropicError(err)).toBe('auth')
  })

  it('classifies SDK RateLimitError as rate_limit', () => {
    const err = makeError(Anthropic.RateLimitError, 429)
    expect(classifyAnthropicError(err)).toBe('rate_limit')
  })

  it('classifies SDK BadRequestError as bad_request', () => {
    const err = makeError(Anthropic.BadRequestError, 400)
    expect(classifyAnthropicError(err)).toBe('bad_request')
  })

  it('classifies SDK PermissionDeniedError as permission', () => {
    const err = makeError(Anthropic.PermissionDeniedError, 403)
    expect(classifyAnthropicError(err)).toBe('permission')
  })

  it('classifies SDK NotFoundError as not_found', () => {
    const err = makeError(Anthropic.NotFoundError, 404)
    expect(classifyAnthropicError(err)).toBe('not_found')
  })

  it('classifies SDK InternalServerError as server_error', () => {
    const err = makeError(Anthropic.InternalServerError, 500)
    expect(classifyAnthropicError(err)).toBe('server_error')
  })

  it('classifies APIError 529 as overloaded', () => {
    const err = makeError(Anthropic.APIError, 529)
    expect(classifyAnthropicError(err)).toBe('overloaded')
  })

  it('classifies non-Anthropic errors as unknown', () => {
    expect(classifyAnthropicError(new Error('some other error'))).toBe('unknown')
    expect(classifyAnthropicError('plain string')).toBe('unknown')
    expect(classifyAnthropicError(null)).toBe('unknown')
    expect(classifyAnthropicError(undefined)).toBe('unknown')
  })
})
