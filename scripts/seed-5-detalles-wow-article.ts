import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const today = new Date()
today.setHours(10, 0, 0, 0)

const article = {
  slug: '5-detalles-wow-huespedes-airbnb',
  title: '5 Detalles Que Dejan Huella en Tus Huéspedes (Y Que Quieren Contarle al Mundo)',
  subtitle: 'Ideas reales y replicables para alojamientos que quieren destacar de verdad',
  excerpt: 'No todos los alojamientos están preparados para esto. Si el tuyo sí, estos 5 detalles transformarán las reseñas de tus huéspedes.',
  coverImage: '/blog/detalles-wow/fridge.png',
  coverImageAlt: 'Nevera de bienvenida con productos locales',
  content: `
<p class="article-lead"><strong>Hay alojamientos que se reservan. Y hay alojamientos que se recuerdan.</strong></p>

<p>Después de analizar cientos de reseñas de 5 estrellas, el patrón es claro: sí, la gente menciona el WiFi y el colchón. Pero eso no es lo que convence a quien lee.</p>

<p>Lo que inclina la balanza es el comentario inesperado. El que te pilla desprevenido. <em>"Un lugar pintoresco, parece que estés en un cuento"</em>. Ese tipo de frase convierte.</p>

<h2 class="section-title">Antes de seguir: ¿es tu alojamiento el adecuado?</h2>

<div class="highlight-box" style="border-left: 4px solid #8B5CF6;">
<strong>Este artículo NO es para todos los alojamientos</strong>
<p>Vamos a ser honestos desde el principio. Los detalles que vas a leer requieren:</p>
<p>• <strong>Un alojamiento único</strong> — no un apartamento convencional<br>
• <strong>Margen suficiente</strong> — para invertir en la experiencia<br>
• <strong>Huéspedes que valoren</strong> — este tipo de detalles<br>
• <strong>Tu disposición</strong> — a hacerlo con gusto, no como obligación</p>
<p>Si tu modelo es maximizar ocupación con un loft en el centro, donde una reserva solapa a la otra, este artículo no es para ti. Ese modelo tiene sus propias reglas: pelearás con huéspedes que quieren entrar a las 8 de la mañana porque su vuelo llegó temprano, o que quieren salir a las 20:00 porque su vuelo es tarde. Y está bien, es otro enfoque.</p>
<p><strong>Pero si tu alojamiento está preparado para ofrecer experiencias premium, sigue leyendo.</strong></p>
</div>

<h3 class="subsection-title">Nuestra filosofía en alojamientos premium</h3>

<p>En algunos de nuestros alojamientos, tomamos una decisión que no nos hemos arrepentido: <strong>bloqueamos el día antes y el día después de cada reserva</strong>.</p>

<p>¿Por qué?</p>

<ul class="check-list">
<li>Si el huésped rompe algo, tenemos tiempo de repararlo sin prisas</li>
<li>Si hay alguna mejora o revisión pendiente, tenemos margen</li>
<li>El apartamento siempre está impecable, sin carreras de última hora</li>
<li>Si el huésped llega antes, le dejamos entrar sin coste adicional</li>
<li>Si necesita salir más tarde, tampoco le cobramos</li>
</ul>

<p>Sacrificamos rentabilidad a cambio de que <strong>el cliente siempre esté satisfecho</strong>. Y funciona: las reseñas lo reflejan.</p>

<p>Repito: esto es para alojamientos que lo requieren y lo pueden sostener. No es una regla universal.</p>

<div class="tip-box">
<strong>Nota</strong>
<p>Si gestionas muchas propiedades, algunos de estos detalles se pueden sistematizar o automatizar. Eso lo trataremos en otro artículo específico para gestoras.</p>
</div>

<h2 class="section-title">1. La nevera que te recibe</h2>

<p>Llegas a las 10 de la noche. El vuelo se retrasó. Estás cansado. Solo quieres dejar la maleta y respirar.</p>

<p>Abres la nevera y encuentras:</p>

<ul class="check-list">
<li>Agua fresca y algún refresco</li>
<li>Zumo natural</li>
<li>Algo de picar (snacks locales envasados)</li>
<li>Una nota escrita a mano: <em>"Para que no tengas que salir esta noche. Bienvenido."</em></li>
</ul>

<img src="/blog/detalles-wow/fridge.png" alt="Nevera de bienvenida con productos locales" style="width: 100%; border-radius: 16px; margin: 2rem 0;" />

<p>La mayoría de alojamientos reciben con una nevera vacía y un PDF de instrucciones. Tú recibes con un gesto que dice: <em>"Sé lo que se siente llegar cansado a un sitio nuevo."</em></p>

<div class="tip-box">
<strong>Consejo</strong>
<p>No pongas productos de supermercado genérico. Pon algo local: galletas del pueblo, zumo de una marca regional, un snack típico de la zona. Eso cuenta una historia.</p>
</div>

<div class="highlight-box" style="border-left: 4px solid #f59e0b;">
<strong>⚠️ Importante: seguridad alimentaria</strong>
<ul>
<li><strong>Alcohol:</strong> Hay culturas y religiones que no consumen alcohol. Ofrece siempre alternativas sin alcohol.</li>
<li><strong>Productos envasados:</strong> Usa siempre productos con envase original y trazabilidad. Si haces un bizcocho casero y el huésped tiene una reacción, podrías tener problemas legales serios.</li>
<li><strong>Alérgenos:</strong> Evita frutos secos, gluten o lácteos sin etiquetar. Los productos industriales tienen la info de alérgenos; los caseros no.</li>
</ul>
<p><strong>Siempre productos cerrados y etiquetados.</strong></p>
</div>

<h2 class="section-title">2. El mapa secreto del barrio</h2>

<p>Todos los apartamentos tienen el mismo mapa. Monumentos, museos, restaurantes con buena nota en TripAdvisor.</p>

<p>Eso no sirve. Eso lo encuentran en Google.</p>

<p>Lo que sirve es TU mapa. El que harías para un amigo que viene a visitarte por primera vez.</p>

<div class="highlight-box">
<strong>Qué incluir en tu mapa secreto</strong>
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

<h2 class="section-title">3. La playlist del apartamento</h2>

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

<h2 class="section-title">4. El rincón instagrameable</h2>

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

<h2 class="section-title">5. El Guest Book: consejos de huésped a huésped</h2>

<p><strong>Un libro donde los huéspedes dejan consejos y recomendaciones para los que vendrán después.</strong></p>

<p>No es solo un libro de firmas. Es una guía viva de tu ciudad, escrita por quienes la han vivido.</p>

<p>La idea es que unos huéspedes le cuenten a otros qué es lo mejor de la ciudad y cómo disfrutarla al máximo.</p>

<img src="/blog/detalles-wow/guest-book.png" alt="Libro de huéspedes con consejos" style="width: 100%; border-radius: 16px; margin: 2rem 0;" />

<h3 class="subsection-title">Cómo empezar tu Guest Book</h3>

<p>Para que los huéspedes entiendan la dinámica, escribe tú los primeros comentarios a modo de ejemplo:</p>

<div class="quote-card">
<p><strong>🌅 Ana y Pedro, Madrid - Marzo 2024</strong><br>
<em>"No os perdáis la puesta de sol desde el Mirador de San Nicolás. Llegad media hora antes para pillar buen sitio. ¡Mágico!"</em></p>
</div>

<div class="quote-card">
<p><strong>🍦 Marco, Italia - Abril 2024</strong><br>
<em>"Los helados de Livanti son los mejores de la ciudad. Probad el de pistacho. De nada."</em></p>
</div>

<div class="quote-card">
<p><strong>☔ Sophie, Francia - Mayo 2024</strong><br>
<em>"Si llueve, id al Mercado de San Miguel. Tapas increíbles y techo para refugiarse. Perfecto para mañanas grises."</em></p>
</div>

<div class="quote-card">
<p><strong>🍷 Carlos y Lucía, Barcelona - Junio 2024</strong><br>
<em>"El bar sin nombre de la calle X tiene el mejor vermut. Preguntad por Juan, el dueño. Contadle que venís del apartamento."</em></p>
</div>

<div class="highlight-box">
<strong>Pon el libro con esta nota:</strong>
<p><em>"Este libro lo escriben los huéspedes para los huéspedes. Deja tu mejor consejo, tu rincón favorito o tu descubrimiento. El siguiente viajero te lo agradecerá."</em></p>
</div>

<div class="tip-box">
<strong>Importante</strong>
<p>El Guest Book requiere el tipo de huésped adecuado. Si tu alojamiento atrae a gente que valora estas experiencias, funcionará de maravilla. Si no, podrían llevarse el boli, dejar comentarios inapropiados o simplemente ignorarlo. Conoce a tu público.</p>
</div>

<h2 class="section-title">El último recuerdo es el que queda</h2>

<p>La experiencia completa de un huésped es una media de toda su estancia. Pero el último recuerdo tiene un peso especial: es lo que cuentan cuando vuelven a casa.</p>

<p>Si les dejas hacer el check-out un poco más tarde sin cobrar, si tienen un detalle inesperado al final, si se van con la sensación de que les trataste bien hasta el último momento... las 5 estrellas están a la vuelta de la esquina.</p>

<p><strong>Los huéspedes no recuerdan lo que pagaron. Recuerdan cómo les hiciste sentir.</strong></p>

<h2 class="section-title">Checklist rápido</h2>

<p>Antes de cada llegada, revisa:</p>

<ul class="check-list">
<li>Nevera preparada con productos locales + nota</li>
<li>Mapa secreto visible</li>
<li>QR de playlist en lugar visible</li>
<li>Rincón instagrameable listo (buena luz)</li>
<li>Guest book con bolígrafo y nota explicativa</li>
</ul>

<div class="cta-box">
<h3>Organiza todo en un solo lugar</h3>
<p>Con Itineramio puedes crear un manual digital con tu mapa secreto, tu playlist, las instrucciones del apartamento y todo lo que tus huéspedes necesitan. Accesible desde el móvil, sin descargas, actualizable en cualquier momento.</p>
<a href="https://www.itineramio.com/register" class="cta-button">Prueba 15 días gratis</a>
</div>
`,
  category: 'MEJORES_PRACTICAS',
  tags: ['efecto wow', 'experiencia huésped', 'detalles airbnb', 'reseñas 5 estrellas', 'superhost', 'hospitalidad', 'alojamiento premium'],
  featured: true,
  metaTitle: '5 Detalles WOW para Huéspedes Airbnb: Ideas que Generan Reseñas Memorables',
  metaDescription: 'Descubre los 5 detalles que transforman un alojamiento único en inolvidable. Ideas reales para anfitriones que quieren destacar con experiencias premium.',
  keywords: ['detalles airbnb', 'efecto wow huéspedes', 'mejorar reseñas airbnb', 'experiencia huésped', 'superhost consejos', 'hospitalidad airbnb', 'alojamiento premium', 'guest book airbnb'],
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
