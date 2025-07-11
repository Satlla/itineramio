import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const {
      to,
      hostName,
      propertyName,
      propertyId,
      suggestion,
      guestInfo // optional guest information if available
    } = await request.json()

    // Validate required fields
    if (!to || !hostName || !propertyName || !suggestion) {
      return NextResponse.json({
        success: false,
        error: 'Faltan campos requeridos'
      }, { status: 400 })
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Nueva Sugerencia - Itineramio</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">💡 Nueva Sugerencia Recibida</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">¡Hola ${hostName}!</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Has recibido una nueva sugerencia para mejorar el manual de tu propiedad 
              <strong style="color: #e91e63;">${propertyName}</strong>.
            </p>

            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #e91e63; margin: 20px 0;">
              <div style="margin-bottom: 15px;">
                <span style="background: #e91e63; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                  SUGERENCIA
                </span>
              </div>
              
              ${guestInfo ? `
                <div style="margin-bottom: 15px; color: #6c757d; font-size: 14px;">
                  De parte de un huésped
                </div>
              ` : ''}
              
              <div style="background: #fce4ec; padding: 15px; border-radius: 6px;">
                <p style="margin: 0; font-style: italic; color: #495057;">
                  "${suggestion}"
                </p>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/properties/${propertyId}/zones" 
                 style="background: #e91e63; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Revisar en Dashboard
              </a>
            </div>

            <div style="background: #fff3e0; padding: 15px; border-radius: 6px; margin-top: 20px;">
              <p style="margin: 0; font-size: 14px; color: #f57c00;">
                💡 <strong>Tip:</strong> Las sugerencias de huéspedes te ayudan a mejorar la experiencia y pueden aumentar tus valoraciones.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
            <p>Este email fue enviado por Itineramio</p>
            <p>Puedes configurar tus preferencias de notificación en tu <a href="${process.env.NEXTAUTH_URL}/settings/notifications" style="color: #e91e63;">panel de configuración</a></p>
          </div>
        </body>
      </html>
    `

    const emailData = {
      from: 'Itineramio <noreply@itineramio.com>',
      to: to,
      subject: `💡 Nueva sugerencia para ${propertyName}`,
      html: emailHtml
    }

    const data = await resend.emails.send(emailData)

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Error sending suggestion email:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al enviar el email'
    }, { status: 500 })
  }
}