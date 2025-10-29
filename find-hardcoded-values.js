const fs = require('fs')
const path = require('path')

const filesToCheck = [
  'app/(dashboard)/subscriptions/page.tsx',
  'app/(dashboard)/account/plans/page.tsx',
  'app/admin/subscription-requests/page.tsx',
  'src/lib/proration-service.ts',
  'src/lib/pricing-calculator.ts'
]

console.log('\n🔍 BUSCANDO VALORES HARDCODEADOS\n')
console.log('='.repeat(100))

const searchPatterns = {
  'Precio 48.60': /48\.6/g,
  'Precio 156.60': /156\.6/g,
  'Precio 372.60': /372\.6/g,
  'Precio 534.60': /534\.6/g,
  'Descuento 0.9': /\b0\.9\b/g,
  'Descuento 0.8': /\b0\.8\b/g,
  'Props 2': /\bmaxProperties.*?2\b/g,
  'Props 10': /\bmaxProperties.*?10\b/g,
  'Props 25': /\bmaxProperties.*?25\b/g,
  'Props 50': /\bmaxProperties.*?50\b/g
}

filesToCheck.forEach(file => {
  const fullPath = path.join('/Users/alejandrosatlla/Documents/itineramio', file)

  if (!fs.existsSync(fullPath)) {
    return
  }

  const content = fs.readFileSync(fullPath, 'utf-8')
  const lines = content.split('\n')

  console.log(`\n📄 ${file}`)
  console.log('-'.repeat(100))

  let foundIssues = false

  Object.entries(searchPatterns).forEach(([description, pattern]) => {
    lines.forEach((line, index) => {
      if (pattern.test(line) && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
        foundIssues = true
        const lineNum = index + 1
        console.log(`  🔸 ${description} - Línea ${lineNum}`)
        console.log(`     ${line.trim().substring(0, 100)}`)
        pattern.lastIndex = 0 // Reset regex
      }
    })
    pattern.lastIndex = 0 // Reset regex for next file
  })

  if (!foundIssues) {
    console.log('  ✅ Sin hardcodes problemáticos')
  }
})

console.log('\n' + '='.repeat(100))
