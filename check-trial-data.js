const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkTrialData() {
  try {
    // Get all users with their trial data
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        trialStartedAt: true,
        trialEndsAt: true,
        emailVerified: true
      }
    })

    console.log('\n📊 TRIAL DATA FOR ALL USERS:\n')

    for (const user of users) {
      console.log(`👤 User: ${user.name} (${user.email})`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Email Verified: ${user.emailVerified ? '✅' : '❌'}`)
      console.log(`   Trial Started: ${user.trialStartedAt || 'NOT SET'}`)
      console.log(`   Trial Ends: ${user.trialEndsAt || 'NOT SET'}`)

      if (user.trialStartedAt && user.trialEndsAt) {
        const now = new Date()
        const endsAt = new Date(user.trialEndsAt)
        const daysRemaining = Math.ceil((endsAt - now) / (1000 * 60 * 60 * 24))
        console.log(`   Days Remaining: ${daysRemaining}`)
        console.log(`   Is Active: ${daysRemaining > 0 ? '✅ YES' : '❌ EXPIRED'}`)
      } else {
        console.log(`   ⚠️  NO TRIAL DATA`)
      }
      console.log('')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTrialData()
