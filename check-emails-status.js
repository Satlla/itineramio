const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
  const subscriber = await prisma.emailSubscriber.findUnique({
    where: { email: 'colaboracionesbnb@gmail.com' }
  })

  if (!subscriber) {
    console.log('❌ No encontrado')
    process.exit(1)
  }

  console.log('\n📧 ESTADO DE EMAILS ENVIADOS:\n')
  console.log(`Email: ${subscriber.email}`)
  console.log(`Arquetipo: ${subscriber.archetype}`)
  console.log(`Emails enviados total: ${subscriber.emailsSent}`)
  console.log(`Status secuencia: ${subscriber.sequenceStatus}`)
  console.log(`\nDía 3:  ${subscriber.day3SentAt ? '✅ Enviado: ' + subscriber.day3SentAt.toISOString() : '❌ No enviado'}`)
  console.log(`Día 7:  ${subscriber.day7SentAt ? '✅ Enviado: ' + subscriber.day7SentAt.toISOString() : '❌ No enviado'}`)
  console.log(`Día 10: ${subscriber.day10SentAt ? '✅ Enviado: ' + subscriber.day10SentAt.toISOString() : '❌ No enviado'}`)
  console.log(`Día 14: ${subscriber.day14SentAt ? '✅ Enviado: ' + subscriber.day14SentAt.toISOString() : '❌ No enviado'}`)
  console.log(`\nÚltimo email enviado: ${subscriber.lastEmailSentAt?.toISOString() || 'Nunca'}`)
  console.log('')

  await prisma.$disconnect()
}
check()
