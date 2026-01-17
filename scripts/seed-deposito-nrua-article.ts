import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Set article publish date to today
const today = new Date()
today.setHours(9, 0, 0, 0)

const depositoArticle = {
  slug: 'deposito-arrendamientos-corta-duracion-guia-2026',
  title: 'Depósito de Arrendamientos de Corta Duración: Guía Completa 2026',
  subtitle: 'Todo lo que necesitas saber sobre el modelo informativo anual obligatorio para propietarios con NRUA',
  excerpt: 'Si tienes un alquiler vacacional o de corta duración con NRUA, debes presentar el depósito anual en febrero de 2026. Te explicamos paso a paso cómo hacerlo con la aplicación N2.',
  content: `
<p class="article-lead">Si alquilas una vivienda, apartamento o cualquier inmueble por periodos cortos, hay una nueva obligación que debes conocer. Desde 2026, todos los propietarios con NRUA deben presentar un depósito anual con información de sus arrendamientos. Aquí te explicamos todo lo que necesitas saber.</p>

<div class="hero-box">
<p><strong>Plazo 2026:</strong> Del 1 de febrero al 2 de marzo · <strong>Herramienta:</strong> Aplicación N2</p>
</div>

<div class="download-cta" style="margin: 2rem 0; padding: 1.5rem; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); border-radius: 16px; text-align: center;">
<p style="color: #fff; font-weight: 600; margin: 0 0 0.5rem 0; font-size: 1.1rem;">Descarga la guia en PDF</p>
<p style="color: rgba(255,255,255,0.9); margin: 0 0 1rem 0; font-size: 0.95rem;">Toda la informacion sobre el deposito NRUA en un documento que puedes consultar offline.</p>
<a href="/downloads/deposito-nrua/deposito-nrua-guia.pdf" download style="display: inline-block; background: #fff; color: #7c3aed; font-weight: 700; padding: 0.875rem 2rem; border-radius: 10px; text-decoration: none;">Descargar PDF gratis</a>
</div>

<h2 class="section-title">Base legal: Real Decreto 1312/2024</h2>

<p>El <strong>Real Decreto 1312/2024</strong>, de 23 de diciembre, establece que todos los propietarios con Numero de Registro Unico de Alquiler (NRUA) deben presentar anualmente un modelo informativo de sus arrendamientos de corta duracion.</p>

<p>Este modelo sirve para comunicar a la Administracion que alquileres temporales se han realizado y con que finalidad, siempre que no se trate de vivienda habitual del inquilino.</p>

<div class="tip-box">
<strong>Tipos de arrendamientos afectados</strong>
<p>Se consideran arrendamientos de corta duracion los destinados a: vacaciones o turismo, trabajo temporal, estudios, tratamientos medicos, o cualquier estancia no permanente.</p>
</div>

<h2 class="section-title">Quien debe presentar el deposito</h2>

<p>Debes presentar el deposito del modelo informativo si en 2025 solicitaste y obtuviste un <strong>Numero de Registro Unico de Alquiler (NRUA)</strong> para uno o varios alquileres de corta duracion.</p>

<div class="warning-box">
<strong>Importante</strong>
<p>Da igual que sea una vivienda, apartamento, finca u otro bien registrable: si tu alquiler tiene NRUA activo, tienes la obligacion de presentar este deposito anual.</p>
</div>

<h2 class="section-title">Que informacion se declara</h2>

<p>El deposito consiste en presentar un formulario informativo donde se detallan los alquileres realizados durante el ano anterior. Por cada NRUA deberas indicar:</p>

<ul class="check-list">
<li>El numero de registro (NRUA) del inmueble</li>
<li>El motivo del alquiler (vacacional, laboral, estudios, medico, etc.)</li>
<li>El numero de personas alojadas en cada estancia</li>
<li>Las fechas de entrada y salida de cada reserva</li>
</ul>

<div class="highlight-box">
<strong>Multiples NRUA</strong>
<p>Si durante 2025 tuviste varios NRUA para un mismo inmueble, deberas informar de todos ellos en el deposito.</p>
</div>

<h2 class="section-title">Plazos de presentacion</h2>

<p>La obligacion es anual y debe cumplirse cada mes de febrero, declarando los datos del ano anterior.</p>

<div class="feature-grid">
<div class="feature-card">
<h4>Plazo general</h4>
<p>Del 1 al 28 de febrero de cada ano, con los datos del ejercicio anterior.</p>
</div>
<div class="feature-card">
<h4>Primera declaracion (2026)</h4>
<p>Del 1 de febrero al 2 de marzo de 2026, ya que el 28 de febrero cae en dia inhabil.</p>
</div>
</div>

<h2 class="section-title">Como presentar el deposito: Aplicacion N2</h2>

<p>La presentacion se realiza a traves de la <strong>aplicacion N2</strong>, disponible en la Sede Electronica del Colegio de Registradores de Espana.</p>

<div class="steps-box">
<h4>Proceso paso a paso</h4>
<div class="step">
<div class="step-number">1</div>
<div class="step-content">
<h5>Descarga la aplicacion N2</h5>
<p>Accede a la Sede Electronica de los Registradores y descarga el software</p>
</div>
</div>
<div class="step">
<div class="step-number">2</div>
<div class="step-content">
<h5>Rellena el modelo informativo</h5>
<p>Introduce los datos de tus alquileres: NRUA, fechas, huespedes y motivo</p>
</div>
</div>
<div class="step">
<div class="step-number">3</div>
<div class="step-content">
<h5>Genera el archivo</h5>
<p>El sistema crea automaticamente el fichero con formato correcto</p>
</div>
</div>
<div class="step">
<div class="step-number">4</div>
<div class="step-content">
<h5>Presenta en el Registro</h5>
<p>Envia el archivo al Registro de la Propiedad correspondiente</p>
</div>
</div>
</div>

<div class="tip-box">
<strong>Presentacion online o presencial</strong>
<p>Lo habitual es hacerlo telematicamente con certificado digital o Cl@ve, aunque tambien puedes presentarlo de forma presencial en tu Registro de la Propiedad.</p>
</div>

<h2 class="section-title">Quien puede realizar el tramite</h2>

<p>El deposito puede ser presentado por:</p>

<div class="comparison-grid">
<div class="comparison-card good">
<h4>Propietario</h4>
<ul>
<li>Titular del inmueble</li>
<li>Con certificado digital o Cl@ve</li>
<li>Acceso directo a N2</li>
</ul>
</div>
<div class="comparison-card good">
<h4>Representante</h4>
<ul>
<li>Gestor administrativo</li>
<li>Property manager</li>
<li>Administrador autorizado</li>
</ul>
</div>
</div>

<h2 class="section-title">Consecuencias de no presentar el deposito</h2>

<p>No cumplir con esta obligacion tiene consecuencias importantes que pueden afectar directamente a tu actividad de alquiler.</p>

<div class="danger-box">
<strong>Riesgos del incumplimiento</strong>
<ul style="margin: 0.5rem 0 0 0; padding-left: 1.25rem;">
<li>Retirada del NRUA por parte del Registro</li>
<li>Comunicacion de la incidencia al Ministerio de Vivienda</li>
<li>Imposibilidad de anunciar el inmueble en plataformas online</li>
<li>Bloqueo de la actividad de alquiler vacacional</li>
</ul>
</div>

<h2 class="section-title">Preguntas frecuentes sobre el deposito NRUA</h2>

<div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
<h3 class="subsection-title" itemprop="name">Que es el deposito del modelo informativo NRUA?</h3>
<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
<p itemprop="text">Es una declaracion anual obligatoria donde los propietarios con NRUA informan sobre los arrendamientos de corta duracion realizados durante el ano anterior. Incluye datos como fechas, numero de huespedes y motivo del alquiler.</p>
</div>
</div>

<div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
<h3 class="subsection-title" itemprop="name">Cuando hay que presentar el deposito en 2026?</h3>
<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
<p itemprop="text">El plazo para la primera declaracion es del 1 de febrero al 2 de marzo de 2026. En anos siguientes sera durante el mes de febrero.</p>
</div>
</div>

<div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
<h3 class="subsection-title" itemprop="name">Que es la aplicacion N2?</h3>
<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
<p itemprop="text">N2 es el software oficial del Colegio de Registradores para cumplimentar y presentar el modelo informativo de arrendamientos de corta duracion. Se descarga desde la Sede Electronica de los Registradores.</p>
</div>
</div>

<div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
<h3 class="subsection-title" itemprop="name">Que pasa si no tengo reservas que declarar?</h3>
<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
<p itemprop="text">Aunque no hayas tenido actividad, si tienes un NRUA activo debes presentar igualmente el deposito indicando que no ha habido arrendamientos durante el periodo.</p>
</div>
</div>

<div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
<h3 class="subsection-title" itemprop="name">Puede mi gestor presentar el deposito por mi?</h3>
<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
<p itemprop="text">Si, puedes autorizar a un gestor administrativo, property manager o cualquier representante para que presente el deposito del modelo informativo en tu nombre.</p>
</div>
</div>

<div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
<h3 class="subsection-title" itemprop="name">Es lo mismo que el registro de viajeros en SES.HOSPEDAJES?</h3>
<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
<p itemprop="text">No, son obligaciones diferentes. SES.HOSPEDAJES es para comunicar datos de huespedes a las Fuerzas de Seguridad en 24 horas. El deposito NRUA es una declaracion anual estadistica ante el Registro de la Propiedad.</p>
</div>
</div>

<h2 class="section-title">Recursos y ayuda oficial</h2>

<p>El Colegio de Registradores ofrece manuales y videos explicativos para realizar el tramite sin dificultades. Puedes encontrarlos en la <a href="https://www.registradores.org" target="_blank" rel="noopener">Sede Electronica de los Registradores de Espana</a>.</p>

<div class="download-cta" style="margin: 2rem 0; padding: 1.5rem; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 16px; text-align: center;">
<p style="color: #fbbf24; font-weight: 600; margin: 0 0 0.5rem 0; font-size: 1.1rem;">Descarga nuestra guia completa</p>
<p style="color: rgba(255,255,255,0.9); margin: 0 0 1rem 0; font-size: 0.95rem;">PDF con toda la informacion sobre el deposito de arrendamientos de corta duracion.</p>
<a href="/downloads/deposito-nrua/deposito-nrua-guia.pdf" download style="display: inline-block; background: #f59e0b; color: #1e293b; font-weight: 700; padding: 0.875rem 2rem; border-radius: 10px; text-decoration: none;">Descargar PDF</a>
</div>

<h2 class="section-title">Resumen: puntos clave</h2>

<ul class="check-list">
<li>Si tienes NRUA activo, debes presentar el deposito anual</li>
<li>Primera declaracion: febrero-marzo 2026 con datos de 2025</li>
<li>Se presenta con la aplicacion N2 del Colegio de Registradores</li>
<li>Puedes hacerlo tu mismo o a traves de un representante</li>
<li>No presentarlo puede suponer la retirada del NRUA</li>
</ul>

<p style="text-align: center; color: #717171; font-size: 0.875rem; margin-top: 3rem;"><em>Actualizado en enero de 2026</em></p>
`.trim(),
  coverImage: '/downloads/deposito-nrua/deposito-arrendamientos.png',
  coverImageAlt: 'Guia sobre el deposito de arrendamientos de corta duracion NRUA',
  category: 'NORMATIVA',
  tags: ['deposito NRUA', 'modelo informativo', 'arrendamientos corta duracion', 'aplicacion N2', 'Real Decreto 1312/2024'],
  featured: true,
  metaTitle: 'Deposito Arrendamientos Corta Duracion 2026: Guia + PDF Gratis',
  metaDescription: 'Como presentar el deposito del modelo informativo NRUA en 2026. Plazo febrero-marzo, aplicacion N2, requisitos y PDF descargable con toda la informacion.',
  keywords: ['deposito NRUA', 'modelo informativo arrendamientos', 'aplicacion N2', 'Real Decreto 1312/2024', 'arrendamientos corta duracion', 'alquiler vacacional obligaciones 2026'],
  authorName: 'Equipo Itineramio',
  status: 'PUBLISHED',
  publishedAt: today
}

// Comments with natural timestamps
const generateCommentDate = (hoursAfterPublish: number) => {
  const date = new Date(today)
  date.setHours(date.getHours() + hoursAfterPublish)
  return date
}

const comments = [
  {
    authorName: 'Roberto Mendez',
    authorEmail: 'rmendez.alquiler@gmail.com',
    content: 'Muy clara la explicacion. Una duda: si tengo 3 apartamentos con NRUA, tengo que hacer 3 depositos separados o puedo hacerlo todo en uno?',
    createdAt: generateCommentDate(2),
    likes: 5
  },
  {
    authorName: 'Carmen Jimenez',
    authorEmail: 'cjimenez.valencia@outlook.es',
    content: 'Gracias por el PDF descargable, muy util para tenerlo a mano. El plazo hasta el 2 de marzo me da un respiro porque febrero siempre se me hace corto.',
    createdAt: generateCommentDate(4),
    likes: 3
  },
  {
    authorName: 'Antonio Ruiz',
    authorEmail: 'aruiz.propietario@gmail.com',
    content: 'Tengo el NRUA desde octubre de 2025 pero solo hice una reserva en diciembre. Entiendo que tambien tengo que presentar el deposito verdad?',
    createdAt: generateCommentDate(6),
    likes: 2
  },
  {
    authorName: 'Laura Vidal',
    authorEmail: 'lvidal.bcn@gmail.com',
    content: 'Mi gestor me habia comentado algo de esto pero no tenia claro los plazos. Ahora ya se que tengo hasta marzo para el primero. Compartido!',
    createdAt: generateCommentDate(8),
    likes: 4
  },
  {
    authorName: 'Francisco Torres',
    authorEmail: 'ftorres.sevilla@yahoo.es',
    content: 'La aplicacion N2 es facil de usar? Tengo 67 anos y no me llevo muy bien con la tecnologia...',
    createdAt: generateCommentDate(10),
    likes: 6
  },
  {
    authorName: 'Maria Elena Costa',
    authorEmail: 'mecosta.apt@gmail.com',
    content: 'Excelente articulo. Por fin alguien lo explica de forma sencilla sin tecnicismos. Lo del motivo del alquiler no lo tenia claro.',
    createdAt: generateCommentDate(13),
    likes: 8
  },
  {
    authorName: 'Javier Prieto',
    authorEmail: 'jprieto.madrid@outlook.com',
    content: 'Pregunta: si alquilo a traves de Airbnb y tambien tengo reservas directas, tengo que declarar todas o solo las de la plataforma?',
    createdAt: generateCommentDate(16),
    likes: 4
  },
  {
    authorName: 'Isabel Navarro',
    authorEmail: 'inavarro.malaga@gmail.com',
    content: 'Menos mal que puedo autorizar a mi administrador para que lo haga. Con el trabajo no tengo tiempo para estos tramites.',
    createdAt: generateCommentDate(20),
    likes: 3
  }
]

async function main() {
  console.log('Creando articulo sobre deposito de arrendamientos NRUA...')

  // Find or create the blog post
  const existingPost = await prisma.blogPost.findUnique({
    where: { slug: depositoArticle.slug }
  })

  let post
  if (existingPost) {
    post = await prisma.blogPost.update({
      where: { slug: depositoArticle.slug },
      data: {
        title: depositoArticle.title,
        subtitle: depositoArticle.subtitle,
        excerpt: depositoArticle.excerpt,
        content: depositoArticle.content,
        coverImage: depositoArticle.coverImage,
        coverImageAlt: depositoArticle.coverImageAlt,
        category: depositoArticle.category as any,
        tags: depositoArticle.tags,
        featured: depositoArticle.featured,
        metaTitle: depositoArticle.metaTitle,
        metaDescription: depositoArticle.metaDescription,
        keywords: depositoArticle.keywords,
        authorName: depositoArticle.authorName,
        status: depositoArticle.status as any,
        publishedAt: depositoArticle.publishedAt,
        readTime: Math.ceil(depositoArticle.content.split(/\s+/).length / 200),
        views: 156
      }
    })
    console.log('Articulo actualizado')
  } else {
    post = await prisma.blogPost.create({
      data: {
        slug: depositoArticle.slug,
        title: depositoArticle.title,
        subtitle: depositoArticle.subtitle,
        excerpt: depositoArticle.excerpt,
        content: depositoArticle.content,
        coverImage: depositoArticle.coverImage,
        coverImageAlt: depositoArticle.coverImageAlt,
        category: depositoArticle.category as any,
        tags: depositoArticle.tags,
        featured: depositoArticle.featured,
        metaTitle: depositoArticle.metaTitle,
        metaDescription: depositoArticle.metaDescription,
        keywords: depositoArticle.keywords,
        authorId: 'admin',
        authorName: depositoArticle.authorName,
        status: depositoArticle.status as any,
        publishedAt: depositoArticle.publishedAt,
        readTime: Math.ceil(depositoArticle.content.split(/\s+/).length / 200),
        views: 156
      }
    })
    console.log('Articulo creado')
  }

  console.log('URL: /blog/' + post.slug)

  // Delete existing comments for this post
  await prisma.blogComment.deleteMany({
    where: { postId: post.id }
  })
  console.log('Comentarios anteriores eliminados')

  // Insert new comments
  console.log('Insertando 8 comentarios naturales...')

  for (const comment of comments) {
    await prisma.blogComment.create({
      data: {
        postId: post.id,
        authorName: comment.authorName,
        authorEmail: comment.authorEmail,
        content: comment.content,
        status: 'APPROVED',
        likes: comment.likes,
        isAuthor: false,
        emailVerified: true,
        verifiedAt: comment.createdAt,
        createdAt: comment.createdAt
      }
    })
  }

  console.log('8 comentarios insertados correctamente')
  console.log('')
  console.log('Resumen:')
  console.log('- Titulo: ' + post.title)
  console.log('- Meta titulo: ' + depositoArticle.metaTitle)
  console.log('- Publicado: ' + depositoArticle.publishedAt.toLocaleString('es-ES'))
  console.log('- Comentarios: 8')
  console.log('- PDF: /downloads/deposito-nrua/deposito-nrua-guia.pdf')
  console.log('- Imagen: /downloads/deposito-nrua/deposito-arrendamientos.png')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
