/**
 * Script de Verificación de Renderizado de Artículos del Blog
 *
 * Este script verifica que todos los artículos del blog se rendericen correctamente
 * sin errores de formato, detectando:
 * - Clases Tailwind sin convertir (class="...")
 * - Código HTML visible como texto
 * - Estilos inline correctos
 * - Imágenes rotas o referencias faltantes
 * - Contenido vacío o muy corto
 * - Caracteres especiales mal codificados
 */

import { prisma } from '../src/lib/prisma'

interface RenderingIssue {
  type: 'critical' | 'high' | 'medium' | 'low'
  category: string
  message: string
  details?: string
}

interface ArticleReport {
  id: string
  slug: string
  title: string
  status: string
  contentType: 'html' | 'markdown'
  contentLength: number
  publishedAt: Date | null
  issues: RenderingIssue[]
}

const REPORTS: ArticleReport[] = []

/**
 * Determina si el contenido es HTML o Markdown
 * Basado en la lógica de page.tsx línea 293
 */
function detectContentType(content: string): 'html' | 'markdown' {
  const trimmed = content.trim()
  if (trimmed.startsWith('<') || content.includes('style=')) {
    return 'html'
  }
  return 'markdown'
}

/**
 * Verifica si hay clases Tailwind sin convertir
 */
function checkUnconvertedTailwind(content: string): RenderingIssue | null {
  const classMatches = content.match(/class="[^"]*"/g)

  if (classMatches && classMatches.length > 0) {
    // Filtrar clases que son válidas en HTML renderizado
    const suspiciousClasses = classMatches.filter(match => {
      // Si tiene clases Tailwind típicas, es sospechoso
      return match.includes('class="') && (
        match.includes('bg-') ||
        match.includes('text-') ||
        match.includes('px-') ||
        match.includes('py-') ||
        match.includes('mx-') ||
        match.includes('my-') ||
        match.includes('flex-') ||
        match.includes('grid-') ||
        match.includes('w-') ||
        match.includes('h-') ||
        match.includes('rounded-') ||
        match.includes('shadow-')
      )
    })

    if (suspiciousClasses.length > 0) {
      return {
        type: 'high',
        category: 'Clases Tailwind sin convertir',
        message: `Encontradas ${suspiciousClasses.length} clases Tailwind en el HTML`,
        details: suspiciousClasses.slice(0, 3).join(', ') + (suspiciousClasses.length > 3 ? '...' : '')
      }
    }
  }

  return null
}

/**
 * Verifica si hay código HTML visible como texto
 * (etiquetas HTML escapadas o renderizadas como texto)
 */
function checkVisibleHtml(content: string): RenderingIssue | null {
  const htmlEntityPattern = /&lt;[a-z]+[^&]*&gt;/gi
  const matches = content.match(htmlEntityPattern)

  if (matches && matches.length > 0) {
    return {
      type: 'critical',
      category: 'HTML visible como texto',
      message: `Encontradas ${matches.length} etiquetas HTML escapadas`,
      details: matches.slice(0, 3).join(', ') + (matches.length > 3 ? '...' : '')
    }
  }

  return null
}

/**
 * Verifica referencias a imágenes
 */
function checkImages(content: string): RenderingIssue | null {
  const issues: string[] = []

  // Buscar referencias a imágenes
  const imgTagMatches = content.match(/<img[^>]+>/gi) || []
  const mdImageMatches = content.match(/!\[.*?\]\(.*?\)/g) || []

  const totalImages = imgTagMatches.length + mdImageMatches.length

  if (totalImages === 0) {
    return null // No hay imágenes, no es un problema
  }

  // Verificar imágenes HTML sin alt
  const imgsWithoutAlt = imgTagMatches.filter(img => !img.includes('alt='))
  if (imgsWithoutAlt.length > 0) {
    issues.push(`${imgsWithoutAlt.length} imágenes sin atributo alt`)
  }

  // Verificar rutas relativas sospechosas
  const suspiciousUrls = [
    ...content.match(/src="(?!http|https|\/\/|data:)[^"]+"/gi) || [],
    ...content.match(/\]\((?!http|https|\/\/)[^\)]+\)/g) || []
  ]

  if (suspiciousUrls.length > 0) {
    issues.push(`${suspiciousUrls.length} rutas de imagen potencialmente rotas`)
  }

  if (issues.length > 0) {
    return {
      type: 'medium',
      category: 'Problemas con imágenes',
      message: issues.join(', '),
      details: suspiciousUrls.slice(0, 2).join(', ')
    }
  }

  return null
}

/**
 * Verifica contenido vacío o muy corto
 */
function checkContentLength(content: string, excerpt: string): RenderingIssue | null {
  const textContent = content
    .replace(/<[^>]+>/g, '') // Quitar HTML
    .replace(/[#*_\[\]()]/g, '') // Quitar markdown
    .trim()

  const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length

  if (wordCount === 0) {
    return {
      type: 'critical',
      category: 'Contenido vacío',
      message: 'El artículo no tiene contenido'
    }
  }

  if (wordCount < 50) {
    return {
      type: 'high',
      category: 'Contenido muy corto',
      message: `Solo ${wordCount} palabras`,
      details: 'Posible error de importación o artículo incompleto'
    }
  }

  if (wordCount < 150) {
    return {
      type: 'medium',
      category: 'Contenido corto',
      message: `Solo ${wordCount} palabras`,
      details: 'Artículo potencialmente muy breve para SEO'
    }
  }

  return null
}

/**
 * Verifica caracteres especiales mal codificados
 */
function checkEncoding(content: string): RenderingIssue | null {
  const issues: string[] = []

  // Patrones comunes de mal encoding
  const badEncodingPatterns = [
    { pattern: /Ã±/g, name: 'ñ mal codificada (Ã±)' },
    { pattern: /Ã¡/g, name: 'á mal codificada (Ã¡)' },
    { pattern: /Ã©/g, name: 'é mal codificada (Ã©)' },
    { pattern: /Ã­/g, name: 'í mal codificada (Ã­)' },
    { pattern: /Ã³/g, name: 'ó mal codificada (Ã³)' },
    { pattern: /Ãº/g, name: 'ú mal codificada (Ãº)' },
    { pattern: /â€œ|â€�/g, name: 'Comillas mal codificadas' },
    { pattern: /â€"/g, name: 'Guión largo mal codificado' },
  ]

  for (const { pattern, name } of badEncodingPatterns) {
    const matches = content.match(pattern)
    if (matches && matches.length > 0) {
      issues.push(`${name} (${matches.length} veces)`)
    }
  }

  if (issues.length > 0) {
    return {
      type: 'high',
      category: 'Caracteres mal codificados',
      message: issues.join(', '),
      details: 'Problemas de encoding UTF-8'
    }
  }

  return null
}

/**
 * Verifica estilos inline
 */
function checkInlineStyles(content: string, contentType: 'html' | 'markdown'): RenderingIssue | null {
  if (contentType === 'markdown') {
    return null // Los estilos inline solo aplican a HTML
  }

  const styleMatches = content.match(/style="[^"]*"/g) || []

  if (styleMatches.length > 50) {
    return {
      type: 'low',
      category: 'Muchos estilos inline',
      message: `${styleMatches.length} estilos inline encontrados`,
      details: 'Podría dificultar el mantenimiento'
    }
  }

  // Verificar estilos potencialmente problemáticos
  const problematicStyles = styleMatches.filter(style =>
    style.includes('position: absolute') ||
    style.includes('z-index:') ||
    style.includes('!important')
  )

  if (problematicStyles.length > 0) {
    return {
      type: 'medium',
      category: 'Estilos inline problemáticos',
      message: `${problematicStyles.length} estilos que podrían causar problemas de layout`,
      details: problematicStyles.slice(0, 2).join(', ')
    }
  }

  return null
}

/**
 * Verifica estructura de encabezados
 */
function checkHeadingStructure(content: string): RenderingIssue | null {
  // Verificar que no haya saltos en jerarquía de encabezados
  const htmlHeadings = content.match(/<h([1-6])[^>]*>/gi) || []
  const mdHeadings = content.match(/^#{1,6}\s/gm) || []

  const totalHeadings = htmlHeadings.length + mdHeadings.length

  if (totalHeadings === 0) {
    return {
      type: 'low',
      category: 'Sin encabezados',
      message: 'El artículo no tiene encabezados internos',
      details: 'Podría afectar la legibilidad y SEO'
    }
  }

  return null
}

/**
 * Verifica un artículo completo
 */
async function verifyArticle(article: any): Promise<ArticleReport> {
  const contentType = detectContentType(article.content)
  const issues: RenderingIssue[] = []

  // Ejecutar todas las verificaciones
  const checks = [
    checkUnconvertedTailwind(article.content),
    checkVisibleHtml(article.content),
    checkImages(article.content),
    checkContentLength(article.content, article.excerpt),
    checkEncoding(article.content),
    checkInlineStyles(article.content, contentType),
    checkHeadingStructure(article.content),
  ]

  // Filtrar y agregar issues no nulos
  checks.forEach(issue => {
    if (issue) {
      issues.push(issue)
    }
  })

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    status: article.status,
    contentType,
    contentLength: article.content.length,
    publishedAt: article.publishedAt,
    issues
  }
}

/**
 * Genera el reporte en formato Markdown
 */
function generateReport(): string {
  const now = new Date().toLocaleString('es-ES', {
    dateStyle: 'full',
    timeStyle: 'short'
  })

  let markdown = `# Reporte de Verificación de Renderizado del Blog\n\n`
  markdown += `**Fecha de generación:** ${now}\n\n`
  markdown += `**Total de artículos analizados:** ${REPORTS.length}\n\n`

  // Resumen general
  const articlesWithIssues = REPORTS.filter(r => r.issues.length > 0)
  const articlesOk = REPORTS.filter(r => r.issues.length === 0)

  markdown += `## Resumen Ejecutivo\n\n`
  markdown += `- ✅ Artículos sin problemas: **${articlesOk.length}**\n`
  markdown += `- ⚠️  Artículos con problemas: **${articlesWithIssues.length}**\n\n`

  // Estadísticas por tipo de contenido
  const htmlArticles = REPORTS.filter(r => r.contentType === 'html')
  const mdArticles = REPORTS.filter(r => r.contentType === 'markdown')

  markdown += `### Por tipo de contenido\n\n`
  markdown += `- **HTML:** ${htmlArticles.length} artículos\n`
  markdown += `- **Markdown:** ${mdArticles.length} artículos\n\n`

  // Estadísticas por severidad
  const criticalIssues = REPORTS.flatMap(r => r.issues).filter(i => i.type === 'critical')
  const highIssues = REPORTS.flatMap(r => r.issues).filter(i => i.type === 'high')
  const mediumIssues = REPORTS.flatMap(r => r.issues).filter(i => i.type === 'medium')
  const lowIssues = REPORTS.flatMap(r => r.issues).filter(i => i.type === 'low')

  markdown += `### Por severidad\n\n`
  markdown += `- 🔴 **Críticos:** ${criticalIssues.length} problemas\n`
  markdown += `- 🟠 **Altos:** ${highIssues.length} problemas\n`
  markdown += `- 🟡 **Medios:** ${mediumIssues.length} problemas\n`
  markdown += `- 🔵 **Bajos:** ${lowIssues.length} problemas\n\n`

  // Artículos con problemas críticos
  const criticalArticles = REPORTS.filter(r =>
    r.issues.some(i => i.type === 'critical')
  )

  if (criticalArticles.length > 0) {
    markdown += `## 🔴 Problemas Críticos (Acción Inmediata Requerida)\n\n`

    for (const article of criticalArticles) {
      const critical = article.issues.filter(i => i.type === 'critical')
      markdown += `### ${article.title}\n\n`
      markdown += `- **Slug:** \`${article.slug}\`\n`
      markdown += `- **Estado:** ${article.status}\n`
      markdown += `- **Tipo de contenido:** ${article.contentType}\n`
      markdown += `- **Publicado:** ${article.publishedAt ? article.publishedAt.toLocaleDateString('es-ES') : 'No publicado'}\n\n`
      markdown += `**Problemas críticos:**\n\n`

      for (const issue of critical) {
        markdown += `- **${issue.category}:** ${issue.message}\n`
        if (issue.details) {
          markdown += `  - Detalles: ${issue.details}\n`
        }
      }
      markdown += `\n`
    }
  }

  // Artículos con problemas altos
  const highArticles = REPORTS.filter(r =>
    r.issues.some(i => i.type === 'high') && !r.issues.some(i => i.type === 'critical')
  )

  if (highArticles.length > 0) {
    markdown += `## 🟠 Problemas Altos (Corrección Prioritaria)\n\n`

    for (const article of highArticles) {
      const high = article.issues.filter(i => i.type === 'high')
      markdown += `### ${article.title}\n\n`
      markdown += `- **Slug:** \`${article.slug}\`\n`
      markdown += `- **Estado:** ${article.status}\n`
      markdown += `- **Tipo de contenido:** ${article.contentType}\n\n`
      markdown += `**Problemas:**\n\n`

      for (const issue of high) {
        markdown += `- **${issue.category}:** ${issue.message}\n`
        if (issue.details) {
          markdown += `  - ${issue.details}\n`
        }
      }
      markdown += `\n`
    }
  }

  // Clases Tailwind sin convertir (lista completa)
  const tailwindArticles = REPORTS.filter(r =>
    r.issues.some(i => i.category === 'Clases Tailwind sin convertir')
  )

  if (tailwindArticles.length > 0) {
    markdown += `## 🎨 Artículos con Clases Tailwind sin Convertir\n\n`
    markdown += `Total: **${tailwindArticles.length}** artículos\n\n`

    for (const article of tailwindArticles) {
      const issue = article.issues.find(i => i.category === 'Clases Tailwind sin convertir')!
      markdown += `- **${article.title}** (\`${article.slug}\`)\n`
      markdown += `  - ${issue.message}\n`
      if (issue.details) {
        markdown += `  - Ejemplos: ${issue.details}\n`
      }
    }
    markdown += `\n`
  }

  // HTML visible como texto
  const htmlVisibleArticles = REPORTS.filter(r =>
    r.issues.some(i => i.category === 'HTML visible como texto')
  )

  if (htmlVisibleArticles.length > 0) {
    markdown += `## 📄 Artículos con HTML Visible como Texto\n\n`

    for (const article of htmlVisibleArticles) {
      const issue = article.issues.find(i => i.category === 'HTML visible como texto')!
      markdown += `- **${article.title}** (\`${article.slug}\`)\n`
      markdown += `  - ${issue.message}\n`
      if (issue.details) {
        markdown += `  - ${issue.details}\n`
      }
    }
    markdown += `\n`
  }

  // Artículos con contenido muy corto
  const shortArticles = REPORTS.filter(r =>
    r.issues.some(i => i.category === 'Contenido vacío' || i.category === 'Contenido muy corto')
  )

  if (shortArticles.length > 0) {
    markdown += `## 📏 Artículos Vacíos o Muy Cortos\n\n`

    for (const article of shortArticles) {
      const issue = article.issues.find(i =>
        i.category === 'Contenido vacío' || i.category === 'Contenido muy corto'
      )!
      markdown += `- **${article.title}** (\`${article.slug}\`)\n`
      markdown += `  - ${issue.message}\n`
      if (issue.details) {
        markdown += `  - ${issue.details}\n`
      }
    }
    markdown += `\n`
  }

  // Problemas medios
  const mediumArticles = REPORTS.filter(r =>
    r.issues.some(i => i.type === 'medium') &&
    !r.issues.some(i => i.type === 'critical' || i.type === 'high')
  )

  if (mediumArticles.length > 0) {
    markdown += `## 🟡 Problemas Medios (Mejorar cuando sea posible)\n\n`

    for (const article of mediumArticles) {
      const medium = article.issues.filter(i => i.type === 'medium')
      markdown += `### ${article.title}\n\n`
      markdown += `- **Slug:** \`${article.slug}\`\n`
      markdown += `- **Problemas:** ${medium.map(i => i.category).join(', ')}\n\n`
    }
  }

  // Artículos sin problemas
  if (articlesOk.length > 0) {
    markdown += `## ✅ Artículos sin Problemas\n\n`
    markdown += `Total: **${articlesOk.length}** artículos\n\n`

    for (const article of articlesOk) {
      markdown += `- ${article.title} (\`${article.slug}\`) - ${article.contentType.toUpperCase()}\n`
    }
    markdown += `\n`
  }

  // Recomendaciones
  markdown += `## 💡 Recomendaciones\n\n`

  if (criticalArticles.length > 0) {
    markdown += `### Prioridad 1: Crítico\n\n`
    markdown += `1. Corregir **${criticalArticles.length}** artículos con problemas críticos\n`
    markdown += `   - Artículos con contenido vacío o HTML mal renderizado\n`
    markdown += `   - Estos problemas impiden que el contenido se muestre correctamente\n\n`
  }

  if (highArticles.length > 0 || tailwindArticles.length > 0) {
    markdown += `### Prioridad 2: Alta\n\n`
    markdown += `1. Corregir **${highArticles.length}** artículos con problemas altos\n`
    if (tailwindArticles.length > 0) {
      markdown += `2. Convertir clases Tailwind en **${tailwindArticles.length}** artículos\n`
      markdown += `   - Esto mejorará significativamente la presentación visual\n`
    }
    markdown += `\n`
  }

  if (mediumArticles.length > 0) {
    markdown += `### Prioridad 3: Media\n\n`
    markdown += `1. Revisar **${mediumArticles.length}** artículos con problemas medios\n`
    markdown += `   - Problemas que no impiden la visualización pero pueden mejorar la experiencia\n\n`
  }

  markdown += `## 📊 Detalles Técnicos\n\n`
  markdown += `### Lógica de Detección de Tipo de Contenido\n\n`
  markdown += `Según \`/app/(public)/blog/[slug]/page.tsx\` línea 293:\n\n`
  markdown += `\`\`\`typescript\n`
  markdown += `post.content.trim().startsWith('<') || post.content.includes('style=')\n`
  markdown += `  ? post.content  // Se trata como HTML\n`
  markdown += `  : markdownToHtml(post.content)  // Se convierte de Markdown\n`
  markdown += `\`\`\`\n\n`
  markdown += `**Importante:** Esta lógica puede causar falsos positivos si:\n`
  markdown += `- Un artículo Markdown empieza con un símbolo '<'\n`
  markdown += `- Un artículo Markdown contiene ejemplos de código con 'style='\n\n`

  return markdown
}

/**
 * Función principal
 */
async function main() {
  console.log('🔍 Iniciando verificación de artículos del blog...\n')

  try {
    // Obtener TODOS los artículos del blog
    const articles = await prisma.blogPost.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        status: true,
        publishedAt: true,
        category: true,
        views: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📚 Total de artículos encontrados: ${articles.length}\n`)

    // Verificar cada artículo
    for (const article of articles) {
      console.log(`Verificando: ${article.title}...`)
      const report = await verifyArticle(article)
      REPORTS.push(report)

      if (report.issues.length > 0) {
        const critical = report.issues.filter(i => i.type === 'critical').length
        const high = report.issues.filter(i => i.type === 'high').length
        const medium = report.issues.filter(i => i.type === 'medium').length
        const low = report.issues.filter(i => i.type === 'low').length

        console.log(`  ⚠️  ${report.issues.length} problemas encontrados:`)
        if (critical > 0) console.log(`     🔴 ${critical} críticos`)
        if (high > 0) console.log(`     🟠 ${high} altos`)
        if (medium > 0) console.log(`     🟡 ${medium} medios`)
        if (low > 0) console.log(`     🔵 ${low} bajos`)
      } else {
        console.log(`  ✅ Sin problemas`)
      }
    }

    // Generar reporte
    console.log(`\n📝 Generando reporte...`)
    const reportMarkdown = generateReport()

    // Guardar reporte
    const fs = require('fs')
    const reportPath = '/tmp/blog-rendering-report.md'
    fs.writeFileSync(reportPath, reportMarkdown, 'utf-8')

    console.log(`\n✅ Reporte generado exitosamente en: ${reportPath}`)
    console.log(`\n📊 Resumen:`)
    console.log(`   - Total artículos: ${REPORTS.length}`)
    console.log(`   - Con problemas: ${REPORTS.filter(r => r.issues.length > 0).length}`)
    console.log(`   - Sin problemas: ${REPORTS.filter(r => r.issues.length === 0).length}`)

  } catch (error) {
    console.error('❌ Error durante la verificación:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
main()
