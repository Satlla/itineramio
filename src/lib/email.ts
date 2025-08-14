import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY || 'test_key'

if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === 'production') {
  console.warn('RESEND_API_KEY environment variable is not set')
}

const resend = new Resend(RESEND_API_KEY)

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from = 'hola@itineramio.com' }: EmailOptions) {
  // Ensure email is properly formatted
  const formattedTo = Array.isArray(to) ? to : [to]
  const cleanEmails = formattedTo.map(email => {
    // Handle emails with + symbol by encoding them properly
    const cleanEmail = email.trim()
    return cleanEmail
  })

  console.log('🔍 EMAIL DEBUG - Starting email send...')
  console.log('📧 To:', cleanEmails)
  console.log('📝 Subject:', subject)
  console.log('👤 From:', from)
  console.log('🔑 API Key present:', !!process.env.RESEND_API_KEY)
  console.log('🔑 API Key starts with:', process.env.RESEND_API_KEY?.substring(0, 10))

  // Skip email sending if no API key is configured
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'test_key') {
    console.warn('❌ Email sending skipped - no valid RESEND_API_KEY configured')
    return { id: 'test-email-id', skipped: true }
  }

  try {
    console.log('🚀 Attempting to send email via Resend...')
    
    const { data, error } = await resend.emails.send({
      from,
      to: cleanEmails[0], // Use the cleaned email
      subject,
      html,
    })

    console.log('📬 Resend response data:', JSON.stringify(data, null, 2))
    console.log('❗ Resend response error:', JSON.stringify(error, null, 2))

    if (error) {
      console.error('💥 Error sending email:', error)
      throw new Error(`Failed to send email: ${JSON.stringify(error)}`)
    }

    console.log('✅ Email sent successfully with ID:', data?.id)
    return data
  } catch (error) {
    console.error('🚨 Email service error:', error)
    throw error
  }
}

// Email templates
export const emailTemplates = {
  zoneEvaluationNotification: (propertyName: string, zoneName: string, rating: number, comment: string = '') => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nueva evaluación - Itineramio</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">Nueva evaluación recibida</h1>
        <p style="color: #666; margin: 5px 0;">Una nueva evaluación para tu propiedad</p>
      </div>
      
      <div style="background: #f0f9ff; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #1e293b; margin-top: 0;">📊 ${propertyName}</h2>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Zona evaluada:</strong> ${zoneName}</p>
          <p style="margin: 0 0 15px 0;">
            <strong>Puntuación:</strong> 
            <span style="color: #f59e0b; font-size: 18px;">
              ${'★'.repeat(rating)}${'☆'.repeat(5-rating)}
            </span>
            <span style="color: #2563eb; font-weight: bold; margin-left: 10px;">${rating}/5</span>
          </p>
          ${comment ? `
          <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb;">
            <p style="margin: 0; font-style: italic;">"${comment}"</p>
          </div>
          ` : ''}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://www.itineramio.com/main" 
             style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            Ver todas las evaluaciones
          </a>
        </div>
      </div>
      
      <div style="text-align: center; color: #94a3b8; font-size: 14px;">
        <p>Las evaluaciones te ayudan a mejorar la experiencia de tus huéspedes.</p>
        <p>© 2024 Itineramio. Todos los derechos reservados.</p>
      </div>
    </body>
    </html>
  `,
  emailVerification: (verificationUrl: string, userName: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirma tu cuenta - Itineramio</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">Itineramio</h1>
        <p style="color: #666; margin: 5px 0;">Crea manuales de propiedades increíbles</p>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #1e293b; margin-top: 0;">¡Hola ${userName}!</h2>
        <p style="color: #475569; margin-bottom: 25px;">
          Gracias por registrarte en Itineramio. Para completar tu registro y activar tu cuenta, 
          por favor confirma tu dirección de correo electrónico haciendo clic en el botón de abajo.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            Confirmar mi cuenta
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">
          Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
          <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a>
        </p>
      </div>
      
      <div style="text-align: center; color: #94a3b8; font-size: 14px;">
        <p>Este enlace expirará en 24 horas por seguridad.</p>
        <p>Si no te registraste en Itineramio, puedes ignorar este correo.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p>© 2024 Itineramio. Todos los derechos reservados.</p>
      </div>
    </body>
    </html>
  `,

  welcomeEmail: (userName: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Bienvenido a Itineramio!</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">¡Bienvenido a Itineramio!</h1>
      </div>
      
      <div style="background: #f0f9ff; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #1e293b; margin-top: 0;">¡Hola ${userName}!</h2>
        <p style="color: #475569;">
          ¡Tu cuenta ha sido verificada exitosamente! Ya puedes empezar a crear manuales 
          increíbles para tus propiedades.
        </p>
        
        <div style="margin: 25px 0;">
          <h3 style="color: #1e293b;">¿Qué puedes hacer ahora?</h3>
          <ul style="color: #475569; padding-left: 20px;">
            <li>Crear tu primera propiedad</li>
            <li>Añadir zonas personalizadas</li>
            <li>Generar códigos QR</li>
            <li>Compartir con tus huéspedes</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://itineramio.com/main" 
             style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            Ir a mi dashboard
          </a>
        </div>
      </div>
      
      <div style="text-align: center; color: #94a3b8; font-size: 14px;">
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        <p>© 2024 Itineramio. Todos los derechos reservados.</p>
      </div>
    </body>
    </html>
  `
}