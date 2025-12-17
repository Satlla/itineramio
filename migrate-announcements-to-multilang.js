/**
 * Migration Script: Convert Announcements to Multi-Language Format
 *
 * This script migrates existing announcements from String to Json format
 * for multi-language support (Spanish, English, French).
 *
 * Before running:
 * 1. Ensure Prisma schema has been updated (title and message as Json)
 * 2. Run: npx prisma generate
 * 3. Run: DATABASE_URL="your_connection_string" node migrate-announcements-to-multilang.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function migrateAnnouncements() {
  console.log('🚀 Starting announcement migration to multi-language format...\n')

  try {
    // Step 1: Fetch all announcements using raw SQL (before schema change is applied)
    console.log('📥 Fetching existing announcements...')
    const announcements = await prisma.$queryRaw`
      SELECT id, title, message, "propertyId", category, priority, "isActive"
      FROM announcements
      ORDER BY "createdAt" DESC
    `

    console.log(`✅ Found ${announcements.length} announcements to migrate\n`)

    if (announcements.length === 0) {
      console.log('✨ No announcements to migrate. Database is ready!')
      return
    }

    // Step 2: Display what will be migrated
    console.log('📋 Preview of announcements to migrate:')
    console.log('─'.repeat(80))
    announcements.forEach((ann, index) => {
      console.log(`${index + 1}. ID: ${ann.id}`)
      console.log(`   Title: "${ann.title}"`)
      console.log(`   Message: "${ann.message.substring(0, 50)}${ann.message.length > 50 ? '...' : ''}"`)
      console.log(`   Property: ${ann.propertyId}`)
      console.log('')
    })
    console.log('─'.repeat(80))
    console.log('')

    // Step 3: Migrate each announcement
    console.log('🔄 Starting migration...\n')
    let successCount = 0
    let errorCount = 0

    for (const ann of announcements) {
      try {
        // Convert String to Json format with Spanish as default
        const multiLangTitle = {
          es: typeof ann.title === 'string' ? ann.title : ann.title.es || '',
          en: '',
          fr: ''
        }

        const multiLangMessage = {
          es: typeof ann.message === 'string' ? ann.message : ann.message.es || '',
          en: '',
          fr: ''
        }

        // Update using raw SQL to handle Json conversion
        await prisma.$executeRaw`
          UPDATE announcements
          SET
            title = ${JSON.stringify(multiLangTitle)}::jsonb,
            message = ${JSON.stringify(multiLangMessage)}::jsonb
          WHERE id = ${ann.id}
        `

        console.log(`✅ Migrated: ${ann.id} - "${multiLangTitle.es.substring(0, 40)}..."`)
        successCount++

      } catch (error) {
        console.error(`❌ Failed to migrate announcement ${ann.id}:`, error.message)
        errorCount++
      }
    }

    // Step 4: Verify migration
    console.log('\n🔍 Verifying migration...')
    const verifyResults = await prisma.$queryRaw`
      SELECT id, title, message
      FROM announcements
      LIMIT 3
    `

    console.log('\n📊 Sample of migrated data:')
    console.log('─'.repeat(80))
    verifyResults.forEach((result, index) => {
      console.log(`${index + 1}. ID: ${result.id}`)
      console.log(`   Title (ES): "${result.title.es}"`)
      console.log(`   Title (EN): "${result.title.en}"`)
      console.log(`   Title (FR): "${result.title.fr}"`)
      console.log(`   Message (ES): "${result.message.es.substring(0, 50)}..."`)
      console.log('')
    })
    console.log('─'.repeat(80))

    // Step 5: Summary
    console.log('\n✨ Migration Complete!\n')
    console.log('📊 Summary:')
    console.log(`   ✅ Successfully migrated: ${successCount}`)
    console.log(`   ❌ Failed: ${errorCount}`)
    console.log(`   📝 Total: ${announcements.length}`)
    console.log('')
    console.log('🎯 Next Steps:')
    console.log('   1. Update admin announcement form to support 3 languages')
    console.log('   2. Add language selector to public announcement modal')
    console.log('   3. Test multi-language announcements end-to-end')
    console.log('')

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    console.error('Error details:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migrateAnnouncements()
  .then(() => {
    console.log('👋 Migration script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
