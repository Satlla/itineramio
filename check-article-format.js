const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkFormats() {
  // Get one well-formatted article
  const goodArticle = await prisma.blogPost.findUnique({
    where: { slug: 'manual-digital-apartamento-turistico-guia-completa' },
    select: { title: true, content: true }
  })
  
  // Get one of the problematic articles
  const badArticle = await prisma.blogPost.findUnique({
    where: { slug: 'como-configurar-zona-check-in-itineramio' },
    select: { title: true, content: true }
  })
  
  console.log('=== ARTÍCULO BIEN FORMATEADO ===')
  console.log('Título:', goodArticle.title)
  console.log('Contenido (primeros 2000 chars):')
  console.log(goodArticle.content.substring(0, 2000))
  console.log('\n\n')
  
  console.log('=== ARTÍCULO MAL FORMATEADO ===')
  console.log('Título:', badArticle.title)
  console.log('Contenido (primeros 2000 chars):')
  console.log(badArticle.content.substring(0, 2000))
}

checkFormats()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
