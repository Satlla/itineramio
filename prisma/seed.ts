import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'alejandro@itineramio.com' },
    update: {},
    create: {
      id: 'demo-user-id',
      email: 'alejandro@itineramio.com',
      name: 'Alejandro Satlla',
      preferredLanguage: 'es',
      timezone: 'Europe/Madrid',
      status: 'ACTIVE',
      role: 'HOST'
    }
  })

  console.log('Demo user created:', user)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })