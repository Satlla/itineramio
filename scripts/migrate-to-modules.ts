/**
 * Script de migración a sistema de módulos
 *
 * Este script migra usuarios existentes al nuevo sistema de UserModule:
 * 1. Usuarios con suscripción activa → UserModule MANUALES status=ACTIVE
 * 2. Usuarios en trial → UserModule MANUALES status=TRIAL
 *
 * Ejecutar con: npx ts-node scripts/migrate-to-modules.ts
 *
 * IMPORTANTE: Este script es idempotente - puede ejecutarse múltiples veces
 * sin crear duplicados gracias a la restricción unique [userId, moduleType]
 */

import { prisma } from '../src/lib/prisma'

interface MigrationStats {
  activeSubscriptionsProcessed: number
  trialsProcessed: number
  alreadyMigrated: number
  errors: number
}

async function migrateToModules() {
  const stats: MigrationStats = {
    activeSubscriptionsProcessed: 0,
    trialsProcessed: 0,
    alreadyMigrated: 0,
    errors: 0
  }

  try {
    console.log('🚀 Iniciando migración a sistema de módulos...')
    console.log('=' .repeat(60))

    // 1. Migrar usuarios con suscripción activa
    console.log('\n📋 Paso 1: Migrando usuarios con suscripción activa...')

    const usersWithActiveSubscription = await prisma.user.findMany({
      where: {
        subscriptions: {
          some: {
            status: 'ACTIVE'
          }
        }
      },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        modules: {
          where: { moduleType: 'MANUALES' }
        }
      }
    })

    console.log(`   Encontrados ${usersWithActiveSubscription.length} usuarios con suscripción activa`)

    for (const user of usersWithActiveSubscription) {
      try {
        // Verificar si ya tiene UserModule MANUALES
        if (user.modules.length > 0) {
          console.log(`   ⏭️  ${user.email} - Ya tiene módulo MANUALES`)
          stats.alreadyMigrated++
          continue
        }

        const subscription = user.subscriptions[0]

        await prisma.userModule.create({
          data: {
            userId: user.id,
            moduleType: 'MANUALES',
            status: 'ACTIVE',
            isActive: true,
            activatedAt: subscription?.startDate || new Date(),
            expiresAt: subscription?.endDate,
            subscriptionPlanId: subscription?.planId,
            stripeSubscriptionId: subscription?.stripeSubscriptionId
          }
        })

        console.log(`   ✅ ${user.email} - Migrado a MANUALES (Plan: ${subscription?.plan?.name || 'N/A'})`)
        stats.activeSubscriptionsProcessed++
      } catch (error: any) {
        if (error.code === 'P2002') {
          // Unique constraint violation - ya existe
          console.log(`   ⏭️  ${user.email} - Ya existe (constraint)`)
          stats.alreadyMigrated++
        } else {
          console.error(`   ❌ Error migrando ${user.email}:`, error.message)
          stats.errors++
        }
      }
    }

    // 2. Migrar usuarios en trial (sin suscripción activa)
    console.log('\n📋 Paso 2: Migrando usuarios en período de prueba...')

    const now = new Date()
    const usersInTrial = await prisma.user.findMany({
      where: {
        trialEndsAt: { gte: now },
        subscriptions: {
          none: { status: 'ACTIVE' }
        }
      },
      include: {
        modules: {
          where: { moduleType: 'MANUALES' }
        }
      }
    })

    console.log(`   Encontrados ${usersInTrial.length} usuarios en período de prueba`)

    for (const user of usersInTrial) {
      try {
        // Verificar si ya tiene UserModule MANUALES
        if (user.modules.length > 0) {
          console.log(`   ⏭️  ${user.email} - Ya tiene módulo MANUALES`)
          stats.alreadyMigrated++
          continue
        }

        await prisma.userModule.create({
          data: {
            userId: user.id,
            moduleType: 'MANUALES',
            status: 'TRIAL',
            isActive: true,
            activatedAt: user.trialStartedAt || new Date(),
            trialEndsAt: user.trialEndsAt
          }
        })

        console.log(`   ✅ ${user.email} - Migrado a MANUALES (Trial hasta: ${user.trialEndsAt?.toLocaleDateString()})`)
        stats.trialsProcessed++
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`   ⏭️  ${user.email} - Ya existe (constraint)`)
          stats.alreadyMigrated++
        } else {
          console.error(`   ❌ Error migrando ${user.email}:`, error.message)
          stats.errors++
        }
      }
    }

    // Resumen
    console.log('\n' + '=' .repeat(60))
    console.log('📊 RESUMEN DE MIGRACIÓN')
    console.log('=' .repeat(60))
    console.log(`   Suscripciones activas migradas: ${stats.activeSubscriptionsProcessed}`)
    console.log(`   Trials migrados: ${stats.trialsProcessed}`)
    console.log(`   Ya migrados (omitidos): ${stats.alreadyMigrated}`)
    console.log(`   Errores: ${stats.errors}`)
    console.log(`   Total procesados: ${stats.activeSubscriptionsProcessed + stats.trialsProcessed + stats.alreadyMigrated}`)
    console.log('=' .repeat(60))

    if (stats.errors === 0) {
      console.log('\n🎉 Migración completada exitosamente!')
    } else {
      console.log('\n⚠️  Migración completada con errores. Revisa los logs.')
    }

  } catch (error) {
    console.error('\n❌ Error fatal durante la migración:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Función auxiliar para preview sin hacer cambios
async function previewMigration() {
  try {
    console.log('👁️  PREVIEW DE MIGRACIÓN (sin cambios)')
    console.log('=' .repeat(60))

    // Usuarios con suscripción activa
    const activeCount = await prisma.user.count({
      where: {
        subscriptions: {
          some: { status: 'ACTIVE' }
        }
      }
    })

    // Usuarios en trial
    const trialCount = await prisma.user.count({
      where: {
        trialEndsAt: { gte: new Date() },
        subscriptions: {
          none: { status: 'ACTIVE' }
        }
      }
    })

    // Ya migrados
    const migratedCount = await prisma.userModule.count({
      where: { moduleType: 'MANUALES' }
    })

    console.log(`\n   Usuarios con suscripción activa: ${activeCount}`)
    console.log(`   Usuarios en trial: ${trialCount}`)
    console.log(`   Ya migrados a UserModule: ${migratedCount}`)
    console.log(`\n   Total a procesar: ${activeCount + trialCount - migratedCount}`)

  } catch (error) {
    console.error('Error en preview:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar según argumento
const args = process.argv.slice(2)
if (args.includes('--preview')) {
  previewMigration()
} else {
  migrateToModules()
}
