import { describe, it, expect } from 'vitest'
import { getVerifactuQRUrl } from '../../../src/lib/verifactu/qr'

describe('VeriFactu QR', () => {
  describe('getVerifactuQRUrl', () => {
    it('should generate the correct AEAT validation URL', () => {
      const url = getVerifactuQRUrl({
        nif: 'B12345678',
        numSerie: 'F250001',
        fecha: '15-01-2025',
        importe: '1210.00',
      })

      expect(url).toContain('https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR')
      expect(url).toContain('nif=B12345678')
      expect(url).toContain('numserie=F250001')
      expect(url).toContain('fecha=15-01-2025')
      expect(url).toContain('importe=1210.00')
    })

    it('should URL-encode special characters in the numSerie', () => {
      const url = getVerifactuQRUrl({
        nif: 'B12345678',
        numSerie: 'F25/0001',
        fecha: '15-01-2025',
        importe: '1210.00',
      })

      expect(url).toContain('numserie=F25%2F0001')
    })
  })
})
