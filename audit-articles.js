const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

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

  // ROI y métricas específicas
  { pattern: /ROI[:\s]+\d+%/gi, type: 'ROI_ESPECIFICO', risk: 'ALTO' },

  // Comparativas sesgadas
  { pattern: /itineramio\s*\(recomendad[oa]\)/gi, type: 'SESGO_COMERCIAL', risk: 'MEDIO' },

  // Evita el X%
  { pattern: /evita[rn]?\s+(el\s+)?\d{2,3}%/gi, type: 'PROMESA_PREVENCION', risk: 'ALTO' },
]

async function main() {
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

  const auditResults = []

  for (const article of articles) {
    const fullText = `${article.title} ${article.excerpt || ''} ${article.content || ''} ${article.metaTitle || ''} ${article.metaDescription || ''}`

    const findings = []

    for (const { pattern, type, risk } of riskyPatterns) {
      const matches = fullText.match(pattern)
      if (matches && matches.length > 0) {
        const contexts = []
        for (const match of matches.slice(0, 2)) {
          const idx = fullText.toLowerCase().indexOf(match.toLowerCase())
          if (idx !== -1) {
            const start = Math.max(0, idx - 40)
            const end = Math.min(fullText.length, idx + match.length + 40)
            contexts.push('...' + fullText.slice(start, end).replace(/\n/g, ' ').replace(/<[^>]+>/g, '') + '...')
          }
        }

        findings.push({
          type,
          risk,
          matches: [...new Set(matches)].slice(0, 3),
          context: contexts[0] || ''
        })
      }
    }

    if (findings.length > 0) {
      let riskLevel = 'BAJO'
      if (findings.some(f => f.risk === 'CRITICO')) riskLevel = 'CRITICO'
      else if (findings.some(f => f.risk === 'ALTO')) riskLevel = 'ALTO'
      else if (findings.some(f => f.risk === 'MEDIO')) riskLevel = 'MEDIO'

      auditResults.push({
        slug: article.slug,
        title: article.title,
        findings,
        riskLevel
      })
    }
  }

  // Sort by risk level
  const riskOrder = { 'CRITICO': 0, 'ALTO': 1, 'MEDIO': 2, 'BAJO': 3 }
  auditResults.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel])

  // Print report
  console.log('='.repeat(80))
  console.log('📊 REPORTE DE AUDITORÍA - ARTÍCULOS CON RIESGO DE CREDIBILIDAD')
  console.log('='.repeat(80))
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
    console.log('')

    for (const finding of result.findings) {
      console.log(`   📌 ${finding.type} (${finding.risk})`)
      console.log(`      Encontrado: ${finding.matches.join(', ')}`)
      if (finding.context) {
        console.log(`      Contexto: ${finding.context.slice(0, 120)}...`)
      }
      console.log('')
    }
  }

  return auditResults
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
