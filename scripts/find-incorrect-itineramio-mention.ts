import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Buscando mención incorrecta de Itineramio en check-in...\n')

  const article = await prisma.blogPost.findUnique({
    where: { slug: 'vut-madrid-2025-requisitos-normativa-checklist' },
    select: { content: true }
  })

  if (!article) {
    console.log('❌ Artículo no encontrado')
    return
  }

  const content = article.content

  // Buscar todas las menciones de Itineramio cerca de palabras clave de check-in
  const checkInKeywords = [
    'check-in',
    'check in',
    'registro de huéspedes',
    'registro de viajeros',
    'Chekin',
    'GuestReady',
    'Partee',
    'hospedajes',
    'SES.Hospedajes'
  ]

  console.log('Buscando patrones problemáticos...\n')

  // Dividir en líneas para analizar contexto
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Si la línea contiene Itineramio
    if (line.includes('Itineramio')) {
      // Verificar si también contiene palabras clave de check-in
      const hasCheckInKeyword = checkInKeywords.some(keyword =>
        line.toLowerCase().includes(keyword.toLowerCase())
      )

      if (hasCheckInKeyword) {
        console.log(`❌ PROBLEMA ENCONTRADO EN LÍNEA ${i + 1}:`)
        console.log('-'.repeat(80))

        // Mostrar contexto (línea anterior, actual, siguiente)
        if (i > 0) console.log(`  ${lines[i - 1].substring(0, 150)}...`)
        console.log(`> ${line.substring(0, 150)}...`)
        if (i < lines.length - 1) console.log(`  ${lines[i + 1].substring(0, 150)}...`)

        console.log('\n')
      }
    }
  }

  // Buscar patrones específicos problemáticos
  const problematicPatterns = [
    /Chekin[,\s]+GuestReady[,\s]+(o|e|incluso)[,\s]+Itineramio/gi,
    /Itineramio[,\s]+Chekin[,\s]+(o|y)[,\s]+GuestReady/gi,
    /registro de (huéspedes|viajeros).{0,200}Itineramio/gi,
    /Itineramio.{0,200}registro de (huéspedes|viajeros)/gi
  ]

  console.log('Buscando patrones específicos problemáticos...\n')

  for (const pattern of problematicPatterns) {
    const matches = content.match(pattern)
    if (matches) {
      console.log(`❌ PATRÓN PROBLEMÁTICO ENCONTRADO:`)
      console.log('-'.repeat(80))
      matches.forEach(match => {
        console.log(match)
      })
      console.log('\n')
    }
  }

  console.log('✅ Búsqueda completada')

  await prisma.$disconnect()
}

main()
