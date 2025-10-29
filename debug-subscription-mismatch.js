const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugSubscriptionMismatch() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'colaboracionesbnb@gmail.com' }
    })

    if (!user) {
      console.log('❌ Usuario no encontrado')
      return
    }

    console.log('🔍 VERIFICANDO DATOS DE SUSCRIPCIÓN\n')
    console.log('=' .repeat(60))

    // 1. Campo subscription en User
    console.log('\n📋 1. CAMPO user.subscription:')
    console.log('   Valor:', user.subscription)
    console.log('')

    // 2. UserSubscription (tabla de suscripciones activas)
    const userSubscriptions = await prisma.userSubscription.findMany({
      where: { userId: user.id },
      include: {
        plan: true,
        customPlan: true
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log('📋 2. TABLA UserSubscription:')
    if (userSubscriptions.length === 0) {
      console.log('   ❌ No hay suscripciones')
    } else {
      userSubscriptions.forEach((sub, index) => {
        console.log(`\n   Suscripción ${index + 1}:`)
        console.log('   ID:', sub.id)
        console.log('   Status:', sub.status)
        console.log('   Plan ID:', sub.planId)
        console.log('   Plan Name:', sub.plan?.name || sub.customPlan?.name)
        console.log('   Plan Code:', sub.plan?.code || 'CUSTOM')
        console.log('   Max Properties:', sub.plan?.maxProperties || sub.customPlan?.maxProperties)
        console.log('   Start Date:', sub.startDate)
        console.log('   End Date:', sub.endDate)
      })
    }

    // 3. SubscriptionRequest
    const subscriptionRequests = await prisma.subscriptionRequest.findMany({
      where: { userId: user.id },
      include: { plan: true },
      orderBy: { requestedAt: 'desc' },
      take: 3
    })

    console.log('\n📋 3. TABLA SubscriptionRequest (últimas 3):')
    subscriptionRequests.forEach((req, index) => {
      console.log(`\n   Request ${index + 1}:`)
      console.log('   ID:', req.id)
      console.log('   Status:', req.status)
      console.log('   Plan:', req.plan?.name)
      console.log('   Plan Code:', req.plan?.code)
      console.log('   Total Amount:', `€${Number(req.totalAmount).toFixed(2)}`)
      console.log('   Requested At:', req.requestedAt)
      console.log('   Approved At:', req.approvedAt || 'N/A')
    })

    // 4. Simular API /api/user/subscriptions
    console.log('\n📋 4. API /api/user/subscriptions devuelve:')
    const apiSubscriptions = await prisma.userSubscription.findMany({
      where: {
        userId: user.id,
        status: {
          in: ['ACTIVE', 'EXPIRED', 'EXPIRING_SOON']
        }
      },
      include: {
        plan: {
          select: {
            name: true,
            priceMonthly: true,
            maxProperties: true
          }
        }
      }
    })

    console.log('   Subscriptions:', apiSubscriptions.length)
    apiSubscriptions.forEach((sub, index) => {
      console.log(`\n   API Subscription ${index + 1}:`)
      console.log('   Plan:', sub.plan?.name)
      console.log('   Max Properties:', sub.plan?.maxProperties)
      console.log('   Status:', sub.status)
    })

    console.log('\n📋 5. CAMPO user.subscription vs TABLA UserSubscription:')
    if (userSubscriptions.length > 0) {
      const activeSub = userSubscriptions.find(s => s.status === 'ACTIVE')
      const planName = activeSub?.plan?.name || activeSub?.customPlan?.name

      console.log('   user.subscription:', user.subscription)
      console.log('   UserSubscription.plan.name:', planName)
      console.log('   ¿COINCIDEN?:', user.subscription === planName ? '✅ SÍ' : '❌ NO')
    }

    console.log('\n' + '='.repeat(60))
    console.log('\n🎯 RESUMEN:')
    console.log(`   Usuario: ${user.email}`)
    console.log(`   Campo subscription: ${user.subscription}`)
    console.log(`   Suscripciones activas: ${userSubscriptions.filter(s => s.status === 'ACTIVE').length}`)
    console.log(`   Propiedades: ${await prisma.property.count({ where: { hostId: user.id }})}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugSubscriptionMismatch()
