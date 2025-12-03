import { prisma } from '../src/lib/prisma'

async function checkCurrentArticleContent() {
  const airbnbArticle = await prisma.blogPost.findUnique({
    where: { slug: 'mensajes-automaticos-airbnb' }
  })

  if (!airbnbArticle) {
    console.log('❌ No se encontró el artículo')
    return
  }

  console.log('📰 ARTÍCULO ACTUAL EN BASE DE DATOS\n')
  console.log('Título:', airbnbArticle.title)
  console.log('Autor:', airbnbArticle.author)
  console.log('Longitud del contenido:', airbnbArticle.content.length, 'caracteres\n')

  // Check if templates are present
  const hasTemplate1 = airbnbArticle.content.includes('Confirmación Inmediata')
  const hasTemplate2 = airbnbArticle.content.includes('Instrucciones de Check-In')
  const hasTemplate3 = airbnbArticle.content.includes('Recordatorio el Día de Llegada')
  const hasTemplate4 = airbnbArticle.content.includes('Bienvenida tras Check-In')
  const hasTemplate5 = airbnbArticle.content.includes('Recordatorio de Normas')
  const hasTemplate6 = airbnbArticle.content.includes('Recordatorio de Check-Out')
  const hasTemplate7 = airbnbArticle.content.includes('Agradecimiento + Petición de Review')

  console.log('🔍 VERIFICACIÓN DE PLANTILLAS:\n')
  console.log(`${hasTemplate1 ? '✅' : '❌'} 1. Confirmación Inmediata`)
  console.log(`${hasTemplate2 ? '✅' : '❌'} 2. Instrucciones de Check-In`)
  console.log(`${hasTemplate3 ? '✅' : '❌'} 3. Recordatorio el Día de Llegada`)
  console.log(`${hasTemplate4 ? '✅' : '❌'} 4. Bienvenida tras Check-In`)
  console.log(`${hasTemplate5 ? '✅' : '❌'} 5. Recordatorio de Normas`)
  console.log(`${hasTemplate6 ? '✅' : '❌'} 6. Recordatorio de Check-Out`)
  console.log(`${hasTemplate7 ? '✅' : '❌'} 7. Agradecimiento + Petición de Review`)

  // Check for "PLANTILLA PARA COPIAR" boxes
  const copyPasteBoxes = airbnbArticle.content.match(/PLANTILLA PARA COPIAR/g)
  console.log(`\n📋 Cajas de "PLANTILLA PARA COPIAR" encontradas: ${copyPasteBoxes ? copyPasteBoxes.length : 0}`)

  // Check for <pre> tags (where templates should be)
  const preTags = airbnbArticle.content.match(/<pre/g)
  console.log(`📄 Tags <pre> encontrados: ${preTags ? preTags.length : 0}`)

  // Extract a sample of the content to see structure
  console.log('\n📝 MUESTRA DEL CONTENIDO (primeros 2000 caracteres):\n')
  console.log(airbnbArticle.content.substring(0, 2000))
  console.log('\n...\n')
}

checkCurrentArticleContent()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
