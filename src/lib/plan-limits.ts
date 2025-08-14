import { prisma } from './prisma'

export interface PlanLimits {
  maxProperties: number
  currentProperties: number
  canCreateMore: boolean
  planName: string
  monthlyFee: number
  upgradeRequired: boolean
  upgradeMessage?: string
}

export class PlanLimitsService {
  private static instance: PlanLimitsService

  private constructor() {}

  static getInstance(): PlanLimitsService {
    if (!PlanLimitsService.instance) {
      PlanLimitsService.instance = new PlanLimitsService()
    }
    return PlanLimitsService.instance
  }

  async getUserPlanLimits(userId: string): Promise<PlanLimits> {
    try {
      // Get user's current active and trial properties
      const currentProperties = await prisma.property.count({
        where: {
          hostId: userId,
          status: { in: ['ACTIVE', 'TRIAL'] }
        }
      })

      // Check if user has any custom plan subscription
      const customSubscription = await prisma.userSubscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
          customPlanId: { not: null }
        },
        include: {
          customPlan: true
        }
      })

      if (customSubscription && customSubscription.customPlan) {
        // User has a custom plan
        const maxProperties = customSubscription.customPlan.maxProperties || 999
        return {
          maxProperties,
          currentProperties,
          canCreateMore: currentProperties < maxProperties,
          planName: customSubscription.customPlan.name,
          monthlyFee: Number(customSubscription.customPlan.pricePerProperty),
          upgradeRequired: false
        }
      }

      // Standard plan logic
      if (currentProperties === 0) {
        // First property is always free
        return {
          maxProperties: 1,
          currentProperties,
          canCreateMore: true,
          planName: 'Gratuito',
          monthlyFee: 0,
          upgradeRequired: false
        }
      }

      // User already has 1+ properties, needs to pay for additional ones
      const monthlyFeePerProperty = currentProperties >= 9 ? 2.00 : 2.50 // Volume discount at 10+ properties
      
      return {
        maxProperties: currentProperties, // Current limit is what they've paid for
        currentProperties,
        canCreateMore: false,
        planName: 'Growth',
        monthlyFee: monthlyFeePerProperty,
        upgradeRequired: true,
        upgradeMessage: `Para agregar más propiedades, necesitas activar el Plan Growth por €${monthlyFeePerProperty.toFixed(2)}/mes por propiedad adicional.`
      }

    } catch (error) {
      console.error('Error checking plan limits:', error)
      // Fallback to safe limits
      return {
        maxProperties: 0,
        currentProperties: 0,
        canCreateMore: false,
        planName: 'Error',
        monthlyFee: 0,
        upgradeRequired: true,
        upgradeMessage: 'Error al verificar límites del plan. Contacta con soporte.'
      }
    }
  }

  async canUserCreateProperty(userId: string): Promise<{ canCreate: boolean, reason?: string, upgradeUrl?: string }> {
    const limits = await this.getUserPlanLimits(userId)
    
    if (limits.canCreateMore) {
      return { canCreate: true }
    }

    const upgradeUrl = '/account/billing'
    
    if (limits.upgradeRequired) {
      return {
        canCreate: false,
        reason: limits.upgradeMessage || 'Has alcanzado el límite de tu plan actual',
        upgradeUrl
      }
    }

    return {
      canCreate: false,
      reason: `Has alcanzado el límite de ${limits.maxProperties} propiedades de tu plan ${limits.planName}`,
      upgradeUrl
    }
  }

  async validatePropertyCreation(userId: string): Promise<{ valid: boolean, error?: string, upgradeUrl?: string }> {
    const result = await this.canUserCreateProperty(userId)
    
    if (result.canCreate) {
      return { valid: true }
    }

    return {
      valid: false,
      error: result.reason || 'No se puede crear más propiedades',
      upgradeUrl: result.upgradeUrl
    }
  }
}

export const planLimitsService = PlanLimitsService.getInstance()