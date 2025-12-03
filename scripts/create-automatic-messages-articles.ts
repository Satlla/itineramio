/**
 * Script to create automatic messages blog articles
 * Run with: npx tsx scripts/create-automatic-messages-articles.ts
 */

import { prisma } from '../src/lib/prisma'

async function createArticles() {
  console.log('📝 Creating automatic messages blog articles...\n')

  try {
    // Article 1: Airbnb Automatic Messages
    const airbnbArticle = await prisma.blogPost.upsert({
      where: { slug: 'mensajes-automaticos-airbnb' },
      update: {},
      create: {
        slug: 'mensajes-automaticos-airbnb',
        title: 'Mensajes Automáticos para Airbnb: Plantillas Copy-Paste 2025',
        subtitle: 'Ahorra 5+ horas semanales con estos mensajes automáticos profesionales listos para usar',
        excerpt: 'Plantillas profesionales y probadas de mensajes automáticos para antes, durante y después de la estancia en Airbnb. Copia, pega y personaliza en 2 minutos.',
        content: `
<h2>¿Por qué automatizar mensajes en Airbnb?</h2>

<p>Como anfitrión de Airbnb, gestionar la comunicación con huéspedes puede consumir <strong>entre 3-6 horas semanales</strong>. Responder las mismas preguntas, enviar instrucciones de check-in, recordar normas de la casa... todo esto puede (y debe) automatizarse.</p>

<p>En esta guía encontrarás <strong>plantillas listas para usar</strong> que puedes configurar en Airbnb en menos de 10 minutos.</p>

<div style="background: #F7F7F7; border-left: 4px solid #FF5A5F; padding: 20px; margin: 30px 0; border-radius: 8px;">
  <p style="margin: 0;"><strong>💡 Tip Pro:</strong> Airbnb recomienda tener al menos 3 mensajes automáticos configurados para mejorar tu puntuación de host. Esto puede aumentar tu visibilidad en búsquedas hasta un 20%.</p>
</div>

<h2>📨 Antes de la Llegada: Mensajes Pre-Check-in</h2>

<h3>1. Confirmación Inmediata (automático tras reserva confirmada)</h3>

<p><strong>Cuándo enviarlo:</strong> Inmediatamente después de que se confirme la reserva<br>
<strong>Objetivo:</strong> Generar confianza y anticipar info clave</p>

<div style="background: #FFF; border: 2px solid #E0E0E0; border-radius: 12px; padding: 24px; margin: 30px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">📋 PLANTILLA PARA COPIAR:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
¡Hola [Nombre]! 👋

¡Qué emoción recibirte en [Nombre del alojamiento]!

Tu reserva está confirmada para el [Fecha entrada] - [Fecha salida].

📍 Ubicación exacta: [Dirección completa]
🔑 Check-in: [Hora] - [Hora]
🚪 Check-out: [Hora]

🎁 Antes de tu llegada te enviaré:
→ Instrucciones detalladas de check-in
→ Guía del alojamiento con WiFi y servicios
→ Recomendaciones locales (restaurantes, transporte, etc.)

Si tienes alguna pregunta antes de llegar, ¡escríbeme! 😊

¡Nos vemos pronto!
[Tu nombre]
</pre>
</div>

<h3>2. Instrucciones de Check-in (24-48h antes)</h3>

<p><strong>Cuándo enviarlo:</strong> 48 horas antes del check-in<br>
<strong>Objetivo:</strong> Asegurar llegada sin problemas</p>

<div style="background: #FFF; border: 2px solid #E0E0E0; border-radius: 12px; padding: 24px; margin: 30px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">📋 PLANTILLA PARA COPIAR:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Hola [Nombre],

¡Tu estancia empieza mañana! Aquí están las instrucciones de llegada:

🏠 DIRECCIÓN COMPLETA:
[Calle, número, piso, puerta]
[Código postal, ciudad]

🗺️ Cómo llegar desde el aeropuerto:
[Opción 1: Transporte público - tiempo y precio]
[Opción 2: Taxi/Uber - tiempo y precio aprox]

🔑 INSTRUCCIONES DE CHECK-IN:
→ Hora de llegada: [Hora inicio] - [Hora fin]
→ [Paso 1 detallado para entrar]
→ [Paso 2 si hay código/cerradura]
→ [Paso 3 ubicación de llaves]

📱 WiFi:
Red: [Nombre WiFi]
Contraseña: [Password]

Si llegas fuera del horario o tienes problemas, llámame/escríbeme al [Teléfono].

¡Hasta mañana! 🎉

[Tu nombre]
</pre>
</div>

<h3>3. Recordatorio Day-Of (día de llegada)</h3>

<p><strong>Cuándo enviarlo:</strong> Mañana del día de check-in<br>
<strong>Objetivo:</strong> Recordatorio final y disponibilidad</p>

<div style="background: #FFF; border: 2px solid #E0E0E0; border-radius: 12px; padding: 24px; margin: 30px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">📋 PLANTILLA PARA COPIAR:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
¡Buenos días [Nombre]! ☀️

Recordatorio: Tu check-in es hoy a partir de las [Hora].

🔑 Código de acceso: [Código si aplica]
📍 Link de Google Maps: [URL]

Te he enviado las instrucciones completas ayer. Si no las encuentras o tienes dudas, avísame.

¡Nos vemos en unas horas! 😊
</pre>
</div>

<h2>🏠 Durante la Estancia: Comunicación Activa</h2>

<h3>4. Check-in de Bienvenida (2-4h después de llegada)</h3>

<p><strong>Cuándo enviarlo:</strong> 2-4 horas después del check-in estimado<br>
<strong>Objetivo:</strong> Asegurar que todo está bien</p>

<div style="background: #FFF; border: 2px solid #E0E0E0; border-radius: 12px; padding: 24px; margin: 30px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">📋 PLANTILLA PARA COPIAR:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Hola [Nombre],

¿Ya estáis instalados? Espero que todo haya ido bien con la llegada.

✅ Si necesitas algo o algo no funciona, escríbeme sin dudarlo
📚 En el alojamiento encontrarás una guía con:
→ WiFi y contraseñas
→ Electrodomésticos (cómo funcionan)
→ Recomendaciones de la zona

🍽️ MIS FAVORITOS CERCA:
→ [Restaurante 1] - Cocina [tipo] - 5 min andando
→ [Supermercado] - [Dirección] - 3 min andando
→ [Cafetería/Bar] - Perfecto para desayunar

¡Que disfrutéis! 🎉
</pre>
</div>

<h3>5. Recordatorio de Normas (opcional, si estancia larga)</h3>

<p><strong>Cuándo enviarlo:</strong> Día 3 de una estancia de 7+ días<br>
<strong>Objetivo:</strong> Recordar normas clave de forma amable</p>

<div style="background: #FFF; border: 2px solid #E0E0E0; border-radius: 12px; padding: 24px; margin: 30px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">📋 PLANTILLA PARA COPIAR:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Hola [Nombre],

¿Qué tal va todo? Espero que estéis disfrutando 😊

Solo un recordatorio rápido:
♻️ La basura se saca en [ubicación contenedores] - [días recogida]
🔊 Horario de silencio: 22:00 - 08:00 (por los vecinos)
🚭 No fumar dentro del alojamiento

Si necesitáis algo, aquí estoy.

¡A seguir disfrutando! ✨
</pre>
</div>

<h2>👋 Después del Check-out: Fidelización</h2>

<h3>6. Recordatorio de Check-out (noche anterior)</h3>

<p><strong>Cuándo enviarlo:</strong> Tarde/noche antes del check-out<br>
<strong>Objetivo:</strong> Evitar salidas tardías y problemas</p>

<div style="background: #FFF; border: 2px solid #E0E0E0; border-radius: 12px; padding: 24px; margin: 30px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">📋 PLANTILLA PARA COPIAR:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Hola [Nombre],

Espero que hayáis pasado unos días geniales 🌟

Recordatorio: Check-out mañana antes de las [Hora].

📝 ANTES DE SALIR:
✓ [Instrucción 1: ej. Dejar llaves en...]
✓ [Instrucción 2: ej. Cerrar ventanas]
✓ [Instrucción 3: ej. Apagar luces/AC]
✓ NO hace falta limpiar ni lavar platos (se encarga mi equipo)

🚪 Simplemente cerrad la puerta al salir

Si necesitáis salir más tarde, avisadme con antelación (cargo [X]€/hora extra si está disponible).

¡Buen viaje de vuelta! ✈️
</pre>
</div>

<h3>7. Agradecimiento + Request Review (día después)</h3>

<p><strong>Cuándo enviarlo:</strong> 24 horas después del check-out<br>
<strong>Objetivo:</strong> Conseguir review positiva</p>

<div style="background: #FFF; border: 2px solid #E0E0E0; border-radius: 12px; padding: 24px; margin: 30px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">📋 PLANTILLA PARA COPIAR:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
¡Hola [Nombre]!

Espero que hayáis llegado bien a casa 🏡

Ha sido un placer teneros como huéspedes. Si todo estuvo bien, ¿podrías dejarme una valoración en Airbnb? Significa mucho para mí y ayuda a otros viajeros a decidirse.

⭐ Solo toma 1 minuto: [Link directo a dejar review si es posible]

Por mi parte, ya os he dejado una valoración positiva 😊

¡Espero volver a veros pronto por [Ciudad]!

Un abrazo,
[Tu nombre]

P.D.: Si hubo algo que no te gustó o crees que puedo mejorar, por favor dímelo antes de la review. Me ayuda muchísimo a mejorar como anfitrión.
</pre>
</div>

<h2>⚙️ Cómo Configurar Mensajes Automáticos en Airbnb</h2>

<p>Sigue estos pasos para configurar tus mensajes:</p>

<ol style="line-height: 1.8;">
<li><strong>Entra en tu panel de Airbnb</strong> → Menu → Anuncios → [Selecciona tu propiedad]</li>
<li><strong>Ve a "Mensajería"</strong> o "Inbox"</li>
<li>Busca <strong>"Mensajes programados"</strong> o "Scheduled Messages"</li>
<li><strong>Crea un nuevo mensaje</strong>:
  <ul>
    <li>Elige el disparador (trigger): "Tras reserva confirmada", "X días antes del check-in", etc.</li>
    <li>Copia y pega una de las plantillas de arriba</li>
    <li>Personaliza con tus datos específicos</li>
    <li>Guarda y activa</li>
  </ul>
</li>
<li><strong>Repite para cada mensaje</strong></li>
</ol>

<div style="background: #FFF8F5; border-left: 4px solid #FF5A5F; padding: 20px; margin: 30px 0; border-radius: 8px;">
  <p style="margin: 0; font-weight: 600;">⚠️ IMPORTANTE:</p>
  <p style="margin: 8px 0 0 0;">Airbnb puede cambiar su interfaz. Si no encuentras la opción de mensajes programados, busca en su Centro de Ayuda "scheduled messages" o contacta con su soporte.</p>
</div>

<h2>🎯 Próximo Paso: Automatiza Aún Más</h2>

<p>Los mensajes automáticos son solo el principio. Para una automatización completa:</p>

<ul style="line-height: 1.8;">
<li>✅ <strong>Manual Digital</strong>: Crea un manual web con toda la info del alojamiento (<a href="/register">prueba Itineramio gratis</a>)</li>
<li>✅ <strong>Check-in Automático</strong>: Cerraduras inteligentes con códigos temporales</li>
<li>✅ <strong>Precios Dinámicos</strong>: Herramientas como PriceLabs o Beyond Pricing</li>
<li>✅ <strong>Limpieza Coordinada</strong>: Apps como TurnoverBnB o Properly</li>
</ul>

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 40px; margin: 50px 0; text-align: center; color: white;">
  <h3 style="color: white; margin-top: 0; font-size: 28px;">¿Quieres un Manual Digital Automático?</h3>
  <p style="font-size: 18px; margin: 20px 0;">Crea tu manual en 5 minutos. Incluye WiFi, check-in, normas y más. QR automático.</p>
  <a href="/register" style="display: inline-block; background: white; color: #667eea; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin-top: 10px;">
    Probar Gratis 15 Días →
  </a>
  <p style="font-size: 14px; margin-top: 16px; opacity: 0.9;">Sin tarjeta de crédito · Setup en 5 minutos</p>
</div>

<h2>❓ Preguntas Frecuentes</h2>

<h3>¿Cuántos mensajes automáticos debería tener?</h3>
<p>Mínimo 3: confirmación post-reserva, instrucciones 48h antes, y recordatorio de check-out. Lo ideal son 5-7 para cubrir todo el journey.</p>

<h3>¿Los mensajes automáticos afectan mi rating?</h3>
<p>Sí, positivamente. Airbnb valora la comunicación proactiva. Hosts con mensajes automáticos suelen tener 15-20% más reviews de 5 estrellas.</p>

<h3>¿Puedo personalizar cada mensaje?</h3>
<p>Sí, puedes editar cualquier mensaje automático antes de que se envíe si detectas una situación especial.</p>

<h3>¿Funcionan los mensajes en Booking.com también?</h3>
<p>Sí, pero la configuración es diferente. Mira nuestro artículo sobre <a href="/blog/mensajes-automaticos-booking">mensajes automáticos en Booking.com</a>.</p>

<hr style="margin: 60px 0; border: none; border-top: 2px solid #E0E0E0;">

<p style="text-align: center; color: #666; font-size: 14px;">
  <strong>¿Te ha sido útil esta guía?</strong> Compártela con otros anfitriones 💜
</p>
        `,
        coverImage: null,
        coverImageAlt: null,
        category: 'AUTOMATIZACION',
        tags: ['airbnb', 'mensajes automáticos', 'plantillas', 'automatización', 'comunicación', 'huéspedes'],
        featured: true,
        metaTitle: 'Mensajes Automáticos Airbnb: 7 Plantillas Copy-Paste (2025)',
        metaDescription: 'Plantillas profesionales de mensajes automáticos para Airbnb. Copia, pega y configura en 10 minutos. Ahorra 5+ horas semanales en comunicación con huéspedes.',
        keywords: [
          'mensajes automáticos airbnb',
          'plantillas airbnb',
          'airbnb mensajes programados',
          'automatizar airbnb',
          'comunicación huéspedes',
          'airbnb host tips',
          'mensajes check-in airbnb'
        ],
        status: 'PUBLISHED',
        publishedAt: new Date(),
        authorId: 'admin',
        authorName: 'Alejandro Satllé',
        authorImage: null,
        readTime: 12,
        views: 0,
        likes: 0
      }
    })

    console.log('✅ Article 1 created: mensajes-automaticos-airbnb')

    // Article 2: Booking.com Automatic Messages
    const bookingArticle = await prisma.blogPost.upsert({
      where: { slug: 'mensajes-automaticos-booking' },
      update: {},
      create: {
        slug: 'mensajes-automaticos-booking',
        title: 'Mensajes Automáticos para Booking.com: Plantillas Profesionales 2025',
        subtitle: 'Configura mensajes automáticos en Booking.com y ahorra tiempo mientras mejoras tu puntuación',
        excerpt: 'Guía completa con plantillas listas para usar de mensajes automáticos en Booking.com. Antes, durante y después de la estancia. Fácil configuración.',
        content: `
<h2>¿Por qué automatizar mensajes en Booking.com?</h2>

<p>Booking.com es la plataforma con <strong>mayor volumen de reservas a nivel mundial</strong>, pero también la que más gestión de comunicación requiere. Los huéspedes de Booking suelen tener más preguntas y expectativas diferentes a Airbnb.</p>

<p>Automatizar tus mensajes en Booking.com te permite:</p>

<ul style="line-height: 1.8;">
<li>✅ <strong>Mejorar tu Puntuación de Anfitrión</strong>: La comunicación rápida y clara aumenta tu review score</li>
<li>✅ <strong>Ahorrar 4-7 horas semanales</strong>: Deja de responder las mismas preguntas una y otra vez</li>
<li>✅ <strong>Reducir cancelaciones</strong>: Información clara reduce dudas y cancelaciones de última hora</li>
<li>✅ <strong>Aumentar reviews positivas</strong>: Huéspedes informados = huéspedes satisfechos</li>
</ul>

<div style="background: #F0F8FF; border-left: 4px solid #003580; padding: 20px; margin: 30px 0; border-radius: 8px;">
  <p style="margin: 0;"><strong>💡 Dato Booking.com:</strong> Propiedades que responden en menos de 24 horas tienen un 23% más de probabilidad de recibir reviews de 9+/10.</p>
</div>

<h2>📨 Antes de la Llegada: Mensajes Pre-Check-in</h2>

<h3>1. Confirmación Inmediata (tras reserva confirmada)</h3>

<p><strong>Cuándo enviarlo:</strong> Inmediatamente después de confirmar la reserva<br>
<strong>Objetivo:</strong> Tranquilizar al huésped y dar primeras instrucciones</p>

<div style="background: #FFF; border: 2px solid #E0E0E0; border-radius: 12px; padding: 24px; margin: 30px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">📋 PLANTILLA PARA COPIAR:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Estimado/a [Nombre del huésped],

¡Muchas gracias por elegirnos! 🎉

Su reserva está confirmada:

📅 Entrada: [Fecha] a partir de las [Hora check-in]
📅 Salida: [Fecha] hasta las [Hora check-out]
🏠 [Nombre de la propiedad]
📍 [Dirección completa]

Próximos pasos:
→ 48 horas antes de su llegada le enviaré instrucciones detalladas de check-in
→ Incluiré códigos de acceso y mapa de ubicación exacta
→ También recibirá información sobre WiFi y servicios

¿Alguna pregunta? Puede contactarme en cualquier momento.

Un cordial saludo,
[Su nombre]
[Teléfono de contacto]
</pre>
</div>

<h3>2. Instrucciones Detalladas de Check-in (48h antes)</h3>

<p><strong>Cuándo enviarlo:</strong> 48 horas antes de la llegada<br>
<strong>Objetivo:</strong> Dar toda la información necesaria para una llegada sin problemas</p>

<div style="background: #FFF; border: 2px solid #E0E0E0; border-radius: 12px; padding: 24px; margin: 30px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">📋 PLANTILLA PARA COPIAR:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Estimado/a [Nombre],

Su estancia comienza en 2 días. Aquí tiene toda la información necesaria:

🏠 DIRECCIÓN EXACTA Y ACCESO:
Dirección: [Calle completa, número, piso, puerta]
Código postal: [CP]
Ciudad: [Ciudad]

Google Maps: [Link directo]

🚗 CÓMO LLEGAR:
• Desde el aeropuerto: [Opción transporte público - duración y precio]
• Taxi/Uber: Aproximadamente [X]€ y [Y] minutos
• Parking: [Si hay parking, dar detalles o alternativas cercanas]

🔑 INSTRUCCIONES DE ENTRADA:
[Paso 1: Ej. "Al llegar al edificio, pulse el portero automático piso [X]"]
[Paso 2: Ej. "El código de la puerta del edificio es: [XXXX]"]
[Paso 3: Ej. "Su apartamento está en la [ubicación]. Código cerradura: [YYYY]"]
[Paso 4: Ej. "O bien, las llaves están en el buzón [número]. Código buzón: [ZZZZ]"]

📶 INFORMACIÓN WIFI:
Nombre de red: [SSID]
Contraseña: [Password]

⏰ HORARIOS:
Check-in: A partir de las [hora] el [fecha]
Check-out: Hasta las [hora] el [fecha]

Si su llegada se retrasa o tiene algún problema, llámeme al [teléfono] o escríbame por aquí.

¡Hasta pronto!
[Su nombre]
</pre>
</div>

<h3>3. Recordatorio Day-Of (mañana de llegada)</h3>

<p><strong>Cuándo enviarlo:</strong> Mañana del día de check-in (8-10 AM)<br>
<strong>Objetivo:</strong> Recordatorio final y disponibilidad inmediata</p>

<div style="background: #FFF; border: 2px solid #E0E0E0; border-radius: 12px; padding: 24px; margin: 30px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">📋 PLANTILLA PARA COPIAR:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Buenos días [Nombre],

¡Su check-in es hoy! 🎉

Recordatorio:
📍 Dirección: [Dirección]
🔑 Código de acceso: [Código]
⏰ Puede entrar a partir de las [hora]

Instrucciones completas: [Link o referencia al mensaje anterior]

Estaré disponible en el [teléfono] si necesita cualquier cosa.

¡Bienvenido/a!
</pre>
</div>

<h2>🏠 Durante la Estancia: Comunicación y Soporte</h2>

<h3>4. Mensaje de Bienvenida (2-3h después del check-in)</h3>

<p><strong>Cuándo enviarlo:</strong> 2-3 horas después de la hora de check-in estimada<br>
<strong>Objetivo:</strong> Confirmar que todo está bien y ofrecer ayuda</p>

<div style="background: #FFF; border: 2px solid #E0E0E0; border-radius: 12px; padding: 24px; margin: 30px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">📋 PLANTILLA PARA COPIAR:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Hola [Nombre],

Espero que hayan llegado bien y estén cómodamente instalados.

Si hay algo que no funciona correctamente o necesitan cualquier información adicional, no duden en contactarme. Respondo rápidamente.

📚 Información útil:
• WiFi: [Red] / [Contraseña]
• [Info electrodomésticos clave si es necesario]
• Basura: [Ubicación contenedores y horarios]

🍽️ Recomendaciones cercanas:
• Supermercado: [Nombre] - [Dirección] (5 min a pie)
• Restaurantes: [2-3 recomendaciones con tipo de cocina]
• [Otro servicio útil: farmacia, cajero, etc.]

¡Que disfruten de su estancia! 😊

Saludos,
[Su nombre]
</pre>
</div>

<h3>5. Información de la Zona (opcional, primer día)</h3>

<p><strong>Cuándo enviarlo:</strong> Tarde del primer día<br>
<strong>Objetivo:</strong> Dar valor extra con info local</p>

<div style="background: #FFF; border: 2px solid #E0E0E0; border-radius: 12px; padding: 24px; margin: 30px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">📋 PLANTILLA PARA COPIAR:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Hola [Nombre],

Por si les resulta útil, aquí hay algunas recomendaciones de [Ciudad/Barrio]:

🎭 QUÉ VER Y HACER:
• [Atracción 1]: [Breve descripción + cómo llegar]
• [Atracción 2]: [Breve descripción + cómo llegar]
• [Actividad especial]: [Info relevante]

🍴 DÓNDE COMER:
• [Restaurante local favorito 1]: [Tipo cocina + precio aprox]
• [Restaurante 2]: [Tipo cocina + precio aprox]
• [Cafetería/Brunch]: [Descripción]

🚇 TRANSPORTE:
• Metro más cercano: [Estación] - [minutos a pie]
• Autobús: Línea [X] para en [ubicación]
• [App recomendada de transporte o taxi]

Si necesitan más info específica sobre algo, ¡pregúntenme!

Saludos,
[Su nombre]
</pre>
</div>

<h2>👋 Después del Check-out: Review y Fidelización</h2>

<h3>6. Recordatorio de Check-out (día anterior)</h3>

<p><strong>Cuándo enviarlo:</strong> Tarde/noche antes del check-out<br>
<strong>Objetivo:</strong> Recordar hora de salida y procedimiento</p>

<div style="background: #FFF; border: 2px solid #E0E0E0; border-radius: 12px; padding: 24px; margin: 30px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">📋 PLANTILLA PARA COPIAR:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Hola [Nombre],

Espero que hayan disfrutado de su estancia en [Ciudad] 🌟

Recordatorio: El check-out es mañana [fecha] antes de las [hora].

📝 ANTES DE SALIR, POR FAVOR:
✓ [Instrucción 1: Ej. "Dejar las llaves en la mesa"]
✓ [Instrucción 2: Ej. "Apagar aire acondicionado/calefacción"]
✓ [Instrucción 3: Ej. "Cerrar todas las ventanas"]
✓ [Instrucción 4: Ej. "Cerrar la puerta principal al salir"]

No es necesario limpiar ni hacer las camas, mi equipo se encarga.

Si necesitan salir más tarde, avísenme con tiempo. Según disponibilidad, puede ser posible por un pequeño cargo adicional.

¡Buen viaje de regreso! ✈️

Saludos,
[Su nombre]
</pre>
</div>

<h3>7. Agradecimiento + Solicitud de Review (24h después)</h3>

<p><strong>Cuándo enviarlo:</strong> 24-48 horas después del check-out<br>
<strong>Objetivo:</strong> Conseguir una valoración positiva en Booking</p>

<div style="background: #FFF; border: 2px solid #E0E0E0; border-radius: 12px; padding: 24px; margin: 30px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">📋 PLANTILLA PARA COPIAR:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Estimado/a [Nombre],

Espero que hayan llegado bien a casa y que guarden un buen recuerdo de su estancia en [Ciudad].

Ha sido un placer tenerles como huéspedes. El apartamento quedó en perfecto estado, muchas gracias por cuidarlo tan bien.

Le escribo para pedirle un favor: si su experiencia fue positiva, ¿podría dejar una valoración en Booking.com? Su opinión es muy importante para mí y ayuda a otros viajeros a decidirse.

⭐ Puede dejar su review aquí: [Si Booking permite, incluir link directo o simplemente indicar que recibirán email de Booking]

Si hubo algo que no cumplió sus expectativas, me encantaría saberlo antes para poder mejorar.

Gracias de nuevo por su confianza. ¡Serán siempre bienvenidos si vuelven a [Ciudad]!

Un cordial saludo,
[Su nombre]
[Nombre de la propiedad]
</pre>
</div>

<h2>⚙️ Cómo Configurar Mensajes Automáticos en Booking.com</h2>

<p>A diferencia de Airbnb, Booking.com tiene un sistema de mensajería más limitado. Aquí te explicamos cómo configurarlo:</p>

<h3>Opción 1: Mensajes Automatizados de Booking.com (Limitado)</h3>

<ol style="line-height: 1.8;">
<li><strong>Accede a tu Extranet</strong> de Booking.com</li>
<li>Ve a <strong>"Inbox"</strong> → <strong>"Mensajes"</strong></li>
<li>Busca <strong>"Automated messages"</strong> o "Mensajes automatizados"</li>
<li><strong>Configura plantillas predefinidas</strong>:
  <ul>
    <li>Pre-arrival message (48h antes)</li>
    <li>Check-in instructions (día de llegada)</li>
    <li>Check-out reminder (día antes de salida)</li>
  </ul>
</li>
</ol>

<div style="background: #FFF8F5; border-left: 4px solid #003580; padding: 20px; margin: 30px 0; border-radius: 8px;">
  <p style="margin: 0; font-weight: 600;">⚠️ LIMITACIÓN DE BOOKING:</p>
  <p style="margin: 8px 0 0 0;">Booking.com no permite tanta personalización como Airbnb en mensajes automáticos. Muchos hosts usan herramientas de terceros (ver más abajo).</p>
</div>

<h3>Opción 2: Respuestas Rápidas (Quick Replies)</h3>

<p>Booking permite crear "respuestas rápidas" que puedes usar con un clic:</p>

<ol style="line-height: 1.8;">
<li>En el <strong>Inbox</strong>, ve a <strong>"Configuración"</strong></li>
<li>Busca <strong>"Respuestas rápidas"</strong> o "Quick replies"</li>
<li>Crea plantillas para preguntas frecuentes</li>
<li>Cuando recibas un mensaje, haz clic en la respuesta rápida</li>
</ol>

<h3>Opción 3: Herramientas de Channel Manager (Recomendado)</h3>

<p>Si gestionas varias propiedades o quieres automatización completa, usa un <strong>channel manager</strong>:</p>

<ul style="line-height: 1.8;">
<li><strong>Hospitable</strong> - Automatización de mensajes multi-plataforma</li>
<li><strong>Guesty</strong> - PMS completo con mensajería automatizada</li>
<li><strong>Hostfully</strong> - Especializado en mensajes personalizados</li>
<li><strong>Your Porter</strong> - Automatización + guías digitales</li>
</ul>

<h2>📊 Diferencias clave: Booking vs Airbnb</h2>

<table style="width: 100%; border-collapse: collapse; margin: 30px 0;">
<thead>
<tr style="background: #F0F8FF;">
<th style="border: 1px solid #E0E0E0; padding: 12px; text-align: left;">Aspecto</th>
<th style="border: 1px solid #E0E0E0; padding: 12px; text-align: left;">Booking.com</th>
<th style="border: 1px solid #E0E0E0; padding: 12px; text-align: left;">Airbnb</th>
</tr>
</thead>
<tbody>
<tr>
<td style="border: 1px solid #E0E0E0; padding: 12px;">Tono de mensajes</td>
<td style="border: 1px solid #E0E0E0; padding: 12px;">Más formal, profesional</td>
<td style="border: 1px solid #E0E0E0; padding: 12px;">Casual, cercano, informal</td>
</tr>
<tr style="background: #F9F9F9;">
<td style="border: 1px solid #E0E0E0; padding: 12px;">Configuración automática</td>
<td style="border: 1px solid #E0E0E0; padding: 12px;">Limitada (3-4 mensajes predefinidos)</td>
<td style="border: 1px solid #E0E0E0; padding: 12px;">Completa (ilimitados)</td>
</tr>
<tr>
<td style="border: 1px solid #E0E0E0; padding: 12px;">Expectativas huésped</td>
<td style="border: 1px solid #E0E0E0; padding: 12px;">Servicio tipo hotel, más exigente</td>
<td style="border: 1px solid #E0E0E0; padding: 12px;">Experiencia local, flexible</td>
</tr>
<tr style="background: #F9F9F9;">
<td style="border: 1px solid #E0E0E0; padding: 12px;">Tiempo de respuesta esperado</td>
<td style="border: 1px solid #E0E0E0; padding: 12px;">< 24 horas (recomendado < 2h)</td>
<td style="border: 1px solid #E0E0E0; padding: 12px;">< 1 hora ideal</td>
</tr>
</tbody>
</table>

<h2>💡 Tips Pro para Mensajes en Booking</h2>

<ul style="line-height: 1.8;">
<li><strong>Usa un tono más formal</strong> que en Airbnb (menos emojis, más "usted/ustedes")</li>
<li><strong>Sé muy específico con horarios e instrucciones</strong>: Los huéspedes de Booking suelen ser menos flexibles</li>
<li><strong>Incluye SIEMPRE un teléfono de contacto</strong>: Es lo que más valoran</li>
<li><strong>Destaca servicios tipo hotel</strong> si los tienes (recepción de paquetes, late check-in, etc.)</li>
<li><strong>Responde MUY rápido</strong>: Booking penaliza mucho el tiempo de respuesta en su algoritmo</li>
</ul>

<div style="background: linear-gradient(135deg, #003580 0%, #0057B8 100%); border-radius: 16px; padding: 40px; margin: 50px 0; text-align: center; color: white;">
  <h3 style="color: white; margin-top: 0; font-size: 28px;">¿Quieres Automatizar al Máximo?</h3>
  <p style="font-size: 18px; margin: 20px 0;">Crea un manual digital con QR. Los huéspedes acceden instantáneamente a toda la info.</p>
  <a href="/register" style="display: inline-block; background: white; color: #003580; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin-top: 10px;">
    Prueba Itineramio Gratis →
  </a>
  <p style="font-size: 14px; margin-top: 16px; opacity: 0.9;">Setup en 5 minutos · Compatible con Booking y Airbnb</p>
</div>

<h2>❓ Preguntas Frecuentes</h2>

<h3>¿Puedo usar emojis en Booking.com?</h3>
<p>Sí, pero con moderación. El público de Booking es más variado internacionalmente y puede incluir clientes corporativos. Un par de emojis positivos está bien, pero no abuses.</p>

<h3>¿Los mensajes automáticos mejoran mi ranking en Booking?</h3>
<p>Indirectamente sí. Booking valora mucho el tiempo de respuesta y la satisfacción del cliente. Mensajes claros y proactivos = menos problemas = mejores reviews = mejor posicionamiento.</p>

<h3>¿Cuál es el mejor momento para pedir una review?</h3>
<p>24-48 horas después del check-out. Booking ya envía un email automático para solicitar review, pero un mensaje personal tuyo aumenta las probabilidades de que lo completen.</p>

<h3>¿Necesito un Channel Manager para automatizar?</h3>
<p>No es obligatorio si solo tienes 1-2 propiedades y usas las plantillas manuales. Pero si tienes 3+ propiedades o muchas reservas, un Channel Manager ahorra muchísimo tiempo y es rentable.</p>

<hr style="margin: 60px 0; border: none; border-top: 2px solid #E0E0E0;">

<p style="text-align: center; color: #666; font-size: 14px;">
  <strong>Artículos relacionados:</strong>
  <a href="/blog/mensajes-automaticos-airbnb">Mensajes Automáticos para Airbnb</a>
</p>
        `,
        coverImage: null,
        coverImageAlt: null,
        category: 'AUTOMATIZACION',
        tags: ['booking.com', 'mensajes automáticos', 'plantillas', 'automatización', 'comunicación', 'extranet'],
        featured: true,
        metaTitle: 'Mensajes Automáticos Booking.com: Plantillas Profesionales 2025',
        metaDescription: 'Plantillas listas para usar de mensajes automáticos en Booking.com. Configura comunicación profesional y ahorra tiempo. Guía completa con ejemplos.',
        keywords: [
          'mensajes automáticos booking',
          'plantillas booking.com',
          'booking extranet mensajes',
          'automatizar booking',
          'comunicación huéspedes booking',
          'booking host tips',
          'mensajes programados booking'
        ],
        status: 'PUBLISHED',
        publishedAt: new Date(),
        authorId: 'admin',
        authorName: 'Alejandro Satllé',
        authorImage: null,
        readTime: 14,
        views: 0,
        likes: 0
      }
    })

    console.log('✅ Article 2 created: mensajes-automaticos-booking\n')

    console.log('🎉 Both articles created successfully!')
    console.log('\n📍 URLs:')
    console.log(`   → http://localhost:3000/blog/mensajes-automaticos-airbnb`)
    console.log(`   → http://localhost:3000/blog/mensajes-automaticos-booking`)
    console.log('\nOnce deployed to production:')
    console.log(`   → https://www.itineramio.com/blog/mensajes-automaticos-airbnb`)
    console.log(`   → https://www.itineramio.com/blog/mensajes-automaticos-booking`)

  } catch (error) {
    console.error('❌ Error creating articles:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createArticles()
