import { PrismaClient, BlogCategory, BlogStatus } from '@prisma/client'

const prisma = new PrismaClient()

const demoArticles = [
  {
    title: 'Cómo Optimizar el Precio de tu Apartamento Turístico en 2025',
    subtitle: 'Estrategias probadas para aumentar tus ingresos hasta un 40%',
    slug: 'como-optimizar-precio-apartamento-turistico-2025',
    excerpt: 'Descubre las técnicas más efectivas de pricing dinámico que están usando los super hosts para maximizar su rentabilidad. Basado en datos reales de más de 1,200 propiedades.',
    category: 'GUIAS',
    tags: ['pricing', 'airbnb', 'rentabilidad', 'estrategia'],
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=630&fit=crop',
    coverImageAlt: 'Persona analizando gráficos de precios en laptop',
    metaTitle: 'Guía Completa: Optimizar Precios Apartamento Turístico 2025',
    metaDescription: 'Aprende a optimizar el precio de tu apartamento turístico con estrategias probadas. Aumenta tus ingresos hasta un 40% con pricing dinámico.',
    keywords: ['precio apartamento turístico', 'pricing dinámico', 'airbnb pricing', 'optimizar ingresos'],
    content: `
<h2>Por qué el Precio Correcto lo Cambia Todo</h2>
<p>Fijar el precio adecuado para tu apartamento turístico puede significar la diferencia entre tener una ocupación del 60% o del 90%. Según nuestros datos de más de 1,200 propiedades, los anfitriones que implementan pricing dinámico aumentan sus ingresos en un promedio del 37%.</p>

<h2>Estrategia #1: Pricing Dinámico por Temporada</h2>
<p>No todos los meses son iguales. Implementa estos multiplicadores:</p>
<ul>
  <li><strong>Temporada Alta (Julio-Agosto):</strong> +40-60% sobre precio base</li>
  <li><strong>Temporada Media:</strong> Precio base</li>
  <li><strong>Temporada Baja:</strong> -20-30% para mantener ocupación</li>
</ul>

<h2>Estrategia #2: Precios por Anticipación</h2>
<p>Los estudios demuestran que las reservas con más de 30 días de antelación permiten precios un 15% superiores.</p>

<h2>Estrategia #3: Análisis de Competencia</h2>
<p>Monitoriza semanalmente los precios de competidores en tu zona. Usa herramientas como Itineramio para automatizar este proceso.</p>

<h2>Caso Real: María en Madrid</h2>
<p>María implementó estas estrategias en sus 3 apartamentos y pasó de €3,200/mes a €5,100/mes en solo 3 meses.</p>

<h2>Herramientas Recomendadas</h2>
<ul>
  <li>Calculadora de rentabilidad de Itineramio</li>
  <li>Analytics de Airbnb</li>
  <li>Calendario de eventos locales</li>
</ul>
`,
    readTime: 8,
    views: 342,
    likes: 28
  },
  {
    title: 'Manual Digital para Apartamentos: La Guía Definitiva 2025',
    subtitle: 'Reduce las llamadas de huéspedes en un 86% con un manual bien diseñado',
    slug: 'manual-digital-apartamentos-guia-definitiva',
    excerpt: 'Todo lo que necesitas saber para crear un manual digital profesional que encante a tus huéspedes y te ahorre horas de gestión cada semana.',
    category: 'GUIAS',
    tags: ['manual digital', 'automatización', 'experiencia huésped'],
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=630&fit=crop',
    coverImageAlt: 'Tablet mostrando manual digital de apartamento',
    metaTitle: 'Cómo Crear un Manual Digital Perfecto para tu Apartamento Turístico',
    metaDescription: 'Guía completa para crear manuales digitales profesionales. Reduce llamadas 86%, mejora experiencia y ahorra tiempo.',
    keywords: ['manual digital apartamento', 'guía huéspedes', 'automatización airbnb'],
    content: `
<h2>¿Por Qué Necesitas un Manual Digital?</h2>
<p>El 73% de los anfitriones reciben al menos 3 llamadas por reserva con preguntas básicas. Un manual digital bien diseñado elimina este problema.</p>

<h2>Secciones Imprescindibles</h2>

<h3>1. Check-in y Acceso</h3>
<ul>
  <li>Instrucciones paso a paso con fotos</li>
  <li>Ubicación exacta de las llaves</li>
  <li>Códigos de acceso si aplica</li>
  <li>Parking o transporte público cercano</li>
</ul>

<h3>2. Wifi y Tecnología</h3>
<ul>
  <li>Nombre de red y contraseña</li>
  <li>Instrucciones TV y streaming</li>
  <li>Carga de dispositivos</li>
</ul>

<h3>3. Electrodomésticos</h3>
<ul>
  <li>Lavadora: tutoriales con imágenes</li>
  <li>Lavavajillas</li>
  <li>Aire acondicionado/Calefacción</li>
  <li>Cocina (vitro, horno, etc.)</li>
</ul>

<h2>Elementos Visuales: La Clave del Éxito</h2>
<p>Los manuales con fotos y vídeos reciben 3.5 veces menos consultas que los manuales solo texto.</p>

<h2>Herramientas para Crear tu Manual</h2>
<p>Plataformas como Itineramio te permiten crear manuales interactivos con códigos QR en menos de 10 minutos.</p>
`,
    readTime: 7,
    views: 287,
    likes: 34
  },
  {
    title: 'Nueva Normativa VUT 2025: Todo lo que Debes Saber',
    subtitle: 'Cambios legales que afectan a tu apartamento turístico',
    slug: 'normativa-vut-2025-cambios-legales',
    excerpt: 'Análisis completo de los cambios normativos en viviendas de uso turístico para 2025. Mantente al día y evita sanciones.',
    category: 'NORMATIVA',
    tags: ['normativa', 'VUT', 'legal', 'licencias'],
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=630&fit=crop',
    coverImageAlt: 'Documentos legales y martillo de juez',
    metaTitle: 'Normativa VUT 2025: Cambios Legales Apartamentos Turísticos',
    metaDescription: 'Guía actualizada sobre la normativa de viviendas turísticas en 2025. Requisitos, licencias y cambios legales.',
    keywords: ['normativa vut 2025', 'vivienda turística legal', 'licencia apartamento turístico'],
    content: `
<h2>Resumen Ejecutivo de Cambios 2025</h2>
<p>La nueva normativa introduce cambios significativos que afectan a miles de propietarios. Aquí te explicamos todo de forma clara.</p>

<h2>Principales Cambios por Comunidades</h2>

<h3>Madrid</h3>
<ul>
  <li>Nueva limitación: máximo 90 días/año en ciertas zonas</li>
  <li>Registro obligatorio actualizado</li>
  <li>Inspecciones más frecuentes</li>
</ul>

<h3>Barcelona</h3>
<ul>
  <li>Moratoria de licencias nuevas extendida</li>
  <li>Multas incrementadas hasta €90,000</li>
  <li>Control vecinal reforzado</li>
</ul>

<h2>Documentación Obligatoria</h2>
<ol>
  <li>Licencia VUT vigente</li>
  <li>Seguro de responsabilidad civil</li>
  <li>Hojas de registro de viajeros</li>
  <li>Certificado energético</li>
</ol>

<h2>Cómo Mantenerte Actualizado</h2>
<p>Suscríbete a boletines oficiales de tu comunidad autónoma y consulta con asesores especializados.</p>
`,
    readTime: 6,
    views: 198,
    likes: 15
  },
  {
    title: 'Automatización para Anfitriones: Ahorra 15 Horas Semanales',
    subtitle: 'Herramientas y estrategias para gestionar sin estrés',
    slug: 'automatizacion-anfitriones-airbnb',
    excerpt: 'Descubre cómo automatizar el 80% de las tareas repetitivas de tu negocio de alquiler vacacional y recupera tu tiempo libre.',
    category: 'AUTOMATIZACION',
    tags: ['automatización', 'productividad', 'software', 'gestión'],
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop',
    coverImageAlt: 'Dashboard de automatización en computadora',
    metaTitle: 'Automatización Airbnb: Guía para Ahorrar 15h/Semana',
    metaDescription: 'Aprende a automatizar tu negocio de alquiler vacacional. Herramientas, estrategias y casos reales.',
    keywords: ['automatización airbnb', 'gestión apartamentos automática', 'herramientas anfitriones'],
    content: `
<h2>El Coste Real de la Gestión Manual</h2>
<p>Los anfitriones dedican una media de 18 horas semanales a tareas repetitivas. El 85% de estas pueden automatizarse.</p>

<h2>Áreas Clave para Automatizar</h2>

<h3>1. Comunicación con Huéspedes (6h/semana)</h3>
<ul>
  <li>Mensajes de bienvenida automáticos</li>
  <li>Recordatorios de check-in/out</li>
  <li>FAQs en manual digital</li>
  <li>Respuestas predefinidas</li>
</ul>

<h3>2. Pricing Dinámico (4h/semana)</h3>
<ul>
  <li>Herramientas de pricing automático</li>
  <li>Ajustes por temporada</li>
  <li>Descuentos por estancia larga</li>
</ul>

<h3>3. Limpieza y Mantenimiento (3h/semana)</h3>
<ul>
  <li>Calendarios compartidos con limpieza</li>
  <li>Checklists digitales</li>
  <li>Alertas de mantenimiento preventivo</li>
</ul>

<h2>Stack Tecnológico Recomendado</h2>
<ul>
  <li><strong>Manual Digital:</strong> Itineramio</li>
  <li><strong>Channel Manager:</strong> Guesty, Hostaway</li>
  <li><strong>Pricing:</strong> PriceLabs, Beyond Pricing</li>
  <li><strong>Limpieza:</strong> Turnoverbnb, Properly</li>
</ul>

<h2>ROI de la Automatización</h2>
<p>Inversión inicial: €100-300/mes. Ahorro en tiempo: 15h/semana = €3,600/año en tiempo libre.</p>
`,
    readTime: 9,
    views: 421,
    likes: 45
  },
  {
    title: '10 Trucos de Marketing para Llenar tu Calendario',
    subtitle: 'Estrategias que funcionan para aumentar reservas directas',
    slug: '10-trucos-marketing-aumentar-reservas',
    excerpt: 'Técnicas de marketing probadas que están usando los anfitriones profesionales para conseguir más reservas directas y reducir comisiones.',
    category: 'MARKETING',
    tags: ['marketing', 'reservas directas', 'SEO', 'redes sociales'],
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
    coverImageAlt: 'Gráficos de marketing digital en pantalla',
    metaTitle: '10 Trucos de Marketing para Apartamentos Turísticos que Funcionan',
    metaDescription: 'Aumenta tus reservas directas con estos 10 trucos de marketing probados. Reduce comisiones y llena tu calendario.',
    keywords: ['marketing apartamento turístico', 'reservas directas', 'aumentar ocupación'],
    content: `
<h2>¿Por Qué Invertir en Marketing?</h2>
<p>Las reservas directas te ahorran entre un 15-20% en comisiones. Con estas estrategias, puedes conseguir hasta un 40% de reservas directas.</p>

<h2>Los 10 Trucos que Funcionan</h2>

<h3>1. Google My Business</h3>
<p>Crea un perfil de tu propiedad. El 46% de búsquedas en Google son locales.</p>

<h3>2. Instagram Local</h3>
<p>Publica contenido de tu zona, no solo de tu propiedad. Usa hashtags locales.</p>

<h3>3. Colabora con Negocios Locales</h3>
<p>Descuentos cruzados con restaurantes, tours, etc.</p>

<h3>4. Email Marketing</h3>
<p>Lista de huéspedes anteriores. 30% de repetición es posible.</p>

<h3>5. SEO Local</h3>
<p>Optimiza para búsquedas como "apartamento Madrid Centro".</p>

<h3>6. Fotos Profesionales</h3>
<p>Aumentan conversión en un 40%. ROI inmediato.</p>

<h3>7. Vídeos Tour</h3>
<p>Genera 12x más engagement que fotos estáticas.</p>

<h3>8. Reseñas en Google</h3>
<p>Pide a huéspedes que dejen reseñas. El 88% las lee antes de reservar.</p>

<h3>9. Remarketing Facebook</h3>
<p>Impacta a visitantes de tu web que no reservaron.</p>

<h3>10. Código QR en Manual</h3>
<p>Link directo a reservas futuras con descuento fidelidad.</p>
`,
    readTime: 6,
    views: 312,
    likes: 27
  },
  {
    title: 'Operaciones Eficientes: Check-in Sin Estrés',
    subtitle: 'Protocolo perfecto para entradas y salidas',
    slug: 'operaciones-check-in-sin-estres',
    excerpt: 'Sistema paso a paso para gestionar check-ins y check-outs de forma profesional y sin complicaciones. Incluye checklist descargable.',
    category: 'OPERACIONES',
    tags: ['operaciones', 'check-in', 'protocolo', 'gestión'],
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=630&fit=crop',
    coverImageAlt: 'Llaves de apartamento con etiqueta',
    metaTitle: 'Check-in Sin Estrés: Protocolo Perfecto para Apartamentos',
    metaDescription: 'Sistema completo para gestionar check-ins y check-outs de forma profesional. Incluye checklist y plantillas.',
    keywords: ['check-in apartamento turístico', 'protocolo entrada', 'gestión huéspedes'],
    content: `
<h2>El Check-in: Tu Primera (y Crucial) Impresión</h2>
<p>El 78% de las malas reseñas mencionan problemas en el check-in. Aquí está cómo hacerlo perfecto.</p>

<h2>Antes de la Llegada (24-48h)</h2>

<h3>Mensaje de Confirmación</h3>
<ul>
  <li>Dirección exacta con Google Maps</li>
  <li>Hora de check-in confirmada</li>
  <li>Link al manual digital</li>
  <li>Teléfono de emergencias</li>
</ul>

<h3>Preparación de la Propiedad</h3>
<ul>
  <li>Limpieza profunda verificada</li>
  <li>Amenities repuestos</li>
  <li>Test de todos los dispositivos</li>
  <li>Temperatura ambiental ajustada</li>
</ul>

<h2>Durante el Check-in</h2>

<h3>Opción 1: Self Check-in (Recomendado)</h3>
<ul>
  <li>Cajón de seguridad con código</li>
  <li>Instrucciones claras con fotos</li>
  <li>Vídeo tutorial opcional</li>
  <li>Soporte telefónico disponible</li>
</ul>

<h3>Opción 2: Check-in Presencial</h3>
<ul>
  <li>Tour rápido de 10 minutos</li>
  <li>Entrega de llaves en mano</li>
  <li>Firma de inventario</li>
  <li>Resolución de dudas</li>
</ul>

<h2>Check-out Simplificado</h2>
<p>Instrucciones simples: dejar llaves, basura fuera, ventanas cerradas. Nada más.</p>

<h2>Seguimiento Post-Estancia</h2>
<ul>
  <li>Mensaje de agradecimiento (2h después)</li>
  <li>Solicitud de reseña (24h después)</li>
  <li>Código descuento próxima reserva (1 semana después)</li>
</ul>
`,
    readTime: 5,
    views: 245,
    likes: 19
  }
]

async function main() {
  console.log('🌱 Seeding blog with demo articles...')

  // Get admin ID for author
  const admin = await prisma.admin.findFirst({
    where: { email: 'info@mrbarriot.com' }
  })

  if (!admin) {
    throw new Error('Admin not found. Please ensure admin exists.')
  }

  // Create articles
  for (const article of demoArticles) {
    const created = await prisma.blogPost.create({
      data: {
        ...article,
        category: article.category as BlogCategory,
        authorId: admin.id,
        authorName: admin.name,
        status: BlogStatus.PUBLISHED,
        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      }
    })
    console.log(`✅ Created: ${created.title}`)
  }

  console.log('\n🎉 Blog seeded successfully!')
  console.log(`📝 Created ${demoArticles.length} articles`)
  console.log('\n🔗 View at: http://localhost:3000/blog')
  console.log('🗑️  To delete all: npm run clean-blog-demo')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
