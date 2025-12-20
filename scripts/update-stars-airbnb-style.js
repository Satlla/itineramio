const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const starsArticle = `<style>
  .article-lead { font-size: 1.25rem; line-height: 1.8; color: #374151; margin-bottom: 2rem; }
  .key-points { background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border-radius: 12px; padding: 1.5rem 2rem; margin: 2rem 0; border-left: 4px solid #7c3aed; }
  .key-points h3 { font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.1em; color: #7c3aed; margin: 0 0 1rem 0; font-weight: 700; }
  .key-points ul { margin: 0; padding-left: 1.25rem; }
  .key-points li { color: #4b5563; margin-bottom: 0.5rem; line-height: 1.6; }
  .section-title { font-size: 1.75rem; font-weight: 700; color: #111827; margin: 3rem 0 1.5rem 0; padding-bottom: 0.75rem; border-bottom: 2px solid #e5e7eb; }
  .pull-quote { font-size: 1.25rem; font-style: italic; color: #4b5563; border-left: 4px solid #7c3aed; padding: 1rem 0 1rem 1.5rem; margin: 2rem 0; background: #faf5ff; border-radius: 0 8px 8px 0; }
  .info-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 1.5rem; margin: 2rem 0; }
  .info-box-title { font-size: 1rem; font-weight: 700; color: #166534; margin: 0 0 0.75rem 0; }
  .info-box p, .info-box ul { color: #15803d; margin: 0; font-size: 0.9375rem; line-height: 1.6; }
  .warning-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 1.5rem; margin: 2rem 0; }
  .warning-box-title { font-size: 1rem; font-weight: 700; color: #dc2626; margin: 0 0 0.75rem 0; }
  .warning-box p { color: #b91c1c; margin: 0; font-size: 0.9375rem; line-height: 1.6; }
  .tip-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 1.5rem; margin: 2rem 0; }
  .tip-box-title { font-size: 1rem; font-weight: 700; color: #1e40af; margin: 0 0 0.75rem 0; }
  .tip-box p { color: #1e3a8a; margin: 0; font-size: 0.9375rem; line-height: 1.6; }
  .script-box { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 1.5rem 2rem; margin: 1.5rem 0; }
  .script-box-title { font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 0 0 1rem 0; font-weight: 600; }
  .script-box p { color: #334155; margin: 0; font-size: 1rem; line-height: 1.7; white-space: pre-wrap; }
  .script-box .highlight { color: #7c3aed; font-weight: 600; }
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

  /* Plantilla estilo Airbnb */
  .airbnb-template {
    background: #ffffff;
    border-radius: 24px;
    padding: 2.5rem 2rem;
    margin: 2.5rem 0;
    box-shadow: 0 6px 16px rgba(0,0,0,0.12);
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }
  .airbnb-template-header {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #ebebeb;
  }
  .airbnb-template-header .airbnb-logo {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }
  .airbnb-template-header h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #222222;
    margin: 0 0 0.5rem 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  .airbnb-template-header p {
    color: #717171;
    margin: 0;
    font-size: 1rem;
  }

  .airbnb-star-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1.25rem 1rem;
    border-bottom: 1px solid #ebebeb;
  }
  .airbnb-star-item:last-child {
    border-bottom: none;
  }
  .airbnb-star-emoji {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
    letter-spacing: 2px;
  }
  .airbnb-star-title {
    font-size: 1rem;
    font-weight: 600;
    color: #222222;
    margin-bottom: 0.25rem;
  }
  .airbnb-star-item.five .airbnb-star-title { color: #008A05; }
  .airbnb-star-item.four .airbnb-star-title { color: #C13515; }
  .airbnb-star-item.three .airbnb-star-title { color: #C13515; }
  .airbnb-star-desc {
    font-size: 0.9375rem;
    color: #717171;
    line-height: 1.4;
    max-width: 320px;
  }

  .airbnb-template-footer {
    text-align: center;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #ebebeb;
  }
  .airbnb-template-footer p {
    color: #717171;
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0;
  }
  .airbnb-template-footer .airbnb-coral {
    color: #FF385C;
    font-weight: 600;
  }

  .cta-banner { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); border-radius: 16px; padding: 2rem; margin: 2.5rem 0; text-align: center; color: white; }
  .cta-banner h4 { font-size: 1.375rem; font-weight: 700; margin: 0 0 0.75rem 0; color: white; }
  .cta-banner p { font-size: 1rem; margin: 0 0 1.25rem 0; opacity: 0.9; }
  .cta-banner a { display: inline-block; background: white; color: #7c3aed; font-weight: 700; padding: 0.875rem 2rem; border-radius: 8px; text-decoration: none; }

  @media print {
    .no-print { display: none !important; }
    .airbnb-template {
      box-shadow: none;
      border: 2px solid #222;
      page-break-inside: avoid;
      max-width: 100%;
    }
  }

  @media (max-width: 640px) {
    .airbnb-template {
      padding: 1.5rem 1.25rem;
      margin: 1.5rem 0;
      border-radius: 16px;
    }
    .airbnb-template-header h3 {
      font-size: 1.25rem;
    }
    .airbnb-star-emoji {
      font-size: 1.5rem;
    }
    .airbnb-star-desc {
      font-size: 0.875rem;
    }
  }
</style>

<p class="article-lead">Muchos huéspedes no saben que en Airbnb, una reseña de 4 estrellas puede perjudicar seriamente a un anfitrión. Esta plantilla te ayuda a explicar de forma educada lo que significa cada puntuación, sin parecer desesperado ni presionar.</p>

<p>En este artículo encontrarás:</p>
<ul>
  <li>Una explicación clara de lo que significa cada estrella en Airbnb</li>
  <li>Una plantilla lista para copiar y enviar como mensaje automático</li>
  <li>Una versión imprimible estilo Airbnb para dejar en tu alojamiento</li>
</ul>

<div class="key-points">
  <h3>Por qué esto es importante</h3>
  <ul>
    <li>El 80% de los huéspedes no saben que 4 estrellas es una mala puntuación en Airbnb</li>
    <li>Airbnb considera "por debajo del estándar" cualquier media inferior a 4.7</li>
    <li>Educar sin presionar es la clave: el huésped debe entender, no sentirse obligado</li>
    <li>Una explicación clara aumenta las reseñas de 5 estrellas sin parecer desesperado</li>
  </ul>
</div>

<h2 class="section-title">Lo que significa cada estrella</h2>

<p>Antes de compartir las plantillas, es importante que entiendas la lógica detrás del sistema de puntuación de Airbnb:</p>

<div class="star-card five">
  <div class="stars">⭐⭐⭐⭐⭐</div>
  <h4>5 Estrellas = Todo estuvo correcto</h4>
  <p>El alojamiento era como se describía, estaba limpio, la comunicación fue buena y el check-in funcionó sin problemas. No significa que fuera perfecto o lujoso, simplemente que todo funcionó como se esperaba. <strong>Esta es la puntuación estándar para una estancia satisfactoria.</strong></p>
</div>

<div class="star-card four">
  <div class="stars">⭐⭐⭐⭐</div>
  <h4>4 Estrellas = Hubo algún problema menor</h4>
  <p>Algo no funcionó del todo bien: quizá la limpieza no era perfecta, hubo un pequeño retraso en la comunicación, o faltaba algún detalle. Es una puntuación que indica que hubo margen de mejora. <strong>En Airbnb, esto se considera por debajo del estándar.</strong></p>
</div>

<div class="star-card three">
  <div class="stars">⭐⭐⭐</div>
  <h4>3 Estrellas = Hubo problemas significativos</h4>
  <p>La estancia tuvo problemas notables que afectaron la experiencia: limpieza deficiente, problemas con el equipamiento, comunicación pobre. <strong>Esta puntuación pone en riesgo la cuenta del anfitrión.</strong></p>
</div>

<div class="pull-quote">La diferencia entre 5 y 4 estrellas en Airbnb es la diferencia entre "todo bien" y "hubo un problema". No es como en los hoteles donde 4 estrellas es una buena puntuación.</div>

<h2 class="section-title">Plantilla para mensaje automático</h2>

<p>Este mensaje está diseñado para enviar después del checkout. Es educativo, no presiona, y explica el sistema de forma clara:</p>

<div class="script-box">
  <div class="script-box-title">Mensaje post-checkout</div>
  <p>Hola <span class="highlight">[Nombre]</span>,

Muchas gracias por haberte alojado con nosotros. Ha sido un placer tenerte como huésped.

Si tienes un momento, te agradecería mucho que dejaras una reseña de tu experiencia. Como recordatorio, así funciona el sistema de puntuación de Airbnb:

<span class="highlight">⭐⭐⭐⭐⭐ 5 estrellas</span> = Todo estuvo correcto, sin problemas
<span class="highlight">⭐⭐⭐⭐ 4 estrellas</span> = Hubo algún fallo o algo que mejorar
<span class="highlight">⭐⭐⭐ 3 estrellas o menos</span> = Hubo problemas significativos

Si durante tu estancia hubo algo que no funcionó bien y no me lo comentaste, me encantaría saberlo para poder mejorarlo.

Buen viaje de vuelta y espero verte de nuevo pronto.</p>
</div>

<div class="tip-box">
  <div class="tip-box-title">Cuándo enviar este mensaje</div>
  <p>Envía este mensaje 2-4 horas después del checkout, nunca antes. El huésped debe haber tenido tiempo de irse tranquilo antes de recibir cualquier petición de reseña.</p>
</div>

<h2 class="section-title">Versión imprimible estilo Airbnb</h2>

<p>Esta plantilla puedes imprimirla y dejarla en un lugar visible del alojamiento (mesa del salón, carpeta de bienvenida). Diseñada con el estilo visual de Airbnb para que se sienta familiar:</p>

<div class="airbnb-template">
  <div class="airbnb-template-header">
    <div class="airbnb-logo">🏠</div>
    <h3>Gracias por tu estancia</h3>
    <p>Cómo funcionan las reseñas en Airbnb</p>
  </div>

  <div class="airbnb-star-item five">
    <div class="airbnb-star-emoji">⭐⭐⭐⭐⭐</div>
    <div class="airbnb-star-title">5 Estrellas</div>
    <div class="airbnb-star-desc">Todo funcionó correctamente. El alojamiento era como se describía.</div>
  </div>

  <div class="airbnb-star-item four">
    <div class="airbnb-star-emoji">⭐⭐⭐⭐</div>
    <div class="airbnb-star-title">4 Estrellas</div>
    <div class="airbnb-star-desc">Hubo algún problema menor o algo que podría mejorar.</div>
  </div>

  <div class="airbnb-star-item three">
    <div class="airbnb-star-emoji">⭐⭐⭐</div>
    <div class="airbnb-star-title">3 Estrellas o menos</div>
    <div class="airbnb-star-desc">Hubo problemas significativos durante la estancia.</div>
  </div>

  <div class="airbnb-template-footer">
    <p>Si hay algo que podamos mejorar, <span class="airbnb-coral">dínoslo directamente</span>.<br>Preferimos solucionarlo a que afecte tu experiencia.</p>
  </div>
</div>

<div class="info-box">
  <div class="info-box-title">Cómo usar la plantilla</div>
  <ul style="padding-left: 1.25rem; margin-top: 0.5rem;">
    <li>Imprime esta sección (Ctrl+P o Cmd+P)</li>
    <li>Enmárcala o plastifícala para que dure más</li>
    <li>Colócala en la carpeta de bienvenida o en la mesa del salón</li>
    <li>También puedes incluirla en tu guía digital</li>
  </ul>
</div>

<h2 class="section-title">Versión corta para mensajes rápidos</h2>

<p>Si prefieres algo más breve:</p>

<div class="script-box">
  <div class="script-box-title">Versión corta</div>
  <p>Gracias por tu estancia. Si todo estuvo bien, en Airbnb eso equivale a 5 estrellas (4 estrellas significa que hubo algún fallo). Si hubo algo que mejorar, prefiero saberlo directamente para poder solucionarlo. ¡Buen viaje!</p>
</div>

<h2 class="section-title">Qué NO hacer</h2>

<div class="warning-box">
  <div class="warning-box-title">Evita estos errores</div>
  <ul style="padding-left: 1.25rem; margin: 0.5rem 0 0 0; color: #b91c1c;">
    <li><strong>No pidas 5 estrellas directamente</strong> - Parece desesperado y viola las políticas de Airbnb</li>
    <li><strong>No amenaces ni adviertas</strong> - "Si no me pones 5 estrellas, Airbnb me penaliza" es manipulador</li>
    <li><strong>No envíes el mensaje antes del checkout</strong> - Parece que solo te importa la reseña</li>
    <li><strong>No lo repitas varias veces</strong> - Un mensaje es suficiente, más es spam</li>
  </ul>
</div>

<h2 class="section-title">La clave: ofrecer alternativas</h2>

<p>La razón por la que funciona explicar el sistema de estrellas es que das al huésped una alternativa: si algo no fue perfecto, puede decírtelo a ti en lugar de reflejarlo en la puntuación.</p>

<p>Combina esta plantilla con:</p>

<ul>
  <li><strong>Mensaje proactivo durante la estancia:</strong> Pregunta si todo va bien al día siguiente de la llegada</li>
  <li><strong>Encuesta de satisfacción privada:</strong> <a href="/blog/como-crear-encuestas-satisfaccion-huespedes-google-forms">Una pregunta simple con Google Forms</a></li>
  <li><strong>Canal de comunicación claro:</strong> Asegúrate de que el huésped sabe cómo contactarte</li>
</ul>

<div class="cta-banner">
  <h4>Automatiza tus mensajes de checkout</h4>
  <p>Programa el mensaje para que se envíe automáticamente después de cada checkout.</p>
  <a href="https://www.itineramio.com/register">Prueba Itineramio gratis 15 días</a>
</div>

<h2 class="section-title">Resumen</h2>

<p>Educar a tus huéspedes sobre el sistema de puntuación es legítimo y útil:</p>

<ol>
  <li><strong>Explica, no presiones:</strong> El mensaje debe ser informativo, no manipulador</li>
  <li><strong>Ofrece alternativas:</strong> "Dímelo a mí" es mejor que una mala reseña</li>
  <li><strong>Timing correcto:</strong> Siempre después del checkout, nunca antes</li>
  <li><strong>Una sola vez:</strong> Un mensaje basta, más es contraproducente</li>
</ol>

<p>Con este enfoque, tus huéspedes entenderán que 5 estrellas significa "todo bien" y tendrán un canal para comunicarte problemas antes de reflejarlos en su reseña.</p>`;

async function main() {
  const starsPost = await prisma.blogPost.findFirst({
    where: { slug: 'plantilla-significado-estrellas-airbnb-huespedes' }
  });

  if (starsPost) {
    await prisma.blogPost.update({
      where: { id: starsPost.id },
      data: { content: starsArticle }
    });
    console.log('Plantilla de estrellas actualizada con diseño Airbnb');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
