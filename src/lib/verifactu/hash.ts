/**
 * VeriFactu Hash Chain (SHA-256)
 * RD 1007/2023 - Sistema de encadenamiento de registros de facturación
 *
 * Each invoice record (RegistroAlta) generates a SHA-256 hash that chains
 * with the previous record's hash. If any record is modified, the chain
 * breaks from that point forward.
 */

import { createHash } from 'crypto'

export interface RegistroAltaHashInput {
  /** NIF del emisor (IDEmisorFactura) */
  nifEmisor: string
  /** Serie + número (NumSerieFactura) e.g. "F2025/0001" */
  numSerieFactura: string
  /** Fecha expedición DD-MM-YYYY */
  fechaExpedicion: string
  /** Tipo factura: F1, F2, R1-R5 */
  tipoFactura: string
  /** Cuota total IVA */
  cuotaTotal: string
  /** Importe total factura */
  importeTotal: string
  /** Hash del registro anterior (vacío si es el primero) */
  huellaAnterior: string
  /** Timestamp ISO 8601 con zona horaria */
  fechaHoraHusoGenRegistro: string
}

export interface RegistroAnulacionHashInput {
  /** NIF del emisor */
  nifEmisor: string
  /** Serie + número */
  numSerieFactura: string
  /** Fecha expedición DD-MM-YYYY */
  fechaExpedicion: string
  /** Hash del registro anterior */
  huellaAnterior: string
  /** Timestamp ISO 8601 con zona horaria */
  fechaHoraHusoGenRegistro: string
}

/**
 * Computes the SHA-256 hash for a RegistroAlta (invoice creation/issuance record).
 *
 * The concatenation format per AEAT spec:
 * IDEmisorFactura=<NIF>&NumSerieFactura=<serie/número>&FechaExpedicionFactura=<DD-MM-YYYY>&
 * TipoFactura=<tipo>&CuotaTotal=<iva>&ImporteTotal=<total>&Huella=<hash_anterior>&
 * FechaHoraHusoGenRegistro=<timestamp_ISO8601>
 */
export function computeRegistroAltaHash(input: RegistroAltaHashInput): string {
  const concatenated = [
    `IDEmisorFactura=${input.nifEmisor}`,
    `NumSerieFactura=${input.numSerieFactura}`,
    `FechaExpedicionFactura=${input.fechaExpedicion}`,
    `TipoFactura=${input.tipoFactura}`,
    `CuotaTotal=${input.cuotaTotal}`,
    `ImporteTotal=${input.importeTotal}`,
    `Huella=${input.huellaAnterior}`,
    `FechaHoraHusoGenRegistro=${input.fechaHoraHusoGenRegistro}`,
  ].join('&')

  return createHash('sha256').update(concatenated, 'utf8').digest('hex')
}

/**
 * Computes the SHA-256 hash for a RegistroAnulacion (invoice cancellation record).
 * Uses a reduced set of fields.
 */
export function computeRegistroAnulacionHash(input: RegistroAnulacionHashInput): string {
  const concatenated = [
    `IDEmisorFactura=${input.nifEmisor}`,
    `NumSerieFactura=${input.numSerieFactura}`,
    `FechaExpedicionFactura=${input.fechaExpedicion}`,
    `Huella=${input.huellaAnterior}`,
    `FechaHoraHusoGenRegistro=${input.fechaHoraHusoGenRegistro}`,
  ].join('&')

  return createHash('sha256').update(concatenated, 'utf8').digest('hex')
}

/**
 * Format a date as DD-MM-YYYY per VeriFactu spec.
 */
export function formatDateVF(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

/**
 * Format a decimal amount with 2 decimal places using dot as separator.
 */
export function formatAmountVF(amount: number): string {
  return amount.toFixed(2)
}

/**
 * Generate an ISO 8601 timestamp with timezone for Madrid.
 * Example: 2025-01-15T10:30:00+01:00
 */
export function generateTimestamp(): string {
  return new Date().toLocaleString('sv-SE', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).replace(' ', 'T') + getTimezoneOffset()
}

function getTimezoneOffset(): string {
  // Get the current offset for Europe/Madrid
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en', {
    timeZone: 'Europe/Madrid',
    timeZoneName: 'shortOffset',
  })
  const parts = formatter.formatToParts(now)
  const offsetPart = parts.find(p => p.type === 'timeZoneName')
  // Converts "GMT+1" or "GMT+2" to "+01:00" or "+02:00"
  if (offsetPart?.value) {
    const match = offsetPart.value.match(/GMT([+-])(\d+)/)
    if (match) {
      const sign = match[1]
      const hours = match[2].padStart(2, '0')
      return `${sign}${hours}:00`
    }
  }
  return '+01:00' // Default CET
}

export interface HashChainEntry {
  hash: string
  previousHash: string
}

/**
 * Validates an array of hash chain entries to ensure integrity.
 * Each entry's previousHash must match the hash of the prior entry.
 */
export function validateHashChain(entries: HashChainEntry[]): {
  valid: boolean
  brokenAt?: number
} {
  for (let i = 1; i < entries.length; i++) {
    if (entries[i].previousHash !== entries[i - 1].hash) {
      return { valid: false, brokenAt: i }
    }
  }
  return { valid: true }
}
