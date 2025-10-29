const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updatePlans() {
  try {
    console.log('\n🔄 ACTUALIZANDO PLANES DE SUSCRIPCIÓN...\n')

    // 1. UPDATE HOST: 6 → 10 propiedades
    console.log('1️⃣ Actualizando HOST...')
    const host = await prisma.subscriptionPlan.update({
      where: { code: 'HOST' },
      data: {
        maxProperties: 10,
        priceSemestral: (29 * 6 * 0.9).toString(), // €156.60
        features: [
          "Hasta 10 propiedades",
          "Todas las funciones de Basic",
          "Conjuntos de propiedades",
          "Analytics avanzadas",
          "Integración con PMS",
          "Soporte prioritario"
        ]
      }
    })
    console.log('   ✅ HOST actualizado: 10 propiedades, €156.60 semestral')

    // 2. UPDATE SUPERHOST: 100 → 25 propiedades, €79 → €69
    console.log('\n2️⃣ Actualizando SUPERHOST...')
    const superhost = await prisma.subscriptionPlan.update({
      where: { code: 'SUPERHOST' },
      data: {
        priceMonthly: '69',
        priceSemestral: (69 * 6 * 0.9).toString(), // €372.60
        priceYearly: (69 * 12 * 0.8).toString(), // €662.40
        maxProperties: 25,
        features: [
          "Hasta 25 propiedades",
          "Todas las funciones de Host",
          "Multi-usuario (equipo)",
          "API personalizada",
          "Reportes personalizados",
          "Gestor de cuenta dedicado",
          "Soporte 24/7"
        ]
      }
    })
    console.log('   ✅ SUPERHOST actualizado: 25 propiedades, €69/mes, €372.60 semestral, €662.40 anual')

    // 3. UPDATE BUSINESS: 25 → 50 propiedades
    console.log('\n3️⃣ Actualizando BUSINESS...')
    const business = await prisma.subscriptionPlan.update({
      where: { code: 'BUSINESS' },
      data: {
        maxProperties: 50,
        priceSemestral: (99 * 6 * 0.9).toString(), // €534.60
        features: [
          "Hasta 50 propiedades",
          "Todas las funciones de Superhost",
          "Infraestructura dedicada",
          "SLA garantizado",
          "Onboarding personalizado",
          "Integraciones custom",
          "Soporte white-label",
          "+50 propiedades: Contactar para precio personalizado"
        ]
      }
    })
    console.log('   ✅ BUSINESS actualizado: 50 propiedades, €534.60 semestral')

    // Mostrar resumen final
    console.log('\n\n✅ ACTUALIZACIÓN COMPLETADA\n')
    console.log('=' .repeat(80))

    const allPlans = await prisma.subscriptionPlan.findMany({
      orderBy: { priceMonthly: 'asc' }
    })

    console.log('\n📊 RESUMEN DE PLANES ACTUALIZADOS:\n')
    allPlans.forEach(plan => {
      const monthly = parseFloat(plan.priceMonthly)
      const perProperty = monthly / plan.maxProperties
      const perPropertyAnnual = (monthly * 12 * 0.8) / plan.maxProperties

      console.log(plan.code + ':')
      console.log('  Propiedades: ' + plan.maxProperties)
      console.log('  Precio mensual: €' + plan.priceMonthly)
      console.log('  Precio semestral: €' + plan.priceSemestral)
      console.log('  Precio anual: €' + plan.priceYearly)
      console.log('  €/propiedad mes: €' + perProperty.toFixed(2))
      console.log('  €/propiedad año: €' + perPropertyAnnual.toFixed(2))
      console.log('')
    })

    console.log('=' .repeat(80))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePlans()
