const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
})

async function checkSubscriptions() {
  const user = await prisma.user.findFirst({
    where: { email: 'info@mrbarriot.com' }
  })

  if (!user) {
    console.log('Usuario no encontrado')
    return
  }

  console.log('═══════════════════════════════════════════════')
  console.log('🔍 VERIFICACIÓN DE PAGOS Y SUSCRIPCIONES')
  console.log('═══════════════════════════════════════════════')
  console.log(`Usuario: ${user.email}`)
  console.log('')

  // Suscripciones
  const subs = await prisma.userSubscription.findMany({
    where: { userId: user.id },
    include: { plan: true }
  })

  console.log(`📊 SUSCRIPCIONES TOTALES: ${subs.length}`)
  console.log('')
  subs.forEach((s, i) => {
    const planName = s.plan ? s.plan.name : 'Custom'
    const price = s.customPrice || (s.plan ? s.plan.priceMonthly : 0)
    console.log(`${i+1}. ${planName}`)
    console.log(`   Status: ${s.status}`)
    console.log(`   Precio: €${price}`)
    console.log(`   Inicio: ${s.startDate ? s.startDate.toLocaleDateString('es-ES') : 'N/A'}`)
    console.log(`   Fin: ${s.endDate ? s.endDate.toLocaleDateString('es-ES') : 'N/A'}`)
    console.log(`   Stripe Subscription ID: ${s.stripeSubscriptionId || 'NINGUNO'}`)
    console.log(`   Stripe Customer ID: ${s.stripeCustomerId || 'NINGUNO'}`)
    console.log(`   Billing Period: ${s.billingPeriod || 'N/A'}`)
    console.log('')
  })

  // Solicitudes de pago
  const requests = await prisma.subscriptionRequest.findMany({
    where: { userId: user.id },
    include: { plan: true },
    orderBy: { requestedAt: 'desc' }
  })

  console.log(`📋 SOLICITUDES DE PAGO TOTALES: ${requests.length}`)
  console.log('')
  requests.forEach((r, i) => {
    const planName = r.plan ? r.plan.name : 'N/A'
    console.log(`${i+1}. ${planName} - €${r.totalAmount}`)
    console.log(`   Status: ${r.status}`)
    console.log(`   Método: ${r.paymentMethod || 'N/A'}`)
    console.log(`   Solicitado: ${r.requestedAt ? r.requestedAt.toLocaleDateString('es-ES') : 'N/A'}`)
    console.log(`   Aprobado: ${r.approvedAt ? r.approvedAt.toLocaleDateString('es-ES') : 'No'}`)
    console.log('')
  })

  await prisma.$disconnect()
}

checkSubscriptions().catch(console.error)
