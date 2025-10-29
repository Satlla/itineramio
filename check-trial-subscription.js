const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkTrialAndSubscription() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'colaboracionesbnb@gmail.com' },
      select: {
        id: true,
        email: true,
        subscription: true,
        trialStartedAt: true,
        trialEndsAt: true
      }
    })

    console.log('📋 User data:')
    console.log('  Email:', user.email)
    console.log('  Subscription field:', user.subscription)
    console.log('  Trial started:', user.trialStartedAt)
    console.log('  Trial ends:', user.trialEndsAt)

    const now = new Date()
    const isOnTrial = user.trialEndsAt && user.trialEndsAt > now
    console.log('\n⏰ Trial status:')
    console.log('  Currently on trial:', isOnTrial)
    if (user.trialEndsAt) {
      console.log('  Days until trial ends:', Math.ceil((user.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    }

    const activeSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE'
      },
      include: {
        plan: true
      }
    })

    console.log('\n💳 Active subscription:')
    if (activeSubscription) {
      console.log('  ID:', activeSubscription.id)
      console.log('  Plan:', activeSubscription.plan?.name)
      console.log('  Plan code:', activeSubscription.plan?.code)
      console.log('  Status:', activeSubscription.status)
      console.log('  Start date:', activeSubscription.startDate)
      console.log('  End date:', activeSubscription.endDate)
    } else {
      console.log('  No active subscription found!')
    }

    console.log('\n🎯 Problem:')
    if (isOnTrial && activeSubscription) {
      console.log('  User has both trial AND active subscription!')
      console.log('  The trial check runs BEFORE the subscription check in plan-limits.ts')
      console.log('  Solution: Expire the trial or prioritize active subscription check')
    } else if (isOnTrial) {
      console.log('  User is on trial without active subscription')
    } else if (activeSubscription) {
      console.log('  User has active subscription, trial expired - this should show HOST plan')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTrialAndSubscription()
