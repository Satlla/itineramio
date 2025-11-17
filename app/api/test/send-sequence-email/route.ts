import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  sendDay3MistakesEmail,
  sendDay7CaseStudyEmail,
  sendDay10TrialEmail,
  sendDay14UrgencyEmail,
} from '@/lib/resend'

/**
 * Endpoint de prueba para enviar manualmente emails de secuencia
 *
 * Uso:
 *   curl "http://localhost:3000/api/test/send-sequence-email?day=3"
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const day = searchParams.get('day') || '3'
  const email = searchParams.get('email')

  try {
    // Encontrar un subscriber para prueba
    const query: any = {
      source: 'host_profile_test',
      sequenceStatus: 'active',
      archetype: { not: null }
    }

    if (email) {
      query.email = email
    }

    const testSubscriber = await prisma.emailSubscriber.findFirst({
      where: query,
      orderBy: {
        subscribedAt: 'desc'
      }
    })

    if (!testSubscriber) {
      return NextResponse.json({
        error: 'No test subscriber found. Please complete the host profile test first.'
      }, { status: 404 })
    }

    const now = new Date()
    let result: any
    let dayField: string = ''

    // Enviar el email según el día
    if (day === '3') {
      if (testSubscriber.day3SentAt) {
        return NextResponse.json({
          error: 'Day 3 already sent',
          suggestion: 'Try day=7'
        }, { status: 400 })
      }

      result = await sendDay3MistakesEmail({
        email: testSubscriber.email,
        name: testSubscriber.name || 'Anfitrión',
        archetype: testSubscriber.archetype as any,
      })
      dayField = 'day3SentAt'

    } else if (day === '7') {
      if (testSubscriber.day7SentAt) {
        return NextResponse.json({
          error: 'Day 7 already sent',
          suggestion: 'Try day=10'
        }, { status: 400 })
      }

      result = await sendDay7CaseStudyEmail({
        email: testSubscriber.email,
        name: testSubscriber.name || 'Anfitrión',
        archetype: testSubscriber.archetype as any,
      })
      dayField = 'day7SentAt'

    } else if (day === '10') {
      if (testSubscriber.day10SentAt) {
        return NextResponse.json({
          error: 'Day 10 already sent',
          suggestion: 'Try day=14'
        }, { status: 400 })
      }

      result = await sendDay10TrialEmail({
        email: testSubscriber.email,
        name: testSubscriber.name || 'Anfitrión',
        archetype: testSubscriber.archetype as any,
      })
      dayField = 'day10SentAt'

    } else if (day === '14') {
      if (testSubscriber.day14SentAt) {
        return NextResponse.json({
          error: 'Day 14 already sent. Sequence completed!'
        }, { status: 400 })
      }

      result = await sendDay14UrgencyEmail({
        email: testSubscriber.email,
        name: testSubscriber.name || 'Anfitrión',
        archetype: testSubscriber.archetype as any,
      })
      dayField = 'day14SentAt'
    }

    if (!result?.success) {
      return NextResponse.json({
        error: 'Failed to send email',
        details: result?.error
      }, { status: 500 })
    }

    // Actualizar base de datos
    const updateData: any = {
      emailsSent: { increment: 1 },
      lastEmailSentAt: now,
      [dayField]: now
    }

    if (day === '14') {
      updateData.sequenceStatus = 'completed'
    }

    await prisma.emailSubscriber.update({
      where: { id: testSubscriber.id },
      data: updateData
    })

    // Obtener stats actualizadas
    const updated = await prisma.emailSubscriber.findUnique({
      where: { id: testSubscriber.id }
    })

    return NextResponse.json({
      success: true,
      message: `Day ${day} email sent successfully!`,
      subscriber: {
        email: updated?.email,
        emailsSent: updated?.emailsSent,
        lastEmailSent: updated?.lastEmailSentAt,
        sequence: {
          day3: updated?.day3SentAt ? '✓' : '✗',
          day7: updated?.day7SentAt ? '✓' : '✗',
          day10: updated?.day10SentAt ? '✓' : '✗',
          day14: updated?.day14SentAt ? '✓' : '✗',
        },
        status: updated?.sequenceStatus
      }
    })

  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json({
      error: 'Error sending test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
