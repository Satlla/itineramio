import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  sendDay3MistakesEmail,
  sendDay7CaseStudyEmail,
  sendDay10TrialEmail,
  sendDay14UrgencyEmail,
} from '@/lib/resend'

/**
 * SOLO PARA TESTING EN DESARROLLO
 *
 * Este endpoint permite forzar el envío de un email específico de la secuencia
 * sin esperar los días correspondientes
 *
 * Uso:
 * POST /api/test/force-sequence-email
 * Body: { "email": "tu@email.com", "day": 3 | 7 | 10 | 14 }
 */

export async function POST(request: NextRequest) {
  // Solo permitir en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { email, day } = body

    if (!email || !day) {
      return NextResponse.json(
        { error: 'Email and day are required' },
        { status: 400 }
      )
    }

    // Buscar el subscriber
    const subscriber = await prisma.emailSubscriber.findUnique({
      where: { email },
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      )
    }

    if (!subscriber.archetype) {
      return NextResponse.json(
        { error: 'Subscriber has no archetype. Complete the test first.' },
        { status: 400 }
      )
    }

    const now = new Date()
    let result

    // Enviar el email correspondiente
    switch (day) {
      case 3:
        result = await sendDay3MistakesEmail({
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
        break

      case 7:
        result = await sendDay7CaseStudyEmail({
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
        break

      case 10:
        result = await sendDay10TrialEmail({
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
        break

      case 14:
        result = await sendDay14UrgencyEmail({
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
            sequenceStatus: 'completed',
          },
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid day. Must be 3, 7, 10, or 14' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `Day ${day} email sent to ${email}`,
      result,
      timestamp: now.toISOString(),
    })

  } catch (error) {
    console.error('Error in force-sequence-email:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
