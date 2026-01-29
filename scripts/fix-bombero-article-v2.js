const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const newContent = `
<style>
  .article-lead { font-size: 1.25rem; line-height: 1.8; color: #374151; margin-bottom: 2rem; }
  .section-title { font-size: 1.75rem; font-weight: 700; color: #111827; margin: 3rem 0 1.5rem 0; padding-bottom: 0.75rem; border-bottom: 2px solid #e5e7eb; }
  .subsection-title { font-size: 1.25rem; font-weight: 600; color: #374151; margin: 2rem 0 1rem 0; }
  .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 1.5rem 2rem; margin: 2rem 0; border-left: 4px solid #f59e0b; }
  .warning-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 1.5rem; margin: 2rem 0; }
  .tip-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 1.5rem; margin: 2rem 0; }
  .check-list { list-style: none; padding-left: 0; }
  .check-list li { padding: 0.5rem 0 0.5rem 2rem; position: relative; }
  .check-list li::before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; }
  .cross-list { list-style: none; padding-left: 0; }
  .cross-list li { padding: 0.5rem 0 0.5rem 2rem; position: relative; }
  .cross-list li::before { content: "✗"; position: absolute; left: 0; color: #ef4444; font-weight: bold; }
  .cta-box { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); border-radius: 16px; padding: 2rem; margin: 3rem 0; text-align: center; color: white; }
  .cta-box h3 { color: white; margin: 0 0 1rem 0; font-size: 1.5rem; }
  .cta-box p { color: rgba(255,255,255,0.9); margin-bottom: 1.5rem; }
  .cta-button { display: inline-block; background: white; color: #7c3aed; font-weight: 600; padding: 0.875rem 2rem; border-radius: 8px; text-decoration: none; transition: transform 0.2s; }
  .cta-button:hover { transform: scale(1.05); }
  .internal-link { color: #7c3aed; text-decoration: underline; }
</style>

<p class="article-lead"><strong>Gestionar un alojamiento turístico no debería sentirse como un estado de emergencia permanente.</strong></p>

<p>Y, sin embargo, para muchos anfitriones y property managers, el día a día es exactamente eso: <strong>apagar incendios</strong>.</p>

<p>Mensajes constantes, incidencias repetidas, huéspedes desorientados y una sensación continua de estar reaccionando en lugar de dirigir.</p>

<div class="highlight-box">
<strong>En este artículo aprenderás:</strong>
<ul class="check-list">
<li>Por qué tantos anfitriones viven en modo bombero</li>
<li>Cómo pasar al modo CEO en la gestión de alojamientos turísticos</li>
<li>Qué sistemas y herramientas te permiten automatizar procesos y reducir incidencias</li>
</ul>
</div>

<h2 class="section-title">¿Por qué los anfitriones viven en modo bombero?</h2>

<p>La mayoría de problemas en un alojamiento turístico no son nuevos ni inesperados. De hecho, <strong>se repiten estancia tras estancia</strong>:</p>

<ul class="cross-list">
<li>Huéspedes que no saben cómo entrar</li>
<li>Dudas sobre el WiFi</li>
<li>Preguntas sobre el check-in</li>
<li>Confusión con normas o electrodomésticos</li>
<li>Mensajes urgentes por información básica</li>
</ul>

<p>Esto genera un patrón peligroso: <strong>gestión reactiva</strong>. Si quieres profundizar en cómo salir de este ciclo, te recomiendo leer sobre el <a href="/blog/kit-anti-caos-anfitriones-airbnb" class="internal-link">Kit Anti-Caos para Anfitriones</a>.</p>

<h2 class="section-title">Qué es el modo bombero en alojamientos turísticos</h2>

<p>El modo bombero consiste en:</p>

<ul class="cross-list">
<li>Reaccionar a cada incidencia cuando ocurre</li>
<li>Depender del móvil constantemente</li>
<li>Resolver el mismo problema una y otra vez</li>
<li>No tener procesos claros ni documentados</li>
</ul>

<div class="warning-box">
<strong>Este tipo de gestión:</strong>
<ul>
<li>❌ No escala</li>
<li>❌ Aumenta el estrés</li>
<li>❌ Empeora la experiencia del huésped</li>
<li>❌ Afecta directamente a las valoraciones en Airbnb y Booking</li>
</ul>
</div>

<h2 class="section-title">El verdadero problema no son los huéspedes, es la información</h2>

<p>Tras analizar cientos de alojamientos, el patrón es claro:</p>

<div class="highlight-box">
<strong>👉 Más del 80% de las incidencias vienen de información mal comunicada o dispersa</strong>
</div>

<p>No es que los huéspedes "pregunten demasiado". Es que:</p>

<ul class="cross-list">
<li>La información no está centralizada</li>
<li>No es accesible en el momento adecuado</li>
<li>Se envía tarde o de forma confusa</li>
</ul>

<p>Aquí es donde los PDFs, mensajes largos o explicaciones improvisadas fallan. La solución pasa por crear un <a href="/blog/manual-digital-apartamento-turistico-guia-completa" class="internal-link">manual digital profesional</a> que centralice toda la información.</p>

<!-- QUIZ EMBEBIDO - EN LA MITAD DEL ARTÍCULO -->
<div id="bombero-quiz"></div>

<h2 class="section-title">Pasar del modo bombero al modo CEO: el cambio clave</h2>

<p>Un gestor en modo CEO no intenta hacerlo todo mejor. Hace algo distinto: <strong>crea sistemas</strong>.</p>

<h3 class="subsection-title">Qué significa gestionar un alojamiento en modo CEO</h3>

<p>Gestionar como un CEO implica:</p>

<ul class="check-list">
<li>Documentar procesos</li>
<li>Automatizar la comunicación</li>
<li>Estandarizar la información</li>
<li>Evitar repetir problemas</li>
</ul>

<p>Un CEO no se pregunta: <em>"¿Cómo soluciono esto ahora?"</em></p>

<p>Se pregunta: <strong>"¿Cómo evito que vuelva a pasar?"</strong></p>

<p>Un ejemplo real de esta transformación es el <a href="/blog/caso-david-15-propiedades" class="internal-link">caso de David</a>, que pasó de gestionar 8 propiedades agotado a 15 propiedades trabajando menos horas.</p>

<h2 class="section-title">El framework para dejar de apagar incendios</h2>

<p>Para profesionalizar la gestión de un alojamiento turístico necesitas tres pilares fundamentales.</p>

<h3 class="subsection-title">1. Mensajes automáticos bien estructurados</h3>

<p>La mayoría de incidencias ocurren <strong>antes de la llegada</strong> del huésped.</p>

<p>Los <a href="/blog/mensajes-automaticos-airbnb" class="internal-link">mensajes automáticos</a> permiten:</p>

<ul class="check-list">
<li>Anticipar dudas</li>
<li>Reducir ansiedad</li>
<li>Explicar el acceso correctamente</li>
<li>Evitar llamadas innecesarias</li>
</ul>

<div class="tip-box">
<strong>💡 Tip:</strong> El error habitual es enviar textos largos. La solución es enlazar a un manual digital claro y visual.
</div>

<h3 class="subsection-title">2. Checklists y plantillas reutilizables</h3>

<p>Cada mensaje escrito desde cero:</p>

<ul class="cross-list">
<li>Consume tiempo</li>
<li>Genera inconsistencias</li>
<li>Aumenta errores</li>
</ul>

<p>Las plantillas y los <a href="/blog/checklist-limpieza-profesional-elimina-90-quejas" class="internal-link">checklists profesionales</a> permiten:</p>

<ul class="check-list">
<li>Responder siempre igual</li>
<li>Mantener un tono profesional</li>
<li>Delegar la comunicación</li>
<li>Escalar sin perder control</li>
</ul>

<p><strong>Un gestor profesional no improvisa, ejecuta procesos.</strong></p>

<h3 class="subsection-title">3. Información por zonas con QR</h3>

<p>El huésped no quiere leer todo. Quiere <strong>la información exacta en el momento exacto</strong>.</p>

<p>Ejemplos:</p>

<ul class="check-list">
<li>Instrucciones de entrada solo cuando llega</li>
<li>WiFi accesible desde un <a href="/blog/qr-code-apartamento-turistico-guia-generador" class="internal-link">código QR junto al router</a></li>
<li>Normas visibles desde el primer día</li>
</ul>

<p>Los manuales digitales por zonas <strong>reducen drásticamente</strong> mensajes y errores.</p>

<h2 class="section-title">Beneficios reales de dejar el modo bombero</h2>

<p>Cuando pasas a una gestión estructurada ocurre algo inmediato:</p>

<ul class="check-list">
<li>📉 Menos mensajes repetitivos</li>
<li>📉 Menos incidencias urgentes</li>
<li>📉 Menos estrés operativo</li>
<li>📈 Mejores valoraciones</li>
<li>📈 Más control del negocio</li>
</ul>

<p><strong>No trabajas más. Trabajas mejor.</strong></p>

<p>Si quieres ver números concretos de lo que puedes ahorrar, prueba nuestra <a href="/hub/calculadora" class="internal-link">calculadora de ahorro de tiempo</a>.</p>

<h2 class="section-title">La automatización como aliado</h2>

<p>La <a href="/blog/automatizacion-airbnb-recupera-8-horas-semanales" class="internal-link">automatización inteligente</a> no es un lujo, es una necesidad para escalar. Permite:</p>

<ul class="check-list">
<li>Enviar información en el momento correcto</li>
<li>Responder preguntas frecuentes automáticamente</li>
<li>Coordinar equipos de limpieza</li>
<li>Solicitar reseñas en el momento óptimo</li>
</ul>

<div class="cta-box">
<h3>Empieza a gestionar como un CEO</h3>
<p>Crea tu manual digital con Itineramio y transforma el caos en rutina.<br>Gratis para empezar. Sin tarjeta de crédito.</p>
<a href="/register" class="cta-button">Crear mi manual gratis →</a>
</div>

<h2 class="section-title">Pregunta clave para tu alojamiento turístico</h2>

<p>Si un problema ocurre una y otra vez, no es mala suerte. <strong>Es falta de sistema.</strong></p>

<p>Y eso tiene solución.</p>

<div class="highlight-box">
<p style="font-size: 1.25rem; margin: 0;"><strong>La pregunta no es si te afecta. Te afecta.</strong></p>
<p style="margin: 0.5rem 0 0 0;">La pregunta es: ¿vas a prepararte con sistemas o vas a seguir apagando fuegos?</p>
</div>
`

// Comentarios realistas
const comments = [
  {
    author: 'María García',
    email: 'maria.garcia.apt@gmail.com',
    content: 'Madre mia esto me describe perfectamente 😅 llevo 2 años con mi apartamento en Malaga y sigo contestando las mismas preguntas. Voy a probar lo del manual digital a ver que tal',
    createdAt: new Date('2025-01-25T14:32:00Z')
  },
  {
    author: 'Carlos',
    email: 'carlos.bcn.host@outlook.com',
    content: 'El test me salio "bombero total" jajaja no me sorprende. Tengo 3 pisos y paso el dia pegado al movil. Alguna recomendacion para empezar? es que no se por donde',
    createdAt: new Date('2025-01-25T18:15:00Z')
  },
  {
    author: 'John Mitchell',
    email: 'johnm.vacation@gmail.com',
    content: 'Great article! I manage 2 properties in Barcelona and this is exactly what I needed to read. The quiz was eye-opening, got "transition mode" which makes sense. Will try implementing the automated messages first.',
    createdAt: new Date('2025-01-26T09:45:00Z')
  },
  {
    author: 'Ana Ruiz',
    email: 'anaruiz.sevilla@yahoo.es',
    content: 'Lo de los QRs por zonas lo llevo queriendo hacer desde hace meses pero nunca encuentro el momento... alguien sabe si es muy complicado de montar?',
    createdAt: new Date('2025-01-26T11:20:00Z')
  },
  {
    author: 'Pedro Jimenez',
    email: 'pedrojimenez1985@gmail.com',
    content: 'Yo implemente los mensajes automaticos hace 6 meses y la diferencia es brutal. Antes recibia 15-20 mensajes al dia ahora como mucho 3 o 4. Lo unico malo es que al principio cuesta configurarlo todo bien',
    createdAt: new Date('2025-01-26T16:08:00Z')
  },
  {
    author: 'Laura',
    email: 'laurahostbcn@gmail.com',
    content: 'El caso de David me ha motivado mucho! Yo tengo 5 apartamentos y estoy agotadisima, pensaba que para crecer necesitaba contratar pero veo que no necesariamente. Gracias por el articulo',
    createdAt: new Date('2025-01-27T08:30:00Z')
  },
  {
    author: 'Mike',
    email: 'mike.uk.host@hotmail.com',
    content: 'Been doing Airbnb for 5 years and still in firefighter mode lol. The part about 80% of issues coming from poor information hit home hard',
    createdAt: new Date('2025-01-27T12:55:00Z')
  },
  {
    author: 'Sandra Lopez',
    email: 'sandralopez_apt@gmail.com',
    content: 'Una pregunta, el checklist de limpieza que mencionais donde lo puedo descargar?? He buscado pero no lo encuentro',
    createdAt: new Date('2025-01-27T15:40:00Z')
  },
  {
    author: 'Javier M.',
    email: 'javier.madrid.host@gmail.com',
    content: 'Muy buen contenido. Yo uso itineramio desde hace unos meses y la verdad es que me ha cambiado bastante la forma de trabajar. Los huespedes tienen toda la info y ya casi no me escriben',
    createdAt: new Date('2025-01-28T10:12:00Z')
  },
  {
    author: 'Elena',
    email: 'elena.costa.brava@outlook.es',
    content: 'jajaja el test ese da mucha risa pero es verdad eh, somos bomberos 🔥🔥 mi marido siempre me dice que deje de mirar el movil pero es que siempre hay algo',
    createdAt: new Date('2025-01-28T14:25:00Z')
  },
  {
    author: 'Roberto Fernandez',
    email: 'rfernandez.alicante@gmail.com',
    content: 'Al fin un articulo que habla claro. Estoy harto de leer consejos genericos tipo "responde rapido a tus huespedes". Esto si que es practico',
    createdAt: new Date('2025-01-28T19:50:00Z')
  },
  {
    author: 'Sarah',
    email: 'sarahwilson.travel@gmail.com',
    content: 'Question - do you think this approach works for just 1 property? I only have one apartment but still spend way too much time on it',
    createdAt: new Date('2025-01-29T07:15:00Z')
  }
]

async function main() {
  // Actualizar artículo
  const result = await prisma.blogPost.update({
    where: { slug: 'del-modo-bombero-al-modo-ceo-framework' },
    data: {
      title: 'Del Modo Bombero al Modo CEO: El Framework',
      subtitle: null,
      content: newContent.trim(),
      excerpt: 'Descubre por qué vives apagando fuegos en tu alojamiento turístico y cómo crear sistemas que te permitan gestionar sin estrés. Test incluido.',
      metaTitle: 'Del Modo Bombero al Modo CEO: Framework para Gestores',
      metaDescription: 'Deja de apagar fuegos en tu alojamiento turístico. Aprende a sistematizar tu gestión con mensajes automáticos, manuales digitales y procesos claros.',
      keywords: [
        'modo bombero airbnb',
        'gestión alojamiento turístico',
        'automatizar airbnb',
        'sistemas alquiler vacacional',
        'reducir incidencias huéspedes',
        'profesionalizar gestión apartamentos',
        'escalar negocio airbnb',
        'dejar de apagar fuegos airbnb'
      ],
      publishedAt: new Date('2025-01-25T10:00:00Z'),
      updatedAt: new Date()
    }
  })

  console.log('✅ Artículo actualizado')
  console.log('Título:', result.title)
  console.log('Fecha publicación:', result.publishedAt)

  // Eliminar comentarios existentes del artículo
  await prisma.blogComment.deleteMany({
    where: { postSlug: 'del-modo-bombero-al-modo-ceo-framework' }
  })
  console.log('🗑️ Comentarios anteriores eliminados')

  // Añadir nuevos comentarios
  for (const comment of comments) {
    await prisma.blogComment.create({
      data: {
        postSlug: 'del-modo-bombero-al-modo-ceo-framework',
        author: comment.author,
        email: comment.email,
        content: comment.content,
        approved: true,
        createdAt: comment.createdAt
      }
    })
  }

  console.log('💬 ' + comments.length + ' comentarios añadidos')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
