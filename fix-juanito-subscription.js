const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixSubscription() {
  try {
    const subscriptionId = 'cmh9eougv00077cc8ttcezpv6'
    
    // Get current subscription
    const sub = await prisma.userSubscription.findUnique({
      where: { id: subscriptionId }
    })
    
    console.log('\n📋 CURRENT SUBSCRIPTION:')
    console.log('Start:', sub.startDate)
    console.log('End:', sub.endDate)
    
    // Calculate new end date (6 months from start)
    const newEndDate = new Date(sub.startDate)
    newEndDate.setMonth(newEndDate.getMonth() + 6)
    
    console.log('\n✏️ UPDATING TO:')
    console.log('Start:', sub.startDate)
    console.log('New End:', newEndDate)
    
    // Update subscription
    await prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: {
        endDate: newEndDate,
        notes: 'Corregido: cambiado de 1 mes a 6 meses (semiannual)'
      }
    })
    
    // Also update the subscription request metadata
    await prisma.subscriptionRequest.update({
      where: { id: 'cmh9eksdj00037cc8o678nmq0' },
      data: {
        metadata: { billingPeriod: 'semiannual' },
        adminNotes: 'Billing: BIANNUAL | Corregido manualmente a 6 meses'
      }
    })
    
    console.log('\n✅ SUBSCRIPTION UPDATED')
    
    // Verify
    const updated = await prisma.userSubscription.findUnique({
      where: { id: subscriptionId }
    })
    
    const duration = updated.endDate - updated.startDate
    const days = duration / (1000 * 60 * 60 * 24)
    
    console.log('\n🔍 VERIFICATION:')
    console.log('New End Date:', updated.endDate)
    console.log('Duration (days):', Math.round(days))
    console.log('Notes:', updated.notes)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSubscription()
