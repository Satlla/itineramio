import { prisma } from '../src/lib/prisma'

async function restoreAirbnbArticle() {
  console.log('🔧 Restaurando artículo completo de Airbnb con todas las plantillas...\n')

  const completeContent = `
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

<h3>2. Instrucciones de Check-In (24-48h antes)</h3>

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

<h3>3. Recordatorio el Día de Llegada (día de llegada)</h3>

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

<h3>4. Bienvenida tras Check-In (2-4h después de llegada)</h3>

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

<h3>6. Recordatorio de Check-Out (noche anterior)</h3>

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

<h3>7. Agradecimiento + Petición de Review (día después)</h3>

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

<h2>⚙️ Cómo Configurar Mensajes Automáticos en Airbnb (Paso a Paso)</h2>

<p>Airbnb llama a estos mensajes <strong>"Respuestas rápidas programadas"</strong>. Te permiten ahorrar tiempo enviando mensajes automáticamente según eventos específicos como una nueva reserva, la llegada o salida de un huésped.</p>

<h3>📍 Paso 1: Acceder a la configuración de mensajes</h3>

<ol style="line-height: 1.8;">
<li><strong>Inicia sesión en Airbnb</strong> → <a href="https://www.airbnb.es" target="_blank" rel="noopener">airbnb.es</a></li>
<li>Haz clic en <strong>"Mensajes"</strong> en el menú principal</li>
<li>Haz clic en el icono de <strong>"Configuración"</strong> ⚙️ (arriba a la derecha)</li>
<li>Selecciona <strong>"Respuestas rápidas"</strong></li>
<li>Haz clic en <strong>"Crear"</strong> para crear una nueva plantilla</li>
</ol>

<div style="background: #FFF8F5; border-left: 4px solid #FF5A5F; padding: 20px; margin: 20px 0; border-radius: 8px;">
<p style="margin: 0; color: #484848; font-size: 15px;"><strong>💡 Tip importante:</strong> Si tienes varios anuncios, puedes crear plantillas diferentes para cada tipo de alojamiento.</p>
</div>

<h3>📍 Paso 2: Crear tu plantilla de mensaje</h3>

<ol style="line-height: 1.8;">
<li><strong>Ponle un nombre a la plantilla</strong> (ej: "Bienvenida post-reserva")</li>
<li><strong>Escribe tu mensaje</strong> usando las variables dinámicas (ver tabla abajo)</li>
<li><strong>Selecciona a qué anuncios se aplicará</strong> (uno o varios)</li>
<li><strong>Programa cuándo se enviará</strong>:
  <ul style="margin-top: 10px;">
  <li>Después de confirmar la reserva</li>
  <li>Antes de la llegada (1, 2, 3 días...)</li>
  <li>El día de la llegada</li>
  <li>Durante la estancia</li>
  <li>Antes de la salida</li>
  <li>Después de la salida</li>
  </ul>
</li>
<li>Haz clic en <strong>"Guardar"</strong></li>
</ol>

<h3>📍 Paso 3: Configurar mensajes para reservas de última hora</h3>

<p>Por defecto, Airbnb omite algunos mensajes en reservas de última hora. Si quieres que SIEMPRE se envíen:</p>

<ol style="line-height: 1.8;">
<li>Al crear o editar la plantilla, busca la opción:<br><strong>"Envíalo para las reservas de última hora y las estancias cortas"</strong></li>
<li>Activa el botón</li>
<li>Guarda la plantilla</li>
</ol>

<div style="background: #F7F7F7; border: 2px solid #E0E0E0; border-radius: 12px; padding: 20px; margin: 20px 0;">
<p style="margin: 0 0 10px 0; color: #484848;"><strong>Ejemplo:</strong></p>
<p style="margin: 0; color: #767676; font-size: 14px; line-height: 1.6;">
Si programaste un mensaje para "2 días antes de la llegada" pero la reserva se hace el mismo día de llegada:<br>
• <strong>Botón desactivado:</strong> El mensaje se omitirá<br>
• <strong>Botón activado:</strong> El mensaje se enviará inmediatamente al confirmar la reserva
</p>
</div>

<h2>🔧 Cómo Usar Contenido Dinámico en Tus Mensajes</h2>

<p>Airbnb llama a estas variables <strong>"detalles"</strong>. Son marcadores de posición que se reemplazan automáticamente con información específica de cada huésped y reserva.</p>

<h3>¿Por qué usar contenido dinámico?</h3>
<ul style="line-height: 1.8;">
<li>✅ <strong>Ahorra tiempo</strong>: No tienes que editar manualmente cada mensaje</li>
<li>✅ <strong>Evita errores</strong>: No te equivocarás de nombre, fecha o dirección</li>
<li>✅ <strong>Más profesional</strong>: Los mensajes personalizados generan más confianza</li>
<li>✅ <strong>Mejores reviews</strong>: Los huéspedes valoran la atención personalizada</li>
</ul>

<h3>📊 Variables disponibles en Airbnb</h3>

<p>Cuando escribas tu mensaje en Airbnb, verás un botón <strong>"Insertar detalles"</strong>. Al hacer clic, podrás elegir entre estas variables:</p>

<div style="background: #F9F9F9; border: 2px solid #E0E0E0; border-radius: 12px; padding: 20px; margin: 20px 0; overflow-x: auto;">
<table style="width: 100%; border-collapse: collapse; font-size: 14px;">
<thead>
<tr style="background: #FF5A5F; color: white;">
<th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Variable</th>
<th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Qué muestra</th>
<th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Ejemplo</th>
</tr>
</thead>
<tbody>
<tr>
<td style="padding: 10px; border: 1px solid #ddd;"><code>nombre del viajero</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Nombre del huésped</td>
<td style="padding: 10px; border: 1px solid #ddd;">María</td>
</tr>
<tr style="background: #FAFAFA;">
<td style="padding: 10px; border: 1px solid #ddd;"><code>fecha de llegada</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Día de check-in</td>
<td style="padding: 10px; border: 1px solid #ddd;">15 de marzo, 2025</td>
</tr>
<tr>
<td style="padding: 10px; border: 1px solid #ddd;"><code>fecha de salida</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Día de check-out</td>
<td style="padding: 10px; border: 1px solid #ddd;">18 de marzo, 2025</td>
</tr>
<tr style="background: #FAFAFA;">
<td style="padding: 10px; border: 1px solid #ddd;"><code>hora de llegada</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Hora de check-in configurada</td>
<td style="padding: 10px; border: 1px solid #ddd;">15:00</td>
</tr>
<tr>
<td style="padding: 10px; border: 1px solid #ddd;"><code>hora de salida</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Hora de check-out configurada</td>
<td style="padding: 10px; border: 1px solid #ddd;">11:00</td>
</tr>
<tr style="background: #FAFAFA;">
<td style="padding: 10px; border: 1px solid #ddd;"><code>dirección</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Dirección completa del alojamiento</td>
<td style="padding: 10px; border: 1px solid #ddd;">Calle Mayor 42, 28013 Madrid</td>
</tr>
<tr>
<td style="padding: 10px; border: 1px solid #ddd;"><code>indicaciones para llegar</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Instrucciones de acceso</td>
<td style="padding: 10px; border: 1px solid #ddd;">Metro línea 1, salida Sol</td>
</tr>
<tr style="background: #FAFAFA;">
<td style="padding: 10px; border: 1px solid #ddd;"><code>nombre del wifi</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Nombre de la red WiFi</td>
<td style="padding: 10px; border: 1px solid #ddd;">WiFi_Casa_42</td>
</tr>
<tr>
<td style="padding: 10px; border: 1px solid #ddd;"><code>contraseña del wifi</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Contraseña del WiFi</td>
<td style="padding: 10px; border: 1px solid #ddd;">MiCasa2025!</td>
</tr>
<tr style="background: #FAFAFA;">
<td style="padding: 10px; border: 1px solid #ddd;"><code>normas de la casa</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Normas configuradas en el anuncio</td>
<td style="padding: 10px; border: 1px solid #ddd;">No fumar, No fiestas, No mascotas</td>
</tr>
<tr>
<td style="padding: 10px; border: 1px solid #ddd;"><code>código de confirmación</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Código de la reserva</td>
<td style="padding: 10px; border: 1px solid #ddd;">HMABCD1234</td>
</tr>
<tr style="background: #FAFAFA;">
<td style="padding: 10px; border: 1px solid #ddd;"><code>ciudad</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Ciudad del alojamiento</td>
<td style="padding: 10px; border: 1px solid #ddd;">Madrid</td>
</tr>
</tbody>
</table>
</div>

<div style="background: #FFF8F5; border-left: 4px solid #FF5A5F; padding: 20px; margin: 20px 0; border-radius: 8px;">
<p style="margin: 0 0 10px 0; color: #484848;"><strong>⚠️ Importante:</strong></p>
<p style="margin: 0; color: #767676; font-size: 14px;">Estas variables solo funcionan si has completado la información en tu anuncio. Si falta algún dato, aparecerá como "no disponible" en el mensaje.</p>
</div>

<h3>✍️ Ejemplo práctico de uso:</h3>

<div style="background: #F0F0F0; padding: 20px; border-radius: 8px; margin: 20px 0; font-family: monospace; font-size: 14px;">
<p style="margin: 0 0 10px 0; color: #484848;">Hola <strong style="color: #FF5A5F;">[nombre del viajero]</strong>,</p>
<p style="margin: 0 0 10px 0; color: #484848;">Te espero el <strong style="color: #FF5A5F;">[fecha de llegada]</strong> a partir de las <strong style="color: #FF5A5F;">[hora de llegada]</strong>.</p>
<p style="margin: 0 0 10px 0; color: #484848;">La dirección es: <strong style="color: #FF5A5F;">[dirección]</strong></p>
<p style="margin: 0 0 10px 0; color: #484848;">WiFi: <strong style="color: #FF5A5F;">[nombre del wifi]</strong> | Contraseña: <strong style="color: #FF5A5F;">[contraseña del wifi]</strong></p>
<p style="margin: 0; color: #484848;">¡Nos vemos pronto!</p>
</div>

<p><strong>El huésped recibirá:</strong></p>

<div style="background: #E8F5E9; padding: 20px; border-radius: 8px; margin: 20px 0; font-size: 14px;">
<p style="margin: 0 0 10px 0; color: #484848;">Hola María,</p>
<p style="margin: 0 0 10px 0; color: #484848;">Te espero el 15 de marzo, 2025 a partir de las 15:00.</p>
<p style="margin: 0 0 10px 0; color: #484848;">La dirección es: Calle Mayor 42, 28013 Madrid</p>
<p style="margin: 0 0 10px 0; color: #484848;">WiFi: WiFi_Casa_42 | Contraseña: MiCasa2025!</p>
<p style="margin: 0; color: #484848;">¡Nos vemos pronto!</p>
</div>

<h2>⭐ Cómo Pedir Reviews (Escala Persuasiva)</h2>

<p>Al pedir una review, es importante que el huésped entienda el impacto de su valoración. Aquí está la realidad de las puntuaciones en Airbnb:</p>

<div style="background: #FFF; border: 2px solid #E0E0E0; border-radius: 12px; padding: 24px; margin: 30px 0;">
<h3 style="margin-top: 0;">🎯 GUÍA RÁPIDA DE VALORACIONES EN AIRBNB</h3>

<div style="margin: 20px 0; padding: 15px; background: #E8F5E9; border-left: 4px solid #4CAF50; border-radius: 4px;">
<p style="margin: 0; font-size: 16px;"><strong>⭐⭐⭐⭐⭐ 5 ESTRELLAS = TODO CUMPLIÓ LAS EXPECTATIVAS</strong></p>
<p style="margin: 8px 0 0 0; color: #666;">Esta es la puntuación CORRECTA si tu estancia fue buena y todo funcionó como esperabas. No significa que fue "perfecto", significa que fue "como se anunciaba".</p>
</div>

<div style="margin: 20px 0; padding: 15px; background: #FFF3E0; border-left: 4px solid #FF9800; border-radius: 4px;">
<p style="margin: 0; font-size: 16px;"><strong>⭐⭐⭐⭐ 4 ESTRELLAS = ALGO IMPORTANTE FALLÓ</strong></p>
<p style="margin: 8px 0 0 0; color: #666;">En Airbnb, 4 estrellas NO es "muy bien". Significa que hubo un problema grave: WiFi no funcionaba, limpieza deficiente, o algo prometido que faltaba. PERJUDICA MUCHO la media del anfitrión.</p>
</div>

<div style="margin: 20px 0; padding: 15px; background: #FFEBEE; border-left: 4px solid #F44336; border-radius: 4px;">
<p style="margin: 0; font-size: 16px;"><strong>⭐⭐⭐ 3 ESTRELLAS O MENOS = ESTANCIA REALMENTE MALA</strong></p>
<p style="margin: 8px 0 0 0; color: #666;">Solo si el alojamiento era inhabitable, peligroso o nada que ver con el anuncio. Esto puede hacer que Airbnb retire el anuncio.</p>
</div>

<div style="background: #F0F4FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p style="margin: 0 0 10px 0; font-weight: 600; color: #222;">💡 Por eso, en tu plantilla de petición de review, puedes incluir esto:</p>
<p style="margin: 0; font-size: 14px; color: #484848; font-style: italic;">"Si todo estuvo bien y cumplió tus expectativas, una valoración de 5⭐ me ayuda muchísimo. En Airbnb, 4 estrellas se interpreta como que algo importante falló. Si hubo algún problema, por favor dímelo antes de la valoración para poder solucionarlo. ¡Gracias!"</p>
</div>
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
    Probar 15 Días →
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
  `

  // Update the article with the complete content and correct author
  await prisma.blogPost.update({
    where: { slug: 'mensajes-automaticos-airbnb' },
    data: {
      content: completeContent,
      authorName: 'Alejandro Satlla',
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=630&fit=crop',
      coverImageAlt: 'Smartphone mostrando mensajes de Airbnb automatizados'
    }
  })

  console.log('✅ Artículo restaurado exitosamente!')
  console.log('')
  console.log('📋 CONTENIDO INCLUIDO:')
  console.log('  ✅ Autor: Alejandro Satlla')
  console.log('  ✅ Imagen de portada añadida')
  console.log('  ✅ 7 plantillas copy-paste completas')
  console.log('  ✅ Instrucciones de configuración paso a paso')
  console.log('  ✅ Tabla de variables dinámicas de Airbnb')
  console.log('  ✅ Escala persuasiva de reviews (5⭐ vs 4⭐ vs 3⭐)')
  console.log('  ✅ Sección de reservas de última hora')
  console.log('  ✅ Ejemplo práctico de uso de variables')
  console.log('')
  console.log('🔗 Verifica el artículo completo en:')
  console.log('   http://localhost:3000/blog/mensajes-automaticos-airbnb')
}

restoreAirbnbArticle()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
