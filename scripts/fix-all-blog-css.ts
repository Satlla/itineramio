import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Revisando todos los artículos del blog...\n')

  const posts = await prisma.blogPost.findMany({
    select: { id: true, slug: true, content: true }
  })

  let totalFixed = 0

  for (const post of posts) {
    let content = post.content
    let fixes = 0
    const errors: string[] = []

    // Pattern 1: Missing background-color: before hex color
    const bgColorIssues = content.match(/style="[^"]*[^:]\s*#([0-9a-f]{6});/g)
    if (bgColorIssues) {
      // More specific: check if it's really missing the property name
      content = content.replace(/style="([^"]*?[^:]\s*)#([0-9a-f]{6});/g, (match, before) => {
        if (!before.endsWith('background-color:') && !before.endsWith('color:') && !before.endsWith('border-color:')) {
          fixes++
          errors.push('Missing CSS property before hex color')
          // Try to infer the property based on context
          if (before.includes('background') || before.includes('padding') || before.includes('border-radius')) {
            return `style="${before}background-color: #$2;`
          } else if (before.includes('font') || before.includes('margin')) {
            return `style="${before}color: #$2;`
          } else {
            return `style="${before}color: #$2;`
          }
        }
        return match
      })
    }

    // Pattern 2: Specific case: "; #color;" should be "; color: #color;"
    if (content.includes('; #')) {
      const beforeFix = content
      content = content.replace(/; #([0-9a-f]{6});/g, '; color: #$1;')
      if (content !== beforeFix) {
        fixes++
        errors.push('Fixed naked hex colors')
      }
    }

    // Pattern 3: CSS Grid that might break rendering
    if (content.includes('display: grid')) {
      errors.push('⚠️  Uses CSS Grid (may need simplification)')
    }

    // Pattern 4: Unescaped quotes in attributes
    const quoteIssues = content.match(/style="[^"]*"[^>]*"[^"]*"/g)
    if (quoteIssues && quoteIssues.length > 0) {
      errors.push('⚠️  Potential unescaped quotes in style attributes')
    }

    if (fixes > 0) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { content }
      })
      totalFixed++
      console.log(`✅ ${post.slug}`)
      console.log(`   Correcciones: ${fixes}`)
      errors.forEach(err => console.log(`   - ${err}`))
    } else if (errors.length > 0) {
      console.log(`⚠️  ${post.slug}`)
      errors.forEach(err => console.log(`   - ${err}`))
    }
  }

  console.log(`\n📊 Resumen:`)
  console.log(`   Total artículos: ${posts.length}`)
  console.log(`   Artículos corregidos: ${totalFixed}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
