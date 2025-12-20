const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Artículo de encuestas corregido
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
  .question-box ul { margin: 0.75rem 0 0 0; padding-left: 1.25rem; }
  .question-box li { color: #4b5563; font-size: 0.875rem; margin-bottom: 0.25rem; }
  .cta-banner { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); border-radius: 16px; padding: 2rem; margin: 2.5rem 0; text-align: center; color: white; }
  .cta-banner h4 { font-size: 1.375rem; font-weight: 700; margin: 0 0 0.75rem 0; color: white; }
  .cta-banner p { font-size: 1rem; margin: 0 0 1.25rem 0; opacity: 0.9; }
  .cta-banner a { display: inline-block; background: white; color: #7c3aed; font-weight: 700; padding: 0.875rem 2rem; border-radius: 8px; text-decoration: none; }
</style>

<p class="article-lead">Las encuestas de satisfacción son una herramienta poderosa para detectar problemas antes de que se conviertan en malas reseñas. Google Forms es gratuito, fácil de usar y te da datos accionables para mejorar tu servicio.</p>

<p>En esta guía te explico paso a paso cómo crear tu encuesta, qué preguntas incluir, cómo analizar las respuestas y cómo integrarla en tus mensajes automáticos.</p>

<div class="key-points">
  <h3>Lo que vas a aprender</h3>
  <ul>
    <li>Crear una encuesta profesional en Google Forms en 15 minutos</li>
    <li>Las preguntas exactas que debes incluir (y cuáles evitar)</li>
    <li>Cómo visualizar las respuestas para tomar acción</li>
    <li>Cuándo y cómo enviar la encuesta a tus huéspedes</li>
    <li>Integrar la encuesta en tus mensajes automáticos</li>
  </ul>
</div>

<h2 class="section-title">Por qué usar encuestas (y no solo esperar reseñas)</h2>

<p>Las reseñas de Airbnb son públicas y permanentes. Una vez que el huésped deja una mala reseña, ya no puedes hacer nada. Las encuestas privadas te dan la oportunidad de detectar problemas durante la estancia y solucionarlos antes del checkout.</p>

<div class="pull-quote">La encuesta no reemplaza la reseña. La encuesta te da información privada para mejorar. La reseña es el resultado público de esa experiencia.</div>

<p>Beneficios concretos:</p>

<ul>
  <li><strong>Detección temprana:</strong> Si envías la encuesta al día siguiente de la llegada, tienes tiempo de solucionar problemas</li>
  <li><strong>Feedback honesto:</strong> Los huéspedes son más sinceros en privado que en público</li>
  <li><strong>Datos para mejorar:</strong> Puedes identificar patrones (ej: "la limpieza del baño siempre baja puntuación")</li>
  <li><strong>Reduce fricciones:</strong> El huésped siente que te importa su opinión, lo que mejora la relación</li>
</ul>

<h2 class="section-title">Crear tu encuesta en Google Forms: paso a paso</h2>

<div class="step-card">
  <span class="step-number">1</span>
  <h4>Accede a Google Forms</h4>
  <p>Ve a <strong>forms.google.com</strong> e inicia sesión con tu cuenta de Google. Haz clic en "Formulario en blanco" o selecciona una plantilla si prefieres empezar con algo prediseñado.</p>
</div>

<div class="step-card">
  <span class="step-number">2</span>
  <h4>Configura el título y descripción</h4>
  <p>Ponle un título profesional como "Encuesta de satisfacción - [Nombre de tu alojamiento]". En la descripción, explica brevemente que es una encuesta corta (1-2 minutos) para mejorar el servicio.</p>
</div>

<div class="step-card">
  <span class="step-number">3</span>
  <h4>Añade las preguntas</h4>
  <p>Haz clic en el icono "+" para añadir preguntas. Usa diferentes tipos: escala lineal para puntuaciones, opción múltiple para categorías, y respuesta corta/larga para comentarios abiertos.</p>
</div>

<div class="step-card">
  <span class="step-number">4</span>
  <h4>Configura las opciones</h4>
  <p>En el icono de engranaje (Configuración), activa "Recopilar direcciones de correo electrónico" si quieres identificar las respuestas. También puedes permitir editar respuestas y mostrar barra de progreso.</p>
</div>

<div class="step-card">
  <span class="step-number">5</span>
  <h4>Personaliza el diseño</h4>
  <p>En el icono de paleta, puedes cambiar colores y añadir una imagen de cabecera. Usa los colores de tu marca o una foto de tu alojamiento para que se vea profesional.</p>
</div>

<div class="step-card">
  <span class="step-number">6</span>
  <h4>Obtén el enlace</h4>
  <p>Haz clic en "Enviar" y selecciona el icono de enlace. Activa "Acortar URL" para obtener un enlace más limpio que puedes incluir en tus mensajes.</p>
</div>

<h2 class="section-title">Las preguntas que debes incluir</h2>

<p>Una buena encuesta es corta (5-7 preguntas máximo) y va al grano. Estas son las preguntas recomendadas:</p>

<div class="question-box">
  <h5>1. Puntuación general de la estancia</h5>
  <div class="type">Escala lineal (1-5 o 1-10)</div>
  <p>"Del 1 al 5, ¿cómo valorarías tu experiencia general en nuestro alojamiento?"</p>
</div>

<div class="question-box">
  <h5>2. Puntuación de limpieza</h5>
  <div class="type">Escala lineal (1-5)</div>
  <p>"¿Cómo valorarías la limpieza del alojamiento?"</p>
</div>

<div class="question-box">
  <h5>3. Puntuación de comunicación</h5>
  <div class="type">Escala lineal (1-5)</div>
  <p>"¿Cómo valorarías la comunicación con el anfitrión?"</p>
</div>

<div class="question-box">
  <h5>4. Check-in y llegada</h5>
  <div class="type">Escala lineal (1-5)</div>
  <p>"¿El proceso de check-in fue sencillo y claro?"</p>
</div>

<div class="question-box">
  <h5>5. ¿Qué podríamos mejorar?</h5>
  <div class="type">Respuesta larga (opcional)</div>
  <p>"Si hay algo que podríamos mejorar para futuras estancias, nos encantaría saberlo."</p>
</div>

<div class="question-box">
  <h5>6. ¿Qué es lo que más te ha gustado?</h5>
  <div class="type">Respuesta larga (opcional)</div>
  <p>"¿Hay algo que te haya sorprendido positivamente o que destacarías?"</p>
</div>

<div class="question-box">
  <h5>7. ¿Nos recomendarías?</h5>
  <div class="type">Opción múltiple</div>
  <p>"¿Recomendarías nuestro alojamiento a amigos o familiares?"</p>
  <ul>
    <li>Sí, sin duda</li>
    <li>Probablemente sí</li>
    <li>No estoy seguro/a</li>
    <li>Probablemente no</li>
    <li>No</li>
  </ul>
</div>

<div class="tip-box">
  <div class="tip-box-title">Consejo: menos es más</div>
  <p>No incluyas más de 7 preguntas. Cada pregunta adicional reduce la tasa de respuesta. Céntrate en lo que realmente te ayuda a mejorar y elimina el resto.</p>
</div>

<div class="warning-box">
  <div class="warning-box-title">Preguntas que debes evitar</div>
  <ul style="padding-left: 1.25rem; margin-top: 0.5rem;">
    <li><strong>"¿Nos pondrás 5 estrellas?"</strong> - Parece desesperado y presiona al huésped</li>
    <li><strong>Preguntas sobre precio</strong> - No puedes cambiar el precio por su feedback</li>
    <li><strong>Preguntas sobre la ubicación</strong> - Es lo que es, no puedes mover el edificio</li>
    <li><strong>Demasiadas preguntas abiertas</strong> - Agotan al huésped y reducen respuestas</li>
  </ul>
</div>

<h2 class="section-title">Cómo analizar las respuestas</h2>

<p>Google Forms te ofrece un resumen visual automático de todas las respuestas. Así es como debes usarlo:</p>

<h3 class="subsection-title">Ver el resumen general</h3>

<p>En tu formulario, haz clic en la pestaña "Respuestas". Verás gráficos automáticos de cada pregunta. Esto te da una visión rápida de cómo va tu servicio.</p>

<h3 class="subsection-title">Exportar a Google Sheets</h3>

<p>Haz clic en el icono verde de Sheets para crear una hoja de cálculo con todas las respuestas. Esto te permite:</p>

<ul>
  <li>Filtrar por fecha para ver evolución</li>
  <li>Calcular promedios por categoría</li>
  <li>Identificar patrones (ej: puntuaciones bajas los fines de semana)</li>
  <li>Guardar histórico de todas las respuestas</li>
</ul>

<h3 class="subsection-title">Qué buscar en las respuestas</h3>

<div class="info-box">
  <div class="info-box-title">Señales de alerta</div>
  <ul>
    <li><strong>Puntuación de limpieza &lt; 4:</strong> Revisa tu checklist de limpieza</li>
    <li><strong>Puntuación de check-in &lt; 4:</strong> Mejora las instrucciones de llegada</li>
    <li><strong>Comentarios repetidos sobre algo específico:</strong> Es un patrón, no una queja aislada</li>
    <li><strong>"Probablemente no" en recomendación:</strong> Contacta al huésped para saber qué pasó</li>
  </ul>
</div>

<h2 class="section-title">Cuándo enviar la encuesta</h2>

<p>El timing es crucial. Hay dos momentos óptimos:</p>

<h3 class="subsection-title">Opción A: Al día siguiente de la llegada</h3>

<p>Esta es la opción recomendada. Te da tiempo de solucionar problemas durante la estancia.</p>

<div class="script-box">
  <div class="script-box-title">Mensaje con encuesta (día siguiente)</div>
  <p>Hola <span class="highlight">[Nombre]</span>, ¿qué tal la primera noche?

Me encantaría saber si todo está en orden. Si tienes 1 minuto, esta breve encuesta me ayuda muchísimo a seguir mejorando:

<span class="highlight">[ENLACE A LA ENCUESTA]</span>

Si hay cualquier cosa que pueda mejorar durante vuestra estancia, dímelo y lo soluciono.

¡Que disfrutéis!</p>
</div>

<h3 class="subsection-title">Opción B: Después del checkout</h3>

<p>Si prefieres no "molestar" durante la estancia, envía la encuesta 2-4 horas después del checkout junto con el mensaje de agradecimiento.</p>

<div class="script-box">
  <div class="script-box-title">Mensaje con encuesta (post-checkout)</div>
  <p>Hola <span class="highlight">[Nombre]</span>,

Gracias por haberte alojado con nosotros. Ha sido un placer.

Si tienes 1 minuto, esta breve encuesta me ayuda a seguir mejorando para futuros huéspedes:

<span class="highlight">[ENLACE A LA ENCUESTA]</span>

¡Buen viaje de vuelta y esperamos verte pronto!</p>
</div>

<div class="tip-box">
  <div class="tip-box-title">¿Cuál elegir?</div>
  <p>Si tu objetivo es mejorar durante la estancia, envía al día siguiente. Si tu objetivo es solo recopilar datos para mejorar a largo plazo, envía después del checkout. La opción A es más proactiva y reduce malas reseñas.</p>
</div>

<h2 class="section-title">Integrar la encuesta en mensajes automáticos</h2>

<p>Si usas una herramienta de mensajes automáticos (como Itineramio, Hospitable, o similar), puedes programar el envío de la encuesta sin intervención manual.</p>

<h3 class="subsection-title">Configuración recomendada</h3>

<ol>
  <li><strong>Trigger:</strong> 24 horas después del check-in</li>
  <li><strong>Mensaje:</strong> El script de "día siguiente" que te he dado arriba</li>
  <li><strong>Enlace:</strong> El enlace acortado de Google Forms</li>
</ol>

<p>De esta forma, cada huésped recibe automáticamente la encuesta en el momento óptimo sin que tengas que acordarte de enviarla.</p>

<div class="cta-banner">
  <h4>Automatiza tus mensajes y encuestas</h4>
  <p>Programa mensajes de check-in, encuestas de satisfacción y seguimiento post-checkout.</p>
  <a href="https://www.itineramio.com/register">Prueba Itineramio gratis 15 días</a>
</div>

<h2 class="section-title">Qué hacer con el feedback negativo</h2>

<p>Cuando recibes una encuesta con puntuaciones bajas o comentarios negativos, esto es lo que debes hacer:</p>

<h3 class="subsection-title">Si el huésped aún está en el alojamiento</h3>

<ol>
  <li><strong>Contacta inmediatamente:</strong> Escríbele preguntando qué puedes hacer para mejorar su estancia</li>
  <li><strong>Soluciona lo que puedas:</strong> Si es algo concreto (falta toalla, ruido, temperatura), actúa</li>
  <li><strong>Ofrece compensación si corresponde:</strong> Un detalle, una disculpa sincera, o lo que consideres adecuado</li>
</ol>

<h3 class="subsection-title">Si el huésped ya se fue</h3>

<ol>
  <li><strong>Analiza el feedback:</strong> ¿Es algo puntual o un patrón que se repite?</li>
  <li><strong>Implementa mejoras:</strong> Si el feedback es válido, haz cambios concretos</li>
  <li><strong>Documenta:</strong> Lleva un registro de los problemas detectados y cómo los solucionaste</li>
</ol>

<div class="pull-quote">El feedback negativo privado es un regalo. Te permite mejorar sin que afecte tu puntuación pública.</div>

<h2 class="section-title">Plantilla de encuesta lista para usar</h2>

<p>Si no quieres crear la encuesta desde cero, aquí tienes las preguntas listas para copiar y pegar en Google Forms:</p>

<div class="info-box">
  <div class="info-box-title">Preguntas para copiar</div>
  <ol style="padding-left: 1.25rem; margin-top: 0.75rem;">
    <li style="margin-bottom: 0.5rem;">¿Cómo valorarías tu experiencia general? (Escala 1-5)</li>
    <li style="margin-bottom: 0.5rem;">¿Cómo valorarías la limpieza del alojamiento? (Escala 1-5)</li>
    <li style="margin-bottom: 0.5rem;">¿Cómo valorarías la comunicación con el anfitrión? (Escala 1-5)</li>
    <li style="margin-bottom: 0.5rem;">¿El proceso de check-in fue sencillo y claro? (Escala 1-5)</li>
    <li style="margin-bottom: 0.5rem;">¿Hay algo que podríamos mejorar? (Texto libre, opcional)</li>
    <li style="margin-bottom: 0.5rem;">¿Qué es lo que más te ha gustado? (Texto libre, opcional)</li>
    <li style="margin-bottom: 0.5rem;">¿Nos recomendarías a amigos o familiares? (Sí sin duda / Probablemente sí / No estoy seguro / Probablemente no / No)</li>
  </ol>
</div>

<h2 class="section-title">Resumen</h2>

<p>Las encuestas de satisfacción son una herramienta simple pero poderosa:</p>

<ol>
  <li><strong>Crea la encuesta en Google Forms</strong> - 15 minutos, gratis, profesional</li>
  <li><strong>Incluye 5-7 preguntas clave</strong> - Puntuación general, limpieza, comunicación, check-in y comentarios</li>
  <li><strong>Envía al día siguiente de la llegada</strong> - Te da tiempo de reaccionar</li>
  <li><strong>Analiza y actúa</strong> - El feedback solo sirve si lo usas para mejorar</li>
  <li><strong>Automatiza el envío</strong> - Para no olvidarte nunca</li>
</ol>

<p>Con este sistema, detectas problemas antes de que se conviertan en malas reseñas y demuestras a tus huéspedes que su opinión te importa de verdad.</p>`;

// Artículo de plantilla de estrellas corregido
const starsArticle = `<style>
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
  .cta-banner { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); border-radius: 16px; padding: 2rem; margin: 2.5rem 0; text-align: center; color: white; }
  .cta-banner h4 { font-size: 1.375rem; font-weight: 700; margin: 0 0 0.75rem 0; color: white; }
  .cta-banner p { font-size: 1rem; margin: 0 0 1.25rem 0; opacity: 0.9; }
  .cta-banner a { display: inline-block; background: white; color: #7c3aed; font-weight: 700; padding: 0.875rem 2rem; border-radius: 8px; text-decoration: none; }
  @media print {
    .no-print { display: none !important; }
    .printable-template { border: 2px solid #000; page-break-inside: avoid; }
  }
</style>

<p class="article-lead">Muchos huéspedes no saben que en Airbnb, una reseña de 4 estrellas puede perjudicar seriamente a un anfitrión. Esta plantilla te ayuda a explicar de forma educada lo que significa cada puntuación, sin parecer desesperado ni presionar.</p>

<p>En este artículo encontrarás:</p>
<ul>
  <li>Una explicación clara de lo que significa cada estrella en Airbnb</li>
  <li>Una plantilla lista para copiar y enviar como mensaje automático</li>
  <li>Una versión imprimible para dejar en tu alojamiento</li>
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

<h2 class="section-title">Lo que significa cada estrella (explicación para huéspedes)</h2>

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

<div class="star-card two">
  <div class="stars">⭐⭐</div>
  <h4>2 Estrellas = Experiencia muy mala</h4>
  <p>La estancia fue muy por debajo de las expectativas. Problemas graves que no se solucionaron. <strong>Una puntuación crítica.</strong></p>
</div>

<div class="star-card one">
  <div class="stars">⭐</div>
  <h4>1 Estrella = Experiencia inaceptable</h4>
  <p>Todo salió mal. Condiciones inaceptables, engaño en la descripción, o situaciones graves. <strong>Reservada para situaciones extremas.</strong></p>
</div>

<div class="pull-quote">La diferencia entre 5 y 4 estrellas en Airbnb es la diferencia entre "todo bien" y "hubo un problema". No es como en los hoteles donde 4 estrellas es una buena puntuación.</div>

<h2 class="section-title">Plantilla para mensaje automático (copia y pega)</h2>

<p>Este mensaje está diseñado para enviar después del checkout, junto con el agradecimiento. Es educativo, no presiona, y explica el sistema de forma clara:</p>

<div class="script-box">
  <div class="script-box-title">Mensaje post-checkout con explicación de estrellas</div>
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
  <div class="tip-box-title">Consejo: cuándo enviar este mensaje</div>
  <p>Envía este mensaje 2-4 horas después del checkout, nunca antes. El huésped debe haber tenido tiempo de irse tranquilo antes de recibir cualquier petición de reseña. Si lo envías antes del checkout, parecerá que solo te importa la puntuación.</p>
</div>

<h2 class="section-title">Versión imprimible para dejar en el alojamiento</h2>

<p>Esta plantilla puedes imprimirla y dejarla en un lugar visible del alojamiento (mesa del salón, carpeta de bienvenida, etc.). Es una forma sutil de educar sin enviar mensajes:</p>

<div class="printable-template">
  <h3>Gracias por tu estancia</h3>
  <p class="subtitle">Una nota sobre las reseñas en Airbnb</p>

  <div class="star-row">
    <div class="star-emoji">⭐⭐⭐⭐⭐</div>
    <div class="star-meaning">
      <strong>5 Estrellas</strong>
      <span>Todo funcionó correctamente. El alojamiento era como se describía.</span>
    </div>
  </div>

  <div class="star-row">
    <div class="star-emoji">⭐⭐⭐⭐</div>
    <div class="star-meaning">
      <strong>4 Estrellas</strong>
      <span>Hubo algún problema menor o algo que podría mejorar.</span>
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
    <p>Si hay algo que podamos mejorar, por favor dínoslo directamente.<br>Preferimos solucionarlo a que afecte tu experiencia.</p>
  </div>
</div>

<div class="info-box">
  <div class="info-box-title">Cómo usar la plantilla imprimible</div>
  <ul style="padding-left: 1.25rem; margin-top: 0.5rem;">
    <li>Imprime esta sección (Ctrl+P o Cmd+P)</li>
    <li>Enmárcala o plastifícala para que dure más</li>
    <li>Colócala en la carpeta de bienvenida o en la mesa del salón</li>
    <li>También puedes incluirla en tu guía digital</li>
  </ul>
</div>

<h2 class="section-title">Versión corta para mensajes rápidos</h2>

<p>Si prefieres algo más breve, esta versión funciona bien para integraciones o mensajes automáticos más concisos:</p>

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
    <li><strong>No ofrezcas incentivos</strong> - Descuentos o regalos a cambio de reseñas viola las normas</li>
  </ul>
</div>

<h2 class="section-title">La clave: ofrecer canales alternativos</h2>

<p>La razón por la que funciona explicar el sistema de estrellas es que das al huésped una alternativa: si algo no fue perfecto, puede decírtelo a ti en lugar de reflejarlo en la puntuación.</p>

<p>Combina esta plantilla con:</p>

<ul>
  <li><strong>Mensaje proactivo durante la estancia:</strong> Pregunta si todo va bien al día siguiente de la llegada</li>
  <li><strong>Encuesta de satisfacción privada:</strong> <a href="/blog/como-crear-encuestas-satisfaccion-huespedes-google-forms">Crea una encuesta con Google Forms</a> para feedback anónimo</li>
  <li><strong>Canal de comunicación claro:</strong> Asegúrate de que el huésped sabe cómo contactarte si hay problemas</li>
</ul>

<div class="cta-banner">
  <h4>Automatiza tus mensajes de checkout</h4>
  <p>Programa el mensaje con la explicación de estrellas para que se envíe automáticamente después de cada checkout.</p>
  <a href="https://www.itineramio.com/register">Prueba Itineramio gratis 15 días</a>
</div>

<h2 class="section-title">Resumen</h2>

<p>Educar a tus huéspedes sobre el sistema de puntuación es legítimo y útil:</p>

<ol>
  <li><strong>Explica, no presiones:</strong> El mensaje debe ser informativo, no manipulador</li>
  <li><strong>Ofrece alternativas:</strong> "Dímelo a mí" es mejor que una mala reseña</li>
  <li><strong>Timing correcto:</strong> Siempre después del checkout, nunca antes</li>
  <li><strong>Una sola vez:</strong> Un mensaje basta, más es contraproducente</li>
  <li><strong>Complementa con proactividad:</strong> Detecta problemas durante la estancia, no después</li>
</ol>

<p>Con este enfoque, tus huéspedes entenderán que 5 estrellas significa "todo bien" y tendrán un canal para comunicarte problemas antes de reflejarlos en su reseña.</p>`;

async function main() {
  // Update survey article
  const surveyPost = await prisma.blogPost.findFirst({
    where: { slug: 'como-crear-encuestas-satisfaccion-huespedes-google-forms' }
  });

  if (surveyPost) {
    await prisma.blogPost.update({
      where: { id: surveyPost.id },
      data: { content: surveyArticle }
    });
    console.log('Artículo de encuestas corregido');
  }

  // Update stars template article
  const starsPost = await prisma.blogPost.findFirst({
    where: { slug: 'plantilla-significado-estrellas-airbnb-huespedes' }
  });

  if (starsPost) {
    await prisma.blogPost.update({
      where: { id: starsPost.id },
      data: {
        content: starsArticle,
        title: 'Plantilla: Qué Significan las Estrellas en Airbnb (Mensaje + Imprimible)',
        excerpt: 'Plantilla lista para copiar que explica a tus huéspedes el sistema de puntuación de Airbnb. Incluye versión para mensaje automático y versión imprimible.',
        metaTitle: 'Plantilla Significado Estrellas Airbnb | Mensaje para Huéspedes',
        metaDescription: 'Descarga gratis la plantilla que explica el sistema de estrellas de Airbnb a tus huéspedes. Versión para mensaje automático y versión imprimible para dejar en tu alojamiento.'
      }
    });
    console.log('Artículo de plantilla de estrellas corregido');
  }

  // Fix the 5-stars article - remove the bad link overlay
  const fiveStarsPost = await prisma.blogPost.findFirst({
    where: { slug: 'como-conseguir-resenas-5-estrellas-sin-parecer-desesperado' }
  });

  if (fiveStarsPost) {
    // Remove the problematic "y consulta nuestra plantilla" text that's causing overlay
    let content = fiveStarsPost.content;
    content = content.replace(
      / y consulta nuestra <a href="\/blog\/plantilla-significado-estrellas-airbnb-huespedes">plantilla del significado de las estrellas<\/a>/g,
      ''
    );
    // Also remove any tip-box that was added before Resumen
    content = content.replace(
      /<div class="tip-box">\s*<div class="tip-box-title">Recurso adicional<\/div>[\s\S]*?<\/div>\s*<h2 class="section-title">Resumen/,
      '<h2 class="section-title">Resumen'
    );

    await prisma.blogPost.update({
      where: { id: fiveStarsPost.id },
      data: { content }
    });
    console.log('Artículo de 5 estrellas - enlaces arreglados');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
