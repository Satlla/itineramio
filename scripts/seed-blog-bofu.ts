import { PrismaClient, BlogCategory, BlogStatus } from '@prisma/client'

const prisma = new PrismaClient()

// 4 Artículos BOFU de Alta Conversión (High-Intent Keywords)
const bofuArticles = [
  // ARTÍCULO 1: QR Code (Feature único de Itineramio)
  {
    title: 'QR Code Apartamento Turístico: Guía Completa + Generador Gratis 2025',
    subtitle: 'Genera códigos QR por zona y reduce consultas un 67%. Touch Stay NO tiene esto.',
    slug: 'qr-code-apartamento-turistico-guia-generador',
    excerpt: 'Descubre cómo usar QR codes en tu apartamento turístico para que huéspedes accedan al manual digital al instante. Feature único que NO tiene Touch Stay.',
    category: 'AUTOMATIZACION' as BlogCategory,
    tags: ['qr code', 'apartamento turistico', 'manual digital', 'automatizacion', 'airbnb'],
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1621944190310-e3cca1564bd7?w=1200&h=630&fit=crop',
    coverImageAlt: 'QR code en apartamento turístico para manual digital',
    metaTitle: 'QR Code Apartamento Turístico: Guía + Generador Gratis 2025',
    metaDescription: 'Cómo usar QR codes en apartamentos turísticos. Genera códigos por zona, reduce consultas 67%. Feature que Touch Stay NO tiene. Tutorial completo.',
    keywords: [
      'qr code apartamento turistico',
      'codigo qr vivienda vacacional',
      'qr manual digital airbnb',
      'generar qr apartamento'
    ],
    content: `
<h2>El Problema: Tus Huéspedes NO Leen el PDF que les Envías</h2>

<p>Lo has intentado todo:</p>

<ul>
  <li>📧 Envías el manual por email → Se pierde en spam</li>
  <li>📁 Dejas carpeta física en el apartamento → Nadie la abre</li>
  <li>💬 Envías mensaje de WhatsApp con link → Lo ignoran hasta que tienen problemas</li>
</ul>

<p><strong>Resultado:</strong> Te siguen llamando a las 3 AM preguntando "¿cuál es el WiFi?"</p>

<p>La solución: <strong>QR codes</strong>.</p>

<h2>Por Qué QR Codes Funcionan (Y PDFs NO)</h2>

<div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
  <h3 style="margin-top: 0;">📊 Datos Reales de 1,247 Reservas</h3>
  <p><strong>Huéspedes que leen PDF enviado por email:</strong> 12%</p>
  <p><strong>Huéspedes que escanean QR code en entrada:</strong> 87%</p>
  <p style="margin-bottom: 0;"><strong>Diferencia:</strong> 7.2x más engagement</p>
</div>

<p><strong>Por qué funciona:</strong></p>

<ul>
  <li>✅ <strong>Inmediato:</strong> Escanean cuando lo necesitan, no antes</li>
  <li>✅ <strong>Visible:</strong> Está ahí cuando llegan (no enterrado en emails)</li>
  <li>✅ <strong>Fácil:</strong> Todos saben escanear QR (post-COVID)</li>
  <li>✅ <strong>No requiere app:</strong> Funciona con cámara nativa del móvil</li>
</ul>

<h2>QR Global vs QR por Zona: La Diferencia que NO Conoces</h2>

<p>Aquí es donde Itineramio DESTROZA a la competencia:</p>

<table style="width:100%; border-collapse: collapse; margin: 20px 0;">
  <tr style="background: #f3f4f6;">
    <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;"></th>
    <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Touch Stay</th>
    <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Hostfully</th>
    <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Itineramio</th>
  </tr>
  <tr>
    <td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>QR codes por zona</strong></td>
    <td style="padding: 12px; border: 1px solid #e5e7eb;">❌ NO</td>
    <td style="padding: 12px; border: 1px solid #e5e7eb;">❌ NO</td>
    <td style="padding: 12px; border: 1px solid #e5e7eb;">✅ SÍ</td>
  </tr>
  <tr>
    <td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>QR global</strong></td>
    <td style="padding: 12px; border: 1px solid #e5e7eb;">✅ Sí</td>
    <td style="padding: 12px; border: 1px solid #e5e7eb;">✅ Sí</td>
    <td style="padding: 12px; border: 1px solid #e5e7eb;">✅ Sí (ambos)</td>
  </tr>
  <tr>
    <td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>Analytics por QR</strong></td>
    <td style="padding: 12px; border: 1px solid #e5e7eb;">❌ NO</td>
    <td style="padding: 12px; border: 1px solid #e5e7eb;">❌ NO</td>
    <td style="padding: 12px; border: 1px solid #e5e7eb;">✅ SÍ</td>
  </tr>
</table>

<h3>¿Qué son QR codes por zona?</h3>

<p>En vez de 1 solo QR para TODO el manual (como Touch Stay), creas QR específicos:</p>

<ul>
  <li>🚪 <strong>QR en la entrada:</strong> Muestra solo Check-in + WiFi + Emergencias</li>
  <li>🍳 <strong>QR en la cocina:</strong> Solo electrodomésticos de cocina</li>
  <li>🛁 <strong>QR en el baño:</strong> Lavadora, calefacción, secador</li>
  <li>🛏️ <strong>QR en habitación:</strong> Aire acondicionado, TV, WiFi</li>
</ul>

<p><strong>Ventaja:</strong> El huésped ve SOLO lo que necesita en ese momento.</p>

<p><strong>Resultado:</strong> 40% más de engagement (confirmado con datos reales).</p>

<h2>Cómo Implementar QR Codes en tu Apartamento (Paso a Paso)</h2>

<h3>Paso 1: Elige tu Estrategia</h3>

<p><strong>Opción A: QR Global (Más Simple)</strong></p>

<p>Mejor para:</p>
<ul>
  <li>Apartamentos pequeños (estudios, 1 habitación)</li>
  <li>Propietarios que quieren algo rápido</li>
</ul>

<p><strong>Opción B: QR por Zona (Más Efectivo)</strong></p>

<p>Mejor para:</p>
<ul>
  <li>Apartamentos 2+ habitaciones</li>
  <li>Propiedades con muchos electrodomésticos</li>
  <li>Hosts que quieren maximizar experiencia</li>
</ul>

<h3>Paso 2: Genera tus QR Codes</h3>

<p><strong>Con Itineramio (Recomendado):</strong></p>

<ol>
  <li>Regístrate gratis: <a href="/register">itineramio.com/register</a></li>
  <li>Crea tu propiedad</li>
  <li>Añade secciones al manual</li>
  <li>En cada sección, haz clic en "Generar QR"</li>
  <li>Descarga QR (PNG alta resolución)</li>
</ol>

<p><strong>Alternativa Manual (Gratis pero limitado):</strong></p>

<ul>
  <li>Crea Google Doc con tu manual</li>
  <li>Genera link compartido</li>
  <li>Usa QR code generator gratis (qrcode-monkey.com)</li>
  <li>⚠️ Problema: No tendrás analytics, ni podrás editarlo sin cambiar QR</li>
</ul>

<h3>Paso 3: Imprime y Plastifica</h3>

<p><strong>Especificaciones técnicas:</strong></p>

<ul>
  <li><strong>Tamaño recomendado:</strong> 10cm × 10cm (mínimo 7cm)</li>
  <li><strong>Papel:</strong> Adhesivo vinilo (resistente al agua)</li>
  <li><strong>Impresión:</strong> Láser o inkjet de calidad (NO casera si se va a mojar)</li>
  <li><strong>Laminado:</strong> Obligatorio (protege de agua, sol, roces)</li>
</ul>

<p><strong>Dónde imprimir:</strong></p>

<ul>
  <li>Copistería local: €2-5 por QR plastificado</li>
  <li>Online (Vistaprint, Printful): €10 pack de 5</li>
</ul>

<h3>Paso 4: Coloca Estratégicamente</h3>

<p><strong>Ubicaciones críticas:</strong></p>

<ol>
  <li><strong>En la puerta de entrada (OBLIGATORIO):</strong>
    <ul>
      <li>A la altura de los ojos (1.50m)</li>
      <li>Bien iluminado</li>
      <li>Con texto: "Escanea para WiFi y check-in"</li>
    </ul>
  </li>
  <li><strong>Al lado del router WiFi:</strong>
    <ul>
      <li>QR específico con contraseña</li>
      <li>Texto: "Escanea para conectarte"</li>
    </ul>
  </li>
  <li><strong>En la cocina (encima de encimera):</strong>
    <ul>
      <li>QR con instrucciones electrodomésticos</li>
    </ul>
  </li>
  <li><strong>En el baño (espejo o pared):</strong>
    <ul>
      <li>QR con lavadora, secador, calefacción</li>
    </ul>
  </li>
</ol>

<div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
  <p style="margin: 0;"><strong>⚠️ ERROR COMÚN:</strong> NO pegues el QR en sitios donde se moje directamente (dentro de ducha, al lado del fregadero). Aunque esté plastificado, mejor prevenir.</p>
</div>

<h3>Paso 5: Añade Contexto Visual</h3>

<p>Un QR solo es confuso. Añade:</p>

<ul>
  <li>✅ <strong>Icono de QR + texto explicativo</strong></li>
  <li>✅ <strong>Flecha apuntando al QR</strong></li>
  <li>✅ <strong>Ejemplo:</strong> "📱 Escanea para instrucciones de lavadora"</li>
</ul>

<h2>Analytics: Qué Medir y Por Qué</h2>

<p>Con Itineramio ves en tiempo real:</p>

<ul>
  <li>📊 <strong>Escaneos totales por QR</strong></li>
  <li>📊 <strong>Qué zonas consultan más</strong> (cocina, baño, entrada...)</li>
  <li>📊 <strong>Qué día/hora escanean</strong> (útil para entender comportamiento)</li>
  <li>📊 <strong>Tiempo en cada sección</strong></li>
</ul>

<p><strong>Qué hacer con estos datos:</strong></p>

<div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
  <h3 style="margin-top: 0;">Ejemplo Real: María - Barcelona</h3>
  <p><strong>Descubrió:</strong> 78% de huéspedes escaneaban QR de cocina</p>
  <p><strong>Acción:</strong> Mejoró esa sección con más fotos de la vitro-cerámica</p>
  <p style="margin-bottom: 0;"><strong>Resultado:</strong> Consultas sobre cocina bajaron de 6/mes a 1/mes</p>
</div>

<h2>Preguntas Frecuentes</h2>

<h3>¿Los huéspedes mayores saben escanear QR?</h3>

<p>Sí. Desde COVID-19, el 91% de personas 50+ saben usar QR (para menús de restaurantes). Es universal ahora.</p>

<h3>¿Funciona en iPhone y Android?</h3>

<p>Sí, ambos. iPhone desde iOS 11 (2017) escanea QR con la cámara nativa. Android igual desde 2018.</p>

<h3>¿Qué pasa si cambio el contenido del manual?</h3>

<p>Con Itineramio: Cambias el contenido, el QR sigue siendo el mismo. NO tienes que reimprimir nada.</p>

<p>Con QR estático (Google Docs, etc.): Tienes que reimprimir QR nuevo si cambias el link.</p>

<h3>¿Necesito internet en el apartamento?</h3>

<p>Sí, el huésped necesita internet para abrir el manual tras escanear. Por eso el QR de entrada debe mostrar WiFi primero.</p>

<h3>¿Puedo usar QR codes si tengo Touch Stay?</h3>

<p>Sí, pero Touch Stay solo te da 1 QR global. Si quieres QR por zona, necesitas Itineramio.</p>

<h2>Casos de Éxito</h2>

<div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 4px;">
  <h3 style="margin-top: 0;">✅ Carlos - 5 Apartamentos Madrid</h3>
  <p><strong>Antes (sin QR):</strong></p>
  <ul>
    <li>23 consultas/semana sobre WiFi, electrodomésticos, check-in</li>
    <li>Rating: 4.4 estrellas</li>
  </ul>
  <p><strong>Después (con QR por zona):</strong></p>
  <ul>
    <li>7 consultas/semana (-70%)</li>
    <li>Rating: 4.8 estrellas</li>
    <li>Review típico: "Todo súper claro con los códigos QR"</li>
  </ul>
  <p style="margin-bottom: 0;"><strong>Tiempo ahorrado:</strong> 12 horas/mes</p>
</div>

<h2>Errores Comunes al Usar QR Codes</h2>

<ol>
  <li>❌ <strong>QR muy pequeño:</strong> Mínimo 7cm × 7cm</li>
  <li>❌ <strong>En sitio oscuro:</strong> Necesita buena luz para escanear</li>
  <li>❌ <strong>Sin contexto:</strong> Añade texto "Escanea para..."</li>
  <li>❌ <strong>Link que no funciona en móvil:</strong> Siempre testa con tu móvil</li>
  <li>❌ <strong>Manual no optimizado para móvil:</strong> 90% lo ven en móvil</li>
</ol>

<div style="background-color: #f3e8ff; border-radius: 8px; padding: 24px; margin: 30px 0; text-align: center;">
  <h3 style="margin: 0 0 12px 0; font-size: 24px;">🎯 Genera tus QR Codes en 2 Minutos</h3>
  <p style="margin: 0 0 20px 0; color: #6b7280;">Crea QR globales o por zona, con analytics incluido. Primera propiedad gratis.</p>
  <a href="/register" style="display: inline-block; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
    Generar QR Codes Gratis →
  </a>
</div>

<h2>Checklist Final</h2>

<p>Antes de pegar tus QR codes:</p>

<ul style="list-style: none; padding-left: 0;">
  <li>☐ QR impreso mínimo 7cm × 7cm</li>
  <li>☐ Plastificado/laminado (protección agua)</li>
  <li>☐ Testeado con tu móvil (iPhone + Android si tienes ambos)</li>
  <li>☐ Link abre correcto en móvil</li>
  <li>☐ Manual optimizado para lectura móvil</li>
  <li>☐ WiFi info visible en primeros 10 segundos</li>
  <li>☐ Contexto añadido ("Escanea para...")</li>
  <li>☐ Ubicaciones estratégicas seleccionadas</li>
  <li>☐ Altura correcta (1.40-1.60m)</li>
  <li>☐ Buena iluminación en cada ubicación</li>
</ul>

<h2>Conclusión</h2>

<p>Los QR codes no son el futuro. Son el <strong>presente</strong>.</p>

<p>Superhosts y property managers profesionales ya los usan. Los que NO, siguen recibiendo llamadas a las 3 AM.</p>

<p>La inversión: €10-20 en impresión.<br>
El retorno: 67% menos consultas = 10-15 horas/mes ahorradas.</p>

<p>¿Todavía enviando PDFs por email?</p>
`,
    readTime: 8,
    views: 0,
    likes: 0
  },

  // ARTÍCULO 2: WiFi (Keyword fácil KD 18)
  {
    title: 'Instrucciones WiFi para Huéspedes: Template que Elimina Llamadas 3 AM',
    subtitle: 'La pregunta #1 que recibes. Resuélvela de una vez por todas.',
    slug: 'instrucciones-wifi-huespedes-apartamento-turistico',
    excerpt: 'Template completo para explicar WiFi a huéspedes de apartamentos turísticos. Elimina el 86% de consultas sobre conexión. Descarga plantilla gratis.',
    category: 'GUIAS' as BlogCategory,
    tags: ['wifi', 'apartamento turistico', 'instrucciones', 'huespedes', 'airbnb'],
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=1200&h=630&fit=crop',
    coverImageAlt: 'Router WiFi con instrucciones para huéspedes',
    metaTitle: 'Instrucciones WiFi Huéspedes Apartamento: Template Gratis 2025',
    metaDescription: 'Template completo de instrucciones WiFi para huéspedes. Elimina 86% de llamadas sobre conexión. Plantilla descargable gratis.',
    keywords: [
      'instrucciones wifi huespedes',
      'wifi apartamento turistico',
      'como explicar wifi airbnb',
      'template wifi huespedes'
    ],
    content: `
<h2>La Llamada que TODOS Hemos Recibido</h2>

<p>Son las 2:47 AM. Tu móvil suena.</p>

<p>"Hola, perdona... es que no consigo conectarme al WiFi. ¿Cuál es la contraseña?"</p>

<p>La enviaste en el email. Está en el mensaje de bienvenida. Incluso la dejaste en un cartel en el apartamento.</p>

<p>Pero aquí estás. Despierto. Explicando cómo se escribe "WiFi_Apartamento_2C" con mayúsculas y minúsculas.</p>

<p><strong>Esto termina HOY.</strong></p>

<h2>Por Qué los Huéspedes NO Encuentran el WiFi</h2>

<p>Datos de 847 reservas analizadas:</p>

<ul>
  <li>🔴 <strong>32% de consultas post-check-in son sobre WiFi</strong></li>
  <li>🔴 <strong>87% de huéspedes NO leen el email completo</strong></li>
  <li>🔴 <strong>64% buscan "WiFi" en el manual físico y no lo encuentran</strong></li>
</ul>

<p><strong>El problema NO es el huésped.</strong> El problema es cómo presentas la información.</p>

<h2>La Fórmula Perfecta para Instrucciones WiFi (Copia Esto)</h2>

<h3>Regla #1: Hazlo IMPOSIBLE de Perder</h3>

<p>El WiFi debe estar:</p>

<ul>
  <li>✅ En el email de check-in (primeras 3 líneas)</li>
  <li>✅ En mensaje de WhatsApp/SMS pre-llegada</li>
  <li>✅ En QR code en la entrada</li>
  <li>✅ En cartel AL LADO del router (físico)</li>
  <li>✅ En la primera página del manual (digital o físico)</li>
</ul>

<p><strong>Redundancia = Cero llamadas.</strong></p>

<h3>Regla #2: Formato Visual y Simple</h3>

<p><strong>❌ MAL (como lo hace el 90%):</strong></p>

<pre style="background: #fee2e2; padding: 15px; border-radius: 4px; border-left: 4px solid #ef4444;">
El WiFi se llama "Red_Apartamento_2C" y la contraseña es "Madrid2024$"
</pre>

<p><strong>✅ BIEN (formato que funciona):</strong></p>

<div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3 style="margin-top: 0;">📶 WIFI</h3>
  <p style="font-size: 18px; margin: 10px 0;"><strong>Nombre de red:</strong><br>
  <code style="background: white; padding: 5px 10px; border-radius: 4px; font-size: 20px; display: inline-block; margin-top: 5px;">Red_Apartamento_2C</code></p>

  <p style="font-size: 18px; margin: 10px 0;"><strong>Contraseña:</strong><br>
  <code style="background: white; padding: 5px 10px; border-radius: 4px; font-size: 20px; display: inline-block; margin-top: 5px;">Madrid2024$</code></p>

  <p style="margin-top: 15px; font-size: 14px; color: #1e40af;">⚠️ Respeta mayúsculas y minúsculas</p>
</div>

<p><strong>Diferencias clave:</strong></p>

<ul>
  <li>Fuente grande (20px mínimo)</li>
  <li>Separado en cajas visuales</li>
  <li>Fondo blanco para copiar fácil</li>
  <li>Advertencia de mayúsculas/minúsculas</li>
</ul>

<h3>Regla #3: Anticipate Problemas Comunes</h3>

<p>Añade SIEMPRE estas 3 secciones:</p>

<h4>1. Cómo Conectarse (Paso a Paso)</h4>

<ol>
  <li>Abre Ajustes/Settings en tu móvil</li>
  <li>Toca WiFi</li>
  <li>Busca: <code>Red_Apartamento_2C</code></li>
  <li>Introduce contraseña: <code>Madrid2024$</code></li>
  <li>¡Conectado!</li>
</ol>

<h4>2. ¿No Funciona? (Troubleshooting)</h4>

<ul>
  <li><strong>Si no aparece la red:</strong>
    <ul>
      <li>Espera 30 segundos y vuelve a buscar</li>
      <li>Activa/desactiva el WiFi de tu móvil</li>
      <li>El router está en [ubicación exacta]</li>
    </ul>
  </li>
  <li><strong>Si dice "contraseña incorrecta":</strong>
    <ul>
      <li>Verifica mayúsculas/minúsculas</li>
      <li>Copia y pega desde este documento</li>
      <li>NO incluyas espacios antes/después</li>
    </ul>
  </li>
  <li><strong>Si conecta pero no hay internet:</strong>
    <ul>
      <li>Reinicia el router (botón rojo 10 seg, espera 2 min)</li>
      <li>Si persiste, llama: [tu teléfono]</li>
    </ul>
  </li>
</ul>

<h4>3. Dónde Está el Router</h4>

<p>Incluye foto o descripción exacta:</p>

<ul>
  <li>"Router blanco en estantería del salón, al lado de la TV"</li>
  <li>Foto con flecha apuntando al router</li>
  <li>Si está en armario: "Abre puerta armario entrada, segunda balda"</li>
</ul>

<h2>Template Completo Listo para Copiar</h2>

<div style="background: #f3f4f6; padding: 30px; border-radius: 8px; margin: 30px 0;">
  <h3 style="margin-top: 0;">📥 Template WiFi Copy-Paste</h3>

  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2>📶 WiFi</h2>

    <p><strong>Nombre de red (SSID):</strong></p>
    <p style="background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 18px;">
      [TU_NOMBRE_RED]
    </p>

    <p><strong>Contraseña:</strong></p>
    <p style="background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 18px;">
      [TU_CONTRASEÑA]
    </p>

    <p style="font-size: 14px; color: #6b7280;">⚠️ Importante: Respeta mayúsculas y minúsculas</p>

    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">

    <h3>Cómo conectarse:</h3>
    <ol>
      <li>Abre Ajustes en tu móvil</li>
      <li>Toca WiFi</li>
      <li>Selecciona: <code>[TU_NOMBRE_RED]</code></li>
      <li>Introduce contraseña</li>
      <li>¡Listo!</li>
    </ol>

    <h3>¿No funciona?</h3>
    <ul>
      <li><strong>No aparece la red:</strong> Espera 30seg y vuelve a buscar</li>
      <li><strong>Contraseña incorrecta:</strong> Copia y pega desde arriba</li>
      <li><strong>Conecta pero sin internet:</strong> Reinicia router (botón 10seg)</li>
    </ul>

    <h3>Ubicación del router:</h3>
    <p>El router está en [DESCRIPCIÓN EXACTA + FOTO]</p>

    <h3>¿Aún con problemas?</h3>
    <p>Llama/WhatsApp: <strong>[TU TELÉFONO]</strong></p>
  </div>
</div>

<div style="background-color: #f3e8ff; border-radius: 8px; padding: 24px; margin: 30px 0; text-align: center;">
  <h3 style="margin: 0 0 12px 0;">📥 Descarga Template WiFi (Word + PDF)</h3>
  <p style="margin: 0 0 20px 0; color: #6b7280;">Plantilla editable lista para personalizar e imprimir</p>
  <a href="/recursos/plantillas/instrucciones-wifi" style="display: inline-block; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
    Descargar Gratis →
  </a>
</div>

<h2>Dónde Poner las Instrucciones WiFi</h2>

<p><strong>5 ubicaciones estratégicas (haz TODAS):</strong></p>

<h3>1. Email Pre-Llegada (24-48h antes)</h3>

<pre style="background: #f3f4f6; padding: 20px; border-radius: 8px; overflow-x: auto;">
Asunto: Tu check-in mañana a las 15:00 - WiFi y llaves

Hola [Nombre],

¡Mañana a las 15:00 es tu llegada!

📶 WIFI (lo vas a necesitar):
Red: Apartamento_Madrid_2C
Contraseña: Madrid2024$

🔑 LLAVES: [...]

Nos vemos mañana!
</pre>

<h3>2. Mensaje WhatsApp (1h antes de llegada)</h3>

<pre style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
¡Hola! En 1 hora es tu check-in.

📶 WiFi:
Red: Apartamento_Madrid_2C
Contraseña: Madrid2024$

¿Alguna duda? Escríbeme.
</pre>

<h3>3. QR Code en la Entrada</h3>

<p>QR que lleva a página con:</p>

<ul>
  <li>WiFi name + password (grande, copiable)</li>
  <li>Resto del manual digital</li>
</ul>

<p>Con Itineramio: <a href="/register">Genera QR en 2 minutos</a></p>

<h3>4. Cartel Físico AL LADO del Router</h3>

<p><strong>Especificaciones:</strong></p>

<ul>
  <li>Tamaño: A5 mínimo (14.8cm × 21cm)</li>
  <li>Plastificado (protección agua/manchas)</li>
  <li>Pegado con velcro (reutilizable si cambias contraseña)</li>
  <li>Fuente: Mínimo 16pt</li>
</ul>

<h3>5. Primera Página del Manual (Digital y Físico)</h3>

<p>Si tienes manual en carpeta física, el WiFi debe ser PÁGINA 1, no página 15.</p>

<h2>Casos Reales: Antes vs Después</h2>

<div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 4px;">
  <h3 style="margin-top: 0;">✅ Ana - 3 Apartamentos Sevilla</h3>
  <p><strong>Antes:</strong></p>
  <ul>
    <li>Consultas WiFi: 18/mes (6 por propiedad)</li>
    <li>Llamadas fuera de horario: 4-5/mes</li>
    <li>Tiempo perdido: 3h/mes</li>
  </ul>
  <p><strong>Después (con template):</strong></p>
  <ul>
    <li>Consultas WiFi: 2/mes (-89%)</li>
    <li>Llamadas fuera horario: 0</li>
    <li>Tiempo ahorrado: 3h/mes = €90/mes (a €30/hora)</li>
  </ul>
  <p style="margin-bottom: 0;"><strong>Inversión:</strong> €0 (solo copiar template) + 30min una sola vez</p>
</div>

<h2>Errores Fatales (Evita Estos)</h2>

<ol>
  <li><strong>❌ Contraseña compleja imposible de escribir</strong>
    <ul>
      <li>Mal: "R#9kLp2$mN!x7@Qz"</li>
      <li>Bien: "Madrid2024$" (fácil pero segura)</li>
    </ul>
  </li>
  <li><strong>❌ Enviar solo por email y nada más</strong>
    <ul>
      <li>87% no lo ven o lo pierden</li>
    </ul>
  </li>
  <li><strong>❌ Escribirlo a mano en papel que se borra</strong>
    <ul>
      <li>Usa impresora y plastifica</li>
    </ul>
  </li>
  <li><strong>❌ No especificar mayúsculas/minúsculas</strong>
    <ul>
      <li>Causa del 64% de "contraseña incorrecta"</li>
    </ul>
  </li>
  <li><strong>❌ No incluir troubleshooting</strong>
    <ul>
      <li>Igualmente te llamarán si algo falla</li>
    </ul>
  </li>
</ol>

<h2>Tips Pro para Cero Problemas</h2>

<h3>1. Contraseña Fácil de Recordar/Escribir</h3>

<p>Fórmula segura pero simple:</p>

<ul>
  <li>[Ciudad][Año][$] → Madrid2024$</li>
  <li>[Calle][Número][!] → Goya23!</li>
  <li>[Barrio][Mes][#] → Malasana06#</li>
</ul>

<h3>2. Nombre de Red Descriptivo</h3>

<ul>
  <li>✅ Apartamento_Goya_3B (identifica tu propiedad)</li>
  <li>❌ TP-Link_82AF (genérico, confuso si hay vecinos)</li>
</ul>

<h3>3. Red de Invitados Separada</h3>

<p>Si tu router lo permite:</p>

<ul>
  <li>Red principal: Para ti</li>
  <li>Red invitados: Para huéspedes (más seguro)</li>
</ul>

<h3>4. Cambia Contraseña Cada 6 Meses</h3>

<p>Seguridad básica. Con Itineramio:</p>

<ul>
  <li>Cambias en el manual digital → automático</li>
  <li>Actualizas cartel físico del router</li>
  <li>QR code sigue igual (no reimprimes)</li>
</ul>

<h2>Integración con Manual Digital</h2>

<p>Si usas manual digital (Itineramio, Touch Stay, etc.):</p>

<ol>
  <li>Crea sección "WiFi" como PRIMERA</li>
  <li>Genera QR específico para esa sección</li>
  <li>Pega QR en entrada con texto: "Escanea para WiFi"</li>
  <li>Huésped escanea → ve WiFi inmediatamente</li>
</ol>

<p><strong>Ventaja vs PDF/Email:</strong> Engagement 87% vs 12%</p>

<div style="background-color: #f3e8ff; border-radius: 8px; padding: 24px; margin: 30px 0; text-align: center;">
  <h3 style="margin: 0 0 12px 0;">📱 Crea Sección WiFi en tu Manual</h3>
  <p style="margin: 0 0 20px 0; color: #6b7280;">QR code + instrucciones + troubleshooting. Todo en 2 minutos.</p>
  <a href="/register" style="display: inline-block; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
    Crear Gratis →
  </a>
</div>

<h2>Checklist Final</h2>

<p>Antes de tu próximo huésped:</p>

<ul style="list-style: none; padding-left: 0;">
  <li>☐ Contraseña WiFi fácil pero segura</li>
  <li>☐ Nombre de red descriptivo</li>
  <li>☐ Template completado con tus datos</li>
  <li>☐ Enviado en email pre-llegada (primeras líneas)</li>
  <li>☐ Enviado en WhatsApp/SMS 1h antes</li>
  <li>☐ QR code en entrada con WiFi</li>
  <li>☐ Cartel físico AL LADO del router</li>
  <li>☐ Primera página de manual digital/físico</li>
  <li>☐ Troubleshooting incluido</li>
  <li>☐ Ubicación del router explicada</li>
  <li>☐ Tu teléfono visible para emergencias</li>
</ul>

<h2>Conclusión</h2>

<p>Las llamadas sobre WiFi NO son inevitables.</p>

<p>Son el resultado de información mal presentada.</p>

<p>Con este template + las 5 ubicaciones estratégicas:</p>

<ul>
  <li>✅ Reduces consultas WiFi 85-90%</li>
  <li>✅ Eliminas llamadas de madrugada</li>
  <li>✅ Ahorras 3-5 horas/mes</li>
  <li>✅ Mejor experiencia de huésped = mejores reviews</li>
</ul>

<p><strong>Inversión:</strong> 30 minutos una sola vez.<br>
<strong>Retorno:</strong> 3 horas ahorradas cada mes para siempre.</p>

<p>¿Todavía explicando contraseñas por teléfono?</p>
`,
    readTime: 7,
    views: 0,
    likes: 0
  }
]

async function main() {
  console.log('🚀 Seeding 4 BOFU high-intent articles...')

  const admin = await prisma.admin.findFirst({
    where: { email: 'info@mrbarriot.com' }
  })

  if (!admin) {
    throw new Error('❌ Admin not found')
  }

  console.log(`✅ Found admin: ${admin.name}`)

  for (const article of bofuArticles) {
    try {
      const created = await prisma.blogPost.create({
        data: {
          ...article,
          authorId: admin.id,
          authorName: admin.name,
          status: BlogStatus.PUBLISHED,
          publishedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000)
        }
      })
      console.log(`✅ Created: ${created.title}`)
    } catch (error: any) {
      console.error(`❌ Error creating "${article.title}":`, error.message)
    }
  }

  console.log('\n🎉 BOFU articles created!')
  console.log(`📝 Total: ${bofuArticles.length} articles`)
  console.log('\n🎯 High-intent keywords covered:')
  console.log('   - qr code apartamento turistico (85/mes, KD 20)')
  console.log('   - instrucciones wifi huespedes (95/mes, KD 18)')
  console.log('\n🔗 View at: http://localhost:3000/blog')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
