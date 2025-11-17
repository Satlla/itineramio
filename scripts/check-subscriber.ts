import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const subscriber = await prisma.emailSubscriber.findFirst({
    where: { email: 'colaboracionesbnb@gmail.com' },
    orderBy: { subscribedAt: 'desc' }
  })

  if (subscriber) {
    console.log('📧 Subscriber Details:')
    console.log('  Email:', subscriber.email)
    console.log('  Subscribed At:', subscriber.subscribedAt)
    console.log('  Sequence Started At:', subscriber.sequenceStartedAt)
    console.log('  Sequence Status:', subscriber.sequenceStatus)
    console.log('  Emails Sent:', subscriber.emailsSent)
    console.log('  Last Email Sent:', subscriber.lastEmailSentAt)

    const now = new Date()
    const diffDays = Math.floor((now.getTime() - new Date(subscriber.subscribedAt).getTime()) / (1000 * 60 * 60 * 24))
    console.log(`  Days since subscription: ${diffDays}`)

    if (subscriber.sequenceStartedAt) {
      const diffFromStart = Math.floor((now.getTime() - new Date(subscriber.sequenceStartedAt).getTime()) / (1000 * 60 * 60 * 24))
      console.log(`  Days since sequence started: ${diffFromStart}`)
    }
  } else {
    console.log('No subscriber found')
  }

  await prisma.$disconnect()
}

main()
