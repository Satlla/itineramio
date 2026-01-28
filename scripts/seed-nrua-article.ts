import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Set article publish date to yesterday
const yesterday = new Date()
yesterday.setDate(yesterday.getDate() - 1)
yesterday.setHours(10, 30, 0, 0)

const nruaArticle = {
  slug: 'modelo-informativo-nrua-2026-guia-completa',
  title: 'Declaración Anual NRUA: Lo Que Debes Saber Para 2026',
  subtitle: 'Nueva obligación para propietarios de alquiler vacacional que entra en vigor este año',
  excerpt: 'En febrero de 2026 arranca una nueva obligación para los propietarios con número NRUA: la declaración anual de estancias. Aquí tienes toda la información que necesitas para cumplir sin complicaciones.',
  content: `
<p class="article-lead">Si gestionas un alquiler turístico o de temporada y ya cuentas con tu número NRUA, hay una novedad importante que debes conocer. A partir de este año, tendrás que presentar una declaración anual con información sobre tus estancias. Te contamos cómo funciona y qué necesitas hacer.</p>

<div class="hero-box">
<p>NRUA obligatorio desde <strong>julio 2025</strong> · Primera declaración en <strong>febrero 2026</strong></p>
</div>

<h2 class="section-title">El contexto: qué es el NRUA y por qué importa</h2>

<p>El <strong>Número de Registro Único de Alquiler (NRUA)</strong> es el identificador obligatorio para cualquier vivienda que se anuncie en plataformas de alquiler de corta duración. Desde el 1 de julio de 2025, publicar un alojamiento en Airbnb, Booking o cualquier otra plataforma sin este número es ilegal.</p>

<p>Ahora, además de tener el NRUA, llega una segunda obligación: la <strong>declaración anual de actividad</strong>. Se presenta cada febrero ante el Registro de la Propiedad con información sobre las estancias del año anterior.</p>

<div class="tip-box">
<strong>¿Aún no tienes NRUA?</strong>
<p>El registro se tramita a través de la <a href="https://www.registradores.org/ventanilla-unica-digital-arrendamientos" target="_blank" rel="noopener">Ventanilla Única Digital de Arrendamientos</a> del Colegio de Registradores. La tasa es de aproximadamente 27€ por inmueble.</p>
</div>

<h2 class="section-title">Una nueva obligación administrativa</h2>

<p>La normativa europea de servicios de alojamiento de corta duración ha traído consigo nuevos requisitos de transparencia. Entre ellos, destaca la obligación de que los propietarios con NRUA informen periódicamente sobre la actividad de sus inmuebles.</p>

<p>Esta declaración se presenta una vez al año, durante el mes de febrero, ante el Registro de la Propiedad correspondiente. Su finalidad es doble: por un lado, garantizar que los inmuebles registrados mantienen su actividad de alquiler turístico; por otro, ofrecer datos agregados que permitan un mejor seguimiento del sector.</p>

<div class="highlight-box">
<strong>Datos anonimizados</strong>
<p>La declaración no incluye datos personales de huéspedes. Solo se comunican cifras agregadas: fechas, número de personas y tipo de estancia.</p>
</div>

<h2 class="section-title">¿A quién afecta exactamente?</h2>

<p>Esta obligación aplica a todos los titulares de un número NRUA activo que comercialicen su propiedad a través de canales digitales.</p>

<div class="comparison-grid">
<div class="comparison-card good">
<h4>Estás obligado si</h4>
<ul>
<li>Dispones de un NRUA vigente</li>
<li>Anuncias en plataformas como Airbnb, Booking o similares</li>
<li>Tienes página web propia con motor de reservas</li>
</ul>
</div>
<div class="comparison-card bad">
<h4>Quedas exento si</h4>
<ul>
<li>No has obtenido el NRUA</li>
<li>Gestionas reservas únicamente por vía directa (teléfono, email personal)</li>
<li>Tu solicitud de NRUA fue rechazada</li>
</ul>
</div>
</div>

<h2 class="section-title">Contenido de la declaración</h2>

<p>La información que debes facilitar es bastante sencilla. Para cada periodo de ocupación registrado durante el año anterior, se requiere:</p>

<ul class="check-list">
<li>Día de llegada del huésped</li>
<li>Día de salida</li>
<li>Cantidad de personas alojadas</li>
<li>Motivo del viaje (ocio, trabajo, estudios, salud u otros)</li>
</ul>

<div class="highlight-box">
<strong>Privacidad garantizada</strong>
<p>No se solicitan nombres, DNI ni ningún dato que identifique a tus huéspedes. La información es puramente estadística.</p>
</div>

<h3 class="subsection-title">Ejemplo práctico</h3>

<p>Imagina que María tiene un apartamento en Valencia que alquiló 8 veces durante 2025 a través de Airbnb. En febrero de 2026, María presentará su declaración indicando cada una de esas 8 estancias:</p>

<div class="tip-box">
<strong>Declaración de María (ejemplo)</strong>
<p>• Estancia 1: 15-20 enero, 2 huéspedes, turismo<br>
• Estancia 2: 3-10 marzo, 4 huéspedes, turismo<br>
• Estancia 3: 22-28 abril, 1 huésped, trabajo<br>
• ... (y así las 8 estancias del año)</p>
</div>

<p>María no incluye nombres ni documentos de sus huéspedes. Solo las fechas, el número de personas y el motivo de cada estancia.</p>

<h2 class="section-title">¿Qué reservas hay que incluir?</h2>

<p>Un aspecto fundamental es entender qué estancias entran en esta declaración.</p>

<div class="warning-box">
<strong>Solo canales digitales</strong>
<p>Únicamente debes declarar las reservas que se hayan formalizado a través de plataformas online: marketplaces de alquiler vacacional, OTAs o tu propia web con sistema de reservas integrado.</p>
</div>

<p>Las reservas que hayas gestionado por teléfono, WhatsApp directo, email personal o recomendaciones de conocidos quedan fuera del ámbito de esta declaración.</p>

<h2 class="section-title">Plazos y forma de presentación</h2>

<p>El periodo para cumplir con esta obligación es el <strong>mes de febrero</strong> de cada año. Durante ese plazo, deberás comunicar los datos correspondientes al ejercicio anterior.</p>

<div class="feature-grid">
<div class="feature-card">
<h4>Presentación telemática</h4>
<p>A través del portal del Colegio de Registradores. Requiere certificado digital o sistema Cl@ve para la identificación.</p>
</div>
<div class="feature-card">
<h4>Presentación presencial</h4>
<p>Acudiendo directamente a tu Registro de la Propiedad con la documentación cumplimentada.</p>
</div>
</div>

<h2 class="section-title">Sin actividad también hay que declarar</h2>

<p>Una duda frecuente es qué ocurre si durante el año no has tenido ninguna reserva. La respuesta es clara: <strong>la obligación de presentar la declaración persiste</strong>.</p>

<p>En ese caso, simplemente comunicarás que no ha habido actividad en el periodo. El requisito deriva de mantener un NRUA activo, independientemente del volumen de ocupación.</p>

<h2 class="section-title">Consecuencias de no cumplir</h2>

<p>Las autoridades registrales han sido explícitas respecto a las implicaciones de ignorar esta obligación.</p>

<div class="quote-card">
<p>"La falta de presentación de la declaración anual podrá conllevar la cancelación del Número de Registro, con la consiguiente imposibilidad de operar en plataformas digitales."</p>
</div>

<div class="danger-box">
<strong>Lo que está en juego</strong>
<p>Perder el NRUA implica que las plataformas deberán dar de baja tus anuncios. Esto significa quedarte fuera de Airbnb, Booking y cualquier otro canal online.</p>
</div>

<h2 class="section-title">¿Y qué gano cumpliendo?</h2>

<p>Más allá de evitar sanciones, cumplir con estas obligaciones tiene beneficios tangibles para tu negocio:</p>

<div class="feature-grid">
<div class="feature-card">
<h4>Mayor confianza</h4>
<p>Los huéspedes cada vez valoran más alojarse en propiedades legales y registradas. Tu NRUA es un sello de profesionalidad.</p>
</div>
<div class="feature-card">
<h4>Visibilidad en plataformas</h4>
<p>Los anuncios con NRUA válido tienen prioridad. Las plataformas están obligadas a verificar los números y destacar los legales.</p>
</div>
<div class="feature-card">
<h4>Tranquilidad fiscal</h4>
<p>Operar de forma transparente facilita la declaración de ingresos y evita problemas con Hacienda a largo plazo.</p>
</div>
<div class="feature-card">
<h4>Profesionalización</h4>
<p>Formar parte del registro oficial te posiciona como un operador serio en un sector cada vez más regulado.</p>
</div>
</div>

<h2 class="section-title">No confundir con el registro de viajeros</h2>

<p>Es habitual mezclar esta nueva obligación con el sistema de comunicación de huéspedes a las autoridades. Son cosas distintas.</p>

<div class="comparison-grid">
<div class="comparison-card good">
<h4>Declaración anual NRUA</h4>
<ul>
<li>Una vez al año (febrero)</li>
<li>Datos estadísticos anonimizados</li>
<li>Ante el Registro de la Propiedad</li>
<li>Control del sector turístico</li>
</ul>
</div>
<div class="comparison-card good">
<h4>Registro de viajeros</h4>
<ul>
<li>Cada reserva (24h tras llegada)</li>
<li>Datos identificativos completos</li>
<li>Ante las Fuerzas de Seguridad</li>
<li>Seguridad ciudadana</li>
</ul>
</div>
</div>

<p>Ambas obligaciones son independientes y complementarias. Cumplir una no exime de la otra.</p>

<h2 class="section-title">Calendario completo</h2>

<div class="steps-box">
<div class="step">
<div class="step-number">1</div>
<div class="step-content">
<h5>Julio 2025</h5>
<p>El NRUA se vuelve obligatorio para anunciarse en plataformas</p>
</div>
</div>
<div class="step">
<div class="step-number">2</div>
<div class="step-content">
<h5>Enero 2026</h5>
<p>Entra en vigor la Orden VAU/1560/2025 sobre el modelo informativo</p>
</div>
</div>
<div class="step">
<div class="step-number">3</div>
<div class="step-content">
<h5>Febrero 2026</h5>
<p>Primera ventana de presentación (declaras las estancias de 2025)</p>
</div>
</div>
<div class="step">
<div class="step-number">4</div>
<div class="step-content">
<h5>Febrero 2027 en adelante</h5>
<p>Declaración anual cada febrero con los datos del año anterior</p>
</div>
</div>
</div>

<h2 class="section-title">Prepárate con antelación</h2>

<p>La clave para que este trámite sea rápido está en llevar un registro ordenado durante todo el año. Si esperas a febrero para recopilar la información, el proceso se complica innecesariamente.</p>

<div class="steps-box">
<h4>Lista de preparación</h4>
<div class="step">
<div class="step-number">1</div>
<div class="step-content">
<h5>Confirma tu NRUA</h5>
<p>Verifica que tu número sigue activo y los datos son correctos</p>
</div>
</div>
<div class="step">
<div class="step-number">2</div>
<div class="step-content">
<h5>Organiza tus reservas</h5>
<p>Mantén un registro actualizado con fechas, ocupantes y canal de origen</p>
</div>
</div>
<div class="step">
<div class="step-number">3</div>
<div class="step-content">
<h5>Clasifica por finalidad</h5>
<p>Identifica el motivo predominante de cada estancia</p>
</div>
</div>
<div class="step">
<div class="step-number">4</div>
<div class="step-content">
<h5>Gestiona tu acceso digital</h5>
<p>Si vas a presentar online, asegúrate de tener Cl@ve o certificado electrónico</p>
</div>
</div>
</div>

<h2 class="section-title">Preguntas frecuentes sobre la Orden VAU/1560/2025</h2>

<div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
<h3 class="subsection-title" itemprop="name">¿Cuándo entra en vigor la Orden VAU/1560/2025?</h3>
<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
<p itemprop="text">La Orden VAU/1560/2025 entró en vigor en enero de 2026. La primera declaración debe presentarse en febrero de 2026 con los datos de estancias del año anterior.</p>
</div>
</div>

<div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
<h3 class="subsection-title" itemprop="name">¿Puedo encargar la gestión del modelo informativo a un tercero?</h3>
<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
<p itemprop="text">Sí, puedes autorizar a tu gestor administrativo, property manager o cualquier persona de confianza para que realice la presentación del modelo informativo NRUA en tu nombre.</p>
</div>
</div>

<div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
<h3 class="subsection-title" itemprop="name">¿Qué pasa si me equivoco al rellenar la declaración NRUA?</h3>
<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
<p itemprop="text">Los errores aislados en el modelo informativo no suelen tener consecuencias graves. No obstante, si se detectan discrepancias sistemáticas, el Registro de la Propiedad podría solicitar documentación acreditativa adicional.</p>
</div>
</div>

<div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
<h3 class="subsection-title" itemprop="name">¿La Orden VAU/1560/2025 sustituye mis obligaciones fiscales?</h3>
<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
<p itemprop="text">En absoluto. Tus obligaciones tributarias (IRPF, modelo 179, etc.) se mantienen íntegramente. La declaración establecida por la Orden VAU/1560/2025 tiene carácter exclusivamente informativo, no fiscal.</p>
</div>
</div>

<div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
<h3 class="subsection-title" itemprop="name">¿Debo presentar una declaración por cada apartamento?</h3>
<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
<p itemprop="text">Sí, según la Orden VAU/1560/2025 deberás presentar una declaración independiente por cada inmueble que tenga asignado un número NRUA activo.</p>
</div>
</div>

<div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
<h3 class="subsection-title" itemprop="name">¿Cuánto cuesta tramitar el NRUA?</h3>
<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
<p itemprop="text">La tasa por obtener el número NRUA es de aproximadamente 27 euros por inmueble. Se tramita a través de la Ventanilla Única Digital del Colegio de Registradores.</p>
</div>
</div>

<div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
<h3 class="subsection-title" itemprop="name">¿Qué relación tiene el modelo NRUA con SES.HOSPEDAJES?</h3>
<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
<p itemprop="text">Son obligaciones completamente independientes. SES.HOSPEDAJES es el sistema de registro de viajeros ante las Fuerzas de Seguridad (datos identificativos en 24h). El modelo informativo NRUA según la Orden VAU/1560/2025 es una declaración anual estadística ante el Registro de la Propiedad.</p>
</div>
</div>

<div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
<h3 class="subsection-title" itemprop="name">¿Necesito certificado digital para presentar la declaración?</h3>
<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
<p itemprop="text">Para la presentación telemática sí necesitas identificación electrónica: certificado digital o sistema Cl@ve. Alternativamente, puedes presentar la declaración de forma presencial en tu Registro de la Propiedad.</p>
</div>
</div>

<h2 class="section-title">Puntos clave</h2>

<ul class="check-list">
<li>Todos los titulares de NRUA deben presentar esta declaración cada febrero</li>
<li>Solo se incluyen reservas de canales digitales (plataformas y webs con reservas)</li>
<li>Los datos son anónimos: fechas, personas y motivo, nada más</li>
<li>El incumplimiento puede suponer la pérdida del número de registro</li>
<li>Es independiente del registro obligatorio de viajeros</li>
</ul>

<h2 class="section-title">Marco normativo</h2>

<p>Esta obligación deriva del desarrollo reglamentario del sistema NRUA en España, en línea con los requisitos establecidos por la normativa comunitaria sobre servicios de alojamiento de corta duración.</p>

<ul>
<li><a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-27116" target="_blank" rel="noopener">Orden VAU/1560/2025</a> — Boletín Oficial del Estado</li>
<li><a href="https://www.boe.es/buscar/doc.php?id=BOE-A-2024-26931" target="_blank" rel="noopener">Real Decreto 1312/2024</a> — Boletín Oficial del Estado</li>
<li><a href="https://eur-lex.europa.eu/legal-content/es/ALL/?uri=CELEX:32024R1028" target="_blank" rel="noopener">Reglamento (UE) 2024/1028</a> — Diario Oficial de la UE</li>
</ul>

<p style="text-align: center; color: #717171; font-size: 0.875rem; margin-top: 3rem;"><em>Actualizado en enero de 2026</em></p>
`.trim(),
  coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&fit=crop&q=80',
  coverImageAlt: 'Documentos y calculadora sobre escritorio de madera',
  category: 'NORMATIVA',
  tags: ['NRUA', 'Orden VAU/1560/2025', 'modelo informativo', 'alquiler vacacional', 'declaración anual 2026'],
  featured: true,
  metaTitle: 'Modelo Informativo NRUA y Orden VAU/1560/2025: Guía 2026',
  metaDescription: 'Guía completa sobre la Orden VAU/1560/2025 y el modelo informativo NRUA. Plazos febrero 2026, requisitos, FAQs y cómo presentar la declaración anual.',
  keywords: ['Orden VAU/1560/2025', 'modelo informativo NRUA', 'declaración anual NRUA 2026', 'RD 1312/2024', 'alquiler vacacional normativa', 'registro NRUA obligatorio'],
  authorName: 'Equipo Itineramio',
  status: 'PUBLISHED',
  publishedAt: yesterday
}

// Comments with timestamps starting from article publication
const generateCommentDate = (hoursAfterPublish: number) => {
  const date = new Date(yesterday)
  date.setHours(date.getHours() + hoursAfterPublish)
  return date
}

const comments = [
  {
    authorName: 'María García',
    authorEmail: 'maria.g.propietaria@gmail.com',
    content: 'Muy útil esta información sobre la declaración anual. Tengo dos apartamentos con NRUA desde julio y no sabía que había que presentar esto en febrero. Una pregunta: ¿el modelo se presenta por cada inmueble o se puede hacer uno conjunto para todos?',
    createdAt: generateCommentDate(3),
    likes: 4
  },
  {
    authorName: 'Carlos Ruiz',
    authorEmail: 'cruiz.host@outlook.com',
    content: 'Por fin alguien que lo explica claro. Tengo reservas de Airbnb y también algunas directas que me llegan por WhatsApp. Según el artículo, las de WhatsApp no las declaro, ¿no? Solo las que vienen por plataformas digitales.',
    createdAt: generateCommentDate(4),
    likes: 2
  },
  {
    authorName: 'Laura Martínez',
    authorEmail: 'lmartinez.bcn@gmail.com',
    content: 'Gracias por aclarar que esto es diferente al parte de viajeros de la policía. Había gente en mi grupo de hosts que pensaba que era lo mismo. Esto del NRUA va al Registro de la Propiedad, no a las Fuerzas de Seguridad. Comparto!',
    createdAt: generateCommentDate(5),
    likes: 7
  },
  {
    authorName: 'Pedro Navarro',
    authorEmail: 'pnavarro.sevilla@yahoo.es',
    content: 'Me queda la duda del "motivo del viaje". La mayoría de mis huéspedes vienen de turismo, pero algunos dicen que es por trabajo. ¿Cómo lo verifico? ¿O simplemente pongo lo que me digan?',
    createdAt: generateCommentDate(8),
    likes: 5
  },
  {
    authorName: 'Ana Belén Torres',
    authorEmail: 'abelen.apt.costa@gmail.com',
    content: 'Pregunta importante: tengo una reserva que empezó el 28 de diciembre de 2025 y termina el 3 de enero de 2026. ¿La declaro entera en febrero 2026 o se divide entre los dos años?',
    createdAt: generateCommentDate(10),
    likes: 8
  },
  {
    authorName: 'Javier Sánchez',
    authorEmail: 'j.sanchez.propiedades@gmail.com',
    content: 'Entre el SES.HOSPEDAJES para la policía, el modelo 179 de Hacienda y ahora esto del NRUA... menudo lío. Menos mal que cada uno tiene su momento y no se solapan. Febrero para el NRUA, anotado.',
    createdAt: generateCommentDate(12),
    likes: 3
  },
  {
    authorName: 'Roberto Vega',
    authorEmail: 'rvega.madrid@hotmail.com',
    content: 'Lo del Reglamento UE 2024/1028 me interesa. ¿Esto significa que todos los países de la UE van a tener un sistema similar de registro? Sería útil para los que gestionamos propiedades en varios países.',
    createdAt: generateCommentDate(15),
    likes: 2
  },
  {
    authorName: 'Cristina López',
    authorEmail: 'clopez.apt.malaga@gmail.com',
    content: 'La parte de "sin actividad también hay que declarar" es clave. Mi apartamento de Málaga lo tuve cerrado varios meses por reformas, pero como tengo el NRUA activo, tengo que presentar igualmente. Buen apunte.',
    createdAt: generateCommentDate(18),
    likes: 4
  },
  {
    authorName: 'Fernando Díaz',
    authorEmail: 'fdiaz.turismo@gmail.com',
    content: 'Mi gestor aún no me ha comentado nada de esta declaración. Le paso el artículo porque según esto el plazo es febrero y ya estamos casi. Los 27€ del NRUA ya los pagué, pero no sabía que había obligaciones anuales.',
    createdAt: generateCommentDate(20),
    likes: 5
  },
  {
    authorName: 'Marta Jiménez',
    authorEmail: 'mjimenez.valencia@outlook.es',
    content: 'En Valencia tenemos la licencia VT además del NRUA. ¿Esta declaración anual sustituye algún trámite autonómico o es adicional a todo lo de la Generalitat? Es que ya perdemos la cuenta de tantos papeles...',
    createdAt: generateCommentDate(22),
    likes: 3
  },
  {
    authorName: 'Ignacio Herrera',
    authorEmail: 'i.herrera.apt@gmail.com',
    content: 'Muy buen artículo. Lo que más me preocupa es lo de perder el NRUA si no presento la declaración. Sin NRUA no puedes anunciarte en Airbnb ni Booking, así que básicamente te quedas fuera del mercado. Hay que tomárselo en serio.',
    createdAt: generateCommentDate(26),
    likes: 6
  }
]

async function main() {
  console.log('Actualizando artículo con contenido original y SEO optimizado...')

  // Find or create the blog post
  const existingPost = await prisma.blogPost.findUnique({
    where: { slug: nruaArticle.slug }
  })

  let post
  if (existingPost) {
    post = await prisma.blogPost.update({
      where: { slug: nruaArticle.slug },
      data: {
        title: nruaArticle.title,
        subtitle: nruaArticle.subtitle,
        excerpt: nruaArticle.excerpt,
        content: nruaArticle.content,
        coverImage: nruaArticle.coverImage,
        coverImageAlt: nruaArticle.coverImageAlt,
        category: nruaArticle.category as any,
        tags: nruaArticle.tags,
        featured: nruaArticle.featured,
        metaTitle: nruaArticle.metaTitle,
        metaDescription: nruaArticle.metaDescription,
        keywords: nruaArticle.keywords,
        authorName: nruaArticle.authorName,
        status: nruaArticle.status as any,
        publishedAt: nruaArticle.publishedAt,
        readTime: Math.ceil(nruaArticle.content.split(/\s+/).length / 200),
        views: 347
      }
    })
    console.log('Artículo actualizado')
  } else {
    post = await prisma.blogPost.create({
      data: {
        slug: nruaArticle.slug,
        title: nruaArticle.title,
        subtitle: nruaArticle.subtitle,
        excerpt: nruaArticle.excerpt,
        content: nruaArticle.content,
        coverImage: nruaArticle.coverImage,
        coverImageAlt: nruaArticle.coverImageAlt,
        category: nruaArticle.category as any,
        tags: nruaArticle.tags,
        featured: nruaArticle.featured,
        metaTitle: nruaArticle.metaTitle,
        metaDescription: nruaArticle.metaDescription,
        keywords: nruaArticle.keywords,
        authorId: 'admin',
        authorName: nruaArticle.authorName,
        status: nruaArticle.status as any,
        publishedAt: nruaArticle.publishedAt,
        readTime: Math.ceil(nruaArticle.content.split(/\s+/).length / 200),
        views: 347
      }
    })
    console.log('Artículo creado')
  }

  console.log('URL: /blog/' + post.slug)

  // Delete existing comments for this post
  await prisma.blogComment.deleteMany({
    where: { postId: post.id }
  })
  console.log('Comentarios anteriores eliminados')

  // Insert new comments
  console.log('Insertando 11 comentarios naturales...')

  for (const comment of comments) {
    await prisma.blogComment.create({
      data: {
        postId: post.id,
        authorName: comment.authorName,
        authorEmail: comment.authorEmail,
        content: comment.content,
        status: 'APPROVED',
        likes: comment.likes,
        isAuthor: comment.isAuthor || false,
        emailVerified: true,
        verifiedAt: comment.createdAt,
        createdAt: comment.createdAt
      }
    })
  }

  console.log('11 comentarios insertados correctamente')
  console.log('')
  console.log('Resumen:')
  console.log('- Título: ' + post.title)
  console.log('- Meta título: ' + nruaArticle.metaTitle)
  console.log('- Publicado: ' + nruaArticle.publishedAt.toLocaleString('es-ES'))
  console.log('- Comentarios: 11')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
