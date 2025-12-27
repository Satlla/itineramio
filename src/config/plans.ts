/**
 * PLANES DE SUSCRIPCIÓN - CONFIGURACIÓN ESTÁTICA
 *
 * Fuente de verdad para los planes de suscripción.
 * Nunca usar "gratis", "gratuito", "incluida" ni "STARTER" ni "FREE".
 *
 * Políticas:
 * - Sin suscripción → "Sin plan activo" + CTA "Elige un plan"
 * - Periodos: Mensual (base), Semestral (-10%), Anual (-20%)
 * - Prorrateo: solo cuando ENABLE_PRORATION=true
 *
 * Última actualización: 19/10/2025
 */

export type PlanCode = 'BASIC' | 'HOST' | 'SUPERHOST' | 'BUSINESS'

export type BillingPeriod = 'MONTHLY' | 'SEMESTRAL' | 'YEARLY'

export interface Plan {
  code: PlanCode
  name: string
  description: string
  maxProperties: number
  priceMonthly: number          // Precio base mensual en EUR
  priceSemestral: number         // 6 meses con -10% descuento
  priceYearly: number            // 12 meses con -20% descuento
  features: string[]
  isVisibleInUI: boolean         // false para BUSINESS (enterprise)
  isActive: boolean
  suggestedForProperties: number // Para presets en UI (1, 5, 20)
  color: string                  // Color para la UI
}

/**
 * PLANES VIGENTES (nombres fijos)
 */
export const PLANS: Record<PlanCode, Plan> = {
  BASIC: {
    code: 'BASIC',
    name: 'Basic',
    description: 'Perfecto para comenzar con tus primeras propiedades',
    maxProperties: 2,
    priceMonthly: 9,
    priceSemestral: 48.6,    // 9 * 6 * 0.9 = 48.6
    priceYearly: 86.4,        // 9 * 12 * 0.8 = 86.4
    features: [
      'Hasta 2 propiedades',
      'Guías digitales personalizadas',
      'Códigos QR por zona',
      'Estadísticas básicas',
      'Soporte por email'
    ],
    isVisibleInUI: true,
    isActive: true,
    suggestedForProperties: 1,
    color: '#8B5CF6' // violet-600
  },

  HOST: {
    code: 'HOST',
    name: 'Host',
    description: 'Ideal para hosts con múltiples propiedades',
    maxProperties: 10,
    priceMonthly: 29,
    priceSemestral: 156.6,    // 29 * 6 * 0.9 = 156.6
    priceYearly: 278.4,       // 29 * 12 * 0.8 = 278.4
    features: [
      'Hasta 10 propiedades',
      'Todas las funciones de Basic',
      'Conjuntos de propiedades',
      'Analytics avanzadas',
      'Integración con PMS',
      'Soporte prioritario'
    ],
    isVisibleInUI: true,
    isActive: true,
    suggestedForProperties: 5,
    color: '#3B82F6' // blue-600
  },

  SUPERHOST: {
    code: 'SUPERHOST',
    name: 'Superhost',
    description: 'Para gestores profesionales y equipos',
    maxProperties: 25,
    priceMonthly: 69,
    priceSemestral: 372.6,    // 69 * 6 * 0.9 = 372.6
    priceYearly: 662.4,       // 69 * 12 * 0.8 = 662.4
    features: [
      'Hasta 25 propiedades',
      'Todas las funciones de Host',
      'Multi-usuario (equipo)',
      'API personalizada',
      'Reportes personalizados',
      'Gestor de cuenta dedicado',
      'Soporte 24/7'
    ],
    isVisibleInUI: true,
    isActive: true,
    suggestedForProperties: 20,
    color: '#10B981' // green-600
  },

  BUSINESS: {
    code: 'BUSINESS',
    name: 'Business',
    description: 'Soluciones enterprise a medida',
    maxProperties: 50,        // Hasta 50 propiedades
    priceMonthly: 99,         // €99/mes
    priceSemestral: 534.6,    // 99 * 6 * 0.9 = 534.6
    priceYearly: 950.4,       // 99 * 12 * 0.8 = 950.4
    features: [
      'Hasta 50 propiedades',
      'Todas las funciones de Superhost',
      'Infraestructura dedicada',
      'SLA garantizado',
      'Onboarding personalizado',
      'Integraciones custom',
      'Soporte white-label'
    ],
    isVisibleInUI: true,      // VISIBLE en UI
    isActive: true,
    suggestedForProperties: 40,
    color: '#F59E0B' // amber-600
  }
}

/**
 * Array de planes ordenados por precio (para iterar en UI)
 */
export const PLANS_ARRAY: Plan[] = Object.values(PLANS)

/**
 * Planes visibles en UI pública
 */
export const VISIBLE_PLANS: Plan[] = PLANS_ARRAY.filter(plan => plan.isVisibleInUI && plan.isActive)

/**
 * Obtener plan por código
 */
export function getPlan(code: PlanCode): Plan {
  return PLANS[code]
}

/**
 * Obtener plan sugerido según número de propiedades
 */
export function getSuggestedPlan(propertyCount: number): Plan {
  if (propertyCount <= 2) return PLANS.BASIC
  if (propertyCount <= 10) return PLANS.HOST
  if (propertyCount <= 25) return PLANS.SUPERHOST
  return PLANS.BUSINESS
}

/**
 * Calcular precio según período de facturación
 */
export function calculatePrice(plan: Plan, period: BillingPeriod): number {
  switch (period) {
    case 'MONTHLY':
      return plan.priceMonthly
    case 'SEMESTRAL':
      return plan.priceSemestral
    case 'YEARLY':
      return plan.priceYearly
    default:
      return plan.priceMonthly
  }
}

/**
 * Calcular descuento según período
 */
export function getDiscount(period: BillingPeriod): number {
  switch (period) {
    case 'MONTHLY':
      return 0
    case 'SEMESTRAL':
      return 10
    case 'YEARLY':
      return 20
    default:
      return 0
  }
}

/**
 * Obtener precio por mes según período (para comparación)
 */
export function getPricePerMonth(plan: Plan, period: BillingPeriod): number {
  const totalPrice = calculatePrice(plan, period)
  const months = period === 'YEARLY' ? 12 : period === 'SEMESTRAL' ? 6 : 1
  return totalPrice / months
}

/**
 * Validar si un plan puede soportar X propiedades
 */
export function canPlanSupportProperties(plan: Plan, propertyCount: number): boolean {
  return propertyCount <= plan.maxProperties
}

/**
 * Obtener mensaje de upgrade necesario
 */
export function getUpgradeMessage(currentPlan: PlanCode, requiredProperties: number): string {
  const current = PLANS[currentPlan]
  const suggested = getSuggestedPlan(requiredProperties)

  if (canPlanSupportProperties(current, requiredProperties)) {
    return '' // No necesita upgrade
  }

  return `Tu plan ${current.name} permite hasta ${current.maxProperties} propiedades. Para gestionar ${requiredProperties} propiedades, necesitas actualizar a ${suggested.name}.`
}

/**
 * Feature flags para funcionalidad experimental
 */
export const FEATURE_FLAGS = {
  ENABLE_PRICING_V2: process.env.NEXT_PUBLIC_ENABLE_PRICING_V2 === 'true',
  ENABLE_PRORATION: process.env.NEXT_PUBLIC_ENABLE_PRORATION === 'true'
} as const

/**
 * Mensajes de estado de suscripción (nunca usar "gratis"/"gratuito")
 */
export const SUBSCRIPTION_STATUS_MESSAGES = {
  NO_PLAN: 'Sin plan activo',
  TRIAL_ACTIVE: 'Período de prueba activo',
  TRIAL_EXPIRED: 'Período de prueba finalizado',
  ACTIVE: 'Plan activo',
  CANCELLED: 'Plan cancelado',
  SUSPENDED: 'Plan suspendido'
} as const

/**
 * Thresholds for plan recommendations
 */
export const PLAN_THRESHOLDS = {
  BASIC: 2,
  HOST: 10,
  SUPERHOST: 25,
  BUSINESS: 50
} as const

/**
 * Calculate price per property for a given plan
 * Used for displaying unit pricing in UI
 */
export function pricePerProperty(planCode: PlanCode): number {
  const plan = PLANS[planCode]
  if (!plan || plan.maxProperties === 0) return 0
  return plan.priceMonthly / plan.maxProperties
}
