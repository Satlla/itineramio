/**
 * Script para expandir la sección de mensajería automática en el artículo del stack
 * y añadir links internos a artículos relacionados
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📝 Expandiendo sección de mensajería automática...\n')

  // Buscar el contenido actual
  const article = await prisma.blogPost.findUnique({
    where: { slug: 'automatizacion-airbnb-stack-completo' }
  })

  if (!article) {
    throw new Error('Artículo no encontrado')
  }

  // El nuevo contenido expandido para la sección de mensajería
  const oldMessagingSection = `<h4>Qué automatizar (los 8 mensajes esenciales):</h4>

<div style="background: #f9fafb; border-radius: 8px; padding: 2rem; margin: 1.5rem 0;">
  <ol style="margin: 0; padding-left: 1.5rem;">
    <li style="margin-bottom: 1rem;">
      <strong>Confirmación inmediata</strong> (al reservar)<br>
      <em style="color: #6b7280; font-size: 0.9rem;">"¡Hola [nombre]! Tu reserva está confirmada. Te escribiremos 48h antes con todos los detalles."</em>
    </li>
    <li style="margin-bottom: 1rem;">
      <strong>Instrucciones pre-llegada</strong> (48h antes)<br>
      <em style="color: #6b7280; font-size: 0.9rem;">"Tu check-in es el [fecha] a las [hora]. Dirección: [X]. Te enviaremos el código 4h antes."</em>
    </li>
    <li style="margin-bottom: 1rem;">
      <strong>Código de acceso</strong> (4h antes)<br>
      <em style="color: #6b7280; font-size: 0.9rem;">"Tu código de acceso: [código]. Válido desde las [hora]."</em>
    </li>
    <li style="margin-bottom: 1rem;">
      <strong>Bienvenida + Manual</strong> (día check-in)<br>
      <em style="color: #6b7280; font-size: 0.9rem;">"¡Bienvenido! Aquí tienes toda la info: [link manual digital]"</em>
    </li>
    <li style="margin-bottom: 1rem;">
      <strong>Check durante estancia</strong> (día 2)<br>
      <em style="color: #6b7280; font-size: 0.9rem;">"¿Todo bien? ¿Necesitas algo?"</em>
    </li>
    <li style="margin-bottom: 1rem;">
      <strong>Recordatorio check-out</strong> (día antes)<br>
      <em style="color: #6b7280; font-size: 0.9rem;">"Mañana es tu check-out a las [hora]. Por favor, deja llaves en el apartamento."</em>
    </li>
    <li style="margin-bottom: 1rem;">
      <strong>Agradecimiento</strong> (post check-out)<br>
      <em style="color: #6b7280; font-size: 0.9rem;">"¡Gracias por tu estancia! Esperamos verte pronto."</em>
    </li>
    <li style="margin-bottom: 0;">
      <strong>Solicitud de reseña</strong> (12h después)<br>
      <em style="color: #6b7280; font-size: 0.9rem;">"¿Nos dejas tu opinión? Nos ayuda mucho: [link]"</em>
    </li>
  </ol>
</div>

<p><strong>Resultado:</strong> Reduces mensajes manuales en un <strong>82%</strong>.</p>`

  const newMessagingSection = `<h4>Qué automatizar (los 8 mensajes esenciales):</h4>

<p>Estos son los mensajes que DEBES automatizar en tu flujo de comunicación. Cada uno tiene un propósito específico y un timing óptimo:</p>

<div style="background: #f9fafb; border-radius: 8px; padding: 2rem; margin: 1.5rem 0;">
  <ol style="margin: 0; padding-left: 1.5rem;">
    <li style="margin-bottom: 1.5rem;">
      <strong>1. Confirmación Inmediata</strong> (0-5 minutos después de la reserva)<br>
      <em style="color: #6b7280; font-size: 0.9rem; display: block; margin-top: 0.5rem;">"¡Hola [nombre]! 🎉 Tu reserva está confirmada para el [fecha]. Estamos emocionados de recibirte. Te escribiremos 48h antes con todos los detalles del check-in. Mientras tanto, si tienes alguna pregunta, ¡escríbeme!"</em>
      <div style="background: white; padding: 1rem; margin-top: 0.5rem; border-radius: 4px; border-left: 3px solid #8b5cf6;">
        <p style="margin: 0; font-size: 0.85rem; color: #4b5563;"><strong>Por qué funciona:</strong> Genera tranquilidad inmediata. El huésped sabe que su reserva está procesada y que no se olvidarán de él.</p>
      </div>
    </li>
    <li style="margin-bottom: 1.5rem;">
      <strong>2. Instrucciones Pre-Llegada</strong> (48 horas antes del check-in)<br>
      <em style="color: #6b7280; font-size: 0.9rem; display: block; margin-top: 0.5rem;">"¡Hola [nombre]! Ya falta poco para tu llegada 😊<br><br>📅 Check-in: [fecha] a las [hora]<br>📍 Dirección: [dirección completa]<br>🚗 Parking: [instrucciones específicas]<br>🔑 Código de acceso: Te lo envío 4 horas antes de tu llegada<br><br>¿Tienes alguna pregunta antes de tu llegada?"</em>
      <div style="background: white; padding: 1rem; margin-top: 0.5rem; border-radius: 4px; border-left: 3px solid #8b5cf6;">
        <p style="margin: 0; font-size: 0.85rem; color: #4b5563;"><strong>Por qué funciona:</strong> 48h es el timing perfecto: suficientemente cerca para que el huésped esté pensando en el viaje, pero con tiempo para resolver dudas.</p>
      </div>
    </li>
    <li style="margin-bottom: 1.5rem;">
      <strong>3. Código de Acceso</strong> (4 horas antes del check-in)<br>
      <em style="color: #6b7280; font-size: 0.9rem; display: block; margin-top: 0.5rem;">"¡Ya está todo listo para tu llegada! 🏠<br><br>🔑 Código portal: [código]<br>🚪 Código apartamento: [código]<br>⏰ Válido desde las [hora] hasta [hora check-out]<br><br>Recuerda: El check-in oficial es a las [hora], pero si llegas antes puedes dejar las maletas en el apartamento."</em>
      <div style="background: white; padding: 1rem; margin-top: 0.5rem; border-radius: 4px; border-left: 3px solid #8b5cf6;">
        <p style="margin: 0; font-size: 0.85rem; color: #4b5563;"><strong>Por qué funciona:</strong> 4h antes evita que el huésped pierda el mensaje y te pregunte de nuevo. Demasiado pronto y lo olvida; demasiado tarde y te escribe nervioso.</p>
      </div>
    </li>
    <li style="margin-bottom: 1.5rem;">
      <strong>4. Bienvenida + Manual Digital</strong> (día del check-in, 30 min después de la hora oficial)<br>
      <em style="color: #6b7280; font-size: 0.9rem; display: block; margin-top: 0.5rem;">"¡Bienvenido a [ciudad], [nombre]! 🎊<br><br>Espero que hayas llegado bien. Aquí tienes toda la información del apartamento:<br><br>📱 <a href='[link]' style='color: #8b5cf6; font-weight: 600;'>Manual Digital Completo</a><br><br>Incluye:<br>✓ WiFi y contraseñas<br>✓ Cómo usar electrodomésticos<br>✓ Restaurantes recomendados<br>✓ Qué ver cerca<br>✓ Transporte público<br><br>¿Alguna duda? ¡Escríbeme!"</em>
      <div style="background: white; padding: 1rem; margin-top: 0.5rem; border-radius: 4px; border-left: 3px solid #8b5cf6;">
        <p style="margin: 0; font-size: 0.85rem; color: #4b5563;"><strong>Por qué funciona:</strong> El 86% de las consultas se responden con el manual. Envíalo justo después del check-in cuando más lo necesitan.</p>
      </div>
    </li>
    <li style="margin-bottom: 1.5rem;">
      <strong>5. Check Durante Estancia</strong> (día 2 de la estancia, por la mañana)<br>
      <em style="color: #6b7280; font-size: 0.9rem; display: block; margin-top: 0.5rem;">"¡Hola [nombre]! 👋<br><br>¿Qué tal tu primera noche? ¿Todo bien con el apartamento?<br><br>Si necesitas algo o tienes alguna pregunta, aquí estoy. ¡Disfruta tu estancia!"</em>
      <div style="background: white; padding: 1rem; margin-top: 0.5rem; border-radius: 4px; border-left: 3px solid #8b5cf6;">
        <p style="margin: 0; font-size: 0.85rem; color: #4b5563;"><strong>Por qué funciona:</strong> Demuestra que te importa SIN ser intrusivo. Si hay un problema pequeño, lo detectas antes de que se convierta en reseña negativa.</p>
      </div>
    </li>
    <li style="margin-bottom: 1.5rem;">
      <strong>6. Recordatorio Check-Out</strong> (día antes del check-out, por la tarde)<br>
      <em style="color: #6b7280; font-size: 0.9rem; display: block; margin-top: 0.5rem;">"¡Hola [nombre]! 🕐<br><br>Mañana es tu último día. El check-out es a las [hora].<br><br>Por favor:<br>✓ Deja las llaves dentro del apartamento<br>✓ Apaga luces y electrodomésticos<br>✓ Cierra puertas y ventanas<br><br>¡Esperamos que hayas disfrutado tu estancia!"</em>
      <div style="background: white; padding: 1rem; margin-top: 0.5rem; border-radius: 4px; border-left: 3px solid #8b5cf6;">
        <p style="margin: 0; font-size: 0.85rem; color: #4b5563;"><strong>Por qué funciona:</strong> Evita check-outs tardíos y olvidos. El 92% de los huéspedes cumplen el horario cuando reciben este recordatorio.</p>
      </div>
    </li>
    <li style="margin-bottom: 1.5rem;">
      <strong>7. Agradecimiento</strong> (2 horas después del check-out)<br>
      <em style="color: #6b7280; font-size: 0.9rem; display: block; margin-top: 0.5rem;">"¡Gracias por tu estancia, [nombre]! 🙏<br><br>Ha sido un placer tenerte como huésped. Esperamos verte pronto por [ciudad].<br><br>Si vuelves, ya sabes dónde encontrarnos. ¡Buen viaje!"</em>
      <div style="background: white; padding: 1rem; margin-top: 0.5rem; border-radius: 4px; border-left: 3px solid #8b5cf6;">
        <p style="margin: 0; font-size: 0.85rem; color: #4b5563;"><strong>Por qué funciona:</strong> Cierre emocional positivo. Prepara al huésped para el siguiente mensaje (la solicitud de reseña).</p>
      </div>
    </li>
    <li style="margin-bottom: 0;">
      <strong>8. Solicitud de Reseña</strong> (12 horas después del check-out)<br>
      <em style="color: #6b7280; font-size: 0.9rem; display: block; margin-top: 0.5rem;">"¡Hola [nombre]! 🌟<br><br>Tu opinión es muy importante para nosotros. ¿Podrías dejarnos una reseña contándonos tu experiencia?<br><br>Solo te tomará 2 minutos y nos ayuda muchísimo:<br>[Link a reseña]<br><br>¡Mil gracias!"</em>
      <div style="background: white; padding: 1rem; margin-top: 0.5rem; border-radius: 4px; border-left: 3px solid #8b5cf6;">
        <p style="margin: 0; font-size: 0.85rem; color: #4b5563;"><strong>Por qué funciona:</strong> 12h es el timing óptimo: la experiencia está fresca pero ya no están cansados del viaje. Tasa de respuesta: +40% vs solicitar inmediatamente.</p>
      </div>
    </li>
  </ol>
</div>

<div style="background: #ecfdf5; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; border-left: 4px solid #10b981;">
  <p style="margin: 0; font-weight: 600; color: #065f46; font-size: 1.05rem;">📚 ¿Quieres plantillas completas copy-paste listas para usar?</p>
  <p style="margin: 0.5rem 0 1rem 0; color: #047857;">Hemos creado guías completas con +30 plantillas personalizables para cada plataforma:</p>
  <ul style="margin: 0; padding-left: 1.5rem; color: #047857;">
    <li style="margin-bottom: 0.5rem;"><a href="/blog/mensajes-automaticos-airbnb" style="color: #8b5cf6; font-weight: 600; text-decoration: underline;">→ Mensajes Automáticos para Airbnb: Plantillas Copy-Paste 2025</a></li>
    <li style="margin-bottom: 0;"><a href="/blog/mensajes-automaticos-booking" style="color: #8b5cf6; font-weight: 600; text-decoration: underline;">→ Mensajes Automáticos para Booking.com: Plantillas Profesionales 2025</a></li>
  </ul>
  <p style="margin: 1rem 0 0 0; color: #047857; font-size: 0.9rem;">Incluyen: mensajes de pre-llegada, check-in, durante estancia, check-out, respuestas a objeciones comunes, gestión de problemas, y mucho más.</p>
</div>

<h4>Errores comunes al configurar mensajes automáticos:</h4>

<div style="background: #fef2f2; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; border-left: 4px solid #ef4444;">
  <p style="margin: 0; font-weight: 600; color: #991b1b;">❌ Error 1: Usar el mismo mensaje para todas las plataformas</p>
  <p style="margin: 0.5rem 0 0 0; color: #7f1d1d; font-size: 0.95rem;">Los huéspedes de Airbnb esperan un tono más cercano. Los de Booking son más formales. Adapta el tono.</p>
</div>

<div style="background: #fef2f2; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; border-left: 4px solid #ef4444;">
  <p style="margin: 0; font-weight: 600; color: #991b1b;">❌ Error 2: Enviar el código de acceso demasiado pronto</p>
  <p style="margin: 0.5rem 0 0 0; color: #7f1d1d; font-size: 0.95rem;">Si envías el código 24-48h antes, el huésped lo olvida y te pregunta de nuevo. Timing óptimo: 4h antes.</p>
</div>

<div style="background: #fef2f2; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; border-left: 4px solid #ef4444;">
  <p style="margin: 0; font-weight: 600; color: #991b1b;">❌ Error 3: Mensajes demasiado largos</p>
  <p style="margin: 0.5rem 0 0 0; color: #7f1d1d; font-size: 0.95rem;">Nadie lee párrafos de 500 palabras. Usa bullets, emojis y divide información en mensajes separados según timing.</p>
</div>

<p><strong>Resultado de implementar estos 8 mensajes:</strong> Reduces mensajes manuales en un <strong>82%</strong> y mejoras la experiencia del huésped significativamente.</p>`

  // Reemplazar el contenido
  const newContent = article.content.replace(oldMessagingSection, newMessagingSection)

  if (newContent === article.content) {
    console.log('⚠️  No se encontró la sección exacta para reemplazar. Verificando contenido...')
    console.log('Longitud actual:', article.content.length)
    return
  }

  // Actualizar en la base de datos
  await prisma.blogPost.update({
    where: { slug: 'automatizacion-airbnb-stack-completo' },
    data: { content: newContent }
  })

  console.log('✅ Sección de mensajería expandida exitosamente!')
  console.log('📊 Longitud nueva:', newContent.length, 'caracteres')
  console.log('📈 Aumento:', newContent.length - article.content.length, 'caracteres')
  console.log('🔗 Links añadidos:')
  console.log('   - /blog/mensajes-automaticos-airbnb')
  console.log('   - /blog/mensajes-automaticos-booking')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
