import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'alejandrosatlla@gmail.com' } })
  if (!user) return
  
  const count = await prisma.reservation.count({ where: { userId: user.id } })
  console.log('Total reservas:', count)
  
  const reservations = await prisma.reservation.findMany({
    where: { userId: user.id },
    select: { confirmationCode: true, checkIn: true, guestName: true },
    orderBy: { checkIn: 'asc' }
  })
  
  for (const r of reservations) {
    console.log(r.confirmationCode + ' | ' + r.checkIn.toISOString().slice(0,10) + ' | ' + r.guestName)
  }
}

main().finally(() => prisma.$disconnect())
