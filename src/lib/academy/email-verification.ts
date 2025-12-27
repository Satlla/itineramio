import { prisma } from '../prisma'
import { resend, FROM_EMAIL } from '../resend'
import crypto from 'crypto'

export async function generateVerificationToken(userId: string): Promise<string> {
  // Generate a secure random token
  const token = crypto.randomBytes(32).toString('hex')

  // Set expiration to 24 hours from now
  const expires = new Date()
  expires.setHours(expires.getHours() + 24)

  // Update user with token
  await prisma.academyUser.update({
    where: { id: userId },
    data: {
      emailVerificationToken: token,
      emailVerificationExpires: expires
    }
  })

  return token
}

export async function sendVerificationEmail(email: string, fullName: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/academia/verificar-email?token=${token}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifica tu email - Academia Itineramio</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #6366f1 100%); padding: 40px 40px 60px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                ✨ Academia Itineramio
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                De Cero a Superhost
              </p>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">
                ¡Hola ${fullName}! 👋
              </h2>

              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Bienvenido a <strong>Academia Itineramio</strong>. Estamos emocionados de tenerte con nosotros en este viaje hacia convertirte en un Superhost profesional.
              </p>

              <p style="margin: 0 0 32px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Para empezar, necesitamos verificar tu dirección de email. Haz clic en el botón de abajo:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 32px 0;">
                    <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
                      Verificar mi email
                    </a>
                  </td>
                </tr>
              </table>

              <div style="background-color: #f3f4f6; border-left: 4px solid #8b5cf6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                  <strong style="color: #374151;">⏰ Este enlace expira en 24 horas</strong><br>
                  Si no verificas tu email dentro de este tiempo, necesitarás solicitar un nuevo enlace.
                </p>
              </div>

              <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
              </p>

              <div style="background-color: #f9fafb; padding: 12px; border-radius: 8px; margin-bottom: 24px; word-break: break-all;">
                <code style="color: #6366f1; font-size: 13px; font-family: monospace;">
                  ${verificationUrl}
                </code>
              </div>

              <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                Si no creaste una cuenta en Academia Itineramio, puedes ignorar este email de forma segura.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                <strong style="color: #374151;">Academia Itineramio</strong>
              </p>
              <p style="margin: 0 0 16px 0; color: #9ca3af; font-size: 13px;">
                Formación profesional para anfitriones de alquileres vacacionales
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Itineramio. Todos los derechos reservados.
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

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: '✨ Verifica tu email - Academia Itineramio',
      html
    })

    if (error) {
      console.error('Error sending verification email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return { success: false, error }
  }
}

export async function verifyEmailToken(token: string): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const user = await prisma.academyUser.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date() // Token hasn't expired
        }
      }
    })

    if (!user) {
      return {
        success: false,
        error: 'Token inválido o expirado'
      }
    }

    // Mark email as verified and clear the token
    await prisma.academyUser.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    })

    return {
      success: true,
      userId: user.id
    }
  } catch (error) {
    console.error('Error verifying email token:', error)
    return {
      success: false,
      error: 'Error al verificar el email'
    }
  }
}

export async function resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await prisma.academyUser.findUnique({
      where: { email }
    })

    if (!user) {
      return {
        success: false,
        error: 'Usuario no encontrado'
      }
    }

    if (user.emailVerified) {
      return {
        success: false,
        error: 'El email ya está verificado'
      }
    }

    // Generate new token
    const token = await generateVerificationToken(user.id)

    // Send email
    const result = await sendVerificationEmail(email, user.fullName, token)

    return result
  } catch (error) {
    console.error('Error resending verification email:', error)
    return {
      success: false,
      error: 'Error al reenviar el email de verificación'
    }
  }
}
