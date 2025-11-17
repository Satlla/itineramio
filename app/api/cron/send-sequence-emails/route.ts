import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  sendDay3MistakesEmail,
  sendDay7CaseStudyEmail,
  sendDay10TrialEmail,
  sendDay14UrgencyEmail,
} from '@/lib/resend'

/**
 * Cron job para enviar emails de la secuencia de nurturing
 *
 * Ejecutar cada hora con Vercel Cron o GitHub Actions:
 * */

// API endpoint debe estar protegido con un token para que solo Vercel/cron pueda ejecutarlo
const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret-change-in-production'

export async function GET(request: NextRequest) {
  // Verificar autorización
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const results = {
    day3Sent: 0,
    day7Sent: 0,
    day10Sent: 0,
    day14Sent: 0,
    errors: [] as string[],
  }

  try {
    const now = new Date()

    // ========================================
    // DÍA 3: Enviar a quienes se suscribieron hace 3 días
    // ========================================
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

    const day3Subscribers = await prisma.emailSubscriber.findMany({
      where: {
        sequenceStartedAt: {
          lte: threeDaysAgo, // Empezaron hace más de 3 días
        },
        day3SentAt: null, // No se les envió el email día 3
        sequenceStatus: 'active',
        status: 'active',
        archetype: {
          not: null, // Tienen arquetipo (viene del test)
        },
      },
      take: 50, // Batch de 50 para evitar rate limits
    })

    for (const subscriber of day3Subscribers) {
      try {
        await sendDay3MistakesEmail({
          email: subscriber.email,
          name: subscriber.name || 'Anfitrión',
          archetype: subscriber.archetype as any,
        })

        await prisma.emailSubscriber.update({
          where: { id: subscriber.id },
          data: {
            day3SentAt: now,
            emailsSent: { increment: 1 },
            lastEmailSentAt: now,
          },
        })

        results.day3Sent++
      } catch (error) {
        console.error(`Error sending day3 to ${subscriber.email}:`, error)
        results.errors.push(`Day3 ${subscriber.email}: ${error}`)
      }
    }

    // ========================================
    // DÍA 7: Enviar a quienes recibieron día 3 hace 4 días
    // ========================================
    const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)

    const day7Subscribers = await prisma.emailSubscriber.findMany({
      where: {
        day3SentAt: {
          lte: fourDaysAgo, // Recibieron día 3 hace más de 4 días
        },
        day7SentAt: null,
        sequenceStatus: 'active',
        status: 'active',
        archetype: {
          not: null,
        },
      },
      take: 50,
    })

    for (const subscriber of day7Subscribers) {
      try {
        await sendDay7CaseStudyEmail({
          email: subscriber.email,
          name: subscriber.name || 'Anfitrión',
          archetype: subscriber.archetype as any,
        })

        await prisma.emailSubscriber.update({
          where: { id: subscriber.id },
          data: {
            day7SentAt: now,
            emailsSent: { increment: 1 },
            lastEmailSentAt: now,
          },
        })

        results.day7Sent++
      } catch (error) {
        console.error(`Error sending day7 to ${subscriber.email}:`, error)
        results.errors.push(`Day7 ${subscriber.email}: ${error}`)
      }
    }

    // ========================================
    // DÍA 10: Enviar a quienes recibieron día 7 hace 3 días
    // ========================================

    const day10Subscribers = await prisma.emailSubscriber.findMany({
      where: {
        day7SentAt: {
          lte: threeDaysAgo,
        },
        day10SentAt: null,
        sequenceStatus: 'active',
        status: 'active',
        archetype: {
          not: null,
        },
      },
      take: 50,
    })

    for (const subscriber of day10Subscribers) {
      try {
        await sendDay10TrialEmail({
          email: subscriber.email,
          name: subscriber.name || 'Anfitrión',
          archetype: subscriber.archetype as any,
        })

        await prisma.emailSubscriber.update({
          where: { id: subscriber.id },
          data: {
            day10SentAt: now,
            emailsSent: { increment: 1 },
            lastEmailSentAt: now,
          },
        })

        results.day10Sent++
      } catch (error) {
        console.error(`Error sending day10 to ${subscriber.email}:`, error)
        results.errors.push(`Day10 ${subscriber.email}: ${error}`)
      }
    }

    // ========================================
    // DÍA 14: Enviar a quienes recibieron día 10 hace 4 días
    // ========================================

    const day14Subscribers = await prisma.emailSubscriber.findMany({
      where: {
        day10SentAt: {
          lte: fourDaysAgo,
        },
        day14SentAt: null,
        sequenceStatus: 'active',
        status: 'active',
        archetype: {
          not: null,
        },
      },
      take: 50,
    })

    for (const subscriber of day14Subscribers) {
      try {
        await sendDay14UrgencyEmail({
          email: subscriber.email,
          name: subscriber.name || 'Anfitrión',
          archetype: subscriber.archetype as any,
        })

        await prisma.emailSubscriber.update({
          where: { id: subscriber.id },
          data: {
            day14SentAt: now,
            emailsSent: { increment: 1 },
            lastEmailSentAt: now,
            sequenceStatus: 'completed', // Secuencia completa
          },
        })

        results.day14Sent++
      } catch (error) {
        console.error(`Error sending day14 to ${subscriber.email}:`, error)
        results.errors.push(`Day14 ${subscriber.email}: ${error}`)
      }
    }

    // ========================================
    // Retornar resultados
    // ========================================
    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      ...results,
      total: results.day3Sent + results.day7Sent + results.day10Sent + results.day14Sent,
    })

  } catch (error) {
    console.error('Error in send-sequence-emails cron:', error)
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
