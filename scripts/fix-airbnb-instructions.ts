import { prisma } from '../src/lib/prisma'

async function fixAirbnbInstructions() {
  console.log('🔧 Actualizando instrucciones de configuración de Airbnb...\n')

  // Nueva sección de configuración con instrucciones correctas
  const newConfigSection = `
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
`

  const newDynamicVariablesSection = `
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
`

  // Obtener el artículo actual
  const article = await prisma.blogPost.findUnique({
    where: { slug: 'mensajes-automaticos-airbnb' }
  })

  if (!article) {
    console.log('❌ No se encontró el artículo')
    return
  }

  // Reemplazar la sección de configuración antigua
  let updatedContent = article.content.replace(
    /⚙️ Cómo Configurar Mensajes Automáticos.*?(?=<h2>🔧 Cómo Usar Contenido Dinámico|<h2>📋 Plantillas|$)/s,
    newConfigSection
  )

  // Reemplazar la sección de contenido dinámico
  updatedContent = updatedContent.replace(
    /<h2>🔧 Cómo Usar Contenido Dinámico.*?(?=<h2>📋 Plantillas|$)/s,
    newDynamicVariablesSection
  )

  // Actualizar el artículo
  await prisma.blogPost.update({
    where: { slug: 'mensajes-automaticos-airbnb' },
    data: {
      content: updatedContent
    }
  })

  console.log('✅ Instrucciones actualizadas correctamente!')
  console.log('')
  console.log('📋 CAMBIOS REALIZADOS:')
  console.log('  ✅ Paso a paso correcto según Airbnb oficial')
  console.log('  ✅ Mensajes → Configuración ⚙️ → Respuestas rápidas → Crear')
  console.log('  ✅ Tabla de variables dinámicas actualizada')
  console.log('  ✅ Explicación de reservas de última hora')
  console.log('  ✅ Ejemplo práctico con antes/después')
  console.log('')
  console.log('🔗 Revisa el artículo en:')
  console.log('   http://localhost:3000/blog/mensajes-automaticos-airbnb')
}

fixAirbnbInstructions()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
