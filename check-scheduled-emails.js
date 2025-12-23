const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('=== VERIFICACIÓN DE SCHEDULED EMAILS ===\n')

  // 1. Ver todos los scheduled emails pendientes
  const pendingEmails = await prisma.scheduledEmail.findMany({
    where: { status: 'pending' },
    orderBy: { scheduledFor: 'asc' },
    take: 10,
    include: {
      step: { select: { name: true, templateName: true } },
      enrollment: {
        select: {
          status: true,
          sequence: { select: { name: true } }
        }
      }
    }
  })

  console.log('📧 EMAILS PENDIENTES:')
  const now = new Date()
  pendingEmails.forEach((email, i) => {
    const isReady = new Date(email.scheduledFor) <= now
    console.log(`   ${i+1}. ${email.recipientEmail}`)
    console.log(`      Step: ${email.step?.name || 'N/A'}`)
    console.log(`      Template: ${email.step?.templateName || 'N/A'}`)
    console.log(`      Sequence: ${email.enrollment?.sequence?.name || 'N/A'}`)
    console.log(`      Enrollment status: ${email.enrollment?.status || 'N/A'}`)
    console.log(`      Programado: ${email.scheduledFor}`)
    console.log(`      ¿Listo para enviar?: ${isReady ? '✅ SÍ' : '❌ NO (futuro)'}`)
    console.log('')
  })

  // 2. Contar por estado
  const readyToSend = await prisma.scheduledEmail.count({
    where: {
      status: 'pending',
      scheduledFor: { lte: now }
    }
  })

  const futureEmails = await prisma.scheduledEmail.count({
    where: {
      status: 'pending',
      scheduledFor: { gt: now }
    }
  })

  console.log('\n📊 RESUMEN:')
  console.log(`   Listos para enviar ahora: ${readyToSend}`)
  console.log(`   Programados para el futuro: ${futureEmails}`)

  // 3. Verificar si hay emails fallidos
  const failedEmails = await prisma.scheduledEmail.count({
    where: { status: 'failed' }
  })
  console.log(`   Fallidos: ${failedEmails}`)

  // 4. Ver enrollments activos
  const activeEnrollments = await prisma.sequenceEnrollment.findMany({
    where: { status: 'active' },
    include: {
      sequence: { select: { name: true } },
      subscriber: { select: { email: true } }
    }
  })

  console.log('\n📋 ENROLLMENTS ACTIVOS:')
  activeEnrollments.forEach((enr, i) => {
    console.log(`   ${i+1}. ${enr.subscriber?.email} → ${enr.sequence?.name}`)
    console.log(`      Emails enviados: ${enr.emailsSent}`)
  })

  await prisma.$disconnect()
}

main().catch(console.error)
