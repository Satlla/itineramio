/**
 * Execute SQL migration to convert announcement title and message columns from TEXT to JSONB
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const prisma = new PrismaClient()

async function runMigration() {
  console.log('🚀 Starting announcement column migration (TEXT → JSONB)...\n')

  try {
    console.log('⚡ Executing migration step by step...\n')

    // Step 1: Add temporary JSONB columns
    console.log('📝 Step 1: Adding temporary JSONB columns...')
    await prisma.$executeRaw`ALTER TABLE announcements ADD COLUMN title_new JSONB`
    await prisma.$executeRaw`ALTER TABLE announcements ADD COLUMN message_new JSONB`
    console.log('✅ Step 1 complete\n')

    // Step 2: Copy data from TEXT columns to JSONB columns with proper casting
    console.log('📝 Step 2: Copying data from TEXT to JSONB with casting...')
    await prisma.$executeRaw`
      UPDATE announcements
      SET
        title_new = title::jsonb,
        message_new = message::jsonb
    `
    console.log('✅ Step 2 complete\n')

    // Step 3: Drop old TEXT columns
    console.log('📝 Step 3: Dropping old TEXT columns...')
    await prisma.$executeRaw`ALTER TABLE announcements DROP COLUMN title`
    await prisma.$executeRaw`ALTER TABLE announcements DROP COLUMN message`
    console.log('✅ Step 3 complete\n')

    // Step 4: Rename new columns to original names
    console.log('📝 Step 4: Renaming new columns to original names...')
    await prisma.$executeRaw`ALTER TABLE announcements RENAME COLUMN title_new TO title`
    await prisma.$executeRaw`ALTER TABLE announcements RENAME COLUMN message_new TO message`
    console.log('✅ Step 4 complete\n')

    // Step 5: Add NOT NULL constraints
    console.log('📝 Step 5: Adding NOT NULL constraints...')
    await prisma.$executeRaw`ALTER TABLE announcements ALTER COLUMN title SET NOT NULL`
    await prisma.$executeRaw`ALTER TABLE announcements ALTER COLUMN message SET NOT NULL`
    console.log('✅ Step 5 complete\n')

    console.log('✅ Migration completed successfully!\n')

    // Verify the migration
    console.log('🔍 Verifying migration results...\n')
    const announcements = await prisma.$queryRaw`
      SELECT id, title, message, category
      FROM announcements
      LIMIT 3
    `

    console.log('📊 Sample of migrated data:')
    console.log('─'.repeat(80))
    announcements.forEach((ann, index) => {
      console.log(`${index + 1}. ID: ${ann.id}`)
      console.log(`   Category: ${ann.category}`)
      console.log(`   Title (type): ${typeof ann.title}`)
      console.log(`   Title (value):`, ann.title)
      console.log(`   Message (type): ${typeof ann.message}`)
      console.log(`   Message preview:`, typeof ann.message === 'string' ? ann.message.substring(0, 80) + '...' : JSON.stringify(ann.message).substring(0, 80) + '...')
      console.log('')
    })
    console.log('─'.repeat(80))
    console.log('')
    console.log('✨ Migration verification complete!')
    console.log('')
    console.log('🎯 Next steps:')
    console.log('   1. Run: npx prisma generate')
    console.log('   2. Update admin announcement form with language tabs')
    console.log('   3. Update public announcement modal with language selector')
    console.log('')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    console.error('Error details:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('👋 Migration script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
