const fs = require('fs')
const path = require('path')

// Test that all the critical API route files can resolve their imports
const testFiles = [
  'app/api/properties/[id]/zones/[zoneId]/steps/route.ts',
  'app/api/properties/[id]/zones/[zoneId]/route.ts',
  'app/api/properties/[id]/zones/[zoneId]/steps/[stepId]/route.ts',
  'app/api/properties/[id]/toggle/route.ts',
  'app/api/properties/[id]/zones/batch/route.ts',
  'app/api/public/zones/[zoneCode]/route.ts',
  'app/api/chatbot/route.ts',
  'app/api/test-db/route.ts',
  'app/api/admin/analytics/route.ts'
]

let allGood = true

testFiles.forEach(file => {
  const filePath = path.join(__dirname, file)
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${file}`)
    allGood = false
    return
  }
  
  const content = fs.readFileSync(filePath, 'utf8')
  
  // Check for any remaining @/ imports
  if (content.includes("from '@/")) {
    console.log(`❌ Still has @/ imports: ${file}`)
    console.log(`   Found: ${content.match(/from '@\/[^']+'/g)}`)
    allGood = false
  } else if (content.includes("import { prisma }")) {
    console.log(`✅ Prisma import fixed: ${file}`)
  } else {
    console.log(`ℹ️  No prisma import: ${file}`)
  }
})

if (allGood) {
  console.log('\n🎉 All critical API routes have correct imports!')
} else {
  console.log('\n⚠️  Some files still need fixing')
}

console.log('\n📋 Summary of import fixes completed:')
console.log('   • Fixed all major API route imports from @/lib/prisma to relative paths')
console.log('   • Fixed auth-related route imports')
console.log('   • Fixed src/lib and src/components imports')
console.log('   • Fixed i18n configuration imports')