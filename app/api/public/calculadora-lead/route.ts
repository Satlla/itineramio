import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email-improved'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, nombre, resultado, formData } = body

    if (!email || !resultado) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    // Guardar lead (o actualizar si ya existe el mismo email + source)
    const existing = await prisma.lead.findFirst({
      where: { email, source: 'calculadora' },
      select: { id: true },
    })

    if (existing) {
      await prisma.lead.update({
        where: { id: existing.id },
        data: {
          name: nombre || email,
          metadata: { resultado, formData, updatedAt: new Date().toISOString() },
          propertyCount: String(formData?.alojamientos ?? ''),
        },
      })
    } else {
      await prisma.lead.create({
        data: {
          email,
          name: nombre || email,
          source: 'calculadora',
          ipAddress: ip,
          metadata: { resultado, formData },
          propertyCount: String(formData?.alojamientos ?? ''),
        },
      })
    }

    // Enviar email con el informe
    const name = nombre || 'Anfitrión'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.itineramio.com'

    await sendEmail({
      to: email,
      subject: `Tu diagnóstico: pierdes ${resultado.totalHorasMes}h/mes y €${resultado.costeMes.toLocaleString('es-ES')}/mes`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 20px; color: #1a1a1a; background: #ffffff;">

          <div style="background: #0D0D1F; border-radius: 12px; padding: 28px; margin-bottom: 28px; text-align: center;">
            <p style="color: #FF1A8C; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; margin: 0 0 8px 0; text-transform: uppercase;">Diagnóstico personalizado</p>
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0 0 8px 0; line-height: 1.2;">
              Nivel ${resultado.grade} — ${resultado.nivelRiesgo}
            </h1>
            <p style="color: rgba(255,255,255,0.4); font-size: 14px; margin: 0;">
              Basado en el análisis de 847 anfitriones en España · 2024
            </p>
          </div>

          <p style="font-size: 15px; line-height: 1.7; color: #374151;">Hola ${name},</p>
          <p style="font-size: 15px; line-height: 1.7; color: #374151;">
            Aquí tienes tu informe completo. Los números son claros:
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <tr>
              <td style="padding: 12px 16px; border: 1px solid #e5e7eb; background: #f9fafb;">
                <span style="font-size: 12px; color: #9ca3af; display: block; margin-bottom: 4px;">HORAS PERDIDAS AL MES</span>
                <span style="font-size: 24px; font-weight: 800; color: #1a1a1a;">${resultado.totalHorasMes}h</span>
              </td>
              <td style="padding: 12px 16px; border: 1px solid #e5e7eb; background: #f9fafb;">
                <span style="font-size: 12px; color: #9ca3af; display: block; margin-bottom: 4px;">COSTE MENSUAL</span>
                <span style="font-size: 24px; font-weight: 800; color: #EF4444;">€${resultado.costeMes.toLocaleString('es-ES')}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; border: 1px solid #e5e7eb;">
                <span style="font-size: 12px; color: #9ca3af; display: block; margin-bottom: 4px;">COSTE ANUAL</span>
                <span style="font-size: 24px; font-weight: 800; color: #1a1a1a;">€${resultado.costeAnio.toLocaleString('es-ES')}</span>
              </td>
              <td style="padding: 12px 16px; border: 1px solid #e5e7eb;">
                <span style="font-size: 12px; color: #9ca3af; display: block; margin-bottom: 4px;">DÍAS PERDIDOS AL AÑO</span>
                <span style="font-size: 24px; font-weight: 800; color: #8B5CF6;">${resultado.diasPerdidosAnio} días</span>
              </td>
            </tr>
          </table>

          <h2 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 28px 0 12px 0;">Desglose</h2>
          <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">
            <strong style="color: #1a1a1a;">Mensajes repetitivos:</strong> ${resultado.desglose.mensajes}h/mes
            <br>WiFi, acceso, normas, checkout, parking — mensajes que nadie debería tener que responder.
          </p>
          <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">
            <strong style="color: #1a1a1a;">Coste de interrupciones:</strong> ${resultado.desglose.interrupciones}h/mes
            <br>Mensajes fuera de horario + coste de reconcentración (~18 min/interrupción).
          </p>
          <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px 0;">
            <strong style="color: #1a1a1a;">Coordinación de llegadas:</strong> ${resultado.desglose.coordinacion}h/mes
            <br>Coordinación y preparación media por propiedad.
          </p>

          <div style="background: #fff7f0; border: 1px solid #fde68a; border-radius: 10px; padding: 20px; margin-bottom: 28px;">
            <h3 style="font-size: 16px; font-weight: 700; color: #92400e; margin: 0 0 8px 0;">El 71% de estos mensajes son 100% evitables</h3>
            <p style="font-size: 14px; color: #78350f; margin: 0; line-height: 1.6;">
              Son ${resultado.mensajesEvitablesMes} mensajes al mes que desaparecerían si tu huésped tuviera la información antes de necesitarla.
              Los anfitriones que usan Itineramio lo notan en la primera semana.
            </p>
          </div>

          <h2 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0 0 12px 0;">Plan de acción — esta semana</h2>
          <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;"><strong style="color: #1a1a1a;">Paso 1:</strong> Crea tu guía digital en Itineramio. El asistente de IA la genera en 10 minutos a partir de la dirección de tu alojamiento.</p>
          <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;"><strong style="color: #1a1a1a;">Paso 2:</strong> Imprime el QR y ponlo en la entrada. Antes del check-in, envía el enlace por Airbnb/Booking.</p>
          <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px 0;"><strong style="color: #1a1a1a;">Paso 3:</strong> Activa el chatbot IA. Responde en el idioma del huésped. Tú no haces nada.</p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${appUrl}/register" style="display: inline-block; background: #FF1A8C; color: #ffffff; padding: 16px 36px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 16px;">
              Empezar gratis — 15 días sin tarjeta →
            </a>
            <p style="font-size: 12px; color: #9ca3af; margin: 12px 0 0 0;">Configuración en 10 minutos · Sin contrato · Sin instalación</p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
          <p style="font-size: 12px; color: #9ca3af; line-height: 1.6;">
            <strong>Metodología:</strong> Datos de 847 anfitriones activos en Airbnb y Booking.com en España (ene-dic 2024). Coste calculado a €35/h (autónomo España incl. SS). Multiplicador internacional calibrado sobre diferencial de mensajes hispanohablantes vs no hispanohablantes.
          </p>
          <p style="font-size: 13px; color: #6b7280; margin-top: 16px;">Alejandro — Itineramio</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
