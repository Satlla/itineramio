const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.scgbdfltemsthgwianbl:Bolero1492*@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=20&schema=public"
    }
  }
})

async function checkCurrentPricing() {
  console.log('\n📊 VERIFICANDO TARIFAS ACTUALES\n')
  console.log('=' .repeat(80))

  // 1. Verificar SubscriptionPlan
  console.log('\n1️⃣  SUBSCRIPTION PLANS (tabla SubscriptionPlan):')
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { maxProperties: 'asc' }
    })

    if (plans.length === 0) {
      console.log('   ❌ No hay planes en la base de datos')
    } else {
      plans.forEach(plan => {
        console.log(`   • ${plan.code.padEnd(15)} - €${plan.priceMonthly.toString().padStart(5)}/mes - hasta ${plan.maxProperties.toString().padStart(3)} propiedades - ${plan.name}`)
      })
    }
  } catch (error) {
    console.log('   ⚠️  Tabla SubscriptionPlan no existe:', error.message)
  }

  // 2. Verificar PricingTier
  console.log('\n2️⃣  PRICING TIERS (tabla PricingTier):')
  try {
    const tiers = await prisma.pricingTier.findMany({
      orderBy: { minProperties: 'asc' }
    })

    if (tiers.length === 0) {
      console.log('   ❌ No hay tiers en la base de datos')
    } else {
      tiers.forEach(tier => {
        const maxProps = tier.maxProperties === null ? '∞' : tier.maxProperties
        console.log(`   • ${tier.name.padEnd(15)} - €${tier.pricePerProperty}/prop/mes - ${tier.minProperties}-${maxProps} props - ${tier.discountPercentage}% descuento`)
      })
    }
  } catch (error) {
    console.log('   ⚠️  Tabla PricingTier no existe:', error.message)
  }

  // 3. Verificar CustomPlan
  console.log('\n3️⃣  CUSTOM PLANS (tabla CustomPlan):')
  try {
    const customPlans = await prisma.customPlan.findMany({
      include: {
        _count: {
          select: { UserSubscription: true }
        }
      }
    })

    if (customPlans.length === 0) {
      console.log('   ✅ No hay planes personalizados (esto es normal)')
    } else {
      customPlans.forEach(plan => {
        console.log(`   • ${plan.name.padEnd(15)} - €${plan.pricePerProperty}/prop/mes - ${plan.maxProperties || '∞'} props - ${plan._count.UserSubscription} usuarios`)
      })
    }
  } catch (error) {
    console.log('   ⚠️  Tabla CustomPlan no existe:', error.message)
  }

  // 4. Verificar suscripciones activas
  console.log('\n4️⃣  SUSCRIPCIONES ACTIVAS:')
  try {
    const activeSubscriptions = await prisma.userSubscription.findMany({
      where: { status: 'ACTIVE' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })

    console.log(`   Total: ${activeSubscriptions.length} suscripciones activas`)
    if (activeSubscriptions.length > 0) {
      console.log('\n   Detalles:')
      activeSubscriptions.forEach(sub => {
        console.log(`   • ${sub.user.name} (${sub.user.email})`)
        console.log(`     Plan: ${sub.plan || 'N/A'} - Precio: €${sub.monthlyPrice || 0}/mes`)
        console.log(`     Inicio: ${sub.startDate?.toLocaleDateString() || 'N/A'} - Fin: ${sub.endDate?.toLocaleDateString() || 'N/A'}`)
      })
    }
  } catch (error) {
    console.log('   ⚠️  Error al consultar suscripciones:', error.message)
  }

  // 5. Resumen de código actual
  console.log('\n5️⃣  CONFIGURACIÓN EN CÓDIGO (plan-limits.ts):')
  console.log('   • Primera propiedad: GRATIS (línea 62-71)')
  console.log('   • Propiedades adicionales: €2.50/mes cada una')
  console.log('   • Descuento volumen (10+ props): €2.00/mes cada una')
  console.log('   • Plan name: "Growth"')

  console.log('\n' + '='.repeat(80))
  console.log('\n💡 RECOMENDACIÓN PARA NUEVO MODELO:')
  console.log('   1. Eliminar concepto de "primera propiedad gratis" de plan-limits.ts')
  console.log('   2. Crear sistema de trial de 15 días en tabla User (campo trialEndsAt)')
  console.log('   3. Definir planes claros:')
  console.log('      • BASIC: €9/mes - hasta 3 propiedades')
  console.log('      • GROWTH: €19/mes - hasta 5 propiedades')
  console.log('      • SCALE: €39/mes - hasta 15 propiedades')
  console.log('   4. Durante trial: acceso completo sin límites de propiedades')
  console.log('   5. Al terminar trial: forzar selección de plan para continuar')

  await prisma.$disconnect()
}

checkCurrentPricing().catch(console.error)
