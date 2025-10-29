const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
})

async function listUsers() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  })
  
  console.log('👥 Usuarios en la base de datos:\n')
  users.forEach((u, i) => {
    console.log(`${i+1}. ${u.email} - ${u.name}`)
  })
  
  await prisma.$disconnect()
}

listUsers().catch(console.error)
