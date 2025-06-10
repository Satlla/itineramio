import QRCode from 'qrcode'

export interface QRCodeOptions {
  width?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
}

/**
 * Generate QR code for a zone
 * @param propertyId - Property ID
 * @param zoneId - Zone ID
 * @param options - QR code generation options
 * @returns Base64 encoded QR code image
 */
export async function generateZoneQRCode(
  propertyId: string,
  zoneId: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://manualphi.com'}/guide/${propertyId}/${zoneId}`
  
  const qrOptions = {
    width: options.width || 300,
    margin: options.margin || 2,
    color: {
      dark: options.color?.dark || '#6366f1', // violet-500
      light: options.color?.light || '#ffffff'
    },
    errorCorrectionLevel: 'M' as const
  }
  
  try {
    const qrCodeDataURL = await QRCode.toDataURL(url, qrOptions)
    return qrCodeDataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Generate QR code for entire property
 * @param propertyId - Property ID
 * @param options - QR code generation options
 * @returns Base64 encoded QR code image
 */
export async function generatePropertyQRCode(
  propertyId: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://manualphi.com'}/guide/${propertyId}`
  
  const qrOptions = {
    width: options.width || 300,
    margin: options.margin || 2,
    color: {
      dark: options.color?.dark || '#6366f1', // violet-500
      light: options.color?.light || '#ffffff'
    },
    errorCorrectionLevel: 'M' as const
  }
  
  try {
    const qrCodeDataURL = await QRCode.toDataURL(url, qrOptions)
    return qrCodeDataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Generate QR code as SVG string
 * @param url - URL to encode
 * @param options - QR code generation options
 * @returns SVG string
 */
export async function generateQRCodeSVG(
  url: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const qrOptions = {
    width: options.width || 300,
    margin: options.margin || 2,
    color: {
      dark: options.color?.dark || '#6366f1',
      light: options.color?.light || '#ffffff'
    },
    errorCorrectionLevel: 'M' as const
  }
  
  try {
    const svgString = await QRCode.toString(url, { 
      type: 'svg',
      ...qrOptions
    })
    return svgString
  } catch (error) {
    console.error('Error generating QR code SVG:', error)
    throw new Error('Failed to generate QR code SVG')
  }
}

/**
 * Download QR code as image file
 * @param qrCodeDataURL - Base64 QR code data URL
 * @param filename - Filename for download
 */
export function downloadQRCode(qrCodeDataURL: string, filename: string = 'qr-code.png') {
  const link = document.createElement('a')
  link.href = qrCodeDataURL
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Get zone URL for QR code
 * @param propertyId - Property ID
 * @param zoneId - Zone ID (optional, for property-wide QR)
 * @returns Public URL for the zone/property
 */
export function getZoneURL(propertyId: string, zoneId?: string): string {
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'https://manualphi.com'
  
  if (zoneId) {
    return `${baseURL}/guide/${propertyId}/${zoneId}`
  }
  
  return `${baseURL}/guide/${propertyId}`
}