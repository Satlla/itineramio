const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const articleContent = `
<style>
  .article-lead { font-size: 1.25rem; line-height: 1.8; color: #374151; margin-bottom: 2rem; }
  .section-title { font-size: 1.75rem; font-weight: 700; color: #111827; margin-top: 2.5rem; margin-bottom: 1rem; }
  .subsection-title { font-size: 1.25rem; font-weight: 600; color: #1f2937; margin-top: 1.5rem; margin-bottom: 0.75rem; }
  .step-box { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #0ea5e9; padding: 1.5rem; margin: 1.5rem 0; border-radius: 0 8px 8px 0; }
  .step-number { display: inline-flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; background: #7c3aed; color: white; border-radius: 50%; font-weight: 700; margin-right: 1rem; font-size: 1.25rem; }
  .tip-box { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #22c55e; padding: 1.5rem; margin: 1.5rem 0; border-radius: 0 8px 8px 0; }
  .warning-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 1.5rem; margin: 1.5rem 0; border-radius: 0 8px 8px 0; }
  .example-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 1.5rem; margin: 1.5rem 0; border-radius: 8px; }
  .example-box-title { font-weight: 600; color: #4f46e5; margin-bottom: 0.5rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .multilang-tip { background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-left: 4px solid #a855f7; padding: 1.5rem; margin: 1.5rem 0; border-radius: 0 8px 8px 0; }
  .cta-box { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 2rem; margin: 2rem 0; border-radius: 12px; text-align: center; }
  .cta-box h3 { color: white; font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
  .cta-box p { color: rgba(255,255,255,0.9); margin-bottom: 1rem; }
  .cta-button { display: inline-block; background: white; color: #7c3aed; padding: 0.75rem 2rem; border-radius: 8px; font-weight: 600; text-decoration: none; }
</style>

<p class="article-lead">El check-in es uno de los momentos más importantes de la estancia de tu huésped. Una buena experiencia de llegada puede marcar la diferencia entre una reseña de 4 o 5 estrellas.</p>

<p>En esta guía te explicamos cómo configurar la zona de Check-in en tu Manual Digital de Itineramio para que tus huéspedes tengan toda la información que necesitan, en su idioma, y sin que tengas que repetir las mismas instrucciones una y otra vez.</p>

<h2 class="section-title">¿Qué información debe incluir tu zona de Check-in?</h2>

<p>Una zona de Check-in completa debería incluir:</p>

<ul>
  <li><strong>Instrucciones de acceso:</strong> cómo llegar al edificio/propiedad</li>
  <li><strong>Código de entrada:</strong> si tienes cerradura con código</li>
  <li><strong>Ubicación de las llaves:</strong> si usas caja de seguridad o similar</li>
  <li><strong>Horario de check-in:</strong> hora a partir de la cual está disponible</li>
  <li><strong>Contacto de emergencia:</strong> por si hay algún problema</li>
</ul>

<h2 class="section-title">Paso 1: Crear la zona de Check-in</h2>

<div class="step-box">
  <p><span class="step-number">1</span>En tu dashboard de Itineramio, ve a tu propiedad y haz clic en <strong>"Añadir zona"</strong>.</p>
  <p>Selecciona el icono de llave o entrada y nombra la zona "Check-in" o "Llegada".</p>
</div>

<h2 class="section-title">Paso 2: Añadir los pasos de instrucciones</h2>

<p>Una vez creada la zona, debes <strong>añadir pasos</strong> con las instrucciones detalladas. Para cada paso nuevo, haz clic en el botón <strong>"Añadir paso"</strong> dentro de la zona.</p>

<div class="step-box">
  <p><span class="step-number">2</span>Haz clic en <strong>"Añadir paso"</strong> para crear cada instrucción. Puedes crear tantos pasos como necesites.</p>
</div>

<h3 class="subsection-title">Ejemplo de pasos recomendados:</h3>

<div class="example-box">
  <div class="example-box-title">Paso 1 - Cómo llegar</div>
  <p>"Cuando llegues al edificio, busca el portal número 15. El código del portero automático es 1234*."</p>
</div>

<div class="example-box">
  <div class="example-box-title">Paso 2 - Acceso al apartamento</div>
  <p>"Sube al piso 3. La puerta de la derecha es tu apartamento. El código de la cerradura inteligente son los 4 últimos dígitos de tu teléfono móvil."</p>
</div>

<div class="example-box">
  <div class="example-box-title">Paso 3 - Vídeo explicativo</div>
  <p>Si tienes un vídeo mostrando cómo funciona la cerradura o el acceso, súbelo directamente a Itineramio en este paso. El huésped podrá verlo desde el manual digital.</p>
</div>

<div class="multilang-tip">
  <strong>🌍 Recomendación multi-idioma:</strong>
  <p>Es <strong>muy importante</strong> que configures cada paso en varios idiomas (español, inglés, francés...) para que cualquier huésped pueda ver el manual correctamente en su idioma. Itineramio detecta automáticamente el idioma del navegador del huésped.</p>
</div>

<h2 class="section-title">Paso 3: Configurar el código de acceso</h2>

<p>Si usas una cerradura con código, te recomendamos usar <strong>los 4 últimos dígitos del teléfono móvil del huésped</strong> como código de acceso. Esto tiene varias ventajas:</p>

<ul>
  <li>Cada huésped tiene un código único y fácil de recordar</li>
  <li>No necesitas cambiar el código entre reservas</li>
  <li>El huésped ya conoce sus propios dígitos</li>
</ul>

<div class="warning-box">
  <strong>⚠️ Importante sobre el horario:</strong>
  <p>Indica claramente que el código <strong>solo estará habilitado a partir de tu hora de check-in</strong> (por ejemplo, a partir de las 15:00h). Si tienes la propiedad lista antes, puedes escribir al huésped para avisarle. También puedes ofrecer early check-in por un suplemento si lo deseas.</p>
</div>

<div class="example-box">
  <div class="example-box-title">Ejemplo de mensaje automático</div>
  <p>"Tu código de acceso serán los 4 últimos dígitos de tu teléfono móvil. El código estará habilitado a partir de las 15:00h (tu hora de check-in). Si tenemos el apartamento listo antes, te avisaremos para que puedas entrar más temprano. Si necesitas un early check-in, consúltanos disponibilidad y precio."</p>
</div>

<h2 class="section-title">Paso 4: Añadir fotos o vídeos de apoyo</h2>

<p>Las instrucciones escritas están bien, pero las imágenes y vídeos son mucho más efectivas:</p>

<div class="step-box">
  <p><span class="step-number">4</span>En cada paso, puedes añadir:</p>
  <ul>
    <li><strong>Fotos:</strong> del portal, buzón con llaves, puerta del apartamento</li>
    <li><strong>Vídeos:</strong> mostrando cómo usar la cerradura o el proceso de entrada</li>
  </ul>
  <p>Para añadir vídeos, <strong>súbelos directamente a Itineramio</strong>. El huésped podrá reproducirlos desde el manual digital sin salir de la página.</p>
</div>

<div class="tip-box">
  <strong>💡 Pro tip:</strong>
  <p>Un vídeo de 30 segundos mostrando cómo entrar vale más que 500 palabras de instrucciones. El huésped lo puede ver justo antes de llegar.</p>
</div>

<h2 class="section-title">Paso 5: Revisar y publicar</h2>

<div class="step-box">
  <p><span class="step-number">5</span>Una vez configurados todos los pasos:</p>
  <ol>
    <li>Revisa que toda la información esté correcta</li>
    <li>Asegúrate de que cada paso tenga traducción en los idiomas que necesitas</li>
    <li>Publica la zona para que sea visible en tu manual digital</li>
  </ol>
</div>

<h2 class="section-title">Beneficios de un Check-in bien configurado</h2>

<ul>
  <li><strong>Menos mensajes repetitivos:</strong> el huésped tiene toda la info en su móvil</li>
  <li><strong>Check-in autónomo:</strong> no necesitas estar presente</li>
  <li><strong>Mejor experiencia:</strong> el huésped llega sin estrés</li>
  <li><strong>Multi-idioma:</strong> funciona para huéspedes de cualquier país</li>
  <li><strong>Siempre actualizado:</strong> cambias la info en Itineramio y se actualiza al instante</li>
</ul>

<div class="cta-box">
  <h3>🔑 Configura tu zona de Check-in ahora</h3>
  <p>Crea tu manual digital y automatiza las instrucciones de llegada</p>
  <a href="https://www.itineramio.com" class="cta-button">Empezar Gratis</a>
</div>

<h2 class="section-title">Conclusión</h2>

<p>Un check-in bien configurado en tu Manual Digital de Itineramio te ahorra tiempo, reduce los mensajes repetitivos y mejora la experiencia de tus huéspedes desde el primer momento. Recuerda configurar cada paso en varios idiomas y añadir fotos o vídeos para que las instrucciones sean lo más claras posible.</p>
`;

async function updateArticle() {
  try {
    const article = await prisma.blogPost.findUnique({
      where: { slug: 'como-configurar-zona-check-in-itineramio' }
    });

    if (!article) {
      console.log('Article not found. Searching for similar articles...');
      const articles = await prisma.blogPost.findMany({
        where: {
          OR: [
            { slug: { contains: 'check-in' } },
            { slug: { contains: 'checkin' } },
            { title: { contains: 'Check-in' } }
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
        title: 'Cómo Configurar la Zona de Check-in en Itineramio: Guía Paso a Paso',
        content: articleContent,
        excerpt: 'Aprende a configurar la zona de Check-in en tu Manual Digital de Itineramio. Instrucciones multi-idioma, vídeos de acceso y códigos personalizados para cada huésped.',
        metaTitle: 'Configurar Zona Check-in en Itineramio | Guía Paso a Paso',
        metaDescription: 'Guía completa para configurar tu zona de Check-in en Itineramio. Instrucciones multi-idioma, vídeos, códigos de acceso y más. Automatiza la llegada de tus huéspedes.',
        keywords: ['check-in', 'manual digital', 'itineramio', 'alquiler vacacional', 'instrucciones huéspedes', 'cerradura inteligente'],
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
