const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function checkStripeSubscriptions() {
  console.log('🔍 Verificando suscripciones con Stripe activas...\n')

  // Buscar tu usuario
  const user = await prisma.user.findFirst({
    where: { email: 'alejandrosatlla@gmail.com' },
    select: { id: true, email: true, name: true }
  })

  if (!user) {
    console.log('❌ Usuario no encontrado')
    return
  }

  console.log('👤 Usuario encontrado:', user.email)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Buscar suscripciones activas
  const subscriptions = await prisma.userSubscription.findMany({
    where: { userId: user.id },
    include: {
      plan: {
        select: { name: true, code: true, priceMonthly: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log(`📊 Total de suscripciones: ${subscriptions.length}\n`)

  subscriptions.forEach((sub, index) => {
    console.log(`Suscripción ${index + 1}:`)
    console.log(`  Status: ${sub.status}`)
    console.log(`  Plan: ${sub.plan?.name || 'CUSTOM'}`)
    console.log(`  Precio: €${sub.customPrice || sub.plan?.priceMonthly || 0}`)
    console.log(`  Inicio: ${sub.startDate?.toLocaleDateString('es-ES')}`)
    console.log(`  Fin: ${sub.endDate?.toLocaleDateString('es-ES')}`)
    console.log(`  Stripe Subscription ID: ${sub.stripeSubscriptionId || 'N/A'}`)
    console.log(`  Stripe Customer ID: ${sub.stripeCustomerId || 'N/A'}`)
    console.log(`  Billing Period: ${sub.billingPeriod || 'N/A'}`)
    console.log('')
  })

  // Buscar subscription requests
  const requests = await prisma.subscriptionRequest.findMany({
    where: { userId: user.id },
    include: {
      plan: {
        select: { name: true }
      }
    },
    orderBy: { requestedAt: 'desc' },
    take: 5
  })

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📋 Últimas ${requests.length} solicitudes de suscripción:\n`)

  requests.forEach((req, index) => {
    console.log(`Solicitud ${index + 1}:`)
    console.log(`  Plan: ${req.plan?.name || 'N/A'}`)
    console.log(`  Monto: €${req.totalAmount}`)
    console.log(`  Status: ${req.status}`)
    console.log(`  Método de pago: ${req.paymentMethod}`)
    console.log(`  Fecha: ${req.requestedAt?.toLocaleDateString('es-ES')}`)
    console.log(`  Aprobada: ${req.approvedAt?.toLocaleDateString('es-ES') || 'No'}`)
    console.log('')
  })

  await prisma.$disconnect()
}

checkStripeSubscriptions()
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
