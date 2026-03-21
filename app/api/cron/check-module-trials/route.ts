import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { sendModuleTrialExpiredEmail } from '../../../../src/lib/resend'

const MODULE_NAMES: Record<string, string> = {
  GESTION: 'Gestión',
  MANUALES: 'Manuales',
}

export async function GET(request: NextRequest) {
  try {
    // Auth with cron secret
    const cronSecret = request.headers.get('x-cron-secret')
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    // Find expired module trials
    const expiredModules = await prisma.userModule.findMany({
      where: {
        status: 'TRIAL',
        isActive: true,
        trialEndsAt: {
          lte: now
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    for (const userModule of expiredModules) {
      // Mark as expired
      await prisma.userModule.update({
        where: { id: userModule.id },
        data: {
          status: 'EXPIRED',
          isActive: false
        }
      })

      const moduleName = MODULE_NAMES[userModule.moduleType] || userModule.moduleType

      // Create in-app notification
      await prisma.notification.create({
        data: {
          userId: userModule.userId,
          type: 'MODULE_TRIAL_EXPIRED',
          title: `Trial de ${moduleName} finalizado`,
          message: `Tu período de prueba del módulo ${moduleName} ha terminado. Activa la suscripción para recuperar el acceso.`,
          data: {
            moduleType: userModule.moduleType,
            userModuleId: userModule.id
          }
        }
      })

      // Send email
      try {
        await sendModuleTrialExpiredEmail({
          email: userModule.user.email,
          name: userModule.user.name || 'Usuario',
          moduleName,
        })
      } catch (emailError) {
      }
    }

    return NextResponse.json({
      success: true,
      processed: {
        expired: expiredModules.length
      }
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
