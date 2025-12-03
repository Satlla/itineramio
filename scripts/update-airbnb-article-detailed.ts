/**
 * Script to update Airbnb article with detailed step-by-step instructions
 * Run with: npx tsx scripts/update-airbnb-article-detailed.ts
 */

import { prisma } from '../src/lib/prisma'

async function updateAirbnbArticle() {
  console.log('📝 Updating Airbnb article with detailed instructions...\n')

  try {
    await prisma.blogPost.update({
      where: { slug: 'mensajes-automaticos-airbnb' },
      data: {
        // Add cover image - we'll use a placeholder for now
        coverImage: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1200&h=630&fit=crop',
        coverImageAlt: 'Automatización de mensajes para Airbnb - Ilustración vectorial',
        content: `
<h2>¿Por qué automatizar mensajes en Airbnb?</h2>

<p>Como anfitrión de Airbnb, gestionar la comunicación con huéspedes puede consumir <strong>entre 3-6 horas semanales</strong>. Responder las mismas preguntas, enviar instrucciones de check-in, recordar normas de la casa... todo esto puede (y debe) automatizarse.</p>

<p>En esta guía encontrarás <strong>plantillas listas para usar</strong> que puedes configurar en Airbnb en menos de 10 minutos.</p>

<div style="background: #F7F7F7; border-left: 4px solid #FF5A5F; padding: 20px; margin: 30px 0; border-radius: 8px;">
  <p style="margin: 0;"><strong>💡 Tip Pro:</strong> Airbnb recomienda tener al menos 3 mensajes automáticos configurados para mejorar tu puntuación de host. Esto puede aumentar tu visibilidad en búsquedas hasta un 20%.</p>
</div>

<h2>⚙️ Cómo Configurar Mensajes Automáticos en Airbnb (Paso a Paso)</h2>

<p>Antes de ver las plantillas, vamos a aprender a configurar los mensajes en Airbnb. Sigue estos pasos:</p>

<h3>📍 Paso 1: Acceder a la configuración de mensajes</h3>

<ol style="line-height: 1.8;">
<li><strong>Inicia sesión en Airbnb</strong> → <a href="https://www.airbnb.es" target="_blank">airbnb.es</a></li>
<li>Haz clic en tu <strong>foto de perfil</strong> (arriba a la derecha)</li>
<li>Selecciona <strong>"Cuenta"</strong> en el menú desplegable</li>
<li>En el menú lateral izquierdo, ve a <strong>"Notificaciones"</strong></li>
<li>Busca la sección <strong>"Mensajes del anfitrión"</strong> o <strong>"Mensajes programados"</strong></li>
</ol>

<div style="background: #FFF8F5; border-left: 4px solid #FF5A5F; padding: 20px; margin: 30px 0; border-radius: 8px;">
  <p style="margin: 0; font-weight: 600;">⚠️ RUTA ALTERNATIVA (si no lo encuentras):</p>
  <p style="margin: 8px 0 0 0;">Panel de anfitrión → Anuncios → [Selecciona tu propiedad] → Comunicación con huéspedes → Mensajes programados</p>
</div>

<h3>📍 Paso 2: Crear un nuevo mensaje programado</h3>

<ol style="line-height: 1.8;">
<li>Haz clic en <strong>"Crear mensaje programado"</strong> o <strong>"+ Nuevo mensaje"</strong></li>
<li><strong>Selecciona el disparador (trigger)</strong>:
  <ul style="margin-top: 10px;">
    <li><code>Inmediatamente tras reserva</code> - Para confirmación</li>
    <li><code>X días antes del check-in</code> - Para instrucciones (recomendado: 2 días antes)</li>
    <li><code>El día del check-in</code> - Para recordatorio</li>
    <li><code>Durante la estancia</code> - Para mensaje de bienvenida</li>
    <li><code>X días antes del check-out</code> - Para recordatorio de salida (recomendado: 1 día antes)</li>
    <li><code>Después del check-out</code> - Para pedir review (recomendado: 1 día después)</li>
  </ul>
</li>
<li><strong>Escribe el asunto</strong> del mensaje (si aplica)</li>
<li><strong>Escribe o pega el contenido</strong> del mensaje (usa las plantillas de abajo)</li>
<li>Haz clic en <strong>"Guardar"</strong></li>
</ol>

<h3>📍 Paso 3: Usar contenido dinámico (variables)</h3>

<p>Airbnb permite personalizar automáticamente los mensajes con <strong>variables dinámicas</strong>. Esto hace que cada mensaje sea único para cada huésped sin trabajo extra.</p>

<p><strong>¿Por qué usar contenido dinámico?</strong></p>
<ul style="line-height: 1.8;">
<li>✅ <strong>Ahorra tiempo</strong>: No tienes que editar manualmente cada mensaje</li>
<li>✅ <strong>Evita errores</strong>: No te equivocarás de nombre, fecha o dirección</li>
<li>✅ <strong>Más profesional</strong>: Los mensajes personalizados generan más confianza</li>
<li>✅ <strong>Mejores reviews</strong>: Los huéspedes valoran la atención personalizada</li>
</ul>

<p><strong>Variables disponibles en Airbnb:</strong></p>

<div style="background: #F9F9F9; border: 2px solid #E0E0E0; border-radius: 12px; padding: 24px; margin: 30px 0;">
<table style="width: 100%; border-collapse: collapse;">
<thead>
<tr style="background: #F0F8FF;">
<th style="border: 1px solid #E0E0E0; padding: 12px; text-align: left;">Variable</th>
<th style="border: 1px solid #E0E0E0; padding: 12px; text-align: left;">Qué hace</th>
<th style="border: 1px solid #E0E0E0; padding: 12px; text-align: left;">Ejemplo</th>
</tr>
</thead>
<tbody>
<tr>
<td style="border: 1px solid #E0E0E0; padding: 12px;"><code>{{guest_first_name}}</code></td>
<td style="border: 1px solid #E0E0E0; padding: 12px;">Nombre del huésped</td>
<td style="border: 1px solid #E0E0E0; padding: 12px;">María</td>
</tr>
<tr style="background: #F9F9F9;">
<td style="border: 1px solid #E0E0E0; padding: 12px;"><code>{{check_in_date}}</code></td>
<td style="border: 1px solid #E0E0E0; padding: 12px;">Fecha de entrada</td>
<td style="border: 1px solid #E0E0E0; padding: 12px;">15 de marzo, 2025</td>
</tr>
<tr>
<td style="border: 1px solid #E0E0E0; padding: 12px;"><code>{{check_out_date}}</code></td>
<td style="border: 1px solid #E0E0E0; padding: 12px;">Fecha de salida</td>
<td style="border: 1px solid #E0E0E0; padding: 12px;">18 de marzo, 2025</td>
</tr>
<tr style="background: #F9F9F9;">
<td style="border: 1px solid #E0E0E0; padding: 12px;"><code>{{listing_name}}</code></td>
<td style="border: 1px solid #E0E0E0; padding: 12px;">Nombre de tu anuncio</td>
<td style="border: 1px solid #E0E0E0; padding: 12px;">Apartamento Centro Madrid</td>
</tr>
<tr>
<td style="border: 1px solid #E0E0E0; padding: 12px;"><code>{{listing_address}}</code></td>
<td style="border: 1px solid #E0E0E0; padding: 12px;">Dirección completa</td>
<td style="border: 1px solid #E0E0E0; padding: 12px;">Calle Gran Vía 23, 3B</td>
</tr>
<tr style="background: #F9F9F9;">
<td style="border: 1px solid #E0E0E0; padding: 12px;"><code>{{confirmation_code}}</code></td>
<td style="border: 1px solid #E0E0E0; padding: 12px;">Código de reserva</td>
<td style="border: 1px solid #E0E0E0; padding: 12px;">HMVBQ2W4X7</td>
</tr>
</tbody>
</table>
</div>

<p><strong>Cómo insertar variables en Airbnb:</strong></p>
<ol style="line-height: 1.8;">
<li>Cuando estés escribiendo el mensaje, busca el botón <strong>"Insertar"</strong> o <strong>"+"</strong></li>
<li>Selecciona la variable que quieres añadir</li>
<li>Se insertará automáticamente como <code>{{variable}}</code></li>
<li>Al enviar, Airbnb la reemplazará por el valor real de cada reserva</li>
</ol>

<div style="background: #FFF8F5; border-left: 4px solid #FF5A5F; padding: 20px; margin: 30px 0; border-radius: 8px;">
  <p style="margin: 0; font-weight: 600;">💡 Ejemplo de uso de variables:</p>
  <p style="margin: 8px 0 0 0;">En lugar de escribir "Hola María", escribe "Hola {{guest_first_name}}". Airbnb pondrá automáticamente el nombre correcto en cada mensaje.</p>
</div>

<h2>📨 Antes de la Llegada: Mensajes Pre-Check-in</h2>

<h3>1. Confirmación Inmediata (automático tras reserva confirmada)</h3>

<p><strong>Cuándo enviarlo:</strong> Inmediatamente después de que se confirme la reserva<br>
<strong>Objetivo:</strong> Generar confianza y anticipar info clave</p>

<div style="background: #FFF; border: 2px solid #E0E0E0; border-radius: 12px; padding: 24px; margin: 30px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">📋 PLANTILLA PARA COPIAR:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
¡Hola {{guest_first_name}}! 👋

¡Qué emoción recibirte en {{listing_name}}!

Tu reserva está confirmada para el {{check_in_date}} - {{check_out_date}}.

📍 Ubicación exacta: {{listing_address}}
🔑 Check-in: [Hora inicio] - [Hora fin]
🚪 Check-out: [Hora de salida]

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
Hola {{guest_first_name}},

¡Tu estancia empieza en 2 días! Aquí están las instrucciones de llegada:

🏠 DIRECCIÓN COMPLETA:
{{listing_address}}
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

¡Hasta en 2 días! 🎉

[Tu nombre]
</pre>
</div>

<h3>3. Recordatorio Day-Of (día de llegada)</h3>

<p><strong>Cuándo enviarlo:</strong> Mañana del día de check-in<br>
<strong>Objetivo:</strong> Recordatorio final y disponibilidad</p>

<div style="background: #FFF; border: 2px solid #E0E0E0; border-radius: 12px; padding: 24px; margin: 30px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">📋 PLANTILLA PARA COPIAR:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
¡Buenos días {{guest_first_name}}! ☀️

Recordatorio: Tu check-in es hoy a partir de las [Hora].

🔑 Código de acceso: [Código si aplica]
📍 Dirección: {{listing_address}}
🗺️ Google Maps: [Link]

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
Hola {{guest_first_name}},

¿Ya estás instalado/a? Espero que todo haya ido bien con la llegada.

✅ Si necesitas algo o algo no funciona, escríbeme sin dudarlo
📚 En el alojamiento encontrarás una guía con:
→ WiFi y contraseñas
→ Electrodomésticos (cómo funcionan)
→ Recomendaciones de la zona

🍽️ MIS FAVORITOS CERCA:
→ [Restaurante 1] - Cocina [tipo] - 5 min andando
→ [Supermercado] - [Dirección] - 3 min andando
→ [Cafetería/Bar] - Perfecto para desayunar

¡Que disfrutes! 🎉
</pre>
</div>

<h3>5. Recordatorio de Normas (opcional, si estancia larga)</h3>

<p><strong>Cuándo enviarlo:</strong> Día 3 de una estancia de 7+ días<br>
<strong>Objetivo:</strong> Recordar normas clave de forma amable</p>

<div style="background: #FFF; border: 2px solid #E0E0E0; border-radius: 12px; padding: 24px; margin: 30px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">📋 PLANTILLA PARA COPIAR:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Hola {{guest_first_name}},

¿Qué tal va todo? Espero que estés disfrutando 😊

Solo un recordatorio rápido:
♻️ La basura se saca en [ubicación contenedores] - [días recogida]
🔊 Horario de silencio: 22:00 - 08:00 (por los vecinos)
🚭 No fumar dentro del alojamiento

Si necesitas algo, aquí estoy.

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
Hola {{guest_first_name}},

Espero que hayas pasado unos días geniales 🌟

Recordatorio: Check-out mañana {{check_out_date}} antes de las [Hora].

📝 ANTES DE SALIR:
✓ [Instrucción 1: ej. Dejar llaves en...]
✓ [Instrucción 2: ej. Cerrar ventanas]
✓ [Instrucción 3: ej. Apagar luces/AC]
✓ NO hace falta limpiar ni lavar platos (se encarga mi equipo)

🚪 Simplemente cierra la puerta al salir

Si necesitas salir más tarde, avísame con antelación (cargo [X]€/hora extra si está disponible).

¡Buen viaje de vuelta! ✈️
</pre>
</div>

<h3>7. Agradecimiento + Request Review (día después)</h3>

<p><strong>Cuándo enviarlo:</strong> 24 horas después del check-out<br>
<strong>Objetivo:</strong> Conseguir review positiva de 5 estrellas</p>

<div style="background: #FFF; border: 2px solid #E0E0E0; border-radius: 12px; padding: 24px; margin: 30px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">📋 PLANTILLA PARA COPIAR (CON PERSUASIÓN 5 ⭐):</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
¡Hola {{guest_first_name}}!

Espero que hayas llegado bien a casa 🏡

Ha sido un placer tenerte como huésped. Si todo estuvo bien, ¿podrías dejarme una valoración en Airbnb? Significa mucho para mí y ayuda a otros viajeros a decidirse.

⭐ Solo toma 1 minuto

Por mi parte, ya te he dejado una valoración positiva 😊

---

📊 GUÍA RÁPIDA DE VALORACIONES EN AIRBNB:

⭐⭐⭐⭐⭐ (5 ESTRELLAS) = Todo bien
→ El alojamiento cumplía con lo anunciado
→ Las expectativas se han cumplido
→ El trato fue el esperado
→ Recomendarías el alojamiento

⭐⭐⭐⭐ (4 ESTRELLAS) = Algo importante no fue bien
→ Hubo algún problema significativo
→ El alojamiento no coincidía con las fotos
→ Faltaban servicios básicos prometidos
(Esto baja mucho mi puntuación media y puede afectar mi visibilidad)

⭐⭐⭐ (3 ESTRELLAS) = La estancia fue realmente mala
→ Varios problemas graves sin resolver
→ El alojamiento no era habitable
→ Servicio muy por debajo de lo esperado

---

Si todo estuvo como esperabas, las 5 estrellas son la puntuación correcta. Si hubo algo que no te gustó y puedo mejorar, por favor dímelo antes de la review. Me ayuda muchísimo a seguir mejorando como anfitrión.

¡Espero volver a verte pronto por [Ciudad]!

Un abrazo,
[Tu nombre]

P.D.: Si algo no cumplió tus expectativas, escríbeme primero. Quiero asegurarme de que todos mis huéspedes están 100% satisfechos.
</pre>
</div>

<div style="background: #FFF8F5; border-left: 4px solid #FF5A5F; padding: 20px; margin: 30px 0; border-radius: 8px;">
  <p style="margin: 0; font-weight: 600;">💡 ¿Por qué incluir la escala de valoraciones?</p>
  <p style="margin: 8px 0 0 0;">Muchos huéspedes no entienden el sistema de Airbnb. Para ellos, 4 estrellas es "muy bien". Pero en Airbnb, 4 estrellas baja tu media y puede hacerte perder el estatus de Superhost. Esta explicación educada les ayuda a entender que si todo estuvo bien, 5 estrellas es lo correcto.</p>
</div>

<h2>🎯 Checklist Final: ¿Qué mensajes configurar PRIMERO?</h2>

<p>Si solo tienes tiempo para configurar 3 mensajes (los más importantes), configura estos:</p>

<div style="background: #F0FDF4; border: 2px solid #86efac; border-radius: 12px; padding: 24px; margin: 30px 0;">
<ol style="line-height: 2; margin: 0;">
<li><strong>✅ Instrucciones 48h antes del check-in</strong> (el MÁS importante - evita 90% de mensajes)</li>
<li><strong>✅ Recordatorio check-out día anterior</strong> (evita salidas tardías)</li>
<li><strong>✅ Solicitud review 24h después</strong> (aumenta cantidad de reviews un 40%)</li>
</ol>
</div>

<p>Una vez configurados estos, añade poco a poco:</p>
<ul style="line-height: 1.8;">
<li>Confirmación inmediata post-reserva</li>
<li>Recordatorio día del check-in</li>
<li>Bienvenida tras llegada</li>
<li>Recordatorio normas (si estancias largas)</li>
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

<h3>¿Puedo personalizar cada mensaje antes de enviar?</h3>
<p>Sí, puedes editar cualquier mensaje automático antes de que se envíe si detectas una situación especial.</p>

<h3>¿Las variables se actualizan solas?</h3>
<p>Sí, Airbnb reemplaza automáticamente cada variable con la información real de cada reserva. Tú no tienes que hacer nada.</p>

<h3>¿Qué pasa si Airbnb cambia la interfaz?</h3>
<p>Airbnb actualiza su plataforma regularmente. Si no encuentras la opción de mensajes programados donde indicamos, busca en su Centro de Ayuda "scheduled messages" o contacta con su soporte. La funcionalidad siempre está disponible, solo puede cambiar de ubicación.</p>

<h3>¿Funcionan los mensajes en Booking.com también?</h3>
<p>Booking tiene un sistema diferente y más limitado. Mira nuestro artículo sobre <a href="/blog/mensajes-automaticos-booking">mensajes automáticos en Booking.com</a>.</p>

<hr style="margin: 60px 0; border: none; border-top: 2px solid #E0E0E0;">

<p style="text-align: center; color: #666; font-size: 14px;">
  <strong>¿Te ha sido útil esta guía?</strong> Compártela con otros anfitriones 💜
</p>
        `
      }
    })

    console.log('✅ Airbnb article updated with detailed instructions!')

    // Also update Booking article with image
    await prisma.blogPost.update({
      where: { slug: 'mensajes-automaticos-booking' },
      data: {
        coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=630&fit=crop',
        coverImageAlt: 'Automatización de mensajes para Booking.com - Ilustración vectorial'
      }
    })

    console.log('✅ Booking article updated with cover image!')

    console.log('\n🎉 Articles updated successfully!')

  } catch (error) {
    console.error('❌ Error updating articles:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateAirbnbArticle()
