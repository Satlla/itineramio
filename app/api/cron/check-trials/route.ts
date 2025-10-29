import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { emailNotificationService } from '../../../../src/lib/email-notifications'

export async function GET(request: NextRequest) {
  try {
    console.log('🕐 Starting trial check cron job...')
    
    // This should be protected by a cron secret in production
    const cronSecret = request.headers.get('x-cron-secret')
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const now = new Date()
    console.log('🕐 Current time:', now.toISOString())
    
    // 1. Check for expired trials
    console.log('🔍 Searching for expired trials...')
    const expiredTrials = await prisma.property.findMany({
      where: {
        status: 'TRIAL',
        trialEndsAt: {
          lte: now
        }
      },
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
    console.log(`📊 Found ${expiredTrials.length} expired trials`)
    
    // Suspend expired trials
    for (const property of expiredTrials) {
      await prisma.property.update({
        where: { id: property.id },
        data: {
          status: 'SUSPENDED',
          isPublished: false
        }
      })
      
      // Create notification
      await prisma.notification.create({
        data: {
          userId: property.hostId,
          type: 'TRIAL_EXPIRED',
          title: 'Período de prueba finalizado',
          message: `Tu propiedad "${property.name}" ha sido suspendida. Activa un plan de pago para reactivarla.`,
          data: {
            propertyId: property.id
          }
        }
      })

      // Send email notification for trial expiration
      try {
        await emailNotificationService.notifyTrialExpired({
          property: {
            id: property.id,
            name: property.name
          },
          user: {
            name: property.host.name,
            email: property.host.email
          }
        })
      } catch (emailError) {
        console.error('Error sending trial expiration email:', emailError)
        // Don't fail the cron job if email fails
      }
    }
    
    // 2. Send 24h warning
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
      }
    })
    
    for (const property of properties24h) {
      await prisma.property.update({
        where: { id: property.id },
        data: { trialNotified24h: true }
      })
      
      await prisma.notification.create({
        data: {
          userId: property.hostId,
          type: 'TRIAL_WARNING_24H',
          title: '⏰ Quedan 24 horas de prueba',
          message: `Tu propiedad "${property.name}" expirará en 24 horas. Activa un plan para no perder el acceso.`,
          data: {
            propertyId: property.id,
            hoursRemaining: 24
          }
        }
      })
    }
    
    // 3. Send 6h warning
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
      }
    })
    
    for (const property of properties6h) {
      await prisma.property.update({
        where: { id: property.id },
        data: { trialNotified6h: true }
      })
      
      await prisma.notification.create({
        data: {
          userId: property.hostId,
          type: 'TRIAL_WARNING_6H',
          title: '🚨 Solo quedan 6 horas!',
          message: `Tu propiedad "${property.name}" expirará en 6 horas. ¡Activa tu plan ahora!`,
          data: {
            propertyId: property.id,
            hoursRemaining: 6,
            urgent: true
          }
        }
      })
    }
    
    // 4. Send 1h final warning
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
      }
    })
    
    for (const property of properties1h) {
      await prisma.property.update({
        where: { id: property.id },
        data: { trialNotified1h: true }
      })
      
      await prisma.notification.create({
        data: {
          userId: property.hostId,
          type: 'TRIAL_WARNING_1H',
          title: '⚠️ ÚLTIMA HORA de prueba!',
          message: `Tu propiedad "${property.name}" se suspenderá en 1 hora. Activa tu plan YA para mantenerla activa.`,
          data: {
            propertyId: property.id,
            hoursRemaining: 1,
            critical: true
          }
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      processed: {
        expired: expiredTrials.length,
        warned24h: properties24h.length,
        warned6h: properties6h.length,
        warned1h: properties1h.length
      }
    })
    
  } catch (error) {
    console.error('Error checking trials:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}