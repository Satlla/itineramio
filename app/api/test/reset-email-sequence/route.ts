import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Endpoint para resetear las fechas de envío de emails de un subscriber
 * Útil para testing del embudo
 *
 * Uso: GET /api/test/reset-email-sequence?email=tu@email.com
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    console.log(`\n🔄 Reseteando secuencia de emails para: ${email}\n`)

    // Buscar subscriber
    const subscriber = await prisma.emailSubscriber.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: `No se encontró subscriber con email: ${email}` },
        { status: 404 }
      )
    }

    // Resetear todas las fechas de envío
    const updated = await prisma.emailSubscriber.update({
      where: { id: subscriber.id },
      data: {
        day3SentAt: null,
        day7SentAt: null,
        day10SentAt: null,
        day14SentAt: null,
        sequenceStatus: 'active',
        sequenceStartedAt: new Date(), // Reiniciar desde ahora
        emailsSent: 0,
        emailsDelivered: 0,
        emailsOpened: 0,
        emailsClicked: 0,
        lastEmailSentAt: null,
        lastEmailOpenedAt: null,
        lastEmailClickedAt: null,
      }
    })

    console.log('✅ Secuencia reseteada correctamente\n')

    return NextResponse.json({
      success: true,
      message: 'Secuencia de emails reseteada',
      subscriber: {
        email: updated.email,
        archetype: updated.archetype,
        sequenceStatus: updated.sequenceStatus,
        sequenceStartedAt: updated.sequenceStartedAt,
      }
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al resetear la secuencia', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
