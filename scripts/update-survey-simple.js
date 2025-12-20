const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const surveyArticle = `<style>
  .article-lead { font-size: 1.25rem; line-height: 1.8; color: #374151; margin-bottom: 2rem; }
  .key-points { background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border-radius: 12px; padding: 1.5rem 2rem; margin: 2rem 0; border-left: 4px solid #7c3aed; }
  .key-points h3 { font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.1em; color: #7c3aed; margin: 0 0 1rem 0; font-weight: 700; }
  .key-points ul { margin: 0; padding-left: 1.25rem; }
  .key-points li { color: #4b5563; margin-bottom: 0.5rem; line-height: 1.6; }
  .section-title { font-size: 1.75rem; font-weight: 700; color: #111827; margin: 3rem 0 1.5rem 0; padding-bottom: 0.75rem; border-bottom: 2px solid #e5e7eb; }
  .subsection-title { font-size: 1.25rem; font-weight: 600; color: #374151; margin: 2rem 0 1rem 0; }
  .pull-quote { font-size: 1.25rem; font-style: italic; color: #4b5563; border-left: 4px solid #7c3aed; padding: 1rem 0 1rem 1.5rem; margin: 2rem 0; background: #faf5ff; border-radius: 0 8px 8px 0; }
  .info-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 1.5rem; margin: 2rem 0; }
  .info-box-title { font-size: 1rem; font-weight: 700; color: #166534; margin: 0 0 0.75rem 0; }
  .info-box p, .info-box ul { color: #15803d; margin: 0; font-size: 0.9375rem; line-height: 1.6; }
  .info-box ul { padding-left: 1.25rem; margin-top: 0.5rem; }
  .info-box li { margin-bottom: 0.5rem; }
  .warning-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 1.5rem; margin: 2rem 0; }
  .warning-box-title { font-size: 1rem; font-weight: 700; color: #dc2626; margin: 0 0 0.75rem 0; }
  .warning-box p, .warning-box ul { color: #b91c1c; margin: 0; font-size: 0.9375rem; line-height: 1.6; }
  .tip-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 1.5rem; margin: 2rem 0; }
  .tip-box-title { font-size: 1rem; font-weight: 700; color: #1e40af; margin: 0 0 0.75rem 0; }
  .tip-box p { color: #1e3a8a; margin: 0; font-size: 0.9375rem; line-height: 1.6; }
  .script-box { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 1.5rem 2rem; margin: 1.5rem 0; }
  .script-box-title { font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 0 0 1rem 0; font-weight: 600; }
  .script-box p { color: #334155; margin: 0; font-size: 1rem; line-height: 1.7; white-space: pre-wrap; }
  .script-box .highlight { color: #7c3aed; font-weight: 600; }
  .step-card { background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; }
  .step-card .step-number { display: inline-block; background: #7c3aed; color: white; width: 32px; height: 32px; border-radius: 50%; text-align: center; line-height: 32px; font-weight: 700; margin-right: 12px; }
  .step-card h4 { display: inline; font-size: 1.125rem; font-weight: 700; color: #111827; }
  .step-card p { color: #374151; margin: 1rem 0 0 0; line-height: 1.6; }
  .cta-banner { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); border-radius: 16px; padding: 2rem; margin: 2.5rem 0; text-align: center; color: white; }
  .cta-banner h4 { font-size: 1.375rem; font-weight: 700; margin: 0 0 0.75rem 0; color: white; }
  .cta-banner p { font-size: 1rem; margin: 0 0 1.25rem 0; opacity: 0.9; }
  .cta-banner a { display: inline-block; background: white; color: #7c3aed; font-weight: 700; padding: 0.875rem 2rem; border-radius: 8px; text-decoration: none; }
</style>

<p class="article-lead">Las encuestas largas agotan a los huéspedes y pocos las completan. La mejor encuesta es la más simple: un solo campo donde el huésped pueda escribir una línea sobre cómo va su estancia. Si hay algún problema, tú actúas.</p>

<div class="key-points">
  <h3>El enfoque minimalista</h3>
  <ul>
    <li>Una sola pregunta abierta: "¿Cómo van las primeras horas?"</li>
    <li>Sin escalas, sin puntuaciones, sin múltiples preguntas</li>
    <li>El huésped escribe lo que quiera (o nada)</li>
    <li>Si detectas un problema, contactas personalmente</li>
    <li>Tasa de respuesta mucho mayor que encuestas largas</li>
  </ul>
</div>

<h2 class="section-title">Por qué funciona mejor una encuesta mínima</h2>

<p>Las encuestas tradicionales con 7-10 preguntas tienen tasas de respuesta del 10-15%. Una encuesta de una sola pregunta puede llegar al 40-50%. Además:</p>

<ul>
  <li><strong>No agobia:</strong> El huésped está de vacaciones, no quiere rellenar formularios</li>
  <li><strong>Es personal:</strong> Una pregunta abierta invita a conversación, no a marcar casillas</li>
  <li><strong>Detecta lo importante:</strong> Si hay un problema, el huésped lo dirá</li>
  <li><strong>Permite acción inmediata:</strong> Puedes responder y solucionar mientras aún están ahí</li>
</ul>

<div class="pull-quote">El objetivo no es recopilar datos. El objetivo es detectar problemas a tiempo para solucionarlos antes del checkout.</div>

<h2 class="section-title">Crear la encuesta mínima en Google Forms</h2>

<div class="step-card">
  <span class="step-number">1</span>
  <h4>Crea un formulario nuevo</h4>
  <p>Ve a <strong>forms.google.com</strong> y crea un formulario en blanco. Ponle un título simple como "¿Qué tal todo?"</p>
</div>

<div class="step-card">
  <span class="step-number">2</span>
  <h4>Añade UNA sola pregunta</h4>
  <p>Añade una pregunta de tipo "Respuesta corta" o "Párrafo". La pregunta: <strong>"¿Cómo van las primeras horas en el apartamento? ¿Todo bien?"</strong></p>
</div>

<div class="step-card">
  <span class="step-number">3</span>
  <h4>Hazla opcional</h4>
  <p>No marques la pregunta como obligatoria. Si el huésped no quiere responder, que pueda enviar el formulario vacío (significa "todo bien").</p>
</div>

<div class="step-card">
  <span class="step-number">4</span>
  <h4>Obtén el enlace corto</h4>
  <p>Haz clic en "Enviar" → icono de enlace → "Acortar URL". Copia el enlace para incluirlo en tu mensaje.</p>
</div>

<div class="tip-box">
  <div class="tip-box-title">Configuración recomendada</div>
  <p>En Configuración (icono de engranaje), activa "Recopilar direcciones de correo electrónico" solo si quieres saber quién respondió. Si prefieres que sea anónimo para fomentar honestidad, déjalo desactivado.</p>
</div>

<h2 class="section-title">El mensaje para enviar la encuesta</h2>

<p>Envía este mensaje al día siguiente de la llegada (unas 18-24 horas después del check-in):</p>

<div class="script-box">
  <div class="script-box-title">Mensaje con encuesta (día siguiente)</div>
  <p>Hola <span class="highlight">[Nombre]</span>, ¿qué tal la primera noche?

Si tienes un segundo, cuéntame cómo va todo:
<span class="highlight">[ENLACE A LA ENCUESTA]</span>

Si hay cualquier cosa que pueda mejorar, dímelo y lo soluciono.

¡Que disfrutéis!</p>
</div>

<div class="info-box">
  <div class="info-box-title">Por qué al día siguiente</div>
  <p>24 horas es tiempo suficiente para que el huésped haya dormido, usado la ducha, probado la cocina... Si hay algún problema, ya lo habrá detectado. Y tú tienes tiempo de solucionarlo antes del checkout.</p>
</div>

<h2 class="section-title">Qué hacer con las respuestas</h2>

<h3 class="subsection-title">Si responden "Todo bien" o similar</h3>

<p>No hagas nada. El huésped está contento. No les escribas más hasta el checkout.</p>

<h3 class="subsection-title">Si responden con un problema</h3>

<p>Contacta inmediatamente por el chat de la plataforma o WhatsApp (si lo tienes). Ejemplo:</p>

<div class="script-box">
  <div class="script-box-title">Respuesta a problema detectado</div>
  <p>Hola <span class="highlight">[Nombre]</span>,

Acabo de ver tu mensaje sobre <span class="highlight">[el problema]</span>. Lo siento mucho.

<span class="highlight">[Acción que vas a tomar]</span>

¿Te viene bien si <span class="highlight">[propuesta de solución]</span>?

Perdona las molestias.</p>
</div>

<h3 class="subsection-title">Si no responden</h3>

<p>Probablemente todo va bien. No insistas con más mensajes. La ausencia de respuesta suele ser buena señal.</p>

<div class="warning-box">
  <div class="warning-box-title">Error común</div>
  <p style="margin-bottom: 0.5rem;">No envíes recordatorios si no responden. Un mensaje basta. Más de uno se siente como acoso y genera el efecto contrario: molestia.</p>
</div>

<h2 class="section-title">Ventajas de este sistema</h2>

<ol>
  <li><strong>Mínimo esfuerzo para el huésped:</strong> 10 segundos para responder (o nada)</li>
  <li><strong>Detección temprana:</strong> Sabes si hay problemas antes de que sea tarde</li>
  <li><strong>Comunicación personal:</strong> Parece una conversación, no una encuesta corporativa</li>
  <li><strong>Acción inmediata:</strong> Puedes solucionar mientras aún están en el apartamento</li>
  <li><strong>Mejor relación:</strong> El huésped siente que te importa su experiencia</li>
</ol>

<div class="cta-banner">
  <h4>Automatiza el envío</h4>
  <p>Programa el mensaje para que se envíe automáticamente 24h después de cada check-in.</p>
  <a href="https://www.itineramio.com/register">Prueba Itineramio gratis 15 días</a>
</div>

<h2 class="section-title">Resumen</h2>

<p>La encuesta perfecta es la más simple:</p>

<ol>
  <li><strong>Una sola pregunta:</strong> "¿Cómo van las primeras horas?"</li>
  <li><strong>Campo de texto libre:</strong> El huésped escribe lo que quiera</li>
  <li><strong>Envía al día siguiente:</strong> 18-24 horas después del check-in</li>
  <li><strong>Si hay problema, actúa:</strong> Contacta personalmente y soluciona</li>
  <li><strong>Si no responden, bien:</strong> No insistas, significa que todo va bien</li>
</ol>

<p>Este sistema te da información útil sin molestar al huésped. Y lo más importante: te permite solucionar problemas antes de que se conviertan en malas reseñas.</p>`;

async function main() {
  const surveyPost = await prisma.blogPost.findFirst({
    where: { slug: 'como-crear-encuestas-satisfaccion-huespedes-google-forms' }
  });

  if (surveyPost) {
    await prisma.blogPost.update({
      where: { id: surveyPost.id },
      data: {
        content: surveyArticle,
        title: 'Encuesta de Satisfacción Mínima: Una Sola Pregunta que Funciona',
        excerpt: 'La mejor encuesta es la más simple. Una sola pregunta abierta para detectar problemas a tiempo y solucionarlos antes del checkout.',
        readTime: 5
      }
    });
    console.log('Artículo de encuestas actualizado con enfoque minimalista');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
