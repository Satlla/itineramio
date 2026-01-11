const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] || 'alejandrosatlla@gmail.com'

  const leads = await prisma.lead.findMany({
    where: { email },
    orderBy: { createdAt: 'desc' }
  })

  console.log('\n📊 LEADS ENCONTRADOS:', leads.length)

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i]
    console.log('\n--- Lead', i + 1, '---')
    console.log('ID:', lead.id)
    console.log('Email:', lead.email)
    console.log('Source:', lead.source)
    console.log('Created:', lead.createdAt)
    console.log('Metadata:', JSON.stringify(lead.metadata, null, 2))
  }

  // Also check EmailSubscriber
  const subscriber = await prisma.emailSubscriber.findUnique({
    where: { email }
  })

  if (subscriber) {
    console.log('\n--- EmailSubscriber ---')
    console.log('Email:', subscriber.email)
    console.log('Status:', subscriber.status)
    console.log('Source:', subscriber.source)
    console.log('Tags:', subscriber.tags)
    console.log('SourceMetadata:', JSON.stringify(subscriber.sourceMetadata, null, 2))
  }

  await prisma.$disconnect()
}

main().catch(console.error)
