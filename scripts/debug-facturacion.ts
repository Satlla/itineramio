import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const propertyId = 'prop-1768768515746-v3va9cruju'
  const year = 2026
  const month = 1

  console.log('=== DIAGNÓSTICO DE FACTURACIÓN ===\n')
  console.log('Propiedad:', propertyId)
  console.log('Periodo:', `${month}/${year}\n`)

  // 1. Verificar que la propiedad existe
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      billingConfig: true,
      host: { select: { email: true } }
    }
  })

  if (!property) {
    console.log('❌ PROPIEDAD NO ENCONTRADA')
    return
  }

  console.log('1. PROPIEDAD:')
  console.log('   Nombre:', property.name)
  console.log('   Host:', property.host?.email)
  console.log('   Tiene billingConfig:', !!property.billingConfig)
  if (property.billingConfig) {
    console.log('   billingConfigId:', property.billingConfig.id)
    console.log('   commissionValue:', property.billingConfig.commissionValue)
  }
  console.log('')

  // 2. Buscar todas las reservas del usuario
  const userId = property.hostId
  const allReservations = await prisma.reservation.findMany({
    where: { userId },
    select: {
      id: true,
      confirmationCode: true,
      guestName: true,
      checkIn: true,
      checkOut: true,
      status: true,
      billingConfigId: true,
      billingConfig: {
        select: {
          id: true,
          propertyId: true,
          property: { select: { name: true } }
        }
      }
    },
    orderBy: { checkIn: 'asc' }
  })

  console.log('2. TODAS LAS RESERVAS DEL USUARIO:', allReservations.length)
  console.log('')

  // 3. Filtrar por billingConfigId de esta propiedad
  const billingConfigId = property.billingConfig?.id
  const reservasDeEstaPropiedad = allReservations.filter(r => r.billingConfigId === billingConfigId)
  console.log('3. RESERVAS DE ESTA PROPIEDAD (billingConfigId match):', reservasDeEstaPropiedad.length)

  if (reservasDeEstaPropiedad.length > 0) {
    console.log('   Primeras 5:')
    reservasDeEstaPropiedad.slice(0, 5).forEach(r => {
      console.log(`   - ${r.confirmationCode} | ${r.checkIn.toISOString().slice(0,10)} | ${r.guestName} | ${r.status}`)
    })
  }
  console.log('')

  // 4. Filtrar por mes/año
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 1)
  console.log('4. RANGO DE FECHAS:')
  console.log('   startDate (>=):', startDate.toISOString())
  console.log('   endDate (<):', endDate.toISOString())
  console.log('')

  const reservasDelMes = reservasDeEstaPropiedad.filter(r => {
    const checkIn = new Date(r.checkIn)
    return checkIn >= startDate && checkIn < endDate
  })

  console.log('5. RESERVAS DEL MES SELECCIONADO:', reservasDelMes.length)
  if (reservasDelMes.length > 0) {
    reservasDelMes.forEach(r => {
      console.log(`   - ${r.confirmationCode} | ${r.checkIn.toISOString().slice(0,10)} | ${r.guestName} | ${r.status}`)
    })
  }
  console.log('')

  // 5. Filtrar por status
  const reservasConfirmadas = reservasDelMes.filter(r =>
    r.status === 'CONFIRMED' || r.status === 'COMPLETED'
  )
  console.log('6. RESERVAS CONFIRMADAS/COMPLETADAS:', reservasConfirmadas.length)
  if (reservasConfirmadas.length > 0) {
    reservasConfirmadas.forEach(r => {
      console.log(`   - ${r.confirmationCode} | ${r.checkIn.toISOString().slice(0,10)} | ${r.guestName} | ${r.status}`)
    })
  }
  console.log('')

  // 6. Mostrar todas las reservas que no tienen billingConfigId correcto
  const sinBillingConfig = allReservations.filter(r => !r.billingConfigId)
  const conOtroBillingConfig = allReservations.filter(r => r.billingConfigId && r.billingConfigId !== billingConfigId)

  console.log('7. ANÁLISIS DE billingConfigId:')
  console.log('   Sin billingConfigId:', sinBillingConfig.length)
  console.log('   Con otro billingConfigId:', conOtroBillingConfig.length)

  if (conOtroBillingConfig.length > 0) {
    console.log('   Propiedades de esas reservas:')
    const propiedades = new Set(conOtroBillingConfig.map(r =>
      r.billingConfig?.property?.name || 'Sin nombre'
    ))
    propiedades.forEach(p => console.log(`     - ${p}`))
  }
  console.log('')

  // 7. Ver todas las billingConfigs del usuario
  const allConfigs = await prisma.propertyBillingConfig.findMany({
    where: { property: { hostId: userId } },
    include: { property: { select: { name: true } } }
  })

  console.log('8. TODAS LAS BILLING CONFIGS DEL USUARIO:')
  allConfigs.forEach(c => {
    console.log(`   - ${c.id} | ${c.property.name} | propertyId: ${c.propertyId}`)
  })
  console.log('')

  // 8. Verificar si hay reservas de enero 2026 en general
  const todasEnero2026 = allReservations.filter(r => {
    const checkIn = new Date(r.checkIn)
    return checkIn >= startDate && checkIn < endDate
  })
  console.log('9. TODAS LAS RESERVAS DE ENERO 2026 (sin filtrar propiedad):', todasEnero2026.length)
  if (todasEnero2026.length > 0) {
    todasEnero2026.slice(0, 10).forEach(r => {
      console.log(`   - ${r.confirmationCode} | ${r.checkIn.toISOString().slice(0,10)} | ${r.guestName} | billingConfig: ${r.billingConfig?.property?.name || 'N/A'}`)
    })
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
