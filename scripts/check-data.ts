import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get all confirmed reservations
  const reservations = await prisma.reservation.findMany({
    where: {
      status: 'CONFIRMED'
    },
    orderBy: { checkIn: 'desc' },
    include: {
      billingConfig: {
        select: {
          id: true,
          property: {
            select: { id: true, name: true }
          }
        }
      }
    }
  })

  console.log('\n=== RESERVAS CONFIRMADAS ===')
  console.log('Total: ' + reservations.length + '\n')

  reservations.forEach((r, i) => {
    console.log((i+1) + '. ' + (r.guestName || 'Sin nombre'))
    console.log('   Propiedad: ' + (r.billingConfig?.property?.name || r.billingConfigId))
    console.log('   Check-in: ' + r.checkIn?.toISOString().split('T')[0] + ' | Check-out: ' + r.checkOut?.toISOString().split('T')[0])
    console.log('   Plataforma: ' + r.platform + ' | Código: ' + r.confirmationCode)
    console.log('   Total: ' + r.hostEarnings + '€ | Noches: ' + r.nights)
    console.log('')
  })

  // Get all properties
  const properties = await prisma.property.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      billingConfig: {
        select: {
          airbnbNames: true,
          bookingNames: true,
          vrboNames: true,
          ownerId: true
        }
      }
    }
  })

  console.log('\n=== PROPIEDADES/APARTAMENTOS ===')
  console.log('Total: ' + properties.length + '\n')

  properties.forEach((p, i) => {
    console.log((i+1) + '. ' + p.name)
    console.log('   ID: ' + p.id)
    if (p.billingConfig) {
      console.log('   Airbnb aliases: ' + (p.billingConfig.airbnbNames || 'ninguno'))
      console.log('   Booking aliases: ' + (p.billingConfig.bookingNames || 'ninguno'))
      console.log('   VRBO aliases: ' + (p.billingConfig.vrboNames || 'ninguno'))
      console.log('   Owner ID: ' + (p.billingConfig.ownerId || 'sin asignar'))
    } else {
      console.log('   Sin configuración de facturación')
    }
    console.log('')
  })

  // Show all reservation details with amounts
  console.log('\n=== DETALLE COMPLETO RESERVAS ===\n')
  const allReservations = await prisma.reservation.findMany({
    orderBy: { checkIn: 'desc' },
    include: {
      billingConfig: {
        select: {
          property: { select: { name: true } }
        }
      }
    }
  })

  allReservations.forEach((r, i) => {
    console.log((i+1) + '. ' + r.guestName + ' (' + r.status + ')')
    console.log('   Propiedad: ' + (r.billingConfig?.property?.name || 'SIN ASIGNAR'))
    console.log('   Fechas: ' + r.checkIn.toISOString().split('T')[0] + ' - ' + r.checkOut.toISOString().split('T')[0] + ' (' + r.nights + ' noches)')
    console.log('   Plataforma: ' + r.platform + ' | Código: ' + r.confirmationCode)
    console.log('   roomTotal: ' + r.roomTotal + '€')
    console.log('   cleaningFee: ' + r.cleaningFee + '€')
    console.log('   hostServiceFee: ' + r.hostServiceFee + '€')
    console.log('   hostEarnings: ' + r.hostEarnings + '€')
    console.log('   Import source: ' + r.importSource)
    console.log('')
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
