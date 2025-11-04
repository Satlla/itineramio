/**
 * Script para actualizar artículos existentes con información de autor
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📝 Actualizando artículos sin autor asignado...\n')

  // Get default author (Equipo Itineramio)
  const defaultAuthor = await prisma.user.findUnique({
    where: { email: 'equipo@itineramio.com' }
  })

  if (!defaultAuthor) {
    console.error('❌ No se encontró el autor por defecto (Equipo Itineramio)')
    return
  }

  // Find all blog posts without authorImage
  const postsWithoutAuthor = await prisma.blogPost.findMany({
    where: {
      OR: [
        { authorImage: null },
        { authorImage: '' }
      ]
    }
  })

  console.log(`🔍 Encontrados ${postsWithoutAuthor.length} artículos para actualizar\n`)

  let updated = 0
  for (const post of postsWithoutAuthor) {
    try {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: {
          authorId: defaultAuthor.id,
          authorName: defaultAuthor.name,
          authorImage: defaultAuthor.avatar
        }
      })

      console.log(`✅ "${post.title}" actualizado con autor: ${defaultAuthor.name}`)
      updated++
    } catch (error) {
      console.error(`❌ Error actualizando "${post.title}":`, error)
    }
  }

  console.log(`\n📊 Resumen:`)
  console.log(`   ✅ Artículos actualizados: ${updated}`)
  console.log(`   📝 Total revisados: ${postsWithoutAuthor.length}\n`)

  console.log('💡 Recuerda:')
  console.log('   1. Ve a /admin/blog para editar cada artículo')
  console.log('   2. Selecciona el autor apropiado para cada artículo')
  console.log('   3. Guarda los cambios para aplicar el autor personalizado\n')
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
