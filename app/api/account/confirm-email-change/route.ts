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
    const emailChangeToken = await prisma.emailChangeToken.findUnique({
      where: { token },
      include: {
        user: true
      }
    })

    if (!emailChangeToken) {
      return NextResponse.json({ 
        error: 'Token inválido o expirado' 
      }, { status: 400 })
    }

    // Check if token has expired
    if (emailChangeToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.emailChangeToken.delete({
        where: { id: emailChangeToken.id }
      })
      
      return NextResponse.json({ 
        error: 'El enlace de confirmación ha expirado. Por favor, solicita un nuevo cambio de email.' 
      }, { status: 400 })
    }

    // Check if already confirmed
    if (emailChangeToken.confirmedAt) {
      return NextResponse.json({ 
        error: 'Este cambio de email ya fue confirmado' 
      }, { status: 400 })
    }

    // Check if new email is still available
    const existingUser = await prisma.user.findUnique({
      where: { email: emailChangeToken.newEmail }
    })

    if (existingUser) {
      return NextResponse.json({ 
        error: 'El email solicitado ya no está disponible' 
      }, { status: 400 })
    }

    // Update user email
    await prisma.user.update({
      where: { id: emailChangeToken.userId },
      data: {
        email: emailChangeToken.newEmail,
        emailVerified: new Date() // Mark as verified since user confirmed via email
      }
    })

    // Mark token as confirmed
    await prisma.emailChangeToken.update({
      where: { id: emailChangeToken.id },
      data: {
        confirmedAt: new Date()
      }
    })

    // Send confirmation emails to both addresses
    const userName = emailChangeToken.user.name || 'Usuario'
    
    // Email to OLD address
    await sendEmail({
      to: emailChangeToken.oldEmail,
      subject: '✅ Cambio de email completado - Itineramio',
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
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Cambio de Email Completado</h1>
            </div>
            
            <div class="content">
              <div class="success">
                <strong>El cambio de email se ha realizado exitosamente</strong>
              </div>
              
              <p>Hola ${userName},</p>
              
              <p>Te confirmamos que el email de tu cuenta de Itineramio ha sido cambiado correctamente.</p>
              
              <div class="info-box">
                <strong>Email anterior:</strong> ${emailChangeToken.oldEmail}<br>
                <strong>Email nuevo:</strong> ${emailChangeToken.newEmail}<br>
                <strong>Fecha del cambio:</strong> ${new Date().toLocaleString('es-ES')}
              </div>
              
              <p><strong>Importante:</strong></p>
              <ul>
                <li>A partir de ahora, debes usar tu nuevo email para iniciar sesión</li>
                <li>Todas las notificaciones se enviarán a tu nueva dirección</li>
                <li>Este email (${emailChangeToken.oldEmail}) ya no está asociado a tu cuenta</li>
              </ul>
              
              <p>Si no realizaste este cambio, por favor contacta con nuestro equipo de soporte inmediatamente.</p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Itineramio - Tu guía digital inteligente</p>
            </div>
          </div>
        </body>
        </html>
      `
    }).catch(() => {})

    // Email to NEW address
    await sendEmail({
      to: emailChangeToken.newEmail,
      subject: '🎉 Bienvenido a tu cuenta actualizada - Itineramio',
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
            .button { display: inline-block; padding: 12px 30px; background: #6B46C1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 ¡Email Actualizado!</h1>
            </div>
            
            <div class="content">
              <div class="success">
                <strong>Tu email ha sido actualizado exitosamente</strong>
              </div>
              
              <p>Hola ${userName},</p>
              
              <p>Este email (${emailChangeToken.newEmail}) ahora está asociado a tu cuenta de Itineramio.</p>
              
              <p><strong>Próximos pasos:</strong></p>
              <ul>
                <li>Usa este email para iniciar sesión</li>
                <li>Todas las notificaciones llegarán a esta dirección</li>
                <li>Tu contraseña sigue siendo la misma</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'}/login" class="button">
                  Iniciar sesión
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Itineramio - Tu guía digital inteligente</p>
            </div>
          </div>
        </body>
        </html>
      `
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Email actualizado correctamente',
      newEmail: emailChangeToken.newEmail
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Error al confirmar el cambio de email'
    }, { status: 500 })
  }
}