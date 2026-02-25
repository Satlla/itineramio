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
        descripcionOperacion: 'Servicios de gestión de alquiler vacacional',
        desglose: [
          {
            claveRegimen: '01',
            calificacionOperacion: 'S1',
            tipoImpositivo: '21.00',
            baseImponible: '1000.00',
            cuotaRepercutida: '210.00',
          },
        ],
        cuotaTotal: '210.00',
        importeTotal: '1210.00',
        huella: 'abc123def456',
        huellaAnterior: '',
        fechaHoraHusoGenRegistro: '2025-01-15T10:30:00+01:00',
      })

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(xml).toContain('<sf:RegistroAlta')
      expect(xml).toContain('SuministroInformacion.xsd')
      expect(xml).toContain('<sf:IDEmisorFactura>B12345678</sf:IDEmisorFactura>')
      expect(xml).toContain('<sf:NumSerieFactura>F250001</sf:NumSerieFactura>')
      expect(xml).toContain('<sf:NombreRazonEmisor>Gestora Ejemplo SL</sf:NombreRazonEmisor>')
      expect(xml).toContain('<sf:TipoFactura>F1</sf:TipoFactura>')
      expect(xml).toContain('<sf:ClaveRegimen>01</sf:ClaveRegimen>')
      expect(xml).toContain('<sf:CalificacionOperacion>S1</sf:CalificacionOperacion>')
      expect(xml).toContain('<sf:BaseImponibleOimporteNoSujeto>1000.00</sf:BaseImponibleOimporteNoSujeto>')
      expect(xml).toContain('<sf:CuotaRepercutida>210.00</sf:CuotaRepercutida>')
      expect(xml).toContain('<sf:ImporteTotal>1210.00</sf:ImporteTotal>')
      expect(xml).toContain('<sf:PrimerRegistro>S</sf:PrimerRegistro>')
      expect(xml).toContain('<sf:Huella>abc123def456</sf:Huella>')
      expect(xml).toContain('<sf:TipoHuella>01</sf:TipoHuella>')
      expect(xml).toContain('<sf:IDVersion>1.0</sf:IDVersion>')
      expect(xml).toContain('Itineramio Gestion')
    })

    it('should include Destinatarios for F1 invoices', () => {
      const xml = generateRegistroAltaXml({
        nifEmisor: 'B12345678',
        nombreRazonEmisor: 'Gestora SL',
        nifReceptor: '12345678Z',
        nombreRazonReceptor: 'Juan Pérez',
        numSerieFactura: 'F250001',
        fechaExpedicion: '15-01-2025',
        tipoFactura: 'F1',
        descripcionOperacion: 'Test',
        desglose: [
          { claveRegimen: '01', calificacionOperacion: 'S1', tipoImpositivo: '21.00', baseImponible: '100.00', cuotaRepercutida: '21.00' },
        ],
        cuotaTotal: '21.00',
        importeTotal: '121.00',
        huella: 'hash',
        huellaAnterior: '',
        fechaHoraHusoGenRegistro: '2025-01-15T10:00:00+01:00',
      })

      expect(xml).toContain('<sf:Destinatarios>')
      expect(xml).toContain('<sf:IDDestinatario>')
      expect(xml).toContain('<sf:NIF>12345678Z</sf:NIF>')
      expect(xml).toContain('<sf:NombreRazon>Juan Pérez</sf:NombreRazon>')
    })

    it('should include registroAnterior in Encadenamiento when not first record', () => {
      const xml = generateRegistroAltaXml({
        nifEmisor: 'B12345678',
        nombreRazonEmisor: 'Gestora SL',
        numSerieFactura: 'F250002',
        fechaExpedicion: '20-01-2025',
        tipoFactura: 'F1',
        descripcionOperacion: 'Test',
        desglose: [
          { claveRegimen: '01', calificacionOperacion: 'S1', tipoImpositivo: '21.00', baseImponible: '500.00', cuotaRepercutida: '105.00' },
        ],
        cuotaTotal: '105.00',
        importeTotal: '605.00',
        huella: 'secondhash',
        huellaAnterior: 'firsthash',
        fechaHoraHusoGenRegistro: '2025-01-20T12:00:00+01:00',
        registroAnterior: {
          nifEmisor: 'B12345678',
          numSerieFactura: 'F250001',
          fechaExpedicion: '15-01-2025',
          huella: 'firsthash',
        },
      })

      expect(xml).not.toContain('<sf:PrimerRegistro>')
      expect(xml).toContain('<sf:RegistroAnterior>')
      expect(xml).toContain('<sf:IDEmisorFactura>B12345678</sf:IDEmisorFactura>')
      // The encadenamiento should have the previous record's serie and fecha
      expect(xml).toContain('F250001')
      expect(xml).toContain('15-01-2025')
      expect(xml).toContain('<sf:Huella>firsthash</sf:Huella>')
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
        descripcionOperacion: 'Rectificación',
        desglose: [
          {
            claveRegimen: '01',
            calificacionOperacion: 'S1',
            tipoImpositivo: '21.00',
            baseImponible: '500.00',
            cuotaRepercutida: '105.00',
          },
        ],
        cuotaTotal: '105.00',
        importeTotal: '605.00',
        huella: 'xyz789',
        huellaAnterior: 'prevhash123',
        fechaHoraHusoGenRegistro: '2025-01-20T12:00:00+01:00',
        registroAnterior: {
          nifEmisor: 'B12345678',
          numSerieFactura: 'F250001',
          fechaExpedicion: '15-01-2025',
          huella: 'prevhash123',
        },
        rectificativa: {
          tipoRectificativa: 'S',
          facturasRectificadas: [
            {
              numSerieFactura: 'F250001',
              fechaExpedicion: '15-01-2025',
            },
          ],
        },
      })

      expect(xml).toContain('<sf:FacturasRectificadas>')
      expect(xml).toContain('<sf:IDFacturaRectificada>')
      expect(xml).toContain('<sf:TipoRectificativa>S</sf:TipoRectificativa>')
      expect(xml).not.toContain('<sf:PrimerRegistro>')
      expect(xml).toContain('prevhash123')
    })

    it('should include ImporteRectificacion for substitution type', () => {
      const xml = generateRegistroAltaXml({
        nifEmisor: 'B12345678',
        nombreRazonEmisor: 'Gestora SL',
        numSerieFactura: 'R250001',
        fechaExpedicion: '20-01-2025',
        tipoFactura: 'R4',
        descripcionOperacion: 'Rectificación por sustitución',
        desglose: [
          { claveRegimen: '01', calificacionOperacion: 'S1', tipoImpositivo: '21.00', baseImponible: '600.00', cuotaRepercutida: '126.00' },
        ],
        cuotaTotal: '126.00',
        importeTotal: '726.00',
        huella: 'recthash',
        huellaAnterior: '',
        fechaHoraHusoGenRegistro: '2025-01-20T12:00:00+01:00',
        rectificativa: {
          tipoRectificativa: 'S',
          facturasRectificadas: [{ numSerieFactura: 'F250001', fechaExpedicion: '15-01-2025' }],
          importeRectificacion: {
            baseRectificada: '500.00',
            cuotaRectificada: '105.00',
          },
        },
      })

      expect(xml).toContain('<sf:ImporteRectificacion>')
      expect(xml).toContain('<sf:BaseRectificada>500.00</sf:BaseRectificada>')
      expect(xml).toContain('<sf:CuotaRectificada>105.00</sf:CuotaRectificada>')
    })

    it('should handle multiple desglose lines', () => {
      const xml = generateRegistroAltaXml({
        nifEmisor: 'B12345678',
        nombreRazonEmisor: 'Gestora SL',
        numSerieFactura: 'F250001',
        fechaExpedicion: '15-01-2025',
        tipoFactura: 'F1',
        descripcionOperacion: 'Mixed rates',
        desglose: [
          { claveRegimen: '01', calificacionOperacion: 'S1', tipoImpositivo: '21.00', baseImponible: '1000.00', cuotaRepercutida: '210.00' },
          { claveRegimen: '01', calificacionOperacion: 'S1', tipoImpositivo: '10.00', baseImponible: '500.00', cuotaRepercutida: '50.00' },
          { claveRegimen: '01', operacionExenta: 'E1', baseImponible: '200.00' },
        ],
        cuotaTotal: '260.00',
        importeTotal: '1960.00',
        huella: 'hash',
        huellaAnterior: '',
        fechaHoraHusoGenRegistro: '2025-01-15T10:00:00+01:00',
      })

      // Should have 3 DetalleDesglose elements
      const desgloseMatches = xml.match(/<sf:DetalleDesglose>/g)
      expect(desgloseMatches?.length).toBe(3)

      // Exempt line should use OperacionExenta instead of CalificacionOperacion
      expect(xml).toContain('<sf:OperacionExenta>E1</sf:OperacionExenta>')

      // Non-exempt lines should have CalificacionOperacion
      const calificacionMatches = xml.match(/<sf:CalificacionOperacion>S1<\/sf:CalificacionOperacion>/g)
      expect(calificacionMatches?.length).toBe(2)
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
        descripcionOperacion: 'Test',
        desglose: [
          { claveRegimen: '01', calificacionOperacion: 'S1', tipoImpositivo: '21.00', baseImponible: '100.00', cuotaRepercutida: '21.00' },
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
        numSerieFactura: 'F250001',
        fechaExpedicion: '15-01-2025',
        huella: 'cancelhash',
        huellaAnterior: 'prevhash',
        fechaHoraHusoGenRegistro: '2025-01-16T10:00:00+01:00',
        registroAnterior: {
          nifEmisor: 'B12345678',
          numSerieFactura: 'F250001',
          fechaExpedicion: '15-01-2025',
          huella: 'prevhash',
        },
      })

      expect(xml).toContain('<sf:RegistroAnulacion')
      expect(xml).toContain('SuministroInformacion.xsd')
      // Anulación uses different field names per XSD
      expect(xml).toContain('<sf:IDEmisorFacturaAnulada>B12345678</sf:IDEmisorFacturaAnulada>')
      expect(xml).toContain('<sf:NumSerieFacturaAnulada>F250001</sf:NumSerieFacturaAnulada>')
      expect(xml).toContain('<sf:FechaExpedicionFacturaAnulada>15-01-2025</sf:FechaExpedicionFacturaAnulada>')
      expect(xml).toContain('<sf:Huella>cancelhash</sf:Huella>')
      expect(xml).toContain('<sf:TipoHuella>01</sf:TipoHuella>')
    })

    it('should mark first record when no previous hash', () => {
      const xml = generateRegistroAnulacionXml({
        nifEmisor: 'B12345678',
        numSerieFactura: 'F250001',
        fechaExpedicion: '15-01-2025',
        huella: 'cancelhash',
        huellaAnterior: '',
        fechaHoraHusoGenRegistro: '2025-01-16T10:00:00+01:00',
      })

      expect(xml).toContain('<sf:PrimerRegistro>S</sf:PrimerRegistro>')
    })
  })

  describe('generateSOAPEnvelope', () => {
    it('should wrap registros in a SOAP envelope with correct structure', () => {
      const registroXml = '<sf:RegistroAlta>test</sf:RegistroAlta>'
      const soap = generateSOAPEnvelope(
        [registroXml],
        { nif: 'B12345678', nombreRazon: 'Gestora SL' }
      )

      expect(soap).toContain('soapenv:Envelope')
      expect(soap).toContain('soapenv:Body')
      expect(soap).toContain('<sf:RegistroAlta>test</sf:RegistroAlta>')
      // Correct root element per WSDL
      expect(soap).toContain('sfLR:RegFactuSistemaFacturacion')
      // Cabecera with NIF and NombreRazon
      expect(soap).toContain('<sf:Cabecera>')
      expect(soap).toContain('<sf:ObligadoEmision>')
      expect(soap).toContain('<sf:NIF>B12345678</sf:NIF>')
      expect(soap).toContain('<sf:NombreRazon>Gestora SL</sf:NombreRazon>')
      // Correct namespaces
      expect(soap).toContain('SuministroInformacion.xsd')
      expect(soap).toContain('SuministroLR.xsd')
    })

    it('should wrap multiple registros', () => {
      const registros = [
        '<sf:RegistroAlta>invoice1</sf:RegistroAlta>',
        '<sf:RegistroAlta>invoice2</sf:RegistroAlta>',
      ]
      const soap = generateSOAPEnvelope(
        registros,
        { nif: 'B12345678', nombreRazon: 'Test SL' }
      )

      expect(soap).toContain('invoice1')
      expect(soap).toContain('invoice2')
      // Each registro should be wrapped in RegistroFactura
      const facturaMatches = soap.match(/sfLR:RegistroFactura/g)
      // 2 opening + 2 closing = 4
      expect(facturaMatches?.length).toBe(4)
    })
  })
})
