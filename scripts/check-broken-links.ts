/**
 * Script para verificar enlaces rotos en itineramio.com
 *
 * Ejecutar:
 * npx tsx scripts/check-broken-links.ts
 */

interface LinkCheck {
  url: string
  status: number
  page: string
  text?: string
}

const BASE_URL = 'https://itineramio.com'

// Páginas a verificar
const PAGES_TO_CHECK = [
  '/',
  '/blog',
  '/funcionalidades',
  '/academia',
  '/host-profile/test',
  '/recursos',
  '/legal/privacy',
  '/legal/terms',
  '/legal/cookies',
  '/about',
  '/contact'
]

// URLs conocidas que deberían funcionar
const KNOWN_URLS = [
  // Blog posts
  '/blog/revpar-vs-ocupacion-metricas-correctas-airbnb',
  '/blog/caso-laura-de-1800-a-3200-euros-mes-historia-completa',
  '/blog/automatizacion-airbnb-stack-completo',
  '/blog/modo-bombero-a-ceo-escalar-airbnb',
  '/blog/revenue-management-avanzado',
  '/blog/storytelling-que-convierte-descripciones-airbnb',
  '/blog/kit-anti-caos-anfitriones-airbnb',
  '/blog/errores-principiantes-airbnb',
  '/blog/primer-mes-anfitrion-airbnb',
  '/blog/caso-david-15-propiedades',

  // Recursos
  '/recursos/estratega-5-kpis',
  '/recursos/sistematico-47-tareas',
  '/recursos/diferenciador-storytelling',
  '/recursos/ejecutor-turno-key',
  '/recursos/improvisador-kit-supervivencia',
  '/recursos/resolutor-protocolos',
  '/recursos/experiencial-manual-experiencias',
  '/recursos/equilibrado-startup-kit',
  '/recursos/instrucciones-wifi',

  // Plantillas
  '/recursos/plantillas/instrucciones-wifi',

  // Recursos genéricos mencionados en emails
  '/recursos/checklist-primera-reserva',
  '/recursos/manual-basico',
  '/recursos/framework-delegacion',
  '/recursos/multi-property-ops'
]

async function checkUrl(url: string, fromPage: string): Promise<LinkCheck> {
  try {
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`
    const response = await fetch(fullUrl, {
      method: 'HEAD',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)'
      }
    })

    return {
      url: url,
      status: response.status,
      page: fromPage
    }
  } catch (error) {
    return {
      url: url,
      status: 0,
      page: fromPage
    }
  }
}

async function extractLinksFromPage(pageUrl: string): Promise<string[]> {
  try {
    const response = await fetch(`${BASE_URL}${pageUrl}`)
    const html = await response.text()

    // Expresión regular simple para extraer hrefs
    const linkRegex = /href=["']([^"']+)["']/g
    const links: string[] = []
    let match

    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1]

      // Filtrar:
      // - Enlaces externos (https://, http://, //)
      // - Anchors (#)
      // - mailto:
      // - javascript:
      if (
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !href.startsWith('/#') &&
        !href.includes('mailto:') &&
        !href.includes('javascript:')
      ) {
        links.push(href)
      }
    }

    return [...new Set(links)] // Eliminar duplicados
  } catch (error) {
    console.error(`Error fetching ${pageUrl}:`, error)
    return []
  }
}

async function main() {
  console.log('🔍 Verificando enlaces en itineramio.com...\n')

  const results: LinkCheck[] = []
  const checked = new Set<string>()

  // 1. Verificar páginas principales
  console.log('📄 Verificando páginas principales...')
  for (const page of PAGES_TO_CHECK) {
    const result = await checkUrl(page, 'main-pages')
    results.push(result)
    checked.add(page)

    const statusEmoji = result.status === 200 ? '✅' : result.status === 307 || result.status === 301 ? '↪️' : '❌'
    console.log(`${statusEmoji} ${page} - ${result.status}`)
  }

  console.log('\n📝 Verificando URLs conocidas (blog, recursos)...')
  for (const url of KNOWN_URLS) {
    if (!checked.has(url)) {
      const result = await checkUrl(url, 'known-urls')
      results.push(result)
      checked.add(url)

      const statusEmoji = result.status === 200 ? '✅' : result.status === 307 || result.status === 301 ? '↪️' : '❌'
      console.log(`${statusEmoji} ${url} - ${result.status}`)
    }
  }

  // 2. Extraer y verificar enlaces de páginas principales
  console.log('\n🕷️  Extrayendo enlaces de páginas principales...')
  const allLinks = new Set<string>()

  for (const page of PAGES_TO_CHECK.slice(0, 5)) { // Limitar a 5 para no saturar
    console.log(`  Analizando ${page}...`)
    const links = await extractLinksFromPage(page)
    links.forEach(link => allLinks.add(link))
    await new Promise(resolve => setTimeout(resolve, 500)) // Rate limiting
  }

  console.log(`\n🔗 Encontrados ${allLinks.size} enlaces únicos`)
  console.log('Verificando enlaces encontrados...')

  for (const link of allLinks) {
    if (!checked.has(link)) {
      const result = await checkUrl(link, 'crawled')
      results.push(result)
      checked.add(link)

      if (result.status !== 200 && result.status !== 307 && result.status !== 301) {
        console.log(`❌ ${link} - ${result.status}`)
      }

      await new Promise(resolve => setTimeout(resolve, 200)) // Rate limiting
    }
  }

  // 3. Analizar resultados
  console.log('\n' + '='.repeat(80))
  console.log('📊 RESUMEN DE RESULTADOS')
  console.log('='.repeat(80))

  const broken = results.filter(r => r.status >= 400 || r.status === 0)
  const redirects = results.filter(r => r.status === 301 || r.status === 307)
  const ok = results.filter(r => r.status === 200)

  console.log(`\n✅ Enlaces OK: ${ok.length}`)
  console.log(`↪️  Redirects: ${redirects.length}`)
  console.log(`❌ Enlaces rotos: ${broken.length}`)
  console.log(`📊 Total verificados: ${results.length}`)

  if (broken.length > 0) {
    console.log('\n' + '='.repeat(80))
    console.log('❌ ENLACES ROTOS ENCONTRADOS:')
    console.log('='.repeat(80))
    broken.forEach(link => {
      console.log(`\n❌ ${link.url}`)
      console.log(`   Status: ${link.status === 0 ? 'ERROR/TIMEOUT' : link.status}`)
      console.log(`   Encontrado en: ${link.page}`)
    })
  }

  if (redirects.length > 0 && redirects.length < 20) {
    console.log('\n' + '='.repeat(80))
    console.log('↪️  REDIRECTS ENCONTRADOS:')
    console.log('='.repeat(80))
    redirects.forEach(link => {
      console.log(`↪️  ${link.url} - ${link.status}`)
    })
  }

  // 4. URLs específicas mencionadas en los emails que deben existir
  console.log('\n' + '='.repeat(80))
  console.log('🔍 VERIFICACIÓN ESPECIAL: URLs mencionadas en emails')
  console.log('='.repeat(80))

  const emailUrls = [
    '/recursos/checklist-primera-reserva',
    '/recursos/manual-basico',
    '/recursos/framework-delegacion',
    '/recursos/multi-property-ops',
    '/blog/primer-mes-anfitrion-airbnb',
    '/blog/caso-david-15-propiedades'
  ]

  console.log('\n⚠️  URLs que NO EXISTEN pero están mencionadas en emails:')
  for (const url of emailUrls) {
    const result = results.find(r => r.url === url)
    if (result && result.status === 404) {
      console.log(`❌ ${url} - NECESITA SER CREADA`)
    }
  }

  console.log('\n✅ Verificación completada!\n')
}

main().catch(console.error)
