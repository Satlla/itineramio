/**
 * SERVICIO DE LÍMITES DE MÓDULOS
 *
 * Valida el acceso a los módulos MANUALES y GESTION.
 * Mantiene compatibilidad con el sistema de suscripciones existente.
 *
 * Prioridad de verificación:
 * 1. UserModule activo
 * 2. (Solo MANUALES) UserSubscription existente
 * 3. (Solo MANUALES) Trial del usuario
 * 4. Sin acceso
 */

import { prisma } from './prisma'
import {
  type ModuleCode,
  type ModuleAccess,
  type ManualesAccess,
  type GestionAccess,
  type ModuleStatus,
  MODULES,
  createDeniedAccess,
  createGrantedAccess
} from '@/config/modules'
import { PLANS, type PlanCode } from '@/config/plans'

/**
 * Servicio principal para validar acceso a módulos
 */
export class ModuleLimitsService {
  /**
   * Obtener acceso al módulo MANUALES
   * Incluye límites de propiedades según el plan
   */
  async getManualesAccess(userId: string): Promise<ManualesAccess> {
    // 1. Buscar UserModule MANUALES activo
    const userModule = await prisma.userModule.findUnique({
      where: {
        userId_moduleType: {
          userId,
          moduleType: 'MANUALES'
        }
      },
      include: {
        subscriptionPlan: true
      }
    })

    if (userModule && userModule.isActive && userModule.status !== 'CANCELED') {
      const plan = userModule.subscriptionPlan
      const currentProperties = await this.countUserProperties(userId)

      // Check if trial has expired
      if (userModule.status === 'TRIAL' && userModule.trialEndsAt) {
        const isTrialExpired = new Date(userModule.trialEndsAt) < new Date()
        if (isTrialExpired) {
          // Trial expired - user needs to subscribe
          return {
            ...createDeniedAccess('MANUALES'),
            planCode: null,
            planName: 'Período de prueba expirado',
            maxProperties: 0,
            currentProperties,
            canAddProperty: false,
            // Provide trial info for UI
            isTrialActive: false,
            trialEndsAt: userModule.trialEndsAt
          } as ManualesAccess
        }
      }

      return {
        ...createGrantedAccess('MANUALES', userModule.status as ModuleStatus, {
          trialEndsAt: userModule.trialEndsAt,
          expiresAt: userModule.expiresAt
        }),
        planCode: plan?.code || null,
        planName: plan?.name || null,
        maxProperties: plan?.maxProperties || 1,
        currentProperties,
        canAddProperty: currentProperties < (plan?.maxProperties || 1)
      }
    }

    // 2. Fallback: Buscar UserSubscription existente (compatibilidad)
    const userSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      },
      include: {
        plan: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (userSubscription && userSubscription.plan) {
      const currentProperties = await this.countUserProperties(userId)

      return {
        moduleCode: 'MANUALES',
        hasAccess: true,
        status: 'ACTIVE',
        isTrialActive: false,
        trialEndsAt: null,
        expiresAt: userSubscription.endDate,
        activationRequired: false,
        activationUrl: MODULES.MANUALES.activationUrl,
        activationCTA: MODULES.MANUALES.ctaText,
        planCode: userSubscription.plan.code,
        planName: userSubscription.plan.name,
        maxProperties: userSubscription.plan.maxProperties,
        currentProperties,
        canAddProperty: currentProperties < userSubscription.plan.maxProperties
      }
    }

    // 3. Fallback: Verificar trial del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        trialStartedAt: true,
        trialEndsAt: true
      }
    })

    if (user?.trialEndsAt && new Date(user.trialEndsAt) > new Date()) {
      const currentProperties = await this.countUserProperties(userId)
      // Trial: acceso limitado a 1 propiedad (plan BASIC)
      const trialMaxProperties = 1

      return {
        moduleCode: 'MANUALES',
        hasAccess: true,
        status: 'TRIAL',
        isTrialActive: true,
        trialEndsAt: user.trialEndsAt,
        expiresAt: user.trialEndsAt,
        activationRequired: false,
        activationUrl: MODULES.MANUALES.activationUrl,
        activationCTA: 'Activar plan',
        planCode: null,
        planName: 'Período de prueba',
        maxProperties: trialMaxProperties,
        currentProperties,
        canAddProperty: currentProperties < trialMaxProperties
      }
    }

    // 4. Sin acceso
    const currentProperties = await this.countUserProperties(userId)
    return {
      ...createDeniedAccess('MANUALES'),
      planCode: null,
      planName: null,
      maxProperties: 0,
      currentProperties,
      canAddProperty: false
    }
  }

  /**
   * Obtener acceso al módulo GESTION
   * Tarifa plana sin límite de BillingUnits
   */
  async getGestionAccess(userId: string): Promise<GestionAccess> {
    // 1. Buscar UserModule GESTION activo
    const userModule = await prisma.userModule.findUnique({
      where: {
        userId_moduleType: {
          userId,
          moduleType: 'GESTION'
        }
      }
    })

    if (userModule && userModule.isActive && userModule.status !== 'CANCELED') {
      // Check if trial has expired
      if (userModule.status === 'TRIAL' && userModule.trialEndsAt) {
        const isTrialExpired = new Date(userModule.trialEndsAt) < new Date()
        if (isTrialExpired) {
          // Trial expired - user needs to subscribe
          return {
            ...createDeniedAccess('GESTION'),
            unlimitedProperties: true,
            // Provide trial info for UI to show "trial expired" message
            isTrialActive: false,
            trialEndsAt: userModule.trialEndsAt
          } as GestionAccess
        }
      }

      return {
        ...createGrantedAccess('GESTION', userModule.status as ModuleStatus, {
          trialEndsAt: userModule.trialEndsAt,
          expiresAt: userModule.expiresAt
        }),
        unlimitedProperties: true
      }
    }

    // 2. Sin acceso
    return {
      ...createDeniedAccess('GESTION'),
      unlimitedProperties: true
    }
  }

  /**
   * Obtener acceso a ambos módulos
   */
  async getAllModulesAccess(userId: string): Promise<{
    manuales: ManualesAccess
    gestion: GestionAccess
  }> {
    const [manuales, gestion] = await Promise.all([
      this.getManualesAccess(userId),
      this.getGestionAccess(userId)
    ])

    return { manuales, gestion }
  }

  /**
   * Verificar si el usuario tiene acceso a un módulo específico
   */
  async hasModuleAccess(userId: string, moduleCode: ModuleCode): Promise<boolean> {
    if (moduleCode === 'MANUALES') {
      const access = await this.getManualesAccess(userId)
      return access.hasAccess
    } else {
      const access = await this.getGestionAccess(userId)
      return access.hasAccess
    }
  }

  /**
   * Contar propiedades del usuario
   */
  private async countUserProperties(userId: string): Promise<number> {
    return prisma.property.count({
      where: { hostId: userId }
    })
  }

  /**
   * Activar módulo para un usuario (uso interno/admin)
   */
  async activateModule(
    userId: string,
    moduleCode: ModuleCode,
    options?: {
      subscriptionPlanId?: string
      stripeSubscriptionId?: string
      trialDays?: number
    }
  ): Promise<void> {
    const now = new Date()
    const trialEndsAt = options?.trialDays
      ? new Date(now.getTime() + options.trialDays * 24 * 60 * 60 * 1000)
      : null

    await prisma.userModule.upsert({
      where: {
        userId_moduleType: {
          userId,
          moduleType: moduleCode
        }
      },
      create: {
        userId,
        moduleType: moduleCode,
        status: options?.trialDays ? 'TRIAL' : 'ACTIVE',
        isActive: true,
        activatedAt: now,
        subscriptionPlanId: options?.subscriptionPlanId,
        stripeSubscriptionId: options?.stripeSubscriptionId,
        trialEndsAt
      },
      update: {
        status: options?.trialDays ? 'TRIAL' : 'ACTIVE',
        isActive: true,
        activatedAt: now,
        subscriptionPlanId: options?.subscriptionPlanId,
        stripeSubscriptionId: options?.stripeSubscriptionId,
        trialEndsAt,
        canceledAt: null
      }
    })
  }

  /**
   * Cancelar módulo para un usuario
   */
  async cancelModule(userId: string, moduleCode: ModuleCode): Promise<void> {
    await prisma.userModule.update({
      where: {
        userId_moduleType: {
          userId,
          moduleType: moduleCode
        }
      },
      data: {
        status: 'CANCELED',
        isActive: false,
        canceledAt: new Date()
      }
    })
  }
}

// Singleton export
export const moduleLimitsService = new ModuleLimitsService()

/**
 * Función helper para obtener acceso rápido a módulos
 */
export async function getModuleAccess(userId: string, moduleCode: ModuleCode): Promise<ModuleAccess> {
  if (moduleCode === 'MANUALES') {
    return moduleLimitsService.getManualesAccess(userId)
  }
  return moduleLimitsService.getGestionAccess(userId)
}

/**
 * Función helper para verificar acceso rápido
 */
export async function hasModuleAccess(userId: string, moduleCode: ModuleCode): Promise<boolean> {
  return moduleLimitsService.hasModuleAccess(userId, moduleCode)
}
