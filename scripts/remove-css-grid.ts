import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const slugsToFix = [
    'primer-mes-anfitrion-airbnb',
    'automatizacion-airbnb-recupera-8-horas-semanales',
    'revpar-vs-ocupacion-metricas-correctas-airbnb'
  ]

  console.log('🔧 Eliminando CSS Grid de artículos...\n')

  for (const slug of slugsToFix) {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, content: true }
    })

    if (!post) {
      console.log(`❌ ${slug} - No encontrado`)
      continue
    }

    let content = post.content
    let modified = false

    // Find all grid containers and replace with simple stacked divs
    const gridRegex = /<div style="display: grid; grid-template-columns:[^"]+">(.+?)<\/div>/gs

    if (gridRegex.test(content)) {
      content = content.replace(gridRegex, (match, innerContent) => {
        // Remove the grid wrapper, keep the inner divs but remove any gap/columns
        const cleanedInner = innerContent
          .replace(/grid-column: span \d+;/g, '')
          .replace(/grid-gap: [^;]+;/g, '')

        return `<div>${cleanedInner}</div>`
      })
      modified = true
    }

    // Also fix any inline grid styles
    if (content.includes('display: grid')) {
      content = content.replace(/display: grid;/g, 'display: block;')
      content = content.replace(/grid-template-columns:[^;]+;/g, '')
      content = content.replace(/grid-gap:[^;]+;/g, '')
      content = content.replace(/gap:[^;]+;/g, '')
      modified = true
    }

    if (modified) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { content }
      })
      console.log(`✅ ${slug} - CSS Grid eliminado`)
    } else {
      console.log(`ℹ️  ${slug} - No tenía CSS Grid problemático`)
    }
  }

  console.log('\n✅ Proceso completado')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
