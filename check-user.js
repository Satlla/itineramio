const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'colaboracionesbnb@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        emailVerified: true,
        isAdmin: true,
        createdAt: true,
        properties: {
          select: { id: true, name: true }
        }
      }
    })
    
    console.log('Usuario encontrado:')
    console.log(JSON.stringify(user, null, 2))
    
    if (user) {
      console.log('\n¿Quieres eliminarlo? (y/n)')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()
