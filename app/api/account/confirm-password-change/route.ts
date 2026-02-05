import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { sendEmail } from '../../../../src/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({
        error: 'Token no proporcionado'
      }, { status: 400 })
    }

    // Find the token
    const passwordChangeToken = await prisma.passwordChangeToken.findUnique({
      where: { token },
      include: {
        user: true
      }
    })

    if (!passwordChangeToken) {
      return NextResponse.json({
        error: 'Token inválido o expirado'
      }, { status: 400 })
    }

    // Check if token has expired
    if (passwordChangeToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.passwordChangeToken.delete({
        where: { id: passwordChangeToken.id }
      })

      return NextResponse.json({
        error: 'El enlace de confirmación ha expirado. Por favor, solicita un nuevo cambio de contraseña.'
      }, { status: 400 })
    }

    // Check if already confirmed
    if (passwordChangeToken.confirmedAt) {
      return NextResponse.json({
        error: 'Este cambio de contraseña ya fue confirmado'
      }, { status: 400 })
    }

    // Update user password
    await prisma.user.update({
      where: { id: passwordChangeToken.userId },
      data: {
        password: passwordChangeToken.newPasswordHash
      }
    })

    // Mark token as confirmed
    await prisma.passwordChangeToken.update({
      where: { id: passwordChangeToken.id },
      data: {
        confirmedAt: new Date()
      }
    })

    // Send confirmation email
    const userName = passwordChangeToken.user.name || 'Usuario'

    await sendEmail({
      to: passwordChangeToken.user.email,
      subject: '✅ Contraseña actualizada - Itineramio',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6B46C1 0%, #9333EA 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; }
            .success { background: #F0FDF4; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0; }
            .info-box { background: #F3F4F6; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #6B46C1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Contraseña Actualizada</h1>
            </div>

            <div class="content">
              <div class="success">
                <strong>Tu contraseña ha sido cambiada exitosamente</strong>
              </div>

              <p>Hola ${userName},</p>

              <p>Te confirmamos que la contraseña de tu cuenta de Itineramio ha sido actualizada correctamente.</p>

              <div class="info-box">
                <strong>Fecha del cambio:</strong> ${new Date().toLocaleString('es-ES')}
              </div>

              <p><strong>Próximos pasos:</strong></p>
              <ul>
                <li>Usa tu nueva contraseña para iniciar sesión</li>
                <li>Tu email sigue siendo el mismo: ${passwordChangeToken.user.email}</li>
              </ul>

              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'}/login" class="button">
                  Iniciar sesión
                </a>
              </div>

              <p style="color: #EF4444; margin-top: 20px;">
                <strong>¿No realizaste este cambio?</strong><br>
                Si no solicitaste este cambio de contraseña, tu cuenta puede estar comprometida.
                Contacta con nuestro equipo de soporte inmediatamente.
              </p>
            </div>

            <div class="footer">
              <p>© ${new Date().getFullYear()} Itineramio - Tu guía digital inteligente</p>
            </div>
          </div>
        </body>
        </html>
      `
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    })

  } catch (error) {
    console.error('Error confirming password change:', error)
    return NextResponse.json({
      error: 'Error al confirmar el cambio de contraseña'
    }, { status: 500 })
  }
}
