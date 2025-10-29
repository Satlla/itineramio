const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkSubscription() {
  try {
    // Check subscription request
    const request = await prisma.subscriptionRequest.findUnique({
      where: { id: 'cmh9eksdj00037cc8o678nmq0' },
      include: {
        user: { select: { name: true, email: true } },
        plan: { select: { code: true, name: true, priceMonthly: true } }
      }
    })
    
    console.log('\n📋 SUBSCRIPTION REQUEST:')
    console.log('Status:', request.status)
    console.log('Total Amount:', request.totalAmount)
    console.log('Payment Method:', request.paymentMethod)
    console.log('Admin Notes:', request.adminNotes)
    console.log('Metadata:', JSON.stringify(request.metadata, null, 2))
    console.log('Plan:', request.plan?.code, '-', request.plan?.name)
    
    // Check user subscription
    const userSub = await prisma.userSubscription.findFirst({
      where: { userId: request.userId, status: 'ACTIVE' },
      include: {
        plan: { select: { code: true, name: true, priceMonthly: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('\n💳 USER SUBSCRIPTION:')
    console.log('ID:', userSub.id)
    console.log('Plan:', userSub.plan?.code, '-', userSub.plan?.name)
    console.log('Price Monthly:', userSub.plan?.priceMonthly)
    console.log('Custom Price:', userSub.customPrice)
    console.log('Start Date:', userSub.startDate)
    console.log('End Date:', userSub.endDate)
    
    const duration = userSub.endDate - userSub.startDate
    const days = duration / (1000 * 60 * 60 * 24)
    console.log('Duration (days):', Math.round(days))
    
    // Check invoice
    const invoice = await prisma.invoice.findFirst({
      where: { subscriptionId: userSub.id },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('\n🧾 INVOICE:')
    console.log('Number:', invoice.invoiceNumber)
    console.log('Amount:', invoice.amount)
    console.log('Discount:', invoice.discountAmount)
    console.log('Final Amount:', invoice.finalAmount)
    console.log('Notes:', invoice.notes)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSubscription()
