const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('=== VERIFICACIÓN DE SECUENCIAS DE EMAIL ===\n')

  // 1. EmailSubscribers con secuencia activa
  const activeSubscribers = await prisma.emailSubscriber.count({
    where: { sequenceStatus: 'active', status: 'active' }
  })
  const totalSubscribers = await prisma.emailSubscriber.count()

  console.log('📧 EMAIL SUBSCRIBERS:')
  console.log(`   Total: ${totalSubscribers}`)
  console.log(`   Con secuencia activa: ${activeSubscribers}`)

  // 2. Subscribers que deberían recibir emails (tienen sequenceStartedAt)
  const withSequenceStarted = await prisma.emailSubscriber.count({
    where: {
      sequenceStartedAt: { not: null },
      status: 'active'
    }
  })
  console.log(`   Con secuencia iniciada: ${withSequenceStarted}`)

  // 3. Emails enviados por día
  const emailsByDay = await prisma.emailSubscriber.groupBy({
    by: ['day3SentAt'],
    where: { day3SentAt: { not: null } },
    _count: true
  })
  const day3Sent = await prisma.emailSubscriber.count({ where: { day3SentAt: { not: null } } })
  const day7Sent = await prisma.emailSubscriber.count({ where: { day7SentAt: { not: null } } })
  const day10Sent = await prisma.emailSubscriber.count({ where: { day10SentAt: { not: null } } })
  const day14Sent = await prisma.emailSubscriber.count({ where: { day14SentAt: { not: null } } })

  console.log('\n📬 EMAILS ENVIADOS (Archetype Sequence):')
  console.log(`   Día 3: ${day3Sent}`)
  console.log(`   Día 7: ${day7Sent}`)
  console.log(`   Día 10: ${day10Sent}`)
  console.log(`   Día 14: ${day14Sent}`)

  // 4. Nivel sequence
  const nivelDay1 = await prisma.emailSubscriber.count({ where: { nivelDay1SentAt: { not: null } } })
  const nivelDay7 = await prisma.emailSubscriber.count({ where: { nivelDay7SentAt: { not: null } } })

  console.log('\n📚 EMAILS ENVIADOS (Nivel Sequence):')
  console.log(`   Nivel Día 1: ${nivelDay1}`)
  console.log(`   Nivel Día 7 (completado): ${nivelDay7}`)

  // 5. Soap Opera sequence
  const soapActive = await prisma.emailSubscriber.count({ where: { soapOperaStatus: 'active' } })
  const soapCompleted = await prisma.emailSubscriber.count({ where: { soapOperaStatus: 'completed' } })

  console.log('\n🎭 SOAP OPERA SEQUENCE:')
  console.log(`   Activa: ${soapActive}`)
  console.log(`   Completada: ${soapCompleted}`)

  // 6. Últimos 5 subscribers con su estado
  const recentSubscribers = await prisma.emailSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      email: true,
      archetype: true,
      nivel: true,
      source: true,
      sequenceStatus: true,
      sequenceStartedAt: true,
      day3SentAt: true,
      createdAt: true
    }
  })

  console.log('\n👤 ÚLTIMOS 5 SUBSCRIBERS:')
  recentSubscribers.forEach((sub, i) => {
    console.log(`   ${i+1}. ${sub.email}`)
    console.log(`      Arquetipo: ${sub.archetype || 'N/A'}, Nivel: ${sub.nivel || 'N/A'}`)
    console.log(`      Fuente: ${sub.source}`)
    console.log(`      Secuencia: ${sub.sequenceStatus} (iniciada: ${sub.sequenceStartedAt ? 'SÍ' : 'NO'})`)
    console.log(`      Día 3 enviado: ${sub.day3SentAt ? 'SÍ' : 'NO'}`)
    console.log('')
  })

  // 7. Check SequenceEnrollments (new system)
  let enrollmentCount = 0
  let scheduledCount = 0
  try {
    enrollmentCount = await prisma.sequenceEnrollment.count()
    scheduledCount = await prisma.scheduledEmail.count({ where: { status: 'pending' } })
    const sentScheduled = await prisma.scheduledEmail.count({ where: { status: 'sent' } })

    console.log('📋 NUEVO SISTEMA (SequenceEnrollment):')
    console.log(`   Enrollments: ${enrollmentCount}`)
    console.log(`   Emails programados pendientes: ${scheduledCount}`)
    console.log(`   Emails enviados: ${sentScheduled}`)
  } catch (e) {
    console.log('📋 NUEVO SISTEMA: Tablas no existen o error:', e.message)
  }

  // 8. Check EmailSequence definitions
  try {
    const sequences = await prisma.emailSequence.findMany({
      where: { isActive: true },
      select: { name: true, triggerEvent: true, subscribersEnrolled: true }
    })
    console.log('\n📝 SECUENCIAS DEFINIDAS:')
    if (sequences.length === 0) {
      console.log('   ⚠️ NO HAY SECUENCIAS DEFINIDAS EN LA DB')
    } else {
      sequences.forEach(seq => {
        console.log(`   - ${seq.name} (trigger: ${seq.triggerEvent}, enrolled: ${seq.subscribersEnrolled})`)
      })
    }
  } catch (e) {
    console.log('\n📝 SECUENCIAS DEFINIDAS: Error al consultar:', e.message)
  }

  // 9. Subscribers pendientes de recibir emails
  const now = new Date()
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

  const pendingDay3 = await prisma.emailSubscriber.count({
    where: {
      sequenceStartedAt: { lte: threeDaysAgo },
      day3SentAt: null,
      sequenceStatus: 'active',
      status: 'active',
      archetype: { not: null }
    }
  })

  console.log('\n⏰ PENDIENTES DE ENVÍO:')
  console.log(`   Día 3 (listos para enviar): ${pendingDay3}`)

  await prisma.$disconnect()
}

main().catch(console.error)
