import { describe, it, expect } from 'vitest'
import {
  generateRegistroAltaXml,
  generateRegistroAnulacionXml,
  generateSOAPEnvelope,
} from '../../../src/lib/verifactu/xml'

describe('VeriFactu XML Generation', () => {
  describe('generateRegistroAltaXml', () => {
    it('should generate valid XML for a standard invoice', () => {
      const xml = generateRegistroAltaXml({
        nifEmisor: 'B12345678',
        nombreRazonEmisor: 'Gestora Ejemplo SL',
        nifReceptor: '12345678Z',
        nombreRazonReceptor: 'Juan Pérez',
        numSerieFactura: 'F250001',
        fechaExpedicion: '15-01-2025',
        tipoFactura: 'F1',
        claveRegimenFiscal: '01',
        descripcionOperacion: 'Servicios de gestión de alquiler vacacional',
        desgloseIVA: [
          { baseImponible: '1000.00', tipoImpositivo: '21.00', cuotaRepercutida: '210.00' },
        ],
        cuotaTotal: '210.00',
        importeTotal: '1210.00',
        huella: 'abc123def456',
        huellaAnterior: '',
        fechaHoraHusoGenRegistro: '2025-01-15T10:30:00+01:00',
      })

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(xml).toContain('<sf:RegistroAlta')
      expect(xml).toContain('<sf:IDEmisorFactura>B12345678</sf:IDEmisorFactura>')
      expect(xml).toContain('<sf:NumSerieFactura>F250001</sf:NumSerieFactura>')
      expect(xml).toContain('<sf:TipoFactura>F1</sf:TipoFactura>')
      expect(xml).toContain('<sf:BaseImponible>1000.00</sf:BaseImponible>')
      expect(xml).toContain('<sf:ImporteTotal>1210.00</sf:ImporteTotal>')
      expect(xml).toContain('<sf:PrimerRegistro>S</sf:PrimerRegistro>')
      expect(xml).toContain('<sf:Huella>abc123def456</sf:Huella>')
      expect(xml).toContain('ITINERAMIO')
    })

    it('should include rectificativa data when provided', () => {
      const xml = generateRegistroAltaXml({
        nifEmisor: 'B12345678',
        nombreRazonEmisor: 'Gestora SL',
        nifReceptor: '12345678Z',
        nombreRazonReceptor: 'Juan Pérez',
        numSerieFactura: 'R250001',
        fechaExpedicion: '20-01-2025',
        tipoFactura: 'R4',
        claveRegimenFiscal: '01',
        descripcionOperacion: 'Rectificación',
        desgloseIVA: [
          { baseImponible: '500.00', tipoImpositivo: '21.00', cuotaRepercutida: '105.00' },
        ],
        cuotaTotal: '105.00',
        importeTotal: '605.00',
        huella: 'xyz789',
        huellaAnterior: 'prevhash123',
        fechaHoraHusoGenRegistro: '2025-01-20T12:00:00+01:00',
        rectificativa: {
          tipoRectificativa: 'S',
          facturaRectificada: {
            numSerieFactura: 'F250001',
            fechaExpedicion: '15-01-2025',
          },
        },
      })

      expect(xml).toContain('<sf:FacturasRectificadas>')
      expect(xml).toContain('<sf:TipoRectificativa>S</sf:TipoRectificativa>')
      expect(xml).toContain('<sf:PrimerRegistro>N</sf:PrimerRegistro>')
      expect(xml).toContain('prevhash123')
    })

    it('should escape XML special characters', () => {
      const xml = generateRegistroAltaXml({
        nifEmisor: 'B12345678',
        nombreRazonEmisor: 'Empresa & Hijos <SL>',
        nifReceptor: '12345678Z',
        nombreRazonReceptor: 'Test "User"',
        numSerieFactura: 'F250001',
        fechaExpedicion: '15-01-2025',
        tipoFactura: 'F1',
        claveRegimenFiscal: '01',
        descripcionOperacion: 'Test',
        desgloseIVA: [
          { baseImponible: '100.00', tipoImpositivo: '21.00', cuotaRepercutida: '21.00' },
        ],
        cuotaTotal: '21.00',
        importeTotal: '121.00',
        huella: 'hash',
        huellaAnterior: '',
        fechaHoraHusoGenRegistro: '2025-01-15T10:00:00+01:00',
      })

      expect(xml).toContain('Empresa &amp; Hijos &lt;SL&gt;')
      expect(xml).toContain('Test &quot;User&quot;')
    })
  })

  describe('generateRegistroAnulacionXml', () => {
    it('should generate valid XML for a cancellation', () => {
      const xml = generateRegistroAnulacionXml({
        nifEmisor: 'B12345678',
        nombreRazonEmisor: 'Gestora SL',
        numSerieFactura: 'F250001',
        fechaExpedicion: '15-01-2025',
        huella: 'cancelhash',
        huellaAnterior: 'prevhash',
        fechaHoraHusoGenRegistro: '2025-01-16T10:00:00+01:00',
      })

      expect(xml).toContain('<sf:RegistroAnulacion')
      expect(xml).toContain('F250001')
      expect(xml).toContain('cancelhash')
    })
  })

  describe('generateSOAPEnvelope', () => {
    it('should wrap registros in a SOAP envelope', () => {
      const registroXml = '<sf:RegistroAlta>test</sf:RegistroAlta>'
      const soap = generateSOAPEnvelope([registroXml], 'B12345678')

      expect(soap).toContain('soapenv:Envelope')
      expect(soap).toContain('soapenv:Body')
      expect(soap).toContain('<sf:RegistroAlta>test</sf:RegistroAlta>')
      expect(soap).toContain('B12345678')
    })
  })
})
