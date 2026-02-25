/**
 * VeriFactu XML Generation
 * Generates RegistroAlta and RegistroAnulacion XML documents
 * per AEAT's XSD specification for VeriFactu SOAP submissions.
 *
 * Namespaces per AEAT official XSD:
 * - sf: SuministroInformacion (types)
 * - sfLR: SuministroLR (operations)
 *
 * Refs:
 * - https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/informacion-tecnica/wsdl-servicios-web.html
 * - https://www.b2brouter.net/es/ejemplo-xml-verifactu/
 * - https://www.nemon.io/invocash/ejemplo-xml-api-verifactu/
 */

import type { AEATInvoiceType } from '@prisma/client'

const SF_NAMESPACE = 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd'
const SFLR_NAMESPACE = 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroLR.xsd'
const SOAP_NAMESPACE = 'http://schemas.xmlsoap.org/soap/envelope/'

/**
 * Software identification per VeriFactu spec (SistemaInformaticoType).
 * Can be overridden at runtime via the `softwareInfo` parameter.
 */
export interface SoftwareInfo {
  /** Software manufacturer name (NombreRazon) */
  nombreRazon: string
  /** Software manufacturer NIF (for Spanish companies) */
  nifFabricante: string
  /** Software product name (max 30 chars) */
  nombreSistema: string
  /** Software ID (max 2 chars) */
  idSistema: string
  /** Software version (max 50 chars) */
  version: string
  /** Installation number (max 100 chars) */
  numeroInstalacion: string
  /** S = VeriFactu-only system, N = also supports non-VeriFactu */
  soloVerifactu: 'S' | 'N'
  /** S = supports multiple taxpayers, N = single taxpayer */
  multiOT: 'S' | 'N'
  /** S = currently serving multiple taxpayers, N = just one */
  indicadorMultiplesOT: 'S' | 'N'
}

const DEFAULT_SOFTWARE_INFO: SoftwareInfo = {
  nombreRazon: process.env.VERIFACTU_SOFTWARE_NOMBRE_RAZON || 'Itineramio SL',
  nifFabricante: process.env.VERIFACTU_SOFTWARE_NIF || 'B12345678',
  nombreSistema: 'Itineramio Gestion',
  idSistema: 'IT',
  version: '2.0.0',
  numeroInstalacion: process.env.VERIFACTU_INSTALACION || '1',
  soloVerifactu: 'S',
  multiOT: 'S',
  indicadorMultiplesOT: 'S',
}

/** Calificacion de operacion for VAT detail lines */
export type CalificacionOperacion = 'S1' | 'S2' | 'N1' | 'N2'
/** Operacion exenta codes */
export type OperacionExenta = 'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'E6'

export interface DesgloseDetail {
  /** Tax type: 01=IVA, 02=IPSI, 03=IGIC, 05=Other */
  impuesto?: string
  /** Tax regime key (01-20) */
  claveRegimen: string
  /** Required: S1 (subject, no reverse charge), S2 (subject, reverse charge) */
  calificacionOperacion?: CalificacionOperacion
  /** For exempt operations (E1-E6) — mutually exclusive with calificacionOperacion */
  operacionExenta?: OperacionExenta
  /** Tax rate (e.g. "21.00") */
  tipoImpositivo?: string
  /** Taxable base or non-subject amount */
  baseImponible: string
  /** VAT amount charged */
  cuotaRepercutida?: string
  /** Equivalence surcharge rate */
  tipoRecargoEquivalencia?: string
  /** Equivalence surcharge amount */
  cuotaRecargoEquivalencia?: string
}

export interface RegistroAltaData {
  // Emisor
  nifEmisor: string
  nombreRazonEmisor: string

  // Receptor (optional per XSD, but included for F1 invoices)
  nifReceptor?: string
  nombreRazonReceptor?: string

  // Factura
  numSerieFactura: string
  fechaExpedicion: string // DD-MM-YYYY
  tipoFactura: AEATInvoiceType
  descripcionOperacion: string

  // Desglose (max 12 detail lines per XSD)
  desglose: DesgloseDetail[]

  // Totales
  cuotaTotal: string
  importeTotal: string

  // Encadenamiento
  huella: string
  huellaAnterior: string
  fechaHoraHusoGenRegistro: string

  // For linking to previous record in chain (required when huellaAnterior is not empty)
  registroAnterior?: {
    nifEmisor: string
    numSerieFactura: string
    fechaExpedicion: string
    huella: string
  }

  // Factura rectificativa (optional)
  rectificativa?: {
    tipoRectificativa: 'S' | 'I' // Sustitución | Por diferencias
    facturasRectificadas: Array<{
      numSerieFactura: string
      fechaExpedicion: string
    }>
    // Only for sustitución type (S): original amounts
    importeRectificacion?: {
      baseRectificada: string
      cuotaRectificada: string
    }
  }

  // Software info override (optional)
  softwareInfo?: SoftwareInfo
}

export interface RegistroAnulacionData {
  nifEmisor: string
  numSerieFactura: string
  fechaExpedicion: string
  huella: string
  huellaAnterior: string
  fechaHoraHusoGenRegistro: string

  // For linking to previous record in chain
  registroAnterior?: {
    nifEmisor: string
    numSerieFactura: string
    fechaExpedicion: string
    huella: string
  }

  // Software info override (optional)
  softwareInfo?: SoftwareInfo
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

function generateSistemaInformaticoXml(info: SoftwareInfo): string {
  return `<sf:SistemaInformatico>
    <sf:NombreRazon>${escapeXml(info.nombreRazon)}</sf:NombreRazon>
    <sf:NIF>${escapeXml(info.nifFabricante)}</sf:NIF>
    <sf:NombreSistemaInformatico>${escapeXml(info.nombreSistema)}</sf:NombreSistemaInformatico>
    <sf:IdSistemaInformatico>${escapeXml(info.idSistema)}</sf:IdSistemaInformatico>
    <sf:Version>${escapeXml(info.version)}</sf:Version>
    <sf:NumeroInstalacion>${escapeXml(info.numeroInstalacion)}</sf:NumeroInstalacion>
    <sf:TipoUsoPosibleSoloVerifactu>${info.soloVerifactu}</sf:TipoUsoPosibleSoloVerifactu>
    <sf:TipoUsoPosibleMultiOT>${info.multiOT}</sf:TipoUsoPosibleMultiOT>
    <sf:IndicadorMultiplesOT>${info.indicadorMultiplesOT}</sf:IndicadorMultiplesOT>
  </sf:SistemaInformatico>`
}

function generateEncadenamientoXml(
  huellaAnterior: string,
  registroAnterior?: { nifEmisor: string; numSerieFactura: string; fechaExpedicion: string; huella: string }
): string {
  if (!huellaAnterior) {
    // First record in the chain
    return `<sf:Encadenamiento>
    <sf:PrimerRegistro>S</sf:PrimerRegistro>
  </sf:Encadenamiento>`
  }

  // Chained record — must include full previous record identification per XSD
  if (registroAnterior) {
    return `<sf:Encadenamiento>
    <sf:RegistroAnterior>
      <sf:IDEmisorFactura>${escapeXml(registroAnterior.nifEmisor)}</sf:IDEmisorFactura>
      <sf:NumSerieFactura>${escapeXml(registroAnterior.numSerieFactura)}</sf:NumSerieFactura>
      <sf:FechaExpedicionFactura>${escapeXml(registroAnterior.fechaExpedicion)}</sf:FechaExpedicionFactura>
      <sf:Huella>${escapeXml(registroAnterior.huella)}</sf:Huella>
    </sf:RegistroAnterior>
  </sf:Encadenamiento>`
  }

  // Fallback: only hash (less strict but still valid for Verifacti intermediary)
  return `<sf:Encadenamiento>
    <sf:RegistroAnterior>
      <sf:Huella>${escapeXml(huellaAnterior)}</sf:Huella>
    </sf:RegistroAnterior>
  </sf:Encadenamiento>`
}

/**
 * Generates the XML for a RegistroAlta (invoice issuance record).
 * Per AEAT XSD: RegistroFacturacionAltaType
 */
export function generateRegistroAltaXml(data: RegistroAltaData): string {
  const sw = data.softwareInfo || DEFAULT_SOFTWARE_INFO

  // Build Desglose: each detail is a separate DetalleDesglose element (max 12)
  const desgloseLines = data.desglose.map(d => {
    let detailContent = ''

    if (d.impuesto) {
      detailContent += `\n        <sf:Impuesto>${escapeXml(d.impuesto)}</sf:Impuesto>`
    }
    detailContent += `\n        <sf:ClaveRegimen>${escapeXml(d.claveRegimen)}</sf:ClaveRegimen>`

    // CalificacionOperacion OR OperacionExenta (mutually exclusive per XSD)
    if (d.operacionExenta) {
      detailContent += `\n        <sf:OperacionExenta>${d.operacionExenta}</sf:OperacionExenta>`
    } else if (d.calificacionOperacion) {
      detailContent += `\n        <sf:CalificacionOperacion>${d.calificacionOperacion}</sf:CalificacionOperacion>`
    }

    if (d.tipoImpositivo) {
      detailContent += `\n        <sf:TipoImpositivo>${escapeXml(d.tipoImpositivo)}</sf:TipoImpositivo>`
    }
    detailContent += `\n        <sf:BaseImponibleOimporteNoSujeto>${escapeXml(d.baseImponible)}</sf:BaseImponibleOimporteNoSujeto>`
    if (d.cuotaRepercutida) {
      detailContent += `\n        <sf:CuotaRepercutida>${escapeXml(d.cuotaRepercutida)}</sf:CuotaRepercutida>`
    }
    if (d.tipoRecargoEquivalencia) {
      detailContent += `\n        <sf:TipoRecargoEquivalencia>${escapeXml(d.tipoRecargoEquivalencia)}</sf:TipoRecargoEquivalencia>`
    }
    if (d.cuotaRecargoEquivalencia) {
      detailContent += `\n        <sf:CuotaRecargoEquivalencia>${escapeXml(d.cuotaRecargoEquivalencia)}</sf:CuotaRecargoEquivalencia>`
    }

    return `\n      <sf:DetalleDesglose>${detailContent}\n      </sf:DetalleDesglose>`
  }).join('')

  // Build Rectificativa section if applicable
  let rectificativaXml = ''
  if (data.rectificativa) {
    rectificativaXml += `\n  <sf:TipoRectificativa>${data.rectificativa.tipoRectificativa}</sf:TipoRectificativa>`

    // References to corrected invoices
    const refs = data.rectificativa.facturasRectificadas.map(ref => `
    <sf:IDFacturaRectificada>
      <sf:NumSerieFactura>${escapeXml(ref.numSerieFactura)}</sf:NumSerieFactura>
      <sf:FechaExpedicionFactura>${escapeXml(ref.fechaExpedicion)}</sf:FechaExpedicionFactura>
    </sf:IDFacturaRectificada>`).join('')

    rectificativaXml += `\n  <sf:FacturasRectificadas>${refs}\n  </sf:FacturasRectificadas>`

    // ImporteRectificacion for substitution type
    if (data.rectificativa.tipoRectificativa === 'S' && data.rectificativa.importeRectificacion) {
      rectificativaXml += `\n  <sf:ImporteRectificacion>
    <sf:BaseRectificada>${escapeXml(data.rectificativa.importeRectificacion.baseRectificada)}</sf:BaseRectificada>
    <sf:CuotaRectificada>${escapeXml(data.rectificativa.importeRectificacion.cuotaRectificada)}</sf:CuotaRectificada>
  </sf:ImporteRectificacion>`
    }
  }

  // Build Destinatarios section
  let destinatariosXml = ''
  if (data.nifReceptor || data.nombreRazonReceptor) {
    destinatariosXml = `\n  <sf:Destinatarios>
    <sf:IDDestinatario>${data.nifReceptor ? `\n      <sf:NIF>${escapeXml(data.nifReceptor)}</sf:NIF>` : ''}
      <sf:NombreRazon>${escapeXml(data.nombreRazonReceptor || '')}</sf:NombreRazon>
    </sf:IDDestinatario>
  </sf:Destinatarios>`
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<sf:RegistroAlta xmlns:sf="${SF_NAMESPACE}">
  <sf:IDVersion>1.0</sf:IDVersion>
  <sf:IDFactura>
    <sf:IDEmisorFactura>${escapeXml(data.nifEmisor)}</sf:IDEmisorFactura>
    <sf:NumSerieFactura>${escapeXml(data.numSerieFactura)}</sf:NumSerieFactura>
    <sf:FechaExpedicionFactura>${escapeXml(data.fechaExpedicion)}</sf:FechaExpedicionFactura>
  </sf:IDFactura>
  <sf:NombreRazonEmisor>${escapeXml(data.nombreRazonEmisor)}</sf:NombreRazonEmisor>
  <sf:TipoFactura>${data.tipoFactura}</sf:TipoFactura>${rectificativaXml}
  <sf:DescripcionOperacion>${escapeXml(data.descripcionOperacion)}</sf:DescripcionOperacion>${destinatariosXml}
  <sf:Desglose>${desgloseLines}
  </sf:Desglose>
  <sf:CuotaTotal>${escapeXml(data.cuotaTotal)}</sf:CuotaTotal>
  <sf:ImporteTotal>${escapeXml(data.importeTotal)}</sf:ImporteTotal>
  ${generateEncadenamientoXml(data.huellaAnterior, data.registroAnterior)}
  ${generateSistemaInformaticoXml(sw)}
  <sf:FechaHoraHusoGenRegistro>${escapeXml(data.fechaHoraHusoGenRegistro)}</sf:FechaHoraHusoGenRegistro>
  <sf:TipoHuella>01</sf:TipoHuella>
  <sf:Huella>${escapeXml(data.huella)}</sf:Huella>
</sf:RegistroAlta>`
}

/**
 * Generates the XML for a RegistroAnulacion (invoice cancellation record).
 * Per AEAT XSD: RegistroFacturacionAnulacionType
 *
 * Note: The XSD uses different field names for cancellation:
 * - IDEmisorFacturaAnulada (not IDEmisorFactura)
 * - NumSerieFacturaAnulada (not NumSerieFactura)
 * - FechaExpedicionFacturaAnulada (not FechaExpedicionFactura)
 */
export function generateRegistroAnulacionXml(data: RegistroAnulacionData): string {
  const sw = data.softwareInfo || DEFAULT_SOFTWARE_INFO

  return `<?xml version="1.0" encoding="UTF-8"?>
<sf:RegistroAnulacion xmlns:sf="${SF_NAMESPACE}">
  <sf:IDVersion>1.0</sf:IDVersion>
  <sf:IDFactura>
    <sf:IDEmisorFacturaAnulada>${escapeXml(data.nifEmisor)}</sf:IDEmisorFacturaAnulada>
    <sf:NumSerieFacturaAnulada>${escapeXml(data.numSerieFactura)}</sf:NumSerieFacturaAnulada>
    <sf:FechaExpedicionFacturaAnulada>${escapeXml(data.fechaExpedicion)}</sf:FechaExpedicionFacturaAnulada>
  </sf:IDFactura>
  ${generateEncadenamientoXml(data.huellaAnterior, data.registroAnterior)}
  ${generateSistemaInformaticoXml(sw)}
  <sf:FechaHoraHusoGenRegistro>${escapeXml(data.fechaHoraHusoGenRegistro)}</sf:FechaHoraHusoGenRegistro>
  <sf:TipoHuella>01</sf:TipoHuella>
  <sf:Huella>${escapeXml(data.huella)}</sf:Huella>
</sf:RegistroAnulacion>`
}

/**
 * Wraps one or more RegistroAlta/Anulacion XMLs in a SOAP envelope
 * for direct submission to AEAT.
 *
 * Per WSDL: root element is RegFactuSistemaFacturacion,
 * with Cabecera (header) containing ObligadoEmision NIF + NombreRazon.
 */
export function generateSOAPEnvelope(
  registrosXml: string[],
  obligado: { nif: string; nombreRazon: string }
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="${SOAP_NAMESPACE}" xmlns:sf="${SF_NAMESPACE}" xmlns:sfLR="${SFLR_NAMESPACE}">
  <soapenv:Header/>
  <soapenv:Body>
    <sfLR:RegFactuSistemaFacturacion>
      <sf:Cabecera>
        <sf:ObligadoEmision>
          <sf:NombreRazon>${escapeXml(obligado.nombreRazon)}</sf:NombreRazon>
          <sf:NIF>${escapeXml(obligado.nif)}</sf:NIF>
        </sf:ObligadoEmision>
      </sf:Cabecera>
      ${registrosXml.map(xml => `<sfLR:RegistroFactura>\n        ${xml}\n      </sfLR:RegistroFactura>`).join('\n      ')}
    </sfLR:RegFactuSistemaFacturacion>
  </soapenv:Body>
</soapenv:Envelope>`
}

// Re-export the default software info for use when configuring
export { DEFAULT_SOFTWARE_INFO }
