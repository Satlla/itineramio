/**
 * Quick script to check the current state of announcements in the database
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkState() {
  console.log('🔍 Checking announcement data state...\n')

  try {
    const announcements = await prisma.$queryRaw`
      SELECT id, title, message, category, "propertyId"
      FROM announcements
      LIMIT 5
    `

    console.log('📊 Announcement data (raw from database):')
    console.log('─'.repeat(80))

    announcements.forEach((ann, index) => {
      console.log(`\n${index + 1}. ID: ${ann.id}`)
      console.log(`   Property: ${ann.propertyId}`)
      console.log(`   Category: ${ann.category}`)
      console.log(`   Title (type): ${typeof ann.title}`)
      console.log(`   Title (value):`, ann.title)
      console.log(`   Message (type): ${typeof ann.message}`)
      console.log(`   Message (value):`, typeof ann.message === 'string' ? ann.message.substring(0, 100) + '...' : ann.message)
    })

    console.log('\n' + '─'.repeat(80))
    console.log('\n✅ Check complete!')

  } catch (error) {
    console.error('❌ Error:', error)
    console.error('Details:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkState()
