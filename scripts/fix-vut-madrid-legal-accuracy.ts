import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Corrigiendo precisión legal del artículo VUT Madrid...\n')

  const article = await prisma.blogPost.findUnique({
    where: { slug: 'vut-madrid-2025-requisitos-normativa-checklist' },
    select: { content: true }
  })

  if (!article) {
    console.log('❌ Artículo no encontrado')
    return
  }

  let updatedContent = article.content

  // 1. AÑADIR DISCLAIMER LEGAL AL PRINCIPIO (después del primer párrafo introductorio)
  console.log('1. Añadiendo disclaimer legal...')
  const afterIntroPattern = /(<p style="color: #4b5563; line-height: 1\.8; margin-bottom: 1\.5rem; font-size: 1\.125rem;">\s*<strong style="color: #1f2937;">Sin la VUT, no puedes:<\/strong>.*?<\/p>)/s

  const legalDisclaimer = `$1

<div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 1.5rem; margin: 2rem 0; border-radius: 0.5rem;">
  <p style="color: #92400e; line-height: 1.8; margin: 0; font-size: 1rem;">
    <strong style="color: #92400e;">⚖️ Aviso legal:</strong> Esta guía ofrece información general sobre el proceso de VUT en Madrid. La normativa es compleja y combina regulación autonómica (Comunidad de Madrid), municipal (Ayuntamiento de Madrid) y estatal (Propiedad Horizontal, Registro de Viajeros). Para decisiones de inversión o trámites específicos, consulte siempre con un abogado especializado en derecho urbanístico y turístico actualizado a 2025.
  </p>
</div>`

  updatedContent = updatedContent.replace(afterIntroPattern, legalDisclaimer)
  console.log('✓ Disclaimer legal añadido')

  // 2. CORREGIR SEGURO - De requisito a recomendación
  console.log('2. Corrigiendo requisitos de seguro...')
  const oldInsurance = /<h3 style="color: #374151[^>]*>1\. Seguro de Responsabilidad Civil<\/h3>\s*<p style="color: #4b5563[^>]*>\s*El seguro de responsabilidad civil es <strong[^>]*>obligatorio<\/strong> para todas las VUT en Madrid\. Los requisitos mínimos son:\s*<\/p>\s*<ul style="[^"]*">\s*<li[^>]*><strong[^>]*>Cobertura mínima:<\/strong> 150\.000 euros[^<]*<\/li>\s*<li[^>]*><strong[^>]*>Actividad específica:<\/strong>[^<]*<\/li>\s*<li[^>]*><strong[^>]*>Vigencia:<\/strong>[^<]*<\/li>\s*<li[^>]*><strong[^>]*>Compañías recomendadas:<\/strong>[^<]*<\/li>\s*<\/ul>/s

  const newInsurance = `<h3 style="color: #374151; font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1.25rem;">1. Seguro de Responsabilidad Civil</h3>

<p style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.125rem;">
El seguro de responsabilidad civil es <strong style="color: #1f2937;">obligatorio</strong> para todas las VUT en Madrid. Debe cubrir los riesgos de los usuarios (daños corporales, materiales y perjuicios económicos) y mantenerse en vigor.
</p>

<div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 1.5rem 0; border-radius: 0.5rem;">
  <p style="color: #1e40af; line-height: 1.8; margin-bottom: 1rem; font-size: 1.125rem;">
    <strong style="color: #1e40af;">💡 Requisitos legales vs. práctica de mercado:</strong>
  </p>
  <p style="color: #1e40af; line-height: 1.8; margin-bottom: 1rem; font-size: 1rem;">
    La normativa de la Comunidad de Madrid <strong>no especifica una suma asegurada mínima</strong>. Sin embargo, la práctica habitual del sector recomienda:
  </p>
  <ul style="color: #1e40af; line-height: 1.8; margin: 0; font-size: 1rem; padding-left: 2rem;">
    <li style="margin-bottom: 0.75rem;"><strong>Cobertura recomendada:</strong> Mínimo 150.000 euros</li>
    <li style="margin-bottom: 0.75rem;"><strong>Vigencia:</strong> Renovación anual</li>
    <li style="margin-bottom: 0.75rem;"><strong>Actividad específica:</strong> Debe indicar "alquiler turístico" o "VUT"</li>
    <li><strong>Compañías:</strong> Mapfre, AXA, Allianz o especializadas en alquileres turísticos</li>
  </ul>
</div>`

  if (oldInsurance.test(updatedContent)) {
    updatedContent = updatedContent.replace(oldInsurance, newInsurance)
    console.log('✓ Sección de seguro corregida')
  }

  // 3. CORREGIR MANUAL - De obligatorio a buena práctica
  console.log('3. Corrigiendo Manual de la Vivienda...')
  const oldManual = /<h3 style="color: #374151[^>]*>3\. Manual de la Vivienda<\/h3>\s*<p style="color: #4b5563[^>]*>\s*El Manual de la Vivienda es un documento informativo que debes proporcionar a tus huéspedes\. Debe incluir:\s*<\/p>/s

  const newManual = `<h3 style="color: #374151; font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1.25rem;">3. Información para Huéspedes</h3>

<p style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.125rem;">
La normativa exige que la vivienda disponga de <strong style="color: #1f2937;">rótulo visible con teléfonos y direcciones de emergencia</strong> (al menos en español e inglés) y <strong style="color: #1f2937;">teléfono de atención permanente</strong>. Aunque no existe un "Manual de la Vivienda" obligatorio como documento formal, es <strong style="color: #1f2937;">altamente recomendable</strong> proporcionar información completa que incluya:
</p>`

  updatedContent = updatedContent.replace(oldManual, newManual)
  console.log('✓ Manual corregido como buena práctica')

  // 4. Actualizar el texto sobre idiomas del manual
  const oldLanguageReq = /<p style="color: #4b5563[^>]*>\s*El manual debe estar disponible en <strong[^>]*>español<\/strong> y, al menos, en <strong[^>]*>inglés<\/strong>\. Se recomienda también incluir versiones en francés y alemán según tu público objetivo\.\s*<\/p>/s

  const newLanguageReq = `<p style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.125rem;">
<strong style="color: #1f2937;">Requisito legal:</strong> El rótulo de emergencias debe estar al menos en español e inglés. Para la información adicional (manual), se recomienda incluir también estos idiomas y otros según tu público objetivo.
</p>`

  updatedContent = updatedContent.replace(oldLanguageReq, newLanguageReq)

  // 5. AÑADIR SECCIÓN SOBRE LICENCIA URBANÍSTICA MUNICIPAL
  console.log('4. Añadiendo información sobre licencia urbanística...')
  const afterRequisitosSection = /(<h2 style="color: #1f2937[^>]*>Proceso paso a paso para obtener tu VUT Madrid<\/h2>)/

  const urbanLicenseSection = `<div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0; border-radius: 0.5rem;">
  <h4 style="color: #991b1b; margin-top: 0; margin-bottom: 1rem; font-size: 1.3rem;">⚠️ Doble tramitación: Comunidad + Ayuntamiento</h4>
  <p style="color: #991b1b; line-height: 1.8; margin-bottom: 1rem; font-size: 1.125rem;">
    En Madrid capital necesitas <strong>DOS autorizaciones diferentes</strong>:
  </p>
  <ol style="color: #991b1b; line-height: 1.8; margin: 0; font-size: 1rem; padding-left: 2rem;">
    <li style="margin-bottom: 0.75rem;"><strong>Declaración responsable VUT</strong> ante la Comunidad de Madrid (parte turística) - GRATIS</li>
    <li style="margin-bottom: 0.75rem;"><strong>Licencia urbanística de actividad y funcionamiento</strong> ante el Ayuntamiento de Madrid (parte urbanística) - CON TASAS</li>
  </ol>
  <p style="color: #991b1b; line-height: 1.8; margin-top: 1rem; margin-bottom: 0; font-size: 1rem;">
    Esta guía se centra principalmente en la parte autonómica (VUT), pero <strong>no puedes operar legalmente solo con ella</strong>. Consulta con un técnico competente sobre los requisitos urbanísticos específicos de tu distrito y edificio.
  </p>
</div>

$1`

  updatedContent = updatedContent.replace(afterRequisitosSection, urbanLicenseSection)
  console.log('✓ Sección de licencia urbanística añadida')

  // 6. AÑADIR SECCIÓN SOBRE PLAN RESIDE Y RESTRICCIONES
  console.log('5. Añadiendo información sobre Plan RESIDE...')
  const afterViabilidadStep = /(<h3 style="color: #374151[^>]*>Paso 1: Verificar viabilidad de tu vivienda<\/h3>\s*<p style="color: #4b5563[^>]*>\s*Antes de iniciar el proceso, debes asegurarte de que tu vivienda cumple con los requisitos básicos:\s*<\/p>)/s

  const resideSection = `$1

<div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 1.5rem; margin: 1.5rem 0; border-radius: 0.5rem;">
  <h4 style="color: #991b1b; margin-top: 0; margin-bottom: 1rem; font-size: 1.25rem;">🚨 Plan RESIDE 2025: Restricciones en Madrid Centro</h4>
  <p style="color: #991b1b; line-height: 1.8; margin-bottom: 1rem; font-size: 1rem;">
    <strong>Muy importante:</strong> El Plan RESIDE del Ayuntamiento de Madrid establece restricciones muy estrictas, especialmente en el centro histórico:
  </p>
  <ul style="color: #991b1b; line-height: 1.8; margin: 0; font-size: 1rem; padding-left: 2rem;">
    <li style="margin-bottom: 0.75rem;"><strong>Centro histórico:</strong> Prohibidos pisos turísticos en edificios residenciales. Solo se permiten en edificios de uso exclusivo terciario/hospedaje.</li>
    <li style="margin-bottom: 0.75rem;"><strong>Fuera del centro:</strong> Condiciones específicas según distrito. En edificios con uso mixto (residencial + turístico), se puede exigir acceso independiente en planta baja y primera.</li>
    <li><strong>Verificación esencial:</strong> Antes de invertir, consulta el mapa de zonificación del Plan RESIDE y las restricciones específicas de tu distrito.</li>
  </ul>
</div>`

  updatedContent = updatedContent.replace(afterViabilidadStep, resideSection)
  console.log('✓ Información sobre Plan RESIDE añadida')

  // 7. CORREGIR REQUISITOS DE VIABILIDAD - Quitar "acceso independiente" como universal
  console.log('6. Corrigiendo requisitos de viabilidad...')
  const oldViabilityList = /<ul style="color: #4b5563[^>]*>\s*<li[^>]*><strong[^>]*>Acceso independiente:<\/strong> La vivienda debe tener entrada propia desde la calle<\/li>\s*<li[^>]*><strong[^>]*>Superficie mínima:<\/strong>[^<]*<\/li>\s*<li[^>]*><strong[^>]*>Estatutos de la comunidad:<\/strong>[^<]*<\/li>\s*<li[^>]*><strong[^>]*>Zona permitida:<\/strong>[^<]*<\/li>\s*<\/ul>/s

  const newViabilityList = `<ul style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.125rem; padding-left: 2rem;">
  <li style="margin-bottom: 0.75rem;"><strong style="color: #1f2937;">Superficie mínima:</strong> Variable según el número de plazas ofertadas</li>
  <li style="margin-bottom: 0.75rem;"><strong style="color: #1f2937;">Compatibilidad urbanística:</strong> Verificar que tu distrito y edificio permiten VUT según Plan RESIDE</li>
  <li style="margin-bottom: 0.75rem;"><strong style="color: #1f2937;">Comunidad de propietarios:</strong> Necesitas su <strong>aprobación expresa</strong> (no solo que no lo prohíban) - Ver detalles abajo</li>
  <li style="margin-bottom: 0.75rem;"><strong style="color: #1f2937;">Acceso (si aplica):</strong> En edificios mixtos fuera del centro, puede exigirse acceso independiente en PB y P1</li>
</ul>`

  updatedContent = updatedContent.replace(oldViabilityList, newViabilityList)
  console.log('✓ Requisitos de viabilidad actualizados')

  // 8. ACTUALIZAR SECCIÓN COMUNIDAD PROPIETARIOS con exigencia 2025
  console.log('7. Actualizando requisitos de comunidad de propietarios...')
  const oldCommunitySection = /(<h3 style="color: #374151[^>]*>¿Qué pasa si mi comunidad de vecinos prohíbe el alquiler turístico\?<\/h3>[\s\S]*?)<h3 style="color: #374151[^>]*>¿Necesito darme de alta como autónomo/

  const newCommunitySection = `<h3 style="color: #374151; font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1.25rem;">¿Qué necesito de mi comunidad de propietarios?</h3>

<div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 0.5rem;">
  <h4 style="color: #1e40af; margin-top: 0; margin-bottom: 1rem; font-size: 1.125rem;">📋 Requisitos actualizados 2025</h4>
  <p style="color: #1e40af; line-height: 1.8; margin-bottom: 1rem; font-size: 1.125rem;">
    Desde diciembre de 2025, la Comunidad de Madrid exige <strong>DOS documentos</strong>:
  </p>
  <ol style="color: #1e40af; line-height: 1.8; margin-bottom: 1rem; font-size: 1rem; padding-left: 2rem;">
    <li style="margin-bottom: 0.75rem;"><strong>Certificado de que la comunidad NO ha prohibido la actividad</strong> en sus estatutos o acuerdos.</li>
    <li style="margin-bottom: 0.75rem;"><strong>Aprobación expresa de la comunidad de propietarios</strong> para realizar la actividad de VUT (no basta con que no esté prohibida).</li>
  </ol>
  <p style="color: #1e40af; line-height: 1.8; margin-bottom: 1rem; font-size: 1rem;">
    Además, desde el <strong>3 de abril de 2025</strong>, la reforma de la Ley de Propiedad Horizontal establece:
  </p>
  <ul style="color: #1e40af; line-height: 1.8; margin: 0; font-size: 1rem; padding-left: 2rem;">
    <li style="margin-bottom: 0.75rem;">Se requiere <strong>aprobación de 3/5 partes (60%)</strong> de los propietarios para autorizar una VUT.</li>
    <li style="margin-bottom: 0.75rem;">La comunidad puede establecer <strong>recargos de hasta el 20%</strong> en gastos comunitarios para VUT.</li>
    <li>Las prohibiciones futuras pueden afectar a VUT existentes si se aprueban con la mayoría requerida.</li>
  </ul>
</div>

<div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 1.5rem; margin: 2rem 0; border-radius: 0.5rem;">
  <h4 style="color: #92400e; margin-top: 0; margin-bottom: 1rem; font-size: 1.125rem;">⚖️ Si la comunidad prohíbe el alquiler turístico</h4>
  <p style="color: #92400e; line-height: 1.8; margin-bottom: 1rem; font-size: 1.125rem;">
    Si los estatutos prohíben expresamente el alquiler turístico, no podrás obtener la VUT. Sin embargo:
  </p>
  <p style="color: #92400e; line-height: 1.8; margin-bottom: 1rem; font-size: 1rem;">
    <strong>Carácter retroactivo:</strong> La norma general es que las prohibiciones establecidas por la comunidad <strong>NO tienen carácter retroactivo</strong>:
  </p>
  <ul style="color: #92400e; line-height: 1.8; margin: 0; font-size: 1rem; padding-left: 2rem;">
    <li style="margin-bottom: 0.75rem;"><strong>Si ya tenías VUT antes de la prohibición:</strong> En principio, puedes continuar (aunque pueden aplicarte recargos).</li>
    <li style="margin-bottom: 0.75rem;"><strong>Si no tenías VUT:</strong> Una vez aprobada la prohibición, no podrás solicitarla.</li>
    <li>En algunos casos, puedes solicitar <strong>modificación de estatutos</strong> mediante votación en junta (requiere mayoría cualificada). Consulta con un abogado especializado.</li>
  </ul>
</div>

<h3 style="color: #374151; font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1.25rem;">¿Necesito darme de alta como autónomo`

  updatedContent = updatedContent.replace(oldCommunitySection, newCommunitySection)
  console.log('✓ Sección comunidad propietarios actualizada con requisitos 2025')

  // 9. MATIZAR MULTAS REGISTRO VIAJEROS
  console.log('8. Matizando multas de registro de viajeros...')
  const oldTravelersText = /<p style="color: #4b5563[^>]*>\s*Puedes utilizar software especializado como Chekin o GuestReady para automatizar este proceso y evitar sanciones por incumplimiento\.\s*<\/p>/

  const newTravelersText = `<p style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.125rem;">
Puedes utilizar software especializado como Chekin o GuestReady para automatizar este proceso y evitar sanciones por incumplimiento.
</p>

<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 1.5rem 0; border-radius: 0.5rem;">
  <p style="color: #991b1b; line-height: 1.8; margin-bottom: 1rem; font-size: 1rem;">
    <strong style="color: #991b1b;">⚠️ Régimen sancionador Real Decreto 933/2021:</strong>
  </p>
  <ul style="color: #991b1b; line-height: 1.8; margin: 0; font-size: 1rem; padding-left: 2rem;">
    <li style="margin-bottom: 0.75rem;"><strong>Comunicar fuera de plazo</strong> (más de 24h): Infracción leve - Multas de 100 a 600 €</li>
    <li><strong>No registrar/comunicar en absoluto:</strong> Infracción grave - Multas de 601 a 30.000 €</li>
  </ul>
</div>`

  updatedContent = updatedContent.replace(oldTravelersText, newTravelersText)
  console.log('✓ Sanciones registro viajeros matizadas')

  // 10. CAMBIAR PLACA DE RECOMENDADO A OBLIGATORIO
  console.log('9. Corrigiendo placa identificativa...')
  updatedContent = updatedContent.replace(
    /☐ Placa identificativa de VUT en la entrada \(recomendado\)/g,
    '☐ Placa identificativa de VUT en la entrada (obligatorio)'
  )
  console.log('✓ Placa marcada como obligatoria')

  // 11. CORREGIR COSTES - Añadir matiz sobre tasas municipales
  console.log('10. Corrigiendo información de costes...')
  const oldCosts = /<p style="color: #4b5563[^>]*>\s*<strong[^>]*>Inversión inicial total aproximada:<\/strong> 315-790€<br>\s*<strong[^>]*>Gastos anuales recurrentes:<\/strong> 100-440€\s*<\/p>/s

  const newCosts = `<p style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.125rem;">
<strong style="color: #1f2937;">Inversión inicial total aproximada (parte autonómica):</strong> 315-790€<br>
<strong style="color: #1f2937;">Gastos anuales recurrentes:</strong> 100-440€
</p>

<div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 1.5rem; margin: 1.5rem 0; border-radius: 0.5rem;">
  <p style="color: #92400e; line-height: 1.8; margin: 0; font-size: 1rem;">
    <strong style="color: #92400e;">💰 Importante:</strong> Estos costes NO incluyen las tasas y honorarios técnicos de la licencia urbanística municipal (Ayuntamiento de Madrid), que varían según el tipo de vivienda, superficie, y complejidad del trámite. Consulta con un técnico competente para un presupuesto completo.
  </p>
</div>`

  updatedContent = updatedContent.replace(oldCosts, newCosts)
  console.log('✓ Costes actualizados con matiz sobre tasas municipales')

  // Actualizar en la base de datos
  await prisma.blogPost.update({
    where: { slug: 'vut-madrid-2025-requisitos-normativa-checklist' },
    data: { content: updatedContent }
  })

  console.log('\n✅ Artículo VUT Madrid actualizado con correcciones legales:')
  console.log('   ✓ Disclaimer legal añadido')
  console.log('   ✓ Seguro corregido (recomendación vs requisito)')
  console.log('   ✓ Manual corregido (buena práctica, no obligatorio)')
  console.log('   ✓ Licencia urbanística municipal explicada')
  console.log('   ✓ Plan RESIDE y restricciones añadidas')
  console.log('   ✓ Acceso independiente matizado')
  console.log('   ✓ Comunidad propietarios actualizada con requisitos 2025')
  console.log('   ✓ Multas registro viajeros matizadas')
  console.log('   ✓ Placa identificativa marcada como obligatoria')
  console.log('   ✓ Costes actualizados con tasas municipales')

  await prisma.$disconnect()
}

main()
