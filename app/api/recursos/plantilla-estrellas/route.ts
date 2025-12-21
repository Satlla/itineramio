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
<body style="margin: 0; padding: 0; font-family: Circular, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, sans-serif; background-color: #f7f7f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px;">

          <!-- Header -->
          <tr>
            <td style="padding: 0 0 32px 0;">
              <p style="margin: 0 0 24px 0; color: #222222; font-size: 14px; letter-spacing: 0.5px;">ITINERAMIO</p>
              <h1 style="margin: 0 0 16px 0; color: #222222; font-size: 28px; font-weight: 600; line-height: 1.3;">Tu plantilla personalizada está lista</h1>
              <p style="margin: 0; color: #484848; font-size: 16px; line-height: 1.6;">Hola ${nombre}, gracias por descargar la plantilla del significado de las estrellas. Esta herramienta te ayudará a comunicar de forma clara a tus huéspedes qué significa cada valoración en Airbnb.</p>
            </td>
          </tr>

          <!-- Template Card -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; border: 1px solid #dddddd;">

                <!-- Card Header -->
                <tr>
                  <td style="padding: 24px 24px 20px 24px; border-bottom: 1px solid #ebebeb;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 20px; font-weight: 600; color: #222222;">Gracias por tu estancia</td>
                      </tr>
                      <tr>
                        <td style="padding-top: 4px; font-size: 14px; color: #717171;">${nombre}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Intro text -->
                <tr>
                  <td style="padding: 20px 24px 8px 24px;">
                    <p style="margin: 0; color: #484848; font-size: 14px; line-height: 1.5;">Tu opinión nos ayuda a mejorar. Antes de valorar, ten en cuenta lo que significa cada puntuación:</p>
                  </td>
                </tr>

                <!-- Stars Section -->
                <tr>
                  <td style="padding: 16px 24px;">
                    <!-- 5 Stars -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                      <tr>
                        <td style="padding: 16px; background: #f7f7f7; border-radius: 8px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size: 16px; color: #222222; font-weight: 600; padding-bottom: 6px;">
                                <span style="color: #FF385C; letter-spacing: 2px;">★★★★★</span>&nbsp;&nbsp;Excelente
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size: 14px; color: #717171; line-height: 1.4;">Todo funcionó correctamente. La estancia cumplió o superó las expectativas.</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- 4 Stars -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                      <tr>
                        <td style="padding: 16px; background: #f7f7f7; border-radius: 8px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size: 16px; color: #222222; font-weight: 600; padding-bottom: 6px;">
                                <span style="color: #FF385C; letter-spacing: 2px;">★★★★</span><span style="color: #dddddd;">★</span>&nbsp;&nbsp;Bueno
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size: 14px; color: #717171; line-height: 1.4;">Hubo algún detalle menor. Avísame antes para poder solucionarlo.</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- 3 Stars or less -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 16px; background: #f7f7f7; border-radius: 8px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size: 16px; color: #222222; font-weight: 600; padding-bottom: 6px;">
                                <span style="color: #FF385C; letter-spacing: 2px;">★★★</span><span style="color: #dddddd;">★★</span>&nbsp;&nbsp;Problemas
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size: 14px; color: #717171; line-height: 1.4;">Hubo problemas significativos. Por favor, contáctame para resolverlo antes de valorar.</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- QR Section -->
                <tr>
                  <td style="padding: 16px 24px 24px 24px; border-top: 1px solid #ebebeb;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <p style="margin: 0; color: #222222; font-size: 14px; font-weight: 600;">¿Algún problema durante tu estancia?</p>
                          <p style="margin: 4px 0 0 0; color: #717171; font-size: 14px;">Escríbeme directamente por WhatsApp y lo solucionamos.</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table cellpadding="0" cellspacing="0" border="0" style="background: #f7f7f7; border-radius: 8px;">
                            <tr>
                              <td style="padding: 12px;">
                                <img src="${qrCodeUrl}" alt="QR WhatsApp" width="72" height="72" style="display: block;" />
                              </td>
                              <td style="padding: 12px 16px 12px 4px; vertical-align: middle;">
                                <p style="margin: 0 0 2px 0; font-size: 13px; color: #717171;">Escanea para contactar</p>
                                <p style="margin: 0; font-size: 15px; color: #222222; font-weight: 600;">${telefono}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Instructions -->
          <tr>
            <td style="padding: 32px 0;">
              <p style="margin: 0 0 16px 0; color: #222222; font-size: 16px; font-weight: 600;">Cómo usar esta plantilla</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0; color: #484848; font-size: 14px; line-height: 1.5;">
                    <strong style="color: #222222;">1.</strong> Imprime este email o guárdalo como PDF desde tu navegador
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #484848; font-size: 14px; line-height: 1.5;">
                    <strong style="color: #222222;">2.</strong> Recorta la tarjeta de la plantilla
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #484848; font-size: 14px; line-height: 1.5;">
                    <strong style="color: #222222;">3.</strong> Enmárcala o plastifícala para mayor durabilidad
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #484848; font-size: 14px; line-height: 1.5;">
                    <strong style="color: #222222;">4.</strong> Colócala en un lugar visible de tu alojamiento (junto al manual de bienvenida o en la entrada)
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 0 0 32px 0;">
              <a href="https://www.itineramio.com/blog/plantilla-significado-estrellas-airbnb-huespedes" style="display: inline-block; background: #222222; color: #ffffff; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Ver el artículo completo
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align: center; padding: 24px 0; border-top: 1px solid #ebebeb;">
              <p style="margin: 0 0 8px 0; color: #717171; font-size: 14px;">
                Enviado por <a href="https://www.itineramio.com" style="color: #222222; text-decoration: underline;">Itineramio</a>
              </p>
              <p style="margin: 0; color: #b0b0b0; font-size: 12px;">
                Herramientas para anfitriones de alquiler vacacional
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
