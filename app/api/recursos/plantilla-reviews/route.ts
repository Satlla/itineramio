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
          leadMagnetSlug: 'plantilla-reviews',
          metadata: { nombre, telefono, whatsappPhone }
        }
      })
    } catch (dbError) {
      console.error('Error saving lead:', dbError)
    }

    // Send email
    const emailResult = await resend.emails.send({
      from: 'Itineramio <recursos@itineramio.com>',
      to: email,
      subject: 'Tu Guía Rápida de Reseñas - Plantilla PRO',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f8f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px;">

          <!-- Email Header -->
          <tr>
            <td style="padding: 0 0 32px 0; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Itineramio</p>
              <h1 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Tu plantilla PRO está lista</h1>
              <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">Hola ${nombre}, aquí tienes tu Guía Rápida de Reseñas personalizada.</p>
            </td>
          </tr>

          <!-- ========== PLANTILLA PRO IMPRIMIBLE ========== -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border: 1px solid #e0e0e0;">

                <!-- Header con nombre del alojamiento -->
                <tr>
                  <td style="padding: 28px 28px 0 28px;">
                    <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #999;">Alojamiento</p>
                    <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">${nombre}</p>
                  </td>
                </tr>

                <!-- Título principal -->
                <tr>
                  <td style="padding: 24px 28px 0 28px; border-bottom: 1px solid #f0f0f0;">
                    <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 600; color: #1a1a1a;">Guía rápida de reseñas</h2>
                    <p style="margin: 0 0 20px 0; font-size: 13px; color: #666; line-height: 1.5;">Tu opinión ayuda a futuros viajeros y nos permite mejorar.</p>
                  </td>
                </tr>

                <!-- Contexto -->
                <tr>
                  <td style="padding: 20px 28px; background: #fafafa;">
                    <p style="margin: 0; font-size: 13px; color: #555; line-height: 1.6;">En Airbnb, las estrellas suelen interpretarse de forma distinta a la escala tradicional. En general, <strong>5 estrellas</strong> significa que la estancia fue buena y que el alojamiento cumplió lo prometido.</p>
                  </td>
                </tr>

                <!-- CTA suave -->
                <tr>
                  <td style="padding: 20px 28px; border-bottom: 1px solid #f0f0f0;">
                    <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">Antes de valorar</p>
                    <p style="margin: 0; font-size: 13px; color: #666; line-height: 1.5;">Si algo no ha estado perfecto, por favor cuéntanoslo. La mayoría de incidencias (Wi-Fi, climatización, ruido, reposición) se resuelven rápido si lo sabemos a tiempo.</p>
                  </td>
                </tr>

                <!-- Escala de estrellas -->
                <tr>
                  <td style="padding: 20px 28px;">
                    <p style="margin: 0 0 16px 0; font-size: 12px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">Escala orientativa</p>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <!-- 5 estrellas -->
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f5f5f5;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 90px; vertical-align: top;">
                                <span style="font-size: 14px; color: #1a1a1a; letter-spacing: 1px;">★★★★★</span>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0; font-size: 13px; color: #333;">Todo estuvo según lo descrito y la experiencia fue buena.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- 4 estrellas -->
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f5f5f5;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 90px; vertical-align: top;">
                                <span style="font-size: 14px; letter-spacing: 1px;"><span style="color: #1a1a1a;">★★★★</span><span style="color: #ddd;">★</span></span>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0; font-size: 13px; color: #333;">Hubo algún aspecto importante que no cumplió expectativas.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- 3 estrellas -->
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f5f5f5;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 90px; vertical-align: top;">
                                <span style="font-size: 14px; letter-spacing: 1px;"><span style="color: #1a1a1a;">★★★</span><span style="color: #ddd;">★★</span></span>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0; font-size: 13px; color: #333;">Hubo varios problemas relevantes que afectaron la estancia.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- 2 estrellas -->
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f5f5f5;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 90px; vertical-align: top;">
                                <span style="font-size: 14px; letter-spacing: 1px;"><span style="color: #1a1a1a;">★★</span><span style="color: #ddd;">★★★</span></span>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0; font-size: 13px; color: #333;">La experiencia tuvo incidencias graves o deficiencias importantes.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- 1 estrella -->
                      <tr>
                        <td style="padding: 10px 0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 90px; vertical-align: top;">
                                <span style="font-size: 14px; letter-spacing: 1px;"><span style="color: #1a1a1a;">★</span><span style="color: #ddd;">★★★★</span></span>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0; font-size: 13px; color: #333;">Experiencia inaceptable (seguridad, higiene o veracidad).</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Nota de transparencia -->
                <tr>
                  <td style="padding: 16px 28px; background: #fafafa; border-top: 1px solid #f0f0f0;">
                    <p style="margin: 0; font-size: 11px; color: #888; line-height: 1.5; font-style: italic;">Valora con total honestidad. Esta guía solo pretende aclarar el significado habitual de las estrellas en la plataforma.</p>
                  </td>
                </tr>

                <!-- Caja de contacto -->
                <tr>
                  <td style="padding: 24px 28px; border-top: 1px solid #e0e0e0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: top;">
                          <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">Soporte</p>
                          <p style="margin: 0 0 12px 0; font-size: 12px; color: #666; line-height: 1.4;">Si necesitas algo durante tu estancia, escríbenos y lo resolvemos lo antes posible.</p>
                          <p style="margin: 0; font-size: 14px; color: #1a1a1a; font-weight: 500;">${telefono}</p>
                        </td>
                        <td style="width: 90px; text-align: right; vertical-align: top;">
                          <img src="${qrCodeUrl}" alt="QR WhatsApp" width="80" height="80" style="display: block;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
          <!-- ========== FIN PLANTILLA ========== -->

          <!-- Instrucciones -->
          <tr>
            <td style="padding: 32px 0 24px 0;">
              <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">Cómo usar tu plantilla</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #666;">1. Guarda como PDF (Cmd/Ctrl + P → Guardar como PDF)</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #666;">2. Imprime en A4 o tamaño carta</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #666;">3. Enmarca o plastifica para mayor durabilidad</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #666;">4. Colócala en un lugar visible del alojamiento</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 0 0 32px 0;">
              <a href="https://www.itineramio.com/blog/plantilla-significado-estrellas-airbnb-huespedes" style="display: inline-block; background: #1a1a1a; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: 500; font-size: 13px;">
                Leer artículo completo
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; color: #999; font-size: 11px;">
                <a href="https://www.itineramio.com" style="color: #666; text-decoration: none;">itineramio.com</a> · Herramientas para anfitriones
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

    console.log('Resend result:', JSON.stringify(emailResult, null, 2))

    if (emailResult.error) {
      console.error('Resend error:', emailResult.error)
      return NextResponse.json({
        success: false,
        error: emailResult.error.message || 'Error enviando email'
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, emailId: emailResult.data?.id })
  } catch (error) {
    console.error('Error generating template:', error)
    return NextResponse.json(
      { error: 'Error al generar la plantilla' },
      { status: 500 }
    )
  }
}
