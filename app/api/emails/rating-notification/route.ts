import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    const { to, hostName, propertyName, rating, comment, ratingId } = await request.json()

    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY)

    const stars = '⭐'.repeat(rating)
    const propertyUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/properties`
    const reviewUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/ratings/${ratingId}`

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Nueva Evaluación Recibida - Itineramio</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f7fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 40px 20px; }
            .rating-card { background: #f7fafc; border-radius: 12px; padding: 24px; margin: 20px 0; border-left: 4px solid #48bb78; }
            .stars { font-size: 28px; margin: 10px 0; }
            .comment { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; font-style: italic; color: #4a5568; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 10px 0 0; font-weight: 500; }
            .button.secondary { background: #718096; }
            .footer { background: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 14px; }
            .highlight { color: #667eea; font-weight: 600; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌟 Nueva Evaluación Recibida</h1>
            </div>
            
            <div class="content">
                <p>Hola <strong>${hostName}</strong>,</p>
                
                <p>¡Excelentes noticias! Has recibido una nueva evaluación para tu propiedad.</p>
                
                <div class="rating-card">
                    <h3 style="margin: 0 0 10px 0; color: #2d3748;">📍 <span class="highlight">${propertyName}</span></h3>
                    <div class="stars">${stars}</div>
                    <p style="margin: 5px 0; color: #4a5568;"><strong>Calificación:</strong> ${rating} de 5 estrellas</p>
                    
                    ${comment ? `
                    <div class="comment">
                        <strong>Comentario del huésped:</strong><br>
                        "${comment}"
                    </div>
                    ` : ''}
                </div>
                
                <p><strong>🔍 Próximos pasos:</strong></p>
                <ul style="color: #4a5568; line-height: 1.6;">
                    <li>Revisa la evaluación en tu panel de control</li>
                    <li>Decide si quieres publicarla o mantenerla privada</li>
                    <li>Las evaluaciones positivas ayudan a atraer más huéspedes</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${reviewUrl}" class="button">Ver Evaluación</a>
                    <a href="${propertyUrl}" class="button secondary">Ir al Panel</a>
                </div>
                
                <p style="color: #718096; font-size: 14px; margin-top: 30px;">
                    <strong>💡 Tip:</strong> Las evaluaciones positivas mejoran la visibilidad de tu propiedad. 
                    ¡Sigue brindando experiencias excepcionales!
                </p>
            </div>
            
            <div class="footer">
                <p>Este correo fue enviado desde <strong>Itineramio</strong></p>
                <p>Sistema de gestión de propiedades turísticas</p>
                <p style="margin-top: 15px;">
                    <a href="${process.env.NEXTAUTH_URL}" style="color: #667eea;">itineramio.com</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `

    await resend.emails.send({
      from: 'Itineramio <noreply@itineramio.com>',
      to,
      subject: `🌟 Nueva evaluación recibida para ${propertyName}`,
      html: emailHtml
    })

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully'
    })

  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to send email'
    }, { status: 500 })
  }
}