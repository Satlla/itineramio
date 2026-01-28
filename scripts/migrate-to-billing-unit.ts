/**
 * Script de migración: PropertyBillingConfig → BillingUnit
 *
 * Este script copia los datos de PropertyBillingConfig a BillingUnit
 * manteniendo los mismos IDs para facilitar las referencias.
 *
 * Ejecutar: npx tsx scripts/migrate-to-billing-unit.ts
 */

import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function migrate() {
  console.log('\n🚀 Iniciando migración PropertyBillingConfig → BillingUnit\n')

  // 1. Obtener todos los PropertyBillingConfig con su Property
  const billingConfigs = await prisma.propertyBillingConfig.findMany({
    include: {
      property: {
        select: {
          id: true,
          name: true,
          city: true,
          profileImage: true,
          hostId: true
        }
      }
    }
  })

  console.log(`📋 Encontrados ${billingConfigs.length} PropertyBillingConfig para migrar\n`)

  if (billingConfigs.length === 0) {
    console.log('✅ No hay datos para migrar.')
    return
  }

  let migrated = 0
  let skipped = 0
  let errors = 0

  for (const config of billingConfigs) {
    try {
      // Verificar si ya existe un BillingUnit con este propertyId
      const existing = await prisma.billingUnit.findUnique({
        where: { propertyId: config.propertyId }
      })

      if (existing) {
        console.log(`⏭️  Saltando ${config.property.name} - ya existe BillingUnit`)
        skipped++
        continue
      }

      // Crear BillingUnit con los mismos datos
      await prisma.billingUnit.create({
        data: {
          id: config.id, // Usar mismo ID para mantener referencias
          userId: config.property.hostId,
          propertyId: config.propertyId,
          // Datos opcionales (se usarán del Property vinculado)
          name: null,
          city: null,
          profileImage: null,
          // Propietario
          ownerId: config.ownerId,
          // Nombres en plataformas
          airbnbNames: config.airbnbNames,
          bookingNames: config.bookingNames,
          vrboNames: config.vrboNames,
          // Configuración
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

      console.log(`✅ Migrado: ${config.property.name}`)
      migrated++
    } catch (error) {
      console.error(`❌ Error migrando ${config.property.name}:`, error)
      errors++
    }
  }

  console.log('\n📊 Resumen de migración:')
  console.log(`   ✅ Migrados: ${migrated}`)
  console.log(`   ⏭️  Saltados: ${skipped}`)
  console.log(`   ❌ Errores: ${errors}`)

  // 2. Verificar la migración
  const billingUnits = await prisma.billingUnit.count()
  console.log(`\n📋 Total BillingUnits en BD: ${billingUnits}`)
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
