const { PrismaClient } = require('@prisma/client')
const { sign } = require('jsonwebtoken')

const prisma = new PrismaClient()

async function testUserAPIData() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'colaboracionesbnb@gmail.com' }
    })

    if (!user) {
      console.log('❌ Usuario no encontrado')
      return
    }

    console.log('🔍 Simulando llamada a /api/user/subscriptions...\n')

    // Simular la lógica del endpoint
    const subscriptions = await prisma.userSubscription.findMany({
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
            maxProperties: true,
            features: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    const propertyCount = await prisma.property.count({
      where: { hostId: user.id }
    })

    console.log('📊 Datos que recibe el frontend:')
    console.log('  Property count:', propertyCount)
    console.log('  Current plan:', user.subscription)
    console.log('  Subscriptions:', subscriptions.length)
    console.log('')

    subscriptions.forEach((sub, index) => {
      console.log(`  Subscription ${index + 1}:`)
      console.log('    ID:', sub.id)
      console.log('    Status:', sub.status)
      console.log('    Plan name:', sub.plan?.name)
      console.log('    Max properties:', sub.plan?.maxProperties)
      console.log('    Price monthly:', sub.plan?.priceMonthly)
      console.log('')
    })

    // Calcular totalSlots como en subscriptions/page.tsx línea 272-274
    const totalSlots = subscriptions
      .filter(sub => sub.status === 'ACTIVE')
      .reduce((total, sub) => total + (sub.plan?.maxProperties || 0), 0)

    console.log('❓ CÁLCULO DE totalSlots (línea 272-274 en subscriptions/page.tsx):')
    console.log('  totalSlots =', totalSlots)
    console.log('')

    // Verificar si hay algún dato extra
    console.log('🔍 Verificando uso de slots en /api/user/properties-subscription...\n')

    // Simular properties-subscription endpoint
    const properties = await prisma.property.findMany({
      where: { hostId: user.id }
    })

    let activeSubscriptionSlots = 0
    const now = new Date()

    subscriptions.forEach(sub => {
      if (sub.endDate) {
        const endDate = new Date(sub.endDate)
        if (endDate > now && sub.status === 'ACTIVE') {
          activeSubscriptionSlots += sub.plan?.maxProperties || 0
        }
      }
    })

    console.log('📊 Datos de properties-subscription:')
    console.log('  Total properties:', properties.length)
    console.log('  Active subscription slots:', activeSubscriptionSlots)
    console.log('')

    // Check if somewhere is adding +1
    console.log('🔍 Verificando si hay +1 adicional en algún lado...')
    console.log('  Plan maxProperties:', subscriptions[0]?.plan?.maxProperties)
    console.log('  ¿Se está sumando 1 propiedad gratis de STARTER?:', activeSubscriptionSlots === 11)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testUserAPIData()
