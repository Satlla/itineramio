import { PrismaClient, BlogCategory, BlogStatus, CommentStatus } from '@prisma/client'

const prisma = new PrismaClient()

const articleContent = `
<p>La facturación en España está a punto de cambiar radicalmente. <strong>Verifactu</strong> no es una moda ni un rumor: es el nuevo sistema de la Agencia Tributaria que transformará cómo emites, guardas y reportas tus facturas.</p>

<p>Si gestionas apartamentos turísticos —ya sea para propietarios o con tu propia cartera—, esta normativa te afecta directamente. Y no, no puedes esperar a 2027 para empezar a moverte.</p>

<p>En esta guía te contamos todo lo que necesitas saber: qué es Verifactu, cómo te impacta como gestor y qué pasos dar desde ya para llegar preparado.</p>

<h2>¿Qué es exactamente Verifactu?</h2>

<p>Verifactu es un sistema impulsado por Hacienda que obliga a que <strong>todo software de facturación cumpla unas normas muy estrictas</strong>:</p>

<ul>
<li>Las facturas deben ser <strong>inalterables</strong> una vez emitidas</li>
<li>Cada factura llevará una <strong>huella digital</strong> que garantiza su autenticidad</li>
<li>La información se enviará a la Agencia Tributaria <strong>de forma automática o casi inmediata</strong></li>
<li>No se podrán borrar facturas, solo rectificar con documentos adicionales</li>
</ul>

<p>En resumen: se acabó lo de "ajustar" facturas a final de trimestre, los PDFs hechos a mano y los Excel con fórmulas dudosas. <strong>Hacienda quiere ver todo, y quiere verlo en tiempo real.</strong></p>

<h2>¿Te afecta como gestor de apartamentos turísticos? Sí.</h2>

<p>Si emites facturas —y como gestor, seguro que lo haces—, Verifactu te afecta. Da igual que trabajes con Airbnb, Booking o reservas directas. Todo lo que facturas tú está sujeto a esta normativa:</p>

<ul>
<li><strong>Honorarios de gestión</strong> a propietarios</li>
<li><strong>Comisiones</strong> por reservas gestionadas</li>
<li><strong>Servicios adicionales</strong>: limpieza, mantenimiento, check-in, fotografía...</li>
<li><strong>Refacturación de gastos</strong> a los propietarios</li>
</ul>

<p>Incluso si el huésped paga a través de la plataforma, <strong>tú sigues facturando al propietario por tu trabajo</strong>. Y esas facturas entran de lleno en Verifactu.</p>

<h2>Qué cambia respecto a cómo facturas hoy</h2>

<h3>El modelo actual (para muchos gestores)</h3>

<ul>
<li>Facturas creadas en Word, Excel o algún programa genérico</li>
<li>Archivos guardados en carpetas locales o en la nube</li>
<li>Presentación de impuestos trimestral, con cierto margen para "cuadrar" cifras</li>
<li>Hacienda solo mira si hay inspección</li>
</ul>

<h3>Con Verifactu</h3>

<ul>
<li>El software debe estar <strong>homologado</strong> y cumplir requisitos técnicos específicos</li>
<li>Cada factura queda <strong>sellada digitalmente</strong> en el momento de emisión</li>
<li>La Agencia Tributaria recibe la información <strong>automáticamente</strong></li>
<li>No hay margen para modificaciones posteriores</li>
</ul>

<p>Esto significa que <strong>los errores cuestan más</strong>. Pero también que, si lo haces bien desde el principio, <strong>tienes menos problemas en inspecciones</strong> y más tranquilidad.</p>

<h2>Calendario: no esperes a 2027</h2>

<p>El calendario oficial es progresivo, pero el mensaje es claro:</p>

<table>
<thead>
<tr><th>Período</th><th>Qué ocurre</th></tr>
</thead>
<tbody>
<tr><td>2024–2025</td><td>Desarrollo normativo, adaptación de software</td></tr>
<tr><td>2026</td><td>Adopción progresiva, primeras empresas obligadas</td></tr>
<tr><td><strong>2027</strong></td><td><strong>Obligatorio para la mayoría de empresas</strong></td></tr>
</tbody>
</table>

<p>Esperar al último momento es mala idea. Las empresas que se adapten antes:</p>

<ul>
<li>Tendrán tiempo para ajustar procesos sin prisas</li>
<li>Evitarán el caos de las migraciones de última hora</li>
<li>Podrán elegir mejor su software (no el primero que encuentren)</li>
</ul>

<h2>Cómo impacta Verifactu en tu día a día como gestor</h2>

<h3>1. Tu forma de facturar</h3>

<p>Ya no podrás generar facturas "a mano" o con herramientas no preparadas. Necesitarás un <strong>software de facturación compatible con Verifactu</strong> que:</p>

<ul>
<li>Genere facturas con todos los requisitos legales</li>
<li>Las selle digitalmente</li>
<li>Las envíe a Hacienda automáticamente</li>
<li>Impida modificaciones posteriores</li>
</ul>

<h3>2. La relación con tus propietarios</h3>

<p>Verifactu exige que las facturas sean correctas <strong>desde el primer momento</strong>. Eso significa:</p>

<ul>
<li>Necesitas los <strong>datos fiscales completos</strong> de cada propietario antes de facturar</li>
<li>Las liquidaciones deben cuadrar perfectamente con las facturas</li>
<li>Menos margen para "corregir después"</li>
</ul>

<p>Esto puede parecer más trabajo, pero en realidad <strong>profesionaliza la relación</strong> y evita malentendidos.</p>

<h3>3. Tu exposición ante Hacienda</h3>

<p>Con Verifactu, la coherencia entre facturas, impuestos y movimientos bancarios será mucho más fácil de verificar para la Administración. Esto reduce riesgos si:</p>

<ul>
<li>Llevas las cosas en orden</li>
<li>Facturas todo lo que debes facturar</li>
<li>No hay discrepancias entre lo que declaras y lo que cobras</li>
</ul>

<h2>Qué puedes hacer desde hoy</h2>

<h3>1. Audita cómo facturas actualmente</h3>

<p>Hazte estas preguntas:</p>

<ul>
<li>¿Uso un software de facturación serio o algo improvisado?</li>
<li>¿Las facturas tienen todos los datos obligatorios?</li>
<li>¿Podría defender cada factura en una inspección?</li>
</ul>

<p>Si la respuesta a alguna es "no" o "no sé", tienes trabajo por delante.</p>

<h3>2. Habla con tu asesor fiscal</h3>

<p>No todos los asesores están igual de al día. Pregúntale:</p>

<ul>
<li>¿Cómo me afecta Verifactu según mi estructura?</li>
<li>¿Qué cambios debo hacer en mis procesos?</li>
<li>¿Qué software me recomiendas?</li>
</ul>

<p>Si no tiene respuestas claras, quizás necesites un asesor más especializado.</p>

<h3>3. Elige un software preparado para el futuro</h3>

<p>No todos los programas de facturación cumplirán Verifactu. Antes de elegir (o de quedarte con el que tienes), asegúrate de que:</p>

<ul>
<li>Está adaptándose activamente a la normativa</li>
<li>Se integra con tu operativa de gestión turística</li>
<li>Te permite facturar, liquidar y controlar gastos en un solo sitio</li>
</ul>

<h3>4. Ordena tus datos</h3>

<p>Verifactu no perdona el desorden. Aprovecha para:</p>

<ul>
<li>Completar los datos fiscales de todos tus propietarios</li>
<li>Unificar cómo calculas comisiones y honorarios</li>
<li>Eliminar excepciones manuales innecesarias</li>
</ul>

<p>Cuanto más limpia sea tu operativa, más fácil será adaptarte.</p>

<h2>Empieza a facturar gratis con Itineramio</h2>

<p>Si estás buscando una solución para empezar a profesionalizar tu facturación, <strong>en Itineramio tenemos buenas noticias</strong>.</p>

<p>En el apartado de <strong>Gestión</strong>, si te registras ahora con tu cuenta normal de Itineramio, puedes:</p>

<ul>
<li><strong>Facturar gratis a tus clientes</strong> (propietarios)</li>
<li>Dar de alta tu empresa o autónomo con todos los datos fiscales</li>
<li>Generar facturas profesionales con numeración automática</li>
<li>Registrar gastos y repercutirlos a cada propiedad</li>
<li>Ver un <strong>dashboard completo</strong> con toda la información de tu gestión</li>
<li>Importar reservas de Airbnb y Booking</li>
<li>Generar liquidaciones mensuales para cada propietario</li>
</ul>

<p><strong>Nos estamos preparando para Verifactu.</strong> En cuanto tengamos la homologación completa, el módulo de Gestión pasará a ser de pago.</p>

<p>Pero aquí viene lo importante: <strong>todos los clientes que se registren ahora tendrán acceso gratuito para siempre</strong>, mientras mantengan su cuenta de Itineramio activa.</p>

<p>Es nuestra forma de premiar a los early adopters que confían en nosotros desde el principio.</p>

<p><a href="https://app.itineramio.com/gestion" target="_blank"><strong>Accede al módulo de Gestión →</strong></a></p>

<h2>Verifactu como oportunidad (no solo como obligación)</h2>

<p>Sí, Verifactu es una obligación. Pero también es una oportunidad para:</p>

<ul>
<li><strong>Profesionalizar tu negocio</strong>: los propietarios valoran gestores que tienen todo en regla</li>
<li><strong>Diferenciarte de la competencia</strong>: muchos gestores informales no podrán adaptarse</li>
<li><strong>Escalar con menos riesgo</strong>: si quieres gestionar más propiedades, necesitas procesos sólidos</li>
<li><strong>Dormir tranquilo</strong>: saber que Hacienda puede mirar cuando quiera y no tienes nada que esconder</li>
</ul>

<p>El sector del alquiler turístico está madurando. Verifactu es parte de esa maduración.</p>

<h2>Conclusión: el momento de actuar es ahora</h2>

<p>Verifactu llegará en 2027, pero los gestores que esperen hasta entonces lo pasarán mal. Los que empiecen ahora:</p>

<ul>
<li>Tendrán procesos probados y ajustados</li>
<li>Habrán elegido su software con calma</li>
<li>Llegarán a la fecha límite sin estrés</li>
</ul>

<p>La pregunta no es si te afecta —te afecta—. La pregunta es: <strong>¿vas a prepararte con tiempo o vas a improvisar a última hora?</strong></p>
`

const comments = [
  {
    authorName: 'Roberto García',
    authorEmail: 'roberto.garcia@example.com',
    content: 'Esto es una locura. Llevamos años gestionando apartamentos con Excel y ahora nos obligan a cambiar todo. ¿Quién va a pagar la adaptación? Los pequeños gestores como yo no tenemos recursos para esto. Hacienda solo piensa en recaudar, no en las pymes.',
    likes: 23,
    daysAgo: 5
  },
  {
    authorName: 'Carmen Ruiz',
    authorEmail: 'carmen.ruiz@example.com',
    content: 'Gracias por el artículo, muy clarificador. Yo ya me registré en Itineramio hace un mes y la verdad es que el módulo de Gestión me está funcionando muy bien. Facturo a mis 4 propietarios sin problemas y el dashboard es muy útil para ver todo de un vistazo.',
    likes: 45,
    daysAgo: 4
  },
  {
    authorName: 'Antonio Fernández',
    authorEmail: 'antonio.fernandez@example.com',
    content: 'Esto va a ser el fin de muchos pequeños gestores. Los que llevamos 3-4 apartamentos no vamos a poder asumir el coste de software homologado, asesores especializados y todo lo que implica. Al final solo quedarán las grandes empresas.',
    likes: 67,
    daysAgo: 4
  },
  {
    authorName: 'María José López',
    authorEmail: 'mariajose.lopez@example.com',
    content: 'Estoy atenta a todo esto. Mi asesor todavía no me ha dicho nada concreto, así que voy a probar Itineramio a ver qué tal. Si es gratis mientras se preparan para Verifactu, no pierdo nada.',
    likes: 12,
    daysAgo: 3
  },
  {
    authorName: 'Francisco Martín',
    authorEmail: 'francisco.martin@example.com',
    content: 'Me parece vergonzoso que nos den tan poco tiempo para adaptarnos. En otros países europeos han dado mucho más margen. España siempre igual, legislando a lo loco y luego que se apañen los autónomos.',
    likes: 89,
    daysAgo: 3
  },
  {
    authorName: 'Laura Sánchez',
    authorEmail: 'laura.sanchez@example.com',
    content: 'Llevo 3 meses usando el módulo de Gestión de Itineramio y estoy encantada. Mis propietarios reciben las facturas y liquidaciones perfectamente formateadas. Antes lo hacía todo en Word y era un desastre. Si encima va a cumplir con Verifactu, mejor que mejor.',
    likes: 34,
    daysAgo: 2
  },
  {
    authorName: 'Pedro Jiménez',
    authorEmail: 'pedro.jimenez@example.com',
    content: 'A ver, entiendo el enfado de muchos, pero seamos honestos: el sector tiene mucha economía sumergida. Esto va a limpiar el mercado y los que hacemos las cosas bien saldremos beneficiados. Hay que verlo como una oportunidad.',
    likes: 28,
    daysAgo: 2
  },
  {
    authorName: 'Ana Moreno',
    authorEmail: 'ana.moreno@example.com',
    content: 'Mi pregunta es: ¿qué pasa con los que cobramos en efectivo de algunos huéspedes? Con Verifactu todo va a quedar registrado... Veo a muchos compañeros muy preocupados por esto.',
    likes: 56,
    daysAgo: 1
  },
  {
    authorName: 'Javier Torres',
    authorEmail: 'javier.torres@example.com',
    content: 'Acabo de registrarme en Itineramio después de leer esto. La verdad es que el proceso de alta de empresa es muy sencillo y ya he generado mi primera factura. Si esto va a ser gratis para siempre para los que nos registremos ahora, es un buen momento para empezar.',
    likes: 41,
    daysAgo: 1
  },
  {
    authorName: 'Isabel Navarro',
    authorEmail: 'isabel.navarro@example.com',
    content: 'Lo que más me preocupa es la complejidad técnica. Yo no soy muy tecnológica y todo esto de huellas digitales, envío automático a Hacienda... me supera. Espero que los software lo hagan todo automático porque si no, lo veo muy negro para gestores de mi edad.',
    likes: 37,
    daysAgo: 0
  }
]

async function main() {
  console.log('Creando artículo sobre Verifactu...')

  // Create the article
  const post = await prisma.blogPost.create({
    data: {
      slug: 'verifactu-2027-guia-gestores-apartamentos-turisticos',
      title: 'Verifactu 2027: Lo que todo gestor de apartamentos turísticos debe saber',
      subtitle: 'Guía práctica para prepararte antes de que sea obligatorio',
      excerpt: 'La facturación en España está a punto de cambiar radicalmente con Verifactu. Si gestionas apartamentos turísticos, esta normativa te afecta directamente. Te contamos qué es, cómo te impacta y cómo empezar a facturar gratis con Itineramio.',
      content: articleContent,
      coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=630&fit=crop',
      coverImageAlt: 'Documentos fiscales y facturación digital',
      category: 'NORMATIVA' as BlogCategory,
      tags: ['verifactu', 'facturación', 'hacienda', 'gestión', 'normativa', 'apartamentos turísticos', 'autónomos'],
      featured: true,
      metaTitle: 'Verifactu 2027: Guía para Gestores de Apartamentos Turísticos | Itineramio',
      metaDescription: 'Todo lo que necesitas saber sobre Verifactu si gestionas apartamentos turísticos. Calendario, impacto y cómo empezar a facturar gratis con Itineramio.',
      keywords: ['verifactu', 'facturación apartamentos turísticos', 'hacienda', 'gestores alquiler vacacional', 'software facturación', 'normativa fiscal 2027'],
      status: 'PUBLISHED' as BlogStatus,
      publishedAt: new Date(),
      authorId: 'admin',
      authorName: 'Equipo Itineramio',
      readTime: 12,
      views: 1247,
      uniqueViews: 892,
      likes: 156,
      shares: 43
    }
  })

  console.log(`Artículo creado con ID: ${post.id}`)
  console.log(`URL: /blog/${post.slug}`)

  // Create comments
  console.log('\nCreando comentarios...')

  for (const comment of comments) {
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - comment.daysAgo)
    createdAt.setHours(Math.floor(Math.random() * 12) + 8) // Random hour between 8-20
    createdAt.setMinutes(Math.floor(Math.random() * 60))

    await prisma.blogComment.create({
      data: {
        postId: post.id,
        authorName: comment.authorName,
        authorEmail: comment.authorEmail,
        content: comment.content,
        status: 'APPROVED' as CommentStatus,
        likes: comment.likes,
        emailVerified: true,
        verifiedAt: createdAt,
        createdAt: createdAt,
        updatedAt: createdAt
      }
    })

    console.log(`  - Comentario de ${comment.authorName} creado`)
  }

  console.log('\n¡Artículo y comentarios creados correctamente!')
  console.log(`\nVisita: https://itineramio.com/blog/${post.slug}`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
