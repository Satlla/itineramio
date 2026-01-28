/**
 * Script para hacer backup de datos de Gestión antes de migración
 * Ejecutar: npx tsx scripts/backup-gestion-data.ts
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function backupGestionData() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(__dirname, `../backups/gestion-${timestamp}`)

  // Crear directorio de backup
  fs.mkdirSync(backupDir, { recursive: true })

  console.log(`\n📦 Creando backup en: ${backupDir}\n`)

  // Backup PropertyBillingConfig
  const billingConfigs = await prisma.propertyBillingConfig.findMany({
    include: {
      property: { select: { id: true, name: true, hostId: true } },
      owner: { select: { id: true, firstName: true, lastName: true, companyName: true } }
    }
  })
  fs.writeFileSync(
    path.join(backupDir, 'property_billing_configs.json'),
    JSON.stringify(billingConfigs, null, 2)
  )
  console.log(`✅ PropertyBillingConfig: ${billingConfigs.length} registros`)

  // Backup PropertyOwner
  const owners = await prisma.propertyOwner.findMany()
  fs.writeFileSync(
    path.join(backupDir, 'property_owners.json'),
    JSON.stringify(owners, null, 2)
  )
  console.log(`✅ PropertyOwner: ${owners.length} registros`)

  // Backup Reservation
  const reservations = await prisma.reservation.findMany()
  fs.writeFileSync(
    path.join(backupDir, 'reservations.json'),
    JSON.stringify(reservations, null, 2)
  )
  console.log(`✅ Reservation: ${reservations.length} registros`)

  // Backup PropertyExpense
  const expenses = await prisma.propertyExpense.findMany()
  fs.writeFileSync(
    path.join(backupDir, 'property_expenses.json'),
    JSON.stringify(expenses, null, 2)
  )
  console.log(`✅ PropertyExpense: ${expenses.length} registros`)

  // Backup Liquidation
  const liquidations = await prisma.liquidation.findMany()
  fs.writeFileSync(
    path.join(backupDir, 'liquidations.json'),
    JSON.stringify(liquidations, null, 2)
  )
  console.log(`✅ Liquidation: ${liquidations.length} registros`)

  // Backup ClientInvoice
  const invoices = await prisma.clientInvoice.findMany({
    include: { items: true }
  })
  fs.writeFileSync(
    path.join(backupDir, 'client_invoices.json'),
    JSON.stringify(invoices, null, 2)
  )
  console.log(`✅ ClientInvoice: ${invoices.length} registros`)

  // Backup Guest
  const guests = await prisma.guest.findMany()
  fs.writeFileSync(
    path.join(backupDir, 'guests.json'),
    JSON.stringify(guests, null, 2)
  )
  console.log(`✅ Guest: ${guests.length} registros`)

  // Backup UserInvoiceConfig
  const invoiceConfigs = await prisma.userInvoiceConfig.findMany({
    include: { invoiceSeries: true }
  })
  fs.writeFileSync(
    path.join(backupDir, 'user_invoice_configs.json'),
    JSON.stringify(invoiceConfigs, null, 2)
  )
  console.log(`✅ UserInvoiceConfig: ${invoiceConfigs.length} registros`)

  // Backup UserModule (GESTION)
  const modules = await prisma.userModule.findMany({
    where: { moduleType: { in: ['GESTION', 'FACTURAMIO'] } }
  })
  fs.writeFileSync(
    path.join(backupDir, 'user_modules_gestion.json'),
    JSON.stringify(modules, null, 2)
  )
  console.log(`✅ UserModule (GESTION): ${modules.length} registros`)

  console.log(`\n✅ Backup completado en: ${backupDir}`)
  console.log('\n📋 Archivos creados:')
  fs.readdirSync(backupDir).forEach(file => {
    const stats = fs.statSync(path.join(backupDir, file))
    console.log(`   - ${file} (${(stats.size / 1024).toFixed(1)} KB)`)
  })

  return backupDir
}

backupGestionData()
  .then(dir => {
    console.log('\n🎉 Backup listo. Puedes proceder con los cambios.')
  })
  .catch(console.error)
  .finally(() => prisma.$disconnect())
