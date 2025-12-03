import { prisma } from '../src/lib/prisma'

async function listAllArticles() {
  console.log('📰 LISTADO COMPLETO DE ARTÍCULOS DEL BLOG\n')

  const articles = await prisma.blogPost.findMany({
    orderBy: { publishedAt: 'desc' },
    select: {
      slug: true,
      title: true,
      category: true,
      status: true,
      publishedAt: true,
      authorName: true,
      readTime: true,
      views: true,
      coverImage: true
    }
  })

  console.log(`Total de artículos: ${articles.length}\n`)
  console.log('=' .repeat(100))

  articles.forEach((article, index) => {
    console.log(`\n${index + 1}. ${article.title}`)
    console.log(`   📝 Slug: ${article.slug}`)
    console.log(`   🔗 URL: http://localhost:3000/blog/${article.slug}`)
    console.log(`   🔗 PRODUCCIÓN: https://www.itineramio.com/blog/${article.slug}`)
    console.log(`   📂 Categoría: ${article.category}`)
    console.log(`   👤 Autor: ${article.authorName || 'Sin autor'}`)
    console.log(`   📊 Estado: ${article.status}`)
    console.log(`   📅 Publicado: ${article.publishedAt?.toLocaleDateString('es-ES') || 'No publicado'}`)
    console.log(`   ⏱️  Tiempo lectura: ${article.readTime} min`)
    console.log(`   👁️  Vistas: ${article.views}`)
    console.log(`   🖼️  Imagen: ${article.coverImage ? '✅' : '❌'}`)
    console.log('-' .repeat(100))
  })

  console.log('\n\n📊 RESUMEN POR CATEGORÍA:')
  const byCategory = articles.reduce((acc, article) => {
    acc[article.category] = (acc[article.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  Object.entries(byCategory).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} artículos`)
  })

  console.log('\n\n📊 RESUMEN POR ESTADO:')
  const byStatus = articles.reduce((acc, article) => {
    acc[article.status] = (acc[article.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  Object.entries(byStatus).forEach(([status, count]) => {
    console.log(`  ${status}: ${count} artículos`)
  })
}

listAllArticles()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
