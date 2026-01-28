/**
 * Script para verificar datos existentes en tablas de Gestión
 * Ejecutar: npx ts-node scripts/check-gestion-data.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkGestionData() {
  console.log('=== Verificando datos en tablas de Gestión ===\n')

  // PropertyBillingConfig
  const billingConfigs = await prisma.propertyBillingConfig.count()
  console.log(`PropertyBillingConfig: ${billingConfigs} registros`)

  // PropertyOwner
  const owners = await prisma.propertyOwner.count()
  console.log(`PropertyOwner: ${owners} registros`)

  // Reservation
  const reservations = await prisma.reservation.count()
  console.log(`Reservation: ${reservations} registros`)

  // PropertyExpense
  const expenses = await prisma.propertyExpense.count()
  console.log(`PropertyExpense: ${expenses} registros`)

  // Liquidation
  const liquidations = await prisma.liquidation.count()
  console.log(`Liquidation: ${liquidations} registros`)

  // ClientInvoice
  const invoices = await prisma.clientInvoice.count()
  console.log(`ClientInvoice: ${invoices} registros`)

  // UserModule (GESTION/FACTURAMIO)
  const gestionModules = await prisma.userModule.count({
    where: {
      moduleType: { in: ['GESTION', 'FACTURAMIO'] }
    }
  })
  console.log(`UserModule (GESTION): ${gestionModules} registros`)

  // Guest
  const guests = await prisma.guest.count()
  console.log(`Guest: ${guests} registros`)

  // UserInvoiceConfig
  const invoiceConfigs = await prisma.userInvoiceConfig.count()
  console.log(`UserInvoiceConfig: ${invoiceConfigs} registros`)

  console.log('\n=== Resumen ===')
  const total = billingConfigs + owners + reservations + expenses + liquidations + invoices + guests

  if (total === 0) {
    console.log('✅ No hay datos en tablas de Gestión. Seguro para hacer cambios.')
  } else {
    console.log(`⚠️  HAY ${total} registros en tablas de Gestión.`)
    console.log('   Necesitarás migrar estos datos.')
  }

  // También verificar usuarios con módulo activo
  if (gestionModules > 0) {
    const moduleDetails = await prisma.userModule.findMany({
      where: {
        moduleType: { in: ['GESTION', 'FACTURAMIO'] }
      },
      include: {
        user: { select: { email: true, name: true } }
      }
    })
    console.log('\nUsuarios con módulo GESTION:')
    moduleDetails.forEach(m => {
      console.log(`  - ${m.user.email} (${m.status})`)
    })
  }
}

checkGestionData()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
