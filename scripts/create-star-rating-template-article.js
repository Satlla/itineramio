const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const articleContent = `<style>
  .article-lead { font-size: 1.25rem; line-height: 1.8; color: #374151; margin-bottom: 2rem; }
  .key-points { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 1.5rem 2rem; margin: 2rem 0; border-left: 4px solid #f59e0b; }
  .key-points h3 { font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.1em; color: #b45309; margin: 0 0 1rem 0; font-weight: 700; }
  .key-points ul { margin: 0; padding-left: 1.25rem; }
  .key-points li { color: #78350f; margin-bottom: 0.5rem; line-height: 1.6; }
  .section-title { font-size: 1.75rem; font-weight: 700; color: #111827; margin: 3rem 0 1.5rem 0; padding-bottom: 0.75rem; border-bottom: 2px solid #e5e7eb; }
  .subsection-title { font-size: 1.25rem; font-weight: 600; color: #374151; margin: 2rem 0 1rem 0; }
  .pull-quote { font-size: 1.25rem; font-style: italic; color: #4b5563; border-left: 4px solid #f59e0b; padding: 1rem 0 1rem 1.5rem; margin: 2rem 0; background: #fffbeb; border-radius: 0 8px 8px 0; }
  .info-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 1.5rem; margin: 2rem 0; }
  .info-box-title { font-size: 1rem; font-weight: 700; color: #166534; margin: 0 0 0.75rem 0; }
  .info-box p, .info-box ul { color: #15803d; margin: 0; font-size: 0.9375rem; line-height: 1.6; }
  .warning-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 1.5rem; margin: 2rem 0; }
  .warning-box-title { font-size: 1rem; font-weight: 700; color: #dc2626; margin: 0 0 0.75rem 0; }
  .warning-box p { color: #b91c1c; margin: 0; font-size: 0.9375rem; line-height: 1.6; }
  .tip-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 1.5rem; margin: 2rem 0; }
  .tip-box-title { font-size: 1rem; font-weight: 700; color: #1e40af; margin: 0 0 0.75rem 0; }
  .tip-box p { color: #1e3a8a; margin: 0; font-size: 0.9375rem; line-height: 1.6; }
  .script-box { background: #18181b; border-radius: 12px; padding: 1.5rem 2rem; margin: 1.5rem 0; }
  .script-box-title { font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: #a1a1aa; margin: 0 0 1rem 0; font-weight: 600; }
  .script-box p { color: #f4f4f5; margin: 0; font-size: 1rem; line-height: 1.7; white-space: pre-wrap; }
  .script-box .highlight { color: #fbbf24; font-weight: 500; }
  .star-card { background: white; border: 2px solid #e5e7eb; border-radius: 16px; padding: 1.5rem; margin: 1.5rem 0; }
  .star-card.five { border-color: #22c55e; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); }
  .star-card.four { border-color: #eab308; background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%); }
  .star-card.three { border-color: #f97316; background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); }
  .star-card.two { border-color: #ef4444; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); }
  .star-card.one { border-color: #991b1b; background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%); }
  .star-card .stars { font-size: 2rem; margin-bottom: 0.5rem; }
  .star-card h4 { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.75rem 0; }
  .star-card.five h4 { color: #166534; }
  .star-card.four h4 { color: #a16207; }
  .star-card.three h4 { color: #c2410c; }
  .star-card.two h4 { color: #dc2626; }
  .star-card.one h4 { color: #991b1b; }
  .star-card p { color: #374151; margin: 0; line-height: 1.6; }
  .printable-template { background: white; border: 3px dashed #d1d5db; border-radius: 16px; padding: 2rem; margin: 2rem 0; }
  .printable-template h3 { text-align: center; font-size: 1.5rem; color: #111827; margin: 0 0 0.5rem 0; }
  .printable-template .subtitle { text-align: center; color: #6b7280; margin-bottom: 2rem; font-size: 1rem; }
  .printable-template .star-row { display: flex; align-items: flex-start; margin-bottom: 1.25rem; padding-bottom: 1.25rem; border-bottom: 1px solid #e5e7eb; }
  .printable-template .star-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
  .printable-template .star-emoji { font-size: 1.5rem; min-width: 100px; }
  .printable-template .star-meaning { flex: 1; }
  .printable-template .star-meaning strong { display: block; font-size: 1rem; color: #111827; margin-bottom: 0.25rem; }
  .printable-template .star-meaning span { color: #6b7280; font-size: 0.9375rem; }
  .printable-template .footer { text-align: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb; }
  .printable-template .footer p { color: #9ca3af; font-size: 0.875rem; margin: 0; }
  .cta-banner { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 16px; padding: 2rem; margin: 2.5rem 0; text-align: center; color: white; }
  .cta-banner h4 { font-size: 1.375rem; font-weight: 700; margin: 0 0 0.75rem 0; color: white; }
  .cta-banner p { font-size: 1rem; margin: 0 0 1.25rem 0; opacity: 0.9; }
  .cta-banner a { display: inline-block; background: white; color: #d97706; font-weight: 700; padding: 0.875rem 2rem; border-radius: 8px; text-decoration: none; }
  @media print {
    .no-print { display: none !important; }
    .printable-template { border: 2px solid #000; page-break-inside: avoid; }
  }
</style>

<p class="article-lead">Muchos huespedes no saben que en Airbnb, una resena de 4 estrellas puede perjudicar seriamente a un anfitrion. Esta plantilla te ayuda a explicar de forma educada lo que significa cada puntuacion, sin parecer desesperado ni presionar.</p>

<p>En este articulo encontraras:</p>
<ul>
  <li>Una explicacion clara de lo que significa cada estrella en Airbnb</li>
  <li>Una plantilla lista para copiar y enviar como mensaje automatico</li>
  <li>Una version imprimible para dejar en tu alojamiento</li>
</ul>

<div class="key-points">
  <h3>Por que esto es importante</h3>
  <ul>
    <li>El 80% de los huespedes no saben que 4 estrellas es una mala puntuacion en Airbnb</li>
    <li>Airbnb considera "por debajo del estandar" cualquier media inferior a 4.7</li>
    <li>Educar sin presionar es la clave: el huesped debe entender, no sentirse obligado</li>
    <li>Una explicacion clara aumenta las resenas de 5 estrellas sin parecer desesperado</li>
  </ul>
</div>

<h2 class="section-title">Lo que significa cada estrella (explicacion para huespedes)</h2>

<p>Antes de compartir las plantillas, es importante que entiendas la logica detras del sistema de puntuacion de Airbnb:</p>

<div class="star-card five">
  <div class="stars">⭐⭐⭐⭐⭐</div>
  <h4>5 Estrellas = Todo estuvo correcto</h4>
  <p>El alojamiento era como se describia, estaba limpio, la comunicacion fue buena y el check-in funciono sin problemas. No significa que fuera perfecto o lujoso, simplemente que todo funciono como se esperaba. <strong>Esta es la puntuacion estandar para una estancia satisfactoria.</strong></p>
</div>

<div class="star-card four">
  <div class="stars">⭐⭐⭐⭐</div>
  <h4>4 Estrellas = Hubo algun problema menor</h4>
  <p>Algo no funciono del todo bien: quiza la limpieza no era perfecta, hubo un pequeno retraso en la comunicacion, o faltaba algun detalle. Es una puntuacion que indica que hubo margen de mejora. <strong>En Airbnb, esto se considera por debajo del estandar.</strong></p>
</div>

<div class="star-card three">
  <div class="stars">⭐⭐⭐</div>
  <h4>3 Estrellas = Hubo problemas significativos</h4>
  <p>La estancia tuvo problemas notables que afectaron la experiencia: limpieza deficiente, problemas con el equipamiento, comunicacion pobre. <strong>Esta puntuacion pone en riesgo la cuenta del anfitrion.</strong></p>
</div>

<div class="star-card two">
  <div class="stars">⭐⭐</div>
  <h4>2 Estrellas = Experiencia muy mala</h4>
  <p>La estancia fue muy por debajo de las expectativas. Problemas graves que no se solucionaron. <strong>Una puntuacion critica.</strong></p>
</div>

<div class="star-card one">
  <div class="stars">⭐</div>
  <h4>1 Estrella = Experiencia inaceptable</h4>
  <p>Todo salio mal. Condiciones inaceptables, engano en la descripcion, o situaciones graves. <strong>Reservada para situaciones extremas.</strong></p>
</div>

<div class="pull-quote">La diferencia entre 5 y 4 estrellas en Airbnb es la diferencia entre "todo bien" y "hubo un problema". No es como en los hoteles donde 4 estrellas es una buena puntuacion.</div>

<h2 class="section-title">Plantilla para mensaje automatico (copia y pega)</h2>

<p>Este mensaje esta disenado para enviar despues del checkout, junto con el agradecimiento. Es educativo, no presiona, y explica el sistema de forma clara:</p>

<div class="script-box">
  <div class="script-box-title">Mensaje post-checkout con explicacion de estrellas</div>
  <p>Hola <span class="highlight">[Nombre]</span>,

Muchas gracias por haberte alojado con nosotros. Ha sido un placer tenerte como huesped.

Si tienes un momento, te agradeceria mucho que dejaras una resena de tu experiencia. Como recordatorio, asi funciona el sistema de puntuacion de Airbnb:

<span class="highlight">⭐⭐⭐⭐⭐ 5 estrellas</span> = Todo estuvo correcto, sin problemas
<span class="highlight">⭐⭐⭐⭐ 4 estrellas</span> = Hubo algun fallo o algo que mejorar
<span class="highlight">⭐⭐⭐ 3 estrellas o menos</span> = Hubo problemas significativos

Si durante tu estancia hubo algo que no funciono bien y no me lo comentaste, me encantaria saberlo para poder mejorarlo.

Buen viaje de vuelta y espero verte de nuevo pronto.</p>
</div>

<div class="tip-box">
  <div class="tip-box-title">Consejo: cuando enviar este mensaje</div>
  <p>Envia este mensaje 2-4 horas despues del checkout, nunca antes. El huesped debe haber tenido tiempo de irse tranquilo antes de recibir cualquier peticion de resena. Si lo envias antes del checkout, parecera que solo te importa la puntuacion.</p>
</div>

<h2 class="section-title">Version imprimible para dejar en el alojamiento</h2>

<p>Esta plantilla puedes imprimirla y dejarla en un lugar visible del alojamiento (mesa del salon, carpeta de bienvenida, etc.). Es una forma sutil de educar sin enviar mensajes:</p>

<div class="printable-template">
  <h3>Gracias por tu estancia</h3>
  <p class="subtitle">Una nota sobre las resenas en Airbnb</p>

  <div class="star-row">
    <div class="star-emoji">⭐⭐⭐⭐⭐</div>
    <div class="star-meaning">
      <strong>5 Estrellas</strong>
      <span>Todo funciono correctamente. El alojamiento era como se describia.</span>
    </div>
  </div>

  <div class="star-row">
    <div class="star-emoji">⭐⭐⭐⭐</div>
    <div class="star-meaning">
      <strong>4 Estrellas</strong>
      <span>Hubo algun problema menor o algo que podria mejorar.</span>
    </div>
  </div>

  <div class="star-row">
    <div class="star-emoji">⭐⭐⭐</div>
    <div class="star-meaning">
      <strong>3 Estrellas o menos</strong>
      <span>Hubo problemas significativos durante la estancia.</span>
    </div>
  </div>

  <div class="footer">
    <p>Si hay algo que podamos mejorar, por favor dinoslo directamente.<br>Preferimos solucionarlo a que afecte tu experiencia.</p>
  </div>
</div>

<div class="info-box">
  <div class="info-box-title">Como usar la plantilla imprimible</div>
  <ul style="padding-left: 1.25rem; margin-top: 0.5rem;">
    <li>Imprime esta seccion (Ctrl+P o Cmd+P)</li>
    <li>Enmarcala o plastificala para que dure mas</li>
    <li>Colocala en la carpeta de bienvenida o en la mesa del salon</li>
    <li>Tambien puedes incluirla en tu guia digital</li>
  </ul>
</div>

<h2 class="section-title">Version corta para mensajes rapidos</h2>

<p>Si prefieres algo mas breve, esta version funciona bien para integraciones o mensajes automaticos mas concisos:</p>

<div class="script-box">
  <div class="script-box-title">Version corta</div>
  <p>Gracias por tu estancia. Si todo estuvo bien, en Airbnb eso equivale a 5 estrellas (4 estrellas significa que hubo algun fallo). Si hubo algo que mejorar, prefiero saberlo directamente para poder solucionarlo. Buen viaje!</p>
</div>

<h2 class="section-title">Que NO hacer</h2>

<div class="warning-box">
  <div class="warning-box-title">Evita estos errores</div>
  <ul style="padding-left: 1.25rem; margin: 0.5rem 0 0 0; color: #b91c1c;">
    <li><strong>No pidas 5 estrellas directamente</strong> - Parece desesperado y viola las politicas de Airbnb</li>
    <li><strong>No amenaces ni adviertas</strong> - "Si no me pones 5 estrellas, Airbnb me penaliza" es manipulador</li>
    <li><strong>No envies el mensaje antes del checkout</strong> - Parece que solo te importa la resena</li>
    <li><strong>No lo repitas varias veces</strong> - Un mensaje es suficiente, mas es spam</li>
    <li><strong>No ofrezcas incentivos</strong> - Descuentos o regalos a cambio de resenas viola las normas</li>
  </ul>
</div>

<h2 class="section-title">La clave: ofrecer canales alternativos</h2>

<p>La razon por la que funciona explicar el sistema de estrellas es que das al huesped una alternativa: si algo no fue perfecto, puede decirtelo a ti en lugar de reflejarlo en la puntuacion.</p>

<p>Combina esta plantilla con:</p>

<ul>
  <li><strong>Mensaje proactivo durante la estancia:</strong> Pregunta si todo va bien al dia siguiente de la llegada</li>
  <li><strong>Encuesta de satisfaccion privada:</strong> <a href="/blog/como-crear-encuestas-satisfaccion-huespedes-google-forms">Crea una encuesta con Google Forms</a> para feedback anonimo</li>
  <li><strong>Canal de comunicacion claro:</strong> Asegurate de que el huesped sabe como contactarte si hay problemas</li>
</ul>

<div class="cta-banner">
  <h4>Automatiza tus mensajes de checkout</h4>
  <p>Programa el mensaje con la explicacion de estrellas para que se envie automaticamente despues de cada checkout.</p>
  <a href="https://www.itineramio.com/register">Prueba Itineramio gratis 15 dias</a>
</div>

<h2 class="section-title">Resumen</h2>

<p>Educar a tus huespedes sobre el sistema de puntuacion es legitimo y util:</p>

<ol>
  <li><strong>Explica, no presiones:</strong> El mensaje debe ser informativo, no manipulador</li>
  <li><strong>Ofrece alternativas:</strong> "Dimelo a mi" es mejor que una mala resena</li>
  <li><strong>Timing correcto:</strong> Siempre despues del checkout, nunca antes</li>
  <li><strong>Una sola vez:</strong> Un mensaje basta, mas es contraproducente</li>
  <li><strong>Complementa con proactividad:</strong> Detecta problemas durante la estancia, no despues</li>
</ol>

<p>Con este enfoque, tus huespedes entenderan que 5 estrellas significa "todo bien" y tendran un canal para comunicarte problemas antes de reflejarlos en su resena.</p>`;

async function main() {
  // Get first user for authorId
  let user = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!user) {
    user = await prisma.user.findFirst();
  }

  if (!user) {
    throw new Error('No user found');
  }

  const admin = user;

  // Check if article already exists
  const existing = await prisma.blogPost.findFirst({
    where: { slug: 'plantilla-significado-estrellas-airbnb-huespedes' }
  });

  if (existing) {
    await prisma.blogPost.update({
      where: { id: existing.id },
      data: { content: articleContent }
    });
    console.log('Articulo de plantilla de estrellas actualizado');
  } else {
    await prisma.blogPost.create({
      data: {
        slug: 'plantilla-significado-estrellas-airbnb-huespedes',
        title: 'Plantilla: Que Significan las Estrellas en Airbnb (Mensaje + Imprimible)',
        excerpt: 'Plantilla lista para copiar que explica a tus huespedes el sistema de puntuacion de Airbnb. Incluye version para mensaje automatico y version imprimible.',
        content: articleContent,
        category: 'GUIAS',
        status: 'PUBLISHED',
        featured: false,
        readTime: 6,
        metaTitle: 'Plantilla Significado Estrellas Airbnb | Mensaje para Huespedes',
        metaDescription: 'Descarga gratis la plantilla que explica el sistema de estrellas de Airbnb a tus huespedes. Version para mensaje automatico y version imprimible para dejar en tu alojamiento.',
        authorName: 'Itineramio',
        authorId: admin.id,
        publishedAt: new Date()
      }
    });
    console.log('Articulo de plantilla de estrellas creado');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
