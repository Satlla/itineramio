import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

function formatPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[^\d+]/g, '')
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.substring(2)
  }
  if (!cleaned.startsWith('+') && cleaned.length === 9) {
    cleaned = '+34' + cleaned
  }
  return cleaned.replace('+', '')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, telefono, email } = body

    if (!nombre || !telefono || !email) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      )
    }

    const whatsappPhone = formatPhoneForWhatsApp(telefono)
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Hola, tengo una pregunta sobre mi estancia')}`
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(whatsappUrl)}&bgcolor=ffffff&color=222222`

    // Save lead to database
    try {
      await prisma.leadMagnetDownload.create({
        data: {
          email,
          leadMagnetSlug: 'plantilla-estrellas-personalizada',
          metadata: { nombre, telefono, whatsappPhone }
        }
      })
    } catch (dbError) {
      console.error('Error saving lead:', dbError)
    }

    // Send email
    await resend.emails.send({
      from: 'Itineramio <recursos@itineramio.com>',
      to: email,
      subject: 'Tu plantilla personalizada del significado de las estrellas',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px;">

          <!-- Intro -->
          <tr>
            <td style="padding: 0 0 24px 0;">
              <h1 style="margin: 0 0 16px 0; color: #222; font-size: 24px;">¡Aquí tienes tu plantilla personalizada!</h1>
              <p style="margin: 0 0 8px 0; color: #333; font-size: 16px;">Hola ${nombre},</p>
              <p style="margin: 0; color: #666; font-size: 15px;">Gracias por descargar la plantilla del significado de las estrellas. Aquí está tu plantilla con tu código QR de WhatsApp.</p>
            </td>
          </tr>

          <!-- Template Card -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: white; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">

                <!-- Header -->
                <tr>
                  <td style="text-align: center; padding: 32px 24px 24px 24px; border-bottom: 1px solid #ebebeb;">
                    <div style="font-size: 40px; margin-bottom: 8px;">🏠</div>
                    <div style="font-size: 24px; font-weight: 600; color: #222; margin-bottom: 4px;">Gracias por tu estancia</div>
                    <div style="color: #717171; font-size: 14px;">${nombre}</div>
                  </td>
                </tr>

                <!-- Stars -->
                <tr>
                  <td style="padding: 24px;">
                    <!-- 5 Stars -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f0fdf4; border-radius: 12px; margin-bottom: 12px;">
                      <tr>
                        <td style="padding: 16px; width: 110px; font-size: 18px;">⭐⭐⭐⭐⭐</td>
                        <td style="padding: 16px;">
                          <div style="font-weight: 600; font-size: 14px; color: #166534;">5 Estrellas</div>
                          <div style="font-size: 12px; color: #717171;">Todo funcionó correctamente</div>
                        </td>
                      </tr>
                    </table>

                    <!-- 4 Stars -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #fefce8; border-radius: 12px; margin-bottom: 12px;">
                      <tr>
                        <td style="padding: 16px; width: 110px; font-size: 18px;">⭐⭐⭐⭐</td>
                        <td style="padding: 16px;">
                          <div style="font-weight: 600; font-size: 14px; color: #a16207;">4 Estrellas</div>
                          <div style="font-size: 12px; color: #717171;">Hubo algún problema menor</div>
                        </td>
                      </tr>
                    </table>

                    <!-- 3 Stars -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #fef2f2; border-radius: 12px;">
                      <tr>
                        <td style="padding: 16px; width: 110px; font-size: 18px;">⭐⭐⭐</td>
                        <td style="padding: 16px;">
                          <div style="font-weight: 600; font-size: 14px; color: #b91c1c;">3 Estrellas o menos</div>
                          <div style="font-size: 12px; color: #717171;">Hubo problemas significativos</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer with QR -->
                <tr>
                  <td style="padding: 0 24px 32px 24px; border-top: 1px solid #ebebeb;">
                    <div style="text-align: center; padding-top: 24px;">
                      <p style="color: #717171; font-size: 13px; margin: 0 0 16px 0;">
                        ¿Algún problema? <span style="color: #FF385C;">Escríbeme directamente</span>
                      </p>
                      <table cellpadding="0" cellspacing="0" border="0" style="background: #f9fafb; border-radius: 16px; margin: 0 auto;">
                        <tr>
                          <td style="padding: 16px;">
                            <img src="${qrCodeUrl}" alt="QR WhatsApp" width="80" height="80" style="display: block;" />
                          </td>
                          <td style="padding: 16px 20px 16px 0; vertical-align: middle; text-align: left;">
                            <div style="font-size: 11px; color: #717171;">Escanea para contactar</div>
                            <div style="font-weight: 600; color: #222; font-size: 14px;">${telefono}</div>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Instructions -->
          <tr>
            <td style="padding: 32px 0;">
              <p style="margin: 0 0 12px 0; color: #222; font-weight: 600;">Cómo usarla:</p>
              <ol style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
                <li>Imprime este email o guárdalo como PDF</li>
                <li>Recorta la plantilla</li>
                <li>Enmárcala o plastifícala</li>
                <li>Colócala en un lugar visible de tu alojamiento</li>
              </ol>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 0 0 32px 0;">
              <a href="https://www.itineramio.com/blog/plantilla-significado-estrellas-airbnb-huespedes" style="display: inline-block; background: linear-gradient(135deg, #FF385C 0%, #E31C5F 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Ver artículo completo
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align: center; padding: 24px 0; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #717171; font-size: 14px;">
                Este email fue enviado por <a href="https://www.itineramio.com" style="color: #FF385C; text-decoration: none;">Itineramio</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Si no solicitaste esta plantilla, puedes ignorar este mensaje.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error generating template:', error)
    return NextResponse.json(
      { error: 'Error al generar la plantilla' },
      { status: 500 }
    )
  }
}
