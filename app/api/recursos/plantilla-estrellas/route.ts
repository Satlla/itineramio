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
    const emailResult = await resend.emails.send({
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
<body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #f5f5f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f0; padding: 48px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px;">

          <!-- Email intro -->
          <tr>
            <td style="padding: 0 0 40px 0; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-family: -apple-system, sans-serif;">Itineramio</p>
              <h1 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 26px; font-weight: 400; line-height: 1.3;">Tu plantilla está lista</h1>
              <p style="margin: 0; color: #666; font-size: 15px; line-height: 1.6; font-family: -apple-system, sans-serif;">Hola ${nombre}, aquí tienes tu plantilla personalizada.<br>Imprímela y colócala en tu alojamiento.</p>
            </td>
          </tr>

          <!-- ========== PRINTABLE TEMPLATE CARD ========== -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border: 2px solid #1a1a1a; border-radius: 0;">

                <!-- Elegant Header -->
                <tr>
                  <td style="padding: 40px 32px 32px 32px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; color: #999;">Gracias por tu estancia</p>
                    <h2 style="margin: 0; font-size: 28px; font-weight: 400; color: #1a1a1a; letter-spacing: 1px;">${nombre}</h2>
                  </td>
                </tr>

                <!-- Subtitle -->
                <tr>
                  <td style="padding: 28px 32px 0 32px; text-align: center;">
                    <p style="margin: 0; font-size: 13px; color: #666; font-family: -apple-system, sans-serif; line-height: 1.5;">Tu valoración es muy importante para nosotros.<br>Esto es lo que significa cada puntuación:</p>
                  </td>
                </tr>

                <!-- Stars Section -->
                <tr>
                  <td style="padding: 28px 32px;">

                    <!-- 5 Stars -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; border-bottom: 1px solid #f0f0f0; padding-bottom: 20px;">
                      <tr>
                        <td style="text-align: center;">
                          <p style="margin: 0 0 6px 0; font-size: 22px; letter-spacing: 4px; color: #1a1a1a;">★★★★★</p>
                          <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; font-family: -apple-system, sans-serif;">Excelente</p>
                          <p style="margin: 0; font-size: 13px; color: #888; font-family: -apple-system, sans-serif;">Todo perfecto. Cumplió mis expectativas.</p>
                        </td>
                      </tr>
                    </table>

                    <!-- 4 Stars -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; border-bottom: 1px solid #f0f0f0; padding-bottom: 20px;">
                      <tr>
                        <td style="text-align: center;">
                          <p style="margin: 0 0 6px 0; font-size: 22px; letter-spacing: 4px;"><span style="color: #1a1a1a;">★★★★</span><span style="color: #ddd;">★</span></p>
                          <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; font-family: -apple-system, sans-serif;">Bien</p>
                          <p style="margin: 0; font-size: 13px; color: #888; font-family: -apple-system, sans-serif;">Algún detalle menor que pude comentar.</p>
                        </td>
                      </tr>
                    </table>

                    <!-- 3 Stars -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="text-align: center;">
                          <p style="margin: 0 0 6px 0; font-size: 22px; letter-spacing: 4px;"><span style="color: #1a1a1a;">★★★</span><span style="color: #ddd;">★★</span></p>
                          <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; font-family: -apple-system, sans-serif;">Mejorable</p>
                          <p style="margin: 0; font-size: 13px; color: #888; font-family: -apple-system, sans-serif;">Hubo problemas. Contacta antes de valorar.</p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding: 0 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-top: 1px solid #e5e5e5;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- QR Section - Centered -->
                <tr>
                  <td style="padding: 28px 32px 36px 32px; text-align: center;">
                    <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600; color: #1a1a1a; font-family: -apple-system, sans-serif;">¿Algún problema?</p>
                    <p style="margin: 0 0 20px 0; font-size: 12px; color: #888; font-family: -apple-system, sans-serif;">Escríbeme y lo solucionamos juntos</p>
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="text-align: center;">
                          <img src="${qrCodeUrl}" alt="QR WhatsApp" width="100" height="100" style="display: block; margin: 0 auto;" />
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 12px; text-align: center;">
                          <p style="margin: 0 0 2px 0; font-size: 11px; color: #999; font-family: -apple-system, sans-serif;">WhatsApp</p>
                          <p style="margin: 0; font-size: 14px; color: #1a1a1a; font-weight: 500; font-family: -apple-system, sans-serif;">${telefono}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
          <!-- ========== END PRINTABLE TEMPLATE ========== -->

          <!-- Instructions -->
          <tr>
            <td style="padding: 40px 0 32px 0; text-align: center;">
              <p style="margin: 0 0 20px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; font-family: -apple-system, sans-serif;">Cómo usar tu plantilla</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-family: -apple-system, sans-serif;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #666; text-align: center;">
                    1. Guarda este email como PDF o imprímelo directamente
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #666; text-align: center;">
                    2. Recorta la tarjeta por el borde negro
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #666; text-align: center;">
                    3. Plastifícala o enmárcala para mayor durabilidad
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #666; text-align: center;">
                    4. Colócala en un lugar visible del alojamiento
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 0 0 40px 0;">
              <a href="https://www.itineramio.com/blog/plantilla-significado-estrellas-airbnb-huespedes" style="display: inline-block; background: #1a1a1a; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: 500; font-size: 13px; font-family: -apple-system, sans-serif; letter-spacing: 0.5px;">
                Leer el artículo completo
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align: center; padding: 24px 0; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #999; font-size: 12px; font-family: -apple-system, sans-serif;">
                <a href="https://www.itineramio.com" style="color: #666; text-decoration: none;">itineramio.com</a>
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
