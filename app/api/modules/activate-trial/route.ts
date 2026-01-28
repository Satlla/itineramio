import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * POST /api/modules/activate-trial
 * Activar trial gratuito de un módulo
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { moduleCode, trialDays = 14 } = await request.json()

    // Normalize FACTURAMIO to GESTION for compatibility
    const normalizedModuleCode = moduleCode === 'FACTURAMIO' ? 'GESTION' : moduleCode

    if (!normalizedModuleCode || !['MANUALES', 'GESTION'].includes(normalizedModuleCode)) {
      return NextResponse.json(
        { success: false, error: 'Módulo no válido' },
        { status: 400 }
      )
    }

    // Verificar si ya tiene un módulo activo o trial previo
    const existingModule = await prisma.userModule.findFirst({
      where: {
        userId,
        moduleType: normalizedModuleCode
      }
    })

    if (existingModule) {
      // Si ya tiene uno activo, no puede activar trial
      if (existingModule.isActive) {
        return NextResponse.json(
          { success: false, error: 'Ya tienes este módulo activo' },
          { status: 400 }
        )
      }

      // Si ya usó el trial anteriormente
      if (existingModule.trialEndsAt) {
        return NextResponse.json(
          { success: false, error: 'Ya has usado el período de prueba de este módulo' },
          { status: 400 }
        )
      }
    }

    const now = new Date()
    const trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)

    // Crear o actualizar el módulo con trial
    const userModule = await prisma.userModule.upsert({
      where: {
        userId_moduleType: {
          userId,
          moduleType: normalizedModuleCode
        }
      },
      create: {
        userId,
        moduleType: normalizedModuleCode,
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

    console.log(`✅ Trial activado: ${normalizedModuleCode} para usuario ${userId}, expira ${trialEndsAt.toISOString()}`)

    return NextResponse.json({
      success: true,
      module: {
        id: userModule.id,
        moduleType: userModule.moduleType,
        status: userModule.status,
        trialEndsAt: userModule.trialEndsAt,
        isActive: userModule.isActive
      },
      message: `Período de prueba de ${trialDays} días activado`
    })
  } catch (error) {
    console.error('Error activating trial:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
