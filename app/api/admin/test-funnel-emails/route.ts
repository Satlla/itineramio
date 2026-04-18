import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { sendEmail, emailTemplates } from '@/lib/email'

/**
 * POST /api/admin/test-funnel-emails
 * Envía todos los emails del embudo demo + calculadora al admin para revisión.
 * Solo accesible por admin.
 */
export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const to = user.email
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.itineramio.com'
  const results: Array<{ name: string; success: boolean; error?: string }> = []

  // Datos de ejemplo
  const leadName = 'Alejandro'
  const propertyName = 'Apartamento Sol Madrid'
  const propertyId = 'test-property-123'
  const couponCode = 'DEMO-TEST20'
  const couponExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })
  const guideUrl = `${appUrl}/guide/${propertyId}?demo=1`
  const registerUrl = `${appUrl}/register?coupon=${couponCode}&propertyId=${propertyId}&utm_source=demo&utm_medium=email`

  const emails = [
    {
      name: '1/8 — DEMO: Confirmación (T+0)',
      subject: `[TEST 1/8] Tu demo de ${propertyName} está lista`,
      html: emailTemplates.demoConfirmation({
        leadName,
        propertyName,
        guideUrl,
        zonesCount: 12,
        couponCode,
        couponExpiresAt,
        registerUrl,
      }),
    },
    {
      name: '2/8 — DEMO: Feedback (T+1-2h)',
      subject: `[TEST 2/8] ¿Qué te ha parecido tu guía de ${propertyName}?`,
      html: emailTemplates.demoFeedback({
        leadName,
        propertyName,
        feedbackUrl: `${appUrl}/demo-feedback?leadId=test&coupon=${couponCode}&property=${encodeURIComponent(propertyName)}&propertyId=${propertyId}`,
        couponCode,
        couponExpiresAt,
      }),
    },
    {
      name: '3/8 — DEMO: Chatbot IA (T+5-7h)',
      subject: `[TEST 3/8] ${leadName}, mira lo que tu chatbot IA puede hacer`,
      html: emailTemplates.demoChatbotEngagement({
        leadName,
        propertyName,
        couponCode,
        registerUrl: `${registerUrl}&utm_campaign=chatbot`,
      }),
    },
    {
      name: '4/8 — DEMO: FOMO Social Proof (T+11-13h)',
      subject: `[TEST 4/8] 127 anfitriones activaron su manual esta semana`,
      html: emailTemplates.demoFomo({
        leadName,
        propertyName,
        hostsThisWeek: 127,
        couponCode,
        registerUrl: `${registerUrl}&utm_campaign=fomo`,
      }),
    },
    {
      name: '5/8 — DEMO: Activación 3 pasos (T+20-22h)',
      subject: `[TEST 5/8] ${leadName}, 3 pasos para que tu manual funcione al 100%`,
      html: emailTemplates.demoActivation({
        leadName,
        propertyName,
        couponCode,
        registerUrl: `${registerUrl}&utm_campaign=activation`,
        guideUrl,
      }),
    },
    {
      name: '6/8 — DEMO: Urgencia cupón (T+23-25h)',
      subject: `[TEST 6/8] ⏰ Tu cupón del 20% para ${propertyName} expira en 1 hora`,
      html: emailTemplates.demoUrgency({
        leadName,
        propertyName,
        couponCode,
        registerUrl: `${registerUrl}&utm_campaign=urgency`,
      }),
    },
    {
      name: '7/8 — DEMO: Last Chance (T+47-49h)',
      subject: `[TEST 7/8] Tu manual de ${propertyName} ha expirado`,
      html: emailTemplates.demoLastChance({
        leadName,
        propertyName,
        registerUrl: `${registerUrl}&utm_campaign=lastchance`,
      }),
    },
    {
      name: '8/8 — CALCULADORA: Diagnóstico',
      subject: `[TEST 8/8] Tu diagnóstico: pierdes 18h/mes y €630/mes`,
      html: buildCalculadoraEmail(leadName, appUrl),
    },
  ]

  // Enviar con 1s delay entre cada uno para no saturar Resend
  for (const email of emails) {
    try {
      await sendEmail({
        to,
        subject: email.subject,
        html: email.html,
        from: 'Itineramio Test <hola@itineramio.com>',
      })
      results.push({ name: email.name, success: true })
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      results.push({ name: email.name, success: false, error: String(error) })
    }
  }

  return NextResponse.json({
    sent: results.filter(r => r.success).length,
    total: results.length,
    to,
    results,
  })
}

function buildCalculadoraEmail(name: string, appUrl: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 20px; color: #1a1a1a; background: #ffffff;">
      <div style="background: #0D0D1F; border-radius: 12px; padding: 28px; margin-bottom: 28px; text-align: center;">
        <p style="color: #FF1A8C; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; margin: 0 0 8px 0; text-transform: uppercase;">Diagnóstico personalizado</p>
        <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0 0 8px 0; line-height: 1.2;">Nivel C — Riesgo medio-alto</h1>
        <p style="color: rgba(255,255,255,0.4); font-size: 14px; margin: 0;">Basado en el análisis de 847 anfitriones en España · 2024</p>
      </div>
      <p style="font-size: 15px; line-height: 1.7; color: #374151;">Hola ${name},</p>
      <p style="font-size: 15px; line-height: 1.7; color: #374151;">Aquí tienes tu informe completo. Los números son claros:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
        <tr>
          <td style="padding: 12px 16px; border: 1px solid #e5e7eb; background: #f9fafb;">
            <span style="font-size: 12px; color: #9ca3af; display: block; margin-bottom: 4px;">HORAS PERDIDAS AL MES</span>
            <span style="font-size: 24px; font-weight: 800; color: #1a1a1a;">18h</span>
          </td>
          <td style="padding: 12px 16px; border: 1px solid #e5e7eb; background: #f9fafb;">
            <span style="font-size: 12px; color: #9ca3af; display: block; margin-bottom: 4px;">COSTE MENSUAL</span>
            <span style="font-size: 24px; font-weight: 800; color: #EF4444;">€630</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; border: 1px solid #e5e7eb;">
            <span style="font-size: 12px; color: #9ca3af; display: block; margin-bottom: 4px;">COSTE ANUAL</span>
            <span style="font-size: 24px; font-weight: 800; color: #1a1a1a;">€7.560</span>
          </td>
          <td style="padding: 12px 16px; border: 1px solid #e5e7eb;">
            <span style="font-size: 12px; color: #9ca3af; display: block; margin-bottom: 4px;">DÍAS PERDIDOS AL AÑO</span>
            <span style="font-size: 24px; font-weight: 800; color: #8B5CF6;">27 días</span>
          </td>
        </tr>
      </table>
      <h2 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 28px 0 12px 0;">Desglose</h2>
      <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;"><strong style="color: #1a1a1a;">Mensajes repetitivos:</strong> 8h/mes<br>WiFi, acceso, normas, checkout, parking — mensajes que nadie debería tener que responder.</p>
      <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;"><strong style="color: #1a1a1a;">Coste de interrupciones:</strong> 6h/mes<br>Mensajes fuera de horario + coste de reconcentración (~18 min/interrupción).</p>
      <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px 0;"><strong style="color: #1a1a1a;">Coordinación de llegadas:</strong> 4h/mes<br>Coordinación y preparación media por propiedad.</p>
      <div style="background: #fff7f0; border: 1px solid #fde68a; border-radius: 10px; padding: 20px; margin-bottom: 28px;">
        <h3 style="font-size: 16px; font-weight: 700; color: #92400e; margin: 0 0 8px 0;">El 71% de estos mensajes son 100% evitables</h3>
        <p style="font-size: 14px; color: #78350f; margin: 0; line-height: 1.6;">Son 43 mensajes al mes que desaparecerían si tu huésped tuviera la información antes de necesitarla. Los anfitriones que usan Itineramio lo notan en la primera semana.</p>
      </div>
      <h2 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0 0 12px 0;">Plan de acción — esta semana</h2>
      <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;"><strong style="color: #1a1a1a;">Paso 1:</strong> Crea tu guía digital en Itineramio. El asistente de IA la genera en 10 minutos a partir de la dirección de tu alojamiento.</p>
      <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;"><strong style="color: #1a1a1a;">Paso 2:</strong> Imprime el QR y ponlo en la entrada. Antes del check-in, envía el enlace por Airbnb/Booking.</p>
      <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px 0;"><strong style="color: #1a1a1a;">Paso 3:</strong> Activa el chatbot IA. Responde en el idioma del huésped. Tú no haces nada.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${appUrl}/demo?ref=calculadora" style="display: inline-block; background: #FF1A8C; color: #ffffff; padding: 16px 36px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 16px;">Pruébalo con tu alojamiento real →</a>
        <p style="font-size: 12px; color: #9ca3af; margin: 12px 0 0 0;">Configuración en 5 minutos · Sin tarjeta · Sin instalación</p>
      </div>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
      <p style="font-size: 12px; color: #9ca3af; line-height: 1.6;"><strong>Metodología:</strong> Datos de 847 anfitriones activos en Airbnb y Booking.com en España (ene-dic 2024). Coste calculado a €35/h (autónomo España incl. SS).</p>
      <p style="font-size: 13px; color: #6b7280; margin-top: 16px;">Alejandro — Itineramio</p>
    </div>
  `
}
