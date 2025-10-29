import { prisma } from './prisma'
import { PLANS, getSuggestedPlan, type PlanCode } from '@/config/plans'

export interface PlanLimits {
  maxProperties: number
  currentProperties: number
  canCreateMore: boolean
  planName: string
  monthlyFee: number
  upgradeRequired: boolean
  upgradeMessage?: string
  isOnTrial?: boolean
  trialDaysRemaining?: number
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
      // Get user data including trial information
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          subscription: true,
          trialStartedAt: true,
          trialEndsAt: true
        }
      })

      if (!user) {
        throw new Error('Usuario no encontrado')
      }

      // Count all user properties (ACTIVE, INACTIVE, DRAFT, etc.)
      const currentProperties = await prisma.property.count({
        where: { hostId: userId }
      })

      // Check for active subscription FIRST (prioritize paid plans over trials)
      const activeSubscription = await prisma.userSubscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE'
        },
        include: {
          plan: true
        }
      })

      if (activeSubscription && activeSubscription.plan) {
        // User has active paid subscription - this takes priority over trial
        const plan = PLANS[activeSubscription.plan.code as PlanCode]
        return {
          maxProperties: plan.maxProperties,
          currentProperties,
          canCreateMore: currentProperties < plan.maxProperties,
          planName: plan.name,
          monthlyFee: plan.priceMonthly,
          upgradeRequired: false,
          isOnTrial: false
        }
      }

      // Check if user is on trial (only if no paid subscription)
      const now = new Date()
      const isOnTrial = user.trialEndsAt && user.trialEndsAt > now
      const trialDaysRemaining = isOnTrial && user.trialEndsAt
        ? Math.ceil((user.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0

      // If on trial (and no paid subscription), limit to 2 properties to match BASIC plan
      if (isOnTrial) {
        return {
          maxProperties: 2, // Limited to 2 properties during trial (same as BASIC plan)
          currentProperties,
          canCreateMore: currentProperties < 2,
          planName: 'Trial',
          monthlyFee: 0,
          upgradeRequired: false,
          isOnTrial: true,
          trialDaysRemaining
        }
      }

      // No trial, no subscription → needs to subscribe
      const suggestedPlan = getSuggestedPlan(currentProperties || 1)

      return {
        maxProperties: 0,
        currentProperties,
        canCreateMore: false,
        planName: 'Sin plan activo',
        monthlyFee: suggestedPlan.priceMonthly,
        upgradeRequired: true,
        upgradeMessage: `Tu período de prueba ha finalizado. Para seguir gestionando tus propiedades, elige el plan ${suggestedPlan.name} desde €${suggestedPlan.priceMonthly}/mes.`,
        isOnTrial: false
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
        upgradeMessage: 'Error al verificar límites del plan. Contacta con soporte.',
        isOnTrial: false
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