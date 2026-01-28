import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const properties = await prisma.property.findMany({
    take: 5,
    include: {
      billingConfig: true
    }
  })

  console.log('Properties with billing config:')
  for (const p of properties) {
    const hasConfig = p.billingConfig !== null
    console.log('- ' + p.name + ': ' + (hasConfig ? 'HAS CONFIG' : 'NO CONFIG'))
  }

  const totalConfigs = await prisma.billingConfig.count()
  console.log('\nTotal BillingConfigs: ' + totalConfigs)

  // Check Gmail integration
  const gmailIntegrations = await prisma.gmailIntegration.count()
  console.log('Gmail Integrations: ' + gmailIntegrations)
}

main().finally(() => prisma.$disconnect())
