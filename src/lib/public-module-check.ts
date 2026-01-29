/**
 * PUBLIC MODULE ACCESS CHECK
 *
 * Verifica si un host tiene acceso activo al módulo MANUALES
 * para permitir que sus huéspedes vean los manuales públicos.
 *
 * Si el host no tiene el módulo activo (ni suscripción, ni trial),
 * los manuales no estarán disponibles públicamente.
 */

import { prisma } from './prisma'

export interface ModuleCheckResult {
  hasAccess: boolean
  reason?: 'active' | 'trial' | 'legacy_subscription' | 'legacy_trial'
  blockedReason?: 'no_module' | 'expired' | 'canceled'
}

/**
 * Verifica si un host tiene acceso al módulo MANUALES
 * para mostrar sus manuales públicamente
 */
export async function checkHostManualesAccess(hostId: string): Promise<ModuleCheckResult> {
  try {
    // 1. Verificar UserModule MANUALES activo
    const userModule = await prisma.userModule.findUnique({
      where: {
        userId_moduleType: {
          userId: hostId,
          moduleType: 'MANUALES'
        }
      }
    })

    if (userModule && userModule.isActive) {
      // Verificar que no esté expirado si tiene fecha de expiración
      if (userModule.expiresAt && new Date(userModule.expiresAt) < new Date()) {
        return { hasAccess: false, blockedReason: 'expired' }
      }

      // Verificar trial
      if (userModule.status === 'TRIAL') {
        if (userModule.trialEndsAt && new Date(userModule.trialEndsAt) > new Date()) {
          return { hasAccess: true, reason: 'trial' }
        }
        // Trial expirado
        return { hasAccess: false, blockedReason: 'expired' }
      }

      // Activo normal
      if (userModule.status === 'ACTIVE') {
        return { hasAccess: true, reason: 'active' }
      }

      // Cancelado
      if (userModule.status === 'CANCELED') {
        return { hasAccess: false, blockedReason: 'canceled' }
      }
    }

    // 2. Fallback: Verificar UserSubscription existente (compatibilidad legacy)
    const userSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: hostId,
        status: 'ACTIVE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (userSubscription) {
      // Verificar que no esté expirado
      if (userSubscription.endDate && new Date(userSubscription.endDate) < new Date()) {
        return { hasAccess: false, blockedReason: 'expired' }
      }
      return { hasAccess: true, reason: 'legacy_subscription' }
    }

    // 3. Fallback: Verificar trial del usuario (legacy)
    const user = await prisma.user.findUnique({
      where: { id: hostId },
      select: {
        trialEndsAt: true
      }
    })

    if (user?.trialEndsAt && new Date(user.trialEndsAt) > new Date()) {
      return { hasAccess: true, reason: 'legacy_trial' }
    }

    // 4. Sin acceso
    return { hasAccess: false, blockedReason: 'no_module' }

  } catch (error) {
    console.error('Error checking host MANUALES access:', error)
    // En caso de error, permitir acceso para no bloquear por error técnico
    return { hasAccess: true, reason: 'active' }
  }
}

/**
 * Mensaje de error para mostrar cuando el manual no está disponible
 */
export const MANUAL_BLOCKED_MESSAGE = {
  title: 'Manual no disponible',
  description: 'Este manual no está disponible actualmente. Por favor, contacta con el anfitrión para más información.',
  code: 'MANUAL_ACCESS_BLOCKED'
}
