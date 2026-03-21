import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { sendEmail } from '../../../../src/lib/email-improved'
import { randomBytes } from 'crypto'
import { checkRateLimitAsync, getRateLimitKey } from '../../../../src/lib/rate-limit'

// Lead magnets that should be sent immediately (no confirmation needed)
const LEAD_MAGNET_SOURCES = ['blog-exit-popup', 'lead-magnet']

export async function POST(request: NextRequest) {
  try {
    // Rate limiting to prevent spam
    const rl = await checkRateLimitAsync(
      getRateLimitKey(request, null, 'newsletter'),
      { maxRequests: 5, windowMs: 60 * 1000 }
    )
    if (!rl.allowed) {
      return NextResponse.json({
        error: 'Demasiados intentos. Por favor, espera unos minutos.'
      }, {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rl.resetIn / 1000))
        }
      })
    }

    const body = await request.json()
    const { name, email, source = 'unknown', tags = [] } = body

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

    // Check if this is a lead magnet request
    const isLeadMagnet = LEAD_MAGNET_SOURCES.includes(source) || tags.includes('lead-magnet')

    if (existing) {
      // Si ya está suscrito y activo
      if (existing.status === 'active') {
        // If it's a lead magnet, send it anyway (they may want the resource)
        if (isLeadMagnet) {
          await sendLeadMagnetEmail(normalizedEmail, name || existing.name || 'Anfitrión', tags)
          return NextResponse.json({
            success: true,
            message: '¡Revisa tu email! Te hemos enviado el kit.'
          })
        }
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
            name: name || existing.name,
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
        name: name || null,
        status: 'pending',
        source,
        tags,
        sourceMetadata: {
          confirmationToken,
          tokenCreatedAt: new Date().toISOString()
        }
      }
    })


    if (isLeadMagnet) {
      // For lead magnets: set as active immediately and send the resource
      await prisma.emailSubscriber.update({
        where: { email: normalizedEmail },
        data: { status: 'active' }
      })

      // Send the lead magnet email
      await sendLeadMagnetEmail(normalizedEmail, name || 'Anfitrión', tags)


      return NextResponse.json({
        success: true,
        message: '¡Revisa tu email! Te hemos enviado el kit.'
      })
    }

    // Regular newsletter: send confirmation email
    await sendConfirmationEmail(normalizedEmail, confirmationToken)

    return NextResponse.json({
      success: true,
      message: '¡Revisa tu email para confirmar la suscripción!'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al procesar la suscripción' },
      { status: 500 }
    )
  }
}

async function sendConfirmationEmail(email: string, token: string) {
  const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/confirm?token=${token}`
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(email)}`
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'

  // PNG logo URL with gradient (hosted on server - better email client compatibility)
  const isotipoUrl = `${baseUrl}/isotipo-gradient.png`



  await sendEmail({
    to: email,
    subject: 'Confirma tu suscripción - Itineramio',
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
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 48px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; border-bottom: 1px solid #f1f5f9;">
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle;">
                    <img src="${isotipoUrl}" alt="Itineramio" width="40" height="22" style="display: block; height: 22px; width: auto;" />
                  </td>
                  <td style="vertical-align: middle; padding-left: 10px;">
                    <span style="font-size: 18px; font-weight: 600; color: #0f172a;">Itineramio</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px 24px 40px; text-align: center;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #0f172a; line-height: 1.3;">Confirma tu suscripción</h1>
              <p style="margin: 0; font-size: 15px; color: #64748b; line-height: 1.6;">Haz clic en el botón para confirmar tu email y empezar a recibir contenido exclusivo para tu alquiler vacacional.</p>
            </td>
          </tr>
          <!-- What you'll receive -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #0f172a;">¿Qué vas a recibir?</p>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding: 8px 0;">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="width: 24px; vertical-align: top; padding-top: 2px;"><span style="color: #7c3aed;">✓</span></td>
                        <td style="padding-left: 8px; font-size: 14px; color: #475569; line-height: 1.5;">Plantillas descargables para gestionar tu alojamiento</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="width: 24px; vertical-align: top; padding-top: 2px;"><span style="color: #7c3aed;">✓</span></td>
                        <td style="padding-left: 8px; font-size: 14px; color: #475569; line-height: 1.5;">Recomendaciones para mejorar tu Airbnb y conseguir más reservas</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="width: 24px; vertical-align: top; padding-top: 2px;"><span style="color: #7c3aed;">✓</span></td>
                        <td style="padding-left: 8px; font-size: 14px; color: #475569; line-height: 1.5;">Guías de normativa actualizadas para cumplir la ley</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="width: 24px; vertical-align: top; padding-top: 2px;"><span style="color: #7c3aed;">✓</span></td>
                        <td style="padding-left: 8px; font-size: 14px; color: #475569; line-height: 1.5;">Estrategias probadas para conseguir mejores evaluaciones</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); border-radius: 12px;">
                    <a href="${confirmUrl}" target="_blank" style="display: inline-block; padding: 16px 48px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none;">Confirmar suscripción</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                <a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">Darme de baja</a>
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

}

async function sendLeadMagnetEmail(email: string, name: string, tags: string[]) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'
  const isotipoUrl = `${baseUrl}/isotipo-gradient.png`
  const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}`

  // Determine which lead magnet to send based on tags
  const isKitAnfitrion = tags.includes('kit-anfitrion')

  // Kit del Anfitrión Profesional email
  if (isKitAnfitrion) {
    await sendEmail({
      to: email,
      subject: '🎁 Tu Kit del Anfitrión Profesional está listo',
      html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu Kit del Anfitrión Profesional - Itineramio</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 48px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 32px 40px; text-align: center;">
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle;">
                    <img src="${isotipoUrl}" alt="Itineramio" width="40" height="22" style="display: block; height: 22px; width: auto;" />
                  </td>
                  <td style="vertical-align: middle; padding-left: 10px;">
                    <span style="font-size: 18px; font-weight: 600; color: #ffffff;">Itineramio</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 16px 0; font-size: 26px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                ¡Hola ${name}! 👋
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #475569; line-height: 1.6;">
                Aquí tienes tu <strong>Kit del Anfitrión Profesional</strong> con todo lo que necesitas para gestionar tu alquiler vacacional como un pro.
              </p>

              <!-- What's included -->
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #0f172a;">📦 Contenido del kit:</p>
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #475569;">
                      <span style="color: #7c3aed;">✓</span> &nbsp;Checklist de requisitos legales 2026
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #475569;">
                      <span style="color: #7c3aed;">✓</span> &nbsp;Plantilla de normas de la casa
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #475569;">
                      <span style="color: #7c3aed;">✓</span> &nbsp;Guía: Cómo conseguir 5 estrellas
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #475569;">
                      <span style="color: #7c3aed;">✓</span> &nbsp;Lista de amenities imprescindibles
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Download Button -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center" style="padding-bottom: 32px;">
                    <a href="${baseUrl}/recursos/kit-anfitrion/descargar"
                       style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: #ffffff; font-size: 16px; font-weight: 600; padding: 16px 32px; border-radius: 12px; text-decoration: none;">
                      📥 Descargar Kit Completo
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="border-top: 1px solid #e2e8f0; margin: 24px 0;"></div>

              <!-- Upsell -->
              <div style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-radius: 12px; padding: 24px; border: 1px solid #e9d5ff;">
                <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #6d28d9;">
                  💡 ¿Quieres automatizar todo esto?
                </p>
                <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569; line-height: 1.5;">
                  Con Itineramio creas tu manual digital en minutos. Tus huéspedes tendrán toda la información que necesitan al instante.
                </p>
                <a href="${baseUrl}/register?utm_source=email&utm_medium=lead_magnet&utm_campaign=kit_anfitrion"
                   style="display: inline-block; background-color: #ffffff; color: #6d28d9; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none; border: 2px solid #6d28d9;">
                  Probar 15 días gratis →
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center; border-top: 1px solid #f1f5f9; background-color: #f8fafc;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8;">
                © 2026 Itineramio. Todos los derechos reservados.
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                <a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">Darme de baja</a>
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

    return
  }

  // Default lead magnet email (generic)
  await sendEmail({
    to: email,
    subject: '🎁 Tu recurso gratuito de Itineramio',
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu recurso gratuito - Itineramio</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 48px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px; text-align: center;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #0f172a;">¡Gracias ${name}!</h1>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #475569; line-height: 1.6;">
                Tu recurso gratuito está listo para descargar.
              </p>
              <a href="${baseUrl}/recursos"
                 style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: #ffffff; font-size: 16px; font-weight: 600; padding: 16px 32px; border-radius: 12px; text-decoration: none;">
                Ver recursos
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                <a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">Darme de baja</a>
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
    return NextResponse.json(
      { error: 'Error al procesar la baja' },
      { status: 500 }
    )
  }
}
