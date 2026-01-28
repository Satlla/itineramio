import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'alejandrosatlla@gmail.com' }
  })
  if (!user) return

  // Borrar todas las reservas (las fechas están mal)
  const deleted = await prisma.reservation.deleteMany({
    where: {
      userId: user.id,
      invoiced: false,
      liquidationId: null
    }
  })

  console.log('Borradas ' + deleted.count + ' reservas con fechas incorrectas')
  
  // Verificar
  const remaining = await prisma.reservation.count({
    where: { userId: user.id }
  })
  console.log('Reservas restantes: ' + remaining)
}

main().catch(console.error).finally(() => prisma.$disconnect())
