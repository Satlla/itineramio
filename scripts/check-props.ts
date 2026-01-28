import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'alejandrosatlla@gmail.com' }
  })
  if (!user) return

  const properties = await prisma.property.findMany({
    where: { hostId: user.id },
    include: { billingConfig: true }
  })

  console.log('Propiedades del usuario:')
  for (const p of properties) {
    console.log('- ' + p.id + ' | ' + p.name + ' | billingConfig: ' + (p.billingConfig?.id || 'NONE'))
  }

  const reservationsByConfig = await prisma.reservation.groupBy({
    by: ['billingConfigId'],
    where: { userId: user.id },
    _count: true
  })

  console.log('\nReservas por billingConfig:')
  for (const r of reservationsByConfig) {
    console.log('- ' + r.billingConfigId + ': ' + r._count + ' reservas')
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
