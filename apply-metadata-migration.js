const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Adding metadata column to subscription_requests...')

  try {
    // Execute raw SQL
    await prisma.$executeRaw`
      ALTER TABLE subscription_requests
      ADD COLUMN IF NOT EXISTS metadata JSONB
    `

    console.log('✅ Metadata column added successfully!')
  } catch (error) {
    console.error('❌ Error:', error.message)

    // Check if column already exists
    if (error.message.includes('already exists')) {
      console.log('ℹ️ Column already exists, skipping...')
    } else {
      throw error
    }
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch(console.error)
