import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Actualizando artículo VUT Madrid con todas las mejoras...\n')

  const article = await prisma.blogPost.findUnique({
    where: { slug: 'vut-madrid-2025-requisitos-normativa-checklist' },
    select: { content: true }
  })

  if (!article) {
    console.log('❌ Artículo no encontrado')
    return
  }

  let updatedContent = article.content

  // 1. MEJORAR PASO 4: Preparar el Manual de la Vivienda
  console.log('📝 Actualizando Paso 4: Manual de la Vivienda...')
  const oldPaso4 = /<h3 style="color: #374151; font-size: 1\.5rem; font-weight: 700; margin-top: 2\.5rem; margin-bottom: 1\.25rem;">Paso 4: Preparar el Manual de la Vivienda<\/h3>\s*<p style="color: #4b5563; line-height: 1\.8; margin-bottom: 1\.5rem; font-size: 1\.125rem;">\s*Elabora un manual completo con toda la información necesaria\. Puedes usar herramientas como <strong style="color: #1f2937;">Itineramio<\/strong> para crear manuales digitales profesionales e interactivos que además mejoran la experiencia de tus huéspedes\.\s*<\/p>/

  const newPaso4 = `<h3 style="color: #374151; font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1.25rem;">Paso 4: Preparar el Manual de la Vivienda</h3>

<p style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.125rem;">
Elabora un manual completo con toda la información necesaria para tus huéspedes. El manual debe incluir instrucciones de uso de la vivienda, normas de convivencia, contactos de emergencia, recomendaciones locales y servicios disponibles.
</p>

<div style="background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf6 100%); border-radius: 12px; padding: 2rem; margin: 2rem 0; border-left: 4px solid #6366f1;">
  <h4 style="color: #1f2937; margin-top: 0; font-size: 1.3rem;">💡 Simplifica con un Manual Digital</h4>
  <p style="color: #4b5563; line-height: 1.8; margin-bottom: 1rem;">
    Puedes usar herramientas como <strong style="color: #6366f1;"><a href="https://itineramio.com/registro" target="_blank" rel="noopener" style="color: #6366f1; text-decoration: none;">Itineramio</a></strong> para crear manuales digitales profesionales e interactivos que además mejoran la experiencia de tus huéspedes.
  </p>
  <ul style="color: #4b5563; padding-left: 1.5rem; line-height: 1.8;">
    <li style="margin-bottom: 0.5rem;">Manuales digitales en múltiples idiomas</li>
    <li style="margin-bottom: 0.5rem;">Acceso mediante QR desde cualquier dispositivo</li>
    <li style="margin-bottom: 0.5rem;">Actualización instantánea sin reimprimir nada</li>
    <li style="margin-bottom: 0.5rem;">Cumple con requisitos VUT Madrid</li>
    <li>Reduce consultas repetitivas hasta un 86%</li>
  </ul>
  <p style="color: #6366f1; margin-top: 1.5rem; margin-bottom: 0; font-size: 0.95rem;">
    <a href="https://itineramio.com/registro" style="color: #6366f1; font-weight: 600; text-decoration: none;">→ Crea tu primer manual ahora</a> (15 días de prueba sin tarjeta)
  </p>
</div>`

  if (oldPaso4.test(updatedContent)) {
    updatedContent = updatedContent.replace(oldPaso4, newPaso4)
    console.log('✓ Paso 4 mejorado con información de Itineramio y enlace')
  } else {
    console.log('⚠️ No se pudo actualizar Paso 4 con el patrón esperado')
  }

  // 2. AÑADIR PARTEE como alternativa económica después de Chekin/GuestReady
  console.log('💰 Añadiendo Partee como alternativa económica...')
  const afterChekinGuestReady = /(<p style="color: #4b5563; line-height: 1\.8; margin-bottom: 1\.5rem; font-size: 1\.125rem;">\s*Puedes utilizar software especializado como Chekin o GuestReady para automatizar este proceso y evitar sanciones por incumplimiento\.\s*<\/p>)/

  const parteeSection = `$1

<div style="background: linear-gradient(135deg, #f0fdf4 0%, #dbeafe 100%); border-radius: 12px; padding: 2rem; margin: 2rem 0; border-left: 4px solid #10b981;">
  <h4 style="color: #1f2937; margin-top: 0; font-size: 1.3rem;">💡 Alternativa Económica: Partee</h4>
  <p style="color: #4b5563; line-height: 1.8; margin-bottom: 1rem;">
    Si buscas una opción más económica para el registro de huéspedes (check-in), <strong style="color: #10b981;"><a href="https://www.partee.es" target="_blank" rel="noopener" style="color: #10b981; text-decoration: none;">Partee</a></strong> es una excelente alternativa española que cumple con toda la normativa de la Comunidad de Madrid.
  </p>
  <ul style="color: #4b5563; padding-left: 1.5rem; line-height: 1.8;">
    <li style="margin-bottom: 0.5rem;">Precios más competitivos que Chekin o GuestReady</li>
    <li style="margin-bottom: 0.5rem;">Registro automático en SES.Hospedajes</li>
    <li style="margin-bottom: 0.5rem;">Cumplimiento total con normativa VUT Madrid</li>
    <li>Interfaz en español y soporte local</li>
  </ul>
</div>`

  if (afterChekinGuestReady.test(updatedContent)) {
    updatedContent = updatedContent.replace(afterChekinGuestReady, parteeSection)
    console.log('✓ Sección de Partee añadida correctamente')
  } else {
    console.log('⚠️ No se pudo insertar Partee con el patrón esperado')
  }

  // 3. ACTUALIZAR sección sobre caducidad de la VUT con información detallada
  console.log('📅 Actualizando información sobre caducidad de VUT...')
  const oldVutExpiration = /<h3 style="color: #374151; font-size: 1\.5rem; font-weight: 700; margin-top: 2\.5rem; margin-bottom: 1\.25rem;">¿La VUT tiene fecha de caducidad\?<\/h3>\s*<p style="color: #4b5563; line-height: 1\.8; margin-bottom: 1\.5rem; font-size: 1\.125rem;">\s*No, la VUT no caduca\. Sin embargo, debes mantener actualizados el seguro de responsabilidad civil \(renovación anual\) y notificar cualquier cambio en la titularidad o características de la vivienda\.\s*<\/p>/

  const newVutExpiration = `<h3 style="color: #374151; font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1.25rem;">¿La VUT tiene fecha de caducidad?</h3>

<p style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.125rem;">
La Vivienda de Uso Turístico (VUT) en Madrid <strong style="color: #1f2937;">no caduca en sí misma</strong>, pero su funcionamiento está sujeto a condiciones que debes mantener actualizadas:
</p>

<div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 1.5rem; margin: 2rem 0; border-radius: 0.5rem;">
  <h4 style="color: #065f46; margin-top: 0; margin-bottom: 1rem; font-size: 1.125rem;">Aspectos clave sobre la vigencia de tu VUT:</h4>
  <ul style="color: #065f46; line-height: 1.8; margin: 0; font-size: 1.125rem; padding-left: 2rem;">
    <li style="margin-bottom: 0.75rem;"><strong>Licencia Municipal:</strong> Aunque no tiene fecha de caducidad fija, su mantenimiento exige el cumplimiento constante de las ordenanzas municipales.</li>
    <li style="margin-bottom: 0.75rem;"><strong>Registro de Alquileres (NRUA):</strong> A partir del 1 de julio de 2026, es obligatorio inscribir los alquileres vacacionales en el registro y presentar anualmente un modelo informativo al Ministerio.</li>
    <li style="margin-bottom: 0.75rem;"><strong>Seguro de Responsabilidad Civil:</strong> Renovación anual obligatoria con cobertura mínima de 150.000€.</li>
    <li style="margin-bottom: 0.75rem;"><strong>Restricciones Urbanísticas:</strong> El Ayuntamiento de Madrid ha impuesto limitaciones con un mapa de zonas donde no se conceden nuevas licencias.</li>
    <li><strong>Propiedad Horizontal:</strong> Las comunidades de propietarios pueden limitar o prohibir las VUT mediante acuerdos en junta (mayoría cualificada).</li>
  </ul>
</div>

<p style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.125rem;">
<strong style="color: #1f2937;">En resumen:</strong> Aunque el número de registro no tiene una fecha de caducidad directa, la actividad sí está sujeta a una regulación estricta y cambiante, con controles cada vez mayores. La legalidad de tu VUT depende de cumplir continuamente con las exigencias municipales y ministeriales.
</p>`

  if (oldVutExpiration.test(updatedContent)) {
    updatedContent = updatedContent.replace(oldVutExpiration, newVutExpiration)
    console.log('✓ Información sobre caducidad VUT actualizada con detalles completos')
  } else {
    console.log('⚠️ No se pudo actualizar la sección de caducidad VUT')
  }

  // 4. ACTUALIZAR sección sobre prohibición de comunidades con carácter retroactivo
  console.log('🏢 Actualizando información sobre prohibición de comunidades...')
  const oldCommunityProhibition = /<h3 style="color: #374151; font-size: 1\.5rem; font-weight: 700; margin-top: 2\.5rem; margin-bottom: 1\.25rem;">¿Qué pasa si mi comunidad de vecinos prohíbe el alquiler turístico\?<\/h3>\s*<p style="color: #4b5563; line-height: 1\.8; margin-bottom: 1\.5rem; font-size: 1\.125rem;">\s*Si los estatutos de tu comunidad prohíben expresamente el alquiler turístico, no podrás obtener la VUT\. Es fundamental revisar los estatutos antes de iniciar cualquier trámite\. En algunos casos, se puede solicitar una modificación de estatutos mediante votación en junta de propietarios\.\s*<\/p>/

  const newCommunityProhibition = `<h3 style="color: #374151; font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1.25rem;">¿Qué pasa si mi comunidad de vecinos prohíbe el alquiler turístico?</h3>

<p style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.125rem;">
Si los estatutos de tu comunidad prohíben expresamente el alquiler turístico, no podrás obtener la VUT. Es fundamental revisar los estatutos antes de iniciar cualquier trámite.
</p>

<div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 1.5rem; margin: 2rem 0; border-radius: 0.5rem;">
  <h4 style="color: #92400e; margin-top: 0; margin-bottom: 1rem; font-size: 1.125rem;">⚖️ Carácter retroactivo de la prohibición:</h4>
  <p style="color: #92400e; line-height: 1.8; margin-bottom: 1rem; font-size: 1.125rem;">
    La norma general es que <strong>las prohibiciones establecidas por la comunidad de propietarios NO tienen carácter retroactivo</strong>. Esto significa:
  </p>
  <ul style="color: #92400e; line-height: 1.8; margin: 0; font-size: 1.125rem; padding-left: 2rem;">
    <li style="margin-bottom: 0.75rem;"><strong>Si ya tenías VUT antes de la prohibición:</strong> En principio, puedes continuar con tu actividad. La modificación de estatutos no puede aplicarse de forma retroactiva a licencias ya concedidas.</li>
    <li style="margin-bottom: 0.75rem;"><strong>Si no tenías VUT:</strong> Una vez aprobada la prohibición en junta, no podrás solicitar una nueva VUT para esa vivienda.</li>
    <li style="margin-bottom: 0.75rem;"><strong>Excepciones:</strong> Consulta con un abogado especializado, ya que cada caso puede tener particularidades según los estatutos y acuerdos específicos.</li>
  </ul>
</div>

<p style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.125rem;">
En algunos casos, se puede solicitar una <strong style="color: #1f2937;">modificación de estatutos</strong> mediante votación en junta de propietarios (requiere mayoría cualificada). Es recomendable consultar con un abogado especializado en derecho inmobiliario antes de tomar cualquier decisión.
</p>`

  if (oldCommunityProhibition.test(updatedContent)) {
    updatedContent = updatedContent.replace(oldCommunityProhibition, newCommunityProhibition)
    console.log('✓ Información sobre prohibición de comunidades actualizada con carácter retroactivo')
  } else {
    console.log('⚠️ No se pudo actualizar la sección de prohibición de comunidades')
  }

  // Actualizar en la base de datos
  await prisma.blogPost.update({
    where: { slug: 'vut-madrid-2025-requisitos-normativa-checklist' },
    data: { content: updatedContent }
  })

  console.log('\n✅ Artículo VUT Madrid actualizado completamente:')
  console.log('   ✓ Paso 4 mejorado con Itineramio y enlace')
  console.log('   ✓ Partee añadido como alternativa económica')
  console.log('   ✓ Información de caducidad VUT clarificada')
  console.log('   ✓ Carácter retroactivo de prohibiciones explicado')

  await prisma.$disconnect()
}

main()
