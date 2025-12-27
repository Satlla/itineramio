/**
 * Servicio de Prorrateo
 * Calcula créditos por tiempo no usado cuando un usuario hace upgrade/downgrade
 */

export interface ProrationCalculation {
  // Plan actual
  currentPlanName: string
  currentPlanPrice: number
  currentStartDate: Date
  currentEndDate: Date

  // Nuevo plan
  newPlanName: string
  newPlanPrice: number
  newBillingPeriod: 'monthly' | 'biannual' | 'annual'

  // Cálculos
  totalDays: number
  daysUsed: number
  daysRemaining: number
  dailyRate: number
  creditAmount: number
  finalPrice: number

  // Resultado
  newStartDate: Date
  newEndDate: Date

  // Display
  summary: string
  breakdown: {
    label: string
    value: string
    isCredit?: boolean
  }[]
}

/**
 * Calcula el prorrateo para un upgrade/downgrade de plan
 */
export function calculateProration(params: {
  // Suscripción actual
  currentSubscription: {
    planName: string
    amountPaid: number
    startDate: Date
    endDate: Date
  }

  // Nuevo plan deseado
  newPlan: {
    name: string
    priceMonthly: number
    billingPeriod: 'monthly' | 'biannual' | 'annual'
  }

  // Fecha actual (para testing)
  today?: Date
}): ProrationCalculation {

  const { currentSubscription, newPlan, today = new Date() } = params

  // 1. Calcular días totales del plan actual
  const totalDays = daysBetween(
    currentSubscription.startDate,
    currentSubscription.endDate
  )

  // 2. Calcular días ya usados
  const daysUsed = daysBetween(
    currentSubscription.startDate,
    today
  )

  // 3. Calcular días restantes (crédito)
  const daysRemaining = Math.max(0, totalDays - daysUsed)

  // 4. Calcular valor por día del plan actual
  const dailyRate = currentSubscription.amountPaid / totalDays

  // 5. Calcular crédito total
  const creditAmount = daysRemaining * dailyRate

  // 6. Calcular precio del nuevo plan según período
  const monthsMultiplier = newPlan.billingPeriod === 'monthly' ? 1
                         : newPlan.billingPeriod === 'biannual' ? 6
                         : 12

  // Aplicar descuentos según período
  let discountPercent = 0
  if (newPlan.billingPeriod === 'biannual') discountPercent = 10
  if (newPlan.billingPeriod === 'annual') discountPercent = 20

  const monthlyPrice = newPlan.priceMonthly
  const discountedMonthlyPrice = monthlyPrice * (1 - discountPercent / 100)
  const newPlanPrice = discountedMonthlyPrice * monthsMultiplier

  // 7. Calcular precio final a pagar
  const finalPrice = Math.max(0, newPlanPrice - creditAmount)

  // 8. Calcular nuevas fechas
  const newStartDate = today
  const newEndDate = addMonths(today, monthsMultiplier)

  // 9. Generar resumen legible
  const summary = generateSummary({
    currentPlanName: currentSubscription.planName,
    newPlanName: newPlan.name,
    creditAmount,
    finalPrice,
    daysRemaining
  })

  // 10. Generar desglose detallado
  const breakdown = [
    {
      label: `${newPlan.name} - ${getBillingPeriodLabel(newPlan.billingPeriod)}`,
      value: `€${newPlanPrice.toFixed(2)}`
    },
    {
      label: `Crédito restante de ${currentSubscription.planName} (${daysRemaining} días)`,
      value: `-€${creditAmount.toFixed(2)}`,
      isCredit: true
    },
    {
      label: 'Total a pagar ahora',
      value: `€${finalPrice.toFixed(2)}`
    }
  ]

  return {
    currentPlanName: currentSubscription.planName,
    currentPlanPrice: currentSubscription.amountPaid,
    currentStartDate: currentSubscription.startDate,
    currentEndDate: currentSubscription.endDate,

    newPlanName: newPlan.name,
    newPlanPrice,
    newBillingPeriod: newPlan.billingPeriod,

    totalDays,
    daysUsed,
    daysRemaining,
    dailyRate,
    creditAmount,
    finalPrice,

    newStartDate,
    newEndDate,

    summary,
    breakdown
  }
}

/**
 * Verifica si un cambio de plan es un upgrade (más caro) o downgrade (más barato)
 */
export function isUpgrade(
  currentMonthlyPrice: number,
  newMonthlyPrice: number
): boolean {
  return newMonthlyPrice > currentMonthlyPrice
}

/**
 * Genera un resumen legible del prorrateo
 */
function generateSummary(params: {
  currentPlanName: string
  newPlanName: string
  creditAmount: number
  finalPrice: number
  daysRemaining: number
}): string {
  const { currentPlanName, newPlanName, creditAmount, finalPrice, daysRemaining } = params

  if (creditAmount > 0) {
    return `Upgrade de ${currentPlanName} a ${newPlanName}. ` +
           `Tienes €${creditAmount.toFixed(2)} de crédito por ${daysRemaining} días no usados. ` +
           `Pagarás solo €${finalPrice.toFixed(2)}.`
  } else {
    return `Cambio a ${newPlanName}. Precio total: €${finalPrice.toFixed(2)}.`
  }
}

/**
 * Calcula días entre dos fechas
 */
function daysBetween(date1: Date, date2: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.floor((date2.getTime() - date1.getTime()) / msPerDay)
}

/**
 * Añade meses a una fecha
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

/**
 * Convierte billing period a label español
 */
function getBillingPeriodLabel(period: 'monthly' | 'biannual' | 'annual'): string {
  switch (period) {
    case 'monthly': return 'Mensual'
    case 'biannual': return 'Semestral (10% dto.)'
    case 'annual': return 'Anual (20% dto.)'
  }
}

/**
 * Valida que el usuario puede hacer el upgrade
 */
export function canUserAffordUpgrade(
  userBalance: number,
  prorationCost: number
): { canAfford: boolean; message: string } {
  if (userBalance >= prorationCost) {
    return {
      canAfford: true,
      message: 'Puedes realizar el upgrade'
    }
  }

  const deficit = prorationCost - userBalance
  return {
    canAfford: false,
    message: `Te faltan €${deficit.toFixed(2)} para realizar el upgrade`
  }
}

/**
 * Formatea el breakdown para mostrar en UI
 */
export function formatBreakdownForDisplay(breakdown: ProrationCalculation['breakdown']): string {
  return breakdown.map(item => {
    const prefix = item.isCredit ? '  - ' : '  '
    return `${prefix}${item.label}: ${item.value}`
  }).join('\n')
}
