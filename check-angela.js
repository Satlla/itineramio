const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAngela() {
  // Buscar por nombre "Angela"
  const angelaByName = await prisma.emailSubscriber.findMany({
    where: {
      name: {
        contains: 'Angela',
        mode: 'insensitive'
      }
    }
  })

  console.log('Subscribers with name Angela:')
  console.log(JSON.stringify(angelaByName, null, 2))

  // Buscar últimos 10 subscribers
  const recent = await prisma.emailSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  console.log('\n\nLast 10 subscribers:')
  recent.forEach((s, i) => {
    console.log(`${i + 1}. ${s.name} (${s.email}) - ${s.archetype} - ${s.createdAt}`)
  })

  await prisma.$disconnect()
}

checkAngela().catch(console.error)
