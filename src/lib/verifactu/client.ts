/**
 * Verifacti API Client
 * REST client for https://api.verifacti.com
 *
 * Handles invoice submission, status checking, and cancellation
 * via the Verifacti third-party service that manages AEAT communication.
 */

const VERIFACTI_BASE_URL = 'https://api.verifacti.com'

export interface VerifactiLineItem {
  base_imponible: string
  tipo_impositivo?: string
  cuota_repercutida?: string
  /** E1-E8 for exempt operations */
  operacion_exenta?: string
  /** N1-N9 for non-subject operations */
  calificacion_operacion?: string
  /** 01=IVA, 02=IPSI, 03=IGIC */
  impuesto?: string
}

export interface VerifactiCreateRequest {
  serie: string
  numero: string
  /** DD-MM-YYYY or "CURRENT_DATE" */
  fecha_expedicion: string
  /** F1, F2, F3, R1, R5 */
  tipo_factura: string
  descripcion: string
  /** Recipient NIF (required for F1) */
  nif?: string
  /** Recipient name */
  nombre: string
  lineas: VerifactiLineItem[]
  importe_total: string
}

export interface VerifactiCreateResponse {
  uuid: string
  qr_base64: string
  qr_url: string
  status: string // "Pendiente"
}

export interface VerifactiStatusResponse {
  uuid: string
  status: string
  // Possible values: Pendiente, Correcto, Aceptado con errores,
  // Incorrecto, Duplicado, Anulado, Factura inexistente, No registrado, Error servidor AEAT
  error_code?: string
  error_message?: string
}

export interface VerifactiError {
  error: string
  details?: string
}

/**
 * Submit an invoice to Verifacti for AEAT registration.
 * Returns UUID for tracking + QR code.
 */
export async function verifactiCreateInvoice(
  apiKey: string,
  data: VerifactiCreateRequest
): Promise<{ success: true; data: VerifactiCreateResponse } | { success: false; error: string }> {
  try {
    const response = await fetch(`${VERIFACTI_BASE_URL}/verifactu/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      const result = await response.json()
      return { success: true, data: result }
    }

    if (response.status === 400) {
      const error = await response.json().catch(() => ({ error: 'Datos de factura inválidos' }))
      return { success: false, error: error.error || 'Error de validación en Verifacti' }
    }

    return { success: false, error: `Error Verifacti: HTTP ${response.status}` }
  } catch (err) {
    console.error('Error calling Verifacti create:', err)
    return { success: false, error: 'Error de conexión con Verifacti' }
  }
}

/**
 * Check the processing status of a previously submitted invoice.
 */
export async function verifactiGetStatus(
  apiKey: string,
  uuid: string
): Promise<{ success: true; data: VerifactiStatusResponse } | { success: false; error: string }> {
  try {
    const response = await fetch(`${VERIFACTI_BASE_URL}/verifactu/status?uuid=${encodeURIComponent(uuid)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (response.ok) {
      const result = await response.json()
      return { success: true, data: result }
    }

    return { success: false, error: `Error Verifacti: HTTP ${response.status}` }
  } catch (err) {
    console.error('Error calling Verifacti status:', err)
    return { success: false, error: 'Error de conexión con Verifacti' }
  }
}

/**
 * Cancel (annul) a previously submitted invoice in AEAT.
 */
export async function verifactiCancelInvoice(
  apiKey: string,
  data: {
    serie: string
    numero: string
    fecha_expedicion: string
  },
  options?: {
    rechazo_previo?: 'S' | 'N'
    sin_registro_previo?: 'S' | 'N'
  }
): Promise<{ success: true; data: { uuid: string; status: string } } | { success: false; error: string }> {
  try {
    const params = new URLSearchParams()
    if (options?.rechazo_previo) params.set('rechazo_previo', options.rechazo_previo)
    if (options?.sin_registro_previo) params.set('sin_registro_previo', options.sin_registro_previo)

    const queryString = params.toString() ? `?${params.toString()}` : ''

    const response = await fetch(`${VERIFACTI_BASE_URL}/verifactu/cancel${queryString}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      const result = await response.json()
      return { success: true, data: result }
    }

    if (response.status === 400) {
      const error = await response.json().catch(() => ({ error: 'Error al anular' }))
      return { success: false, error: error.error || 'Error de validación en anulación' }
    }

    return { success: false, error: `Error Verifacti: HTTP ${response.status}` }
  } catch (err) {
    console.error('Error calling Verifacti cancel:', err)
    return { success: false, error: 'Error de conexión con Verifacti' }
  }
}

/**
 * Maps Verifacti status strings to our VerifactuStatus enum values.
 */
export function mapVerifactiStatus(verifactiStatus: string): 'PENDING' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'ERROR' {
  switch (verifactiStatus) {
    case 'Pendiente':
      return 'PENDING'
    case 'Correcto':
    case 'Aceptado con errores':
      return 'ACCEPTED'
    case 'Incorrecto':
    case 'Duplicado':
      return 'REJECTED'
    case 'Anulado':
      return 'ACCEPTED' // Cancellation was accepted
    case 'Error servidor AEAT':
    case 'No registrado':
    case 'Factura inexistente':
      return 'ERROR'
    default:
      return 'PENDING'
  }
}

/**
 * Builds the Verifacti create request from itineramio invoice data.
 */
export function buildVerifactiRequest(invoice: {
  fullNumber: string
  issueDate: Date
  isRectifying: boolean
  total: number
  totalVat: number
  items: Array<{
    concept: string
    quantity: number
    unitPrice: number
    vatRate: number
  }>
  owner: {
    type: string
    firstName?: string | null
    lastName?: string | null
    companyName?: string | null
    nif?: string | null
    cif?: string | null
  }
  series: {
    prefix: string
  }
}): VerifactiCreateRequest {
  // Extract serie and numero from fullNumber (e.g. "F250001" -> serie "F25", numero "0001")
  const prefix = invoice.series.prefix
  const numero = invoice.fullNumber.replace(prefix, '')

  // Determine invoice type
  const tipoFactura = invoice.isRectifying ? 'R1' : 'F1'

  // Recipient name
  const nombre = invoice.owner.type === 'EMPRESA'
    ? invoice.owner.companyName || 'Empresa'
    : `${invoice.owner.firstName || ''} ${invoice.owner.lastName || ''}`.trim() || 'Cliente'

  // Recipient NIF
  const nif = invoice.owner.type === 'EMPRESA'
    ? invoice.owner.cif || undefined
    : invoice.owner.nif || undefined

  // Format date as DD-MM-YYYY
  const d = invoice.issueDate
  const fecha = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`

  // Build line items grouped by VAT rate
  const vatGroups: Record<number, { base: number; vat: number }> = {}
  for (const item of invoice.items) {
    const base = item.quantity * item.unitPrice
    const vat = base * (item.vatRate / 100)
    if (!vatGroups[item.vatRate]) {
      vatGroups[item.vatRate] = { base: 0, vat: 0 }
    }
    vatGroups[item.vatRate].base += base
    vatGroups[item.vatRate].vat += vat
  }

  const lineas: VerifactiLineItem[] = Object.entries(vatGroups).map(([rate, { base, vat }]) => ({
    base_imponible: base.toFixed(2),
    tipo_impositivo: Number(rate).toFixed(2),
    cuota_repercutida: vat.toFixed(2),
  }))

  // Description from first item concept or generic
  const descripcion = invoice.items.length === 1
    ? invoice.items[0].concept
    : `Servicios de gestión (${invoice.items.length} conceptos)`

  return {
    serie: prefix,
    numero,
    fecha_expedicion: fecha,
    tipo_factura: tipoFactura,
    descripcion,
    nif,
    nombre,
    lineas,
    importe_total: invoice.total.toFixed(2),
  }
}
