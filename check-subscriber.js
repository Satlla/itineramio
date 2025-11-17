const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSubscriber() {
  const subscriberId = 'cmhtcjfpq00017cdrroy1v0z15'

  const subscriber = await prisma.emailSubscriber.findUnique({
    where: { id: subscriberId }
  })

  console.log('Subscriber info:')
  console.log(JSON.stringify(subscriber, null, 2))

  // También buscar el registro más reciente con archetype ESTRATEGA
  const recentEstrategas = await prisma.emailSubscriber.findMany({
    where: { archetype: 'ESTRATEGA' },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  console.log('\n\nRecent ESTRATEGA subscribers:')
  recentEstrategas.forEach((s, i) => {
    console.log(`${i + 1}. ${s.name} (${s.email}) - ${s.id} - ${s.createdAt}`)
  })

  await prisma.$disconnect()
}

checkSubscriber().catch(console.error)
