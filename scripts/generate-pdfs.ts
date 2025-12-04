/**
 * Script para generar PDFs de las 8 guías usando Puppeteer
 * Lee los archivos markdown de content/lead-magnets/ y los convierte a PDF
 *
 * Uso:
 * npx tsx scripts/generate-pdfs.ts [slug]
 *
 * Ejemplos:
 * npx tsx scripts/generate-pdfs.ts estratega-5-kpis
 * npx tsx scripts/generate-pdfs.ts all  (genera todas)
 */

import puppeteer from 'puppeteer'
import { readFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { marked } from 'marked'
import {
  LEAD_MAGNETS,
  getAllLeadMagnetSlugs,
  getLeadMagnetBySlug,
  type LeadMagnet,
} from '../src/data/lead-magnets'

const OUTPUT_DIR = join(process.cwd(), 'public', 'downloads')
const CONTENT_DIR = join(process.cwd(), 'content', 'lead-magnets')

// Configurar marked
marked.setOptions({
  breaks: true,
  gfm: true,
})

// Asegurar que el directorio de salida existe
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true })
  console.log('✅ Creado directorio:', OUTPUT_DIR)
}

// Mapeo de archetype a color hex
const COLORS: Record<string, string> = {
  ESTRATEGA: '#3B82F6', // blue
  SISTEMATICO: '#8B5CF6', // violet
  DIFERENCIADOR: '#F97316', // orange
  EJECUTOR: '#EF4444', // red
  RESOLUTOR: '#10B981', // green
  EXPERIENCIAL: '#EC4899', // pink
  EQUILIBRADO: '#14B8A6', // teal
  IMPROVISADOR: '#FCD34D', // yellow
}

// Mapeo de slug a filename markdown
const MARKDOWN_FILES: Record<string, string> = {
  'estratega-5-kpis': 'ESTRATEGA-5-KPIs.md',
  'sistematico-47-tareas': 'SISTEMATICO-47-Tareas.md',
  'diferenciador-storytelling': 'DIFERENCIADOR-Storytelling.md',
  'ejecutor-modo-ceo': 'EJECUTOR-Modo-CEO.md',
  'resolutor-27-crisis': 'RESOLUTOR-27-Situaciones.md',
  'experiencial-corazon-escalable': 'EXPERIENCIAL-Corazon-Escalable.md',
  'equilibrado-versatil-excepcional': 'EQUILIBRADO-Versatil-Excepcional.md',
  'improvisador-kit-anti-caos': 'IMPROVISADOR-Kit-Anti-Caos.md',
}

function getHTMLTemplate(
  content: string,
  leadMagnet: LeadMagnet,
  color: string
): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${leadMagnet.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 11pt;
      line-height: 1.65;
      color: #374151;
      background: white;
    }

    .page {
      width: 210mm;
      padding: 20mm;
      margin: 0 auto;
      background: white;
      position: relative;
    }

    /* Header con logo y branding */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding-bottom: 12px;
      border-bottom: 2px solid ${color};
    }

    .logo {
      font-size: 22pt;
      font-weight: 900;
      color: #8B5CF6;
      letter-spacing: -0.5px;
    }

    .archetype-badge {
      background: ${color};
      color: white;
      padding: 5px 14px;
      border-radius: 20px;
      font-size: 9pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Tipografía */
    h1 {
      font-size: 26pt;
      font-weight: 900;
      color: #1F2937;
      margin: 25px 0 18px 0;
      line-height: 1.2;
      border-left: 5px solid ${color};
      padding-left: 18px;
      page-break-after: avoid;
    }

    h2 {
      font-size: 18pt;
      font-weight: 800;
      color: ${color};
      margin: 22px 0 14px 0;
      line-height: 1.3;
      page-break-after: avoid;
    }

    h3 {
      font-size: 13pt;
      font-weight: 700;
      color: #1F2937;
      margin: 18px 0 11px 0;
      page-break-after: avoid;
    }

    h4 {
      font-size: 11.5pt;
      font-weight: 600;
      color: ${color};
      margin: 14px 0 9px 0;
      page-break-after: avoid;
    }

    p {
      margin: 0 0 11px 0;
      text-align: justify;
      orphans: 3;
      widows: 3;
    }

    /* Listas */
    ul, ol {
      margin: 10px 0 14px 24px;
      padding: 0;
    }

    li {
      margin: 5px 0;
      padding-left: 6px;
      line-height: 1.6;
    }

    ul li::marker {
      color: ${color};
      font-size: 13pt;
    }

    /* Énfasis */
    strong {
      font-weight: 700;
      color: #1F2937;
    }

    em {
      font-style: italic;
      color: ${color};
    }

    /* Cajas destacadas */
    blockquote {
      background: linear-gradient(135deg, #F9FAFB 0%, #FEF3C7 100%);
      border-left: 4px solid ${color};
      padding: 18px 22px;
      margin: 18px 0;
      border-radius: 7px;
      font-style: italic;
      page-break-inside: avoid;
      font-size: 10.5pt;
    }

    /* Código y ejemplos */
    code {
      background: #F3F4F6;
      padding: 2px 5px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 9.5pt;
      color: ${color};
    }

    pre {
      background: #F9FAFB;
      padding: 14px;
      border-radius: 7px;
      overflow-x: auto;
      margin: 14px 0;
      border: 1px solid #E5E7EB;
      page-break-inside: avoid;
    }

    pre code {
      background: transparent;
      padding: 0;
    }

    /* Tablas */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 18px 0;
      font-size: 9.5pt;
      page-break-inside: avoid;
    }

    th {
      background: ${color};
      color: white;
      padding: 11px;
      text-align: left;
      font-weight: 600;
      font-size: 10pt;
    }

    td {
      padding: 9px 11px;
      border-bottom: 1px solid #E5E7EB;
    }

    tr:nth-child(even) {
      background: #F9FAFB;
    }

    /* Separadores */
    hr {
      border: none;
      border-top: 2px solid ${color};
      margin: 25px 0;
      opacity: 0.3;
    }

    /* Footer */
    .footer {
      position: fixed;
      bottom: 13mm;
      left: 20mm;
      right: 20mm;
      text-align: center;
      font-size: 8.5pt;
      color: #9CA3AF;
      padding-top: 9px;
      border-top: 1px solid #E5E7EB;
    }

    .footer a {
      color: ${color};
      text-decoration: none;
      font-weight: 600;
    }

    /* Evitar rupturas de página problemáticas */
    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid;
    }

    ul, ol, table, blockquote, pre {
      page-break-inside: avoid;
    }

    /* Primera página especial (portada) */
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 250mm;
      text-align: center;
      background: linear-gradient(135deg, ${color} 0%, #8B5CF6 100%);
      color: white;
      margin: -20mm;
      padding: 40mm;
      page-break-after: always;
    }

    .cover h1 {
      color: white;
      border: none;
      padding: 0;
      font-size: 38pt;
      margin: 18px 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .cover .archetype-badge {
      background: white;
      color: ${color};
      font-size: 13pt;
      padding: 9px 26px;
      margin-bottom: 26px;
    }

    .cover .subtitle {
      font-size: 15pt;
      margin-top: 18px;
      opacity: 0.95;
      font-weight: 400;
    }

    .cover .logo {
      color: white;
      font-size: 32pt;
      margin-top: 45px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    /* Ajuste de espaciado para contenido */
    .content {
      padding-bottom: 40px;
    }
  </style>
</head>
<body>
  <!-- Portada -->
  <div class="cover">
    <div class="archetype-badge">${leadMagnet.archetype}</div>
    <h1>${leadMagnet.title}</h1>
    <div class="subtitle">${leadMagnet.subtitle}</div>
    <div class="subtitle" style="margin-top: 30px; font-size: 13pt;">Guía práctica para anfitriones de alquiler vacacional</div>
    <div class="logo">itineramio</div>
  </div>

  <!-- Contenido -->
  <div class="page">
    <div class="header">
      <div class="logo">itineramio</div>
      <div class="archetype-badge">${leadMagnet.archetype}</div>
    </div>

    <div class="content">
      ${content}
    </div>
  </div>

  <div class="footer">
    <strong>itineramio</strong> - La plataforma todo-en-uno para anfitriones profesionales<br>
    <a href="https://www.itineramio.com">www.itineramio.com</a>
  </div>
</body>
</html>
  `
}

async function generatePDF(slug: string): Promise<boolean> {
  console.log(`\n📄 Generando PDF: ${slug}`)

  // Obtener datos del lead magnet
  const leadMagnet = getLeadMagnetBySlug(slug)
  if (!leadMagnet) {
    console.error(`❌ Lead magnet no encontrado: ${slug}`)
    return false
  }

  // Obtener filename del markdown
  const markdownFile = MARKDOWN_FILES[slug]
  if (!markdownFile) {
    console.error(`❌ Archivo markdown no mapeado para: ${slug}`)
    return false
  }

  const markdownPath = join(CONTENT_DIR, markdownFile)

  if (!existsSync(markdownPath)) {
    console.error(`❌ Archivo markdown no encontrado: ${markdownPath}`)
    return false
  }

  try {
    // Leer markdown
    const markdown = readFileSync(markdownPath, 'utf-8')
    console.log(`   ✓ Markdown leído: ${markdownFile} (${markdown.length} chars)`)

    // Convertir a HTML
    const htmlContent = await marked.parse(markdown)
    console.log(`   ✓ HTML generado`)

    // Obtener color del arquetipo
    const color = COLORS[leadMagnet.archetype] || '#8B5CF6'

    // Generar HTML completo
    const fullHTML = getHTMLTemplate(htmlContent, leadMagnet, color)

    // Iniciar navegador
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()

    // Configurar viewport
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2,
    })

    // Cargar HTML
    await page.setContent(fullHTML, {
      waitUntil: 'networkidle0',
    })

    console.log(`   ✓ HTML cargado en navegador`)

    // Generar PDF
    const outputPath = join(OUTPUT_DIR, `${slug}.pdf`)

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
      preferCSSPageSize: true,
    })

    await browser.close()

    console.log(`   ✅ PDF generado: ${outputPath}`)
    return true
  } catch (error) {
    console.error(`   ❌ Error:`, error)
    return false
  }
}

async function main() {
  const arg = process.argv[2] || 'all'

  console.log(`\n╔═══════════════════════════════════════╗`)
  console.log(`║  📄 GENERADOR DE PDFs - ITINERAMIO   ║`)
  console.log(`╚═══════════════════════════════════════╝\n`)

  let slugs: string[] = []

  if (arg === 'all') {
    slugs = getAllLeadMagnetSlugs()
    console.log(`📦 Generando TODAS las guías (${slugs.length})`)
  } else {
    const availableSlugs = getAllLeadMagnetSlugs()
    if (!availableSlugs.includes(arg)) {
      console.error(`❌ Guía no encontrada: ${arg}`)
      console.log(`\n✅ Guías disponibles:`)
      availableSlugs.forEach((s) => console.log(`   - ${s}`))
      process.exit(1)
    }
    slugs = [arg]
  }

  let success = 0
  let failed = 0

  for (const slug of slugs) {
    const result = await generatePDF(slug)
    if (result) {
      success++
    } else {
      failed++
    }
  }

  console.log(`\n╔═══════════════════════════════════════╗`)
  console.log(`║           RESUMEN FINAL              ║`)
  console.log(`╚═══════════════════════════════════════╝`)
  console.log(`✅ Exitosos: ${success}/${slugs.length}`)
  console.log(`❌ Fallidos: ${failed}/${slugs.length}`)
  console.log(`📁 Ubicación: ${OUTPUT_DIR}\n`)

  process.exit(failed > 0 ? 1 : 0)
}

main().catch(console.error)
