import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { enrollSubscriberInSequences } from '@/lib/email-sequences'

// Lazy initialization to avoid build errors
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')
  return _resend
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, nombreRed, password, email } = body

    if (!nombre || !nombreRed || !password || !email) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      )
    }

    // Generate WiFi QR code data (WIFI:T:WPA;S:ssid;P:password;;)
    const wifiQrData = `WIFI:T:WPA;S:${nombreRed};P:${password};;`
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(wifiQrData)}&bgcolor=ffffff&color=222222`

    // URL de descarga con parámetros
    const downloadUrl = `https://www.itineramio.com/recursos/plantilla-wifi/descargar?nombre=${encodeURIComponent(nombre)}&red=${encodeURIComponent(nombreRed)}&pass=${encodeURIComponent(password)}`

    // Save lead to database
    try {
      await prisma.lead.create({
        data: {
          name: nombre,
          email,
          source: 'plantilla-wifi',
          metadata: { nombreRed }
          // Note: We don't store the password for security
        }
      })
      console.log(`[Lead] Created for ${email} from plantilla-wifi`)
    } catch (dbError) {
      console.error('Error saving lead:', dbError)
    }

    // Create or update EmailSubscriber for nurturing sequence
    try {
      const normalizedEmail = email.toLowerCase().trim()

      const subscriber = await prisma.emailSubscriber.upsert({
        where: { email: normalizedEmail },
        create: {
          email: normalizedEmail,
          name: nombre,
          source: 'plantilla-wifi',
          status: 'active',
          tags: ['plantilla-wifi', 'recurso-gratuito'],
          archetype: 'SISTEMATICO'
        },
        update: {
          tags: {
            push: 'plantilla-wifi'
          },
          updatedAt: new Date()
        }
      })

      console.log(`[EmailSubscriber] Created/updated for ${normalizedEmail} from plantilla-wifi`)

      // Enroll in nurturing sequences
      await enrollSubscriberInSequences(subscriber.id, 'SUBSCRIBER_CREATED', {
        archetype: subscriber.archetype || 'SISTEMATICO',
        source: 'plantilla-wifi',
        tags: ['plantilla-wifi', 'recurso-gratuito']
      })

      console.log(`[EmailSubscriber] Enrolled ${normalizedEmail} in sequences`)
    } catch (subscriberError) {
      console.error('Error creating subscriber:', subscriberError)
    }

    // Send email
    const emailResult = await getResend().emails.send({
      from: 'Itineramio <hola@itineramio.com>',
      to: email,
      subject: 'Tu Tarjeta WiFi Profesional - Lista para imprimir',
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
              <h1 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Tu tarjeta WiFi está lista</h1>
              <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">Hola, aquí tienes tu tarjeta WiFi profesional para <strong>${nombre}</strong>.</p>
            </td>
          </tr>

          <!-- ========== TARJETA WIFI IMPRIMIBLE ========== -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">

                <!-- Header con gradiente -->
                <tr>
                  <td style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 24px 28px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: middle;">
                          <p style="margin: 0 0 4px 0; font-size: 11px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 1px;">WiFi del alojamiento</p>
                          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #ffffff;">${nombre}</p>
                        </td>
                        <td style="width: 50px; text-align: right;">
                          <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 50%; display: inline-block; text-align: center; line-height: 40px;">
                            <span style="font-size: 20px;">📶</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Contenido principal -->
                <tr>
                  <td style="padding: 28px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <!-- QR Code -->
                        <td style="width: 140px; vertical-align: top; padding-right: 24px;">
                          <div style="background: #f8f8f8; border-radius: 12px; padding: 12px; text-align: center;">
                            <img src="${qrCodeUrl}" alt="QR WiFi" width="116" height="116" style="display: block; margin: 0 auto;" />
                            <p style="margin: 10px 0 0 0; font-size: 10px; color: #888; line-height: 1.3;">Escanea con tu cámara para conectarte</p>
                          </div>
                        </td>
                        <!-- Datos WiFi -->
                        <td style="vertical-align: top;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-bottom: 20px;">
                                <p style="margin: 0 0 4px 0; font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Nombre de la red</p>
                                <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">${nombreRed}</p>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <p style="margin: 0 0 4px 0; font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Contraseña</p>
                                <p style="margin: 0; font-size: 18px; font-family: 'SF Mono', Monaco, 'Courier New', monospace; font-weight: 600; color: #1a1a1a; background: #f3f4f6; padding: 8px 12px; border-radius: 6px; display: inline-block;">${password}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer de la tarjeta -->
                <tr>
                  <td style="background: #fafafa; padding: 16px 28px; border-top: 1px solid #eee;">
                    <p style="margin: 0; font-size: 12px; color: #666; text-align: center;">
                      📱 Escanea el código QR con la cámara de tu móvil para conectarte automáticamente
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
          <!-- ========== FIN TARJETA ========== -->

          <!-- Botón de descarga -->
          <tr>
            <td align="center" style="padding: 28px 0 0 0;">
              <a href="${downloadUrl}" style="display: inline-block; background: #1a1a1a; color: #ffffff; padding: 14px 32px; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 6px;">
                Descargar PDF
              </a>
              <p style="margin: 12px 0 0 0; font-size: 12px; color: #888;">Haz clic para abrir tu tarjeta y guardarla como PDF</p>
            </td>
          </tr>

          <!-- Instrucciones -->
          <tr>
            <td style="padding: 32px 0 24px 0;">
              <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">Cómo usar tu tarjeta WiFi</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #666;">1. Guarda como PDF (Cmd/Ctrl + P → Guardar como PDF)</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #666;">2. Imprime en tamaño A5 o carta</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #666;">3. Enmarca o plastifica para mayor durabilidad</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #666;">4. Colócala cerca del router o en lugar visible</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tip -->
          <tr>
            <td style="padding: 0 0 24px 0;">
              <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; font-size: 13px; color: #1e40af;"><strong>💡 Tip:</strong> Coloca la tarjeta en un marco pequeño junto al router o en la mesita de entrada. Tus huéspedes lo agradecerán.</p>
              </div>
            </td>
          </tr>

          <!-- CTA Itineramio -->
          <tr>
            <td style="padding: 0 0 32px 0;">
              <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); border-radius: 12px; padding: 24px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #ffffff;">¿Quieres más herramientas para tu alojamiento?</p>
                <p style="margin: 0 0 16px 0; font-size: 13px; color: rgba(255,255,255,0.9);">Manuales digitales, códigos QR, gestión automatizada...</p>
                <a href="https://www.itineramio.com/register" style="display: inline-block; background: #ffffff; color: #7c3aed; padding: 12px 24px; text-decoration: none; font-weight: 600; font-size: 13px; border-radius: 6px;">
                  Prueba Itineramio gratis →
                </a>
              </div>
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
