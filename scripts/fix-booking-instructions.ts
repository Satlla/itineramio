import { prisma } from '../src/lib/prisma'

async function fixBookingInstructions() {
  console.log('🔧 Actualizando instrucciones de configuración de Booking.com...\n')

  // Nueva sección de configuración con instrucciones correctas
  const newConfigSection = `
<h2>⚙️ Cómo Configurar Mensajes Automáticos en Booking.com (Paso a Paso)</h2>

<p>Booking.com llama a estos mensajes <strong>"Plantillas de mensajes"</strong> y <strong>"Respuestas automáticas"</strong>. Te permiten compartir información importante con tus clientes de forma automática.</p>

<h3>📍 Paso 1: Acceder a Preferencias de mensajes</h3>

<ol style="line-height: 1.8;">
<li><strong>Inicia sesión en la extranet de Booking.com</strong> (o en la app Pulse)</li>
<li>Haz clic en la pestaña <strong>"Establecimiento"</strong></li>
<li>Selecciona <strong>"Preferencias de mensajes"</strong></li>
<li>Ve a la pestaña <strong>"Plantillas de mensajes"</strong></li>
<li>Haz clic en el botón <strong>"Crear nueva plantilla"</strong></li>
</ol>

<div style="background: #FFF8F5; border-left: 4px solid #003580; padding: 20px; margin: 20px 0; border-radius: 8px;">
<p style="margin: 0; color: #484848; font-size: 15px;"><strong>💡 Tip importante:</strong> Solo las cuentas con derechos de administración pueden crear o editar plantillas. Verifica tus permisos antes de empezar.</p>
</div>

<h3>📍 Paso 2: Crear tu plantilla de mensaje</h3>

<ol style="line-height: 1.8;">
<li><strong>Escribe el mensaje de la plantilla</strong>
  <ul style="margin-top: 10px;">
  <li>Usa los <strong>bloques precargados</strong> para rellenar automáticamente datos de la reserva</li>
  <li>Puedes adjuntar imágenes para proporcionar información adicional</li>
  <li>⚠️ <strong>No puedes guardar plantillas con códigos QR adjuntos</strong></li>
  </ul>
</li>
<li><strong>Confirma el idioma</strong>
  <ul style="margin-top: 10px;">
  <li>Puedes elegir idiomas adicionales para la plantilla</li>
  <li>Usa el mismo nombre para agrupar plantillas en diferentes idiomas</li>
  <li>Booking usará el idioma preferido del cliente automáticamente</li>
  <li>Recomendación: Fija el inglés como idioma predeterminado</li>
  </ul>
</li>
<li>Haz clic en <strong>"Continuar"</strong></li>
<li>Escribe el <strong>Nombre de la plantilla</strong> y elige un <strong>Tema</strong></li>
<li>Haz clic en <strong>"Guardar plantilla"</strong> para finalizar</li>
</ol>

<h3>📍 Paso 3: Programar cuándo se envía la plantilla</h3>

<p>Ahora que tienes la plantilla creada, debes programar CUÁNDO se enviará:</p>

<ol style="line-height: 1.8;">
<li>Ve a la pestaña <strong>"Programador de plantillas"</strong></li>
<li>Haz clic en <strong>"Programar plantilla"</strong></li>
<li><strong>Selecciona cuándo quieres enviarla:</strong>
  <ul style="margin-top: 10px;">
  <li>Cuando la persona hace la reserva</li>
  <li>Una semana antes de la llegada</li>
  <li>Tres días antes de la llegada</li>
  <li>Un día antes de la llegada</li>
  <li>El día de llegada</li>
  <li>Un día antes de la salida</li>
  </ul>
</li>
<li>Elige qué plantilla quieres enviar (verás una vista previa)</li>
<li>Haz clic en <strong>"Añadir a la agenda"</strong></li>
</ol>

<div style="background: #F7F7F7; border: 2px solid #E0E0E0; border-radius: 12px; padding: 20px; margin: 20px 0;">
<p style="margin: 0 0 10px 0; color: #484848;"><strong>✅ Seguimiento de mensajes:</strong></p>
<p style="margin: 0; color: #767676; font-size: 14px; line-height: 1.6;">
Las plantillas enviadas a tus clientes aparecen automáticamente en tu bandeja de entrada de la extranet y en la app Pulse. Así puedes hacer seguimiento fácilmente.
</p>
</div>
`

  const newAutomaticResponsesSection = `
<h3>🤖 Cómo Crear Respuestas Automáticas</h3>

<p>Las respuestas automáticas son diferentes a las plantillas programadas. Te permiten responder preguntas frecuentes de forma automática.</p>

<h4>📋 Tipos de respuestas automáticas:</h4>

<ul style="line-height: 1.8;">
<li><strong>Respuestas conformes a tus condiciones:</strong> Se acepta automáticamente la petición del cliente cuando entra dentro de tus condiciones de reserva.</li>
<li><strong>Respuestas no conformes:</strong> Puedes emparejar respuestas con plantillas de mensajes para responder cuando las peticiones quedan fuera de tus condiciones normales.</li>
</ul>

<h4>🔧 Pasos para configurar respuestas automáticas:</h4>

<ol style="line-height: 1.8;">
<li>Inicia sesión en la extranet o en la app Pulse</li>
<li>Haz clic en la pestaña <strong>Establecimiento</strong> → <strong>Preferencias de mensajes</strong></li>
<li>Ve a la pestaña <strong>"Respuestas automáticas"</strong></li>
<li>Selecciona los <strong>Ajustes relacionados con el tema</strong></li>
<li>Marca la casilla junto al tema para el que quieres habilitar una respuesta automática</li>
<li>Elige la respuesta que prefieras</li>
<li>(Opcional) Haz clic en <strong>"Seleccionar plantilla"</strong> para incluir una plantilla de mensaje</li>
<li>Haz clic en <strong>"Guardar"</strong> para finalizar</li>
</ol>

<div style="background: #E8F5E9; border-left: 4px solid #4CAF50; padding: 20px; margin: 20px 0; border-radius: 8px;">
<p style="margin: 0 0 10px 0; color: #2E7D32;"><strong>💡 Cómo funcionan:</strong></p>
<p style="margin: 0; color: #2E7D32; font-size: 14px; line-height: 1.6;">
Cuando se envía una respuesta automática, el cliente la recibe como email y puede verse en la conversación de chat. Puedes ver cómo interactúan y enviarles otro mensaje en cualquier momento.
</p>
</div>
`

  const newDynamicVariablesSection = `
<h2>🔧 Cómo Usar Contenido Dinámico (Marcadores) en Tus Mensajes</h2>

<p>Booking.com usa <strong>"bloques de información precargada"</strong> o <strong>"marcadores"</strong> que se sustituyen automáticamente con datos específicos de cada reserva y cliente.</p>

<h3>¿Por qué usar marcadores dinámicos?</h3>
<ul style="line-height: 1.8;">
<li>✅ <strong>Ahorra tiempo</strong>: No editas manualmente cada mensaje</li>
<li>✅ <strong>Sin errores</strong>: Los datos se rellenan automáticamente</li>
<li>✅ <strong>Más profesional</strong>: Cada cliente ve su información personalizada</li>
<li>✅ <strong>Mejor experiencia</strong>: Los clientes valoran la personalización</li>
</ul>

<h3>📊 Marcadores disponibles en Booking.com</h3>

<p>Al escribir tu plantilla, verás <strong>bloques de información precargada</strong> que puedes insertar con un clic:</p>

<div style="background: #F9F9F9; border: 2px solid #E0E0E0; border-radius: 12px; padding: 20px; margin: 20px 0; overflow-x: auto;">
<table style="width: 100%; border-collapse: collapse; font-size: 14px;">
<thead>
<tr style="background: #003580; color: white;">
<th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Marcador</th>
<th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Qué muestra</th>
<th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Ejemplo</th>
</tr>
</thead>
<tbody>
<tr>
<td style="padding: 10px; border: 1px solid #ddd;"><code>[Nombre del cliente]</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Nombre completo del huésped</td>
<td style="padding: 10px; border: 1px solid #ddd;">María García</td>
</tr>
<tr style="background: #FAFAFA;">
<td style="padding: 10px; border: 1px solid #ddd;"><code>[Fecha de entrada]</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Día de check-in</td>
<td style="padding: 10px; border: 1px solid #ddd;">15 de marzo, 2025</td>
</tr>
<tr>
<td style="padding: 10px; border: 1px solid #ddd;"><code>[Fecha de salida]</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Día de check-out</td>
<td style="padding: 10px; border: 1px solid #ddd;">18 de marzo, 2025</td>
</tr>
<tr style="background: #FAFAFA;">
<td style="padding: 10px; border: 1px solid #ddd;"><code>[Hora de entrada]</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Hora de check-in configurada</td>
<td style="padding: 10px; border: 1px solid #ddd;">15:00 - 18:00</td>
</tr>
<tr>
<td style="padding: 10px; border: 1px solid #ddd;"><code>[Hora de salida]</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Hora de check-out configurada</td>
<td style="padding: 10px; border: 1px solid #ddd;">Hasta las 11:00</td>
</tr>
<tr style="background: #FAFAFA;">
<td style="padding: 10px; border: 1px solid #ddd;"><code>[Dirección del alojamiento]</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Dirección completa</td>
<td style="padding: 10px; border: 1px solid #ddd;">Calle Mayor 42, 28013 Madrid</td>
</tr>
<tr>
<td style="padding: 10px; border: 1px solid #ddd;"><code>[Nombre del alojamiento]</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Nombre de tu propiedad</td>
<td style="padding: 10px; border: 1px solid #ddd;">Apartamento Centro Madrid</td>
</tr>
<tr style="background: #FAFAFA;">
<td style="padding: 10px; border: 1px solid #ddd;"><code>[Número de confirmación]</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Código de la reserva</td>
<td style="padding: 10px; border: 1px solid #ddd;">3456789012</td>
</tr>
<tr>
<td style="padding: 10px; border: 1px solid #ddd;"><code>[Número de huéspedes]</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Cantidad de personas</td>
<td style="padding: 10px; border: 1px solid #ddd;">2 adultos</td>
</tr>
<tr style="background: #FAFAFA;">
<td style="padding: 10px; border: 1px solid #ddd;"><code>[Tipo de habitación]</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Habitación/apartamento reservado</td>
<td style="padding: 10px; border: 1px solid #ddd;">Estudio con balcón</td>
</tr>
<tr>
<td style="padding: 10px; border: 1px solid #ddd;"><code>[Número de noches]</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Duración de la estancia</td>
<td style="padding: 10px; border: 1px solid #ddd;">3 noches</td>
</tr>
<tr style="background: #FAFAFA;">
<td style="padding: 10px; border: 1px solid #ddd;"><code>[Precio total]</code></td>
<td style="padding: 10px; border: 1px solid #ddd;">Importe de la reserva</td>
<td style="padding: 10px; border: 1px solid #ddd;">€285,00</td>
</tr>
</tbody>
</table>
</div>

<div style="background: #FFF8F5; border-left: 4px solid #003580; padding: 20px; margin: 20px 0; border-radius: 8px;">
<p style="margin: 0 0 10px 0; color: #484848;"><strong>⚠️ Importante sobre URL de check-in:</strong></p>
<p style="margin: 0; color: #767676; font-size: 14px;">Si quieres incluir una URL de check-in online, asegúrate de añadirla a la <strong>lista blanca en Ajustes de seguridad</strong> dentro de Preferencias de mensajes.</p>
</div>

<h3>✍️ Ejemplo práctico de uso:</h3>

<div style="background: #F0F0F0; padding: 20px; border-radius: 8px; margin: 20px 0; font-family: monospace; font-size: 14px;">
<p style="margin: 0 0 10px 0; color: #484848;">Hola <strong style="color: #003580;">[Nombre del cliente]</strong>,</p>
<p style="margin: 0 0 10px 0; color: #484848;">Gracias por reservar en <strong style="color: #003580;">[Nombre del alojamiento]</strong>.</p>
<p style="margin: 0 0 10px 0; color: #484848;">Tu check-in es el <strong style="color: #003580;">[Fecha de entrada]</strong> de <strong style="color: #003580;">[Hora de entrada]</strong>.</p>
<p style="margin: 0 0 10px 0; color: #484848;">La dirección es: <strong style="color: #003580;">[Dirección del alojamiento]</strong></p>
<p style="margin: 0 0 10px 0; color: #484848;">Tu número de confirmación: <strong style="color: #003580;">[Número de confirmación]</strong></p>
<p style="margin: 0; color: #484848;">¡Nos vemos pronto!</p>
</div>

<p><strong>El cliente recibirá:</strong></p>

<div style="background: #E8F5E9; padding: 20px; border-radius: 8px; margin: 20px 0; font-size: 14px;">
<p style="margin: 0 0 10px 0; color: #484848;">Hola María García,</p>
<p style="margin: 0 0 10px 0; color: #484848;">Gracias por reservar en Apartamento Centro Madrid.</p>
<p style="margin: 0 0 10px 0; color: #484848;">Tu check-in es el 15 de marzo, 2025 de 15:00 - 18:00.</p>
<p style="margin: 0 0 10px 0; color: #484848;">La dirección es: Calle Mayor 42, 28013 Madrid</p>
<p style="margin: 0 0 10px 0; color: #484848;">Tu número de confirmación: 3456789012</p>
<p style="margin: 0; color: #484848;">¡Nos vemos pronto!</p>
</div>
`

  // Obtener el artículo actual
  const article = await prisma.blogPost.findUnique({
    where: { slug: 'mensajes-automaticos-booking' }
  })

  if (!article) {
    console.log('❌ No se encontró el artículo de Booking')
    return
  }

  // Buscar la sección de configuración y reemplazarla
  let updatedContent = article.content

  // Reemplazar sección de configuración
  if (updatedContent.includes('⚙️ Cómo Configurar')) {
    updatedContent = updatedContent.replace(
      /⚙️ Cómo Configurar.*?(?=<h2>|$)/s,
      newConfigSection + '\n\n' + newAutomaticResponsesSection + '\n\n' + newDynamicVariablesSection
    )
  } else {
    // Si no existe, insertar antes de las plantillas
    updatedContent = updatedContent.replace(
      /(<h2>📋 Plantillas)/,
      newConfigSection + '\n\n' + newAutomaticResponsesSection + '\n\n' + newDynamicVariablesSection + '\n\n$1'
    )
  }

  // Actualizar el artículo
  await prisma.blogPost.update({
    where: { slug: 'mensajes-automaticos-booking' },
    data: {
      content: updatedContent
    }
  })

  console.log('✅ Instrucciones de Booking.com actualizadas correctamente!')
  console.log('')
  console.log('📋 CAMBIOS REALIZADOS:')
  console.log('  ✅ Paso a paso correcto según Booking oficial')
  console.log('  ✅ Establecimiento → Preferencias de mensajes → Plantillas')
  console.log('  ✅ Programador de plantillas explicado')
  console.log('  ✅ Respuestas automáticas incluidas')
  console.log('  ✅ Tabla de marcadores dinámicos completa')
  console.log('  ✅ Ejemplo práctico con antes/después')
  console.log('')
  console.log('🔗 Revisa el artículo en:')
  console.log('   http://localhost:3000/blog/mensajes-automaticos-booking')
}

fixBookingInstructions()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
