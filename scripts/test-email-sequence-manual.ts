/**
 * Script para probar manualmente el envío de emails de secuencia
 *
 * Esto simula lo que haría el cron job pero de forma manual para testing
 *
 * Uso:
 *   npx tsx scripts/test-email-sequence-manual.ts
 */

// Cargar variables de entorno manualmente desde .env.local
import { readFileSync } from 'fs'
const envContent = readFileSync('.env.local', 'utf-8')
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    const [, key, value] = match
    process.env[key] = value.replace(/^["'](.*)["']$/, '$1')
  }
})

import { PrismaClient } from '@prisma/client'
import {
  sendDay3MistakesEmail,
  sendDay7CaseStudyEmail,
  sendDay10TrialEmail,
  sendDay14UrgencyEmail,
} from '../src/lib/resend'

const prisma = new PrismaClient()

async function testEmailSequence() {
  console.log('🧪 TESTING EMAIL SEQUENCE MANUALLY')
  console.log('='.repeat(60))

  try {
    // 1. Encontrar un subscriber para prueba
    console.log('\n1️⃣ Finding test subscriber...')
    const testSubscriber = await prisma.emailSubscriber.findFirst({
      where: {
        source: 'host_profile_test',
        sequenceStatus: 'active',
        archetype: { not: null }
      },
      orderBy: {
        subscribedAt: 'desc'
      }
    })

    if (!testSubscriber) {
      console.log('❌ No test subscriber found. Please complete the host profile test first.')
      return
    }

    console.log(`✅ Found subscriber: ${testSubscriber.email}`)
    console.log(`   Archetype: ${testSubscriber.archetype}`)
    console.log(`   Subscribed: ${testSubscriber.subscribedAt}`)
    console.log(`   Sequence started: ${testSubscriber.sequenceStartedAt}`)

    // 2. Mostrar menú de opciones
    console.log('\n2️⃣ Select email to send:')
    console.log('   [1] Day 3 - Los 3 errores del arquetipo')
    console.log('   [2] Day 7 - Case study')
    console.log('   [3] Day 10 - Invitación a prueba')
    console.log('   [4] Day 14 - Última oportunidad')
    console.log('   [5] Send ALL (respecting sequence)')
    console.log('')

    // Por defecto vamos a enviar Day 3 para probar
    console.log('⚡ AUTO-SENDING DAY 3 EMAIL FOR TESTING...\n')

    // Verificar si ya se envió
    if (testSubscriber.day3SentAt) {
      console.log('⚠️  Day 3 already sent. Let me check what\'s next...')

      if (!testSubscriber.day7SentAt && testSubscriber.day3SentAt) {
        console.log('📧 Sending Day 7 instead...')
        await sendTestEmail('day7', testSubscriber)
      } else if (!testSubscriber.day10SentAt && testSubscriber.day7SentAt) {
        console.log('📧 Sending Day 10 instead...')
        await sendTestEmail('day10', testSubscriber)
      } else if (!testSubscriber.day14SentAt && testSubscriber.day10SentAt) {
        console.log('📧 Sending Day 14 instead...')
        await sendTestEmail('day14', testSubscriber)
      } else {
        console.log('✅ All emails already sent! Sequence completed.')
      }
    } else {
      // Enviar Day 3
      await sendTestEmail('day3', testSubscriber)
    }

    console.log('\n✅ Manual test completed!\n')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function sendTestEmail(day: 'day3' | 'day7' | 'day10' | 'day14', subscriber: any) {
  const now = new Date()

  try {
    console.log(`\n📧 Sending ${day.toUpperCase()} email to ${subscriber.email}...`)

    let result
    if (day === 'day3') {
      result = await sendDay3MistakesEmail({
        email: subscriber.email,
        name: subscriber.name || 'Anfitrión',
        archetype: subscriber.archetype,
      })
    } else if (day === 'day7') {
      result = await sendDay7CaseStudyEmail({
        email: subscriber.email,
        name: subscriber.name || 'Anfitrión',
        archetype: subscriber.archetype,
      })
    } else if (day === 'day10') {
      result = await sendDay10TrialEmail({
        email: subscriber.email,
        name: subscriber.name || 'Anfitrión',
        archetype: subscriber.archetype,
      })
    } else if (day === 'day14') {
      result = await sendDay14UrgencyEmail({
        email: subscriber.email,
        name: subscriber.name || 'Anfitrión',
        archetype: subscriber.archetype,
      })
    }

    if (result?.success) {
      console.log('   ✅ Email sent successfully!')

      // Actualizar base de datos
      const updateData: any = {
        emailsSent: { increment: 1 },
        lastEmailSentAt: now,
      }

      if (day === 'day3') updateData.day3SentAt = now
      else if (day === 'day7') updateData.day7SentAt = now
      else if (day === 'day10') updateData.day10SentAt = now
      else if (day === 'day14') {
        updateData.day14SentAt = now
        updateData.sequenceStatus = 'completed'
      }

      await prisma.emailSubscriber.update({
        where: { id: subscriber.id },
        data: updateData
      })

      console.log('   ✅ Database updated!')

      // Mostrar stats actualizadas
      const updated = await prisma.emailSubscriber.findUnique({
        where: { id: subscriber.id }
      })

      console.log('\n   📊 Updated stats:')
      console.log(`      Emails sent: ${updated?.emailsSent}`)
      console.log(`      Last email: ${updated?.lastEmailSentAt}`)
      console.log(`      Day3: ${updated?.day3SentAt ? '✓' : '✗'}`)
      console.log(`      Day7: ${updated?.day7SentAt ? '✓' : '✗'}`)
      console.log(`      Day10: ${updated?.day10SentAt ? '✓' : '✗'}`)
      console.log(`      Day14: ${updated?.day14SentAt ? '✓' : '✗'}`)
      console.log(`      Status: ${updated?.sequenceStatus}`)

    } else {
      console.log('   ❌ Failed to send email')
      console.log('   Error:', result?.error)
    }

  } catch (error) {
    console.error(`   ❌ Error sending ${day} email:`, error)
  }
}

testEmailSequence()
