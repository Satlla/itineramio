import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  sendSoapOperaEmail1,
  sendSoapOperaEmail2,
  sendSoapOperaEmail3,
  sendSoapOperaEmail4,
  sendSoapOperaEmail5,
  sendSoapOperaEmail6,
  sendSoapOperaEmail7,
  sendSoapOperaEmail8,
  type SoapOperaNivel,
} from '@/lib/resend'

/**
 * Cron job para enviar emails de la secuencia Soap Opera
 *
 * Secuencia de 15 días con 8 emails en días alternos:
 * - Email 1: Día 1 (inmediato tras quiz)
 * - Email 2: Día 3
 * - Email 3: Día 5
 * - Email 4: Día 7
 * - Email 5: Día 9
 * - Email 6: Día 11
 * - Email 7: Día 13
 * - Email 8: Día 15
 *
 * Ejecutar cada hora con Vercel Cron
 */

const CRON_SECRET = process.env.CRON_SECRET

// Helper para calcular hace cuántos días
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000)

export async function GET(request: NextRequest) {
  // Verificar autorizacion
  if (!CRON_SECRET) {
    console.error('CRON_SECRET not configured')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = {
    email1Sent: 0,
    email2Sent: 0,
    email3Sent: 0,
    email4Sent: 0,
    email5Sent: 0,
    email6Sent: 0,
    email7Sent: 0,
    email8Sent: 0,
    errors: [] as string[],
  }

  try {
    const now = new Date()

    // ========================================
    // EMAIL 1 - DÍA 1: Inmediato tras completar quiz
    // Se envia en el siguiente cron run (cada hora o diario)
    // ========================================
    const email1Subscribers = await prisma.emailSubscriber.findMany({
      where: {
        soapOperaStartedAt: { lte: now },  // Sin delay - enviar inmediatamente
        soapEmail1SentAt: null,
        soapOperaStatus: { in: ['pending', 'active'] },
        status: 'active',
        nivel: { not: null },
      },
      take: 50,
    })

    for (const subscriber of email1Subscribers) {
      try {
        await sendSoapOperaEmail1({
          email: subscriber.email,
          name: subscriber.name || 'Anfitrion',
          nivel: subscriber.nivel as SoapOperaNivel,
        })

        await prisma.emailSubscriber.update({
          where: { id: subscriber.id },
          data: {
            soapEmail1SentAt: now,
            soapOperaStatus: 'active',
            emailsSent: { increment: 1 },
            lastEmailSentAt: now,
          },
        })

        results.email1Sent++
      } catch (error) {
        console.error(`Error sending soap opera email 1 to ${subscriber.email}:`, error)
        results.errors.push(`Email1 ${subscriber.email}: ${error}`)
      }
    }

    // ========================================
    // EMAIL 2 - DÍA 3: 2 días después del email 1
    // ========================================
    const email2Subscribers = await prisma.emailSubscriber.findMany({
      where: {
        soapEmail1SentAt: { lte: daysAgo(2) },
        soapEmail2SentAt: null,
        soapOperaStatus: 'active',
        status: 'active',
        nivel: { not: null },
      },
      take: 50,
    })

    for (const subscriber of email2Subscribers) {
      try {
        await sendSoapOperaEmail2({
          email: subscriber.email,
          name: subscriber.name || 'Anfitrion',
          nivel: subscriber.nivel as SoapOperaNivel,
        })

        await prisma.emailSubscriber.update({
          where: { id: subscriber.id },
          data: {
            soapEmail2SentAt: now,
            emailsSent: { increment: 1 },
            lastEmailSentAt: now,
          },
        })

        results.email2Sent++
      } catch (error) {
        console.error(`Error sending soap opera email 2 to ${subscriber.email}:`, error)
        results.errors.push(`Email2 ${subscriber.email}: ${error}`)
      }
    }

    // ========================================
    // EMAIL 3 - DÍA 5: 2 días después del email 2
    // ========================================
    const email3Subscribers = await prisma.emailSubscriber.findMany({
      where: {
        soapEmail2SentAt: { lte: daysAgo(2) },
        soapEmail3SentAt: null,
        soapOperaStatus: 'active',
        status: 'active',
        nivel: { not: null },
      },
      take: 50,
    })

    for (const subscriber of email3Subscribers) {
      try {
        await sendSoapOperaEmail3({
          email: subscriber.email,
          name: subscriber.name || 'Anfitrion',
          nivel: subscriber.nivel as SoapOperaNivel,
        })

        await prisma.emailSubscriber.update({
          where: { id: subscriber.id },
          data: {
            soapEmail3SentAt: now,
            emailsSent: { increment: 1 },
            lastEmailSentAt: now,
          },
        })

        results.email3Sent++
      } catch (error) {
        console.error(`Error sending soap opera email 3 to ${subscriber.email}:`, error)
        results.errors.push(`Email3 ${subscriber.email}: ${error}`)
      }
    }

    // ========================================
    // EMAIL 4 - DÍA 7: 2 días después del email 3
    // ========================================
    const email4Subscribers = await prisma.emailSubscriber.findMany({
      where: {
        soapEmail3SentAt: { lte: daysAgo(2) },
        soapEmail4SentAt: null,
        soapOperaStatus: 'active',
        status: 'active',
        nivel: { not: null },
      },
      take: 50,
    })

    for (const subscriber of email4Subscribers) {
      try {
        await sendSoapOperaEmail4({
          email: subscriber.email,
          name: subscriber.name || 'Anfitrion',
          nivel: subscriber.nivel as SoapOperaNivel,
        })

        await prisma.emailSubscriber.update({
          where: { id: subscriber.id },
          data: {
            soapEmail4SentAt: now,
            emailsSent: { increment: 1 },
            lastEmailSentAt: now,
          },
        })

        results.email4Sent++
      } catch (error) {
        console.error(`Error sending soap opera email 4 to ${subscriber.email}:`, error)
        results.errors.push(`Email4 ${subscriber.email}: ${error}`)
      }
    }

    // ========================================
    // EMAIL 5 - DÍA 9: 2 días después del email 4
    // ========================================
    const email5Subscribers = await prisma.emailSubscriber.findMany({
      where: {
        soapEmail4SentAt: { lte: daysAgo(2) },
        soapEmail5SentAt: null,
        soapOperaStatus: 'active',
        status: 'active',
        nivel: { not: null },
      },
      take: 50,
    })

    for (const subscriber of email5Subscribers) {
      try {
        await sendSoapOperaEmail5({
          email: subscriber.email,
          name: subscriber.name || 'Anfitrion',
          nivel: subscriber.nivel as SoapOperaNivel,
        })

        await prisma.emailSubscriber.update({
          where: { id: subscriber.id },
          data: {
            soapEmail5SentAt: now,
            emailsSent: { increment: 1 },
            lastEmailSentAt: now,
          },
        })

        results.email5Sent++
      } catch (error) {
        console.error(`Error sending soap opera email 5 to ${subscriber.email}:`, error)
        results.errors.push(`Email5 ${subscriber.email}: ${error}`)
      }
    }

    // ========================================
    // EMAIL 6 - DÍA 11: 2 días después del email 5
    // ========================================
    const email6Subscribers = await prisma.emailSubscriber.findMany({
      where: {
        soapEmail5SentAt: { lte: daysAgo(2) },
        soapEmail6SentAt: null,
        soapOperaStatus: 'active',
        status: 'active',
        nivel: { not: null },
      },
      take: 50,
    })

    for (const subscriber of email6Subscribers) {
      try {
        await sendSoapOperaEmail6({
          email: subscriber.email,
          name: subscriber.name || 'Anfitrion',
          nivel: subscriber.nivel as SoapOperaNivel,
        })

        await prisma.emailSubscriber.update({
          where: { id: subscriber.id },
          data: {
            soapEmail6SentAt: now,
            emailsSent: { increment: 1 },
            lastEmailSentAt: now,
          },
        })

        results.email6Sent++
      } catch (error) {
        console.error(`Error sending soap opera email 6 to ${subscriber.email}:`, error)
        results.errors.push(`Email6 ${subscriber.email}: ${error}`)
      }
    }

    // ========================================
    // EMAIL 7 - DÍA 13: 2 días después del email 6
    // ========================================
    const email7Subscribers = await prisma.emailSubscriber.findMany({
      where: {
        soapEmail6SentAt: { lte: daysAgo(2) },
        soapEmail7SentAt: null,
        soapOperaStatus: 'active',
        status: 'active',
        nivel: { not: null },
      },
      take: 50,
    })

    for (const subscriber of email7Subscribers) {
      try {
        await sendSoapOperaEmail7({
          email: subscriber.email,
          name: subscriber.name || 'Anfitrion',
          nivel: subscriber.nivel as SoapOperaNivel,
        })

        await prisma.emailSubscriber.update({
          where: { id: subscriber.id },
          data: {
            soapEmail7SentAt: now,
            emailsSent: { increment: 1 },
            lastEmailSentAt: now,
          },
        })

        results.email7Sent++
      } catch (error) {
        console.error(`Error sending soap opera email 7 to ${subscriber.email}:`, error)
        results.errors.push(`Email7 ${subscriber.email}: ${error}`)
      }
    }

    // ========================================
    // EMAIL 8 - DÍA 15: 2 días después del email 7 (FIN DE SECUENCIA)
    // ========================================
    const email8Subscribers = await prisma.emailSubscriber.findMany({
      where: {
        soapEmail7SentAt: { lte: daysAgo(2) },
        soapEmail8SentAt: null,
        soapOperaStatus: 'active',
        status: 'active',
        nivel: { not: null },
      },
      take: 50,
    })

    for (const subscriber of email8Subscribers) {
      try {
        await sendSoapOperaEmail8({
          email: subscriber.email,
          name: subscriber.name || 'Anfitrion',
          nivel: subscriber.nivel as SoapOperaNivel,
        })

        await prisma.emailSubscriber.update({
          where: { id: subscriber.id },
          data: {
            soapEmail8SentAt: now,
            soapOperaStatus: 'completed', // Secuencia completada
            emailsSent: { increment: 1 },
            lastEmailSentAt: now,
          },
        })

        results.email8Sent++
      } catch (error) {
        console.error(`Error sending soap opera email 8 to ${subscriber.email}:`, error)
        results.errors.push(`Email8 ${subscriber.email}: ${error}`)
      }
    }

    // ========================================
    // Retornar resultados
    // ========================================
    const total =
      results.email1Sent +
      results.email2Sent +
      results.email3Sent +
      results.email4Sent +
      results.email5Sent +
      results.email6Sent +
      results.email7Sent +
      results.email8Sent

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      ...results,
      total,
    })

  } catch (error) {
    console.error('Error in soap opera sequence cron:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        ...results,
      },
      { status: 500 }
    )
  }
}

// También permitir POST para testing manual
export async function POST(request: NextRequest) {
  return GET(request)
}
