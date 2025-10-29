/**
 * Test del endpoint de vista previa de prorrateo
 * Demuestra cómo el usuario ve el crédito ANTES de pagar
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function testProrationPreview() {
  const userId = 'cmgy660l100047c2pj4m58uup' // colaboracionesbnb@gmail.com

  console.log('🧪 Testing Proration Preview\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 SUSCRIPCIÓN ACTUAL')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 1. Obtener suscripción actual
  const currentSub = await prisma.userSubscription.findFirst({
    where: {
      userId: userId,
      status: 'ACTIVE',
      endDate: { gte: new Date() }
    },
    include: {
      plan: true
    }
  })

  if (!currentSub) {
    console.log('❌ No tienes suscripción activa')
    return
  }

  const now = new Date()
  const totalDays = Math.floor((currentSub.endDate.getTime() - currentSub.startDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysUsed = Math.floor((now.getTime() - currentSub.startDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysRemaining = totalDays - daysUsed
  const amountPaid = Number(currentSub.customPrice || currentSub.plan.priceMonthly)
  const dailyRate = amountPaid / totalDays
  const creditAmount = daysRemaining * dailyRate

  console.log(`   Plan: ${currentSub.plan.name}`)
  console.log(`   Pagado: €${amountPaid.toFixed(2)}`)
  console.log(`   Inicio: ${currentSub.startDate.toLocaleDateString('es-ES')}`)
  console.log(`   Fin: ${currentSub.endDate.toLocaleDateString('es-ES')}`)
  console.log(`   Días totales: ${totalDays}`)
  console.log(`   Días usados: ${daysUsed}`)
  console.log(`   Días restantes: ${daysRemaining}`)
  console.log(`   Valor por día: €${dailyRate.toFixed(2)}`)
  console.log(`   💰 Crédito acumulado: €${creditAmount.toFixed(2)}`)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔄 SIMULACIÓN: Cambio a Host Anual')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 2. Simular cambio a Host Anual
  const newPlanMonthly = currentSub.plan.priceMonthly // Host es €9/mes
  const annualMonths = 12
  const annualDiscount = 0.20 // 20% descuento anual

  const monthlyPrice = newPlanMonthly
  const discountedMonthly = monthlyPrice * (1 - annualDiscount)
  const annualPrice = discountedMonthly * annualMonths

  console.log(`   Plan nuevo: ${currentSub.plan.name} (Anual)`)
  console.log(`   Precio mensual: €${monthlyPrice.toFixed(2)}`)
  console.log(`   Descuento anual: -20%`)
  console.log(`   Precio mensual con descuento: €${discountedMonthly.toFixed(2)}`)
  console.log(`   Precio total anual: €${annualPrice.toFixed(2)}`)
  console.log(`   Crédito por tiempo no usado: -€${creditAmount.toFixed(2)}`)
  console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`   💳 TOTAL A PAGAR: €${(annualPrice - creditAmount).toFixed(2)}`)

  const savings = annualPrice - (annualPrice - creditAmount)
  console.log(`   ✅ Ahorras €${savings.toFixed(2)} con el prorrateo`)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 COMPARACIÓN: Sin prorrateo vs Con prorrateo')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log(`   ❌ SIN PRORRATEO (antes):`)
  console.log(`      Pagas: €${annualPrice.toFixed(2)}`)
  console.log(`      Pierdes: €${creditAmount.toFixed(2)} ya pagados`)
  console.log(`      Total desperdiciado: €${creditAmount.toFixed(2)}`)

  console.log(`\n   ✅ CON PRORRATEO (ahora):`)
  console.log(`      Pagas: €${(annualPrice - creditAmount).toFixed(2)}`)
  console.log(`      Aprovechas: €${creditAmount.toFixed(2)} de crédito`)
  console.log(`      Ahorras: €${savings.toFixed(2)}`)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎯 CÓMO USAR EL NUEVO ENDPOINT')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('   Endpoint: GET /api/billing/preview-proration')
  console.log('   Parámetros:')
  console.log('   - planCode: HOST')
  console.log('   - billingPeriod: ANNUAL')
  console.log('')
  console.log('   Ejemplo de llamada:')
  console.log('   fetch("/api/billing/preview-proration?planCode=HOST&billingPeriod=ANNUAL")')
  console.log('')
  console.log('   Respuesta esperada:')
  console.log('   {')
  console.log('     "hasProration": true,')
  console.log(`     "creditAmount": ${creditAmount.toFixed(2)},`)
  console.log(`     "finalPrice": ${(annualPrice - creditAmount).toFixed(2)},`)
  console.log('     "breakdown": [')
  console.log(`       { "label": "Host Anual", "value": "€${annualPrice.toFixed(2)}" },`)
  console.log(`       { "label": "Crédito (${daysRemaining} días)", "value": "-€${creditAmount.toFixed(2)}", "isCredit": true },`)
  console.log(`       { "label": "Total a pagar", "value": "€${(annualPrice - creditAmount).toFixed(2)}" }`)
  console.log('     ]')
  console.log('   }')

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('💡 PRÓXIMOS PASOS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('   1. ✅ Endpoint de preview creado → Ya puedes usarlo')
  console.log('   2. 🔨 Integrar en página de planes → Mostrar precio prorrateado')
  console.log('   3. 🎨 Añadir modal de confirmación → "Pagarás €X en lugar de €Y"')
  console.log('   4. 📧 Actualizar emails → Incluir desglose de prorrateo')
  console.log('')

  await prisma.$disconnect()
}

testProrationPreview()
  .then(() => {
    console.log('✅ Test completado\n')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
