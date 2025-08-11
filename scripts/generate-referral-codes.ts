import { prisma } from '../src/lib/prisma'

async function generateReferralCodes() {
  try {
    console.log('🚀 Generating referral codes for existing users...')
    
    // Get all users without referral codes
    const usersWithoutCodes = await prisma.user.findMany({
      where: {
        referralCode: null
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })
    
    console.log(`Found ${usersWithoutCodes.length} users without referral codes`)
    
    for (const user of usersWithoutCodes) {
      const referralCode = `REF${user.id.slice(-6).toUpperCase()}`
      
      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode }
      })
      
      console.log(`✅ Generated code ${referralCode} for ${user.name} (${user.email})`)
    }
    
    console.log('🎉 All referral codes generated successfully!')
    
  } catch (error) {
    console.error('❌ Error generating referral codes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

generateReferralCodes()