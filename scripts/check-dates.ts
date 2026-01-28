import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'alejandrosatlla@gmail.com' }
  })
  if (!user) return

  const reservations = await prisma.reservation.findMany({
    where: { userId: user.id },
    select: {
      confirmationCode: true,
      guestName: true,
      checkIn: true,
      checkOut: true
    },
    orderBy: { checkIn: 'asc' }
  })

  console.log('Reservas importadas:')
  for (const r of reservations) {
    const year = r.checkIn.getFullYear()
    const flag = year >= 2027 ? ' ⚠️ FUTURO!' : ''
    console.log(r.confirmationCode + ' | ' + r.guestName.substring(0,20).padEnd(20) + ' | ' + r.checkIn.toISOString().slice(0,10) + ' - ' + r.checkOut.toISOString().slice(0,10) + flag)
  }

  // Contar por año
  const byYear = await prisma.reservation.groupBy({
    by: [],
    where: { userId: user.id },
    _count: true
  })
  
  const years = await prisma.$queryRaw`
    SELECT EXTRACT(YEAR FROM "checkIn") as year, COUNT(*) as count 
    FROM reservations 
    WHERE "userId" = ${user.id}
    GROUP BY EXTRACT(YEAR FROM "checkIn")
    ORDER BY year
  ` as any[]
  
  console.log('\nPor año:')
  for (const y of years) {
    console.log('  ' + y.year + ': ' + y.count + ' reservas')
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
