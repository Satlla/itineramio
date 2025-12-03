import { prisma } from '../src/lib/prisma'

async function fixAuthorName() {
  console.log('🔧 Corrigiendo nombre del autor...\n')

  await prisma.blogPost.update({
    where: { slug: 'mensajes-automaticos-airbnb' },
    data: {
      authorName: 'Alejandro Satlla'
    }
  })

  console.log('✅ Nombre del autor actualizado a: Alejandro Satlla')

  // Verificar
  const article = await prisma.blogPost.findUnique({
    where: { slug: 'mensajes-automaticos-airbnb' },
    select: { authorName: true, author: true }
  })

  console.log('\n📋 VERIFICACIÓN:')
  console.log(`  author: ${article?.author}`)
  console.log(`  authorName: ${article?.authorName}`)
}

fixAuthorName()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
