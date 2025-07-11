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
      guestName,
      guestEmail,
      zoneName,
      rating,
      comment,
      evaluationType // 'zone' or 'property'
    } = await request.json()

    // Validate required fields
    if (!to || !hostName || !propertyName || !guestName || !rating) {
      return NextResponse.json({
        success: false,
        error: 'Faltan campos requeridos'
      }, { status: 400 })
    }

    const isZoneEvaluation = evaluationType === 'zone' && zoneName

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Nueva Evaluación - Itineramio</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📊 Nueva Evaluación Recibida</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">¡Hola ${hostName}!</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Has recibido una nueva evaluación ${isZoneEvaluation ? 'de zona' : 'general'} para tu propiedad 
              <strong style="color: #6c63ff;">${propertyName}</strong>.
            </p>

            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #6c63ff; margin: 20px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background: #6c63ff; color: white; padding: 5px 10px; border-radius: 20px; font-size: 14px; margin-right: 10px;">
                  ${rating}★
                </div>
                <span style="font-weight: bold; color: #495057;">
                  ${isZoneEvaluation ? `Zona: ${zoneName}` : 'Evaluación General'}
                </span>
              </div>
              
              <div style="margin-bottom: 10px;">
                <strong>Huésped:</strong> ${guestName}
                ${guestEmail ? `<br><strong>Email:</strong> ${guestEmail}` : ''}
              </div>
              
              ${comment ? `
                <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 15px;">
                  <strong>Comentario:</strong><br>
                  <em style="color: #6c757d;">"${comment}"</em>
                </div>
              ` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/properties/${propertyId}/evaluations" 
                 style="background: #6c63ff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Ver Evaluación en Dashboard
              </a>
            </div>

            <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; margin-top: 20px;">
              <p style="margin: 0; font-size: 14px; color: #1976d2;">
                💡 <strong>Tip:</strong> Responde a esta evaluación para mostrar que te importa la experiencia de tus huéspedes.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
            <p>Este email fue enviado por Itineramio</p>
            <p>Puedes configurar tus preferencias de notificación en tu <a href="${process.env.NEXTAUTH_URL}/settings/notifications" style="color: #6c63ff;">panel de configuración</a></p>
          </div>
        </body>
      </html>
    `

    const emailData = {
      from: 'Itineramio <noreply@itineramio.com>',
      to: to,
      subject: `${isZoneEvaluation ? '🏠' : '⭐'} Nueva evaluación en ${propertyName}`,
      html: emailHtml
    }

    const data = await resend.emails.send(emailData)

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Error sending evaluation email:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al enviar el email'
    }, { status: 500 })
  }
}