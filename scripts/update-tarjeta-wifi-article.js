const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const articleContent = `
<style>
  .article-lead { font-size: 1.25rem; line-height: 1.8; color: #374151; margin-bottom: 2rem; }
  .section-title { font-size: 1.75rem; font-weight: 700; color: #111827; margin-top: 2.5rem; margin-bottom: 1rem; }
  .subsection-title { font-size: 1.25rem; font-weight: 600; color: #1f2937; margin-top: 1.5rem; margin-bottom: 0.75rem; }
  .highlight-box { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #0ea5e9; padding: 1.5rem; margin: 1.5rem 0; border-radius: 0 8px 8px 0; }
  .cta-box { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 2rem; margin: 2rem 0; border-radius: 12px; text-align: center; }
  .cta-box h3 { color: white; font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
  .cta-box p { color: rgba(255,255,255,0.9); margin-bottom: 1rem; }
  .cta-button { display: inline-block; background: white; color: #7c3aed; padding: 0.75rem 2rem; border-radius: 8px; font-weight: 600; text-decoration: none; transition: transform 0.2s; }
  .cta-button:hover { transform: scale(1.05); }
  .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 1.5rem 0; }
  .feature-card { background: #f9fafb; border: 1px solid #e5e7eb; padding: 1.5rem; border-radius: 8px; }
  .feature-card h4 { font-weight: 600; color: #1f2937; margin-bottom: 0.5rem; }
  .feature-card p { color: #6b7280; font-size: 0.9rem; }
  .tip-box { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #22c55e; padding: 1.5rem; margin: 1.5rem 0; border-radius: 0 8px 8px 0; }
  .warning-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 1.5rem; margin: 1.5rem 0; border-radius: 0 8px 8px 0; }
  .check-list { list-style: none; padding: 0; }
  .check-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
  .check-list li::before { content: "✅"; position: absolute; left: 0; }
  .cross-list li::before { content: "❌"; }
  .qr-demo { background: #f3f4f6; padding: 2rem; border-radius: 12px; text-align: center; margin: 1.5rem 0; }
  .qr-demo img { max-width: 200px; margin: 0 auto; }
</style>

<p class="article-lead">"¿Cuál es la contraseña del WiFi?"</p>

<p>Si gestionas alojamientos turísticos, esta es probablemente la pregunta que más escuchas. Y aunque parezca trivial, consume tiempo, interrumpe tu día y genera fricción justo en el momento más sensible: el check-in.</p>

<p>La solución más simple (y más efectiva) es una <strong>tarjeta WiFi profesional</strong>, clara y visible, con <strong>QR de conexión automática</strong>. El huésped escanea, confirma y listo: conectado.</p>

<h2 class="section-title">Por qué las "tarjetas WiFi caseras" te hacen perder tiempo (y puntos)</h2>

<p>Muchos anfitriones siguen usando un post-it, un papel impreso sin diseño o una nota escrita a mano. El problema no es solo estético; es operativo:</p>

<ul>
  <li>Se pierden, se rompen o se manchan.</li>
  <li>No guían al huésped: si no entiende dónde conectarse o cómo escribir la contraseña, te escribe igual.</li>
  <li>Las contraseñas largas generan errores (mayúsculas, guiones, caracteres especiales).</li>
  <li>Dan una imagen menos cuidada, y eso se nota en la percepción del alojamiento.</li>
</ul>

<p><strong>Resultado:</strong> más mensajes repetidos y menos sensación de "todo está bajo control".</p>

<h2 class="section-title">Genera tu Tarjeta WiFi profesional gratis (lista para imprimir)</h2>

<p>Con Itineramio puedes crear tu tarjeta en segundos y tenerla lista para imprimir con un diseño limpio y moderno.</p>

<div class="cta-box">
  <h3>📶 Crear mi Tarjeta WiFi Gratis</h3>
  <p>Diseño profesional con QR de conexión automática</p>
  <a href="https://www.itineramio.com/tools/wifi-card" class="cta-button">Generar Tarjeta WiFi</a>
</div>

<h2 class="section-title">Qué incluye nuestra tarjeta WiFi</h2>

<div class="feature-grid">
  <div class="feature-card">
    <h4>🎨 Diseño profesional</h4>
    <p>Estética moderna y cuidada. Colores personalizables. Logo opcional.</p>
  </div>
  <div class="feature-card">
    <h4>📱 QR de conexión automática</h4>
    <p>El huésped escanea y se conecta sin escribir nada. Compatible con iPhone y Android. Sin apps adicionales.</p>
  </div>
  <div class="feature-card">
    <h4>📋 Información clara</h4>
    <p>Nombre de la red (SSID). Contraseña visible. Instrucciones simples.</p>
  </div>
  <div class="feature-card">
    <h4>🖨️ Lista para imprimir</h4>
    <p>Formato A6 o A7 (tamaño tarjeta). PDF de alta calidad. Varias copias por hoja.</p>
  </div>
</div>

<h2 class="section-title">Dónde colocar la tarjeta WiFi (para que de verdad funcione)</h2>

<p>La clave es que <strong>se vea sin buscar</strong>.</p>

<ul class="check-list">
  <li><strong>Entrada del apartamento:</strong> lo ven nada más llegar</li>
  <li><strong>Mesa del salón:</strong> junto al mando de la TV o información útil</li>
  <li><strong>Escritorio:</strong> si hay zona de trabajo</li>
  <li><strong>Mesita de noche:</strong> para conectarse desde la cama</li>
</ul>

<ul class="check-list cross-list">
  <li>Evita cocina o baño (se mojan/ensucian)</li>
</ul>

<div class="tip-box">
  <strong>💡 Consejo práctico:</strong> imprime dos tarjetas (entrada + salón).
</div>

<h2 class="section-title">El truco del QR: menos errores, menos mensajes</h2>

<p><strong>Sin QR,</strong> el huésped suele hacer esto:</p>
<ol>
  <li>Buscar la red</li>
  <li>Escribir la contraseña (probablemente mal)</li>
  <li>Reintentar</li>
  <li>Terminar escribiéndote</li>
</ol>

<p><strong>Con QR:</strong></p>
<ol>
  <li>Escanear con la cámara</li>
  <li>Pulsar "Unirse a la red"</li>
  <li>Conectado</li>
</ol>

<p>En la práctica, <strong>reduce drásticamente las consultas repetidas de WiFi</strong> y mejora la experiencia desde el minuto uno.</p>

<div class="warning-box">
  <strong>⚠️ Nota rápida (para evitar incidencias)</strong>
  <p>El QR funciona muy bien, pero como cualquier cosa impresa tiene una limitación natural: si cambias el nombre de la red o la contraseña, tendrás que actualizar la tarjeta. Por eso es buena idea tenerlo también dentro de tu Manual Digital, donde puedes cambiarlo en segundos sin reimprimir nada.</p>
</div>

<h2 class="section-title">Pro tip: combínala con un Manual Digital (el siguiente nivel)</h2>

<p>La tarjeta WiFi es el primer paso. Lo que realmente te ahorra tiempo es centralizarlo todo en un <strong>Manual Digital accesible por QR</strong>, con:</p>

<ul>
  <li>Normas de la casa</li>
  <li>Instrucciones de electrodomésticos</li>
  <li>Check-out y residuos</li>
  <li>Contacto de emergencia</li>
  <li>Recomendaciones locales</li>
</ul>

<p>Todo actualizado y accesible desde el móvil.</p>

<div class="cta-box">
  <h3>📶 Crea tu tarjeta ahora</h3>
  <p>Gratis, profesional y con QR de conexión automática</p>
  <a href="https://www.itineramio.com/tools/wifi-card" class="cta-button">Generar Tarjeta WiFi Gratis</a>
</div>

<p>Y si quieres llevarlo al siguiente nivel: <a href="https://www.itineramio.com">crea tu Manual Digital en Itineramio</a> y convierte el WiFi (y el resto de preguntas típicas) en algo que el huésped resuelve solo, sin escribirte.</p>
`;

async function updateArticle() {
  try {
    const article = await prisma.blogPost.findUnique({
      where: { slug: 'tarjeta-wifi-imprimible-huespedes-plantilla' }
    });

    if (!article) {
      console.log('Article not found. Searching for similar articles...');
      const articles = await prisma.blogPost.findMany({
        where: {
          OR: [
            { slug: { contains: 'wifi' } },
            { slug: { contains: 'tarjeta' } },
            { title: { contains: 'WiFi' } }
          ]
        },
        select: { id: true, slug: true, title: true }
      });
      console.log('Found articles:', articles);
      return;
    }

    const updated = await prisma.blogPost.update({
      where: { id: article.id },
      data: {
        title: 'Tarjeta WiFi Imprimible para Huéspedes: Plantilla Gratis + Generador (con QR)',
        content: articleContent,
        excerpt: 'Genera tu tarjeta WiFi profesional con QR de conexión automática. Gratis, lista para imprimir y sin que el huésped tenga que escribir la contraseña.',
        metaTitle: 'Tarjeta WiFi Imprimible Gratis | Generador con QR para Huéspedes',
        metaDescription: 'Crea tu tarjeta WiFi profesional con QR de conexión automática. El huésped escanea y se conecta sin escribir nada. Gratis y lista para imprimir.',
        keywords: ['tarjeta wifi', 'qr wifi', 'conexión automática', 'alquiler vacacional', 'huéspedes', 'plantilla gratis'],
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
