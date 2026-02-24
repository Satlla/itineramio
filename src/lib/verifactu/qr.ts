/**
 * VeriFactu QR Code Generation
 * Generates the "QR tributario" required on each VeriFactu-compliant invoice.
 *
 * Requirements:
 * - Size: 30x40mm on printed invoice
 * - Label: "QR tributario"
 * - URL: AEAT validation endpoint
 * - Text "VERI*FACTU" must appear on the invoice
 */

import QRCode from 'qrcode'

const AEAT_QR_BASE_URL = 'https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR'

export interface VerifactuQRInput {
  /** NIF del emisor */
  nif: string
  /** Número serie + número factura (e.g. "F250001") */
  numSerie: string
  /** Fecha expedición DD-MM-YYYY */
  fecha: string
  /** Importe total de la factura */
  importe: string
}

/**
 * Builds the AEAT validation URL for the QR code.
 */
export function getVerifactuQRUrl(input: VerifactuQRInput): string {
  const params = new URLSearchParams({
    nif: input.nif,
    numserie: input.numSerie,
    fecha: input.fecha,
    importe: input.importe,
  })
  return `${AEAT_QR_BASE_URL}?${params.toString()}`
}

/**
 * Generates a QR code as a base64-encoded PNG data URL.
 * The QR encodes the AEAT validation URL.
 */
export async function generateVerifactuQR(input: VerifactuQRInput): Promise<string> {
  const url = getVerifactuQRUrl(input)

  const qrDataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 150, // pixels — scaled to 30x40mm in PDF via CSS
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  })

  return qrDataUrl
}

/**
 * Generates a QR code as an SVG string (useful for HTML embedding).
 */
export async function generateVerifactuQRSvg(input: VerifactuQRInput): Promise<string> {
  const url = getVerifactuQRUrl(input)

  return QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 150,
  })
}
