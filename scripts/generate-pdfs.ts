/**
 * Script para generar PDFs de las 8 guías usando Puppeteer
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
import { LEAD_MAGNETS, getAllLeadMagnetSlugs } from '../src/data/lead-magnets'

const OUTPUT_DIR = join(process.cwd(), 'public', 'downloads')
const TEMPLATES_DIR = join(process.cwd(), 'scripts', 'pdf-templates')

// Asegurar que el directorio de salida existe
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true })
  console.log('✅ Creado directorio:', OUTPUT_DIR)
}

async function generatePDF(slug: string) {
  console.log(`\n🎨 Generando PDF: ${slug}`)

  // Leer el template HTML
  const templatePath = join(TEMPLATES_DIR, `${slug}.html`)

  if (!existsSync(templatePath)) {
    console.error(`❌ Template no encontrado: ${templatePath}`)
    return false
  }

  const html = readFileSync(templatePath, 'utf-8')

  // Iniciar navegador
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()

    // Configurar viewport para mejor renderizado
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2 // Mejor calidad de imagen
    })

    // Cargar HTML
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    })

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
        left: '0mm'
      },
      preferCSSPageSize: true
    })

    console.log(`✅ PDF generado: ${outputPath}`)
    return true

  } catch (error) {
    console.error(`❌ Error generando PDF:`, error)
    return false
  } finally {
    await browser.close()
  }
}

async function main() {
  const arg = process.argv[2] || 'all'

  console.log(`\n╔═══════════════════════════════════════╗`)
  console.log(`║  🎨 GENERADOR DE PDFs - ITINERAMIO   ║`)
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
      availableSlugs.forEach(s => console.log(`   - ${s}`))
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
  console.log(`✅ Exitosos: ${success}`)
  console.log(`❌ Fallidos: ${failed}`)
  console.log(`📁 Ubicación: ${OUTPUT_DIR}\n`)

  process.exit(failed > 0 ? 1 : 0)
}

main().catch(console.error)
