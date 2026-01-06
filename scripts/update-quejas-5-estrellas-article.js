const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const articleContent = `
<style>
  .article-lead { font-size: 1.25rem; line-height: 1.8; color: #374151; margin-bottom: 2rem; }
  .section-title { font-size: 1.75rem; font-weight: 700; color: #111827; margin-top: 2.5rem; margin-bottom: 1rem; }
  .subsection-title { font-size: 1.25rem; font-weight: 600; color: #1f2937; margin-top: 1.5rem; margin-bottom: 0.75rem; }
  .highlight-box { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #0ea5e9; padding: 1.5rem; margin: 1.5rem 0; border-radius: 0 8px 8px 0; }
  .highlight-box-title { font-weight: 600; color: #0369a1; margin-bottom: 0.5rem; }
  .tip-box { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #22c55e; padding: 1.5rem; margin: 1.5rem 0; border-radius: 0 8px 8px 0; }
  .warning-box { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-left: 4px solid #f59e0b; padding: 1.5rem; margin: 1.5rem 0; border-radius: 0 8px 8px 0; }
  .example-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 1.5rem; margin: 1.5rem 0; border-radius: 8px; }
  .example-box-title { font-weight: 600; color: #4f46e5; margin-bottom: 0.5rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .stat-highlight { font-size: 2rem; font-weight: 700; color: #7c3aed; }
  .quote-block { border-left: 3px solid #8b5cf6; padding-left: 1.5rem; font-style: italic; color: #6b7280; margin: 1.5rem 0; }
  .step-number { display: inline-flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; background: #7c3aed; color: white; border-radius: 50%; font-weight: 600; margin-right: 0.75rem; }
  .table-container { overflow-x: auto; margin: 1.5rem 0; }
  .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  .data-table th { background: #f3f4f6; padding: 0.75rem; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
  .data-table td { padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }
  .source-link { color: #6366f1; text-decoration: underline; }
</style>

<p class="article-lead">Gestionar una propiedad turística puede ser tan gratificante como desafiante. Los huéspedes no sólo juzgan la comodidad del alojamiento, también valoran cómo les respondes cuando algo sale mal.</p>

<p>La buena noticia es que una queja bien resuelta puede convertirse en una oportunidad de fidelización. Estudios sobre recuperación del servicio muestran que un huésped insatisfecho que ve su problema resuelto suele sentirse más leal que uno que nunca tuvo problemas.</p>

<p>Esta paradoja de la recuperación se confirma en la práctica hotelera: los hoteles que actúan con rapidez y empatía pueden transformar un contratiempo en una reseña de cinco estrellas.</p>

<p>En las siguientes líneas encontrarás un método de cuatro pasos adaptado al alquiler vacacional. Incluye casos reales, consejos para anfitriones independientes que no cuentan con grandes presupuestos ni software avanzado y pautas inspiradas en estándares de atención premium como Four Seasons o Ritz-Carlton.</p>

<h2 class="section-title">1. Por qué las quejas son un regalo</h2>

<h3 class="subsection-title">1.1 La paradoja de la recuperación</h3>

<p>Cuando surge un problema durante la estancia, algunos anfitriones se angustian y temen una mala reseña. Sin embargo, la investigación demuestra lo contrario: los huéspedes que reportan un problema y reciben una solución eficaz tienden a ser más fieles que aquellos que no experimentan fallos.</p>

<p>Esto sucede porque el proceso de pasar de la frustración a la satisfacción genera emociones positivas y refuerza la percepción de que el anfitrión se preocupa por su bienestar.</p>

<h3 class="subsection-title">1.2 Por qué evitar problemas no es suficiente</h3>

<p>Los análisis de Coyle Hospitality indican que casi todos los hoteles investigados reaccionan rápido ante una queja, pero muchos fallan en el seguimiento. Los huéspedes sienten que les escuchan, pero si nadie confirma que la incidencia se ha resuelto, el efecto es como si nada hubiera cambiado.</p>

<div class="highlight-box">
  <p><span class="stat-highlight">95%</span> de los huéspedes volverá a alojarse en un lugar si su problema se resuelve de inmediato, frente al <strong>70%</strong> cuando la resolución es satisfactoria pero no instantánea.</p>
  <p>El <span class="stat-highlight">79%</span> de los clientes espera una respuesta a sus reclamaciones dentro de las 24 horas.</p>
</div>

<p><strong>Moraleja:</strong> no es solo evitar errores; es reaccionar con rapidez, transparencia y empatía.</p>

<h2 class="section-title">2. El método ESAR: Escuchar, Sentir, Actuar y Recompensar</h2>

<p>Inspirado en metodologías de cadenas de lujo, adaptamos las siglas a un modelo sencillo para anfitriones independientes. <strong>ESAR</strong> significa Escuchar, Sentir (empatizar), Actuar y Recompensar.</p>

<h3 class="subsection-title">2.1 Escuchar y acusar recibo</h3>

<ul>
  <li><strong>Responder de inmediato.</strong> No dejes un mensaje sin contestar durante horas: el 79% de los huéspedes esperan respuesta en menos de 24 horas. Un simple "He recibido tu mensaje, entiendo tu preocupación y voy a investigar para ayudarte" reduce la ansiedad.</li>
  <li><strong>Permitir que el huésped se explique.</strong> Dale espacio para relatar el problema sin interrumpir. Puedes repetir las ideas clave para confirmar que has entendido: "Así que el termo no funciona y no pudiste ducharte, ¿es correcto?"</li>
  <li><strong>Mostrar gratitud por la queja.</strong> Agradece que te informen: muchos huéspedes no se molestan en avisar. Recordarles que valoras su opinión desactiva la tensión inicial.</li>
</ul>

<div class="example-box">
  <div class="example-box-title">Ejemplo real (estancia rural)</div>
  <p>Una familia llega y descubre que la casa no tiene toallas suficientes. En lugar de justificarte, responde: "Gracias por avisarnos, entiendo lo incómodo que es. Voy a solucionar esto ahora mismo". Llamas a la persona de mantenimiento y en una hora dejas en la puerta un juego de toallas extra junto a una nota de disculpa.</p>
</div>

<h3 class="subsection-title">2.2 Sentir (empatía y disculpa)</h3>

<ul>
  <li><strong>Validar las emociones del huésped.</strong> Usa frases como "Siento que hayas tenido que pasar por esto" o "Entiendo lo frustrante que es".</li>
  <li><strong>Evitar excusas o culpar al viajero.</strong> Cualquier frase que empiece con "Es que…" o "Otros huéspedes no se quejan" incrementa la irritación.</li>
  <li><strong>Ofrecer disculpas sinceras aunque la culpa no sea tuya.</strong> Un "lo siento mucho por lo ocurrido; vamos a solucionarlo" reduce la tensión y permite avanzar.</li>
</ul>

<div class="example-box">
  <div class="example-box-title">Ejemplo real (apartamento urbano)</div>
  <p>El huésped se queja de que hay ruido de obras. Responde: "Comprendo que el ruido te haya molestado; yo también lo estaría. Lamento que no estuviera en la descripción y me voy a encargar ahora mismo". Luego buscas auriculares, contactas al vecino o consideras cambiarles de habitación.</p>
</div>

<h3 class="subsection-title">2.3 Actuar con rapidez y transparencia</h3>

<ul>
  <li><strong>Ofrecer una solución concreta, no promesas vagas.</strong> La regla informal 2x propone dar algo más de lo que el huésped espera. Si el termo no funciona, envía a un técnico y, como gesto, deja cápsulas de café de cortesía.</li>
  <li><strong>Dar opciones cuando sea posible.</strong> Proponer varias alternativas y preguntar cuál prefiere el huésped le devuelve el control y genera confianza.</li>
  <li><strong>Ser transparente con los tiempos.</strong> Si no puedes arreglar algo en el momento, explica qué harás y cuándo tendrás novedades.</li>
  <li><strong>Empoderar a quien atiende la queja.</strong> Define de antemano qué compensaciones puedes ofrecer (p. ej., descuento del 10%, cesta de desayuno).</li>
</ul>

<div class="example-box">
  <div class="example-box-title">Ejemplo real (falta de limpieza)</div>
  <p>Una pareja encuentra la cocina sucia. Pides disculpas y ofreces dos opciones: enviar al equipo de limpieza en una hora o limpiarla tú mismo de inmediato, además de ofrecer un cupón del 15% en su próxima reserva.</p>
</div>

<div class="example-box">
  <div class="example-box-title">Ejemplo real (amenidades faltantes)</div>
  <p>Los huéspedes llegan y no encuentran cafetera. Explicas que ha sido un descuido, llevas una cafetera nueva y, como cortesía, ofreces un paquete de café local.</p>
</div>

<h3 class="subsection-title">2.4 Recompensar y cerrar el círculo</h3>

<ul>
  <li><strong>Demostrar que la incidencia está resuelta.</strong> No basta con actuar; debes cerrar el circuito. Envía una foto de la reparación o un mensaje confirmando que todo está listo y pregunta si necesitan algo más.</li>
  <li><strong>Ofrecer un gesto de cortesía proporcional a la molestia.</strong> La compensación no siempre es económica: puede ser un check-out tardío, una cesta de bienvenida o una actividad gratuita.</li>
  <li><strong>Hacer un seguimiento al día siguiente.</strong> Una simple pregunta ("¿Cómo va todo hoy? ¿Hay algo más que pueda hacer?") refuerza la percepción de atención premium.</li>
</ul>

<h3 class="subsection-title">Escala de compensaciones (orientativa)</h3>

<div class="table-container">
  <table class="data-table">
    <thead>
      <tr>
        <th>Gravedad del problema</th>
        <th>Ejemplo</th>
        <th>Solución base</th>
        <th>Gesto de cortesía</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Menor</strong> (30 min de molestia)</td>
        <td>Fuga pequeña en el lavabo</td>
        <td>Reparar en pocas horas</td>
        <td>Descuento del 5% en la próxima reserva</td>
      </tr>
      <tr>
        <td><strong>Medio</strong> (horas afectadas)</td>
        <td>Falta de agua caliente</td>
        <td>Llevar termos + técnico</td>
        <td>Bonificación de desayuno gratis</td>
      </tr>
      <tr>
        <td><strong>Mayor</strong> (día arruinado)</td>
        <td>Ruido incesante / sin internet</td>
        <td>Cambiar de apartamento</td>
        <td>Reembolso parcial + actividad local</td>
      </tr>
      <tr>
        <td><strong>Crítico</strong> (estancia comprometida)</td>
        <td>Aparato esencial roto</td>
        <td>Reubicar o cancelar con reembolso total</td>
        <td>Noche gratis en otra ocasión</td>
      </tr>
    </tbody>
  </table>
</div>

<p>Adapta esta tabla a tu presupuesto; lo esencial es que el huésped se sienta compensado y valorado.</p>

<h2 class="section-title">3. Casos prácticos y respuestas modelo</h2>

<h3 class="subsection-title">3.1 Problemas de limpieza</h3>

<p><strong>Situación:</strong> El huésped llega y encuentra polvo y pelos en el baño.</p>

<div class="tip-box">
  <p><strong>Respuesta recomendada:</strong></p>
  <ul>
    <li><strong>Escuchar y disculparse:</strong> "Siento mucho que hayas encontrado el baño así. Esto no debería ocurrir".</li>
    <li><strong>Actuar de inmediato:</strong> Ofrece enviar a la persona de limpieza en menos de una hora o limpiarlo tú mismo.</li>
    <li><strong>Gesto extra:</strong> Una vez limpio, deja una pequeña cesta con productos de baño y ofrece un descuento en la próxima estancia.</li>
  </ul>
</div>

<h3 class="subsection-title">3.2 Falta de amenidades</h3>

<p><strong>Situación:</strong> No hay cafetera ni toallas adicionales.</p>

<div class="tip-box">
  <p><strong>Respuesta recomendada:</strong></p>
  <ul>
    <li><strong>Escuchar y empatizar:</strong> "Entiendo lo frustrante que es llegar y no encontrar estos básicos. Gracias por avisarme".</li>
    <li><strong>Actuar:</strong> Compra o busca rápidamente las amenidades faltantes y llévalas al alojamiento.</li>
    <li><strong>Gesto extra:</strong> Incluye un pack de café gourmet o chocolates.</li>
  </ul>
</div>

<h3 class="subsection-title">3.3 Ruido o vecinos molestos</h3>

<p><strong>Situación:</strong> El apartamento está en una zona con discotecas y los huéspedes no pueden dormir.</p>

<div class="tip-box">
  <p><strong>Respuesta recomendada:</strong></p>
  <ul>
    <li><strong>Escuchar y validar:</strong> "Lamento mucho el ruido, entiendo que sea muy molesto".</li>
    <li><strong>Actuar:</strong> Ofrece auriculares anti-ruido, un white-noise machine o moverlos a otro apartamento si es posible.</li>
    <li><strong>Gesto extra:</strong> Compensa con un descuento o invitación a una experiencia tranquila (por ejemplo, entradas a un museo).</li>
  </ul>
</div>

<h3 class="subsection-title">3.4 Problemas de comunicación</h3>

<p><strong>Situación:</strong> El huésped envía mensajes y no recibe respuesta hasta horas después.</p>

<div class="tip-box">
  <p><strong>Respuesta recomendada:</strong></p>
  <ul>
    <li><strong>Reconocer la negligencia:</strong> "Lamento la tardanza en responder, entiendo que no es aceptable".</li>
    <li><strong>Explicar la causa sin excusas:</strong> Podrías mencionar que estabas solucionando otra incidencia, pero evita culpar.</li>
    <li><strong>Actuar:</strong> Asegura que responderás más rápido en lo que resta de la estancia; puedes activar respuestas automáticas temporales.</li>
    <li><strong>Gesto extra:</strong> Envía un pequeño detalle (por ejemplo, una botella de vino) o un check-out tardío de cortesía.</li>
  </ul>
</div>

<h3 class="subsection-title">3.5 Publicidad engañosa o expectativas erróneas</h3>

<p><strong>Situación:</strong> El huésped se queja de que la propiedad no coincide con las fotos o descripción.</p>

<div class="tip-box">
  <p><strong>Respuesta recomendada:</strong></p>
  <ul>
    <li><strong>Escuchar y disculpar:</strong> "Lamento que lo que has encontrado no coincida con tu expectativa; investigaré qué ha pasado".</li>
    <li><strong>Verificar el anuncio:</strong> Aclara si hubo un error en la publicación. Si se publicaron fotos antiguas, reconócelo.</li>
    <li><strong>Actuar:</strong> Ofrece alternativas: un reembolso completo, un alojamiento equivalente o un descuento considerable si decide quedarse.</li>
  </ul>
</div>

<p>Ser transparente y gestionar las expectativas antes de la llegada ayuda a prevenir estas quejas.</p>

<h2 class="section-title">4. Herramientas y recursos para anfitriones independientes</h2>

<p>No necesitas un equipo de 100 personas ni costosos sistemas para ofrecer un servicio extraordinario. Estas son algunas soluciones accesibles:</p>

<ul>
  <li><strong>Manual digital y guías QR.</strong> Centraliza toda la información (Wi-Fi, normas, recomendaciones locales) en un manual digital accesible mediante un código QR. Así podrás actualizar datos como contraseñas sin imprimir nuevas tarjetas.</li>
  <li><strong>Plantillas de mensajería rápida.</strong> Prepara respuestas para incidentes comunes (falta de limpieza, ruido, wifi). Esto te permite contestar en segundos y personalizar los detalles.</li>
  <li><strong>Cuaderno de incidencias.</strong> Registra cada queja y cómo la resolviste. Esto te ayudará a detectar tendencias, evaluar a tus proveedores o limpiar procesos.</li>
  <li><strong>Formación básica en empatía.</strong> No necesitas cursos caros: comparte con tu equipo (o tú mismo) las pautas de escuchar, empatizar, disculparse y actuar. Realiza simulacros con situaciones habituales.</li>
  <li><strong>Definición de compensaciones.</strong> Decide con antelación qué gestos puedes ofrecer para distintos niveles de problema. Esta previsión te evita improvisar y te da seguridad a la hora de responder.</li>
</ul>

<h2 class="section-title">5. Prevención: el mejor servicio al cliente es anticiparse</h2>

<p>Aunque saber gestionar quejas es esencial, prevenirlas es aún mejor. Algunas acciones proactivas:</p>

<ul>
  <li><strong>Descripción honesta y completa del alojamiento.</strong> Incluye fotos recientes, indica si hay escaleras, ruido, mascotas o alergias. Las expectativas claras reducen las decepciones.</li>
  <li><strong>Comunicación previa a la llegada.</strong> Envía un mensaje con indicaciones de acceso, normas, recomendaciones y números de contacto. Esto transmite profesionalidad y evita dudas de último minuto.</li>
  <li><strong>Revisión periódica del equipamiento.</strong> Comprueba que electrodomésticos, bombillas, calefacción, aire acondicionado y wifi funcionan antes de cada llegada.</li>
  <li><strong>Programa de limpieza riguroso.</strong> Una política "sin rastro" implica que el huésped no debería detectar signos de ocupaciones anteriores.</li>
  <li><strong>Crear un plan de contingencia.</strong> Ten siempre a mano un fontanero, un técnico y un equipo de limpieza que puedan atender urgencias. Si gestionas varios alojamientos, construye una red de proveedores de confianza.</li>
</ul>

<h2 class="section-title">6. Conclusión: actitud de lujo al alcance de todos</h2>

<p>La excelencia en la atención al cliente no depende del tamaño de tu negocio, sino de tu actitud y capacidad de respuesta. Las cadenas de lujo han formalizado métodos como LEARN, HEART y HEARD, pero sus principios —escuchar activamente, mostrar empatía, disculparse, solucionar y hacer seguimiento— están al alcance de cualquier anfitrión.</p>

<p>Transformar las quejas en reseñas de 5 estrellas requiere rapidez, comunicación clara y gestos sinceros. Recuerda que cada contratiempo es una oportunidad para demostrar tu profesionalismo y crear un lazo emocional con el viajero.</p>

<div class="highlight-box">
  <p><strong>Empieza hoy mismo:</strong> revisa tus plantillas de respuesta, define tus niveles de compensación y prepara un manual digital. Cuando surja la próxima queja, estarás listo para convertirla en un testimonio positivo que impulse tu reputación.</p>
</div>
`;

async function updateArticle() {
  try {
    // Find the article by slug
    const article = await prisma.blogPost.findUnique({
      where: { slug: 'metodo-4-pasos-convertir-quejas-en-5-estrellas' }
    });

    if (!article) {
      // Try alternative slug
      const altArticle = await prisma.blogPost.findUnique({
        where: { slug: 'metodo-4-pasos-convertir-quejas-5-estrellas' }
      });

      if (!altArticle) {
        console.log('Article not found with either slug. Available articles:');
        const articles = await prisma.blogPost.findMany({
          where: {
            OR: [
              { slug: { contains: 'quejas' } },
              { slug: { contains: '5-estrellas' } },
              { title: { contains: 'quejas' } }
            ]
          },
          select: { id: true, slug: true, title: true }
        });
        console.log(articles);
        return;
      }

      // Update the alternative article
      const updated = await prisma.blogPost.update({
        where: { id: altArticle.id },
        data: {
          title: 'Cómo Convertir Quejas en Reseñas de 5 Estrellas en Alquiler Vacacional',
          content: articleContent,
          excerpt: 'Aprende el método ESAR (Escuchar, Sentir, Actuar, Recompensar) para transformar las quejas de tus huéspedes en reseñas de 5 estrellas. Incluye casos prácticos y plantillas de respuesta.',
          metaTitle: 'Convertir Quejas en 5 Estrellas | Método ESAR para Alquiler Vacacional',
          metaDescription: 'Método probado de 4 pasos para convertir quejas de huéspedes en reseñas de 5 estrellas. Incluye casos prácticos, plantillas de respuesta y escala de compensaciones.',
          keywords: ['quejas huéspedes', 'reseñas 5 estrellas', 'atención al cliente', 'alquiler vacacional', 'método ESAR', 'gestión de quejas'],
          status: 'PUBLISHED',
          publishedAt: new Date()
        }
      });
      console.log('✅ Article updated successfully:', updated.slug);
      return;
    }

    // Update the article
    const updated = await prisma.blogPost.update({
      where: { id: article.id },
      data: {
        title: 'Cómo Convertir Quejas en Reseñas de 5 Estrellas en Alquiler Vacacional',
        content: articleContent,
        excerpt: 'Aprende el método ESAR (Escuchar, Sentir, Actuar, Recompensar) para transformar las quejas de tus huéspedes en reseñas de 5 estrellas. Incluye casos prácticos y plantillas de respuesta.',
        metaTitle: 'Convertir Quejas en 5 Estrellas | Método ESAR para Alquiler Vacacional',
        metaDescription: 'Método probado de 4 pasos para convertir quejas de huéspedes en reseñas de 5 estrellas. Incluye casos prácticos, plantillas de respuesta y escala de compensaciones.',
        keywords: ['quejas huéspedes', 'reseñas 5 estrellas', 'atención al cliente', 'alquiler vacacional', 'método ESAR', 'gestión de quejas'],
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    });

    console.log('✅ Article updated successfully:', updated.slug);
  } catch (error) {
    console.error('Error updating article:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateArticle();
