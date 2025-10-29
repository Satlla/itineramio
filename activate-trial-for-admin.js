const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function activateTrialForAdmin() {
  try {
    const adminEmail = 'info@mrbarriot.com'

    const now = new Date()
    const trialEnds = new Date(now)
    trialEnds.setDate(trialEnds.getDate() + 15) // 15 días de trial

    const updated = await prisma.user.update({
      where: { email: adminEmail },
      data: {
        trialStartedAt: now,
        trialEndsAt: trialEnds
      }
    })

    console.log('✅ Trial activado para Admin:')
    console.log(`   Email: ${updated.email}`)
    console.log(`   Trial Started: ${updated.trialStartedAt}`)
    console.log(`   Trial Ends: ${updated.trialEndsAt}`)
    console.log(`   Días de trial: 15`)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

activateTrialForAdmin()
