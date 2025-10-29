const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function addCancellationColumns() {
  try {
    console.log('🔧 Adding cancellation tracking columns to UserSubscription table...')

    // Add the three missing columns using raw SQL
    await prisma.$executeRaw`
      ALTER TABLE "UserSubscription"
      ADD COLUMN IF NOT EXISTS "cancel_at_period_end" BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "canceled_at" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "cancel_reason" TEXT;
    `

    console.log('✅ Successfully added cancellation columns:')
    console.log('   - cancel_at_period_end (BOOLEAN, default false)')
    console.log('   - canceled_at (TIMESTAMP, nullable)')
    console.log('   - cancel_reason (TEXT, nullable)')

    // Verify the columns were added
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'UserSubscription'
      AND column_name IN ('cancel_at_period_end', 'canceled_at', 'cancel_reason')
      ORDER BY column_name;
    `

    console.log('\n📊 Verification - Columns in database:')
    console.table(result)

  } catch (error) {
    console.error('❌ Error adding columns:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

addCancellationColumns()
  .then(() => {
    console.log('\n✨ Database schema updated successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Failed to update database schema:', error)
    process.exit(1)
  })
