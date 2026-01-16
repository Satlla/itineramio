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

  await sendEmail({
    to: email,
    subject: 'Confirma tu suscripción - Itineramio',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Itineramio</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 22px; font-weight: 600;">Confirma tu suscripción</h2>
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Has solicitado recibir alertas sobre cambios en la normativa de alquiler vacacional. Haz clic en el botón para confirmar:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0 32px 0;">
                    <a href="${confirmUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 10px; font-weight: 600; font-size: 16px;">
                      Confirmar suscripción
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.5;">
                Si no solicitaste esta suscripción, puedes ignorar este email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2026 Itineramio · Tu manual digital de alquiler vacacional
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
