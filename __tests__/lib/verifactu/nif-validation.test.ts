import { describe, it, expect } from 'vitest'
import {
  validateNIF,
  validateNIE,
  validateCIF,
  validateTaxId,
  normalizeTaxId,
} from '../../../src/lib/verifactu/nif-validation'

describe('NIF/CIF/NIE Validation', () => {
  describe('validateNIF', () => {
    it('should validate correct NIFs', () => {
      // These are calculated valid NIFs
      expect(validateNIF('00000000T')).toBe(true)
      expect(validateNIF('12345678Z')).toBe(true)
      expect(validateNIF('99999999R')).toBe(true)
    })

    it('should reject invalid NIFs', () => {
      expect(validateNIF('12345678A')).toBe(false) // Wrong letter
      expect(validateNIF('1234567Z')).toBe(false)  // Too few digits
      expect(validateNIF('123456789Z')).toBe(false) // Too many digits
      expect(validateNIF('')).toBe(false)
    })

    it('should handle spaces and dots', () => {
      expect(validateNIF('12.345.678-Z')).toBe(true)
      expect(validateNIF('12 345 678 Z')).toBe(true)
    })
  })

  describe('validateNIE', () => {
    it('should validate correct NIEs', () => {
      // X0000000T (X=0, so same as NIF 00000000T)
      expect(validateNIE('X0000000T')).toBe(true)
      // Y0000000 -> Y=1, fullNumber=10000000, 10000000%23=14, NIF_LETTERS[14]='Z'
      expect(validateNIE('Y0000000Z')).toBe(true)
    })

    it('should reject invalid NIEs', () => {
      expect(validateNIE('X0000000A')).toBe(false) // Wrong letter
      expect(validateNIE('A0000000T')).toBe(false) // Not X/Y/Z
      expect(validateNIE('')).toBe(false)
    })
  })

  describe('validateCIF', () => {
    it('should validate correct CIFs', () => {
      // B12345678 - calculate: digits 1234567
      // Odd pos (0-indexed even): 1,3,5,7 → doubled: 2,6,10,14 → adjusted: 2,6,1,5 = 14
      // Even pos: 2,4,6 → 2+4+6 = 12
      // Total: 14+12=26, control: (10 - 26%10)%10 = (10-6)%10 = 4
      // B uses digit control
      // So B12345674 should be valid
      expect(validateCIF('B12345674')).toBe(true)
    })

    it('should reject invalid CIFs', () => {
      expect(validateCIF('B12345670')).toBe(false) // Wrong control
      expect(validateCIF('')).toBe(false)
    })
  })

  describe('validateTaxId', () => {
    it('should detect NIF type', () => {
      const result = validateTaxId('12345678Z')
      expect(result.type).toBe('NIF')
      expect(result.valid).toBe(true)
    })

    it('should detect NIE type', () => {
      const result = validateTaxId('X0000000T')
      expect(result.type).toBe('NIE')
      expect(result.valid).toBe(true)
    })

    it('should detect CIF type', () => {
      const result = validateTaxId('B12345674')
      expect(result.type).toBe('CIF')
      expect(result.valid).toBe(true)
    })

    it('should return UNKNOWN for invalid formats', () => {
      const result = validateTaxId('!@#$')
      expect(result.type).toBe('UNKNOWN')
      expect(result.valid).toBe(false)
    })
  })

  describe('normalizeTaxId', () => {
    it('should remove spaces, dots, and hyphens', () => {
      expect(normalizeTaxId('12.345.678-Z')).toBe('12345678Z')
      expect(normalizeTaxId('b 1234 567 4')).toBe('B12345674')
    })
  })
})
