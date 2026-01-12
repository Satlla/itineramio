/**
 * Email 3 del embudo: Invitación a Sesión de Manual Digital
 * Se envía 2-3 días después del Email 2 (a quienes completaron el quiz)
 *
 * Objetivo: Cerrar el funnel con una llamada de consultoría
 * Enfoque: Profesional, valor claro (99€ gratis), sin presión
 *
 * Tracking: src=email3&level=3
 */

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmail3Props {
  to: string
  firstName?: string
  archetype?: string  // From quiz results
}

const ARCHETYPE_INSIGHTS: Record<string, string> = {
  'ESTRATEGA': 'tu capacidad analítica y orientación a datos',
  'SISTEMATICO': 'tu enfoque estructurado y metódico',
  'DIFERENCIADOR': 'tu propuesta única y visión de marca',
  'EJECUTOR': 'tu capacidad de acción y obtención de resultados',
  'RESOLUTOR': 'tu habilidad para gestionar situaciones complejas',
  'EXPERIENCIAL': 'tu enfoque en la experiencia del huésped',
  'EQUILIBRADO': 'tu visión integral del negocio',
  'IMPROVISADOR': 'tu flexibilidad y capacidad de adaptación'
}

async function sendFunnelEmail3({ to, firstName, archetype }: SendEmail3Props) {
  const name = firstName || ''
  const greeting = name ? `Hola ${name},` : 'Hola,'
  const archetypeInsight = archetype ? ARCHETYPE_INSIGHTS[archetype] : 'tus fortalezas como anfitrión'

  // URL de la landing de consultoría con tracking
  const consultaUrl = `https://itineramio.com/consulta?src=email3&level=3&email=${encodeURIComponent(to)}`

  const subject = 'Hemos revisado tu perfil de anfitrión'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">

  <p style="font-size: 16px;">${greeting}</p>

  <p style="font-size: 16px;">
    He estado revisando los resultados de tu test de perfil operativo y quería escribirte personalmente.
  </p>

  <p style="font-size: 16px;">
    Analizando ${archetypeInsight}, creo que podríamos ayudarte a optimizar significativamente tu operativa como anfitrión.
  </p>

  <p style="font-size: 16px;">
    Por eso me gustaría ofrecerte una <strong>sesión gratuita de creación de Manual Digital</strong> para tu alojamiento.
  </p>

  <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 25px 0;">
    <p style="margin: 0 0 15px 0; font-size: 15px; color: #475569;">
      <strong>¿Qué incluye esta sesión?</strong>
    </p>
    <ul style="margin: 0; padding-left: 20px; color: #334155;">
      <li style="margin-bottom: 8px;">Análisis personalizado de tu operativa actual</li>
      <li style="margin-bottom: 8px;">Identificación de puntos de mejora específicos</li>
      <li style="margin-bottom: 8px;">Creación del esquema de tu Manual Digital</li>
      <li style="margin-bottom: 8px;">Plan de acción concreto para implementar</li>
    </ul>
    <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; font-size: 14px; color: #64748b;">
        <span style="text-decoration: line-through;">Valor: 99€</span>
        <span style="margin-left: 10px; background: #10b981; color: white; padding: 4px 10px; border-radius: 20px; font-weight: 600;">GRATIS</span>
      </p>
    </div>
  </div>

  <p style="font-size: 16px;">
    Es una videollamada de 30 minutos donde trabajaremos juntos en tu caso específico. Sin compromiso, sin letra pequeña.
  </p>

  <div style="text-align: center; margin: 35px 0;">
    <a href="${consultaUrl}"
       style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 10px; font-weight: 600; font-size: 16px;">
      Reservar mi sesión gratuita
    </a>
  </div>

  <p style="font-size: 15px; color: #64748b; text-align: center;">
    Elige el día y hora que mejor te venga.
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">

  <p style="font-size: 16px;">
    Ofrezco estas sesiones de forma limitada porque requieren preparación previa. Si te interesa, te recomiendo reservar pronto.
  </p>

  <p style="font-size: 16px; margin-top: 25px;">
    Un saludo,<br>
    <strong>Álex</strong><br>
    <span style="color: #64748b; font-size: 14px;">Fundador de Itineramio</span>
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">

  <p style="font-size: 12px; color: #999; text-align: center;">
    Itineramio · Herramientas para anfitriones profesionales<br>
    <a href="https://itineramio.com/unsubscribe?email=${encodeURIComponent(to)}" style="color: #999;">Darme de baja</a>
  </p>

</body>
</html>
`

  const text = `
${greeting}

He estado revisando los resultados de tu test de perfil operativo y quería escribirte personalmente.

Analizando ${archetypeInsight}, creo que podríamos ayudarte a optimizar significativamente tu operativa como anfitrión.

Por eso me gustaría ofrecerte una sesión gratuita de creación de Manual Digital para tu alojamiento.

¿Qué incluye esta sesión?

- Análisis personalizado de tu operativa actual
- Identificación de puntos de mejora específicos
- Creación del esquema de tu Manual Digital
- Plan de acción concreto para implementar

Valor: 99€ → GRATIS

Es una videollamada de 30 minutos donde trabajaremos juntos en tu caso específico. Sin compromiso, sin letra pequeña.

→ Reservar mi sesión gratuita: ${consultaUrl}

Elige el día y hora que mejor te venga.

---

Ofrezco estas sesiones de forma limitada porque requieren preparación previa. Si te interesa, te recomiendo reservar pronto.

Un saludo,
Álex
Fundador de Itineramio
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
        { name: 'email', value: 'day5-manual-digital' },
        { name: 'level', value: '3' }
      ]
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error }
    }

    console.log('✅ Email 3 enviado:', data?.id)
    return { success: true, id: data?.id }

  } catch (error) {
    console.error('Error:', error)
    return { success: false, error }
  }
}

// Ejecutar si se llama directamente
const testEmail = process.argv[2] || 'alejandrosatlla@gmail.com'
const testName = process.argv[3] || ''
const testArchetype = process.argv[4] || ''

console.log(`\n📧 Enviando Email 3 (Manual Digital) a: ${testEmail}\n`)

sendFunnelEmail3({
  to: testEmail,
  firstName: testName || undefined,
  archetype: testArchetype || undefined
}).then(result => {
  if (result.success) {
    console.log('\n✅ Email enviado correctamente')
    console.log('ID:', result.id)
  } else {
    console.error('\n❌ Error al enviar:', result.error)
  }
  process.exit(0)
})
