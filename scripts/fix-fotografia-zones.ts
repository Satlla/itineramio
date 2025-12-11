import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Corrigiendo zonas en artículo de fotografía...')

  // Zonas CORRECTAS según la plataforma
  const correctZonesList = `  <ul style="color: #4b5563; padding-left: 2rem; line-height: 1.8;">
    <li><strong>Check In:</strong> Proceso de entrada paso a paso con códigos de acceso</li>
    <li><strong>WiFi:</strong> Genera tarjetas imprimibles con QR para conectar automáticamente</li>
    <li><strong>Check Out:</strong> Instrucciones para la salida del apartamento</li>
    <li><strong>Cómo Llegar:</strong> Direcciones desde aeropuerto, estación y ubicación exacta</li>
    <li><strong>Normas de la Casa:</strong> Reglas, horarios, mascotas, políticas</li>
    <li><strong>Parking:</strong> Opciones de aparcamiento con mapas y precios</li>
    <li><strong>Climatización:</strong> Aire acondicionado, calefacción, cómo regular temperatura</li>
    <li><strong>Teléfonos de Emergencia:</strong> Contactos importantes, hospital, anfitrión</li>
    <li><strong>Transporte Público:</strong> Metro, bus, taxi más cercanos</li>
    <li><strong>Recomendaciones:</strong> Restaurantes, supermercados, lugares de interés</li>
    <li><strong>Basura y Reciclaje:</strong> Horarios y ubicación de contenedores</li>
    <li><strong>Cocina y Electrodomésticos:</strong> Instrucciones con videos de hasta 60 segundos</li>
  </ul>`

  const article = await prisma.blogPost.findUnique({
    where: { slug: 'fotografia-profesional-airbnb-guia-completa' },
    select: { content: true }
  })

  if (!article) {
    console.log('❌ Artículo no encontrado')
    return
  }

  let updatedContent = article.content

  // Corregir el número de zonas (de 12 a 11)
  updatedContent = updatedContent.replace(
    /En lugar de partir de cero, Itineramio te ofrece 12 zonas predefinidas listas para completar:/g,
    'En lugar de partir de cero, Itineramio te ofrece 11 zonas esenciales listas para completar:'
  )

  // Buscar y reemplazar la lista de zonas incorrecta
  const oldZonesPattern = /<ul style="color: #4b5563; padding-left: 2rem; line-height: 1\.8;">[\s\S]*?<li><strong>WiFi:<\/strong>[\s\S]*?<li><strong>Cocina:<\/strong>[\s\S]*?<li><strong>Check-in\/Check-out:<\/strong>[\s\S]*?<li><strong>Normas de la Casa:<\/strong>[\s\S]*?<li><strong>Recomendaciones Locales:<\/strong>[\s\S]*?<li><strong>Emergencias:<\/strong>[\s\S]*?<li><strong>Calefacción\/AC:<\/strong>[\s\S]*?<li><strong>Basura y Reciclaje:<\/strong>[\s\S]*?<li><strong>Parking:<\/strong>[\s\S]*?<li><strong>Transporte:<\/strong>[\s\S]*?<li><strong>Entretenimiento:<\/strong>[\s\S]*?<li><strong>Limpieza:<\/strong>[\s\S]*?<\/ul>/

  if (oldZonesPattern.test(updatedContent)) {
    updatedContent = updatedContent.replace(oldZonesPattern, correctZonesList)
    console.log('✅ Lista de zonas actualizada con regex')
  } else {
    // Intento alternativo: buscar por texto exacto de algunas zonas incorrectas
    if (updatedContent.includes('Entretenimiento') || updatedContent.includes('Check-in/Check-out')) {
      // Buscar el bloque que comienza con <ul y termina con </ul> después de "zonas predefinidas"
      const zonesBlockRegex = /(<p style="[^"]*">En lugar de partir de cero, Itineramio te ofrece (?:12|11) zonas [\s\S]*?<\/p>\s*<ul style="[^"]*">)([\s\S]*?)(<\/ul>)/

      if (zonesBlockRegex.test(updatedContent)) {
        updatedContent = updatedContent.replace(zonesBlockRegex, (match, beforeUl, listContent, afterUl) => {
          return beforeUl + correctZonesList.match(/<ul[\s\S]*<\/ul>/)?.[0]?.replace(/<ul[^>]*>|<\/ul>/g, '') + afterUl
        })
        console.log('✅ Lista de zonas actualizada con método alternativo')
      } else {
        console.log('⚠️ No se pudo encontrar el bloque de zonas con el patrón esperado')
      }
    }
  }

  // Actualizar el artículo
  await prisma.blogPost.update({
    where: { slug: 'fotografia-profesional-airbnb-guia-completa' },
    data: { content: updatedContent }
  })

  console.log('✅ Artículo de fotografía actualizado con zonas correctas')

  await prisma.$disconnect()
}

main()
