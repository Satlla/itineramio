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
  if (process.env.NODE_ENV === 'development') {
    console.log('🚩 Feature Flags Status:')
    Object.entries(FEATURE_FLAGS).forEach(([key, value]) => {
      console.log(`  ${key}: ${value ? '✅ ENABLED' : '❌ DISABLED'}`)
    })
  }
}
