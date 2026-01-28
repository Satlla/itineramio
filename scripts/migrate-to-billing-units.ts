/**
 * Script para migrar PropertyBillingConfig a BillingUnit
 * Ejecutar: npx tsx scripts/migrate-to-billing-units.ts
 *
 * Este script:
 * 1. Crea BillingUnit desde PropertyBillingConfig
 * 2. Actualiza Reservations para apuntar a BillingUnit
 * 3. Actualiza PropertyExpenses para apuntar a BillingUnit
 * 4. Actualiza ClientInvoices para apuntar a BillingUnit
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateToBillingUnits() {
  console.log('\n🚀 Iniciando migración a BillingUnits...\n')

  // 1. Obtener todas las PropertyBillingConfig
  const billingConfigs = await prisma.propertyBillingConfig.findMany({
    include: {
      property: { select: { id: true, name: true, city: true, hostId: true } },
      reservations: { select: { id: true } },
      expenses: { select: { id: true } }
    }
  })

  console.log(`📋 PropertyBillingConfigs encontrados: ${billingConfigs.length}`)

  if (billingConfigs.length === 0) {
    console.log('✅ No hay datos que migrar')
    return
  }

  // Mapa de billingConfigId -> billingUnitId
  const migrationMap: Record<string, string> = {}

  // 2. Crear BillingUnits
  console.log('\n📦 Creando BillingUnits...')

  for (const config of billingConfigs) {
    const property = config.property

    // Crear BillingUnit con los datos de PropertyBillingConfig
    const billingUnit = await prisma.billingUnit.create({
      data: {
        userId: property.hostId,
        name: property.name,
        city: property.city,
        imageUrl: null, // Podríamos copiar de Property si tiene
        ownerId: config.ownerId,
        airbnbNames: config.airbnbNames,
        bookingNames: config.bookingNames,
        vrboNames: config.vrboNames,
        incomeReceiver: config.incomeReceiver,
        commissionType: config.commissionType,
        commissionValue: config.commissionValue,
        commissionVat: config.commissionVat,
        cleaningType: config.cleaningType,
        cleaningValue: config.cleaningValue,
        cleaningVatIncluded: config.cleaningVatIncluded,
        cleaningFeeRecipient: config.cleaningFeeRecipient,
        cleaningFeeSplitPct: config.cleaningFeeSplitPct,
        monthlyFee: config.monthlyFee,
        monthlyFeeVat: config.monthlyFeeVat,
        monthlyFeeConcept: config.monthlyFeeConcept,
        defaultVatRate: config.defaultVatRate,
        defaultRetentionRate: config.defaultRetentionRate,
        invoiceDetailLevel: config.invoiceDetailLevel,
        singleConceptText: config.singleConceptText,
        icalUrl: config.icalUrl,
        lastIcalSync: config.lastIcalSync,
        isActive: config.isActive,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt
      }
    })

    migrationMap[config.id] = billingUnit.id
    console.log(`  ✅ ${property.name} → ${billingUnit.id}`)
  }

  // 3. Actualizar Reservations
  console.log('\n🔄 Actualizando Reservations...')
  let reservationsUpdated = 0

  for (const [configId, unitId] of Object.entries(migrationMap)) {
    const result = await prisma.reservation.updateMany({
      where: { billingConfigId: configId },
      data: { billingUnitId: unitId }
    })
    reservationsUpdated += result.count
  }
  console.log(`  ✅ ${reservationsUpdated} reservas actualizadas`)

  // 4. Actualizar PropertyExpenses
  console.log('\n🔄 Actualizando PropertyExpenses...')
  let expensesUpdated = 0

  for (const [configId, unitId] of Object.entries(migrationMap)) {
    const result = await prisma.propertyExpense.updateMany({
      where: { billingConfigId: configId },
      data: { billingUnitId: unitId }
    })
    expensesUpdated += result.count
  }
  console.log(`  ✅ ${expensesUpdated} gastos actualizados`)

  // 5. Actualizar ClientInvoices (por propertyId)
  console.log('\n🔄 Actualizando ClientInvoices...')
  let invoicesUpdated = 0

  for (const config of billingConfigs) {
    const unitId = migrationMap[config.id]
    const result = await prisma.clientInvoice.updateMany({
      where: { propertyId: config.propertyId },
      data: { billingUnitId: unitId }
    })
    invoicesUpdated += result.count
  }
  console.log(`  ✅ ${invoicesUpdated} facturas actualizadas`)

  // Resumen
  console.log('\n' + '='.repeat(50))
  console.log('📊 RESUMEN DE MIGRACIÓN')
  console.log('='.repeat(50))
  console.log(`BillingUnits creados:    ${Object.keys(migrationMap).length}`)
  console.log(`Reservations actualizadas: ${reservationsUpdated}`)
  console.log(`Expenses actualizadas:     ${expensesUpdated}`)
  console.log(`Invoices actualizadas:     ${invoicesUpdated}`)
  console.log('='.repeat(50))
  console.log('\n✅ Migración completada exitosamente!\n')

  // Guardar el mapa de migración por si acaso
  const migrationLog = {
    timestamp: new Date().toISOString(),
    migrationMap,
    stats: {
      billingUnits: Object.keys(migrationMap).length,
      reservations: reservationsUpdated,
      expenses: expensesUpdated,
      invoices: invoicesUpdated
    }
  }

  const fs = await import('fs')
  const logPath = `./backups/migration-log-${Date.now()}.json`
  fs.writeFileSync(logPath, JSON.stringify(migrationLog, null, 2))
  console.log(`📝 Log de migración guardado en: ${logPath}`)
}

migrateToBillingUnits()
  .catch(error => {
    console.error('❌ Error en migración:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
