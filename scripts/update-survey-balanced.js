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
  .question-box { background: #f9fafb; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; border-left: 4px solid #6366f1; }
  .question-box h5 { font-size: 1rem; font-weight: 700; color: #4338ca; margin: 0 0 0.5rem 0; }
  .question-box .type { font-size: 0.75rem; text-transform: uppercase; color: #6b7280; margin-bottom: 0.75rem; }
  .question-box p { color: #374151; margin: 0; font-size: 0.9375rem; line-height: 1.5; }
  .cta-banner { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); border-radius: 16px; padding: 2rem; margin: 2.5rem 0; text-align: center; color: white; }
  .cta-banner h4 { font-size: 1.375rem; font-weight: 700; margin: 0 0 0.75rem 0; color: white; }
  .cta-banner p { font-size: 1rem; margin: 0 0 1.25rem 0; opacity: 0.9; }
  .cta-banner a { display: inline-block; background: white; color: #7c3aed; font-weight: 700; padding: 0.875rem 2rem; border-radius: 8px; text-decoration: none; }
  .lang-table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
  .lang-table th, .lang-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e5e7eb; }
  .lang-table th { background: #f9fafb; font-weight: 600; color: #374151; }
  .lang-table td { color: #4b5563; }
</style>

<p class="article-lead">Las encuestas de satisfacción te permiten detectar problemas antes de que se conviertan en malas reseñas. Con Google Forms puedes crear una encuesta profesional en minutos, y si la envías al día siguiente de la llegada, tienes tiempo de solucionar cualquier incidencia.</p>

<div class="key-points">
  <h3>Lo que vas a aprender</h3>
  <ul>
    <li>Crear una encuesta con las 5 preguntas esenciales</li>
    <li>Cómo gestionar múltiples idiomas para huéspedes internacionales</li>
    <li>Cuándo enviar la encuesta y cómo actuar con las respuestas</li>
    <li>Plantillas de mensaje listas para copiar</li>
  </ul>
</div>

<h2 class="section-title">Las 5 preguntas que debe tener tu encuesta</h2>

<p>Una encuesta efectiva es corta (máximo 5 preguntas) pero cubre los aspectos clave. Estas son las preguntas recomendadas:</p>

<div class="question-box">
  <h5>1. Satisfacción general</h5>
  <div class="type">Escala 1-5 estrellas</div>
  <p>"¿Cómo valorarías tu experiencia general hasta ahora?"</p>
</div>

<div class="question-box">
  <h5>2. Limpieza</h5>
  <div class="type">Escala 1-5 estrellas</div>
  <p>"¿Cómo valorarías la limpieza del alojamiento?"</p>
</div>

<div class="question-box">
  <h5>3. Check-in</h5>
  <div class="type">Escala 1-5 estrellas</div>
  <p>"¿El proceso de llegada fue sencillo y claro?"</p>
</div>

<div class="question-box">
  <h5>4. Equipamiento</h5>
  <div class="type">Escala 1-5 estrellas</div>
  <p>"¿Funciona todo correctamente? (WiFi, electrodomésticos, agua caliente...)"</p>
</div>

<div class="question-box">
  <h5>5. Comentarios</h5>
  <div class="type">Texto libre (opcional)</div>
  <p>"¿Hay algo que podamos mejorar o algún comentario que quieras hacernos?"</p>
</div>

<div class="tip-box">
  <div class="tip-box-title">Por qué estas 5 preguntas</div>
  <p>Cubren los 4 aspectos que más afectan a las reseñas (satisfacción, limpieza, check-in, equipamiento) más una pregunta abierta para detectar problemas específicos. Son suficientes para actuar, pero no tantas como para agotar al huésped.</p>
</div>

<h2 class="section-title">Crear la encuesta en Google Forms</h2>

<div class="step-card">
  <span class="step-number">1</span>
  <h4>Crea el formulario</h4>
  <p>Ve a <strong>forms.google.com</strong>, crea un formulario en blanco y ponle un título como "¿Qué tal tu estancia?"</p>
</div>

<div class="step-card">
  <span class="step-number">2</span>
  <h4>Añade las preguntas</h4>
  <p>Para las preguntas 1-4, usa "Escala lineal" de 1 a 5. Para la pregunta 5, usa "Párrafo" y márcala como opcional.</p>
</div>

<div class="step-card">
  <span class="step-number">3</span>
  <h4>Configura las opciones</h4>
  <p>En Configuración, puedes activar "Limitar a 1 respuesta" si quieres evitar duplicados. No es necesario recoger emails.</p>
</div>

<div class="step-card">
  <span class="step-number">4</span>
  <h4>Obtén el enlace</h4>
  <p>Haz clic en "Enviar" → icono de enlace → "Acortar URL". Guarda este enlace para tus mensajes.</p>
</div>

<h2 class="section-title">Gestionar múltiples idiomas</h2>

<p>Si recibes huéspedes internacionales, tienes dos opciones para ofrecer la encuesta en varios idiomas:</p>

<h3 class="subsection-title">Opción A: Un formulario por idioma (recomendado)</h3>

<p>Crea copias del formulario en cada idioma que necesites (español, inglés, francés...). Luego, envía el enlace correcto según el idioma del huésped.</p>

<div class="info-box">
  <div class="info-box-title">Ventajas</div>
  <ul>
    <li>Experiencia nativa para cada huésped</li>
    <li>Puedes analizar respuestas por idioma/mercado</li>
    <li>Fácil de mantener y actualizar</li>
  </ul>
</div>

<p>Ejemplo de enlaces:</p>
<ul>
  <li><strong>Español:</strong> forms.gle/xxx-es</li>
  <li><strong>English:</strong> forms.gle/xxx-en</li>
  <li><strong>Français:</strong> forms.gle/xxx-fr</li>
</ul>

<h3 class="subsection-title">Opción B: Selector de idioma en el formulario</h3>

<p>Si prefieres un solo formulario, añade una primera pregunta "Select your language / Selecciona tu idioma" y usa secciones condicionales para mostrar las preguntas en el idioma elegido.</p>

<div class="warning-box">
  <div class="warning-box-title">Inconveniente</div>
  <p>Esta opción es más compleja de configurar y mantener. Además, el análisis de respuestas mezcla todos los idiomas. Recomendamos la Opción A para la mayoría de casos.</p>
</div>

<h3 class="subsection-title">Las 5 preguntas en 3 idiomas</h3>

<p>Aquí tienes las preguntas traducidas para copiar directamente:</p>

<table class="lang-table">
  <thead>
    <tr>
      <th>Español</th>
      <th>English</th>
      <th>Français</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>¿Cómo valorarías tu experiencia general?</td>
      <td>How would you rate your overall experience?</td>
      <td>Comment évalueriez-vous votre expérience globale?</td>
    </tr>
    <tr>
      <td>¿Cómo valorarías la limpieza?</td>
      <td>How would you rate the cleanliness?</td>
      <td>Comment évalueriez-vous la propreté?</td>
    </tr>
    <tr>
      <td>¿El proceso de llegada fue sencillo?</td>
      <td>Was the check-in process easy?</td>
      <td>Le processus d'arrivée était-il facile?</td>
    </tr>
    <tr>
      <td>¿Funciona todo correctamente?</td>
      <td>Is everything working properly?</td>
      <td>Tout fonctionne-t-il correctement?</td>
    </tr>
    <tr>
      <td>¿Algún comentario o sugerencia?</td>
      <td>Any comments or suggestions?</td>
      <td>Des commentaires ou suggestions?</td>
    </tr>
  </tbody>
</table>

<h2 class="section-title">Cuándo enviar la encuesta</h2>

<p>El mejor momento es <strong>al día siguiente de la llegada</strong> (18-24 horas después del check-in). Esto te da tiempo de solucionar problemas mientras el huésped aún está en el alojamiento.</p>

<div class="script-box">
  <div class="script-box-title">Mensaje con encuesta (español)</div>
  <p>Hola <span class="highlight">[Nombre]</span>, ¿qué tal la primera noche?

Me encantaría saber si todo está en orden. Si tienes 1 minuto, esta breve encuesta me ayuda muchísimo:

<span class="highlight">[ENLACE ENCUESTA]</span>

Si hay cualquier cosa que pueda mejorar, dímelo y lo soluciono.

¡Que disfrutéis!</p>
</div>

<div class="script-box">
  <div class="script-box-title">Message with survey (English)</div>
  <p>Hi <span class="highlight">[Name]</span>, how was your first night?

I'd love to know if everything is going well. If you have 1 minute, this quick survey helps me a lot:

<span class="highlight">[SURVEY LINK]</span>

If there's anything I can improve, let me know and I'll sort it out.

Enjoy your stay!</p>
</div>

<h2 class="section-title">Qué hacer con las respuestas</h2>

<h3 class="subsection-title">Si la puntuación es 4-5 en todo</h3>
<p>Perfecto, no hagas nada. El huésped está contento.</p>

<h3 class="subsection-title">Si hay alguna puntuación de 3 o menos</h3>
<p>Contacta inmediatamente para saber qué pasó y cómo puedes solucionarlo:</p>

<div class="script-box">
  <div class="script-box-title">Mensaje de seguimiento</div>
  <p>Hola <span class="highlight">[Nombre]</span>,

Acabo de ver tu respuesta en la encuesta y veo que <span class="highlight">[aspecto con baja puntuación]</span> no ha ido del todo bien.

Me gustaría saber qué ha pasado para poder solucionarlo. ¿Me puedes contar más?

Gracias por tu feedback.</p>
</div>

<h3 class="subsection-title">Si escriben algo en comentarios</h3>
<p>Léelo con atención. Si es positivo, agradécelo. Si es una queja o sugerencia, actúa antes de que se convierta en una mala reseña.</p>

<div class="pull-quote">El feedback privado durante la estancia es oro. Te permite mejorar sin afectar tu puntuación pública.</div>

<h2 class="section-title">Ver las respuestas</h2>

<p>En Google Forms, ve a la pestaña "Respuestas" para ver:</p>
<ul>
  <li><strong>Resumen:</strong> Gráficos con promedios de cada pregunta</li>
  <li><strong>Individual:</strong> Cada respuesta por separado</li>
  <li><strong>Hoja de cálculo:</strong> Exporta a Google Sheets para análisis más detallado</li>
</ul>

<div class="info-box">
  <div class="info-box-title">Señales de alerta</div>
  <ul>
    <li>Puntuación de limpieza &lt; 4 repetidamente → Revisa tu equipo de limpieza</li>
    <li>Puntuación de check-in &lt; 4 → Mejora las instrucciones de llegada</li>
    <li>Comentarios repetidos sobre lo mismo → Es un patrón, no una queja aislada</li>
  </ul>
</div>

<div class="cta-banner">
  <h4>Automatiza el envío de encuestas</h4>
  <p>Programa el mensaje con la encuesta para que se envíe automáticamente 24h después de cada check-in.</p>
  <a href="https://www.itineramio.com/register">Prueba Itineramio gratis 15 días</a>
</div>

<h2 class="section-title">Resumen</h2>

<ol>
  <li><strong>5 preguntas clave:</strong> Satisfacción, limpieza, check-in, equipamiento + comentarios</li>
  <li><strong>Múltiples idiomas:</strong> Crea un formulario por idioma y envía el correcto</li>
  <li><strong>Envía al día siguiente:</strong> 18-24 horas después del check-in</li>
  <li><strong>Actúa rápido:</strong> Si hay puntuación baja, contacta inmediatamente</li>
  <li><strong>Automatiza:</strong> Programa el mensaje para no olvidarte nunca</li>
</ol>

<p>Con este sistema detectas problemas a tiempo, los solucionas antes del checkout, y reduces significativamente las malas reseñas.</p>`;

async function main() {
  const surveyPost = await prisma.blogPost.findFirst({
    where: { slug: 'como-crear-encuestas-satisfaccion-huespedes-google-forms' }
  });

  if (surveyPost) {
    await prisma.blogPost.update({
      where: { id: surveyPost.id },
      data: {
        content: surveyArticle,
        title: 'Encuesta de Satisfacción para Huéspedes: 5 Preguntas + Multiidioma',
        excerpt: 'Crea una encuesta efectiva con las 5 preguntas esenciales. Incluye plantillas en español, inglés y francés para huéspedes internacionales.',
        readTime: 7
      }
    });
    console.log('Artículo de encuestas actualizado con 5 preguntas y multiidioma');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
