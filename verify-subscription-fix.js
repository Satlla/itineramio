const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verifyFix() {
  try {
    console.log('🔍 Verificando corrección de suscripción...\n')

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        email: 'colaboracionesbnb@gmail.com'
      },
      select: {
        id: true,
        email: true,
        name: true,
        subscription: true
      }
    })

    if (!user) {
      console.error('❌ Usuario no encontrado')
      return
    }

    console.log('✅ Usuario:', user.name, `(${user.email})`)
    console.log('   Plan en User.subscription:', user.subscription, '\n')

    // Find active subscription
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE'
      },
      include: {
        plan: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!subscription) {
      console.error('❌ No se encontró suscripción activa')
      return
    }

    // Calculate duration
    const startDate = new Date(subscription.startDate)
    const endDate = new Date(subscription.endDate)
    const durationDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24))
    const durationMonths = Math.round(durationDays / 30)

    console.log('📋 SUSCRIPCIÓN ACTIVA:')
    console.log('   ID:', subscription.id)
    console.log('   Plan:', subscription.plan?.name || 'N/A')
    console.log('   Status:', subscription.status)
    console.log('   Inicio:', subscription.startDate)
    console.log('   Fin:', subscription.endDate)
    console.log('   Duración:', durationDays, 'días (~', durationMonths, 'meses)')
    console.log('   Notas:', subscription.notes)

    // Extract billing period from notes
    let billingPeriod = 'No especificado'
    if (subscription.notes) {
      const match = subscription.notes.match(/Período:\s*(Mensual|Semestral|Anual)/i)
      if (match) {
        billingPeriod = match[1]
      }
    }

    console.log('   Período detectado:', billingPeriod)

    // Verify correction
    const isCorrect = billingPeriod === 'Semestral' && durationMonths >= 5 && durationMonths <= 7

    if (isCorrect) {
      console.log('\n✅ VERIFICACIÓN EXITOSA: La suscripción está correcta')
      console.log('   ✓ Período: Semestral')
      console.log('   ✓ Duración: ~6 meses')
    } else {
      console.log('\n⚠️  ADVERTENCIA: La suscripción aún tiene problemas')
      console.log('   Período esperado: Semestral')
      console.log('   Período actual:', billingPeriod)
      console.log('   Duración esperada: ~6 meses')
      console.log('   Duración actual:', durationMonths, 'meses')
    }

  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyFix()
