const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkBillingPeriod() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'colaboracionesbnb@gmail.com' }
    })

    const subscription = await prisma.userSubscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE' }
    })

    console.log('📋 UserSubscription data:')
    console.log('  ID:', subscription.id)
    console.log('  Start Date:', subscription.startDate)
    console.log('  End Date:', subscription.endDate)
    console.log('  Notes:', subscription.notes)

    // Calcular meses de diferencia
    const start = new Date(subscription.startDate)
    const end = new Date(subscription.endDate)
    const monthsDiff = Math.round((end - start) / (1000 * 60 * 60 * 24 * 30))

    console.log('\n📊 Calculated period:')
    console.log('  Months difference:', monthsDiff)
    console.log('  Billing period:', monthsDiff === 1 ? 'MONTHLY' : monthsDiff === 6 ? 'BIANNUAL' : monthsDiff === 12 ? 'ANNUAL' : 'UNKNOWN')

    // Verificar SubscriptionRequest
    const request = await prisma.subscriptionRequest.findFirst({
      where: { userId: user.id, status: 'APPROVED' },
      orderBy: { approvedAt: 'desc' }
    })

    console.log('\n📋 SubscriptionRequest data:')
    console.log('  Total Amount:', `€${Number(request.totalAmount).toFixed(2)}`)
    console.log('  Admin Notes:', request.adminNotes)
    console.log('  Metadata:', JSON.stringify(request.metadata, null, 2))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkBillingPeriod()
