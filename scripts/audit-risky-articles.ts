import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Patrones de riesgo a buscar
const riskyPatterns = [
  // Cifras específicas de ingresos
  { pattern: /\d+[.,]?\d*\s*€\/mes/gi, type: 'INGRESO_MENSUAL', risk: 'ALTO' },
  { pattern: /gana[rn]?\s+\d+[.,]?\d*\s*€/gi, type: 'PROMESA_INGRESOS', risk: 'CRITICO' },
  { pattern: /de\s+\d+[.,]?\d*€?\s+a\s+\d+[.,]?\d*€/gi, type: 'RANGO_INGRESOS', risk: 'ALTO' },

  // Porcentajes sin fuente
  { pattern: /el\s+\d{2,3}%\s+de\s+(los\s+)?(anfitriones|hosts|propietarios)/gi, type: 'PORCENTAJE_SIN_FUENTE', risk: 'ALTO' },
  { pattern: /\d{2,3}%\s+de\s+(las\s+)?(malas\s+)?reviews?/gi, type: 'PORCENTAJE_SIN_FUENTE', risk: 'ALTO' },
  { pattern: /reduce[n]?\s+(hasta\s+(el\s+)?)?\d{2,3}%/gi, type: 'PROMESA_REDUCCION', risk: 'ALTO' },
  { pattern: /aumenta[rn]?\s+(hasta\s+)?(un\s+)?\d{2,3}%/gi, type: 'PROMESA_AUMENTO', risk: 'ALTO' },

  // Promesas de tiempo
  { pattern: /de\s+\d+h?\s*\/?\s*semana\s+a\s+\d+h?/gi, type: 'PROMESA_TIEMPO', risk: 'ALTO' },
  { pattern: /ahorra[rn]?\s+\d+\s*h(oras)?/gi, type: 'PROMESA_AHORRO_TIEMPO', risk: 'MEDIO' },
  { pattern: /recupera[rn]?\s+\d+\s*h(oras)?/gi, type: 'PROMESA_AHORRO_TIEMPO', risk: 'MEDIO' },

  // Casos de estudio potencialmente ficticios
  { pattern: /caso\s+(real|de\s+éxito):\s*\w+/gi, type: 'CASO_ESTUDIO', risk: 'MEDIO' },
  { pattern: /historia\s+real/gi, type: 'CASO_ESTUDIO', risk: 'ALTO' },
  { pattern: /\[historia\s+real/gi, type: 'CASO_ESTUDIO', risk: 'ALTO' },

  // ROI y métricas específicas
  { pattern: /ROI[:\s]+\d+%/gi, type: 'ROI_ESPECIFICO', risk: 'ALTO' },
  { pattern: /retorno\s+de\s+\d+%/gi, type: 'ROI_ESPECIFICO', risk: 'ALTO' },

  // Comparativas sesgadas
  { pattern: /itineramio\s*\(recomendad[oa]\)/gi, type: 'SESGO_COMERCIAL', risk: 'MEDIO' },
  { pattern: /recomendamos?\s+itineramio/gi, type: 'SESGO_COMERCIAL', risk: 'MEDIO' },

  // Evita el X%
  { pattern: /evita[rn]?\s+(el\s+)?\d{2,3}%/gi, type: 'PROMESA_PREVENCION', risk: 'ALTO' },
]

interface Finding {
  pattern: string
  type: string
  risk: string
  matches: string[]
  context: string[]
}

interface ArticleAudit {
  id: string
  slug: string
  title: string
  published: boolean
  findings: Finding[]
  riskLevel: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO'
}

async function auditArticles() {
  console.log('🔍 Iniciando auditoría de artículos...\n')

  const articles = await prisma.blogArticle.findMany({
    where: { published: true },
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
      excerpt: true,
      metaTitle: true,
      metaDescription: true,
      published: true
    }
  })

  console.log(`📚 Encontrados ${articles.length} artículos publicados\n`)

  const auditResults: ArticleAudit[] = []

  for (const article of articles) {
    const fullText = `${article.title} ${article.excerpt || ''} ${article.content || ''} ${article.metaTitle || ''} ${article.metaDescription || ''}`

    const findings: Finding[] = []

    for (const { pattern, type, risk } of riskyPatterns) {
      const matches = fullText.match(pattern)
      if (matches && matches.length > 0) {
        // Get context for each match
        const contexts: string[] = []
        for (const match of matches.slice(0, 3)) { // Max 3 contexts
          const idx = fullText.toLowerCase().indexOf(match.toLowerCase())
          if (idx !== -1) {
            const start = Math.max(0, idx - 50)
            const end = Math.min(fullText.length, idx + match.length + 50)
            contexts.push('...' + fullText.slice(start, end).replace(/\n/g, ' ') + '...')
          }
        }

        findings.push({
          pattern: pattern.source,
          type,
          risk,
          matches: [...new Set(matches)], // Unique matches
          context: contexts
        })
      }
    }

    if (findings.length > 0) {
      // Determine overall risk level
      let riskLevel: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO' = 'BAJO'
      if (findings.some(f => f.risk === 'CRITICO')) riskLevel = 'CRITICO'
      else if (findings.some(f => f.risk === 'ALTO')) riskLevel = 'ALTO'
      else if (findings.some(f => f.risk === 'MEDIO')) riskLevel = 'MEDIO'

      auditResults.push({
        id: article.id,
        slug: article.slug,
        title: article.title,
        published: article.published,
        findings,
        riskLevel
      })
    }
  }

  // Sort by risk level
  const riskOrder = { 'CRITICO': 0, 'ALTO': 1, 'MEDIO': 2, 'BAJO': 3 }
  auditResults.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel])

  // Print report
  console.log('=' .repeat(80))
  console.log('📊 REPORTE DE AUDITORÍA - ARTÍCULOS CON RIESGO DE CREDIBILIDAD')
  console.log('=' .repeat(80))
  console.log('')

  const criticalCount = auditResults.filter(a => a.riskLevel === 'CRITICO').length
  const highCount = auditResults.filter(a => a.riskLevel === 'ALTO').length
  const mediumCount = auditResults.filter(a => a.riskLevel === 'MEDIO').length

  console.log(`🔴 CRÍTICO: ${criticalCount} artículos`)
  console.log(`🟠 ALTO: ${highCount} artículos`)
  console.log(`🟡 MEDIO: ${mediumCount} artículos`)
  console.log(`✅ SIN RIESGO: ${articles.length - auditResults.length} artículos`)
  console.log('')

  for (const result of auditResults) {
    const emoji = result.riskLevel === 'CRITICO' ? '🔴' : result.riskLevel === 'ALTO' ? '🟠' : '🟡'
    console.log('-'.repeat(80))
    console.log(`${emoji} [${result.riskLevel}] ${result.title}`)
    console.log(`   Slug: ${result.slug}`)
    console.log(`   URL: /blog/${result.slug}`)
    console.log('')

    for (const finding of result.findings) {
      console.log(`   📌 ${finding.type} (${finding.risk})`)
      console.log(`      Encontrado: ${finding.matches.slice(0, 3).join(', ')}`)
      if (finding.context.length > 0) {
        console.log(`      Contexto: ${finding.context[0].slice(0, 150)}...`)
      }
      console.log('')
    }
  }

  console.log('=' .repeat(80))
  console.log('📋 RESUMEN DE ACCIONES REQUERIDAS')
  console.log('=' .repeat(80))

  // Group by type
  const byType: Record<string, string[]> = {}
  for (const result of auditResults) {
    for (const finding of result.findings) {
      if (!byType[finding.type]) byType[finding.type] = []
      if (!byType[finding.type].includes(result.slug)) {
        byType[finding.type].push(result.slug)
      }
    }
  }

  console.log('')
  for (const [type, slugs] of Object.entries(byType)) {
    console.log(`${type}: ${slugs.length} artículos`)
    slugs.forEach(s => console.log(`  - ${s}`))
    console.log('')
  }

  return auditResults
}

auditArticles()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
