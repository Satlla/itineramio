const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createUser() {
  try {
    const hashedPassword = await bcrypt.hash('Demo1234', 12)

    const user = await prisma.user.upsert({
      where: { email: 'demo@itineramio.com' },
      update: {
        password: hashedPassword
      },
      create: {
        email: 'demo@itineramio.com',
        name: 'Demo User',
        password: hashedPassword,
        role: 'HOST',
        status: 'ACTIVE',
        subscription: 'FREE',
        emailVerified: new Date()
      }
    })

    console.log('Demo user created/updated:', user.email)
  } catch (error) {
    console.error('Error creating user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createUser()