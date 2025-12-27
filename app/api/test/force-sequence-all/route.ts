import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  sendDay3MistakesEmail,
  sendDay7CaseStudyEmail,
  sendDay10TrialEmail,
  sendDay14UrgencyEmail,
} from '@/lib/resend'

/**
 * Endpoint para forzar el envío de toda la secuencia de emails de una sola vez
 * Útil para testing del embudo completo
 *
 * Uso: GET /api/test/force-sequence-all?email=tu@email.com
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

    console.log(`\n🚀 Forzando secuencia completa para: ${email}\n`)

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

    if (!subscriber.archetype) {
      return NextResponse.json(
        { error: 'El subscriber no tiene arquetipo asignado' },
        { status: 400 }
      )
    }

    const results = {
      email: subscriber.email,
      archetype: subscriber.archetype,
      day3: { sent: false, error: null as string | null },
      day7: { sent: false, error: null as string | null },
      day10: { sent: false, error: null as string | null },
      day14: { sent: false, error: null as string | null },
    }

    const now = new Date()

    // DÍA 3
    if (!subscriber.day3SentAt) {
      try {
        console.log('📧 [DÍA 3] Enviando...')
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
        results.day3.sent = true
        console.log('   ✅ Enviado\n')
      } catch (error) {
        results.day3.error = error instanceof Error ? error.message : 'Unknown error'
        console.error('   ❌ Error:', error)
      }
    } else {
      results.day3.sent = true
      console.log(`⏭️  [DÍA 3] Ya enviado anteriormente\n`)
    }

    // Esperar 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000))

    // DÍA 7
    if (!subscriber.day7SentAt) {
      try {
        console.log('📧 [DÍA 7] Enviando...')
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
        results.day7.sent = true
        console.log('   ✅ Enviado\n')
      } catch (error) {
        results.day7.error = error instanceof Error ? error.message : 'Unknown error'
        console.error('   ❌ Error:', error)
      }
    } else {
      results.day7.sent = true
      console.log(`⏭️  [DÍA 7] Ya enviado anteriormente\n`)
    }

    await new Promise(resolve => setTimeout(resolve, 2000))

    // DÍA 10
    if (!subscriber.day10SentAt) {
      try {
        console.log('📧 [DÍA 10] Enviando...')
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
        results.day10.sent = true
        console.log('   ✅ Enviado\n')
      } catch (error) {
        results.day10.error = error instanceof Error ? error.message : 'Unknown error'
        console.error('   ❌ Error:', error)
      }
    } else {
      results.day10.sent = true
      console.log(`⏭️  [DÍA 10] Ya enviado anteriormente\n`)
    }

    await new Promise(resolve => setTimeout(resolve, 2000))

    // DÍA 14
    if (!subscriber.day14SentAt) {
      try {
        console.log('📧 [DÍA 14] Enviando...')
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
            sequenceStatus: 'completed',
          },
        })
        results.day14.sent = true
        console.log('   ✅ Enviado\n')
      } catch (error) {
        results.day14.error = error instanceof Error ? error.message : 'Unknown error'
        console.error('   ❌ Error:', error)
      }
    } else {
      results.day14.sent = true
      console.log(`⏭️  [DÍA 14] Ya enviado anteriormente\n`)
    }

    // Obtener estado final
    const updated = await prisma.emailSubscriber.findUnique({
      where: { id: subscriber.id }
    })

    console.log('✅ SECUENCIA COMPLETADA\n')

    return NextResponse.json({
      success: true,
      subscriber: {
        email: updated?.email,
        archetype: updated?.archetype,
        emailsSent: updated?.emailsSent,
        sequenceStatus: updated?.sequenceStatus,
      },
      results,
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la secuencia', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
