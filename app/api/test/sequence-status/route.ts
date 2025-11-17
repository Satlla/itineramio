import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * ENDPOINT DE TESTING
 *
 * Verifica el estado de la secuencia de emails para un subscriber
 *
 * Uso:
 * GET /api/test/sequence-status?email=tu@email.com
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    // Buscar el subscriber
    const subscriber = await prisma.emailSubscriber.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        archetype: true,
        source: true,
        status: true,
        sequenceStartedAt: true,
        sequenceStatus: true,
        day3SentAt: true,
        day7SentAt: true,
        day10SentAt: true,
        day14SentAt: true,
        emailsSent: true,
        emailsOpened: true,
        emailsClicked: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found', email },
        { status: 404 }
      )
    }

    // Calcular el progreso de la secuencia
    const sequence = {
      day0: {
        name: 'Welcome Email',
        sent: !!subscriber.sequenceStartedAt,
        sentAt: subscriber.sequenceStartedAt,
      },
      day3: {
        name: '3 Errores Comunes',
        sent: !!subscriber.day3SentAt,
        sentAt: subscriber.day3SentAt,
        shouldBeSent: subscriber.sequenceStartedAt
          ? new Date(subscriber.sequenceStartedAt).getTime() + 3 * 24 * 60 * 60 * 1000 < Date.now()
          : false,
      },
      day7: {
        name: 'Case Study',
        sent: !!subscriber.day7SentAt,
        sentAt: subscriber.day7SentAt,
        shouldBeSent: subscriber.day3SentAt
          ? new Date(subscriber.day3SentAt).getTime() + 4 * 24 * 60 * 60 * 1000 < Date.now()
          : false,
      },
      day10: {
        name: 'Trial Invitation',
        sent: !!subscriber.day10SentAt,
        sentAt: subscriber.day10SentAt,
        shouldBeSent: subscriber.day7SentAt
          ? new Date(subscriber.day7SentAt).getTime() + 3 * 24 * 60 * 60 * 1000 < Date.now()
          : false,
      },
      day14: {
        name: 'Last Chance',
        sent: !!subscriber.day14SentAt,
        sentAt: subscriber.day14SentAt,
        shouldBeSent: subscriber.day10SentAt
          ? new Date(subscriber.day10SentAt).getTime() + 4 * 24 * 60 * 60 * 1000 < Date.now()
          : false,
      },
    }

    // Contar emails enviados en la secuencia
    const emailsSentInSequence = [
      sequence.day0.sent,
      sequence.day3.sent,
      sequence.day7.sent,
      sequence.day10.sent,
      sequence.day14.sent,
    ].filter(Boolean).length

    const nextEmail = !sequence.day3.sent
      ? 'Day 3'
      : !sequence.day7.sent
      ? 'Day 7'
      : !sequence.day10.sent
      ? 'Day 10'
      : !sequence.day14.sent
      ? 'Day 14'
      : 'Sequence Complete'

    return NextResponse.json({
      subscriber: {
        email: subscriber.email,
        name: subscriber.name,
        archetype: subscriber.archetype,
        status: subscriber.status,
        sequenceStatus: subscriber.sequenceStatus,
      },
      sequence,
      progress: {
        emailsSentInSequence,
        totalEmails: 5,
        percentage: Math.round((emailsSentInSequence / 5) * 100),
        nextEmail,
      },
      stats: {
        totalEmailsSent: subscriber.emailsSent,
        emailsOpened: subscriber.emailsOpened,
        emailsClicked: subscriber.emailsClicked,
      },
      timestamps: {
        subscribedAt: subscriber.createdAt,
        sequenceStartedAt: subscriber.sequenceStartedAt,
        lastUpdated: subscriber.updatedAt,
      },
    })

  } catch (error) {
    console.error('Error in sequence-status:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
