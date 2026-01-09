import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hostName, whatsappNumber, email } = body

    // Validation
    if (!hostName || !whatsappNumber || !email) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email no válido' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Create or update lead
    const existingLead = await prisma.lead.findFirst({
      where: {
        email: normalizedEmail,
        source: 'plantilla-estrellas',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })

    if (!existingLead) {
      await prisma.lead.create({
        data: {
          name: hostName,
          email: normalizedEmail,
          source: 'plantilla-estrellas',
          metadata: { whatsappNumber },
          userAgent: request.headers.get('user-agent') || undefined,
          ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined
        }
      })
    }

    // Update or create EmailSubscriber
    const existingSubscriber = await prisma.emailSubscriber.findUnique({
      where: { email: normalizedEmail }
    })

    if (!existingSubscriber) {
      await prisma.emailSubscriber.create({
        data: {
          email: normalizedEmail,
          name: hostName,
          source: 'Plantilla Estrellas',
          status: 'active',
          sequenceStatus: 'active',
          sequenceStartedAt: new Date(),
          tags: ['plantilla-estrellas'],
          currentJourneyStage: 'lead',
          engagementScore: 'warm'
        }
      })
    } else {
      await prisma.emailSubscriber.update({
        where: { email: normalizedEmail },
        data: {
          tags: {
            push: 'plantilla-estrellas'
          }
        }
      })
    }

    // Clean phone number for WhatsApp URL
    const cleanNumber = whatsappNumber.replace(/[\s\-\(\)]/g, '')
    const phoneForUrl = cleanNumber.startsWith('+') ? cleanNumber.slice(1) : cleanNumber
    const whatsappUrl = `https://wa.me/${phoneForUrl}?text=Hola%20${encodeURIComponent(hostName)}%2C%20soy%20tu%20huésped`

    // Send email with the template
    await resend.emails.send({
      from: 'Itineramio <hola@itineramio.com>',
      to: normalizedEmail,
      subject: 'Tu Plantilla de Estrellas Personalizada',
      html: generateEmailHTML(hostName, whatsappUrl)
    })

    console.log(`[Plantilla Estrellas] Enviada a ${normalizedEmail}`)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error en plantilla-estrellas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

function generateEmailHTML(hostName: string, whatsappUrl: string): string {
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(whatsappUrl)}&color=25D366`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu Plantilla de Estrellas</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f8f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 16px;">
    <tr>
      <td style="text-align: center; padding-bottom: 24px;">
        <p style="margin: 0; color: #717171; font-size: 13px; letter-spacing: 0.5px;">ITINERAMIO</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #DDDDDD;">
        <h1 style="margin: 0 0 16px 0; color: #222222; font-size: 24px; font-weight: 600;">
          ${hostName}, aquí está tu plantilla
        </h1>

        <p style="margin: 0 0 24px 0; color: #717171; font-size: 16px; line-height: 1.6;">
          Imprime esta plantilla y colócala en tu alojamiento. Tus huéspedes entenderán
          cómo funciona el sistema de valoraciones y te contactarán antes de puntuar si algo no fue perfecto.
        </p>

        <!-- The Printable Card -->
        <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FFEDD5 100%); border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 2px solid #F59E0B;">

          <h2 style="margin: 0 0 8px 0; color: #111827; font-size: 20px; font-weight: 700; text-align: center;">
            ¿Cómo valorar tu estancia?
          </h2>
          <p style="margin: 0 0 20px 0; color: #6B7280; font-size: 14px; text-align: center;">
            En Airbnb, menos de 5 estrellas afecta al anfitrión
          </p>

          <!-- Stars meanings -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
            <tr>
              <td style="background: white; padding: 10px 12px; border-radius: 8px; margin-bottom: 8px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="12" style="padding-right: 10px;"><div style="width: 10px; height: 10px; background: #22C55E; border-radius: 50%;"></div></td>
                    <td width="90" style="font-size: 16px;">⭐⭐⭐⭐⭐</td>
                    <td><strong style="color: #111827;">Perfecto</strong> <span style="color: #6B7280; font-size: 13px;">– Todo fue excelente</span></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr><td style="height: 8px;"></td></tr>
            <tr>
              <td style="background: white; padding: 10px 12px; border-radius: 8px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="12" style="padding-right: 10px;"><div style="width: 10px; height: 10px; background: #EAB308; border-radius: 50%;"></div></td>
                    <td width="90" style="font-size: 16px;">⭐⭐⭐⭐</td>
                    <td><strong style="color: #111827;">Bien, pero...</strong> <span style="color: #6B7280; font-size: 13px;">– Algo podría mejorar</span></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr><td style="height: 8px;"></td></tr>
            <tr>
              <td style="background: white; padding: 10px 12px; border-radius: 8px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="12" style="padding-right: 10px;"><div style="width: 10px; height: 10px; background: #F97316; border-radius: 50%;"></div></td>
                    <td width="90" style="font-size: 16px;">⭐⭐⭐</td>
                    <td><strong style="color: #111827;">Problemas</strong> <span style="color: #6B7280; font-size: 13px;">– Hubo inconvenientes</span></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr><td style="height: 8px;"></td></tr>
            <tr>
              <td style="background: white; padding: 10px 12px; border-radius: 8px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="12" style="padding-right: 10px;"><div style="width: 10px; height: 10px; background: #EF4444; border-radius: 50%;"></div></td>
                    <td width="90" style="font-size: 16px;">⭐⭐</td>
                    <td><strong style="color: #111827;">Muy malo</strong> <span style="color: #6B7280; font-size: 13px;">– Experiencia negativa</span></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr><td style="height: 8px;"></td></tr>
            <tr>
              <td style="background: white; padding: 10px 12px; border-radius: 8px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="12" style="padding-right: 10px;"><div style="width: 10px; height: 10px; background: #B91C1C; border-radius: 50%;"></div></td>
                    <td width="90" style="font-size: 16px;">⭐</td>
                    <td><strong style="color: #111827;">Inaceptable</strong> <span style="color: #6B7280; font-size: 13px;">– Evitar completamente</span></td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Contact box -->
          <div style="background: #DCFCE7; border-radius: 12px; padding: 16px; border: 1px solid #BBF7D0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin: 0 0 4px 0; color: #166534; font-size: 14px; font-weight: 600;">
                    ¿Algo no fue perfecto?
                  </p>
                  <p style="margin: 0 0 8px 0; color: #15803D; font-size: 13px;">
                    Escríbeme antes de puntuar y lo solucionamos.
                  </p>
                  <p style="margin: 0; color: #166534; font-size: 14px; font-weight: 600;">
                    ${hostName}, anfitrión
                  </p>
                </td>
                <td width="100" align="right">
                  <img src="${qrApiUrl}" alt="QR WhatsApp" width="80" height="80" style="border-radius: 8px; background: white; padding: 4px;">
                  <p style="margin: 4px 0 0 0; color: #15803D; font-size: 10px; text-align: center;">WhatsApp</p>
                </td>
              </tr>
            </table>
          </div>
        </div>
        <!-- End Printable Card -->

        <p style="margin: 0 0 16px 0; color: #222222; font-size: 15px; line-height: 1.6;">
          <strong>Cómo usar esta plantilla:</strong>
        </p>
        <ol style="margin: 0 0 24px 0; padding-left: 20px; color: #717171; font-size: 14px; line-height: 1.8;">
          <li>Imprime este email o haz una captura de la plantilla</li>
          <li>Enmarca o plastifica la tarjeta</li>
          <li>Colócala en un lugar visible del alojamiento (mesa del salón, entrada...)</li>
          <li>También puedes incluirla en tu manual digital de bienvenida</li>
        </ol>

        <p style="margin: 0; color: #717171; font-size: 14px; font-style: italic;">
          ¿Necesitas un manual digital completo para tus huéspedes?
          <a href="https://www.itineramio.com/register" style="color: #F59E0B;">Crea el tuyo con Itineramio</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="text-align: center; padding-top: 24px;">
        <p style="margin: 0; color: #717171; font-size: 12px;">
          <a href="https://www.itineramio.com/api/email/unsubscribe?email=${encodeURIComponent('')}" style="color: #717171; text-decoration: none;">Cancelar suscripción</a>
          ·
          <a href="https://www.itineramio.com" style="color: #717171; text-decoration: none;">itineramio.com</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`
}
