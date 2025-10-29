const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function testProrationCalculations() {
  try {
    console.log('🧪 TESTING PRORATION CALCULATIONS\n')
    console.log('='

.repeat(80))

    // Buscar usuario con suscripción activa
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        status: 'ACTIVE',
        endDate: { gte: new Date() }
      },
      include: {
        plan: true,
        user: {
          select: { email: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!subscription) {
      console.log('❌ No se encontró ninguna suscripción activa para probar')
      return
    }

    console.log('\n📋 SUSCRIPCIÓN ACTUAL:')
    console.log('-'.repeat(80))
    console.log(`Usuario: ${subscription.user.email}`)
    console.log(`Plan: ${subscription.plan.name} (${subscription.plan.code})`)
    console.log(`Precio mensual del plan: €${subscription.plan.priceMonthly}`)
    console.log(`Custom Price: ${subscription.customPrice ? `€${subscription.customPrice}` : 'No establecido'}`)
    console.log(`Fecha inicio: ${subscription.startDate.toLocaleDateString('es-ES')}`)
    console.log(`Fecha fin: ${subscription.endDate.toLocaleDateString('es-ES')}`)

    // Calcular duración
    const totalDays = Math.floor(
      (subscription.endDate.getTime() - subscription.startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    console.log(`Duración total: ${totalDays} días`)

    // Determinar periodo
    let detectedPeriod = 'MENSUAL'
    if (totalDays >= 150 && totalDays <= 210) {
      detectedPeriod = 'SEMESTRAL (6 meses)'
    } else if (totalDays >= 300) {
      detectedPeriod = 'ANUAL (12 meses)'
    }
    console.log(`Periodo detectado: ${detectedPeriod}`)

    // Calcular días restantes
    const today = new Date()
    const daysRemaining = Math.max(0, Math.floor(
      (subscription.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    ))
    console.log(`Días restantes: ${daysRemaining}`)

    console.log('\n🔢 CÁLCULO DEL PRECIO TOTAL PAGADO:')
    console.log('-'.repeat(80))

    // Calcular precio total según el periodo
    let calculatedTotalPrice
    let discountPercent = 0
    let monthsMultiplier = 1

    if (totalDays >= 150 && totalDays <= 210) {
      // Semestral
      monthsMultiplier = 6
      discountPercent = 10
      detectedPeriod = 'SEMESTRAL'
    } else if (totalDays >= 300) {
      // Anual
      monthsMultiplier = 12
      discountPercent = 20
      detectedPeriod = 'ANUAL'
    }

    const monthlyPrice = Number(subscription.plan.priceMonthly)
    const discountedMonthlyPrice = monthlyPrice * (1 - discountPercent / 100)
    calculatedTotalPrice = discountedMonthlyPrice * monthsMultiplier

    console.log(`Precio mensual: €${monthlyPrice}`)
    console.log(`Descuento ${detectedPeriod}: ${discountPercent}%`)
    console.log(`Precio mensual con descuento: €${discountedMonthlyPrice.toFixed(2)}`)
    console.log(`Multiplicador de meses: ${monthsMultiplier}`)
    console.log(`PRECIO TOTAL PAGADO: €${calculatedTotalPrice.toFixed(2)}`)

    console.log('\n💰 CÁLCULO DE CRÉDITO (lo que debería ser):')
    console.log('-'.repeat(80))

    const dailyRate = calculatedTotalPrice / totalDays
    const creditAmount = dailyRate * daysRemaining

    console.log(`Tasa diaria correcta: €${dailyRate.toFixed(4)}/día`)
    console.log(`Días restantes: ${daysRemaining}`)
    console.log(`CRÉDITO CORRECTO: €${creditAmount.toFixed(2)}`)

    console.log('\n❌ CÁLCULO INCORRECTO (lo que hace ahora):')
    console.log('-'.repeat(80))

    const incorrectAmountPaid = Number(subscription.customPrice || subscription.plan.priceMonthly)
    const incorrectDailyRate = incorrectAmountPaid / totalDays
    const incorrectCredit = incorrectDailyRate * daysRemaining

    console.log(`Amount paid INCORRECTO: €${incorrectAmountPaid}`)
    console.log(`Tasa diaria INCORRECTA: €${incorrectDailyRate.toFixed(4)}/día`)
    console.log(`CRÉDITO INCORRECTO: €${incorrectCredit.toFixed(2)}`)

    console.log('\n📊 DIFERENCIA:')
    console.log('-'.repeat(80))
    const difference = creditAmount - incorrectCredit
    console.log(`Diferencia en crédito: €${difference.toFixed(2)}`)
    console.log(`Porcentaje de error: ${((incorrectCredit / creditAmount) * 100).toFixed(2)}%`)

    console.log('\n💡 SOLUCIÓN:')
    console.log('-'.repeat(80))
    console.log('En preview-proration/route.ts línea 184, cambiar de:')
    console.log('  amountPaid: Number(activeSubscription.customPrice || activeSubscription.plan.priceMonthly),')
    console.log('A:')
    console.log('  amountPaid: calculatedTotalPrice (calculado según el periodo detectado)')

    console.log('\n' + '='.repeat(80))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testProrationCalculations()
