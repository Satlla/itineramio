const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSubscriptionRequestStatus() {
  try {
    console.log('🔍 Checking subscription request status...\n')

    // Check the specific request that's throwing 400
    const specificRequest = await prisma.subscriptionRequest.findUnique({
      where: { id: 'cmh0clx0l000f7c4rbq57l2r9' },
      include: {
        user: { select: { name: true, email: true } },
        plan: { select: { name: true, code: true } }
      }
    })

    if (specificRequest) {
      console.log('📋 Request cmh0clx0l000f7c4rbq57l2r9 details:')
      console.log('  Status:', specificRequest.status)
      console.log('  User:', specificRequest.user.name, `(${specificRequest.user.email})`)
      console.log('  Plan:', specificRequest.plan?.name || 'N/A')
      console.log('  Amount:', `€${Number(specificRequest.totalAmount).toFixed(2)}`)
      console.log('  Requested at:', specificRequest.requestedAt)
      console.log('  Approved at:', specificRequest.approvedAt || 'Not approved')
      console.log('  Admin notes:', specificRequest.adminNotes || 'None')
      console.log('  Metadata:', JSON.stringify(specificRequest.metadata, null, 2))
      console.log('')
    } else {
      console.log('❌ Request cmh0clx0l000f7c4rbq57l2r9 not found\n')
    }

    // Find all PENDING requests
    const pendingRequests = await prisma.subscriptionRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { name: true, email: true } },
        plan: { select: { name: true, code: true } }
      },
      orderBy: { requestedAt: 'desc' }
    })

    console.log(`📊 Found ${pendingRequests.length} PENDING subscription requests:\n`)

    if (pendingRequests.length > 0) {
      pendingRequests.forEach((req, index) => {
        console.log(`${index + 1}. ID: ${req.id}`)
        console.log(`   User: ${req.user.name} (${req.user.email})`)
        console.log(`   Plan: ${req.plan?.name || 'N/A'}`)
        console.log(`   Amount: €${Number(req.totalAmount).toFixed(2)}`)
        console.log(`   Requested: ${req.requestedAt}`)
        console.log(`   Payment method: ${req.paymentMethod}`)
        console.log(`   Admin notes: ${req.adminNotes || 'None'}`)
        console.log('')
      })
    } else {
      console.log('✅ No pending subscription requests found')
    }

    // Count requests by status
    const statusCounts = await prisma.subscriptionRequest.groupBy({
      by: ['status'],
      _count: { status: true }
    })

    console.log('📈 Subscription requests by status:')
    statusCounts.forEach(({ status, _count }) => {
      console.log(`   ${status}: ${_count.status}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSubscriptionRequestStatus()
