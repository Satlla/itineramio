/**
 * AdapterCapabilities — matriz de qué soporta cada proveedor.
 *
 * Se consulta en runtime por el core/UI para decidir qué funcionalidades exponer.
 * Cuando un capability está en `false` o `partial`, el core debe avisar al usuario
 * y degradar gracefully.
 *
 * Datos extraídos del brief V3 (sección 6). Mantener sincronizado.
 */

import type { ExternalProvider } from './types'

/**
 * Estados de soporte:
 *   - 'full'    : soportado completamente
 *   - 'partial' : soportado con limitaciones (ej. solo lectura, solo ciertos canales)
 *   - 'none'    : no soportado
 */
export type CapabilityLevel = 'full' | 'partial' | 'none'

export interface AdapterCapabilities {
  supportsReservations: CapabilityLevel
  supportsMessagingAirbnb: CapabilityLevel
  supportsMessagingBooking: CapabilityLevel
  supportsMessagingExpedia: CapabilityLevel
  supportsMessagingVrbo: CapabilityLevel
  supportsCalendarSync: CapabilityLevel
  supportsBookingWebhooks: CapabilityLevel
  supportsPriceSync: CapabilityLevel
  supportsMultiAccountMaster: CapabilityLevel
  supportsMediaInMessages: CapabilityLevel
}

/**
 * Matriz de capabilities por proveedor (snapshot de la documentación al 2026-05-02).
 * Se actualiza conforme se confirman capacidades reales con cada API.
 *
 * NOTA: Esta matriz es la fuente de verdad declarativa. Cada adapter concreto
 * (cuando se implemente) debe devolver el mismo objeto vía `getCapabilities()`.
 */
export const PROVIDER_CAPABILITIES: Record<ExternalProvider, AdapterCapabilities> = {
  BEDS24: {
    supportsReservations: 'full',
    supportsMessagingAirbnb: 'full',
    supportsMessagingBooking: 'full',
    supportsMessagingExpedia: 'full',
    supportsMessagingVrbo: 'full',
    supportsCalendarSync: 'full',
    supportsBookingWebhooks: 'full',
    supportsPriceSync: 'full',
    supportsMultiAccountMaster: 'full',
    supportsMediaInMessages: 'full',
  },
  HOSTAWAY: {
    supportsReservations: 'full',
    supportsMessagingAirbnb: 'full',
    supportsMessagingBooking: 'full',
    supportsMessagingExpedia: 'partial',
    supportsMessagingVrbo: 'full',
    supportsCalendarSync: 'full',
    supportsBookingWebhooks: 'full',
    supportsPriceSync: 'full',
    supportsMultiAccountMaster: 'none',
    supportsMediaInMessages: 'full',
  },
  HOSPITABLE: {
    supportsReservations: 'full',
    supportsMessagingAirbnb: 'full',
    supportsMessagingBooking: 'partial',
    supportsMessagingExpedia: 'none',
    supportsMessagingVrbo: 'partial',
    supportsCalendarSync: 'full',
    supportsBookingWebhooks: 'full',
    supportsPriceSync: 'full',
    supportsMultiAccountMaster: 'none',
    supportsMediaInMessages: 'partial',
  },
  AVANTIO: {
    supportsReservations: 'full',
    supportsMessagingAirbnb: 'partial',
    supportsMessagingBooking: 'partial',
    supportsMessagingExpedia: 'partial',
    supportsMessagingVrbo: 'none',
    supportsCalendarSync: 'full',
    supportsBookingWebhooks: 'partial',
    supportsPriceSync: 'full',
    supportsMultiAccountMaster: 'none',
    supportsMediaInMessages: 'none',
  },
  LODGIFY: {
    supportsReservations: 'full',
    supportsMessagingAirbnb: 'none',
    supportsMessagingBooking: 'none',
    supportsMessagingExpedia: 'none',
    supportsMessagingVrbo: 'none',
    supportsCalendarSync: 'full',
    supportsBookingWebhooks: 'partial',
    supportsPriceSync: 'full',
    supportsMultiAccountMaster: 'none',
    supportsMediaInMessages: 'none',
  },
  SMOOBU: {
    supportsReservations: 'full',
    supportsMessagingAirbnb: 'none',
    supportsMessagingBooking: 'none',
    supportsMessagingExpedia: 'none',
    supportsMessagingVrbo: 'none',
    supportsCalendarSync: 'full',
    supportsBookingWebhooks: 'full',
    supportsPriceSync: 'full',
    supportsMultiAccountMaster: 'none',
    supportsMediaInMessages: 'none',
  },
  // Proveedores documentados pero sin capability matrix verificada en V3.
  // Marcamos `none` por defecto para forzar degradación segura hasta que se valide.
  AVIRATO: emptyCapabilities(),
  ICNEA: emptyCapabilities(),
  GUESTY: emptyCapabilities(),
  SUITECLERK: emptyCapabilities(),
  WUBOOK: emptyCapabilities(),
}

function emptyCapabilities(): AdapterCapabilities {
  return {
    supportsReservations: 'none',
    supportsMessagingAirbnb: 'none',
    supportsMessagingBooking: 'none',
    supportsMessagingExpedia: 'none',
    supportsMessagingVrbo: 'none',
    supportsCalendarSync: 'none',
    supportsBookingWebhooks: 'none',
    supportsPriceSync: 'none',
    supportsMultiAccountMaster: 'none',
    supportsMediaInMessages: 'none',
  }
}

/** Helper: ¿este adapter soporta este capability al menos parcialmente? */
export function hasCapability(
  caps: AdapterCapabilities,
  capability: keyof AdapterCapabilities
): boolean {
  return caps[capability] !== 'none'
}

/** Helper: ¿soporte completo (no parcial)? */
export function hasFullCapability(
  caps: AdapterCapabilities,
  capability: keyof AdapterCapabilities
): boolean {
  return caps[capability] === 'full'
}
