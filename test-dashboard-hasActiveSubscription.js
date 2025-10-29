const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function test() {
  const user = await prisma.user.findUnique({
    where: { email: 'colaboracionesbnb@gmail.com' }
  })

  const activeSubscription = await prisma.userSubscription.findFirst({
    where: {
      userId: user.id,
      status: 'ACTIVE'
    },
    include: { plan: true }
  })

  console.log('Active subscription:', activeSubscription ? 'YES' : 'NO')
  console.log('hasActiveSubscription value:', !!activeSubscription)
  if (activeSubscription) {
    console.log('Plan:', activeSubscription.plan?.name)
  }

  await prisma.$disconnect()
}

test()
