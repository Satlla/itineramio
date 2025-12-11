import { prisma } from '../src/lib/prisma'

async function main() {
  const articles = await prisma.blogPost.findMany({
    select: {
      slug: true,
      title: true,
      content: true,
      status: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  console.log('ANÁLISIS DETALLADO DE TODOS LOS ARTÍCULOS\n')
  console.log('='.repeat(100))

  for (const article of articles) {
    const contentWithoutHtml = article.content
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    const wordCount = contentWithoutHtml.split(/\s+/).filter(w => w.length > 0).length

    // Detectar si es solo enlaces relacionados
    const isOnlyRelatedLinks = article.content.includes('Artículos Relacionados') &&
                                !article.content.includes('<p>') &&
                                !article.content.includes('<h2>') &&
                                wordCount < 30

    const status = wordCount < 50 ? '🔴 MUY CORTO' :
                   wordCount < 150 ? '🟡 CORTO' :
                   '✅ OK'

    console.log(`\n${status} | ${article.slug}`)
    console.log(`Título: ${article.title}`)
    console.log(`Estado: ${article.status}`)
    console.log(`Palabras: ${wordCount}`)
    console.log(`Longitud HTML: ${article.content.length} caracteres`)

    if (isOnlyRelatedLinks) {
      console.log('⚠️  SOLO CONTIENE ENLACES RELACIONADOS - SIN CONTENIDO REAL')
    }

    if (wordCount < 50) {
      console.log('\nCONTENIDO COMPLETO:')
      console.log('-'.repeat(80))
      console.log(article.content)
      console.log('-'.repeat(80))
    }
  }

  console.log('\n' + '='.repeat(100))

  const summary = {
    total: articles.length,
    veryShort: articles.filter(a => {
      const words = a.content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().split(/\s+/).filter(w => w.length > 0).length
      return words < 50
    }).length,
    short: articles.filter(a => {
      const words = a.content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().split(/\s+/).filter(w => w.length > 0).length
      return words >= 50 && words < 150
    }).length,
    ok: articles.filter(a => {
      const words = a.content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().split(/\s+/).filter(w => w.length > 0).length
      return words >= 150
    }).length
  }

  console.log('\nRESUMEN:')
  console.log(`Total artículos: ${summary.total}`)
  console.log(`🔴 Muy cortos (<50 palabras): ${summary.veryShort}`)
  console.log(`🟡 Cortos (50-149 palabras): ${summary.short}`)
  console.log(`✅ OK (150+ palabras): ${summary.ok}`)
}

main().finally(() => prisma.$disconnect())
