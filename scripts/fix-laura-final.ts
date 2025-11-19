import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Actualizando caso Laura con correcciones finales...\n')

  const laura = await prisma.blogPost.findUnique({
    where: { slug: 'caso-laura-de-1800-a-3200-euros-mes-historia-completa' }
  })

  if (!laura) {
    console.error('❌ Artículo no encontrado')
    return
  }

  let content = laura.content

  // 1. Cambiar "no llego a fin de mes" por algo más realista
  content = content.replace(
    /"Tengo casi el 90% de ocupación pero no llego a fin de mes\. ¿Cómo es posible\?"/g,
    '"Tengo el 90% de ocupación pero gano menos de lo que debería. Mis vecinos con menos ocupación ganan más que yo."'
  )

  content = content.replace(
    /"Con esta rentabilidad, estás ganando menos que si alquilaras largo plazo\."/g,
    '"Con estos números, estás dejando dinero sobre la mesa. Podrías ganar un 50% más con la misma ocupación."'
  )

  // 2. Quitar "Laura me contactó" y "auditoría"
  content = content.replace(
    /<p>Laura me contactó en febrero\. Primera sesión: auditoría completa\.<\/p>/g,
    '<p>En febrero, Laura decidió analizar su negocio a fondo para entender por qué no era tan rentable como esperaba.</p>'
  )

  // 3. Cambiar cerradura TTLock por Yacan
  content = content.replace(
    /2 cerraduras TTLock: 500€ \(one-time\)/g,
    '2 cerraduras Yacan con telefonillo: 900€ (450€/unidad, one-time)'
  )

  content = content.replace(
    /Cerraduras: 500€ \(one-time\)/g,
    'Cerraduras Yacan: 900€ (one-time)'
  )

  // 4. Cambiar precio fotógrafo y añadir recomendación Airbnb
  content = content.replace(
    /Contrató fotógrafo especializado en inmobiliaria \(400€ por los 2 apartamentos\)/g,
    'Contrató fotógrafo a través de Airbnb (150€/apartamento = 300€ total)'
  )

  content = content.replace(
    /Fotos: 400€ \(one-time\)/g,
    'Fotos: 300€ (one-time)'
  )

  // 5. Mejorar sección de fotografía con detalles de antes/después
  content = content.replace(
    /<h3>Semana 1-2: Fotografía Profesional<\/h3>\s*<p><strong>Acción:<\/strong><\/p>\s*<ul>[\s\S]*?<\/ul>/,
    `<h3>Semana 1-2: Fotografía Profesional</h3>

<p><strong>Acción:</strong></p>
<ul>
  <li>Contrató fotógrafo a través de Airbnb (150€/apartamento = 300€ total)</li>
  <li><strong>¿Por qué a través de Airbnb?</strong> Cuando contratas fotógrafo por la plataforma, Airbnb marca tu listing como "Fotos profesionales" y te da boost en el algoritmo de búsqueda</li>
  <li>Preparación previa: Limpieza profunda, flores, luces cálidas</li>
  <li><strong>Antes:</strong> 6 fotos hechas con móvil (solo interiores básicos)</li>
  <li><strong>Después:</strong> 40 fotos profesionales por apartamento:
    <ul>
      <li>20 fotos interiores (cada rincón, detalles decorativos)</li>
      <li>10 fotos exteriores (fachada, barrio, vistas desde ventanas)</li>
      <li>5 fotos de amenities (cocina equipada, baño, ropa de cama premium)</li>
      <li>5 fotos de contexto (cafeterías cercanas, metro, parques)</li>
    </ul>
  </li>
  <li><strong>Bonus añadido:</strong> Walking map personalizado mostrando distancias a pie desde el apartamento a todos los puntos de interés de Ruzafa</li>
</ul>

<p><strong>Resultado:</strong></p>
<ul>
  <li>CTR (click-through rate) aumentó de 2.1% a 4.8%</li>
  <li><strong>Efecto Airbnb:</strong> El boost del algoritmo multiplicó las impresiones × 2.3</li>
  <li>Más consultas de reservas "premium" (familias, nómadas digitales con presupuesto alto)</li>
  <li>Walking map mencionado positivamente en el 40% de las reviews</li>
</ul>`
  )

  // 6. Cambiar precio Itineramio de 49€ a 29€/mes (plan HOST)
  content = content.replace(
    /Itineramio \(manual digital\): 49€\/mes/g,
    'Itineramio plan HOST (manual digital): 29€/mes'
  )

  // 7. Actualizar inversión con nuevos precios
  // Fotos: 300€ (antes 400€)
  // Cerraduras: 900€ (antes 500€)
  // Software: 77€/mes × 6 = 462€ (antes 97€/mes × 6 = 582€)
  //   - Hospitable: 29€
  //   - Itineramio: 29€ (antes 49€)
  //   - PriceLabs: 19€
  // Mejoras: 200€
  // TOTAL: 300 + 900 + 462 + 200 = 1,862€

  content = content.replace(
    /<p><strong>Inversión \(6 meses\):<\/strong><\/p>\s*<ul>[\s\S]*?<li><strong>Total: [^<]+<\/strong><\/li>\s*<\/ul>/,
    `<p><strong>Inversión (6 meses):</strong></p>
<ul>
  <li>Fotos: 300€ (one-time)</li>
  <li>Cerraduras Yacan: 900€ (one-time)</li>
  <li>Software: 77€/mes × 6 = 462€
    <ul>
      <li>Hospitable (PMS): 29€/mes</li>
      <li>Itineramio plan HOST: 29€/mes</li>
      <li>PriceLabs: 19€/mes</li>
    </ul>
  </li>
  <li>Mejoras (Netflix, Nespresso, etc.): 200€</li>
  <li><strong>Total: 1,862€</strong></li>
</ul>`
  )

  // 8. Recalcular ROI: 6,341€ / 1,862€ × 100 = 340.5% ≈ 340%
  content = content.replace(
    /<p><strong>Retorno \(incremento de beneficio neto 6 meses\):<\/strong><\/p>\s*<ul>[\s\S]*?<\/ul>/,
    `<p><strong>Retorno (incremento de beneficio neto 6 meses):</strong></p>
<ul>
  <li>Beneficio adicional en 6 meses: +6,341€</li>
  <li><strong>ROI: 340%</strong> (6,341 / 1,862 × 100)</li>
  <li><strong>Recuperó inversión en: 7 semanas</strong></li>
</ul>`
  )

  // Actualizar también en la sección de tabla de inversión al final
  content = content.replace(
    /<li>Software: 97€\/mes × 6 = 582€<\/li>/g,
    '<li>Software: 77€/mes × 6 = 462€</li>'
  )

  // Actualizar listado de software en automatización básica
  content = content.replace(
    /<li>Itineramio \(manual digital\): 49€\/mes<\/li>/g,
    '<li>Itineramio plan HOST (manual digital): 29€/mes</li>'
  )

  await prisma.blogPost.update({
    where: { id: laura.id },
    data: { content }
  })

  console.log('✅ Caso Laura actualizado correctamente:\n')
  console.log('📝 CAMBIOS APLICADOS:')
  console.log('   ✓ Frase "no llego a fin de mes" → "gano menos de lo que debería"')
  console.log('   ✓ Eliminada mención de "auditoría"')
  console.log('   ✓ Cerradura: TTLock 500€ → Yacan 900€ (450€/ud con telefonillo)')
  console.log('   ✓ Fotos: 400€ → 300€ (150€/apto vía Airbnb)')
  console.log('   ✓ Añadido boost de algoritmo de Airbnb por fotos profesionales')
  console.log('   ✓ Detalle de fotos: 6 básicas → 40 profesionales (interiores + exteriores)')
  console.log('   ✓ Añadido walking map personalizado')
  console.log('   ✓ Itineramio: 49€ → 29€/mes (plan HOST)')
  console.log('   ✓ Software total: 97€ → 77€/mes')
  console.log('')
  console.log('💰 NÚMEROS FINALES:')
  console.log('   - Inversión total: 1,862€')
  console.log('   - Beneficio 6 meses: +6,341€')
  console.log('   - ROI: 340%')
  console.log('   - Recuperación: 7 semanas')

  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
