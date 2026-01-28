import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'alejandrosatlla@gmail.com' }
  })
  if (!user) {
    console.log('Usuario no encontrado')
    return
  }

  console.log('=== Estado actual ===')
  
  // Contar por billingConfig
  const byConfig = await prisma.reservation.groupBy({
    by: ['billingConfigId'],
    where: { userId: user.id },
    _count: true
  })
  
  for (const c of byConfig) {
    const config = await prisma.propertyBillingConfig.findUnique({
      where: { id: c.billingConfigId },
      include: { property: { select: { name: true } } }
    })
    console.log('- ' + (config?.property?.name || 'Unknown') + ': ' + c._count + ' reservas')
  }

  // Ver si hay reservas que NO están facturadas ni liquidadas
  const deletable = await prisma.reservation.count({
    where: {
      userId: user.id,
      invoiced: false,
      liquidationId: null
    }
  })
  console.log('\nReservas eliminables (no facturadas/liquidadas): ' + deletable)

  // Preguntar si quiere borrar
  console.log('\n¿Quieres BORRAR TODAS las reservas? (descomenta la línea)')
  
  // DESCOMENTAR PARA BORRAR:
  const deleted = await prisma.reservation.deleteMany({
    where: {
      userId: user.id,
      invoiced: false,
      liquidationId: null
    }
  })
  console.log('BORRADAS: ' + deleted.count + ' reservas')
}

main().catch(console.error).finally(() => prisma.$disconnect())
