import { describe, expect, it } from 'vitest'
import {
  AdapterAuthError,
  AdapterCapabilityError,
  AdapterConsentRequiredError,
  AdapterNotImplementedError,
  AdapterRateLimitError,
  AdapterTenantMismatchError,
} from '../../../src/lib/integrations'

/**
 * These tests are minimal because the bulk of types.ts is interfaces and
 * type aliases, which are validated at compile time by tsc. We test the
 * runtime-observable parts: typed errors with `code` discriminants and
 * structured fields used by the core for recovery decisions.
 */
describe('Adapter typed errors', () => {
  it('AdapterAuthError has discriminant code and providerHint', () => {
    const err = new AdapterAuthError('token expired', 'beds24')
    expect(err.code).toBe('ADAPTER_AUTH_ERROR')
    expect(err.providerHint).toBe('beds24')
    expect(err.message).toBe('token expired')
    expect(err).toBeInstanceOf(Error)
  })

  it('AdapterRateLimitError carries retryAfterSeconds for backoff', () => {
    const err = new AdapterRateLimitError('rate limited', 60)
    expect(err.code).toBe('ADAPTER_RATE_LIMIT_ERROR')
    expect(err.retryAfterSeconds).toBe(60)
  })

  it('AdapterCapabilityError carries the missing capability name', () => {
    const err = new AdapterCapabilityError('not supported', 'supportsMessagingAirbnb')
    expect(err.code).toBe('ADAPTER_CAPABILITY_ERROR')
    expect(err.capability).toBe('supportsMessagingAirbnb')
  })

  it('AdapterNotImplementedError formats method name into message', () => {
    const err = new AdapterNotImplementedError('sendMessage')
    expect(err.code).toBe('ADAPTER_NOT_IMPLEMENTED')
    expect(err.message).toContain('sendMessage')
  })

  it('AdapterTenantMismatchError signals critical security violation', () => {
    const err = new AdapterTenantMismatchError('cross-tenant query detected')
    expect(err.code).toBe('ADAPTER_TENANT_MISMATCH')
  })

  it('AdapterConsentRequiredError carries hostRole for UI flow', () => {
    const err = new AdapterConsentRequiredError('co-host needs consent', 'PRIMARY_CO_HOST')
    expect(err.code).toBe('ADAPTER_CONSENT_REQUIRED')
    expect(err.hostRole).toBe('PRIMARY_CO_HOST')
  })

  it('error codes are mutually exclusive (discriminant pattern)', () => {
    const errors = [
      new AdapterAuthError('x'),
      new AdapterRateLimitError('x'),
      new AdapterCapabilityError('x', 'cap'),
      new AdapterNotImplementedError('m'),
      new AdapterTenantMismatchError('x'),
      new AdapterConsentRequiredError('x', 'OWNER'),
    ]
    const codes = errors.map(e => e.code)
    expect(new Set(codes).size).toBe(codes.length)
  })
})
