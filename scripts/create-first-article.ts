import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createFirstArticle() {
  const topic = "RevPAR vs Ocupación: La Métrica que Cambia Todo"
  const category = "GUIAS"

  // Find or create an admin user for the article
  let author = await prisma.user.findFirst({
    where: { isAdmin: true }
  })

  if (!author) {
    // If no admin exists, use the first user or create a temporary one
    author = await prisma.user.findFirst()

    if (!author) {
      // Create a temporary author
      author = await prisma.user.create({
        data: {
          email: 'alejandro@itineramio.com',
          name: 'Alejandro Satorra',
          password: 'temp',
          role: 'HOST',
          isAdmin: true
        }
      })
    }
  }

  const article = {
    authorId: author.id,
    title: topic,
    subtitle: "Por qué una ocupación del 90% puede ser señal de que estás perdiendo dinero",
    slug: "revpar-vs-ocupacion-metrica-que-cambia-todo",
    excerpt: "El 73% de anfitriones ESTRATEGAS cometen el mismo error: celebran un 90% de ocupación sin analizar su RevPAR. Descubre la métrica que realmente importa y cómo aumentar tus ingresos hasta un 40% sin llenar más días.",
    content: `
<h2>El Error del 90% de Ocupación</h2>

<p>Imagina dos apartamentos idénticos en la misma calle de Barcelona:</p>

<ul>
  <li><strong>Apartamento A:</strong> 90% de ocupación, precio medio 65€/noche → 1.755€/mes</li>
  <li><strong>Apartamento B:</strong> 70% de ocupación, precio medio 95€/noche → 1.995€/mes</li>
</ul>

<p>¿Cuál está ganando más dinero? <strong>El apartamento B gana 240€ más al mes</strong> (casi 3,000€ al año) trabajando <strong>menos días</strong>.</p>

<p>Si eres un <strong>ESTRATEGA</strong>, esta es la métrica que debería quitarte el sueño: <strong>RevPAR (Revenue per Available Night)</strong>.</p>

<h2>¿Qué es RevPAR y por qué importa más que la ocupación?</h2>

<p>RevPAR = <strong>Ingresos totales ÷ Noches disponibles</strong></p>

<p>Es la métrica que usan los hoteles profesionales porque responde a la única pregunta que importa: <strong>¿Cuánto dinero estoy generando por cada noche que mi propiedad existe?</strong></p>

<h3>Por qué es mejor que la ocupación</h3>

<p>La ocupación solo te dice qué % de noches están reservadas. Pero no te dice:</p>

<ul>
  <li>✅ Si estás cobrando suficiente</li>
  <li>✅ Si estás maximizando ingresos</li>
  <li>✅ Si tu pricing es competitivo</li>
  <li>✅ Si estás dejando dinero sobre la mesa</li>
</ul>

<p><strong>El RevPAR te dice todo eso en un solo número.</strong></p>

<h2>El Framework del ESTRATEGA: Cómo Calcular tu RevPAR</h2>

<h3>Paso 1: Calcula tu RevPAR actual</h3>

<p>Toma los últimos 3 meses completos:</p>

<div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 1rem; margin: 1.5rem 0;">
  <p style="margin: 0;"><strong>📊 Ejemplo Real:</strong></p>
  <ul style="margin: 0.5rem 0 0 0;">
    <li>Ingresos totales: 5,400€</li>
    <li>Noches disponibles: 90 (3 meses)</li>
    <li>RevPAR = 5,400€ ÷ 90 = 60€/noche</li>
  </ul>
</div>

<h3>Paso 2: Compara con tu competencia</h3>

<p>Ve a AirDNA o busca en Airbnb propiedades similares en tu zona:</p>

<ul>
  <li>Misma ubicación (radio de 500m)</li>
  <li>Mismas características (habitaciones, capacidad)</li>
  <li>Misma categoría (apartamento, casa, etc.)</li>
</ul>

<p><strong>Si tu RevPAR es menor que el promedio, estás perdiendo dinero.</strong></p>

<h3>Paso 3: Identifica el problema</h3>

<table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0;">
  <thead>
    <tr style="background-color: #f3f4f6;">
      <th style="padding: 0.75rem; text-align: left; border: 1px solid #e5e7eb;">Situación</th>
      <th style="padding: 0.75rem; text-align: left; border: 1px solid #e5e7eb;">Ocupación</th>
      <th style="padding: 0.75rem; text-align: left; border: 1px solid #e5e7eb;">Precio</th>
      <th style="padding: 0.75rem; text-align: left; border: 1px solid #e5e7eb;">Acción</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Alta ocupación, bajo RevPAR</td>
      <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">&gt;80%</td>
      <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Bajo</td>
      <td style="padding: 0.75rem; border: 1px solid #e5e7eb;"><strong>SUBIR PRECIO</strong></td>
    </tr>
    <tr style="background-color: #f9fafb;">
      <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Baja ocupación, alto precio</td>
      <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">&lt;60%</td>
      <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Alto</td>
      <td style="padding: 0.75rem; border: 1px solid #e5e7eb;"><strong>MEJORAR LISTING o bajar precio</strong></td>
    </tr>
    <tr>
      <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Ocupación media, RevPAR bajo</td>
      <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">60-70%</td>
      <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Medio</td>
      <td style="padding: 0.75rem; border: 1px solid #e5e7eb;"><strong>PRICING DINÁMICO</strong></td>
    </tr>
  </tbody>
</table>

<h2>3 Estrategias Avanzadas para Aumentar tu RevPAR</h2>

<h3>1. Pricing Dinámico Estratégico (El Método del 15%)</h3>

<p>No fijes un precio estático. Ajusta según demanda:</p>

<ul>
  <li><strong>Temporada alta:</strong> Precio base + 30-50%</li>
  <li><strong>Fin de semana:</strong> Precio base + 15-25%</li>
  <li><strong>Eventos locales:</strong> Precio base + 40-100%</li>
  <li><strong>Last minute (3 días antes):</strong> Precio base - 15%</li>
  <li><strong>Early bird (30+ días):</strong> Precio base - 10%</li>
</ul>

<div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 1rem; margin: 1.5rem 0;">
  <p style="margin: 0;"><strong>⚡ Quick Win:</strong> Implementa solo pricing para fines de semana esta semana. Aumento promedio de RevPAR: +8%</p>
</div>

<h3>2. El Truco del Mínimo de Noches</h3>

<p>Contraintuitivo pero efectivo:</p>

<ul>
  <li><strong>Temporada baja:</strong> Mínimo 1 noche (maximiza ocupación)</li>
  <li><strong>Temporada media:</strong> Mínimo 2 noches en fines de semana</li>
  <li><strong>Temporada alta:</strong> Mínimo 3-4 noches</li>
</ul>

<p><strong>Resultado:</strong> Menos reservas, pero más largas y más rentables. RevPAR aumenta porque reduces costos de limpieza por noche.</p>

<h3>3. Descuentos que Aumentan RevPAR (Sí, leíste bien)</h3>

<p>Dos descuentos que funcionan:</p>

<ul>
  <li><strong>Descuento por semana:</strong> 15% OFF → Aumenta reservas largas (menos limpieza, más RevPAR)</li>
  <li><strong>Early bird:</strong> 10% OFF a 30+ días → Aseguras ingresos futuros, reduces vacíos</li>
</ul>

<p><strong>No uses:</strong> Descuentos por mes (demasiado agresivo), descuentos last-minute superiores al 20% (devalúa tu propiedad).</p>

<h2>Caso Real: De 1,850€/mes a 2,600€/mes (Mismo Apartamento)</h2>

<p><strong>Cliente:</strong> Laura, apartamento 2 habitaciones en Valencia</p>

<p><strong>Situación inicial (Enero-Marzo):</strong></p>
<ul>
  <li>Ocupación: 88%</li>
  <li>Precio medio: 70€/noche</li>
  <li>Ingresos mensuales: 1,850€</li>
  <li>RevPAR: 61.5€</li>
</ul>

<p><strong>Cambios implementados:</strong></p>
<ol>
  <li>Subió precio base a 85€ (+21%)</li>
  <li>Implementó pricing dinámico (fines de semana +20%)</li>
  <li>Mínimo 2 noches en viernes-domingo</li>
  <li>Descuento 15% en reservas de 7+ noches</li>
</ol>

<p><strong>Resultados (Abril-Junio):</strong></p>
<ul>
  <li>Ocupación: 76% (-12 puntos)</li>
  <li>Precio medio: 95€/noche (+36%)</li>
  <li>Ingresos mensuales: 2,600€ (+40%)</li>
  <li>RevPAR: 86.5€ (+40%)</li>
</ul>

<div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 1rem; margin: 1.5rem 0;">
  <p style="margin: 0;"><strong>✅ Resultado:</strong> +750€/mes = 9,000€/año más ganando, trabajando menos días.</p>
</div>

<h2>Los 5 KPIs que TODO Estratega debe Trackear</h2>

<p>Además del RevPAR, monitoriza:</p>

<ol>
  <li><strong>ADR (Average Daily Rate):</strong> Precio medio por noche reservada</li>
  <li><strong>Occupancy Rate:</strong> % de noches ocupadas</li>
  <li><strong>Direct Booking Ratio:</strong> % de reservas fuera de OTAs</li>
  <li><strong>Guest Acquisition Cost:</strong> Cuánto gastas en conseguir cada reserva</li>
  <li><strong>Net Operating Income:</strong> Ingresos - gastos operativos</li>
</ol>

<h3>Dashboard Gratuito de Google Sheets</h3>

<p>Crea una hoja con estas columnas:</p>

<table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem;">
  <thead>
    <tr style="background-color: #f3f4f6;">
      <th style="padding: 0.5rem; text-align: left; border: 1px solid #e5e7eb;">Mes</th>
      <th style="padding: 0.5rem; text-align: left; border: 1px solid #e5e7eb;">Ingresos</th>
      <th style="padding: 0.5rem; text-align: left; border: 1px solid #e5e7eb;">Noches Ocupadas</th>
      <th style="padding: 0.5rem; text-align: left; border: 1px solid #e5e7eb;">Noches Disponibles</th>
      <th style="padding: 0.5rem; text-align: left; border: 1px solid #e5e7eb;">RevPAR</th>
      <th style="padding: 0.5rem; text-align: left; border: 1px solid #e5e7eb;">ADR</th>
      <th style="padding: 0.5rem; text-align: left; border: 1px solid #e5e7eb;">Ocupación</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 0.5rem; border: 1px solid #e5e7eb;">Enero</td>
      <td style="padding: 0.5rem; border: 1px solid #e5e7eb;">1,850€</td>
      <td style="padding: 0.5rem; border: 1px solid #e5e7eb;">26</td>
      <td style="padding: 0.5rem; border: 1px solid #e5e7eb;">31</td>
      <td style="padding: 0.5rem; border: 1px solid #e5e7eb;"><strong>59.7€</strong></td>
      <td style="padding: 0.5rem; border: 1px solid #e5e7eb;">71€</td>
      <td style="padding: 0.5rem; border: 1px solid #e5e7eb;">84%</td>
    </tr>
  </tbody>
</table>

<h2>Errores Fatales que Destruyen tu RevPAR</h2>

<h3>❌ Error 1: Bajar precio cuando baja la ocupación</h3>

<p><strong>Por qué es malo:</strong> Entras en una espiral de precios bajos. Tu RevPAR se hunde.</p>

<p><strong>Qué hacer en su lugar:</strong> Analiza POR QUÉ baja la ocupación (fotos malas, descripciones, reviews, competencia nueva). Arregla la causa raíz.</p>

<h3>❌ Error 2: Copiar los precios de tu competencia</h3>

<p><strong>Por qué es malo:</strong> Tu competencia puede estar equivocada. O puede tener costos diferentes.</p>

<p><strong>Qué hacer:</strong> Calcula TU precio óptimo basado en TUS costos + margen deseado. Luego compara.</p>

<h3>❌ Error 3: Obsesionarte con el 100% de ocupación</h3>

<p><strong>Por qué es malo:</strong> 100% de ocupación casi siempre significa que estás cobrando demasiado poco.</p>

<p><strong>Precio óptimo:</strong> 75-85% de ocupación con el precio más alto que el mercado soporte.</p>

<h2>Plan de Acción: Implementa Esto Esta Semana</h2>

<h3>Lunes (30 min)</h3>
<ul>
  <li>Calcula tu RevPAR de los últimos 3 meses</li>
  <li>Busca 5 competidores similares y estima su RevPAR</li>
  <li>Identifica si estás por encima o debajo del promedio</li>
</ul>

<h3>Martes (1 hora)</h3>
<ul>
  <li>Si tu RevPAR es bajo y ocupación alta (>85%): Sube precio base un 10%</li>
  <li>Si tu RevPAR es bajo y ocupación baja (<60%): Mejora fotos y descripción</li>
  <li>Si estás en medio: Implementa pricing dinámico para fines de semana</li>
</ul>

<h3>Miércoles-Viernes (30 min/día)</h3>
<ul>
  <li>Monitoriza nuevas reservas</li>
  <li>Observa si la ocupación baja (es normal al principio)</li>
  <li>Verifica que el RevPAR empiece a subir</li>
</ul>

<h3>Siguiente Mes</h3>
<ul>
  <li>Recalcula RevPAR</li>
  <li>Objetivo: +10-15% vs mes anterior</li>
  <li>Si no mejora: ajusta estrategia</li>
</ul>

<h2>Herramientas Recomendadas</h2>

<ul>
  <li><strong>AirDNA:</strong> Datos de mercado y competencia (desde 20$/mes)</li>
  <li><strong>PriceLabs:</strong> Pricing dinámico automático (desde 19$/mes)</li>
  <li><strong>Google Sheets:</strong> Dashboard gratuito (template incluido)</li>
  <li><strong>Itineramio:</strong> Manual digital que libera tiempo para analizar datos</li>
</ul>

<h2>Preguntas Frecuentes</h2>

<h3>¿Cuál es un buen RevPAR?</h3>

<p>Depende de tu mercado, pero como referencia:</p>

<ul>
  <li><strong>Madrid centro:</strong> 60-80€</li>
  <li><strong>Barcelona centro:</strong> 70-90€</li>
  <li><strong>Valencia:</strong> 50-70€</li>
  <li><strong>Costa (verano):</strong> 80-120€</li>
  <li><strong>Costa (invierno):</strong> 30-50€</li>
</ul>

<h3>¿Cada cuánto debo calcular mi RevPAR?</h3>

<p>Mínimo mensual. Los ESTRATEGAS top lo miran semanalmente.</p>

<h3>¿Puedo tener alto RevPAR y baja ocupación?</h3>

<p>Sí, y a veces es mejor. Ejemplo: 60% ocupación a 100€/noche = 60€ RevPAR vs 90% a 65€ = 58.5€ RevPAR.</p>

<h2>Conclusión: El RevPAR es tu Brújula</h2>

<p>Como ESTRATEGA, tu ventaja competitiva no es trabajar más horas, es tomar mejores decisiones basadas en datos.</p>

<p><strong>El RevPAR es tu métrica norte.</strong> Todo lo demás (ocupación, precio, descuentos) son solo variables que ajustas para maximizar esta cifra.</p>

<p>Implementa el framework de esta guía y en 30 días deberías ver un aumento del 10-15% en tu RevPAR. En 90 días, 20-30%.</p>

<div style="background-color: #f3e8ff; border-radius: 8px; padding: 1.5rem; margin: 2rem 0; text-align: center;">
  <p style="margin: 0; font-size: 1.1rem;"><strong>¿Listo para automatizar la gestión de tu apartamento?</strong></p>
  <p style="margin: 0.5rem 0 0 0; color: #6b7280;">Mientras optimizas tu RevPAR, deja que Itineramio se encargue de la información para tus huéspedes. Ahorra 15h/semana con nuestro manual digital interactivo.</p>
</div>
`,
    category,
    status: "PUBLISHED",
    featured: true,
    authorName: "Alejandro Satorra",
    metaTitle: "RevPAR vs Ocupación: La Métrica que Cambia Todo [Guía 2025]",
    metaDescription: "El 90% de ocupación puede significar que pierdes dinero. Descubre cómo calcular tu RevPAR y aumentar ingresos hasta un 40% sin llenar más noches. Guía completa para anfitriones ESTRATEGAS.",
    keywords: [
      "revpar airbnb",
      "ocupación vs ingresos",
      "pricing airbnb",
      "estrategia pricing apartamento turístico",
      "kpis alquiler vacacional",
      "aumentar ingresos airbnb",
      "revenue per available night",
      "optimización pricing",
      "pricing dinámico",
      "métricas apartamento turístico"
    ],
    tags: [
      "Estrategia",
      "Pricing",
      "KPIs",
      "RevPAR",
      "Optimización",
      "Métricas"
    ],
    readTime: 12,
    publishedAt: new Date()
  }

  try {
    const created = await prisma.blogPost.create({
      data: article
    })

    console.log('✅ Artículo creado exitosamente!')
    console.log('')
    console.log('📊 DETALLES DEL ARTÍCULO:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`ID: ${created.id}`)
    console.log(`Título: ${created.title}`)
    console.log(`Slug: ${created.slug}`)
    console.log(`Categoría: ${created.category}`)
    console.log(`Estado: ${created.status}`)
    console.log(`Destacado: ${created.featured}`)
    console.log(`Tiempo lectura: ${created.readTime} min`)
    console.log(`Palabras aprox: ${created.content.split(' ').length}`)
    console.log(`Keywords: ${created.keywords.length}`)
    console.log(`Tags: ${created.tags.length}`)
    console.log('')
    console.log('🔗 URLs:')
    console.log(`Público: /blog/${created.slug}`)
    console.log(`Admin: /admin/blog/${created.id}`)
    console.log('')
    console.log('📝 EXTRACTO:')
    console.log(created.excerpt)
    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return created
  } catch (error) {
    console.error('❌ Error creando artículo:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createFirstArticle()
  .then(() => {
    console.log('')
    console.log('✨ Listo! Ahora puedes ver el artículo en /blog')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
