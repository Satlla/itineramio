import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendEmail } from '../../../../src/lib/email'
import { verifyToken } from '../../../../src/lib/auth'
import { checkRateLimitAsync } from '../../../../src/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Get user from token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = verifyToken(token)

    // Rate limit: 5 requests per user per hour
    const { allowed: rlOk } = await checkRateLimitAsync(decoded.userId + ':pwd-change', { maxRequests: 5, windowMs: 60 * 60 * 1000 })
    if (!rlOk) {
      return NextResponse.json({ error: 'Demasiadas solicitudes. Espera antes de volver a intentarlo.' }, { status: 429 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return NextResponse.json({
        error: 'Contraseña actual y nueva son requeridas'
      }, { status: 400 })
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return NextResponse.json({
        error: 'La nueva contraseña debe tener al menos 8 caracteres'
      }, { status: 400 })
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, currentUser.password!)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 401 })
    }

    // Check if there's already a pending password change
    const existingToken = await prisma.passwordChangeToken.findFirst({
      where: {
        userId: decoded.userId,
        expiresAt: {
          gt: new Date()
        },
        confirmedAt: null
      }
    })

    if (existingToken) {
      // Delete the old token
      await prisma.passwordChangeToken.delete({
        where: { id: existingToken.id }
      })
    }

    // Hash the new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12)

    // Generate secure token
    const changeToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

    // Create password change token
    await prisma.passwordChangeToken.create({
      data: {
        userId: decoded.userId,
        newPasswordHash,
        token: changeToken,
        expiresAt
      }
    })

    // Send confirmation email
    const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'}/confirm-password-change?token=${changeToken}`

    try {
      await sendEmail({
        to: currentUser.email,
        subject: '🔐 Confirma tu cambio de contraseña - Itineramio',
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
              .alert { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
              .button { display: inline-block; padding: 12px 30px; background: #6B46C1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .info-box { background: #F3F4F6; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Cambio de Contraseña</h1>
              </div>

              <div class="content">
                <div class="alert">
                  <strong>Solicitud de cambio de contraseña</strong><br>
                  Hemos recibido una solicitud para cambiar la contraseña de tu cuenta.
                </div>

                <p>Hola ${currentUser.name || 'Usuario'},</p>

                <p>Se ha solicitado cambiar la contraseña de tu cuenta de Itineramio.</p>

                <div class="info-box">
                  <strong>Fecha de solicitud:</strong> ${new Date().toLocaleString('es-ES')}<br>
                  <strong>Validez del enlace:</strong> 1 hora
                </div>

                <h3>¿Fuiste tú quien solicitó este cambio?</h3>

                <p><strong>SI SOLICITASTE ESTE CAMBIO:</strong></p>
                <p>Haz clic en el siguiente botón para confirmar el cambio de contraseña:</p>

                <div style="text-align: center;">
                  <a href="${confirmationUrl}" class="button">✓ Confirmar cambio de contraseña</a>
                </div>

                <p><strong>SI NO SOLICITASTE ESTE CAMBIO:</strong></p>
                <p style="color: #EF4444;">
                  <strong>Tu cuenta podría estar comprometida.</strong>
                  Ignora este email. El cambio NO se realizará si no confirmas.
                </p>

                <div class="info-box">
                  <strong>Información de seguridad:</strong><br>
                  • Este enlace expirará en 1 hora<br>
                  • El cambio NO se realizará hasta que confirmes<br>
                  • Una vez confirmado, deberás iniciar sesión con tu nueva contraseña
                </div>

                <p><small>Si el botón no funciona, copia y pega este enlace en tu navegador:</small></p>
                <p style="word-break: break-all; font-size: 12px; color: #666;">
                  ${confirmationUrl}
                </p>
              </div>

              <div class="footer">
                <p>Este es un mensaje automático de seguridad de Itineramio.</p>
                <p>© ${new Date().getFullYear()} Itineramio - Tu guía digital inteligente</p>
              </div>
            </div>
          </body>
          </html>
        `
      })

      return NextResponse.json({
        success: true,
        message: 'Se ha enviado un email de confirmación. Por favor, revisa tu bandeja de entrada.'
      })

    } catch (emailError) {
      // Clean up the token if email fails
      await prisma.passwordChangeToken.deleteMany({
        where: { token: changeToken }
      })

      return NextResponse.json({
        error: 'Error al enviar el email de confirmación. Por favor, intenta nuevamente.'
      }, { status: 500 })
    }

  } catch (error) {
    return NextResponse.json({
      error: 'Error al procesar la solicitud: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
