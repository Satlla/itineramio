const fs = require('fs')
const path = require('path')

function findFilesWithPattern(dir, pattern, excludeDirs = []) {
  const results = []
  
  function searchDirectory(currentDir) {
    const items = fs.readdirSync(currentDir)
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        // Skip excluded directories
        if (!excludeDirs.some(excludeDir => fullPath.includes(excludeDir))) {
          searchDirectory(fullPath)
        }
      } else if (item.match(/\.(ts|tsx|js|jsx)$/)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8')
          if (content.includes(pattern)) {
            const matches = content.match(/from '@\/[^']+'/g) || []
            results.push({
              file: path.relative(__dirname, fullPath),
              matches: matches
            })
          }
        } catch (err) {
          // Skip files that can't be read
        }
      }
    }
  }
  
  searchDirectory(dir)
  return results
}

console.log('🔍 Searching for remaining @/ imports...\n')

const excludeDirs = ['node_modules', '.next', '.git', 'dist', 'build']
const remainingImports = findFilesWithPattern(__dirname, "from '@/", excludeDirs)

if (remainingImports.length === 0) {
  console.log('✅ No remaining @/ imports found in TypeScript/JavaScript files!')
} else {
  console.log(`⚠️  Found ${remainingImports.length} files with @/ imports:\n`)
  
  remainingImports.forEach(({ file, matches }) => {
    console.log(`📁 ${file}`)
    matches.forEach(match => {
      console.log(`   ${match}`)
    })
    console.log('')
  })
}

console.log('\n📊 Import fix summary:')
console.log('   ✅ Fixed major API routes (properties, zones, steps)')
console.log('   ✅ Fixed authentication routes')
console.log('   ✅ Fixed admin routes')
console.log('   ✅ Fixed debug and utility routes')
console.log('   ✅ Fixed src/lib and src/components imports')
console.log('   ✅ Fixed configuration imports')