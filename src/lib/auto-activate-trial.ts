/**
 * AUTO-ACTIVATE TRIAL
 *
 * Funciones para activar automáticamente el trial de módulos:
 * - MANUALES: Se activa al crear la primera propiedad
 * - GESTION: Se activa al entrar por primera vez a /gestion
 *
 * Cada módulo tiene su propio trial de 15 días independiente.
 */

import { prisma } from './prisma'
import { type ModuleCode } from '@/config/modules'

const TRIAL_DAYS = 15

interface AutoActivateResult {
  activated: boolean
  alreadyActive: boolean
  trialEndsAt: Date | null
  message: string
}

/**
 * Auto-activa el trial de un módulo si el usuario no tiene
 * uno activo o no ha usado el trial anteriormente.
 *
 * @param userId - ID del usuario
 * @param moduleCode - Código del módulo ('MANUALES' | 'GESTION')
 * @returns Resultado de la activación
 */
export async function autoActivateTrial(
  userId: string,
  moduleCode: ModuleCode
): Promise<AutoActivateResult> {
  try {
    // Verificar si ya existe un UserModule para este usuario y módulo
    const existingModule = await prisma.userModule.findUnique({
      where: {
        userId_moduleType: {
          userId,
          moduleType: moduleCode
        }
      }
    })

    // Si ya tiene un módulo activo (trial o pagado), no activar
    if (existingModule?.isActive) {
      return {
        activated: false,
        alreadyActive: true,
        trialEndsAt: existingModule.trialEndsAt,
        message: 'El módulo ya está activo'
      }
    }

    // Si ya usó el trial (tiene trialStartedAt), no activar de nuevo
    if (existingModule?.trialStartedAt) {
      return {
        activated: false,
        alreadyActive: false,
        trialEndsAt: existingModule.trialEndsAt,
        message: 'Ya has usado el período de prueba de este módulo'
      }
    }

    // Activar trial
    const now = new Date()
    const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)

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
        status: 'TRIAL',
        isActive: true,
        trialStartedAt: now,
        trialEndsAt
      },
      update: {
        status: 'TRIAL',
        isActive: true,
        trialStartedAt: now,
        trialEndsAt
      }
    })

    console.log(`✅ Auto-trial activado: ${moduleCode} para usuario ${userId}, expira ${trialEndsAt.toISOString()}`)

    return {
      activated: true,
      alreadyActive: false,
      trialEndsAt,
      message: `Período de prueba de ${TRIAL_DAYS} días activado`
    }
  } catch (error) {
    console.error(`Error auto-activating ${moduleCode} trial:`, error)
    return {
      activated: false,
      alreadyActive: false,
      trialEndsAt: null,
      message: 'Error al activar el período de prueba'
    }
  }
}

/**
 * Auto-activa MANUALES trial cuando el usuario crea su primera propiedad.
 * Llamar desde el API de creación de propiedades.
 */
export async function autoActivateManualesTrial(userId: string): Promise<AutoActivateResult> {
  // Verificar si es la primera propiedad del usuario
  const propertyCount = await prisma.property.count({
    where: { hostId: userId }
  })

  // Solo activar si es la primera propiedad (count será 1 después de crear)
  if (propertyCount > 1) {
    return {
      activated: false,
      alreadyActive: false,
      trialEndsAt: null,
      message: 'No es la primera propiedad'
    }
  }

  return autoActivateTrial(userId, 'MANUALES')
}

/**
 * Auto-activa GESTION trial cuando el usuario entra por primera vez.
 * Llamar desde el API del dashboard de gestión.
 */
export async function autoActivateGestionTrial(userId: string): Promise<AutoActivateResult> {
  return autoActivateTrial(userId, 'GESTION')
}
