import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Endpoint para manipular fechas de secuencia para testing
 *
 * Uso:
 *   // Resetear todas las fechas (empezar de cero)
 *   curl "http://localhost:3000/api/test/force-sequence-dates?action=reset&email=tu@email.com"
 *
 *   // Forzar que pasaron X días desde el inicio de la secuencia
 *   curl "http://localhost:3000/api/test/force-sequence-dates?action=advance&email=tu@email.com&days=3"
 *
 *   // Forzar que day3 se envió hace X días (para poder recibir day7)
 *   curl "http://localhost:3000/api/test/force-sequence-dates?action=advance-day3&email=tu@email.com&days=4"
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const email = searchParams.get('email')
  const days = parseInt(searchParams.get('days') || '0')

  if (!email) {
    return NextResponse.json({
      error: 'Email is required',
      usage: {
        reset: '/api/test/force-sequence-dates?action=reset&email=tu@email.com',
        advance: '/api/test/force-sequence-dates?action=advance&email=tu@email.com&days=3',
        'advance-day3': '/api/test/force-sequence-dates?action=advance-day3&email=tu@email.com&days=4'
      }
    }, { status: 400 })
  }

  try {
    const subscriber = await prisma.emailSubscriber.findFirst({
      where: { email },
      orderBy: { subscribedAt: 'desc' }
    })

    if (!subscriber) {
      return NextResponse.json({
        error: 'Subscriber not found',
        email
      }, { status: 404 })
    }

    let updateData: any = {}
    let message = ''

    switch (action) {
      case 'reset':
        // Resetear todas las fechas para empezar de cero
        updateData = {
          sequenceStartedAt: new Date(),
          sequenceStatus: 'active',
          day3SentAt: null,
          day7SentAt: null,
          day10SentAt: null,
          day14SentAt: null,
          emailsSent: 0,
          lastEmailSentAt: null
        }
        message = 'Sequence reset to start fresh'
        break

      case 'advance':
        // Mover sequenceStartedAt X días hacia atrás
        const pastDate = new Date()
        pastDate.setDate(pastDate.getDate() - days)
        updateData = {
          sequenceStartedAt: pastDate
        }
        message = `Sequence start date moved ${days} days back`
        break

      case 'advance-day3':
        // Mover day3SentAt X días hacia atrás (para poder recibir day7)
        const day3Date = new Date()
        day3Date.setDate(day3Date.getDate() - days)
        updateData = {
          day3SentAt: day3Date
        }
        message = `Day 3 sent date moved ${days} days back`
        break

      case 'advance-day7':
        // Mover day7SentAt X días hacia atrás (para poder recibir day10)
        const day7Date = new Date()
        day7Date.setDate(day7Date.getDate() - days)
        updateData = {
          day7SentAt: day7Date
        }
        message = `Day 7 sent date moved ${days} days back`
        break

      case 'advance-day10':
        // Mover day10SentAt X días hacia atrás (para poder recibir day14)
        const day10Date = new Date()
        day10Date.setDate(day10Date.getDate() - days)
        updateData = {
          day10SentAt: day10Date
        }
        message = `Day 10 sent date moved ${days} days back`
        break

      case 'advance-all':
        // Simular que pasaron X días y se enviaron todos los emails anteriores
        const now = new Date()
        const sequenceStart = new Date(now)
        sequenceStart.setDate(sequenceStart.getDate() - days)

        updateData = {
          sequenceStartedAt: sequenceStart
        }

        if (days >= 3) {
          const day3 = new Date(sequenceStart)
          day3.setDate(day3.getDate() + 3)
          updateData.day3SentAt = day3
        }
        if (days >= 7) {
          const day7 = new Date(sequenceStart)
          day7.setDate(day7.getDate() + 7)
          updateData.day7SentAt = day7
        }
        if (days >= 10) {
          const day10 = new Date(sequenceStart)
          day10.setDate(day10.getDate() + 10)
          updateData.day10SentAt = day10
        }
        if (days >= 14) {
          const day14 = new Date(sequenceStart)
          day14.setDate(day14.getDate() + 14)
          updateData.day14SentAt = day14
          updateData.sequenceStatus = 'completed'
        }

        message = `Simulated ${days} days passed with all appropriate emails sent`
        break

      default:
        return NextResponse.json({
          error: 'Invalid action',
          validActions: ['reset', 'advance', 'advance-day3', 'advance-day7', 'advance-day10', 'advance-all']
        }, { status: 400 })
    }

    const updated = await prisma.emailSubscriber.update({
      where: { id: subscriber.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message,
      subscriber: {
        email: updated.email,
        sequenceStartedAt: updated.sequenceStartedAt,
        sequenceStatus: updated.sequenceStatus,
        emailsSent: updated.emailsSent,
        sequence: {
          day3: updated.day3SentAt ? `✓ (${updated.day3SentAt.toISOString()})` : '✗',
          day7: updated.day7SentAt ? `✓ (${updated.day7SentAt.toISOString()})` : '✗',
          day10: updated.day10SentAt ? `✓ (${updated.day10SentAt.toISOString()})` : '✗',
          day14: updated.day14SentAt ? `✓ (${updated.day14SentAt.toISOString()})` : '✗'
        }
      }
    })

  } catch (error) {
    console.error('Error manipulating sequence dates:', error)
    return NextResponse.json({
      error: 'Error manipulating sequence dates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
