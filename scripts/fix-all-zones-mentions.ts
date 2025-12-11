import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Corrigiendo menciones de zonas en artículos del blog...\n')

  // Artículos a corregir
  const articlesToFix = [
    'modo-bombero-a-ceo-escalar-airbnb',
    'primer-mes-anfitrion-airbnb'
  ]

  for (const slug of articlesToFix) {
    console.log(`\n📄 Procesando artículo: ${slug}`)

    const article = await prisma.blogPost.findUnique({
      where: { slug },
      select: { content: true }
    })

    if (!article) {
      console.log(`❌ Artículo "${slug}" no encontrado`)
      continue
    }

    let updatedContent = article.content
    let changesMade = false

    // Corregir "12 zonas predefinidas" -> "11 zonas esenciales"
    const regex12Zones = /12 zonas predefinidas/g
    const matches = updatedContent.match(regex12Zones)

    if (matches) {
      updatedContent = updatedContent.replace(regex12Zones, '11 zonas esenciales')
      console.log(`   ✓ Cambiado "12 zonas predefinidas" → "11 zonas esenciales" (${matches.length} veces)`)
      changesMade = true
    }

    if (changesMade) {
      await prisma.blogPost.update({
        where: { slug },
        data: { content: updatedContent }
      })
      console.log(`   ✅ Artículo "${slug}" actualizado en la base de datos`)
    } else {
      console.log(`   ⏭️  No se encontraron menciones de "12 zonas" en "${slug}"`)
    }
  }

  console.log('\n✅ Proceso completado')
  await prisma.$disconnect()
}

main()
