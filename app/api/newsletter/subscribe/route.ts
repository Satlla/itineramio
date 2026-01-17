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
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(email)}`
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'

  // PNG logo URL (hosted on server - better email client compatibility)
  const isotipoUrl = `${baseUrl}/isotipo-itineramio.png`

  // Inline SVG gift icon (vector)
  const giftIcon = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="17" width="30" height="20" rx="2" fill="#f3e8ff" stroke="#7c3aed" stroke-width="2"/><rect x="3" y="12" width="34" height="7" rx="2" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/><path d="M20 12V37" stroke="#7c3aed" stroke-width="2"/><path d="M20 12C20 12 15 7 12 7C9 7 7 9.5 7 12" stroke="#9333ea" stroke-width="2" stroke-linecap="round"/><path d="M20 12C20 12 25 7 28 7C31 7 33 9.5 33 12" stroke="#9333ea" stroke-width="2" stroke-linecap="round"/><circle cx="20" cy="12" r="2.5" fill="#9333ea"/></svg>`

  // Facebook icon SVG
  const facebookIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="#1877f2" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`

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
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Confirma tu suscripción - Itineramio</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="display: none; max-height: 0; overflow: hidden;">Confirma tu email y recibe contenido exclusivo para anfitriones profesionales</div>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 48px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 8px 40px rgba(0, 0, 0, 0.08);">
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); padding: 40px 48px; text-align: center;">
              <img src="${isotipoUrl}" alt="Itineramio" width="100" height="55" style="display: block; margin: 0 auto; height: 55px; width: auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 48px 48px 24px 48px; text-align: center;">
              <div style="display: inline-block; background: linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%); padding: 8px 20px; border-radius: 100px; margin-bottom: 20px;">
                <span style="font-size: 13px; font-weight: 600; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px;">Bienvenido/a</span>
              </div>
              <h1 style="margin: 0 0 16px 0; font-size: 28px; font-weight: 700; color: #0f172a; line-height: 1.25; letter-spacing: -0.5px;">Estás a un clic de unirte a miles de anfitriones</h1>
              <p style="margin: 0; font-size: 16px; color: #64748b; line-height: 1.7;">Confirma tu email para recibir contenido exclusivo que te ayudará a profesionalizar tu alquiler vacacional.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 48px 40px 48px; text-align: center;">
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); border-radius: 14px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
                    <a href="${confirmUrl}" target="_blank" style="display: inline-block; padding: 18px 56px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; letter-spacing: 0.3px;">Confirmar suscripción</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 48px;">
              <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);"></div>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 48px;">
              <h2 style="margin: 0 0 24px 0; font-size: 18px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;">¿Qué vas a recibir?</h2>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr><td style="padding: 12px 0;"><table cellpadding="0" cellspacing="0" role="presentation"><tr><td style="width: 32px; vertical-align: top;"><div style="width: 24px; height: 24px; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 8px; text-align: center; line-height: 24px;"><span style="font-size: 12px; color: #16a34a;">✓</span></div></td><td style="padding-left: 14px;"><p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.5;"><strong style="color: #0f172a;">Artículos exclusivos</strong> sobre gestión profesional</p></td></tr></table></td></tr>
                <tr><td style="padding: 12px 0;"><table cellpadding="0" cellspacing="0" role="presentation"><tr><td style="width: 32px; vertical-align: top;"><div style="width: 24px; height: 24px; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 8px; text-align: center; line-height: 24px;"><span style="font-size: 12px; color: #16a34a;">✓</span></div></td><td style="padding-left: 14px;"><p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.5;"><strong style="color: #0f172a;">Guías de normativa</strong> actualizadas para cumplir sin problemas</p></td></tr></table></td></tr>
                <tr><td style="padding: 12px 0;"><table cellpadding="0" cellspacing="0" role="presentation"><tr><td style="width: 32px; vertical-align: top;"><div style="width: 24px; height: 24px; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 8px; text-align: center; line-height: 24px;"><span style="font-size: 12px; color: #16a34a;">✓</span></div></td><td style="padding-left: 14px;"><p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.5;"><strong style="color: #0f172a;">Estrategias probadas</strong> para mejorar tus evaluaciones</p></td></tr></table></td></tr>
                <tr><td style="padding: 12px 0;"><table cellpadding="0" cellspacing="0" role="presentation"><tr><td style="width: 32px; vertical-align: top;"><div style="width: 24px; height: 24px; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 8px; text-align: center; line-height: 24px;"><span style="font-size: 12px; color: #16a34a;">✓</span></div></td><td style="padding-left: 14px;"><p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.5;"><strong style="color: #0f172a;">Plantillas gratuitas</strong> listas para usar</p></td></tr></table></td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 48px 40px 48px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-radius: 16px; border: 1px solid #e9d5ff;">
                <tr>
                  <td style="padding: 28px;">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="width: 52px; vertical-align: top;">${giftIcon}</td>
                        <td style="padding-left: 18px;">
                          <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px;">Regalo de bienvenida</p>
                          <p style="margin: 0 0 8px 0; font-size: 17px; font-weight: 700; color: #0f172a; line-height: 1.3;">Checklist de Limpieza Profesional</p>
                          <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.6;">47 puntos que usan los mejores anfitriones para garantizar 5 estrellas.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 48px 48px 48px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 24px 28px;">
                    <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
                      <tr>
                        <td style="width: 44px; vertical-align: middle;">
                          <div style="width: 44px; height: 44px; background-color: #ffffff; border-radius: 12px; text-align: center; line-height: 44px; box-shadow: 0 2px 8px rgba(24, 119, 242, 0.15);">${facebookIcon}</div>
                        </td>
                        <td style="padding-left: 16px; vertical-align: middle;">
                          <p style="margin: 0 0 2px 0; font-size: 15px; font-weight: 700; color: #1e40af;">Comunidad Facebook</p>
                          <p style="margin: 0; font-size: 13px; color: #3b82f6;">+40,000 anfitriones</p>
                        </td>
                        <td style="text-align: right; vertical-align: middle;">
                          <a href="https://www.facebook.com/groups/anfitrionesbnb/" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #1877f2; color: #ffffff; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 10px; box-shadow: 0 2px 8px rgba(24, 119, 242, 0.3);">Unirme</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 36px 48px; text-align: center;">
              <img src="${isotipoUrl}" alt="Itineramio" width="60" height="33" style="display: block; margin: 0 auto 16px auto; height: 33px; width: auto; opacity: 0.9;" />
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #94a3b8; line-height: 1.6;">1 email/semana · Sin spam · Contenido de valor</p>
              <p style="margin: 0; font-size: 11px; color: #64748b;">© 2026 Itineramio · <a href="${baseUrl}/legal/privacy" style="color: #94a3b8; text-decoration: underline;">Privacidad</a> · <a href="${unsubscribeUrl}" style="color: #94a3b8; text-decoration: underline;">Darme de baja</a></p>
            </td>
          </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 520px;">
          <tr>
            <td style="padding: 28px 20px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.6;">¿No funciona el botón? Copia este enlace:<br><a href="${confirmUrl}" style="color: #7c3aed; word-break: break-all;">${confirmUrl}</a></p>
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
