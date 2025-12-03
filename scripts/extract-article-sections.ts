import { prisma } from '../src/lib/prisma'

async function extractArticleSections() {
  const airbnbArticle = await prisma.blogPost.findUnique({
    where: { slug: 'mensajes-automaticos-airbnb' }
  })

  if (!airbnbArticle) {
    console.log('❌ No se encontró el artículo')
    return
  }

  const content = airbnbArticle.content

  // Extract configuration section
  const configMatch = content.match(/⚙️ Cómo Configurar.*?(?=<h2|$)/s)
  if (configMatch) {
    console.log('=' .repeat(80))
    console.log('📍 SECCIÓN DE CONFIGURACIÓN (extracto):')
    console.log('=' .repeat(80))
    const excerpt = configMatch[0].substring(0, 800)
    console.log(excerpt + '...\n')
  }

  // Extract dynamic variables section
  const dynamicMatch = content.match(/Contenido Dinámico.*?(?=<h2|<h3|$)/s)
  if (dynamicMatch) {
    console.log('=' .repeat(80))
    console.log('🔧 SECCIÓN DE CONTENIDO DINÁMICO (extracto):')
    console.log('=' .repeat(80))
    const excerpt = dynamicMatch[0].substring(0, 1000)
    console.log(excerpt + '...\n')
  }

  // Extract review scale
  const reviewMatch = content.match(/GUÍA RÁPIDA DE VALORACIONES.*?<\/pre>/s)
  if (reviewMatch) {
    console.log('=' .repeat(80))
    console.log('⭐ ESCALA PERSUASIVA DE REVIEWS:')
    console.log('=' .repeat(80))
    // Clean HTML tags
    const cleanText = reviewMatch[0]
      .replace(/<\/?pre[^>]*>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&gt;/g, '>')
      .replace(/→/g, '→')
    console.log(cleanText)
    console.log()
  }

  // Extract "Por qué" section
  const whyMatch = content.match(/Por qué usar.*?(?=<h3|<h2|$)/s)
  if (whyMatch) {
    console.log('=' .repeat(80))
    console.log('💡 SECCIÓN "POR QUÉ USAR CONTENIDO DINÁMICO":')
    console.log('=' .repeat(80))
    const excerpt = whyMatch[0].substring(0, 600)
    console.log(excerpt + '...\n')
  }

  // Check for table
  if (content.includes('<table')) {
    console.log('✅ El artículo SÍ contiene una tabla de variables dinámicas')
  } else {
    console.log('❌ El artículo NO contiene tabla (solo menciona variables)')
  }
}

extractArticleSections()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
