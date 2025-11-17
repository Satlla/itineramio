/**
 * Script para forzar el envío de toda la secuencia de emails
 * Útil para probar el embudo completo sin esperar 14 días
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env.local') })
dotenv.config({ path: path.join(__dirname, '../.env') })

import { PrismaClient } from '@prisma/client'
import {
  sendDay3MistakesEmail,
  sendDay7CaseStudyEmail,
  sendDay10TrialEmail,
  sendDay14UrgencyEmail,
} from '@/lib/resend'

const prisma = new PrismaClient()

async function forceCompleteSequence(email: string) {
  console.log(`\n🚀 Forzando secuencia completa para: ${email}\n`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    // Buscar subscriber
    const subscriber = await prisma.emailSubscriber.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (!subscriber) {
      console.error(`❌ No se encontró subscriber con email: ${email}`)
      return
    }

    console.log(`✅ Subscriber encontrado: ${subscriber.id}`)
    console.log(`   Arquetipo: ${subscriber.archetype}`)
    console.log(`   Nombre: ${subscriber.name || 'Sin nombre'}`)
    console.log(`   Status: ${subscriber.status}`)
    console.log(`   Secuencia iniciada: ${subscriber.sequenceStartedAt?.toISOString() || 'No iniciada'}`)
    console.log('')

    if (!subscriber.archetype) {
      console.error('❌ El subscriber no tiene arquetipo asignado')
      return
    }

    const now = new Date()

    // DÍA 3: Errores comunes
    if (!subscriber.day3SentAt) {
      console.log('📧 [DÍA 3] Enviando email de errores comunes...')
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
        console.log('   ✅ Email día 3 enviado correctamente\n')
      } catch (error) {
        console.error('   ❌ Error enviando día 3:', error)
      }
    } else {
      console.log(`⏭️  [DÍA 3] Ya enviado: ${subscriber.day3SentAt.toISOString()}\n`)
    }

    // Esperar 2 segundos entre emails
    await new Promise(resolve => setTimeout(resolve, 2000))

    // DÍA 7: Caso de estudio
    if (!subscriber.day7SentAt) {
      console.log('📧 [DÍA 7] Enviando caso de estudio...')
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
        console.log('   ✅ Email día 7 enviado correctamente\n')
      } catch (error) {
        console.error('   ❌ Error enviando día 7:', error)
      }
    } else {
      console.log(`⏭️  [DÍA 7] Ya enviado: ${subscriber.day7SentAt.toISOString()}\n`)
    }

    await new Promise(resolve => setTimeout(resolve, 2000))

    // DÍA 10: Trial/curso
    if (!subscriber.day10SentAt) {
      console.log('📧 [DÍA 10] Enviando invitación a trial...')
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
        console.log('   ✅ Email día 10 enviado correctamente\n')
      } catch (error) {
        console.error('   ❌ Error enviando día 10:', error)
      }
    } else {
      console.log(`⏭️  [DÍA 10] Ya enviado: ${subscriber.day10SentAt.toISOString()}\n`)
    }

    await new Promise(resolve => setTimeout(resolve, 2000))

    // DÍA 14: Urgencia
    if (!subscriber.day14SentAt) {
      console.log('📧 [DÍA 14] Enviando email de urgencia...')
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
            sequenceStatus: 'completed', // Marcar secuencia como completada
          },
        })
        console.log('   ✅ Email día 14 enviado correctamente\n')
      } catch (error) {
        console.error('   ❌ Error enviando día 14:', error)
      }
    } else {
      console.log(`⏭️  [DÍA 14] Ya enviado: ${subscriber.day14SentAt.toISOString()}\n`)
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('✅ SECUENCIA COMPLETADA\n')

    // Mostrar resumen final
    const updated = await prisma.emailSubscriber.findUnique({
      where: { id: subscriber.id }
    })

    console.log('📊 RESUMEN FINAL:')
    console.log(`   Emails enviados: ${updated?.emailsSent}`)
    console.log(`   Último email: ${updated?.lastEmailSentAt?.toISOString()}`)
    console.log(`   Status secuencia: ${updated?.sequenceStatus}`)
    console.log(`   Día 3:  ${updated?.day3SentAt ? '✅' : '❌'}`)
    console.log(`   Día 7:  ${updated?.day7SentAt ? '✅' : '❌'}`)
    console.log(`   Día 10: ${updated?.day10SentAt ? '✅' : '❌'}`)
    console.log(`   Día 14: ${updated?.day14SentAt ? '✅' : '❌'}`)

  } catch (error) {
    console.error('\n❌ ERROR:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Obtener email desde argumentos de línea de comando
const email = process.argv[2]

if (!email) {
  console.error('\n❌ Error: Debes proporcionar un email')
  console.log('\nUso:')
  console.log('  npx tsx scripts/force-complete-sequence.ts tu@email.com\n')
  process.exit(1)
}

forceCompleteSequence(email)
