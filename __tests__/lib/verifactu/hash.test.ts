import { describe, it, expect } from 'vitest'
import {
  computeRegistroAltaHash,
  computeRegistroAnulacionHash,
  validateHashChain,
  formatDateVF,
  formatAmountVF,
  formatAmountXml,
} from '../../../src/lib/verifactu/hash'

describe('VeriFactu Hash', () => {
  describe('computeRegistroAltaHash', () => {
    it('should produce a 64-character hex SHA-256 hash', () => {
      const hash = computeRegistroAltaHash({
        nifEmisor: 'B12345678',
        numSerieFactura: 'F250001',
        fechaExpedicion: '15-01-2025',
        tipoFactura: 'F1',
        cuotaTotal: '210.00',
        importeTotal: '1210.00',
        huellaAnterior: '',
        fechaHoraHusoGenRegistro: '2025-01-15T10:30:00+01:00',
      })
      expect(hash).toHaveLength(64)
      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })

    it('should produce different hashes for different inputs', () => {
      const base = {
        nifEmisor: 'B12345678',
        numSerieFactura: 'F250001',
        fechaExpedicion: '15-01-2025',
        tipoFactura: 'F1',
        cuotaTotal: '210.00',
        importeTotal: '1210.00',
        huellaAnterior: '',
        fechaHoraHusoGenRegistro: '2025-01-15T10:30:00+01:00',
      }

      const hash1 = computeRegistroAltaHash(base)
      const hash2 = computeRegistroAltaHash({
        ...base,
        importeTotal: '1200.00',
      })

      expect(hash1).not.toBe(hash2)
    })

    it('should produce deterministic results', () => {
      const input = {
        nifEmisor: 'B12345678',
        numSerieFactura: 'F250001',
        fechaExpedicion: '15-01-2025',
        tipoFactura: 'F1',
        cuotaTotal: '210.00',
        importeTotal: '1210.00',
        huellaAnterior: '',
        fechaHoraHusoGenRegistro: '2025-01-15T10:30:00+01:00',
      }

      const hash1 = computeRegistroAltaHash(input)
      const hash2 = computeRegistroAltaHash(input)

      expect(hash1).toBe(hash2)
    })

    it('should chain with previous hash', () => {
      const firstHash = computeRegistroAltaHash({
        nifEmisor: 'B12345678',
        numSerieFactura: 'F250001',
        fechaExpedicion: '15-01-2025',
        tipoFactura: 'F1',
        cuotaTotal: '210.00',
        importeTotal: '1210.00',
        huellaAnterior: '',
        fechaHoraHusoGenRegistro: '2025-01-15T10:30:00+01:00',
      })

      const secondHash = computeRegistroAltaHash({
        nifEmisor: 'B12345678',
        numSerieFactura: 'F250002',
        fechaExpedicion: '16-01-2025',
        tipoFactura: 'F1',
        cuotaTotal: '42.00',
        importeTotal: '242.00',
        huellaAnterior: firstHash,
        fechaHoraHusoGenRegistro: '2025-01-16T09:00:00+01:00',
      })

      expect(secondHash).toHaveLength(64)
      expect(secondHash).not.toBe(firstHash)
    })
  })

  describe('computeRegistroAnulacionHash', () => {
    it('should produce a valid hash for cancellation records', () => {
      const hash = computeRegistroAnulacionHash({
        nifEmisor: 'B12345678',
        numSerieFactura: 'F250001',
        fechaExpedicion: '15-01-2025',
        huellaAnterior: '',
        fechaHoraHusoGenRegistro: '2025-01-15T10:30:00+01:00',
      })
      expect(hash).toHaveLength(64)
      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })
  })

  describe('validateHashChain', () => {
    it('should validate a correct chain', () => {
      const hash1 = computeRegistroAltaHash({
        nifEmisor: 'B12345678',
        numSerieFactura: 'F250001',
        fechaExpedicion: '15-01-2025',
        tipoFactura: 'F1',
        cuotaTotal: '210.00',
        importeTotal: '1210.00',
        huellaAnterior: '',
        fechaHoraHusoGenRegistro: '2025-01-15T10:30:00+01:00',
      })

      const hash2 = computeRegistroAltaHash({
        nifEmisor: 'B12345678',
        numSerieFactura: 'F250002',
        fechaExpedicion: '16-01-2025',
        tipoFactura: 'F1',
        cuotaTotal: '42.00',
        importeTotal: '242.00',
        huellaAnterior: hash1,
        fechaHoraHusoGenRegistro: '2025-01-16T09:00:00+01:00',
      })

      const result = validateHashChain([
        { hash: hash1, previousHash: '' },
        { hash: hash2, previousHash: hash1 },
      ])

      expect(result.valid).toBe(true)
    })

    it('should detect a broken chain', () => {
      const result = validateHashChain([
        { hash: 'abc123', previousHash: '' },
        { hash: 'def456', previousHash: 'wrong_hash' },
      ])

      expect(result.valid).toBe(false)
      expect(result.brokenAt).toBe(1)
    })

    it('should validate a single-entry chain', () => {
      const result = validateHashChain([
        { hash: 'abc123', previousHash: '' },
      ])

      expect(result.valid).toBe(true)
    })
  })

  describe('formatDateVF', () => {
    it('should format date as DD-MM-YYYY', () => {
      const date = new Date(2025, 0, 15) // January 15, 2025
      expect(formatDateVF(date)).toBe('15-01-2025')
    })

    it('should pad single-digit days and months', () => {
      const date = new Date(2025, 2, 5) // March 5, 2025
      expect(formatDateVF(date)).toBe('05-03-2025')
    })
  })

  describe('formatAmountVF', () => {
    it('should strip trailing decimal zeros per AEAT spec', () => {
      // AEAT spec: trailing decimal zeros are stripped for hash computation
      // 1210.00 → 1210, 42.50 → 42.5, 123.10 → 123.1
      expect(formatAmountVF(1210)).toBe('1210')
      expect(formatAmountVF(42.5)).toBe('42.5')
      expect(formatAmountVF(0)).toBe('0')
      expect(formatAmountVF(123.10)).toBe('123.1')
      expect(formatAmountVF(99.99)).toBe('99.99')
      expect(formatAmountVF(100.00)).toBe('100')
    })
  })

  describe('formatAmountXml', () => {
    it('should always return 2 decimal places for XML fields', () => {
      expect(formatAmountXml(1210)).toBe('1210.00')
      expect(formatAmountXml(42.5)).toBe('42.50')
      expect(formatAmountXml(0)).toBe('0.00')
      expect(formatAmountXml(123.1)).toBe('123.10')
    })
  })
})
