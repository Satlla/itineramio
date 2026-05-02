import { describe, expect, it } from 'vitest'
import {
  hasCapability,
  hasFullCapability,
  PROVIDER_CAPABILITIES,
  type AdapterCapabilities,
} from '../../../src/lib/integrations/capabilities'

describe('PROVIDER_CAPABILITIES matrix', () => {
  it('declares an entry for every supported provider', () => {
    const expected = [
      'BEDS24',
      'HOSTAWAY',
      'HOSPITABLE',
      'AVANTIO',
      'AVIRATO',
      'ICNEA',
      'LODGIFY',
      'SMOOBU',
      'GUESTY',
      'SUITECLERK',
      'WUBOOK',
    ] as const

    for (const provider of expected) {
      expect(PROVIDER_CAPABILITIES[provider]).toBeDefined()
    }
  })

  it('Beds24 supports all capabilities at full level (master multi-tenant case)', () => {
    const caps = PROVIDER_CAPABILITIES.BEDS24
    const expected: AdapterCapabilities = {
      supportsReservations: 'full',
      supportsMessagingAirbnb: 'full',
      supportsMessagingBooking: 'full',
      supportsMessagingExpedia: 'full',
      supportsMessagingVrbo: 'full',
      supportsCalendarSync: 'full',
      supportsBookingWebhooks: 'full',
      supportsPriceSync: 'full',
      supportsMultiAccountMaster: 'full',
      supportsMediaInMessages: 'full',
    }
    expect(caps).toEqual(expected)
  })

  it('Lodgify does not support OTA messaging (degraded mode for AlexAI)', () => {
    const caps = PROVIDER_CAPABILITIES.LODGIFY
    expect(caps.supportsMessagingAirbnb).toBe('none')
    expect(caps.supportsMessagingBooking).toBe('none')
    expect(caps.supportsMessagingExpedia).toBe('none')
    expect(caps.supportsMessagingVrbo).toBe('none')
  })

  it('only Beds24 supports multi-account master scope', () => {
    for (const [provider, caps] of Object.entries(PROVIDER_CAPABILITIES)) {
      if (provider === 'BEDS24') {
        expect(caps.supportsMultiAccountMaster).toBe('full')
      } else {
        expect(caps.supportsMultiAccountMaster).toBe('none')
      }
    }
  })

  it('unverified providers default to all-none for safe degradation', () => {
    const unverified = ['AVIRATO', 'ICNEA', 'GUESTY', 'SUITECLERK', 'WUBOOK'] as const
    for (const provider of unverified) {
      const caps = PROVIDER_CAPABILITIES[provider]
      const allNone = Object.values(caps).every(level => level === 'none')
      expect(allNone).toBe(true)
    }
  })
})

describe('hasCapability', () => {
  const caps: AdapterCapabilities = {
    supportsReservations: 'full',
    supportsMessagingAirbnb: 'partial',
    supportsMessagingBooking: 'none',
    supportsMessagingExpedia: 'none',
    supportsMessagingVrbo: 'none',
    supportsCalendarSync: 'full',
    supportsBookingWebhooks: 'partial',
    supportsPriceSync: 'full',
    supportsMultiAccountMaster: 'none',
    supportsMediaInMessages: 'none',
  }

  it('returns true for full support', () => {
    expect(hasCapability(caps, 'supportsReservations')).toBe(true)
  })

  it('returns true for partial support (degraded but available)', () => {
    expect(hasCapability(caps, 'supportsMessagingAirbnb')).toBe(true)
  })

  it('returns false for no support', () => {
    expect(hasCapability(caps, 'supportsMessagingBooking')).toBe(false)
    expect(hasCapability(caps, 'supportsMultiAccountMaster')).toBe(false)
  })
})

describe('hasFullCapability', () => {
  const caps: AdapterCapabilities = {
    supportsReservations: 'full',
    supportsMessagingAirbnb: 'partial',
    supportsMessagingBooking: 'none',
    supportsMessagingExpedia: 'none',
    supportsMessagingVrbo: 'none',
    supportsCalendarSync: 'full',
    supportsBookingWebhooks: 'partial',
    supportsPriceSync: 'full',
    supportsMultiAccountMaster: 'none',
    supportsMediaInMessages: 'none',
  }

  it('returns true only for full support', () => {
    expect(hasFullCapability(caps, 'supportsReservations')).toBe(true)
    expect(hasFullCapability(caps, 'supportsCalendarSync')).toBe(true)
  })

  it('returns false for partial support', () => {
    expect(hasFullCapability(caps, 'supportsMessagingAirbnb')).toBe(false)
    expect(hasFullCapability(caps, 'supportsBookingWebhooks')).toBe(false)
  })

  it('returns false for no support', () => {
    expect(hasFullCapability(caps, 'supportsMessagingBooking')).toBe(false)
  })
})
