const fs = require('fs')
const path = require('path')

// Function to calculate relative path from API route to src/lib/prisma.ts
function getRelativePath(apiFilePath) {
  const apiDir = path.dirname(apiFilePath)
  const srcLibPath = path.join(__dirname, 'src', 'lib', 'prisma.ts')
  const relativePath = path.relative(apiDir, srcLibPath)
  
  // Convert Windows backslashes to forward slashes for import statements
  return relativePath.replace(/\\/g, '/')
}

// API files that need to be fixed (remaining ones with @/ imports)
const apiFiles = [
  'app/api/test-save-step/route.ts',
  'app/api/test-register/route.ts',
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
  'app/api/cleanup-email-tokens/route.ts',
  'app/api/test-login/route.ts',
  'app/api/fix-user/route.ts',
  'app/api/test-email/route.ts',
  'app/api/auth/simple-login/route.ts',
  'app/api/init-db/route.ts',
  'app/api/force-login/route.ts',
  'app/api/manual-verify/route.ts',
  'app/api/magic-link/route.ts',
  'app/api/reset-user/route.ts'
]

let fixedCount = 0
let errorCount = 0

apiFiles.forEach(filePath => {
  try {
    const fullPath = path.join(__dirname, filePath)
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`)
      return
    }

    const content = fs.readFileSync(fullPath, 'utf8')
    
    // Check if file contains @/lib/prisma import
    if (!content.includes("from '@/lib/prisma'")) {
      console.log(`ℹ️  No @/lib/prisma import found in: ${filePath}`)
      return
    }

    // Calculate correct relative path
    const relativePath = getRelativePath(fullPath)
    
    // Replace the import
    const updatedContent = content.replace(
      "from '@/lib/prisma'",
      `from '${relativePath}'`
    )

    fs.writeFileSync(fullPath, updatedContent, 'utf8')
    console.log(`✅ Fixed: ${filePath} -> ${relativePath}`)
    fixedCount++

  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message)
    errorCount++
  }
})

console.log(`\n📊 Summary:`)
console.log(`   Fixed: ${fixedCount} files`)
console.log(`   Errors: ${errorCount} files`)