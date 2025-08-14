import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating pricing tiers...')
  
  try {
    // Create default pricing tiers
    const tiers = await prisma.pricingTier.createMany({
      data: [
        {
          minProperties: 1,
          maxProperties: 4,
          pricePerProperty: 8,
          isActive: true
        },
        {
          minProperties: 5,
          maxProperties: 9,
          pricePerProperty: 6,
          isActive: true
        },
        {
          minProperties: 10,
          maxProperties: 19,
          pricePerProperty: 5,
          isActive: true
        },
        {
          minProperties: 20,
          maxProperties: null, // unlimited
          pricePerProperty: 4,
          isActive: true
        }
      ],
      skipDuplicates: true
    })
    
    console.log(`Created ${tiers.count} pricing tiers`)
    
    // Verify they were created
    const allTiers = await prisma.pricingTier.findMany({
      orderBy: { minProperties: 'asc' }
    })
    
    console.log('\nPricing Tiers:')
    allTiers.forEach(tier => {
      const max = tier.maxProperties || 'unlimited'
      console.log(`  ${tier.minProperties}-${max}: €${tier.pricePerProperty}/property`)
    })
    
  } catch (error) {
    console.error('Error creating pricing tiers:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })