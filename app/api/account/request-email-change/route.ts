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

    // Rate limit: 3 requests per user per hour
    const { allowed: rlOk } = await checkRateLimitAsync(decoded.userId + ':email-change', { maxRequests: 3, windowMs: 60 * 60 * 1000 })
    if (!rlOk) {
      return NextResponse.json({ error: 'Demasiadas solicitudes. Espera antes de volver a intentarlo.' }, { status: 429 })
    }

    const body = await request.json()
    const { newEmail, password } = body

    // Validate inputs
    if (!newEmail || !password) {
      return NextResponse.json({ 
        error: 'Email y contraseña son requeridos' 
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        properties: {
          select: { id: true }
        }
      }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Check if user has properties (extra security)
    if (currentUser.properties.length > 0) {
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, currentUser.password!)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
    }

    // Check if new email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail }
    })

    if (existingUser) {
      return NextResponse.json({ 
        error: 'Este email ya está registrado' 
      }, { status: 400 })
    }

    // Check if there's already a pending email change
    const existingToken = await prisma.emailChangeToken.findFirst({
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
      await prisma.emailChangeToken.delete({
        where: { id: existingToken.id }
      })
    }

    // Generate secure token
    const changeToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create email change token
    await prisma.emailChangeToken.create({
      data: {
        userId: decoded.userId,
        oldEmail: currentUser.email,
        newEmail,
        token: changeToken,
        expiresAt
      }
    })

    // Send confirmation email to OLD email address
    const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'}/confirm-email-change?token=${changeToken}`
    
    try {
      await sendEmail({
        to: currentUser.email, // Send to OLD email
        subject: '⚠️ Solicitud de cambio de email - Itineramio',
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
              .alert { background: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; }
              .button { display: inline-block; padding: 12px 30px; background: #6B46C1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .button.danger { background: #EF4444; }
              .info-box { background: #F3F4F6; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⚠️ Solicitud de Cambio de Email</h1>
              </div>
              
              <div class="content">
                <div class="alert">
                  <strong>¡Atención!</strong><br>
                  Se ha solicitado cambiar el email de tu cuenta de Itineramio.
                </div>
                
                <p>Hola ${currentUser.name || 'Usuario'},</p>
                
                <p>Hemos recibido una solicitud para cambiar tu dirección de email de:</p>
                
                <div class="info-box">
                  <strong>Email actual:</strong> ${currentUser.email}<br>
                  <strong>Nuevo email:</strong> ${newEmail}<br>
                  <strong>Fecha de solicitud:</strong> ${new Date().toLocaleString('es-ES')}<br>
                  ${currentUser.properties.length > 0 ? `<strong>⚠️ Nota:</strong> Tu cuenta tiene ${currentUser.properties.length} propiedad(es) asociada(s)` : ''}
                </div>
                
                <h3>¿Fuiste tú quien solicitó este cambio?</h3>
                
                <p><strong>SI SOLICITASTE ESTE CAMBIO:</strong></p>
                <p>Haz clic en el siguiente botón para confirmar el cambio de email:</p>
                
                <div style="text-align: center;">
                  <a href="${confirmationUrl}" class="button">✓ Confirmar cambio de email</a>
                </div>
                
                <p><strong>SI NO SOLICITASTE ESTE CAMBIO:</strong></p>
                <p style="color: #EF4444;">
                  <strong>Tu cuenta podría estar comprometida.</strong> 
                  Ignora este email y considera cambiar tu contraseña inmediatamente.
                </p>
                
                <div class="info-box">
                  <strong>Información de seguridad:</strong><br>
                  • Este enlace expirará en 24 horas<br>
                  • El cambio NO se realizará hasta que confirmes<br>
                  • Una vez confirmado, deberás iniciar sesión con tu nuevo email<br>
                  • Recibirás una notificación en ambos emails cuando se complete el cambio
                </div>
                
                <p><small>Si el botón no funciona, copia y pega este enlace en tu navegador:</small></p>
                <p style="word-break: break-all; font-size: 12px; color: #666;">
                  ${confirmationUrl}
                </p>
              </div>
              
              <div class="footer">
                <p>Este es un mensaje automático de seguridad de Itineramio.</p>
                <p>Si no solicitaste este cambio, por favor contacta con soporte inmediatamente.</p>
                <p>© ${new Date().getFullYear()} Itineramio - Tu guía digital inteligente</p>
              </div>
            </div>
          </body>
          </html>
        `
      })

      // Also send a notification to the NEW email
      await sendEmail({
        to: newEmail,
        subject: 'Confirmación pendiente - Cambio de email en Itineramio',
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
              .info-box { background: #F3F4F6; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📧 Confirmación Pendiente</h1>
              </div>
              
              <div class="content">
                <p>Hola,</p>
                
                <p>Se ha solicitado usar esta dirección de email (${newEmail}) para una cuenta de Itineramio.</p>
                
                <div class="info-box">
                  <strong>Estado:</strong> Pendiente de confirmación<br>
                  <strong>Acción requerida:</strong> El propietario de la cuenta actual debe confirmar el cambio desde su email actual
                </div>
                
                <p>Una vez que el cambio sea confirmado:</p>
                <ul>
                  <li>Recibirás una notificación de confirmación</li>
                  <li>Podrás iniciar sesión con este email</li>
                  <li>Todas las notificaciones se enviarán a esta dirección</li>
                </ul>
                
                <p><strong>¿No reconoces esta solicitud?</strong></p>
                <p>Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.</p>
              </div>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} Itineramio - Tu guía digital inteligente</p>
              </div>
            </div>
          </body>
          </html>
        `
      })

      return NextResponse.json({ 
        success: true,
        message: 'Se ha enviado un email de confirmación a tu dirección actual. Por favor, revisa tu bandeja de entrada.'
      })

    } catch (emailError) {
      // Clean up the token if email fails
      await prisma.emailChangeToken.deleteMany({
        where: { token: changeToken }
      })
      
      return NextResponse.json({ 
        error: 'Error al enviar el email de confirmación. Por favor, intenta nuevamente.' 
      }, { status: 500 })
    }

  } catch (error) {
    return NextResponse.json({
      error: 'Error al procesar la solicitud' 
    }, { status: 500 })
  }
}