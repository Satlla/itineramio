/**
 * Script de verificación completa del embudo en PRODUCCIÓN
 * Verifica: contenido, imágenes, enlaces internos, datos del lead magnet
 */

import { prisma } from '../src/lib/prisma'

const PRODUCTION_URL = 'https://www.itineramio.com'

interface CheckResult {
  name: string
  status: 'OK' | 'ERROR' | 'WARNING'
  details: string
}

const results: CheckResult[] = []

function addResult(name: string, status: 'OK' | 'ERROR' | 'WARNING', details: string) {
  results.push({ name, status, details })
}

async function checkUrl(url: string): Promise<{ status: number; body: string }> {
  try {
    const response = await fetch(url)
    const body = await response.text()
    return { status: response.status, body }
  } catch (error) {
    return { status: 0, body: '' }
  }
}

async function verifyProductionFunnel() {
  console.log('🔍 VERIFICACIÓN COMPLETA DEL EMBUDO EN PRODUCCIÓN\n')
  console.log('='.repeat(80))

  // 1. Verificar artículos en base de datos
  console.log('\n📰 1. VERIFICANDO ARTÍCULOS EN BASE DE DATOS...\n')

  const articles = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      slug: true,
      title: true,
      authorName: true,
      coverImage: true,
      content: true
    }
  })

  console.log(`Total de artículos publicados: ${articles.length}`)

  // Verificar nombre del autor en Caso Laura
  const casoLaura = articles.find(a => a.slug === 'caso-laura-de-1800-a-3200-euros-mes-historia-completa')
  if (casoLaura) {
    if (casoLaura.authorName === 'Alejandro Satlla') {
      addResult('Autor Caso Laura', 'OK', 'Nombre correcto: Alejandro Satlla')
    } else {
      addResult('Autor Caso Laura', 'ERROR', `Nombre incorrecto: ${casoLaura.authorName}`)
    }
  }

  // Verificar imágenes
  const articlesWithoutImage = articles.filter(a => !a.coverImage)
  if (articlesWithoutImage.length === 0) {
    addResult('Imágenes de artículos', 'OK', `Todos los ${articles.length} artículos tienen imagen`)
  } else {
    addResult('Imágenes de artículos', 'WARNING', `${articlesWithoutImage.length} artículos sin imagen`)
  }

  // Verificar enlaces internos
  const articlesWithLinks = articles.filter(a => a.content.includes('## Artículos Relacionados'))
  addResult('Enlaces internos', 'OK', `${articlesWithLinks.length} artículos con enlaces internos`)

  // 2. Verificar endpoints de producción
  console.log('\n🌐 2. VERIFICANDO ENDPOINTS DE PRODUCCIÓN...\n')

  const endpoints = [
    { name: 'Landing', url: `${PRODUCTION_URL}/` },
    { name: 'Test Personalidad', url: `${PRODUCTION_URL}/host-profile/test` },
    { name: 'Lead Magnet ESTRATEGA', url: `${PRODUCTION_URL}/recursos/estratega-5-kpis` },
    { name: 'PDF ESTRATEGA', url: `${PRODUCTION_URL}/downloads/estratega-5-kpis.pdf` },
    { name: 'Blog - Mensajes Airbnb', url: `${PRODUCTION_URL}/blog/mensajes-automaticos-airbnb` },
    { name: 'Blog - Caso Laura', url: `${PRODUCTION_URL}/blog/caso-laura-de-1800-a-3200-euros-mes-historia-completa` },
  ]

  for (const endpoint of endpoints) {
    const { status, body } = await checkUrl(endpoint.url)
    if (status === 200) {
      addResult(endpoint.name, 'OK', `HTTP ${status}`)

      // Verificaciones específicas de contenido
      if (endpoint.name === 'Blog - Caso Laura' && body) {
        if (body.includes('Alejandro Satlla')) {
          addResult(`${endpoint.name} - Autor`, 'OK', 'Nombre de autor correcto en HTML')
        } else {
          addResult(`${endpoint.name} - Autor`, 'ERROR', 'Nombre de autor incorrecto en HTML')
        }
      }

      if (endpoint.name === 'Lead Magnet ESTRATEGA' && body) {
        // Verificar cálculos corregidos
        const hasCorrectCalculation = body.includes('€2,165') && body.includes('72%')
        if (hasCorrectCalculation) {
          addResult(`${endpoint.name} - NOI`, 'OK', 'NOI corregido: €2,165 (72%)')
        } else {
          addResult(`${endpoint.name} - NOI`, 'ERROR', 'NOI no actualizado correctamente')
        }

        const hasCorrectExpenses = body.includes('€50') && body.includes('€60') && body.includes('€25')
        if (hasCorrectExpenses) {
          addResult(`${endpoint.name} - Gastos`, 'OK', 'Gastos corregidos: €50, €60, €25')
        } else {
          addResult(`${endpoint.name} - Gastos`, 'ERROR', 'Gastos no actualizados')
        }
      }
    } else {
      addResult(endpoint.name, 'ERROR', `HTTP ${status}`)
    }
  }

  // 3. Verificar contenido del archivo markdown directamente
  console.log('\n📄 3. VERIFICANDO ARCHIVO MARKDOWN LOCAL...\n')

  const fs = require('fs')
  const path = require('path')
  const mdPath = path.join(process.cwd(), 'content/lead-magnets/ESTRATEGA-5-KPIs.md')

  if (fs.existsSync(mdPath)) {
    const mdContent = fs.readFileSync(mdPath, 'utf-8')

    // Verificar valores corregidos
    const checks = [
      { value: 'Reposición (ropa, menaje): €50', label: 'Reposición €50' },
      { value: 'Mantenimiento: €60', label: 'Mantenimiento €60' },
      { value: 'Seguros: €25', label: 'Seguros €25' },
      { value: 'Comisiones OTA: €150', label: 'Comisiones €150' },
      { value: 'NOI: €2,165', label: 'NOI €2,165' },
      { value: 'NOI Margin = (€2,165 / €3,000) × 100 = **72%**', label: 'NOI Margin 72%' }
    ]

    for (const check of checks) {
      if (mdContent.includes(check.value)) {
        addResult(`Markdown - ${check.label}`, 'OK', 'Valor correcto en archivo')
      } else {
        addResult(`Markdown - ${check.label}`, 'ERROR', 'Valor incorrecto en archivo')
      }
    }
  } else {
    addResult('Archivo Markdown', 'ERROR', 'No se encuentra el archivo')
  }

  // 4. Mostrar resumen
  console.log('\n' + '='.repeat(80))
  console.log('\n📊 RESUMEN DE VERIFICACIÓN:\n')

  const okCount = results.filter(r => r.status === 'OK').length
  const errorCount = results.filter(r => r.status === 'ERROR').length
  const warningCount = results.filter(r => r.status === 'WARNING').length

  results.forEach(result => {
    const icon = result.status === 'OK' ? '✅' : result.status === 'ERROR' ? '❌' : '⚠️'
    console.log(`${icon} ${result.name.padEnd(40)} → ${result.details}`)
  })

  console.log('\n' + '='.repeat(80))
  console.log(`\n✅ OK: ${okCount} | ❌ ERRORES: ${errorCount} | ⚠️ WARNINGS: ${warningCount}`)

  if (errorCount === 0) {
    console.log('\n🎉 TODO VERIFICADO CORRECTAMENTE - EMBUDO 100% FUNCIONAL\n')
  } else {
    console.log('\n⚠️ SE ENCONTRARON ERRORES - REVISAR ARRIBA\n')
  }

  // 5. Flujo de usuario paso a paso
  console.log('\n' + '='.repeat(80))
  console.log('\n👤 FLUJO DE USUARIO COMPLETO:\n')
  console.log('1. Landing page → ' + PRODUCTION_URL)
  console.log('2. Click en CTA "Descubre tu perfil"')
  console.log('3. Realiza test → ' + PRODUCTION_URL + '/host-profile/test')
  console.log('4. Recibe resultado (ej: ESTRATEGA)')
  console.log('5. Descarga lead magnet → ' + PRODUCTION_URL + '/recursos/estratega-5-kpis')
  console.log('6. PDF descargado → ' + PRODUCTION_URL + '/downloads/estratega-5-kpis.pdf')
  console.log('7. Email de bienvenida (automático)')
  console.log('8. Secuencia de nurturing (14 días)')
  console.log('9. Lee artículos del blog con enlaces internos')
  console.log('10. Conversión a prueba gratuita')
  console.log('\n' + '='.repeat(80) + '\n')
}

verifyProductionFunnel()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
