import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { sendEmail } from '../../../../src/lib/email-improved'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source = 'unknown', tags = [] } = body

    // Validar email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Normalizar email
    const normalizedEmail = email.toLowerCase().trim()

    // Verificar si ya existe
    const existing = await prisma.emailSubscriber.findUnique({
      where: { email: normalizedEmail }
    })

    if (existing) {
      // Si ya está suscrito y activo
      if (existing.status === 'active') {
        return NextResponse.json(
          { message: 'Ya estás suscrito', alreadySubscribed: true },
          { status: 200 }
        )
      }

      // Si está pendiente, reenviar email de confirmación
      if (existing.status === 'pending') {
        const token = randomBytes(32).toString('hex')
        await prisma.emailSubscriber.update({
          where: { email: normalizedEmail },
          data: {
            sourceMetadata: {
              confirmationToken: token,
              tokenCreatedAt: new Date().toISOString()
            }
          }
        })

        await sendConfirmationEmail(normalizedEmail, token)

        return NextResponse.json({
          success: true,
          message: 'Te hemos reenviado el email de confirmación'
        })
      }

      // Si estaba unsubscribed, crear nuevo token y reactivar proceso
      if (existing.status === 'unsubscribed') {
        const token = randomBytes(32).toString('hex')
        await prisma.emailSubscriber.update({
          where: { email: normalizedEmail },
          data: {
            status: 'pending',
            unsubscribedAt: null,
            source,
            tags,
            sourceMetadata: {
              confirmationToken: token,
              tokenCreatedAt: new Date().toISOString()
            }
          }
        })

        await sendConfirmationEmail(normalizedEmail, token)

        return NextResponse.json({
          success: true,
          message: '¡Revisa tu email para confirmar la suscripción!'
        })
      }
    }

    // Generar token de confirmación
    const confirmationToken = randomBytes(32).toString('hex')

    // Crear nuevo suscriptor con status pending
    await prisma.emailSubscriber.create({
      data: {
        email: normalizedEmail,
        status: 'pending',
        source,
        tags,
        sourceMetadata: {
          confirmationToken,
          tokenCreatedAt: new Date().toISOString()
        }
      }
    })

    console.log(`📧 New newsletter subscription pending: ${normalizedEmail} (source: ${source})`)

    // Enviar email de confirmación
    await sendConfirmationEmail(normalizedEmail, confirmationToken)

    return NextResponse.json({
      success: true,
      message: '¡Revisa tu email para confirmar la suscripción!'
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la suscripción' },
      { status: 500 }
    )
  }
}

async function sendConfirmationEmail(email: string, token: string) {
  const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/confirm?token=${token}`
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'

  await sendEmail({
    to: email,
    subject: '¡Solo falta un clic! Confirma tu suscripción',
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Confirma tu suscripción - Itineramio</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <!-- Main Container -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">

          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 40px; text-align: center;">
              <img src="${baseUrl}/logo-light.svg" alt="Itineramio" width="180" height="40" style="display: block; margin: 0 auto; max-width: 180px; height: auto;" />
            </td>
          </tr>

          <!-- Hero Section -->
          <tr>
            <td style="padding: 48px 40px 32px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.5px;">Bienvenido/a</p>
              <h1 style="margin: 0 0 16px 0; font-size: 28px; font-weight: 700; color: #111827; line-height: 1.3;">Estás a un clic de unirte a la comunidad</h1>
              <p style="margin: 0; font-size: 16px; color: #6b7280; line-height: 1.6;">Confirma tu email para empezar a recibir contenido exclusivo para profesionalizar tu alquiler vacacional.</p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%); border-radius: 12px;">
                    <a href="${confirmUrl}" target="_blank" style="display: inline-block; padding: 18px 48px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none;">Confirmar mi suscripción →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #e5e7eb;"></div>
            </td>
          </tr>

          <!-- What You'll Get -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 24px 0; font-size: 18px; font-weight: 600; color: #111827;">¿Qué vas a recibir?</h2>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="width: 28px; vertical-align: top;">
                          <span style="display: inline-block; width: 20px; height: 20px; background-color: #dcfce7; border-radius: 50%; text-align: center; line-height: 20px; font-size: 12px;">✓</span>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.5;"><strong>Alertas de normativa</strong> — Cambios en NRUA, licencias y obligaciones legales</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="width: 28px; vertical-align: top;">
                          <span style="display: inline-block; width: 20px; height: 20px; background-color: #dcfce7; border-radius: 50%; text-align: center; line-height: 20px; font-size: 12px;">✓</span>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.5;"><strong>Guías prácticas</strong> — Estrategias probadas para mejorar tus reseñas</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="width: 28px; vertical-align: top;">
                          <span style="display: inline-block; width: 20px; height: 20px; background-color: #dcfce7; border-radius: 50%; text-align: center; line-height: 20px; font-size: 12px;">✓</span>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.5;"><strong>Plantillas y recursos</strong> — Herramientas listas para usar en tu negocio</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Gift Section -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-radius: 12px; border: 1px solid #e9d5ff;">
                <tr>
                  <td style="padding: 24px;">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="width: 48px; vertical-align: top;">
                          <span style="display: inline-block; font-size: 32px;">🎁</span>
                        </td>
                        <td style="padding-left: 16px;">
                          <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.3px;">Regalo de bienvenida</p>
                          <p style="margin: 0 0 8px 0; font-size: 17px; font-weight: 600; color: #111827;">Checklist de Limpieza Profesional</p>
                          <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.5;">Al confirmar, recibirás acceso a nuestra checklist de 47 puntos que usan los mejores anfitriones para garantizar 5 estrellas.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Social Proof / Testimonial -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f9fafb; border-radius: 12px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px 0; font-size: 15px; color: #374151; line-height: 1.6; font-style: italic;">"Desde que sigo a Itineramio mis reseñas han mejorado muchísimo. Sus guías de normativa me han ahorrado más de un susto con las nuevas leyes."</p>
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">María García</p>
                          <p style="margin: 2px 0 0 0; font-size: 13px; color: #6b7280;">Superhost · 3 propiedades en Valencia</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Secondary CTA -->
          <tr>
            <td style="padding: 0 40px 48px 40px; text-align: center;">
              <a href="${confirmUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 15px; font-weight: 600; color: #7c3aed; text-decoration: none; border: 2px solid #7c3aed; border-radius: 10px;">Sí, quiero unirme →</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 40px; text-align: center;">
              <img src="${baseUrl}/isotipo-itineramio.svg" alt="Itineramio" width="32" height="32" style="display: block; margin: 0 auto 16px auto;" />
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8;">Únete a +500 anfitriones que ya profesionalizan su negocio</p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #64748b;">1 email/semana · Sin spam · Baja cuando quieras</p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                © 2026 Itineramio · <a href="${baseUrl}/legal/privacy" style="color: #94a3b8; text-decoration: underline;">Privacidad</a>
              </p>
            </td>
          </tr>

        </table>

        <!-- Fallback text -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 560px;">
          <tr>
            <td style="padding: 24px 16px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.5;">
                ¿No funciona el botón? Copia y pega este enlace en tu navegador:<br>
                <a href="${confirmUrl}" style="color: #7c3aed; word-break: break-all;">${confirmUrl}</a>
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

  console.log(`✉️ Confirmation email sent to: ${email}`)
}

// Endpoint para unsubscribe
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    await prisma.emailSubscriber.update({
      where: { email: normalizedEmail },
      data: {
        status: 'unsubscribed',
        unsubscribedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Te hemos dado de baja correctamente'
    })
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la baja' },
      { status: 500 }
    )
  }
}
