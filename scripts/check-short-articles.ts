import { prisma } from '../src/lib/prisma'

async function main() {
  const articles = await prisma.blogPost.findMany({
    where: {
      slug: {
        in: ['normativa-vut-2025-cambios-legales', 'manual-digital-apartamentos-guia-definitiva']
      }
    },
    select: {
      slug: true,
      title: true,
      content: true,
      excerpt: true,
      status: true,
    }
  })

  for (const article of articles) {
    console.log('\n' + '='.repeat(80))
    console.log(`SLUG: ${article.slug}`)
    console.log(`TITLE: ${article.title}`)
    console.log(`STATUS: ${article.status}`)
    console.log(`CONTENT LENGTH: ${article.content.length} caracteres`)
    console.log('-'.repeat(80))
    console.log('EXCERPT:')
    console.log(article.excerpt)
    console.log('-'.repeat(80))
    console.log('CONTENT (primeros 1000 caracteres):')
    console.log(article.content.substring(0, 1000))
    console.log('='.repeat(80))
  }
}

main().finally(() => prisma.$disconnect())
