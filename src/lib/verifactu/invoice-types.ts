/**
 * AEAT Invoice Types and Tax Regime Keys for VeriFactu
 * Maps itineramio invoice types to AEAT's classification system.
 */

import type { AEATInvoiceType } from '@prisma/client'

/** AEAT Invoice Type definitions */
export const AEAT_INVOICE_TYPES: Record<AEATInvoiceType, {
  code: AEATInvoiceType
  label: string
  description: string
}> = {
  F1: { code: 'F1', label: 'Factura completa', description: 'Factura completa (art. 6, 7.2 y 7.3 del RD 1619/2012)' },
  F2: { code: 'F2', label: 'Factura simplificada', description: 'Factura simplificada y target equivalentes' },
  F3: { code: 'F3', label: 'Factura emitida en sustitución', description: 'Factura emitida en sustitución de facturas simplificadas' },
  R1: { code: 'R1', label: 'Rectificativa (art. 80.1, 80.2, 80.6)', description: 'Factura rectificativa: art. 80.1, 80.2 y 80.6 LIVA — Errores fundados de derecho' },
  R2: { code: 'R2', label: 'Rectificativa (art. 80.3)', description: 'Factura rectificativa: art. 80.3 LIVA — Concurso de acreedores' },
  R3: { code: 'R3', label: 'Rectificativa (art. 80.4)', description: 'Factura rectificativa: art. 80.4 LIVA — Deuda incobrable' },
  R4: { code: 'R4', label: 'Rectificativa otros', description: 'Factura rectificativa — Resto de causas' },
  R5: { code: 'R5', label: 'Rectificativa simplificada', description: 'Factura rectificativa en facturas simplificadas' },
}

/** Tax regime keys per AEAT classification */
export const TAX_REGIME_KEYS: Record<string, { code: string; label: string; description: string }> = {
  '01': { code: '01', label: 'General', description: 'Régimen general' },
  '02': { code: '02', label: 'Exportación', description: 'Exportación' },
  '03': { code: '03', label: 'REBU', description: 'Régimen especial de bienes usados' },
  '04': { code: '04', label: 'Oro inversión', description: 'Régimen especial de oro de inversión' },
  '05': { code: '05', label: 'REAV', description: 'Régimen especial de agencias de viaje' },
  '06': { code: '06', label: 'REGyP', description: 'Régimen especial de grupos de entidades en IVA' },
  '07': { code: '07', label: 'RECC', description: 'Régimen especial del criterio de caja' },
  '08': { code: '08', label: 'IPSI/IGIC', description: 'Operaciones sujetas al IPSI/IGIC' },
  '09': { code: '09', label: 'Adquisiciones intracomunitarias', description: 'Adquisiciones intracomunitarias de bienes y prestaciones de servicios' },
  '10': { code: '10', label: 'Cobros por cuenta de terceros', description: 'Cobros por cuenta de terceros' },
  '14': { code: '14', label: 'Exenta sin derecho', description: 'Facturación prestaciones no sujetas en territorio IVA' },
  '15': { code: '15', label: 'Exenta con derecho', description: 'Facturación prestaciones exentas' },
}

/**
 * Maps itineramio invoice properties to the appropriate AEAT invoice type.
 *
 * For rectificativas in property management context:
 * - R1: Error correction (art. 80.1, 80.2, 80.6) — most common for gestores
 * - R4: Other causes — fallback
 *
 * We default rectificativas to R1 (error correction) since in property management,
 * rectifications are typically issued to correct billing errors or adjust amounts.
 * R4 is used as a fallback when reason is unknown.
 */
export function resolveAEATInvoiceType(invoice: {
  isRectifying: boolean
  rectifyingType?: 'SUBSTITUTION' | 'DIFFERENCE' | null
  total: number
}): AEATInvoiceType {
  if (invoice.isRectifying) {
    // R1 for error correction (most common in property management)
    // Both SUBSTITUTION and DIFFERENCE map to R1 when correcting billing errors
    return 'R1'
  }

  // F1: Complete invoice (standard for gestor invoices)
  return 'F1'
}

/**
 * Returns the default tax regime key for standard property management invoices.
 */
export function getDefaultTaxRegimeKey(): string {
  return '01' // Régimen general
}
