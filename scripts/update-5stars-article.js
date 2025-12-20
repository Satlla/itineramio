const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const newContent = `<style>
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
  .warning-box p, .warning-box ul { color: #b91c1c; margin: 0; font-size: 0.9375rem; line-height: 1.6; }
  .warning-box ul { padding-left: 1.25rem; margin-top: 0.75rem; }
  .warning-box li { margin-bottom: 0.5rem; }
  .tip-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 1.5rem; margin: 2rem 0; }
  .tip-box-title { font-size: 1rem; font-weight: 700; color: #1e40af; margin: 0 0 0.75rem 0; }
  .tip-box p, .tip-box ul { color: #1e3a8a; margin: 0; font-size: 0.9375rem; line-height: 1.6; }
  .script-box { background: #18181b; border-radius: 12px; padding: 1.5rem 2rem; margin: 1.5rem 0; }
  .script-box-title { font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: #a1a1aa; margin: 0 0 1rem 0; font-weight: 600; }
  .script-box p { color: #f4f4f5; margin: 0; font-size: 1rem; line-height: 1.7; white-space: pre-wrap; }
  .script-box .highlight { color: #a78bfa; font-weight: 500; }
  .cta-banner { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); border-radius: 16px; padding: 2rem; margin: 2.5rem 0; text-align: center; color: white; }
  .cta-banner h4 { font-size: 1.375rem; font-weight: 700; margin: 0 0 0.75rem 0; color: white; }
  .cta-banner p { font-size: 1rem; margin: 0 0 1.25rem 0; opacity: 0.9; }
  .cta-banner a { display: inline-block; background: white; color: #7c3aed; font-weight: 700; padding: 0.875rem 2rem; border-radius: 8px; text-decoration: none; }
  .phase-card { background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; }
  .phase-card h4 { font-size: 1.125rem; font-weight: 700; color: #7c3aed; margin: 0 0 0.5rem 0; }
  .phase-card .timing { font-size: 0.875rem; color: #6b7280; margin-bottom: 1rem; }
  .phase-card p { color: #374151; margin: 0; line-height: 1.6; }
  .comparison-table { width: 100%; border-collapse: collapse; margin: 2rem 0; }
  .comparison-table th { background: #f9fafb; padding: 1rem; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; }
  .comparison-table td { padding: 1rem; border-bottom: 1px solid #e5e7eb; color: #4b5563; }
  .comparison-table .bad { color: #dc2626; }
  .comparison-table .neutral { color: #d97706; }
  .comparison-table .good { color: #059669; }
</style>

<p class="article-lead">Pedir "5 estrellas" es la manera más rápida de sonar inseguro. Pero hay una diferencia enorme entre presionar por una calificación y cerrar la experiencia con elegancia.</p>

<p>En este artículo te doy un sistema simple: mensajes en 3 fases, un check-in proactivo y un cierre que invita a reseñar sin incomodar. El objetivo no es "conseguir reseñas": es que el huésped sienta que está recomendando algo que vale la pena.</p>

<div class="key-points">
  <h3>La idea central</h3>
  <ul>
    <li>Cuanto más presionas por 5 estrellas, más bajas tus probabilidades de conseguirlas</li>
    <li>Pedir feedback para mejorar funciona mejor que pedir valoración</li>
    <li>El momento perfecto es entre 2-4 horas después del check-in</li>
    <li>Un cierre elegante post-checkout multiplica las reseñas espontáneas</li>
  </ul>
</div>

<h2 class="section-title">Las tres formas de pedir (y cuál funciona)</h2>

<p>No todas las peticiones son iguales. La diferencia está en cómo posicionas lo que pides y cómo lo percibe el huésped.</p>

<table class="comparison-table">
  <thead>
    <tr>
      <th>Qué pides</th>
      <th>Cómo suena</th>
      <th>Resultado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="bad"><strong>"Por favor, déjanos 5 estrellas"</strong></td>
      <td>Desesperado, presiona</td>
      <td class="bad">Genera rechazo o reseñas forzadas</td>
    </tr>
    <tr>
      <td class="neutral"><strong>"Si puedes dejarnos una reseña..."</strong></td>
      <td>Neutro, genérico</td>
      <td class="neutral">Funciona si el timing es bueno</td>
    </tr>
    <tr>
      <td class="good"><strong>"Si hay algo que pudiera mejorar, dímelo"</strong></td>
      <td>Humilde, profesional</td>
      <td class="good">Baja defensas, invita a compartir</td>
    </tr>
  </tbody>
</table>

<div class="pull-quote">La mejor petición no parece una petición. Parece interés genuino por mejorar.</div>

<h2 class="section-title">El método de 3 fases</h2>

<p>Este sistema funciona porque cada mensaje tiene un propósito claro y aparece en el momento justo. No es una secuencia de ventas: es hospitalidad con estructura.</p>

<div class="phase-card">
  <h4>Fase 1: Pre-llegada</h4>
  <div class="timing">48 horas antes del check-in</div>
  <p>Reduces ansiedad y aportas valor antes de que lleguen. El huésped siente que alguien real está pendiente.</p>
</div>

<div class="phase-card">
  <h4>Fase 2: Check-in proactivo</h4>
  <div class="timing">2-4 horas después de la llegada (o a la mañana siguiente si llegan tarde)</div>
  <p>Detectas cualquier fricción a tiempo para solucionarla. Este es el "momento de oro": si hay un problema, lo arreglas antes de que se convierta en queja.</p>
</div>

<div class="phase-card">
  <h4>Fase 3: Cierre elegante</h4>
  <div class="timing">2-12 horas después del checkout</div>
  <p>Cierras el ciclo con agradecimiento genuino y una invitación sutil a reseñar.</p>
</div>

<h2 class="section-title">Los scripts exactos</h2>

<h3 class="subsection-title">Pre-llegada (48h antes)</h3>

<div class="script-box">
  <div class="script-box-title">Mensaje</div>
  <p>Hola, <span class="highlight">[Nombre]</span>.

Ya está todo preparado para tu llegada. El acceso es con código: <span class="highlight">XXXX</span> (te dejo también una foto de la puerta en el siguiente mensaje).

Si te apetece desayunar cerca, mi favorito es <span class="highlight">[Café]</span> (a 2 minutos).

Si surge cualquier duda en ruta, escríbeme por aquí.</p>
</div>

<div class="info-box">
  <div class="info-box-title">Por qué funciona</div>
  <p>Anticipas las preguntas más comunes (código, ubicación exacta) y añades un toque personal con la recomendación. El huésped llega sin ansiedad.</p>
</div>

<h3 class="subsection-title">Check-in proactivo (2-4h después)</h3>

<div class="script-box">
  <div class="script-box-title">Mensaje</div>
  <p>Hola, <span class="highlight">[Nombre]</span>. ¿Qué tal la llegada?

Solo quería confirmar que todo está en orden (Wi-Fi, agua caliente, temperatura) y que encontraste lo necesario.

Si algo no encaja, lo soluciono rápido.</p>
</div>

<div class="tip-box">
  <div class="tip-box-title">El momento de oro</div>
  <p>Este mensaje es tu oportunidad de convertir un 4 en un 5. Si hay algún problema menor (toalla que falta, mando que no funciona), lo detectas y lo arreglas antes de que el huésped lo "guarde" para la reseña.</p>
</div>

<h3 class="subsection-title">Post-checkout: versión estándar</h3>

<div class="script-box">
  <div class="script-box-title">Mensaje</div>
  <p>Gracias por alojarte, <span class="highlight">[Nombre]</span>. Me alegro de que todo haya ido bien.

Si tienes 30 segundos, tu reseña ayuda muchísimo a que otros viajeros reserven con confianza.

Buen viaje de vuelta y aquí tienes tu casa para la próxima.</p>
</div>

<h3 class="subsection-title">Post-checkout: versión "feedback primero"</h3>

<p>Si prefieres un enfoque aún más suave:</p>

<div class="script-box">
  <div class="script-box-title">Mensaje alternativo</div>
  <p>Gracias por la estancia, <span class="highlight">[Nombre]</span>.

Si hay algo que pudiera mejorar (por pequeño que sea), dímelo por aquí y lo ajusto para los próximos huéspedes.

Y si te apetece dejar una reseña, me ayudas mucho. Buen viaje.</p>
</div>

<div class="info-box">
  <div class="info-box-title">Cuándo usar cada versión</div>
  <p>Usa la versión estándar cuando la estancia fue claramente positiva (el huésped comentó lo bien que lo pasó). Usa la versión "feedback primero" cuando no estás seguro o hubo algún pequeño incidente durante la estancia.</p>
</div>

<h2 class="section-title">Qué mencionan las reseñas de 5 estrellas</h2>

<p>Analizando patrones que se repiten en reseñas excelentes, estos son los temas que aparecen con más frecuencia:</p>

<table class="comparison-table">
  <thead>
    <tr>
      <th>Elemento</th>
      <th>Frecuencia</th>
      <th>Cómo provocarlo</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Limpieza impecable</strong></td>
      <td>Muy alta</td>
      <td>Checklist profesional, verificación con fotos</td>
    </tr>
    <tr>
      <td><strong>Comunicación rápida</strong></td>
      <td>Muy alta</td>
      <td>Responder en menos de 1 hora, mensajes proactivos</td>
    </tr>
    <tr>
      <td><strong>Ubicación bien explicada</strong></td>
      <td>Alta</td>
      <td>Guía local con recomendaciones personales</td>
    </tr>
    <tr>
      <td><strong>Detalles inesperados</strong></td>
      <td>Alta</td>
      <td>Algo útil en los primeros 10 minutos</td>
    </tr>
    <tr>
      <td><strong>Check-in fácil</strong></td>
      <td>Alta</td>
      <td>Instrucciones claras con fotos, código de acceso</td>
    </tr>
  </tbody>
</table>

<h2 class="section-title">Errores que garantizan mala reseña</h2>

<p>Estos errores son "fatales" porque el huésped los recuerda aunque el resto esté perfecto:</p>

<div class="warning-box">
  <div class="warning-box-title">Evita estos errores</div>
  <ul>
    <li><strong>Pelo en el baño:</strong> Un solo pelo visible puede costarte una estrella</li>
    <li><strong>Olor a cerrado:</strong> Ventila antes de cada llegada</li>
    <li><strong>WiFi que no funciona:</strong> Comprueba antes de cada check-in</li>
    <li><strong>Ruido no advertido:</strong> Si hay obras cerca o vecinos ruidosos, avisa antes</li>
    <li><strong>Fotos que no coinciden:</strong> Si renovaste o cambiaste algo, actualiza las fotos</li>
    <li><strong>Respuesta lenta ante problemas:</strong> Más de 2 horas sin respuesta genera frustración</li>
  </ul>
</div>

<h2 class="section-title">Técnicas que funcionan</h2>

<h3 class="subsection-title">El detalle de los primeros 10 minutos</h3>

<p>Algo útil que el huésped encuentre nada más llegar tiene un impacto desproporcionado. No tiene que ser caro:</p>

<ul>
  <li>Agua fría en la nevera</li>
  <li>Instrucciones de WiFi visibles (no escondidas en un cajón)</li>
  <li>Cargador de móvil junto a la cama</li>
  <li>Luz cálida encendida si llegan de noche</li>
</ul>

<h3 class="subsection-title">La guía local de 1 página</h3>

<p>No hace falta escribir un libro. Una página con:</p>

<ul>
  <li>5 sitios para comer (de diferentes precios)</li>
  <li>3 planes según el tipo de viajero</li>
  <li>1 opción "si llueve"</li>
  <li>1 opción "si vas con niños"</li>
</ul>

<div class="tip-box">
  <div class="tip-box-title">Consejo</div>
  <p>Escríbela como si se la dieras a un amigo. Las recomendaciones personales ("mi favorito para desayunar") funcionan mejor que listas genéricas.</p>
</div>

<h3 class="subsection-title">La nota manuscrita</h3>

<p>En la era digital, una nota escrita a mano tiene un impacto enorme. No hace falta escribir mucho:</p>

<div class="script-box">
  <div class="script-box-title">Ejemplo</div>
  <p>Bienvenidos, <span class="highlight">[Nombre]</span>.

Espero que disfrutéis la estancia. Si necesitáis algo, escribidme.

<span class="highlight">[Tu nombre]</span></p>
</div>

<div class="cta-banner">
  <h4>Automatiza tus mensajes sin perder el toque personal</h4>
  <p>Crea plantillas personalizadas, programa envíos automáticos y gestiona todas tus propiedades desde un solo lugar.</p>
  <a href="https://www.itineramio.com/register">Prueba Itineramio gratis 15 días</a>
</div>

<h2 class="section-title">Resumen: el sistema completo</h2>

<p>Las reseñas de 5 estrellas no se piden: se provocan. El sistema es simple:</p>

<ol>
  <li><strong>48h antes:</strong> Mensaje con información práctica + recomendación personal</li>
  <li><strong>2-4h después del check-in:</strong> Check-in proactivo para detectar fricciones</li>
  <li><strong>Post-checkout:</strong> Cierre elegante con invitación sutil a reseñar</li>
</ol>

<p>La clave no es la secuencia de mensajes. Es la actitud: estás ahí para que todo salga bien, no para conseguir una valoración.</p>

<div class="pull-quote">No pides 5 estrellas. Pides feedback honesto y facilitas que el huésped recuerde lo bueno.</div>

<p>Cuando un huésped siente que alguien real está pendiente de su experiencia, la reseña de 5 estrellas es la consecuencia natural. No el objetivo.</p>`;

async function main() {
  await prisma.blogPost.update({
    where: { id: 'cmjbu2hgm00007c4xtza9dd1f' },
    data: { content: newContent }
  });

  console.log('Artículo actualizado correctamente');
}

main().catch(console.error).finally(() => prisma.$disconnect());
