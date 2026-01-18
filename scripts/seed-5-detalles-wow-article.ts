import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const today = new Date()
today.setHours(10, 0, 0, 0)

const article = {
  slug: '5-detalles-wow-huespedes-airbnb',
  title: '8 Detalles Que Dejan Huella en Tus Huéspedes (Y Que Quieren Contarle al Mundo)',
  subtitle: 'Ideas reales, baratas y replicables que transforman un alojamiento correcto en uno inolvidable',
  excerpt: 'Después de analizar más de 300 reseñas de 5 estrellas, estos son los 8 detalles que más impacto generan. Ninguno cuesta más de 15€. Todos generan reseñas memorables.',
  coverImage: '/blog/detalles-wow/spotify.png',
  coverImageAlt: 'Playlist de Spotify para apartamento turístico',
  content: `
<p class="article-lead"><strong>Hay alojamientos que se reservan. Y hay alojamientos que se recuerdan.</strong></p>

<p>Después de analizar cientos de reseñas de 5 estrellas, el patrón es claro: sí, la gente menciona el WiFi y el colchón. Pero eso no es lo que convence a quien lee.</p>

<p>Lo que inclina la balanza es el comentario inesperado. El que te pilla desprevenido. <em>"Un lugar pintoresco, parece que estés en un cuento"</em>. Ese tipo de frase convierte.</p>

<p>La diferencia entre "bien, estaba limpio" y "tienes que ir, es increíble" nunca está en el precio. Está en detalles que cuestan menos de 15€ pero generan historias que la gente quiere contar.</p>

<p>Estos son los 8 que más impacto real producen.</p>

<h2 class="section-title">1. La nevera que te recibe</h2>

<p>Llegas a las 10 de la noche. El vuelo se retrasó. Estás cansado. Solo quieres dejar la maleta y respirar.</p>

<p>Abres la nevera y encuentras:</p>

<ul class="check-list">
<li>Leche fresca</li>
<li>Zumo natural</li>
<li>Una cerveza local bien fría</li>
<li>Algo de picar</li>
<li>Una nota escrita a mano: <em>"Para que no tengas que salir esta noche. Bienvenido."</em></li>
</ul>

<img src="/blog/detalles-wow/fridge.png" alt="Nevera de bienvenida con productos locales" style="width: 100%; border-radius: 16px; margin: 2rem 0;" />

<div class="feature-grid">
<div class="feature-card">
<h4>Coste real</h4>
<p>8-12€ por estancia</p>
</div>
<div class="feature-card">
<h4>Impacto real</h4>
<p>Es el detalle más mencionado en reseñas de Superhosts consolidados</p>
</div>
</div>

<p>La mayoría de alojamientos reciben con una nevera vacía y un PDF de instrucciones. Tú recibes con un gesto que dice: <em>"Sé lo que se siente llegar cansado a un sitio nuevo."</em></p>

<div class="tip-box">
<strong>Consejo</strong>
<p>No pongas productos de supermercado genérico. Pon algo local: una cerveza artesana de la zona, galletas del pueblo, zumo de una marca regional. Eso cuenta una historia.</p>
</div>

<h2 class="section-title">2. El mapa secreto del barrio</h2>

<p>Todos los apartamentos tienen el mismo mapa. Monumentos, museos, restaurantes con buena nota en TripAdvisor.</p>

<p>Eso no sirve. Eso lo encuentran en Google.</p>

<p>Lo que sirve es TU mapa. El que harías para un amigo que viene a visitarte por primera vez.</p>

<div class="highlight-box">
<strong>Qué incluir en tu mapa secreto</strong>
<p></p>
<ul>
<li><em>"Aquí desayuna mi madre los domingos. Pide las tostadas con tomate."</em></li>
<li><em>"Este bar no tiene cartel, pero el vermut es el mejor de la ciudad."</em></li>
<li><em>"A las 7pm la luz en esta esquina es perfecta para fotos."</em></li>
<li><em>"Si llueve, este es el plan B perfecto."</em></li>
<li><em>"Aquí NO vayas. Trampa turística."</em></li>
</ul>
</div>

<p>Diseñalo una vez en Canva, imprímelo en A3 y enmárcalo. O hazlo en formato postal para que se lo lleven.</p>

<img src="/blog/detalles-wow/map.png" alt="Mapa secreto del barrio con recomendaciones locales" style="width: 100%; border-radius: 16px; margin: 2rem 0;" />

<p><strong>Por qué funciona:</strong> Les das acceso a tu vida local. Eso no está en ninguna app. Eso no se compra. Y eso se cuenta.</p>

<h2 class="section-title">3. Bienvenida personalizada según el viaje</h2>

<p>Este requiere un paso extra, pero el retorno es desproporcionado.</p>

<p>En tu mensaje de confirmación (2-3 días antes), añade:</p>

<p><em>"Por cierto, ¿venís por algo especial? Aniversario, cumple, trabajo, escapada... Me gusta saber para tener todo listo."</em></p>

<p>El 70% responde. Y con esa info, adaptas UN detalle:</p>

<table class="styled-table">
<thead>
<tr><th>Motivo</th><th>Detalle</th><th>Coste</th></tr>
</thead>
<tbody>
<tr><td>Aniversario</td><td>Vela + nota romántica + bombones</td><td>8€</td></tr>
<tr><td>Cumpleaños</td><td>Globo + tarjeta + algo dulce</td><td>6€</td></tr>
<tr><td>Con niños</td><td>Juego de mesa + chuches</td><td>10€</td></tr>
<tr><td>Trabajo</td><td>Café premium + cargador extra</td><td>7€</td></tr>
<tr><td>Escapada</td><td>Vela aromática + música ambiente</td><td>5€</td></tr>
</tbody>
</table>

<img src="/blog/detalles-wow/aniversario.png" alt="Detalle de bienvenida para aniversario" style="width: 100%; border-radius: 16px; margin: 2rem 0;" />

<p>El huésped entra, ve el detalle, y piensa <em>"¿Cómo sabían...?"</em></p>

<p><strong>Esa pregunta es el efecto WOW.</strong></p>

<h2 class="section-title">4. La playlist del apartamento</h2>

<p>Este es gratis. Y casi nadie lo hace.</p>

<p>Crea una playlist en Spotify:</p>

<p><em>"Así suena [nombre de tu apartamento]"</em></p>

<p>Cúrala con intención:</p>
<ul>
<li>Música para mañanas lentas</li>
<li>Algo para cocinar con calma</li>
<li>Canciones que suenen a tu ciudad</li>
</ul>

<p>Pon un cartel con el código QR en lugar visible:</p>

<p><em>"Dale al play. Así suena este rincón."</em></p>

<img src="/blog/detalles-wow/spotify.png" alt="Playlist de Spotify del apartamento" style="width: 100%; border-radius: 16px; margin: 2rem 0;" />

<div class="feature-grid">
<div class="feature-card">
<h4>Es único</h4>
<p>Ningún otro apartamento tiene tu playlist</p>
</div>
<div class="feature-card">
<h4>Es sensorial</h4>
<p>Crea ambiente desde el minuto uno</p>
</div>
<div class="feature-card">
<h4>Es portable</h4>
<p>Se la guardan en Spotify y se la llevan</p>
</div>
<div class="feature-card">
<h4>Es recuerdo</h4>
<p>Cada vez que la escuchen, pensarán en ti</p>
</div>
</div>

<p>Una playlist es publicidad emocional que dura meses. <strong>Gratis.</strong></p>

<h2 class="section-title">5. La caja secreta de despedida</h2>

<p>Este es el detalle que nadie hace. Y el que más se recuerda.</p>

<p>La idea es simple: una cajita pequeña con código, escondida en algún lugar del apartamento. El último día, les envías un mensaje:</p>

<div class="quote-card">
<p>"Antes de que os vayáis...<br><br>
Hay una cajita escondida en el cajón de la mesilla del dormitorio.<br>
El código es 1234.<br><br>
Ábrela. Es para vosotros.<br><br>
Buen viaje de vuelta."</p>
</div>

<p>Cuando la abren, encuentran un pequeño regalo y una nota: <em>"Un trocito de aquí para que os llevéis a casa. Gracias por formar parte de este rincón."</em></p>

<img src="/blog/detalles-wow/final-present.png" alt="Caja secreta con regalo de despedida" style="width: 100%; border-radius: 16px; margin: 2rem 0;" />

<div class="tip-box">
<strong>Por qué funciona</strong>
<p></p>
<ul>
<li>Hay misterio (¿qué habrá dentro?)</li>
<li>Hay juego (tienen que buscarla y abrirla)</li>
<li>Hay sorpresa doble (el mensaje + el contenido)</li>
<li>Es exclusivo (sienten que es solo para ellos)</li>
<li>Es compartible (lo van a fotografiar y contar)</li>
</ul>
</div>

<p>El 90% de anfitriones piensan en la llegada. Casi nadie piensa en la salida. Y la salida es cuando deciden qué escribir en la reseña.</p>

<h3 class="subsection-title">Qué poner dentro de la caja</h3>

<p><strong>Opciones económicas (3-5€):</strong></p>

<table class="styled-table">
<thead>
<tr><th>Regalo</th><th>Por qué funciona</th></tr>
</thead>
<tbody>
<tr><td>Imán artesanal de la ciudad</td><td>Se lo llevan, lo ven cada día en su nevera</td></tr>
<tr><td>Llavero local bonito</td><td>Lo usan, les recuerda el viaje</td></tr>
<tr><td>Bombones o chocolate local</td><td>Dulce + local = recuerdo sensorial</td></tr>
<tr><td>Jabón artesanal pequeño</td><td>Huele a tu zona, muy instagrameable</td></tr>
<tr><td>Saquito de especias locales</td><td>Azafrán, pimentón, hierbas de la zona</td></tr>
</tbody>
</table>

<p><strong>Opciones especiales (5-10€):</strong></p>

<table class="styled-table">
<thead>
<tr><th>Regalo</th><th>Por qué funciona</th></tr>
</thead>
<tbody>
<tr><td>Botellita de aceite o vino local</td><td>Premium, local, útil</td></tr>
<tr><td>Pulsera artesanal de la zona</td><td>Se lo llevan puesto</td></tr>
<tr><td>Taza pequeña con diseño local</td><td>Práctico, la usarán en casa</td></tr>
</tbody>
</table>

<p><strong>Opciones originales (casi gratis):</strong></p>

<table class="styled-table">
<thead>
<tr><th>Regalo</th><th>Por qué funciona</th></tr>
</thead>
<tbody>
<tr><td>Piedra bonita de playa cercana + nota</td><td>Gratuito, emotivo, único</td></tr>
<tr><td>Semillas de una planta local</td><td>"Un trocito vivo de aquí para que plantes en casa"</td></tr>
</tbody>
</table>

<div class="highlight-box">
<strong>Mi recomendación</strong>
<p>Imán artesanal + un par de bombones locales + la nota. Coste total: 4-5€. Impacto: máximo.</p>
</div>

<p><strong>Dónde comprar la caja:</strong> Amazon tiene cajitas con código desde 10-15€. Búscala como "caja fuerte pequeña con combinación".</p>

<h2 class="section-title">6. El rincón instagrameable</h2>

<p>Todo el mundo que viaja quiere una cosa: <strong>fotos para sus redes</strong>. Es un hecho.</p>

<p>¿Y si les facilitas el trabajo? Crea un rincón en tu alojamiento pensado específicamente para que se hagan una foto memorable.</p>

<p>No necesitas mucho:</p>

<ul class="check-list">
<li>Una pared con un color llamativo o papel pintado bonito</li>
<li>Un neón con una frase (los hay desde 30€)</li>
<li>Unas plantas, una butaca molona, buena luz</li>
<li>Un cartel con el nombre de tu ciudad o tu apartamento</li>
</ul>

<img src="/blog/detalles-wow/alicante-vibes.png" alt="Rincón instagrameable en apartamento turístico" style="width: 100%; border-radius: 16px; margin: 2rem 0;" />

<div class="highlight-box">
<strong>El truco que nadie hace</strong>
<p>Pon un pequeño cartel con tu cuenta de Instagram: <em>"Etiquétanos en @tu_apartamento y comparte tu experiencia"</em>. Cada foto que suban es publicidad gratuita. Y si les reposteas, se sienten especiales.</p>
</div>

<p>No subestimes esto: hay gente que elige alojamientos literalmente porque tienen un rincón fotogénico. Mira los más guardados en Instagram de tu zona.</p>

<div class="feature-grid">
<div class="feature-card">
<h4>Coste</h4>
<p>30-80€ una sola vez</p>
</div>
<div class="feature-card">
<h4>Retorno</h4>
<p>Marketing orgánico infinito</p>
</div>
</div>

<h2 class="section-title">7. El mapa instagrameable de tu ciudad</h2>

<p>Ya tienes tu mapa secreto del barrio (punto 2). Ahora añade uno más: <strong>el mapa de los spots más fotogénicos de tu zona</strong>.</p>

<p>Piénsalo: tus huéspedes van a buscar en Instagram "mejores fotos en [tu ciudad]" de todas formas. ¿Por qué no dárselo ya hecho?</p>

<p>Crea un mapa visual con:</p>

<ul class="check-list">
<li>Los rincones más instagrameables de tu ciudad</li>
<li>El mejor momento del día para ir (luz)</li>
<li>Indicaciones para llegar</li>
<li>Ejemplos de cómo quedan las fotos</li>
</ul>

<img src="/blog/detalles-wow/mapa-instagrameable.png" alt="Mapa de lugares instagrameables de la ciudad" style="width: 100%; border-radius: 16px; margin: 2rem 0;" />

<div class="tip-box">
<strong>Ideas de spots</strong>
<p>La típica foto en la Torre de Pisa no te la vamos a contar. Pero seguro que en tu zona hay decenas de rincones increíbles que solo los locales conocen: una escalera con azulejos, un mirador escondido, un café con una fachada preciosa, un callejón con buganvillas...</p>
</div>

<p>Este mapa es oro. Lo van a fotografiar, lo van a seguir, y van a pensar: <em>"Este anfitrión sabe de qué va esto."</em></p>

<h2 class="section-title">8. El Guest Book</h2>

<p>Un clásico que funciona siempre: <strong>un libro donde los huéspedes dejan mensajes para los que vendrán después</strong>.</p>

<p>Parece simple. Pero cuando lo lees, es mágico.</p>

<p>Qué escriben:</p>

<ul>
<li><em>"John estuvo aquí. Gracias por todo, volveremos."</em></li>
<li><em>"Tip: el bar de la esquina tiene los mejores gin-tonics."</em></li>
<li><em>"Si llueve, id al museo X. Es gratis los domingos."</em></li>
<li><em>"María y Luis, luna de miel 2024 ❤️"</em></li>
<li><em>"A veces la vida te regala rincones así. Disfrutadlo."</em></li>
</ul>

<img src="/blog/detalles-wow/guest-book.png" alt="Libro de huéspedes con mensajes" style="width: 100%; border-radius: 16px; margin: 2rem 0;" />

<div class="highlight-box">
<strong>Por qué funciona</strong>
<p></p>
<ul>
<li>Crea conexión entre huéspedes que nunca se conocerán</li>
<li>Los nuevos leen las experiencias de otros (prueba social)</li>
<li>A la gente le encanta dejar su huella</li>
<li>Hay mensajes que te sacarán una sonrisa</li>
<li>Es contenido genuino que puedes compartir (con permiso)</li>
</ul>
</div>

<p>Pon el libro en un lugar visible con un bolígrafo bonito y una nota: <em>"Deja algo para quien venga después de ti."</em></p>

<div class="feature-grid">
<div class="feature-card">
<h4>Coste</h4>
<p>10-20€ (libreta bonita)</p>
</div>
<div class="feature-card">
<h4>Impacto</h4>
<p>Experiencia emocional única</p>
</div>
</div>

<h2 class="section-title">La fórmula del recuerdo</h2>

<p>Ninguno de estos detalles cuesta más de 15€.<br>
Ninguno requiere obra.<br>
Todos requieren lo mismo: <strong>intención</strong>.</p>

<p>Cuando alguien vuelve de un viaje y le preguntan <em>"¿qué tal el apartamento?"</em>, no dice:</p>

<p><em>"Bien, limpio y céntrico."</em></p>

<p>Dice:</p>

<div class="hero-box">
<p><em>"Cuando llegamos había cervezas frías y una nota. Y el último día nos mandaron un mensaje con un código secreto. Había una cajita escondida con un regalo dentro. <strong>INCREÍBLE.</strong>"</em></p>
</div>

<p>Esa reseña la lee todo el mundo. Y no la puedes comprar con descuentos.</p>

<p><strong>Los huéspedes no recuerdan lo que pagaron. Recuerdan cómo les hiciste sentir.</strong></p>

<h2 class="section-title">Checklist rápido</h2>

<p>Antes de cada llegada, revisa:</p>

<ul class="check-list">
<li>Nevera preparada con productos locales + nota</li>
<li>Mapa secreto visible</li>
<li>Detalle personalizado según motivo del viaje</li>
<li>QR de playlist en lugar visible</li>
<li>Cajita con regalo lista + código preparado</li>
<li>Rincón instagrameable listo (buena luz)</li>
<li>Mapa instagrameable de la ciudad disponible</li>
<li>Guest book con bolígrafo a la vista</li>
</ul>

<div class="cta-box">
<h3>Automatiza sin perder la calidez</h3>
<p>Algunos de estos detalles (como el mensaje de la caja secreta o la bienvenida personalizada) pueden integrarse en tu flujo de comunicación automática. Con Itineramio puedes crear mensajes programados que parezcan escritos a mano, incluir tu mapa secreto en el manual digital, y tener todo organizado sin perder ese toque personal.</p>
<a href="https://www.itineramio.com/register" class="cta-button">Prueba 15 días gratis</a>
</div>
`,
  category: 'MEJORES_PRACTICAS',
  tags: ['efecto wow', 'experiencia huésped', 'detalles airbnb', 'reseñas 5 estrellas', 'superhost', 'hospitalidad'],
  featured: true,
  metaTitle: '8 Detalles WOW para Huéspedes Airbnb: Ideas Baratas que Generan Reseñas',
  metaDescription: 'Descubre los 8 detalles que transforman un alojamiento normal en inolvidable. Ideas reales por menos de 15€ que generan reseñas de 5 estrellas.',
  keywords: ['detalles airbnb', 'efecto wow huéspedes', 'mejorar reseñas airbnb', 'experiencia huésped', 'superhost consejos', 'hospitalidad airbnb', 'rincón instagrameable', 'guest book airbnb'],
  authorName: 'Equipo Itineramio',
  status: 'PUBLISHED',
  publishedAt: today
}

async function main() {
  console.log('🚀 Creando artículo: 5 Detalles WOW...')

  const existingPost = await prisma.blogPost.findUnique({
    where: { slug: article.slug }
  })

  let post

  if (existingPost) {
    post = await prisma.blogPost.update({
      where: { slug: article.slug },
      data: {
        title: article.title,
        subtitle: article.subtitle,
        excerpt: article.excerpt,
        coverImage: article.coverImage,
        coverImageAlt: article.coverImageAlt,
        content: article.content,
        category: article.category as any,
        tags: article.tags,
        featured: article.featured,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        keywords: article.keywords,
        authorName: article.authorName,
        status: article.status as any,
        publishedAt: article.publishedAt,
        readTime: Math.ceil(article.content.split(/\s+/).length / 200)
      }
    })
    console.log('✅ Artículo actualizado')
  } else {
    post = await prisma.blogPost.create({
      data: {
        slug: article.slug,
        title: article.title,
        subtitle: article.subtitle,
        excerpt: article.excerpt,
        coverImage: article.coverImage,
        coverImageAlt: article.coverImageAlt,
        content: article.content,
        category: article.category as any,
        tags: article.tags,
        featured: article.featured,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        keywords: article.keywords,
        authorId: 'admin',
        authorName: article.authorName,
        status: article.status as any,
        publishedAt: article.publishedAt,
        readTime: Math.ceil(article.content.split(/\s+/).length / 200),
        views: 0,
        likes: 0
      }
    })
    console.log('✅ Artículo creado')
  }

  console.log(`\n📝 Artículo publicado:`)
  console.log(`   URL: https://www.itineramio.com/blog/${article.slug}`)
  console.log(`   Título: ${article.title}`)
  console.log(`   Categoría: ${article.category}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
