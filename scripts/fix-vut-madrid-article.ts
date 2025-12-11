import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Corrigiendo artículo VUT Madrid...\n')

  const article = await prisma.blogPost.findUnique({
    where: { slug: 'vut-madrid-2025-requisitos-normativa-checklist' },
    select: { content: true }
  })

  if (!article) {
    console.log('❌ Artículo no encontrado')
    return
  }

  let updatedContent = article.content

  // 1. Eliminar Itineramio de la mención de registro de huéspedes (check-in)
  // Buscar el texto que incluye "Chekin, GuestReady o incluso Itineramio"
  const incorrectText = /Puedes utilizar software especializado como Chekin, GuestReady o incluso <strong[^>]*>Itineramio<\/strong> para automatizar este proceso y evitar sanciones por incumplimiento\./g

  if (incorrectText.test(updatedContent)) {
    updatedContent = updatedContent.replace(
      incorrectText,
      'Puedes utilizar software especializado como Chekin o GuestReady para automatizar este proceso y evitar sanciones por incumplimiento.'
    )
    console.log('✓ Eliminada mención incorrecta de Itineramio en registro de huéspedes')
  }

  // 2. Añadir Partee como opción económica
  // Buscar una sección donde se mencionen herramientas y añadir Partee
  // Vamos a buscar si ya existe alguna mención de Partee
  if (!updatedContent.includes('Partee')) {
    // Buscar dónde añadir Partee - probablemente después de mencionar Chekin
    // Vamos a añadir una sección con Partee como alternativa económica

    const parteeSection = `
<div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 12px; padding: 2rem; margin: 2rem 0; border-left: 4px solid #6366f1;">
  <h4 style="color: #1f2937; margin-top: 0; font-size: 1.3rem;">💡 Alternativa Económica: Partee</h4>
  <p style="color: #4b5563; line-height: 1.8; margin-bottom: 1rem;">
    Si buscas una opción más económica para el registro de huéspedes (check-in), <strong style="color: #6366f1;"><a href="https://www.partee.es" target="_blank" rel="noopener" style="color: #6366f1; text-decoration: none;">Partee</a></strong> es una excelente alternativa española que cumple con toda la normativa de la Comunidad de Madrid.
  </p>
  <ul style="color: #4b5563; padding-left: 1.5rem; line-height: 1.8;">
    <li style="margin-bottom: 0.5rem;">Precios más competitivos que Chekin o GuestReady</li>
    <li style="margin-bottom: 0.5rem;">Registro automático en SES.Hospedajes</li>
    <li style="margin-bottom: 0.5rem;">Cumplimiento total con normativa VUT Madrid</li>
    <li>Interfaz en español y soporte local</li>
  </ul>
</div>`

    // Buscar un lugar adecuado para insertar Partee - después de la mención de Chekin/GuestReady
    const insertAfterPattern = /(<p[^>]*>Puedes utilizar software especializado como Chekin o GuestReady para automatizar este proceso y evitar sanciones por incumplimiento\.<\/p>)/

    if (insertAfterPattern.test(updatedContent)) {
      updatedContent = updatedContent.replace(
        insertAfterPattern,
        '$1' + parteeSection
      )
      console.log('✓ Añadida sección de Partee como alternativa económica')
    } else {
      console.log('⚠️ No se pudo encontrar el lugar exacto para insertar Partee')
    }
  } else {
    console.log('ℹ️ Partee ya está mencionado en el artículo')
  }

  // Actualizar el artículo
  await prisma.blogPost.update({
    where: { slug: 'vut-madrid-2025-requisitos-normativa-checklist' },
    data: { content: updatedContent }
  })

  console.log('\n✅ Artículo VUT Madrid actualizado correctamente')
  await prisma.$disconnect()
}

main()
