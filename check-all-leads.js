const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkLeads() {
  console.log('\n=== TODOS LOS LEADS ===\n')

  // 1. Tabla Lead (herramientas hub)
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  })
  console.log(`Tabla "Lead": ${leads.length} registros`)
  leads.forEach(l => {
    console.log(`  ${l.createdAt.toISOString().split('T')[0]} | ${l.source} | ${l.email}`)
  })

  // 2. Tabla EmailSubscriber (marketing/leads usa esta)
  console.log('\n--- EmailSubscriber (marketing/leads) ---\n')
  const subscribers = await prisma.emailSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  })
  console.log(`Tabla "EmailSubscriber": ${subscribers.length} registros`)
  subscribers.forEach(s => {
    console.log(`  ${s.createdAt.toISOString().split('T')[0]} | ${s.source} | ${s.email}`)
  })

  // 3. Verificar si hay tabla de quiz
  console.log('\n--- QuizResult (academia) ---\n')
  try {
    const quizResults = await prisma.quizResult.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    console.log(`Tabla "QuizResult": ${quizResults.length} registros`)
    quizResults.forEach(q => {
      console.log(`  ${q.createdAt.toISOString().split('T')[0]} | ${q.archetype} | ${q.email}`)
    })
  } catch (e) {
    console.log('Tabla QuizResult no existe o error:', e.message)
  }

  // 4. Contar por source
  console.log('\n--- Leads por Source ---\n')
  const bySource = await prisma.lead.groupBy({
    by: ['source'],
    _count: { id: true }
  })
  bySource.forEach(s => {
    console.log(`  ${s.source}: ${s._count.id}`)
  })

  console.log('\n=== FIN ===\n')
}

checkLeads()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
