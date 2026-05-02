/**
 * Feature Flags Configuration
 *
 * Sistema centralizado de feature flags para control de funcionalidades en desarrollo.
 * Permite activar/desactivar features sin deployments.
 */

export const FEATURE_FLAGS = {
  /**
   * ENABLE_PRICING_V2
   *
   * Activa la nueva página de pricing con modelo flexible pay-per-property.
   *
   * Cuando está activado (true):
   * - /pricing-v2 es accesible
   * - Muestra modelo de precios con descuentos por volumen
   * - Calculadora interactiva de precios
   *
   * Cuando está desactivado (false):
   * - /pricing-v2 muestra página 404 o redirect
   * - Sistema de precios actual (planes fijos) sigue activo
   *
   * @default false (desactivado en producción hasta pruebas completas)
   */
  ENABLE_PRICING_V2: process.env.NEXT_PUBLIC_ENABLE_PRICING_V2 === 'true',

  /**
   * Otros feature flags pueden añadirse aquí en el futuro
   * Ejemplos:
   * - ENABLE_STRIPE_CHECKOUT: Para activar pagos automatizados
   * - ENABLE_SEPA_PAYMENTS: Para pagos SEPA en Europa
   * - ENABLE_MULTI_CURRENCY: Para soporte de múltiples monedas
   */
} as const

/**
 * Helper para verificar si un feature flag está activo
 *
 * @example
 * if (isFeatureEnabled('ENABLE_PRICING_V2')) {
 *   // código condicional
 * }
 */
export const isFeatureEnabled = (flag: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[flag] === true
}

/**
 * Helper para desarrollo: log de todos los feature flags activos
 */
export const logFeatureFlags = (): void => {
  // No-op: console logging removed
}

// ─── AlexAI / Beds24 Beta whitelist ─────────────────────────────────────────

/**
 * Whitelist de emails autorizados para acceder a funcionalidades nuevas
 * (AlexAI, Beds24, integraciones externas, crons nuevos, UI nueva).
 *
 * Configuración via env var `ALEXAI_BETA_USERS` (comma-separated).
 * Vacío o sin definir → nadie ve las nuevas funcionalidades (modo producción seguro).
 *
 * Reglas (decisión D15, brief V3 sección 7):
 * - APIs nuevas (`/api/alexai/*`, `/api/beds24/*`, etc.): devolver 404 si email no whitelisted.
 * - UI nueva: `if (!isAlexAIBetaUser(user.email)) return null`.
 * - Crons / workflows: filtrar `user.email IN whitelist` antes de procesar.
 *
 * Quitar email de la whitelist o expandirla requiere PR explícito con revisión.
 */
function getAlexAIBetaUsers(): Set<string> {
  const raw = process.env.ALEXAI_BETA_USERS ?? ''
  return new Set(
    raw
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean)
  )
}

/**
 * ¿Este email tiene acceso a la Beta de AlexAI/Beds24/integraciones?
 *
 * @param email — email del usuario autenticado
 * @returns true si el email está en `ALEXAI_BETA_USERS`, false en cualquier otro caso
 *          (incluyendo email vacío/undefined, o env var no configurada)
 *
 * @example
 * // En API route:
 * const user = await getAuthUser(req)
 * if (!user || !isAlexAIBetaUser(user.email)) {
 *   return new NextResponse(null, { status: 404 })
 * }
 *
 * // En componente UI:
 * if (!isAlexAIBetaUser(user.email)) return null
 */
export function isAlexAIBetaUser(email: string | null | undefined): boolean {
  if (!email) return false
  return getAlexAIBetaUsers().has(email.trim().toLowerCase())
}
