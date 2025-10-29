const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function testAllScenarios() {
  try {
    console.log('🧪 TEST EXHAUSTIVO DE TODOS LOS ESCENARIOS DE PRORRATEO\n')
    console.log('='.repeat(100))

    // Buscar usuario con suscripción activa
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
      console.log('❌ No se encontró ninguna suscripción activa para probar')
      return
    }

    const userId = subscription.user.id
    console.log(`\n📋 Probando con usuario: ${subscription.user.email}`)
    console.log(`Plan actual: ${subscription.plan.name} (${subscription.plan.code})`)

    // Calcular duración
    const totalDays = Math.floor(
      (subscription.endDate.getTime() - subscription.startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    let currentPeriod = 'MONTHLY'
    if (totalDays >= 150 && totalDays <= 210) currentPeriod = 'BIANNUAL'
    else if (totalDays >= 300) currentPeriod = 'ANNUAL'

    console.log(`Periodo actual: ${currentPeriod}`)
    console.log('='.repeat(100))

    // Escenarios a probar
    const scenarios = [
      {
        name: 'UPGRADE DE PLAN (mismo periodo)',
        planCode: 'SUPERHOST',
        billingPeriod: currentPeriod,
        shouldWork: true
      },
      {
        name: 'UPGRADE DE PERIODO (mismo plan)',
        planCode: subscription.plan.code,
        billingPeriod: currentPeriod === 'MONTHLY' ? 'BIANNUAL' : 'ANNUAL',
        shouldWork: true
      },
      {
        name: 'MISMO PLAN Y PERIODO',
        planCode: subscription.plan.code,
        billingPeriod: currentPeriod,
        shouldWork: false
      },
      {
        name: 'DOWNGRADE DE PLAN',
        planCode: 'BASIC',
        billingPeriod: currentPeriod,
        shouldWork: false
      },
      {
        name: 'DOWNGRADE DE PERIODO',
        planCode: subscription.plan.code,
        billingPeriod: currentPeriod === 'ANNUAL' ? 'BIANNUAL' : 'MONTHLY',
        shouldWork: false
      }
    ]

    for (const scenario of scenarios) {
      console.log(`\n\n${'─'.repeat(100)}`)
      console.log(`📊 ESCENARIO: ${scenario.name}`)
      console.log(`${'─'.repeat(100)}`)
      console.log(`Plan destino: ${scenario.planCode}`)
      console.log(`Periodo destino: ${scenario.billingPeriod}`)
      console.log(`¿Debería funcionar?: ${scenario.shouldWork ? '✅ SÍ' : '❌ NO'}`)

      try {
        // Simular petición al endpoint
        const response = await fetch(
          `http://localhost:3000/api/billing/preview-proration?planCode=${scenario.planCode}&billingPeriod=${scenario.billingPeriod}`,
          {
            headers: {
              Cookie: `auth-token=${await getAuthToken(userId)}`
            }
          }
        )

        const data = await response.json()

        if (response.ok) {
          console.log('\n✅ RESPUESTA EXITOSA:')
          console.log(`   Plan actual pagado: €${data.currentPlan?.amountPaid?.toFixed(2) || 'N/A'}`)
          console.log(`   Días restantes: ${data.currentPlan?.daysRemaining || 'N/A'}`)
          console.log(`   Nuevo plan precio: €${data.newPlanPrice?.toFixed(2) || 'N/A'}`)
          console.log(`   Crédito aplicado: €${data.creditAmount?.toFixed(2) || 'N/A'}`)
          console.log(`   TOTAL A PAGAR: €${data.finalPrice?.toFixed(2) || 'N/A'}`)

          if (!scenario.shouldWork) {
            console.log('\n⚠️  ADVERTENCIA: Este escenario NO debería funcionar pero funcionó!')
          }

          // Validar cálculos
          if (data.hasProration) {
            const expectedDailyRate = data.currentPlan.amountPaid / totalDays
            const expectedCredit = expectedDailyRate * data.currentPlan.daysRemaining
            const calculationError = Math.abs(expectedCredit - data.creditAmount)

            if (calculationError > 0.01) {
              console.log(`\n❌ ERROR EN CÁLCULO DE CRÉDITO:`)
              console.log(`   Esperado: €${expectedCredit.toFixed(2)}`)
              console.log(`   Recibido: €${data.creditAmount.toFixed(2)}`)
              console.log(`   Diferencia: €${calculationError.toFixed(2)}`)
            } else {
              console.log('\n✅ Cálculo de crédito CORRECTO')
            }
          }
        } else {
          console.log('\n❌ RESPUESTA CON ERROR:')
          console.log(`   Error: ${data.error}`)
          console.log(`   Mensaje: ${data.message || 'N/A'}`)

          if (scenario.shouldWork) {
            console.log('\n⚠️  ADVERTENCIA: Este escenario DEBERÍA funcionar pero no funcionó!')
          } else {
            console.log('\n✅ Error esperado - escenario bloqueado correctamente')
          }
        }
      } catch (error) {
        console.log('\n💥 ERROR DE CONEXIÓN:')
        console.log(`   ${error.message}`)
      }
    }

    console.log('\n\n' + '='.repeat(100))
    console.log('✨ PRUEBAS COMPLETADAS')
    console.log('='.repeat(100))

  } catch (error) {
    console.error('❌ Error general:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Helper para obtener token de autenticación (simplificado)
async function getAuthToken(userId) {
  const jwt = require('jsonwebtoken')
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  )
  return token
}

testAllScenarios()
