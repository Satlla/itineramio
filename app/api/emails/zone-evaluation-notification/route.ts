import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Lazy initialization to avoid build errors
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')
  return _resend
}

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
      evaluationId 
    } = await request.json()

    // Generate stars for rating
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nueva Evaluación de Zona Recibida</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .rating { font-size: 24px; color: #ffd700; text-align: center; margin: 20px 0; }
        .property-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .guest-info { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .comment { background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px; }
        .highlight { color: #667eea; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📍 Nueva Evaluación de Zona</h1>
          <p>Has recibido una nueva evaluación que afecta la puntuación general de tu propiedad</p>
        </div>
        
        <div class="content">
          <p>Hola <strong>${hostName}</strong>,</p>
          
          <p>Has recibido una nueva evaluación para una zona específica de tu propiedad. Las evaluaciones de zonas contribuyen a la puntuación general de tu propiedad.</p>
          
          <div class="property-info">
            <h3>📍 Detalles de la Evaluación</h3>
            <p><strong>Propiedad:</strong> ${propertyName}</p>
            <p><strong>Zona evaluada:</strong> ${zoneName}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div class="rating">
            <p><strong>Puntuación:</strong></p>
            <div style="font-size: 32px; margin: 10px 0;">${stars}</div>
            <p style="color: #666; font-size: 16px;">${rating} de 5 estrellas</p>
          </div>

          <div class="guest-info">
            <h3>👤 Información del Huésped</h3>
            <p><strong>Nombre:</strong> ${guestName}</p>
            <p><strong>Email:</strong> ${guestEmail}</p>
          </div>

          ${comment ? `
          <div class="comment">
            <h3>💬 Comentario</h3>
            <p style="font-style: italic;">"${comment}"</p>
          </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/properties/${propertyId}/evaluations" class="button">
              Ver Evaluación Completa
            </a>
          </div>

          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2e7d32; margin-top: 0;">💡 ¿Por qué es importante?</h3>
            <p style="margin-bottom: 0;">Las evaluaciones de zonas específicas ayudan a calcular la puntuación general de tu propiedad y proporcionan información valiosa sobre qué áreas pueden necesitar mejoras.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Este email fue enviado automáticamente por Itineramio</p>
          <p>Las evaluaciones de zona contribuyen a mejorar la experiencia general de tus huéspedes</p>
        </div>
      </div>
    </body>
    </html>
    `

    const result = await getResend().emails.send({
      from: 'Itineramio <noreply@itineramio.com>',
      to: [to],
      subject: `🌟 Nueva evaluación de zona: ${zoneName} (${rating}★)`,
      html: emailHtml,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error sending zone evaluation email:', error)
    return NextResponse.json(
      { success: false, error: 'Error al enviar el email' },
      { status: 500 }
    )
  }
}