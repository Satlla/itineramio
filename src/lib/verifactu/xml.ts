/**
 * VeriFactu XML Generation
 * Generates RegistroAlta and RegistroAnulacion XML documents
 * per AEAT's XSD specification for VeriFactu SOAP submissions.
 */

import type { AEATInvoiceType } from '@prisma/client'

const VERIFACTU_NAMESPACE = 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SusFactuSistemaFacturacion.xsd'
const SOAP_NAMESPACE = 'http://schemas.xmlsoap.org/soap/envelope/'

/** Software identification per VeriFactu spec */
const SOFTWARE_INFO = {
  nombre: 'Itineramio Gestion',
  version: '2.0.0',
  nifFabricante: 'B12345678', // Replace with actual NIF
  nombreRazon: 'Itineramio SL',
}

export interface RegistroAltaData {
  // Emisor
  nifEmisor: string
  nombreRazonEmisor: string

  // Receptor
  nifReceptor: string
  nombreRazonReceptor: string

  // Factura
  numSerieFactura: string
  fechaExpedicion: string // DD-MM-YYYY
  tipoFactura: AEATInvoiceType
  claveRegimenFiscal: string
  descripcionOperacion: string

  // Desglose IVA (one entry per VAT rate)
  desgloseIVA: Array<{
    baseImponible: string
    tipoImpositivo: string
    cuotaRepercutida: string
  }>

  // Totales
  cuotaTotal: string
  importeTotal: string

  // Encadenamiento
  huella: string
  huellaAnterior: string
  fechaHoraHusoGenRegistro: string

  // Factura rectificativa (optional)
  rectificativa?: {
    tipoRectificativa: 'S' | 'I' // Sustitución | Por diferencias
    facturaRectificada: {
      numSerieFactura: string
      fechaExpedicion: string
    }
  }
}

export interface RegistroAnulacionData {
  nifEmisor: string
  nombreRazonEmisor: string
  numSerieFactura: string
  fechaExpedicion: string
  huella: string
  huellaAnterior: string
  fechaHoraHusoGenRegistro: string
}

/**
 * Escapes special XML characters.
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Generates the XML for a RegistroAlta (invoice issuance record).
 */
export function generateRegistroAltaXml(data: RegistroAltaData): string {
  const desgloseLines = data.desgloseIVA.map(d => `
            <sf:DetalleIVA>
              <sf:BaseImponible>${escapeXml(d.baseImponible)}</sf:BaseImponible>
              <sf:TipoImpositivo>${escapeXml(d.tipoImpositivo)}</sf:TipoImpositivo>
              <sf:CuotaRepercutida>${escapeXml(d.cuotaRepercutida)}</sf:CuotaRepercutida>
            </sf:DetalleIVA>`).join('')

  const rectificativaXml = data.rectificativa ? `
          <sf:FacturasRectificadas>
            <sf:IDFacturaRectificada>
              <sf:NumSerieFactura>${escapeXml(data.rectificativa.facturaRectificada.numSerieFactura)}</sf:NumSerieFactura>
              <sf:FechaExpedicionFactura>${escapeXml(data.rectificativa.facturaRectificada.fechaExpedicion)}</sf:FechaExpedicionFactura>
            </sf:IDFacturaRectificada>
          </sf:FacturasRectificadas>
          <sf:TipoRectificativa>${data.rectificativa.tipoRectificativa}</sf:TipoRectificativa>` : ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<sf:RegistroAlta xmlns:sf="${VERIFACTU_NAMESPACE}">
  <sf:IDVersion>1.0</sf:IDVersion>
  <sf:IDFactura>
    <sf:IDEmisorFactura>${escapeXml(data.nifEmisor)}</sf:IDEmisorFactura>
    <sf:NumSerieFactura>${escapeXml(data.numSerieFactura)}</sf:NumSerieFactura>
    <sf:FechaExpedicionFactura>${escapeXml(data.fechaExpedicion)}</sf:FechaExpedicionFactura>
  </sf:IDFactura>
  <sf:NombreRazonEmisor>${escapeXml(data.nombreRazonEmisor)}</sf:NombreRazonEmisor>
  <sf:TipoFactura>${data.tipoFactura}</sf:TipoFactura>${rectificativaXml}
  <sf:DescripcionOperacion>${escapeXml(data.descripcionOperacion)}</sf:DescripcionOperacion>
  <sf:Destinatarios>
    <sf:IDDestinatario>
      <sf:NIF>${escapeXml(data.nifReceptor)}</sf:NIF>
      <sf:NombreRazon>${escapeXml(data.nombreRazonReceptor)}</sf:NombreRazon>
    </sf:IDDestinatario>
  </sf:Destinatarios>
  <sf:Desglose>
    <sf:DetalleDesglose>
      <sf:ClaveRegimen>${escapeXml(data.claveRegimenFiscal)}</sf:ClaveRegimen>${desgloseLines}
    </sf:DetalleDesglose>
  </sf:Desglose>
  <sf:CuotaTotal>${escapeXml(data.cuotaTotal)}</sf:CuotaTotal>
  <sf:ImporteTotal>${escapeXml(data.importeTotal)}</sf:ImporteTotal>
  <sf:Encadenamiento>
    <sf:PrimerRegistro>${data.huellaAnterior === '' ? 'S' : 'N'}</sf:PrimerRegistro>
    ${data.huellaAnterior ? `<sf:RegistroAnterior>
      <sf:Huella>${escapeXml(data.huellaAnterior)}</sf:Huella>
    </sf:RegistroAnterior>` : ''}
  </sf:Encadenamiento>
  <sf:SistemaInformatico>
    <sf:NombreRazon>${escapeXml(SOFTWARE_INFO.nombreRazon)}</sf:NombreRazon>
    <sf:NIF>${escapeXml(SOFTWARE_INFO.nifFabricante)}</sf:NIF>
    <sf:NombreSistemaInformatico>${escapeXml(SOFTWARE_INFO.nombre)}</sf:NombreSistemaInformatico>
    <sf:IdSistemaInformatico>ITINERAMIO</sf:IdSistemaInformatico>
    <sf:Version>${escapeXml(SOFTWARE_INFO.version)}</sf:Version>
    <sf:NumeroInstalacion>1</sf:NumeroInstalacion>
    <sf:TipoUsoPosibleSoloVerifactu>S</sf:TipoUsoPosibleSoloVerifactu>
    <sf:TipoUsoPosibleMultiOT>N</sf:TipoUsoPosibleMultiOT>
    <sf:IndicadorMultiplesOT>N</sf:IndicadorMultiplesOT>
  </sf:SistemaInformatico>
  <sf:FechaHoraHusoGenRegistro>${escapeXml(data.fechaHoraHusoGenRegistro)}</sf:FechaHoraHusoGenRegistro>
  <sf:TipoHuella>01</sf:TipoHuella>
  <sf:Huella>${escapeXml(data.huella)}</sf:Huella>
</sf:RegistroAlta>`
}

/**
 * Generates the XML for a RegistroAnulacion (invoice cancellation record).
 */
export function generateRegistroAnulacionXml(data: RegistroAnulacionData): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sf:RegistroAnulacion xmlns:sf="${VERIFACTU_NAMESPACE}">
  <sf:IDVersion>1.0</sf:IDVersion>
  <sf:IDFactura>
    <sf:IDEmisorFactura>${escapeXml(data.nifEmisor)}</sf:IDEmisorFactura>
    <sf:NumSerieFactura>${escapeXml(data.numSerieFactura)}</sf:NumSerieFactura>
    <sf:FechaExpedicionFactura>${escapeXml(data.fechaExpedicion)}</sf:FechaExpedicionFactura>
  </sf:IDFactura>
  <sf:NombreRazonEmisor>${escapeXml(data.nombreRazonEmisor)}</sf:NombreRazonEmisor>
  <sf:SistemaInformatico>
    <sf:NombreRazon>${escapeXml(SOFTWARE_INFO.nombreRazon)}</sf:NombreRazon>
    <sf:NIF>${escapeXml(SOFTWARE_INFO.nifFabricante)}</sf:NIF>
    <sf:NombreSistemaInformatico>${escapeXml(SOFTWARE_INFO.nombre)}</sf:NombreSistemaInformatico>
    <sf:IdSistemaInformatico>ITINERAMIO</sf:IdSistemaInformatico>
    <sf:Version>${escapeXml(SOFTWARE_INFO.version)}</sf:Version>
    <sf:NumeroInstalacion>1</sf:NumeroInstalacion>
    <sf:TipoUsoPosibleSoloVerifactu>S</sf:TipoUsoPosibleSoloVerifactu>
    <sf:TipoUsoPosibleMultiOT>N</sf:TipoUsoPosibleMultiOT>
    <sf:IndicadorMultiplesOT>N</sf:IndicadorMultiplesOT>
  </sf:SistemaInformatico>
  <sf:Encadenamiento>
    <sf:PrimerRegistro>${data.huellaAnterior === '' ? 'S' : 'N'}</sf:PrimerRegistro>
    ${data.huellaAnterior ? `<sf:RegistroAnterior>
      <sf:Huella>${escapeXml(data.huellaAnterior)}</sf:Huella>
    </sf:RegistroAnterior>` : ''}
  </sf:Encadenamiento>
  <sf:FechaHoraHusoGenRegistro>${escapeXml(data.fechaHoraHusoGenRegistro)}</sf:FechaHoraHusoGenRegistro>
  <sf:TipoHuella>01</sf:TipoHuella>
  <sf:Huella>${escapeXml(data.huella)}</sf:Huella>
</sf:RegistroAnulacion>`
}

/**
 * Wraps one or more RegistroAlta/Anulacion XMLs in a SOAP envelope
 * for submission to AEAT.
 */
export function generateSOAPEnvelope(registrosXml: string[], nifPresentador: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="${SOAP_NAMESPACE}" xmlns:sf="${VERIFACTU_NAMESPACE}">
  <soapenv:Header/>
  <soapenv:Body>
    <sf:SuministroLRFacturasEmitidas>
      <sf:Cabecera>
        <sf:ObligadoEmision>
          <sf:NIF>${escapeXml(nifPresentador)}</sf:NIF>
        </sf:ObligadoEmision>
      </sf:Cabecera>
      <sf:RegistroFactura>
        ${registrosXml.join('\n        ')}
      </sf:RegistroFactura>
    </sf:SuministroLRFacturasEmitidas>
  </soapenv:Body>
</soapenv:Envelope>`
}
