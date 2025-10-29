/**
 * LÓGICA DE SELECCIÓN DE PLANES
 * 
 * Funciones para determinar el plan correcto basado en número de propiedades
 * IMPORTA EXCLUSIVAMENTE de src/config/plans.ts
 */

import { PLANS, PLANS_ARRAY, type PlanCode, type Plan, getPlan } from '../config/plans'

/**
 * Seleccionar el plan correcto basado en número de propiedades
 * 
 * @param propertyCount Número de propiedades que necesita gestionar
 * @returns PlanCode del plan más adecuado
 */
export function planForPropertyCount(propertyCount: number): PlanCode {
  if (propertyCount <= 0) {
    throw new Error('El número de propiedades debe ser mayor a 0')
  }

  // Usar la misma lógica que en plans.ts
  if (propertyCount <= PLANS.BASIC.maxProperties) return 'BASIC'
  if (propertyCount <= PLANS.HOST.maxProperties) return 'HOST'
  if (propertyCount <= PLANS.SUPERHOST.maxProperties) return 'SUPERHOST'
  return 'BUSINESS'
}

/**
 * Obtener el siguiente plan disponible para hacer upgrade
 */
export function getNextPlan(currentPlanCode: PlanCode): PlanCode | null {
  const currentPlan = getPlan(currentPlanCode)
  
  // Buscar el siguiente plan con precio mayor
  const nextPlan = PLANS_ARRAY
    .filter(plan => plan.priceMonthly > currentPlan.priceMonthly)
    .sort((a, b) => a.priceMonthly - b.priceMonthly)[0]
    
  return nextPlan?.code || null
}

/**
 * Obtener el plan anterior para hacer downgrade
 */
export function getPreviousPlan(currentPlanCode: PlanCode): PlanCode | null {
  const currentPlan = getPlan(currentPlanCode)
  
  // Buscar el plan anterior con precio menor
  const previousPlan = PLANS_ARRAY
    .filter(plan => plan.priceMonthly < currentPlan.priceMonthly)
    .sort((a, b) => b.priceMonthly - a.priceMonthly)[0]
    
  return previousPlan?.code || null
}

/**
 * Verificar si un usuario puede gestionar X propiedades con su plan actual
 */
export function canManageProperties(planCode: PlanCode, propertyCount: number): boolean {
  const plan = getPlan(planCode)
  return propertyCount <= plan.maxProperties
}

/**
 * Calcular si necesita upgrade para gestionar más propiedades
 */
export function needsUpgradeForProperties(currentPlanCode: PlanCode, targetProperties: number): {
  needsUpgrade: boolean
  recommendedPlan?: PlanCode
  currentMax: number
} {
  const currentPlan = getPlan(currentPlanCode)
  const needsUpgrade = targetProperties > currentPlan.maxProperties
  
  return {
    needsUpgrade,
    recommendedPlan: needsUpgrade ? planForPropertyCount(targetProperties) : undefined,
    currentMax: currentPlan.maxProperties
  }
}

/**
 * Obtener rangos de propiedades para un plan
 */
export function getPropertyRange(planCode: PlanCode): { min: number; max: number } {
  const plan = getPlan(planCode)
  // Calcular min basado en el plan anterior
  let min = 1
  if (planCode === 'HOST') min = PLANS.BASIC.maxProperties + 1
  else if (planCode === 'SUPERHOST') min = PLANS.HOST.maxProperties + 1
  else if (planCode === 'BUSINESS') min = PLANS.SUPERHOST.maxProperties + 1
  
  return {
    min,
    max: plan.maxProperties
  }
}

/**
 * Verificar si un número de propiedades está en el rango de un plan
 */
export function isInPlanRange(planCode: PlanCode, propertyCount: number): boolean {
  const { min, max } = getPropertyRange(planCode)
  return propertyCount >= min && propertyCount <= max
}