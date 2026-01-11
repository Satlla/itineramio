// Script para enviar Email 1 del funnel time-calculator
// Ejecutar: npx tsx scripts/test-funnel-email1.ts email@ejemplo.com [propiedades] [horas]
// Ejemplo: npx tsx scripts/test-funnel-email1.ts test@gmail.com 3 156

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const targetEmail = process.argv[2]
const numProperties = process.argv[3] || '3'
const totalHours = process.argv[4] || '156'

if (!targetEmail) {
  console.error('❌ Uso: npx tsx scripts/test-funnel-email1.ts email@ejemplo.com [propiedades] [horas]')
  console.error('   Ejemplo: npx tsx scripts/test-funnel-email1.ts test@gmail.com 3 156')
  process.exit(1)
}

// Calcular desglose aproximado (basado en el total de horas)
const hours = parseInt(totalHours)
const breakdown = {
  wifi: Math.round(hours * 0.15),      // 15% - WiFi y conexión
  parking: Math.round(hours * 0.20),   // 20% - Parking e indicaciones
  electro: Math.round(hours * 0.25),   // 25% - Electrodomésticos
  checkin: Math.round(hours * 0.25),   // 25% - Check-in/out
  normas: Math.round(hours * 0.15),    // 15% - Normas comunidad
}

// Calcular minutos por reserva (asumiendo ~50 reservas/año por propiedad)
const reservasAño = parseInt(numProperties) * 50
const minPerReserva = {
  wifi: Math.round((breakdown.wifi * 60) / reservasAño),
  parking: Math.round((breakdown.parking * 60) / reservasAño),
  electro: Math.round((breakdown.electro * 60) / reservasAño),
  checkin: Math.round((breakdown.checkin * 60) / reservasAño),
  normas: Math.round((breakdown.normas * 60) / reservasAño),
}

const landingUrl = 'https://itineramio.com/recursos/descargas/plantillas-mensajes'
const firstName = targetEmail.split('@')[0].split('.')[0].charAt(0).toUpperCase() +
                  targetEmail.split('@')[0].split('.')[0].slice(1).toLowerCase()

const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white;">

    <!-- Header sutil -->
    <div style="padding: 24px 24px 0; text-align: center;">
      <span style="color: #FF385C; font-weight: 600; font-size: 14px;">Itineramio</span>
    </div>

    <!-- Content -->
    <div style="padding: 24px;">

      <p style="color: #1a1a1a; line-height: 1.7; margin-bottom: 20px;">
        Hola ${firstName},
      </p>

      <p style="color: #1a1a1a; line-height: 1.7; margin-bottom: 20px;">
        <strong>¿Te ha pasado esto?</strong>
      </p>

      <p style="color: #4a4a4a; line-height: 1.7; margin-bottom: 20px;">
        Vas por la autovía, estás en una reunión o simplemente has por fin desconectado… y entra un mensaje de un huésped:
      </p>

      <div style="background: #f9f9f9; border-left: 3px solid #ddd; padding: 16px 20px; margin-bottom: 20px; font-style: italic; color: #555;">
        "¿Cómo se conecta el WiFi?"<br>
        "¿Dónde se tira la basura?"<br>
        "¿Cómo va el microondas?"<br>
        "¿Cómo funciona la caldera para que salga el agua caliente?"
      </div>

      <p style="color: #4a4a4a; line-height: 1.7; margin-bottom: 20px;">
        Y lo peor no es la pregunta.
      </p>

      <p style="color: #4a4a4a; line-height: 1.7; margin-bottom: 20px;">
        <strong>Lo peor es que esa misma pregunta ya te la hicieron otros huéspedes.</strong><br>
        Y aun así, te vuelve a tocar parar lo que estás haciendo, buscar cómo explicarlo, mandar audios, fotos, pasos… y cruzar los dedos para que lo entiendan a la primera.
      </p>

      <p style="color: #4a4a4a; line-height: 1.7; margin-bottom: 20px;">
        A nosotros nos pasó algo muy concreto: un huésped no se aclaraba con la caldera.<br>
        No era "enciende y ya". Era:<br>
        cuándo mover la palanca, en qué presión dejarla, si pasaba algo si se pasaba de presión, si era peligroso, si podía romperse algo…
      </p>

      <p style="color: #4a4a4a; line-height: 1.7; margin-bottom: 20px;">
        Una explicación que en persona es sencilla, por WhatsApp se convierte en una conversación interminable.
      </p>

      <p style="color: #4a4a4a; line-height: 1.7; margin-bottom: 20px;">
        Y luego otro huésped (en domingo) preguntó cómo funcionaba el microondas… cuando en el check-in ya se lo habíamos explicado.
      </p>

      <p style="color: #4a4a4a; line-height: 1.7; margin-bottom: 20px;">
        Y es normal. Ellos vienen de viaje.<br>
        <strong>No vienen a memorizar cómo funcionan tus electrodomésticos ni tus normas.</strong>
      </p>

      <p style="color: #4a4a4a; line-height: 1.7; margin-bottom: 24px;">
        La realidad es esta: las preguntas llegan justo en el peor momento, y casi siempre son repetidas.
      </p>

      <!-- Highlight box con datos -->
      <div style="background: #FFF5F5; border: 1px solid #FFE4E4; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
        <p style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 16px;">
          Según tus datos, estás dedicando aproximadamente <strong style="color: #FF385C; font-size: 20px;">${totalHours} horas al año</strong> a responder lo mismo una y otra vez.
        </p>

        <p style="color: #666; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">
          Desglose estimado por reserva:
        </p>

        <table style="width: 100%; font-size: 14px; color: #4a4a4a;">
          <tr>
            <td style="padding: 4px 0;">📶 WiFi y conexión</td>
            <td style="padding: 4px 0; text-align: right; font-weight: 600;">${minPerReserva.wifi} min/reserva</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;">🅿️ Parking e indicaciones</td>
            <td style="padding: 4px 0; text-align: right; font-weight: 600;">${minPerReserva.parking} min/reserva</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;">🔌 Electrodomésticos</td>
            <td style="padding: 4px 0; text-align: right; font-weight: 600;">${minPerReserva.electro} min/reserva</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;">🔑 Check-in/out</td>
            <td style="padding: 4px 0; text-align: right; font-weight: 600;">${minPerReserva.checkin} min/reserva</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;">📋 Normas de la comunidad</td>
            <td style="padding: 4px 0; text-align: right; font-weight: 600;">${minPerReserva.normas} min/reserva</td>
          </tr>
        </table>
      </div>

      <p style="color: #4a4a4a; line-height: 1.7; margin-bottom: 24px;">
        En los próximos días te voy a enviar formas muy prácticas de reducir ese tiempo drásticamente sin perder atención al huésped (al contrario: suele mejorar).
      </p>

      <p style="color: #4a4a4a; line-height: 1.7; margin-bottom: 24px;">
        Pero si quieres empezar ya, tengo preparado un <strong>pack de plantillas de mensajes automáticos</strong> que usamos nosotros para reducir un 80% las preguntas repetitivas.
      </p>

      <p style="color: #4a4a4a; line-height: 1.7; margin-bottom: 28px;">
        Para enviártelo, solo necesito saber un poco más sobre tu situación actual:
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${landingUrl}?email=${encodeURIComponent(targetEmail)}&src=email1&level=1"
           style="display: inline-block; background: #FF385C; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Quiero las plantillas gratis →
        </a>
      </div>

      <p style="color: #888; font-size: 14px; line-height: 1.6; text-align: center;">
        Solo te llevará 30 segundos responder.
      </p>

    </div>

    <!-- Footer -->
    <div style="background: #f9f9f9; padding: 20px 24px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #888; font-size: 12px; margin: 0;">
        Recibes este email porque usaste nuestra calculadora de tiempo.
      </p>
    </div>

  </div>
</body>
</html>
`

async function sendEmail() {
  console.log(`\n📧 Enviando Email 1 del funnel`)
  console.log(`   Para: ${targetEmail}`)
  console.log(`   Propiedades: ${numProperties}`)
  console.log(`   Horas/año: ${totalHours}\n`)

  try {
    const result = await resend.emails.send({
      from: 'Itineramio <hola@itineramio.com>',
      to: targetEmail,
      subject: 'Otra vez la misma pregunta...',
      html: emailHtml
    })

    console.log('✅ Email enviado!')
    console.log('   ID:', result.data?.id)
    console.log(`\n📍 CTA: ${landingUrl}?email=${encodeURIComponent(targetEmail)}&src=email1&level=1`)

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

sendEmail()
