/**
 * SERVICIO DE GESTIÓN DE TRIALS
 *
 * Maneja el período de prueba de 15 días para nuevos usuarios.
 * Los usuarios obtienen acceso completo durante el trial.
 *
 * Políticas:
 * - Trial de 15 días desde el registro
 * - Acceso ilimitado durante el trial
 * - Verificación automática de expiración
 * - No más "gratis" o "gratuito" - es "período de prueba"
 *
 * Última actualización: 19/10/2025
 */

import { prisma } from './prisma'

export interface TrialStatus {
  isActive: boolean
  startedAt: Date | null
  endsAt: Date | null
  daysRemaining: number
  hasExpired: boolean
}

export class TrialService {
  private static instance: TrialService
  private static readonly TRIAL_DAYS = 15

  private constructor() {}

  static getInstance(): TrialService {
    if (!TrialService.instance) {
      TrialService.instance = new TrialService()
    }
    return TrialService.instance
  }

  /**
   * Inicializar trial para un nuevo usuario (llamar en registro)
   */
  async initializeTrial(userId: string): Promise<void> {
    const now = new Date()
    const trialEndsAt = new Date(now.getTime() + TrialService.TRIAL_DAYS * 24 * 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: userId },
      data: {
        trialStartedAt: now,
        trialEndsAt: trialEndsAt
      }
    })

  }

  /**
   * Verificar si el trial de un usuario está activo
   */
  async isTrialActive(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { trialEndsAt: true }
    })

    if (!user || !user.trialEndsAt) {
      return false
    }

    const now = new Date()
    return user.trialEndsAt > now
  }

  /**
   * Obtener estado completo del trial de un usuario
   */
  async getTrialStatus(userId: string): Promise<TrialStatus> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        trialStartedAt: true,
        trialEndsAt: true
      }
    })

    if (!user || !user.trialEndsAt) {
      return {
        isActive: false,
        startedAt: null,
        endsAt: null,
        daysRemaining: 0,
        hasExpired: false
      }
    }

    const now = new Date()
    const isActive = user.trialEndsAt > now
    const daysRemaining = Math.max(
      0,
      Math.ceil((user.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    )

    const status: TrialStatus = {
      isActive,
      startedAt: user.trialStartedAt,
      endsAt: user.trialEndsAt,
      daysRemaining,
      hasExpired: !isActive && user.trialEndsAt < now
    }

    return status
  }

  /**
   * Expirar manualmente el trial de un usuario (admin)
   */
  async expireTrial(userId: string): Promise<void> {
    const now = new Date()
    await prisma.user.update({
      where: { id: userId },
      data: {
        trialEndsAt: now
      }
    })

  }

  /**
   * Extender el trial de un usuario (admin)
   */
  async extendTrial(userId: string, additionalDays: number): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { trialEndsAt: true }
    })

    if (!user || !user.trialEndsAt) {
      throw new Error('Usuario no tiene trial activo')
    }

    const newEndsAt = new Date(user.trialEndsAt.getTime() + additionalDays * 24 * 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: userId },
      data: {
        trialEndsAt: newEndsAt
      }
    })

  }

  /**
   * Obtener todos los usuarios con trials que expiran pronto
   * (útil para enviar notificaciones)
   */
  async getUsersWithExpiringTrials(daysBeforeExpiry: number = 3): Promise<Array<{ id: string, email: string, trialEndsAt: Date }>> {
    const now = new Date()
    const futureDate = new Date(now.getTime() + daysBeforeExpiry * 24 * 60 * 60 * 1000)

    const users = await prisma.user.findMany({
      where: {
        trialEndsAt: {
          gte: now,
          lte: futureDate
        },
        // Sin suscripción activa
        NOT: {
          subscriptions: {
            some: {
              status: 'ACTIVE'
            }
          }
        }
      },
      select: {
        id: true,
        email: true,
        trialEndsAt: true
      }
    })

    return users.filter(u => u.trialEndsAt !== null) as Array<{ id: string, email: string, trialEndsAt: Date }>
  }

  /**
   * Obtener usuarios con trials expirados sin suscripción
   * (útil para limpiar datos o enviar recordatorios)
   */
  async getUsersWithExpiredTrials(): Promise<Array<{ id: string, email: string, trialEndsAt: Date }>> {
    const now = new Date()

    const users = await prisma.user.findMany({
      where: {
        trialEndsAt: {
          lt: now
        },
        // Sin suscripción activa
        NOT: {
          subscriptions: {
            some: {
              status: 'ACTIVE'
            }
          }
        }
      },
      select: {
        id: true,
        email: true,
        trialEndsAt: true
      }
    })

    return users.filter(u => u.trialEndsAt !== null) as Array<{ id: string, email: string, trialEndsAt: Date }>
  }
}

// Singleton export
export const trialService = TrialService.getInstance()
