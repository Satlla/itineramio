/**
 * Script para probar el flujo del embudo de herramientas
 * Solo prueba la parte de BD (sin envío de email)
 *
 * Ejecutar: DATABASE_URL="..." npx tsx scripts/test-tool-funnel.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testToolFunnel() {
  const testEmail = `test-funnel-${Date.now()}@itineramio.com`
  const testName = 'Test Funnel User'

  console.log('🧪 Probando flujo de embudo de herramienta...\n')
  console.log(`📧 Email de prueba: ${testEmail}`)

  try {
    // 1. Simular creación de subscriber como lo hace la API
    console.log('\n1️⃣ Creando EmailSubscriber con tags de herramienta...')

    const toolTags = ['tool_checklist-limpieza', 'herramienta', 'operaciones']

    const subscriber = await prisma.emailSubscriber.create({
      data: {
        email: testEmail,
        name: testName,
        source: 'tool_checklist-limpieza',
        status: 'active',
        tags: toolTags,
        currentJourneyStage: 'lead',
        engagementScore: 'warm'
      }
    })

    console.log(`   ✅ Subscriber creado: ${subscriber.id}`)
    console.log(`   📌 Source: ${subscriber.source}`)
    console.log(`   📌 Tags: ${subscriber.tags}`)
    console.log(`   📌 Archetype: ${subscriber.archetype || '(ninguno - correcto!)'}`)

    // 2. Buscar secuencias que matcheen
    console.log('\n2️⃣ Buscando secuencias que coincidan...')

    const sequences = await prisma.emailSequence.findMany({
      where: {
        isActive: true,
        triggerEvent: 'SUBSCRIBER_CREATED',
        OR: [
          { targetSource: subscriber.source },
          { targetTags: { hasSome: toolTags } }
        ]
      },
      include: { steps: { orderBy: { order: 'asc' } } }
    })

    console.log(`   📋 Secuencias encontradas: ${sequences.length}`)

    for (const seq of sequences) {
      console.log(`\n   → ${seq.name}`)
      console.log(`     Trigger: ${seq.triggerEvent}`)
      console.log(`     Target Source: ${seq.targetSource}`)
      console.log(`     Target Tags: ${seq.targetTags?.join(', ')}`)
      console.log(`     Pasos: ${seq.steps.length}`)

      // 3. Simular enrollment
      console.log('\n3️⃣ Creando enrollment en la secuencia...')

      const enrollment = await prisma.sequenceEnrollment.create({
        data: {
          subscriberId: subscriber.id,
          sequenceId: seq.id,
          status: 'active',
          currentStepOrder: 1
        }
      })

      console.log(`   ✅ Enrollment creado: ${enrollment.id}`)

      // 4. Programar emails
      console.log('\n4️⃣ Programando emails...')

      const now = new Date()

      for (const step of seq.steps) {
        const scheduledFor = new Date(now.getTime() + step.delayDays * 24 * 60 * 60 * 1000)

        // Ajustar a la hora especificada
        if (step.sendAtHour !== null) {
          scheduledFor.setHours(step.sendAtHour, 0, 0, 0)
        }

        const scheduledEmail = await prisma.scheduledEmail.create({
          data: {
            enrollmentId: enrollment.id,
            stepId: step.id,
            subscriberId: subscriber.id,
            recipientEmail: subscriber.email,
            recipientName: subscriber.name || '',
            subject: step.subject,
            templateName: step.templateName,
            templateData: {
              name: subscriber.name,
              email: subscriber.email
            },
            scheduledFor,
            status: 'pending'
          }
        })

        console.log(`   📧 [Día ${step.delayDays}] ${step.name}`)
        console.log(`      Template: ${step.templateName}`)
        console.log(`      Programado: ${scheduledFor.toLocaleString('es-ES')}`)
        console.log(`      ID: ${scheduledEmail.id}`)
      }
    }

    // 5. Verificar todo en BD
    console.log('\n5️⃣ Verificando estado final en BD...')

    const finalSubscriber = await prisma.emailSubscriber.findUnique({
      where: { email: testEmail }
    })

    const enrollments = await prisma.sequenceEnrollment.findMany({
      where: { subscriberId: finalSubscriber?.id },
      include: { sequence: true }
    })

    const scheduledEmails = await prisma.scheduledEmail.findMany({
      where: { subscriberId: finalSubscriber?.id },
      orderBy: { scheduledFor: 'asc' }
    })

    console.log(`\n   📊 Resumen:`)
    console.log(`   - Subscriber: ${finalSubscriber?.id}`)
    console.log(`   - Enrollments: ${enrollments.length}`)
    console.log(`   - Emails programados: ${scheduledEmails.length}`)

    console.log(`\n   📬 Emails en cola:`)
    for (const email of scheduledEmails) {
      const date = new Date(email.scheduledFor).toLocaleDateString('es-ES')
      const time = new Date(email.scheduledFor).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      console.log(`      ${date} ${time} - ${email.subject}`)
    }

    // 6. Limpiar datos de prueba
    console.log('\n6️⃣ ¿Limpiar datos de prueba?')
    console.log('   (Los datos se mantendrán para inspección manual)')
    console.log(`   Para eliminar: DELETE FROM email_subscribers WHERE email = '${testEmail}'`)

    console.log('\n✅ Test completado exitosamente!')
    console.log('\n📌 El cron /api/cron/send-emails procesará estos emails según su fecha programada.')

  } catch (error) {
    console.error('\n❌ Error en el test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testToolFunnel()
