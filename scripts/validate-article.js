#!/usr/bin/env node

/**
 * Script de Validación de Artículos - Itineramio
 *
 * Valida artículos del blog antes de publicar
 * Comprueba: longitud, estructura, SEO, formato, CTAs
 *
 * Uso:
 *   node scripts/validate-article.js <article-slug>
 *   node scripts/validate-article.js manual-digital-apartamento-turistico-plantilla-completa-2025
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
}

function log(color, msg) {
  console.log(`${colors[color]}${msg}${colors.reset}`)
}

async function validateArticle(slug) {
  // Fetch article from database
  const article = await prisma.blogPost.findUnique({
    where: { slug }
  })

  if (!article) {
    log('red', `❌ Artículo no encontrado: ${slug}`)
    process.exit(1)
  }

  log('blue', '\n📊 VALIDANDO ARTÍCULO: ' + article.title)
  log('blue', '='.repeat(80) + '\n')

  const report = {
    passed: [],
    warnings: [],
    errors: [],
    info: []
  }

  // ============================================
  // 1. VALIDACIÓN DE CONTENIDO
  // ============================================

  log('magenta', '📝 1. VALIDACIÓN DE CONTENIDO\n')

  // Word count
  const text = article.content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ')
  const wordCount = text.split(' ').length

  if (wordCount >= 2500) {
    report.passed.push(`Longitud: ${wordCount} palabras ✅ (objetivo: 2,500+)`)
  } else if (wordCount >= 2000) {
    report.warnings.push(`Longitud: ${wordCount} palabras ⚠️ (objetivo: 2,500+)`)
  } else {
    report.errors.push(`Longitud: ${wordCount} palabras ❌ (mínimo: 2,000)`)
  }

  // H2 count
  const h2Matches = article.content.match(/<h2[^>]*>/g)
  const h2Count = h2Matches ? h2Matches.length : 0

  if (h2Count >= 10) {
    report.passed.push(`Secciones H2: ${h2Count} ✅ (objetivo: 10+)`)
  } else if (h2Count >= 7) {
    report.warnings.push(`Secciones H2: ${h2Count} ⚠️ (objetivo: 10+)`)
  } else {
    report.errors.push(`Secciones H2: ${h2Count} ❌ (mínimo: 7)`)
  }

  // H3 count
  const h3Matches = article.content.match(/<h3[^>]*>/g)
  const h3Count = h3Matches ? h3Matches.length : 0

  if (h3Count >= 15) {
    report.passed.push(`Subsecciones H3: ${h3Count} ✅`)
  } else {
    report.warnings.push(`Subsecciones H3: ${h3Count} ⚠️ (recomendado: 15+)`)
  }

  // Verificar H1 (no debe haber)
  const h1Matches = article.content.match(/<h1[^>]*>/g)
  const h1Count = h1Matches ? h1Matches.length : 0

  if (h1Count === 0) {
    report.passed.push(`Sin H1 en contenido ✅ (correcto)`)
  } else {
    report.errors.push(`Encontrados ${h1Count} H1 en contenido ❌ (deben ser 0)`)
  }

  // ============================================
  // 2. VALIDACIÓN SEO
  // ============================================

  log('magenta', '\n🔍 2. VALIDACIÓN SEO\n')

  // Meta Title
  const metaTitleLength = article.metaTitle ? article.metaTitle.length : 0

  if (metaTitleLength >= 50 && metaTitleLength <= 60) {
    report.passed.push(`Meta Title: ${metaTitleLength} caracteres ✅`)
  } else if (metaTitleLength > 0) {
    report.warnings.push(`Meta Title: ${metaTitleLength} caracteres ⚠️ (óptimo: 50-60)`)
  } else {
    report.errors.push(`Meta Title: falta ❌`)
  }

  // Meta Description
  const metaDescLength = article.metaDescription ? article.metaDescription.length : 0

  if (metaDescLength >= 150 && metaDescLength <= 160) {
    report.passed.push(`Meta Description: ${metaDescLength} caracteres ✅`)
  } else if (metaDescLength > 0) {
    report.warnings.push(`Meta Description: ${metaDescLength} caracteres ⚠️ (óptimo: 150-160)`)
  } else {
    report.errors.push(`Meta Description: falta ❌`)
  }

  // Keywords
  const keywordCount = article.keywords ? article.keywords.length : 0

  if (keywordCount >= 6 && keywordCount <= 8) {
    report.passed.push(`Keywords: ${keywordCount} ✅`)
  } else if (keywordCount > 0) {
    report.warnings.push(`Keywords: ${keywordCount} ⚠️ (recomendado: 6-8)`)
  } else {
    report.errors.push(`Keywords: 0 ❌ (mínimo: 6)`)
  }

  // Keyword principal en primer párrafo
  const firstParagraph = article.content.match(/<p[^>]*>.*?<\/p>/i)
  if (firstParagraph && article.keywords && article.keywords[0]) {
    const mainKeyword = article.keywords[0].toLowerCase()
    const firstParaText = firstParagraph[0].toLowerCase()

    if (firstParaText.includes(mainKeyword)) {
      report.passed.push(`Keyword principal en primer párrafo ✅`)
    } else {
      report.warnings.push(`Keyword principal NO en primer párrafo ⚠️`)
    }
  }

  // ============================================
  // 3. VALIDACIÓN DE FORMATO
  // ============================================

  log('magenta', '\n🎨 3. VALIDACIÓN DE FORMATO\n')

  // CTAs Newsletter
  const ctaInline = (article.content.match(/NewsletterCTA.*variant="inline"/g) || []).length
  const ctaTrial = (article.content.match(/NewsletterCTA.*variant="trial"/g) || []).length
  const ctaBox = (article.content.match(/NewsletterCTA.*variant="box"/g) || []).length
  const totalCTAs = ctaInline + ctaTrial + ctaBox

  if (totalCTAs >= 3) {
    report.passed.push(`CTAs Newsletter: ${totalCTAs} (inline: ${ctaInline}, trial: ${ctaTrial}, box: ${ctaBox}) ✅`)
  } else if (totalCTAs >= 2) {
    report.warnings.push(`CTAs Newsletter: ${totalCTAs} ⚠️ (recomendado: 3)`)
  } else {
    report.errors.push(`CTAs Newsletter: ${totalCTAs} ❌ (mínimo: 3)`)
  }

  // Imágenes con alt
  const imgMatches = article.content.match(/<img[^>]*>/g)
  if (imgMatches) {
    const imgsWithoutAlt = imgMatches.filter(img => !img.includes('alt=')).length

    if (imgsWithoutAlt === 0) {
      report.passed.push(`Imágenes con alt text: todas ✅`)
    } else {
      report.errors.push(`${imgsWithoutAlt} imágenes sin alt text ❌`)
    }
  } else {
    report.info.push(`No hay imágenes en el contenido ℹ️`)
  }

  // Links externos
  const externalLinks = (article.content.match(/href="http/g) || []).length

  if (externalLinks >= 2) {
    report.passed.push(`Links externos: ${externalLinks} ✅`)
  } else {
    report.warnings.push(`Links externos: ${externalLinks} ⚠️ (recomendado: 2+)`)
  }

  // UTM tracking en links a itineramio.com
  const itineramioLinks = (article.content.match(/href="https?:\/\/.*itineramio\.com/g) || [])
  const linksWithUTM = itineramioLinks.filter(link => link.includes('utm_')).length

  if (itineramioLinks.length > 0) {
    if (linksWithUTM === itineramioLinks.length) {
      report.passed.push(`Links con UTM tracking: ${linksWithUTM}/${itineramioLinks.length} ✅`)
    } else {
      report.warnings.push(`Links con UTM: ${linksWithUTM}/${itineramioLinks.length} ⚠️ (algunos links sin UTM)`)
    }
  }

  // ============================================
  // 4. VALIDACIÓN DE IMAGEN COVER
  // ============================================

  log('magenta', '\n🖼️  4. VALIDACIÓN DE IMAGEN\n')

  if (article.coverImage) {
    report.passed.push(`Cover image: presente ✅`)

    if (article.coverImageAlt) {
      report.passed.push(`Cover image alt text: presente ✅`)
    } else {
      report.warnings.push(`Cover image alt text: falta ⚠️`)
    }
  } else {
    report.errors.push(`Cover image: falta ❌`)
  }

  // ============================================
  // 5. INFORMACIÓN ADICIONAL
  // ============================================

  log('magenta', '\n📌 5. INFORMACIÓN ADICIONAL\n')

  report.info.push(`Categoría: ${article.category}`)
  report.info.push(`Tags: ${article.tags.join(', ')}`)
  report.info.push(`Estado: ${article.status}`)
  report.info.push(`Featured: ${article.featured ? 'Sí' : 'No'}`)
  report.info.push(`Tiempo de lectura: ${article.readTime} minutos`)
  report.info.push(`Fecha publicación: ${article.publishedAt ? article.publishedAt.toLocaleDateString('es-ES') : 'No publicado'}`)
  report.info.push(`Visitas: ${article.views}`)
  report.info.push(`Slug: ${article.slug}`)

  // ============================================
  // GENERAR REPORTE
  // ============================================

  console.log('\n' + '='.repeat(80))
  log('blue', '\n📊 REPORTE DE VALIDACIÓN\n')

  if (report.passed.length > 0) {
    log('green', '✅ PASSED (' + report.passed.length + ' checks):')
    report.passed.forEach(msg => console.log(`   ${msg}`))
  }

  if (report.warnings.length > 0) {
    log('yellow', '\n⚠️  WARNINGS (' + report.warnings.length + ' issues):')
    report.warnings.forEach(msg => console.log(`   ${msg}`))
  }

  if (report.errors.length > 0) {
    log('red', '\n❌ ERRORS (' + report.errors.length + ' issues):')
    report.errors.forEach(msg => console.log(`   ${msg}`))
  }

  if (report.info.length > 0) {
    log('blue', '\nℹ️  INFO:')
    report.info.forEach(msg => console.log(`   ${msg}`))
  }

  // ============================================
  // CALCULAR SCORE
  // ============================================

  const totalChecks = report.passed.length + report.warnings.length + report.errors.length
  const score = Math.round((report.passed.length / totalChecks) * 100)

  console.log('\n' + '='.repeat(80))
  log('blue', `\n🎯 QUALITY SCORE: ${score}/100\n`)

  if (score >= 90) {
    log('green', '✅ EXCELENTE - Listo para publicar!')
    log('green', '   El artículo cumple con todos los estándares de calidad.')
  } else if (score >= 75) {
    log('green', '✅ BUENO - Publicar con ajustes menores')
    log('yellow', '   Revisa los warnings antes de publicar.')
  } else if (score >= 60) {
    log('yellow', '⚠️  MEJORABLE - Revisar antes de publicar')
    log('yellow', '   Corrige los errores y varios warnings.')
  } else {
    log('red', '❌ NO LISTO - Reescribir o regenerar')
    log('red', '   Demasiados errores. Considera regenerar el artículo.')
  }

  console.log()

  // ============================================
  // RECOMENDACIONES
  // ============================================

  if (report.errors.length > 0 || report.warnings.length > 3) {
    log('blue', '💡 RECOMENDACIONES:\n')

    if (wordCount < 2500) {
      console.log('   • Amplía el contenido a mínimo 2,500 palabras')
    }
    if (h2Count < 10) {
      console.log('   • Añade más secciones H2 (objetivo: 10+)')
    }
    if (totalCTAs < 3) {
      console.log('   • Añade CTAs de newsletter (inline, trial, box)')
    }
    if (!article.metaTitle || metaTitleLength < 50) {
      console.log('   • Optimiza el Meta Title (50-60 caracteres)')
    }
    if (!article.metaDescription || metaDescLength < 150) {
      console.log('   • Optimiza la Meta Description (150-160 caracteres)')
    }
    if (externalLinks < 2) {
      console.log('   • Añade links externos a fuentes autorizadas')
    }

    console.log()
  }

  console.log('='.repeat(80) + '\n')

  await prisma.$disconnect()

  // Exit code basado en score
  process.exit(score >= 75 ? 0 : 1)
}

// Main
const slug = process.argv[2]

if (!slug) {
  log('red', 'Error: Debes proporcionar el slug del artículo\n')
  console.log('Uso:')
  console.log('  node scripts/validate-article.js <article-slug>\n')
  console.log('Ejemplo:')
  console.log('  node scripts/validate-article.js manual-digital-apartamento-turistico-plantilla-completa-2025\n')
  process.exit(1)
}

validateArticle(slug).catch(error => {
  log('red', '\n❌ Error ejecutando validación:')
  console.error(error)
  process.exit(1)
})
