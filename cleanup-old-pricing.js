const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.scgbdfltemsthgwianbl:Bolero1492*@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=20&schema=public"
    }
  }
})

async function cleanupOldPricing() {
  console.log('\n🧹 LIMPIANDO TARIFAS ANTIGUAS\n')
  console.log('=' .repeat(80))

  let deletedCount = 0

  // 1. Limpiar SubscriptionPlan
  console.log('\n1️⃣  Limpiando SubscriptionPlan...')
  try {
    const result1 = await prisma.$executeRaw`DELETE FROM "SubscriptionPlan" WHERE 1=1;`
    console.log(`   ✅ Eliminados ${result1} registros de SubscriptionPlan`)
    deletedCount += result1
  } catch (error) {
    console.log(`   ⚠️  Tabla SubscriptionPlan no existe o está vacía: ${error.message}`)
  }

  // 2. Limpiar PricingTier
  console.log('\n2️⃣  Limpiando PricingTier...')
  try {
    const result2 = await prisma.$executeRaw`DELETE FROM "PricingTier" WHERE 1=1;`
    console.log(`   ✅ Eliminados ${result2} registros de PricingTier`)
    deletedCount += result2
  } catch (error) {
    console.log(`   ⚠️  Tabla PricingTier no existe o está vacía: ${error.message}`)
  }

  // 3. Limpiar CustomPlan (mantener pero limpiar si hay datos antiguos)
  console.log('\n3️⃣  Revisando CustomPlan...')
  try {
    const customPlans = await prisma.customPlan.findMany()
    if (customPlans.length > 0) {
      console.log(`   📋 Hay ${customPlans.length} planes personalizados existentes`)
      console.log('   ℹ️  NO los eliminamos (pueden ser planes especiales de clientes)')
      customPlans.forEach(plan => {
        console.log(`      • ${plan.name} - €${plan.pricePerProperty}/prop - ${plan.maxProperties || '∞'} props`)
      })
    } else {
      console.log('   ✅ No hay planes personalizados')
    }
  } catch (error) {
    console.log(`   ⚠️  Tabla CustomPlan no existe: ${error.message}`)
  }

  // 4. Actualizar suscripciones activas (eliminar referencias a planes viejos)
  console.log('\n4️⃣  Actualizando suscripciones activas...')
  try {
    const subsWithOldPlans = await prisma.userSubscription.findMany({
      where: {
        OR: [
          { plan: { contains: 'FREE' } },
          { plan: { contains: 'STARTER' } },
          { plan: { contains: 'Gratuito' } }
        ]
      }
    })

    if (subsWithOldPlans.length > 0) {
      console.log(`   🔄 Actualizando ${subsWithOldPlans.length} suscripciones con planes obsoletos...`)
      for (const sub of subsWithOldPlans) {
        await prisma.userSubscription.update({
          where: { id: sub.id },
          data: {
            plan: null,
            status: 'CANCELLED',
            endDate: new Date()
          }
        })
      }
      console.log(`   ✅ Suscripciones actualizadas a estado CANCELLED`)
    } else {
      console.log('   ✅ No hay suscripciones con planes obsoletos')
    }
  } catch (error) {
    console.log(`   ⚠️  Error actualizando suscripciones: ${error.message}`)
  }

  // 5. Actualizar campo subscription en User (eliminar "FREE")
  console.log('\n5️⃣  Actualizando usuarios con subscription=FREE...')
  try {
    const usersWithFree = await prisma.user.findMany({
      where: {
        subscription: 'FREE'
      }
    })

    if (usersWithFree.length > 0) {
      console.log(`   🔄 Actualizando ${usersWithFree.length} usuarios con subscription=FREE...`)
      await prisma.user.updateMany({
        where: { subscription: 'FREE' },
        data: { subscription: null }
      })
      console.log(`   ✅ Usuarios actualizados (subscription → null)`)
    } else {
      console.log('   ✅ No hay usuarios con subscription=FREE')
    }
  } catch (error) {
    console.log(`   ⚠️  Error actualizando usuarios: ${error.message}`)
  }

  console.log('\n' + '='.repeat(80))
  console.log(`\n✅ LIMPIEZA COMPLETADA - Total registros eliminados: ${deletedCount}`)
  console.log('\n💡 Próximo paso: Crear nuevos planes (BASIC, HOST, SUPERHOST, BUSINESS)')

  await prisma.$disconnect()
}

cleanupOldPricing().catch(console.error)
