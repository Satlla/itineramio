import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const articles = await prisma.blogPost.findMany({
    where: {
      slug: {
        in: ['storytelling-que-convierte-descripciones-airbnb', 'kit-anti-caos-anfitriones-airbnb']
      }
    },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      readTime: true,
      publishedAt: true,
      tags: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  console.log('\n📚 ARTÍCULOS NUEVOS CREADOS:', articles.length, '\n')

  articles.forEach(a => {
    console.log('✅', a.title)
    console.log('   🔗 Slug:', a.slug)
    console.log('   📂 Categoría:', a.category)
    console.log('   ⏱️  Lectura:', a.readTime, 'min')
    console.log('   🏷️  Tags:', a.tags.join(', '))
    console.log('   📅 Publicado:', a.publishedAt ? '✅ Sí - ' + a.publishedAt.toISOString() : '❌ No')
    console.log('   🌐 URL: https://itineramio.com/blog/' + a.slug)
    console.log('')
  })

  // Contar artículos totales publicados
  const totalPublished = await prisma.blogPost.count({
    where: {
      publishedAt: { not: null }
    }
  })

  console.log('📊 TOTAL ARTÍCULOS PUBLICADOS:', totalPublished)

  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
