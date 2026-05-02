import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { isAlexAIBetaUser } from '../../src/lib/feature-flags'

describe('isAlexAIBetaUser', () => {
  const originalEnv = process.env.ALEXAI_BETA_USERS

  beforeEach(() => {
    delete process.env.ALEXAI_BETA_USERS
  })

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.ALEXAI_BETA_USERS
    } else {
      process.env.ALEXAI_BETA_USERS = originalEnv
    }
  })

  it('returns false when ALEXAI_BETA_USERS is not set', () => {
    expect(isAlexAIBetaUser('alejandrosatlla@gmail.com')).toBe(false)
  })

  it('returns false when ALEXAI_BETA_USERS is empty string', () => {
    process.env.ALEXAI_BETA_USERS = ''
    expect(isAlexAIBetaUser('alejandrosatlla@gmail.com')).toBe(false)
  })

  it('returns false for null/undefined/empty email', () => {
    process.env.ALEXAI_BETA_USERS = 'alejandrosatlla@gmail.com'
    expect(isAlexAIBetaUser(null)).toBe(false)
    expect(isAlexAIBetaUser(undefined)).toBe(false)
    expect(isAlexAIBetaUser('')).toBe(false)
  })

  it('returns true for an email present in the whitelist', () => {
    process.env.ALEXAI_BETA_USERS = 'alejandrosatlla@gmail.com'
    expect(isAlexAIBetaUser('alejandrosatlla@gmail.com')).toBe(true)
  })

  it('handles multiple comma-separated emails', () => {
    process.env.ALEXAI_BETA_USERS = 'a@example.com,b@example.com,c@example.com'
    expect(isAlexAIBetaUser('a@example.com')).toBe(true)
    expect(isAlexAIBetaUser('b@example.com')).toBe(true)
    expect(isAlexAIBetaUser('c@example.com')).toBe(true)
    expect(isAlexAIBetaUser('d@example.com')).toBe(false)
  })

  it('is case-insensitive', () => {
    process.env.ALEXAI_BETA_USERS = 'Alejandro@Example.com'
    expect(isAlexAIBetaUser('alejandro@example.com')).toBe(true)
    expect(isAlexAIBetaUser('ALEJANDRO@EXAMPLE.COM')).toBe(true)
  })

  it('trims whitespace around emails in env var', () => {
    process.env.ALEXAI_BETA_USERS = '  a@example.com  ,  b@example.com  '
    expect(isAlexAIBetaUser('a@example.com')).toBe(true)
    expect(isAlexAIBetaUser('b@example.com')).toBe(true)
  })

  it('trims whitespace around the email being checked', () => {
    process.env.ALEXAI_BETA_USERS = 'a@example.com'
    expect(isAlexAIBetaUser('  a@example.com  ')).toBe(true)
  })

  it('ignores empty entries from trailing commas', () => {
    process.env.ALEXAI_BETA_USERS = 'a@example.com,,b@example.com,'
    expect(isAlexAIBetaUser('a@example.com')).toBe(true)
    expect(isAlexAIBetaUser('b@example.com')).toBe(true)
    expect(isAlexAIBetaUser('')).toBe(false)
  })

  it('does not treat substrings as matches', () => {
    process.env.ALEXAI_BETA_USERS = 'admin@example.com'
    expect(isAlexAIBetaUser('admin')).toBe(false)
    expect(isAlexAIBetaUser('admin@example.co')).toBe(false)
    expect(isAlexAIBetaUser('superadmin@example.com')).toBe(false)
  })

  it('reflects env var changes between calls (no caching)', () => {
    process.env.ALEXAI_BETA_USERS = 'a@example.com'
    expect(isAlexAIBetaUser('a@example.com')).toBe(true)

    process.env.ALEXAI_BETA_USERS = 'b@example.com'
    expect(isAlexAIBetaUser('a@example.com')).toBe(false)
    expect(isAlexAIBetaUser('b@example.com')).toBe(true)
  })
})
