import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import {
  sendTrialWarning3DaysEmail,
  sendTrialWarning1DayEmail,
  sendTrialExpiredEmail
} from '../../../../src/lib/resend'

export async function GET(request: NextRequest) {
  try {
    // This should be protected by a cron secret in production
    const cronSecret = request.headers.get('x-cron-secret')
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    // 1. Check for expired trials (batch: 100)
    const expiredTrials = await prisma.property.findMany({
      where: {
        status: 'TRIAL',
        trialEndsAt: {
          lte: now
        }
      },
      take: 100,
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (expiredTrials.length > 0) {
      const expiredIds = expiredTrials.map(p => p.id)

      // Bulk-update status for all expired properties in one query
      await prisma.property.updateMany({
        where: { id: { in: expiredIds } },
        data: {
          status: 'SUSPENDED',
          isPublished: false
        }
      })

      // Bulk-create notifications for all expired properties in one query
      await prisma.notification.createMany({
        data: expiredTrials.map(property => ({
          userId: property.hostId,
          type: 'TRIAL_EXPIRED',
          title: 'Período de prueba finalizado',
          message: `Tu propiedad "${property.name}" ha sido suspendida. Activa un plan de pago para reactivarla.`,
          data: {
            propertyId: property.id
          }
        }))
      })

      // Send individual emails (requires per-property host data)
      for (const property of expiredTrials) {
        try {
          await sendTrialExpiredEmail({
            email: property.host.email,
            name: property.host.name,
            propertyName: property.name
          })
        } catch (emailError) {
          // Don't fail the cron job if email fails
        }
      }
    }

    // 2. Send 3-day warning (batch: 100)
    const threeDaysFromNow = new Date(now)
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

    const properties3d = await prisma.property.findMany({
      where: {
        status: 'TRIAL',
        trialNotified3d: false,
        trialEndsAt: {
          gte: now,
          lte: threeDaysFromNow
        }
      },
      take: 100,
      include: {
        host: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (properties3d.length > 0) {
      // Bulk-update notification flag
      await prisma.property.updateMany({
        where: { id: { in: properties3d.map(p => p.id) } },
        data: { trialNotified3d: true }
      })

      // Bulk-create notifications (daysRemaining computed per property)
      await prisma.notification.createMany({
        data: properties3d.map(property => {
          const daysRemaining = Math.ceil((property.trialEndsAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          return {
            userId: property.hostId,
            type: 'TRIAL_WARNING_3D',
            title: `⏰ Quedan ${daysRemaining} días de prueba`,
            message: `Tu propiedad "${property.name}" expirará en ${daysRemaining} días. Activa un plan para no perder el acceso.`,
            data: {
              propertyId: property.id,
              daysRemaining
            }
          }
        })
      })

      // Send individual emails
      for (const property of properties3d) {
        const daysRemaining = Math.ceil((property.trialEndsAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        try {
          await sendTrialWarning3DaysEmail({
            email: property.host.email,
            name: property.host.name,
            propertyName: property.name,
            daysRemaining
          })
        } catch (emailError) {
          // Don't fail the cron job if email fails
        }
      }
    }

    // 3. Send 24h warning (batch: 100)
    const twentyFourHoursFromNow = new Date(now)
    twentyFourHoursFromNow.setHours(twentyFourHoursFromNow.getHours() + 24)

    const properties24h = await prisma.property.findMany({
      where: {
        status: 'TRIAL',
        trialNotified24h: false,
        trialEndsAt: {
          gte: now,
          lte: twentyFourHoursFromNow
        }
      },
      take: 100,
      include: {
        host: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (properties24h.length > 0) {
      // Bulk-update notification flag
      await prisma.property.updateMany({
        where: { id: { in: properties24h.map(p => p.id) } },
        data: { trialNotified24h: true }
      })

      // Bulk-create notifications
      await prisma.notification.createMany({
        data: properties24h.map(property => ({
          userId: property.hostId,
          type: 'TRIAL_WARNING_24H',
          title: '⏰ Quedan 24 horas de prueba',
          message: `Tu propiedad "${property.name}" expirará en 24 horas. Activa un plan para no perder el acceso.`,
          data: {
            propertyId: property.id,
            hoursRemaining: 24
          }
        }))
      })

      // Send individual emails
      for (const property of properties24h) {
        try {
          await sendTrialWarning1DayEmail({
            email: property.host.email,
            name: property.host.name,
            propertyName: property.name
          })
        } catch (emailError) {
          // Don't fail the cron job if email fails
        }
      }
    }

    // 4. Send 6h warning (batch: 100)
    const sixHoursFromNow = new Date(now)
    sixHoursFromNow.setHours(sixHoursFromNow.getHours() + 6)

    const properties6h = await prisma.property.findMany({
      where: {
        status: 'TRIAL',
        trialNotified6h: false,
        trialEndsAt: {
          gte: now,
          lte: sixHoursFromNow
        }
      },
      take: 100
    })

    if (properties6h.length > 0) {
      // Bulk-update notification flag
      await prisma.property.updateMany({
        where: { id: { in: properties6h.map(p => p.id) } },
        data: { trialNotified6h: true }
      })

      // Bulk-create notifications
      await prisma.notification.createMany({
        data: properties6h.map(property => ({
          userId: property.hostId,
          type: 'TRIAL_WARNING_6H',
          title: '🚨 Solo quedan 6 horas!',
          message: `Tu propiedad "${property.name}" expirará en 6 horas. ¡Activa tu plan ahora!`,
          data: {
            propertyId: property.id,
            hoursRemaining: 6,
            urgent: true
          }
        }))
      })
    }

    // 5. Send 1h final warning (batch: 100)
    const oneHourFromNow = new Date(now)
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1)

    const properties1h = await prisma.property.findMany({
      where: {
        status: 'TRIAL',
        trialNotified1h: false,
        trialEndsAt: {
          gte: now,
          lte: oneHourFromNow
        }
      },
      take: 100
    })

    if (properties1h.length > 0) {
      // Bulk-update notification flag
      await prisma.property.updateMany({
        where: { id: { in: properties1h.map(p => p.id) } },
        data: { trialNotified1h: true }
      })

      // Bulk-create notifications
      await prisma.notification.createMany({
        data: properties1h.map(property => ({
          userId: property.hostId,
          type: 'TRIAL_WARNING_1H',
          title: '⚠️ ÚLTIMA HORA de prueba!',
          message: `Tu propiedad "${property.name}" se suspenderá en 1 hora. Activa tu plan YA para mantenerla activa.`,
          data: {
            propertyId: property.id,
            hoursRemaining: 1,
            critical: true
          }
        }))
      })
    }

    return NextResponse.json({
      success: true,
      processed: {
        expired: expiredTrials.length,
        warned3d: properties3d.length,
        warned24h: properties24h.length,
        warned6h: properties6h.length,
        warned1h: properties1h.length
      }
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
