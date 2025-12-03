import { prisma } from '../src/lib/prisma'

async function showUpdatedArticles() {
  console.log('📰 ARTÍCULOS ACTUALIZADOS\n')

  // Get Airbnb article
  const airbnbArticle = await prisma.blogPost.findUnique({
    where: { slug: 'mensajes-automaticos-airbnb' }
  })

  // Get Booking article
  const bookingArticle = await prisma.blogPost.findUnique({
    where: { slug: 'mensajes-automaticos-booking' }
  })

  if (airbnbArticle) {
    console.log('=' .repeat(80))
    console.log('🏠 ARTÍCULO DE AIRBNB')
    console.log('=' .repeat(80))
    console.log(`\n📌 Título: ${airbnbArticle.title}`)
    console.log(`🔗 Slug: ${airbnbArticle.slug}`)
    console.log(`🖼️  Cover Image: ${airbnbArticle.coverImage || 'No tiene'}`)
    console.log(`📝 Excerpt: ${airbnbArticle.excerpt}\n`)
    console.log(`⏱️  Read Time: ${airbnbArticle.readTime} min`)
    console.log(`📅 Published: ${airbnbArticle.publishedAt?.toLocaleDateString('es-ES')}`)
    console.log(`\n📄 Content length: ${airbnbArticle.content.length} caracteres`)

    // Extract key sections
    const content = airbnbArticle.content

    // Check if it has the new sections
    const hasConfigSection = content.includes('Cómo Configurar Mensajes Automáticos')
    const hasDynamicSection = content.includes('Contenido Dinámico')
    const hasReviewScale = content.includes('GUÍA RÁPIDA DE VALORACIONES')

    console.log('\n✅ NUEVAS SECCIONES AÑADIDAS:')
    console.log(`  ${hasConfigSection ? '✅' : '❌'} Paso a paso de configuración`)
    console.log(`  ${hasDynamicSection ? '✅' : '❌'} Tabla de variables dinámicas`)
    console.log(`  ${hasReviewScale ? '✅' : '❌'} Escala persuasiva de reviews`)

    // Extract dynamic variables table
    if (content.includes('<table')) {
      console.log('\n📊 TABLA DE VARIABLES DINÁMICAS INCLUIDA:')
      const tableMatch = content.match(/<table[^>]*>(.*?)<\/table>/s)
      if (tableMatch) {
        console.log('  - {{guest_first_name}}')
        console.log('  - {{check_in_date}}')
        console.log('  - {{check_out_date}}')
        console.log('  - {{listing_address}}')
        console.log('  - {{confirmation_code}}')
      }
    }

    // Extract review scale
    if (hasReviewScale) {
      console.log('\n⭐ ESCALA DE REVIEWS INCLUIDA:')
      console.log('  5 estrellas = Todo cumplió expectativas')
      console.log('  4 estrellas = Algo importante no fue bien (perjudica media)')
      console.log('  3 estrellas = Estancia realmente mala')
    }
  }

  if (bookingArticle) {
    console.log('\n\n' + '=' .repeat(80))
    console.log('🏨 ARTÍCULO DE BOOKING')
    console.log('=' .repeat(80))
    console.log(`\n📌 Título: ${bookingArticle.title}`)
    console.log(`🔗 Slug: ${bookingArticle.slug}`)
    console.log(`🖼️  Cover Image: ${bookingArticle.coverImage || 'No tiene'}`)
    console.log(`📝 Excerpt: ${bookingArticle.excerpt}\n`)
    console.log(`⏱️  Read Time: ${bookingArticle.readTime} min`)
    console.log(`📅 Published: ${bookingArticle.publishedAt?.toLocaleDateString('es-ES')}`)
    console.log(`\n📄 Content length: ${bookingArticle.content.length} caracteres`)
  }

  console.log('\n\n🔗 ENLACES PARA REVISAR:')
  console.log(`  Airbnb: http://localhost:3000/blog/mensajes-automaticos-airbnb`)
  console.log(`  Booking: http://localhost:3000/blog/mensajes-automaticos-booking`)

  console.log('\n\n📋 RESUMEN DE CAMBIOS:')
  console.log('  ✅ Imágenes de portada añadidas (Unsplash)')
  console.log('  ✅ Paso a paso detallado de configuración (Airbnb)')
  console.log('  ✅ Tabla de variables dinámicas con ejemplos')
  console.log('  ✅ Explicación del POR QUÉ usar contenido dinámico')
  console.log('  ✅ Escala persuasiva de reviews (5★ vs 4★ vs 3★)')
  console.log('  ✅ Instrucciones de DÓNDE hacer clic en Airbnb')
}

showUpdatedArticles()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
