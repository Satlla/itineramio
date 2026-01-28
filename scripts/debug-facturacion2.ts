import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const propertyId = 'prop-1768768515746-v3va9cruju'
  const year = 2026
  const month = 1

  const userId = (await prisma.property.findUnique({ where: { id: propertyId } }))?.hostId
  if (!userId) {
    console.log('Usuario no encontrado')
    return
  }

  console.log('=== SIMULANDO CONSULTA DEL ENDPOINT ===\n')

  // Exactamente como lo hace el endpoint
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 1)

  console.log('startDate:', startDate.toISOString())
  console.log('endDate:', endDate.toISOString())
  console.log('')

  // Consulta exacta del endpoint
  const reservations = await prisma.reservation.findMany({
    where: {
      userId,
      billingConfig: { propertyId },
      checkIn: {
        gte: startDate,
        lt: endDate
      },
      status: { in: ['CONFIRMED', 'COMPLETED'] }
    },
    orderBy: { checkIn: 'asc' }
  })

  console.log('Reservas encontradas:', reservations.length)
  reservations.forEach(r => {
    console.log(`  - ${r.confirmationCode} | ${r.checkIn.toISOString()} | ${r.guestName}`)
  })

  // También verificar si hay factura existente
  const existingInvoice = await prisma.clientInvoice.findFirst({
    where: {
      userId,
      propertyId,
      periodYear: year,
      periodMonth: month
    },
    include: {
      items: true
    }
  })

  console.log('\n=== FACTURA EXISTENTE ===')
  if (existingInvoice) {
    console.log('ID:', existingInvoice.id)
    console.log('Status:', existingInvoice.status)
    console.log('Items:', existingInvoice.items.length)
    existingInvoice.items.forEach(i => {
      console.log(`  - ${i.concept} | ${i.unitPrice}€`)
    })
  } else {
    console.log('No hay factura existente para este mes')
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
