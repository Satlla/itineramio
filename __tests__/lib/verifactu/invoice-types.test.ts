import { describe, it, expect } from 'vitest'
import {
  resolveAEATInvoiceType,
  getDefaultTaxRegimeKey,
  AEAT_INVOICE_TYPES,
  TAX_REGIME_KEYS,
} from '../../../src/lib/verifactu/invoice-types'

describe('VeriFactu Invoice Types', () => {
  describe('resolveAEATInvoiceType', () => {
    it('should return F1 for standard invoices', () => {
      const type = resolveAEATInvoiceType({
        isRectifying: false,
        total: 1000,
      })
      expect(type).toBe('F1')
    })

    it('should return R1 for rectifying invoices (error correction)', () => {
      const type = resolveAEATInvoiceType({
        isRectifying: true,
        rectifyingType: 'SUBSTITUTION',
        total: 500,
      })
      expect(type).toBe('R1')
    })

    it('should return R1 for rectifying invoices by difference', () => {
      const type = resolveAEATInvoiceType({
        isRectifying: true,
        rectifyingType: 'DIFFERENCE',
        total: -200,
      })
      expect(type).toBe('R1')
    })
  })

  describe('getDefaultTaxRegimeKey', () => {
    it('should return "01" (régimen general)', () => {
      expect(getDefaultTaxRegimeKey()).toBe('01')
    })
  })

  describe('AEAT_INVOICE_TYPES', () => {
    it('should have all required types', () => {
      expect(AEAT_INVOICE_TYPES.F1).toBeDefined()
      expect(AEAT_INVOICE_TYPES.F2).toBeDefined()
      expect(AEAT_INVOICE_TYPES.F3).toBeDefined()
      expect(AEAT_INVOICE_TYPES.R1).toBeDefined()
      expect(AEAT_INVOICE_TYPES.R2).toBeDefined()
      expect(AEAT_INVOICE_TYPES.R3).toBeDefined()
      expect(AEAT_INVOICE_TYPES.R4).toBeDefined()
      expect(AEAT_INVOICE_TYPES.R5).toBeDefined()
    })
  })

  describe('TAX_REGIME_KEYS', () => {
    it('should have the general regime', () => {
      expect(TAX_REGIME_KEYS['01']).toBeDefined()
      expect(TAX_REGIME_KEYS['01'].label).toBe('General')
    })
  })
})
