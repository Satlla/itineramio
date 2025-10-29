const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function checkTableName() {
  try {
    console.log('🔍 Checking for UserSubscription table name in database...\n')

    // Query for tables that might match
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND (table_name ILIKE '%subscription%' OR table_name ILIKE '%user%')
      ORDER BY table_name;
    `

    console.log('📊 Tables found with "subscription" or "user" in name:')
    console.table(tables)

    // Check specifically for UserSubscription columns
    const columns = await prisma.$queryRaw`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name IN ('UserSubscription', 'user_subscription', 'user_subscriptions', 'UserSubscriptions')
      ORDER BY table_name, ordinal_position;
    `

    console.log('\n📋 Columns in subscription tables:')
    console.table(columns)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTableName()
