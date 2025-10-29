const { prisma } = require('../src/lib/prisma');

async function main() {
  console.log('🌱 Seeding pricing tiers...');

  // Clear existing pricing tiers
  await prisma.pricingTier.deleteMany();

  // Create default pricing tiers based on user's requirements
  const pricingTiers = [
    {
      minProperties: 1,
      maxProperties: 4,
      pricePerProperty: 8.00,
      isActive: true
    },
    {
      minProperties: 5,
      maxProperties: 9,
      pricePerProperty: 6.00,
      isActive: true
    },
    {
      minProperties: 10,
      maxProperties: 19,
      pricePerProperty: 5.00,
      isActive: true
    },
    {
      minProperties: 20,
      maxProperties: null, // null means unlimited
      pricePerProperty: 4.00,
      isActive: true
    }
  ];

  for (const tier of pricingTiers) {
    await prisma.pricingTier.create({ data: tier });
    console.log(`✅ Created tier: ${tier.minProperties}-${tier.maxProperties || '∞'} properties at €${tier.pricePerProperty}`);
  }

  console.log('🎉 Pricing tiers seeded successfully!');
  
  // Test the pricing calculation
  console.log('\n🧮 Testing pricing calculations:');
  const testCases = [1, 3, 5, 8, 12, 25];
  
  for (const properties of testCases) {
    const tiers = await prisma.pricingTier.findMany({
      where: { isActive: true },
      orderBy: { minProperties: 'asc' }
    });

    const applicableTier = tiers.find((tier: any) => 
      properties >= tier.minProperties && 
      (tier.maxProperties === null || properties <= tier.maxProperties)
    );

    if (applicableTier) {
      const total = properties * Number(applicableTier.pricePerProperty);
      console.log(`${properties} properties: €${total.toFixed(2)} (€${applicableTier.pricePerProperty}/property)`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });