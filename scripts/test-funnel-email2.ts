/**
 * Email 2 del embudo: Invitación al Quiz de Perfil Operativo
 * Se envía 2-3 días después del Email 1
 *
 * Objetivo: Llevar al lead al quiz para obtener datos de cualificación
 *
 * Tracking: src=email2&level=2
 */

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmail2Props {
  to: string
  firstName?: string
}

async function sendFunnelEmail2({ to, firstName }: SendEmail2Props) {
  const name = firstName || 'anfitrión'

  // URL de la landing del quiz con tracking (landing → test)
  const quizLandingUrl = `https://itineramio.com/host-profile?src=email2&level=2&email=${encodeURIComponent(to)}`

  const subject = '¿Qué tipo de anfitrión eres?'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">

  <p style="font-size: 16px;">Hola ${name},</p>

  <p style="font-size: 16px;">
    El otro día te mandé las plantillas de mensajes automáticos.
  </p>

  <p style="font-size: 16px;">
    Pero hay algo que no te conté...
  </p>

  <p style="font-size: 16px;">
    <strong>Las plantillas solo funcionan si encajan con tu estilo de gestión.</strong>
  </p>

  <p style="font-size: 16px;">
    He visto anfitriones que copian mensajes de otros y suenan completamente falsos.
    Huéspedes que notan que "algo no cuadra".
  </p>

  <p style="font-size: 16px;">
    El problema no son las plantillas.<br>
    Es que no saben qué tipo de anfitrión son.
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">

  <p style="font-size: 16px;">
    Después de analizar a cientos de anfitriones, identifiqué <strong>8 perfiles operativos</strong>:
  </p>

  <ul style="font-size: 15px; color: #4a4a4a;">
    <li><strong>El Estratega</strong> - Todo es datos y optimización</li>
    <li><strong>El Sistemático</strong> - Procesos y automatización</li>
    <li><strong>El Diferenciador</strong> - Marketing y posicionamiento</li>
    <li><strong>El Ejecutor</strong> - Acción rápida, resultados</li>
    <li><strong>El Resolutor</strong> - Gestión de crisis</li>
    <li><strong>El Experiencial</strong> - Hospitalidad excepcional</li>
    <li><strong>El Equilibrado</strong> - Balance vida-negocio</li>
    <li><strong>El Improvisador</strong> - Adaptación constante</li>
  </ul>

  <p style="font-size: 16px;">
    Cada uno tiene fortalezas únicas.<br>
    Y puntos ciegos que les cuestan dinero sin saberlo.
  </p>

  <p style="font-size: 16px;">
    <strong>¿Cuál eres tú?</strong>
  </p>

  <div style="text-align: center; margin: 35px 0;">
    <a href="${quizLandingUrl}"
       style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 10px; font-weight: 600; font-size: 16px;">
      Descubrir mi Perfil Operativo →
    </a>
  </div>

  <p style="font-size: 15px; color: #666;">
    Son 45 preguntas rápidas (5-7 min).<br>
    Al final sabrás exactamente en qué eres fuerte y qué te está frenando.
  </p>

  <p style="font-size: 15px; color: #666;">
    Además, te enviaré una guía personalizada según tu perfil.
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">

  <p style="font-size: 16px;">
    Los anfitriones que saben su perfil toman mejores decisiones.<br>
    No intentan ser algo que no son.<br>
    Potencian sus fortalezas naturales.
  </p>

  <p style="font-size: 16px;">
    ¿Tienes 5 minutos?
  </p>

  <p style="font-size: 16px; margin-top: 30px;">
    Álex
  </p>

  <p style="font-size: 14px; color: #888; margin-top: 40px;">
    PD: Si ya hiciste el test antes, te dará la opción de ver tus resultados anteriores o hacerlo de nuevo.
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">

  <p style="font-size: 12px; color: #999; text-align: center;">
    Itineramio · Herramientas para anfitriones<br>
    <a href="https://itineramio.com/unsubscribe?email=${encodeURIComponent(to)}" style="color: #999;">Darme de baja</a>
  </p>

</body>
</html>
`

  const text = `
Hola ${name},

El otro día te mandé las plantillas de mensajes automáticos.

Pero hay algo que no te conté...

Las plantillas solo funcionan si encajan con tu estilo de gestión.

He visto anfitriones que copian mensajes de otros y suenan completamente falsos. Huéspedes que notan que "algo no cuadra".

El problema no son las plantillas.
Es que no saben qué tipo de anfitrión son.

---

Después de analizar a cientos de anfitriones, identifiqué 8 perfiles operativos:

- El Estratega - Todo es datos y optimización
- El Sistemático - Procesos y automatización
- El Diferenciador - Marketing y posicionamiento
- El Ejecutor - Acción rápida, resultados
- El Resolutor - Gestión de crisis
- El Experiencial - Hospitalidad excepcional
- El Equilibrado - Balance vida-negocio
- El Improvisador - Adaptación constante

Cada uno tiene fortalezas únicas.
Y puntos ciegos que les cuestan dinero sin saberlo.

¿Cuál eres tú?

→ Descubrir mi Perfil Operativo: ${quizLandingUrl}

Son 45 preguntas rápidas (5-7 min).
Al final sabrás exactamente en qué eres fuerte y qué te está frenando.

Además, te enviaré una guía personalizada según tu perfil.

---

Los anfitriones que saben su perfil toman mejores decisiones.
No intentan ser algo que no son.
Potencian sus fortalezas naturales.

¿Tienes 5 minutos?

Álex

PD: Si ya hiciste el test antes, te dará la opción de ver tus resultados anteriores o hacerlo de nuevo.
`

  try {
    const { data, error } = await resend.emails.send({
      from: 'Álex de Itineramio <alex@itineramio.com>',
      to: [to],
      subject,
      html,
      text,
      tags: [
        { name: 'funnel', value: 'calculator' },
        { name: 'email', value: 'day2-quiz-invite' },
        { name: 'level', value: '2' }
      ]
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error }
    }

    console.log('✅ Email 2 enviado:', data?.id)
    return { success: true, id: data?.id }

  } catch (error) {
    console.error('Error:', error)
    return { success: false, error }
  }
}

// Ejecutar si se llama directamente
const testEmail = process.argv[2] || 'alejandrosatlla@gmail.com'
const testName = process.argv[3] || ''

console.log(`\n📧 Enviando Email 2 (Quiz) a: ${testEmail}\n`)

sendFunnelEmail2({
  to: testEmail,
  firstName: testName || undefined
}).then(result => {
  if (result.success) {
    console.log('\n✅ Email enviado correctamente')
    console.log('ID:', result.id)
  } else {
    console.error('\n❌ Error al enviar:', result.error)
  }
  process.exit(0)
})
