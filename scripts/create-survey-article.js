const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const articleContent = `<style>
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
  .tip-box p, .tip-box ul { color: #1e3a8a; margin: 0; font-size: 0.9375rem; line-height: 1.6; }
  .tip-box ul { padding-left: 1.25rem; margin-top: 0.5rem; }
  .tip-box li { margin-bottom: 0.5rem; }
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
  .script-box { background: #18181b; border-radius: 12px; padding: 1.5rem 2rem; margin: 1.5rem 0; }
  .script-box-title { font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: #a1a1aa; margin: 0 0 1rem 0; font-weight: 600; }
  .script-box p { color: #f4f4f5; margin: 0; font-size: 1rem; line-height: 1.7; white-space: pre-wrap; }
  .script-box .highlight { color: #a78bfa; font-weight: 500; }
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
  <ul>
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
    <li><strong>Puntuación de limpieza < 4:</strong> Revisa tu checklist de limpieza</li>
    <li><strong>Puntuación de check-in < 4:</strong> Mejora las instrucciones de llegada</li>
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
  <p>Programa mensajes de check-in, encuestas de satisfacción y seguimiento post-checkout. Todo automático, todo personalizado.</p>
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

async function main() {
  // Get first user for authorId (prefer admin, fallback to any user)
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
    where: { slug: 'como-crear-encuestas-satisfaccion-huespedes-google-forms' }
  });

  if (existing) {
    await prisma.blogPost.update({
      where: { id: existing.id },
      data: { content: articleContent }
    });
    console.log('Artículo de encuestas actualizado');
  } else {
    await prisma.blogPost.create({
      data: {
        slug: 'como-crear-encuestas-satisfaccion-huespedes-google-forms',
        title: 'Cómo Crear Encuestas de Satisfacción para Huéspedes con Google Forms',
        excerpt: 'Guía paso a paso para crear encuestas profesionales en Google Forms, qué preguntas incluir y cómo usar el feedback para mejorar tu servicio.',
        content: articleContent,
        category: 'GUIAS',
        status: 'PUBLISHED',
        featured: false,
        readTime: 8,
        metaTitle: 'Crear Encuestas de Satisfacción para Huéspedes | Google Forms para Anfitriones',
        metaDescription: 'Aprende a crear encuestas de satisfacción con Google Forms para detectar problemas antes de que se conviertan en malas reseñas. Guía completa con preguntas y plantillas.',
        authorName: 'Itineramio',
        authorId: admin.id,
        publishedAt: new Date()
      }
    });
    console.log('Artículo de encuestas creado');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
