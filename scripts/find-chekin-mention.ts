import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Buscando menciones de Chekin + Itineramio...\n')

  const articles = await prisma.blogPost.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      content: true
    }
  })

  for (const article of articles) {
    if (article.content.includes('Chekin') && article.content.includes('Itineramio')) {
      console.log(`\n📄 Artículo encontrado: ${article.title}`)
      console.log(`   Slug: ${article.slug}`)
      console.log(`   ID: ${article.id}`)

      // Buscar el contexto específico
      const lines = article.content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('Chekin') && lines[i].includes('Itineramio')) {
          console.log(`\n   Línea ${i}: ${lines[i].substring(0, 200)}...`)
        }
      }
    }
  }

  await prisma.$disconnect()
}

main()
