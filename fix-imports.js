const fs = require('fs')
const path = require('path')

// Function to calculate relative path from source to target
function getRelativePath(from, to) {
  const fromDir = path.dirname(from)
  const relativePath = path.relative(fromDir, to)
  return relativePath.startsWith('.') ? relativePath : './' + relativePath
}

// Files that need fixing
const filesToFix = [
  'app/api/admin/zones/route.ts',
  'app/api/admin/analytics/route.ts',
  'app/api/properties/[id]/zones/[zoneId]/steps/route.ts',
  'app/api/properties/[id]/zones/route.ts',
  'app/api/properties/[id]/toggle/route.ts',
  'app/api/properties/[id]/zones/[zoneId]/route.ts',
  'app/api/properties/[id]/zones/[zoneId]/steps/[stepId]/route.ts',
  'app/api/test-db/route.ts',
  'app/api/chatbot/route.ts',
  'app/api/public/zones/[zoneCode]/route.ts',
  'app/api/test-save-step/route.ts',
  'app/api/test-register/route.ts',
  'app/api/properties/[id]/zones/batch/route.ts',
  'app/api/nuclear-cleanup/route.ts',
  'app/api/list-users/route.ts',
  'app/api/force-delete-user/route.ts',
  'app/api/emergency-debug/route.ts',
  'app/api/diagnostic/route.ts',
  'app/api/delete-user/route.ts',
  'app/api/delete-test-user/route.ts',
  'app/api/debug-zone/[zoneId]/route.ts',
  'app/api/debug-user/route.ts',
  'app/api/debug-steps/route.ts',
  'app/api/clear-database/route.ts',
  'app/api/clear-all-users/route.ts',
  'app/api/cleanup-blob-urls/route.ts',
  'app/api/cleanup-all-test-users/route.ts',
  'app/api/auth/resend-verification/route.ts',
  'app/api/test-login/route.ts',
  'app/api/fix-user/route.ts',
  'app/api/auth/simple-login/route.ts',
  'app/api/init-db/route.ts',
  'app/api/force-login/route.ts',
  'app/api/manual-verify/route.ts',
  'app/api/magic-link/route.ts',
  'app/api/reset-user/route.ts'
]

const targetFile = 'src/lib/prisma.ts'

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file)
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8')
    
    // Calculate relative path
    const relativePath = getRelativePath(file, targetFile)
    
    // Replace the import
    content = content.replace(/from '@\/lib\/prisma'/g, `from '${relativePath}'`)
    
    fs.writeFileSync(filePath, content)
    console.log(`Fixed: ${file}`)
  } else {
    console.log(`File not found: ${file}`)
  }
})

console.log('Import fixing complete!')