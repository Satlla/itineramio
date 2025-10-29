const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
})

async function testCancelSubscription() {
  console.log('🔍 Buscando suscripción activa...')

  // Buscar una suscripción activa
  const subscription = await prisma.userSubscription.findFirst({
    where: {
      status: 'ACTIVE',
      endDate: { gte: new Date() }
    },
    include: {
      plan: true,
      user: {
        select: { name: true, email: true }
      }
    }
  })

  if (!subscription) {
    console.log('❌ No se encontró ninguna suscripción activa')
    await prisma.$disconnect()
    return
  }

  console.log('\n✅ Suscripción encontrada:')
  console.log(`   Usuario: ${subscription.user.name} (${subscription.user.email})`)
  console.log(`   Plan: ${subscription.plan?.name || 'Custom'}`)
  console.log(`   Status: ${subscription.status}`)
  console.log(`   Inicio: ${subscription.startDate}`)
  console.log(`   Fin: ${subscription.endDate}`)
  console.log(`   Notes actuales: ${subscription.notes || 'N/A'}`)

  console.log('\n📝 Schema de UserSubscription:')
  const result = await prisma.$queryRaw`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'user_subscriptions'
    ORDER BY ordinal_position
  `
  console.table(result)

  await prisma.$disconnect()
}

testCancelSubscription().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
