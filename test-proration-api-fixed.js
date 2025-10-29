const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function testProrationAPI() {
  try {
    console.log('🧪 TESTING PRORATION API - Verificando Fix\n')
    console.log('='.repeat(100))

    // Obtener usuario con suscripción activa
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        status: 'ACTIVE',
        endDate: { gte: new Date() }
      },
      include: {
        plan: true,
        user: {
          select: { id: true, email: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!subscription) {
      console.log('❌ No se encontró ninguna suscripción activa')
      return
    }

    console.log(`\n📋 Usuario de prueba: ${subscription.user.email}`)
    console.log(`Plan actual: ${subscription.plan.name} (${subscription.plan.code})`)

    const totalDays = Math.floor(
      (subscription.endDate.getTime() - subscription.startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    const daysRemaining = Math.max(0, Math.floor(
      (subscription.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    ))

    console.log(`Duración: ${totalDays} días (${daysRemaining} restantes)`)

    // Generar token de autenticación
    const token = jwt.sign(
      { userId: subscription.user.id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    )

    // Probar upgrade a ANNUAL
    console.log('\n\n' + '─'.repeat(100))
    console.log('📊 PRUEBA: HOST Semestral → HOST Anual')
    console.log('─'.repeat(100))

    const response = await fetch(
      'http://localhost:3000/api/billing/preview-proration?planCode=HOST&billingPeriod=ANNUAL',
      {
        headers: {
          'Cookie': `auth-token=${token}`
        }
      }
    )

    const data = await response.json()

    if (response.ok) {
      console.log('\n✅ RESPUESTA DEL API (CON FIX):')
      console.log('─'.repeat(100))
      console.log(`Plan actual: ${data.currentPlan?.name || 'N/A'}`)
      console.log(`Precio pagado: €${data.currentPlan?.amountPaid?.toFixed(2) || 'N/A'}`)
      console.log(`Días restantes: ${data.currentPlan?.daysRemaining || 'N/A'}`)
      console.log(`\nNuevo plan: ${data.newPlanName || 'N/A'}`)
      console.log(`Precio nuevo plan: €${data.newPlanPrice?.toFixed(2) || 'N/A'}`)
      console.log(`\nCrédito aplicado: €${data.creditAmount?.toFixed(2) || 'N/A'}`)
      console.log(`TOTAL A PAGAR: €${data.finalPrice?.toFixed(2) || 'N/A'}`)

      // Validar cálculos
      console.log('\n\n' + '═'.repeat(100))
      console.log('🔍 VALIDACIÓN DE CÁLCULOS')
      console.log('═'.repeat(100))

      const expectedDailyRate = data.currentPlan.amountPaid / totalDays
      const expectedCredit = expectedDailyRate * daysRemaining
      const calculationError = Math.abs(expectedCredit - data.creditAmount)

      console.log(`\nTasa diaria esperada: €${expectedDailyRate.toFixed(4)}/día`)
      console.log(`Crédito esperado: €${expectedCredit.toFixed(2)}`)
      console.log(`Crédito recibido del API: €${data.creditAmount.toFixed(2)}`)
      console.log(`Diferencia: €${calculationError.toFixed(2)}`)

      if (calculationError < 0.01) {
        console.log('\n✅✅✅ CÁLCULO CORRECTO - El fix está funcionando! ✅✅✅')
      } else {
        console.log('\n❌❌❌ ERROR EN CÁLCULO - Hay una diferencia significativa ❌❌❌')
      }

      // Comparar con el valor incorrecto anterior
      const incorrectCredit = 18.69
      console.log('\n\n📊 COMPARACIÓN CON VALOR ANTERIOR (BUG):')
      console.log('─'.repeat(100))
      console.log(`Crédito ANTES del fix: €${incorrectCredit}`)
      console.log(`Crédito DESPUÉS del fix: €${data.creditAmount.toFixed(2)}`)
      console.log(`Diferencia corregida: €${(data.creditAmount - incorrectCredit).toFixed(2)}`)
      console.log(`Mejora: ${((data.creditAmount / incorrectCredit - 1) * 100).toFixed(1)}% más crédito`)

    } else {
      console.log('\n❌ ERROR EN LA RESPUESTA:')
      console.log(data)
    }

    console.log('\n' + '═'.repeat(100))

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testProrationAPI()
