const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.scgbdfltemsthgwianbl:Bolero1492*@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=20&schema=public"
    }
  }
})

const NEW_PLANS = [
  {
    code: 'BASIC',
    name: 'Basic',
    description: 'Perfecto para comenzar con tus primeras propiedades',
    maxProperties: 2,
    priceMonthly: 9,
    priceSemestral: 48.6,    // 9 * 6 * 0.9
    priceYearly: 86.4,       // 9 * 12 * 0.8
    features: [
      'Hasta 2 propiedades',
      'Guías digitales personalizadas',
      'Códigos QR por zona',
      'Estadísticas básicas',
      'Soporte por email'
    ],
    isVisibleInUI: true,
    isActive: true
  },
  {
    code: 'HOST',
    name: 'Host',
    description: 'Ideal para hosts con múltiples propiedades',
    maxProperties: 10,
    priceMonthly: 19,
    priceSemestral: 102.6,   // 19 * 6 * 0.9
    priceYearly: 182.4,      // 19 * 12 * 0.8
    features: [
      'Hasta 10 propiedades',
      'Todas las funciones de Basic',
      'Conjuntos de propiedades',
      'Analytics avanzadas',
      'Integración con PMS',
      'Soporte prioritario'
    ],
    isVisibleInUI: true,
    isActive: true
  },
  {
    code: 'SUPERHOST',
    name: 'Superhost',
    description: 'Para gestores profesionales y equipos',
    maxProperties: 25,
    priceMonthly: 39,
    priceSemestral: 210.6,   // 39 * 6 * 0.9
    priceYearly: 374.4,      // 39 * 12 * 0.8
    features: [
      'Hasta 25 propiedades',
      'Todas las funciones de Host',
      'Multi-usuario (equipo)',
      'API personalizada',
      'Reportes personalizados',
      'Gestor de cuenta dedicado',
      'Soporte 24/7'
    ],
    isVisibleInUI: true,
    isActive: true
  },
  {
    code: 'BUSINESS',
    name: 'Business',
    description: 'Soluciones enterprise a medida',
    maxProperties: 999,      // Ilimitado
    priceMonthly: 0,         // Precio a medida (contactar)
    priceSemestral: 0,
    priceYearly: 0,
    features: [
      '+25 propiedades',
      'Todas las funciones de Superhost',
      'Infraestructura dedicada',
      'SLA garantizado',
      'Onboarding personalizado',
      'Integraciones custom',
      'Soporte white-label'
    ],
    isVisibleInUI: false,    // Oculto en UI pública
    isActive: true
  }
]

async function seedNewPlans() {
  console.log('\n🌱 CREANDO NUEVOS PLANES EN BASE DE DATOS\n')
  console.log('=' .repeat(80))

  try {
    // 1. Verificar que la tabla esté vacía
    const existingPlans = await prisma.subscriptionPlan.findMany()
    if (existingPlans.length > 0) {
      console.log(`⚠️  Ya hay ${existingPlans.length} planes en la base de datos`)
      console.log('   Eliminando planes existentes...')
      await prisma.subscriptionPlan.deleteMany({})
      console.log('   ✅ Planes antiguos eliminados')
    }

    // 2. Crear los nuevos planes
    console.log('\n📝 Creando nuevos planes:\n')

    for (const plan of NEW_PLANS) {
      const created = await prisma.subscriptionPlan.create({
        data: {
          code: plan.code,
          name: plan.name,
          description: plan.description,
          priceMonthly: plan.priceMonthly,
          priceSemestral: plan.priceSemestral,
          priceYearly: plan.priceYearly,
          maxProperties: plan.maxProperties,
          features: JSON.stringify(plan.features),
          isActive: plan.isActive,
          isVisibleInUI: plan.isVisibleInUI,
          aiMessagesIncluded: 0 // No usamos esto por ahora
        }
      })

      const visibility = plan.isVisibleInUI ? '👁️  Visible' : '🔒 Oculto'
      console.log(`   ✅ ${plan.code.padEnd(12)} - ${plan.name.padEnd(10)} - €${String(plan.priceMonthly).padStart(3)}/mes - ${plan.maxProperties} props - ${visibility}`)
    }

    // 3. Verificar creación
    console.log('\n📊 Verificando planes creados:\n')
    const allPlans = await prisma.subscriptionPlan.findMany({
      orderBy: { priceMonthly: 'asc' }
    })

    console.log(`   Total de planes: ${allPlans.length}`)
    console.log(`   Planes visibles: ${allPlans.filter(p => p.isVisibleInUI).length}`)
    console.log(`   Planes ocultos: ${allPlans.filter(p => !p.isVisibleInUI).length}`)

    console.log('\n' + '='.repeat(80))
    console.log('✅ PLANES CREADOS EXITOSAMENTE')
    console.log('\n💡 Próximo paso: Actualizar plan-limits.ts y pricing-calculator.ts')

  } catch (error) {
    console.error('\n❌ ERROR al crear planes:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedNewPlans().catch(console.error)
