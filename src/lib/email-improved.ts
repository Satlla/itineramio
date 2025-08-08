import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

console.log('📧 Email service initialization:', {
  hasApiKey: !!RESEND_API_KEY,
  apiKeyLength: RESEND_API_KEY?.length || 0,
  fromEmail: FROM_EMAIL,
  nodeEnv: process.env.NODE_ENV
})

// Initialize Resend client
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

export interface EmailResult {
  success: boolean
  id?: string
  error?: string
  skipped?: boolean
}

// Email sending with better error handling and fallback
export async function sendEmail({ 
  to, 
  subject, 
  html, 
  from = FROM_EMAIL,
  replyTo 
}: EmailOptions): Promise<EmailResult> {
  // Ensure email is properly formatted
  const formattedTo = Array.isArray(to) ? to : [to]
  const cleanEmails = formattedTo.map(email => email.trim().toLowerCase())

  console.log('📧 Attempting to send email:', {
    to: cleanEmails,
    subject,
    from,
    hasApiKey: !!RESEND_API_KEY
  })

  // Check if API key is configured
  if (!RESEND_API_KEY || !resend) {
    console.error('❌ Email sending failed: No RESEND_API_KEY configured or Resend client not initialized')
    return { 
      success: false, 
      error: 'Email service not configured - RESEND_API_KEY missing',
      skipped: true 
    }
  }

  try {
    // Try with configured email first
    let fromEmail = from
    let attempt = 1

    console.log('🚀 Sending email via Resend...')
    
    // First attempt with configured email
    let { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Force use fallback email that works
      to: cleanEmails,
      subject,
      html,
      ...(replyTo && { reply_to: replyTo })
    })

    if (error) {
      console.error('❌ Resend error:', error)
      
      // Check for specific errors and retry with fallback email
      if (error.message?.includes('domain') || error.message?.includes('verified') || error.message?.includes('DNS')) {
        console.error('🔐 Domain verification issue detected')
        console.log('🔄 Retrying with onboarding@resend.dev...')
        
        attempt = 2
        const retryResult = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: cleanEmails,
          subject,
          html,
          ...(replyTo && { reply_to: replyTo })
        })
        
        if (retryResult.data) {
          console.log('✅ Email sent successfully with fallback email (attempt 2)')
          return { success: true, id: retryResult.data.id }
        }
        
        if (retryResult.error) {
          console.error('❌ Retry also failed:', retryResult.error)
          return { 
            success: false, 
            error: `Failed after ${attempt} attempts: ${retryResult.error.message || 'Unknown error'}` 
          }
        }
      }
      
      return { 
        success: false, 
        error: error.message || 'Failed to send email' 
      }
    }

    console.log('✅ Email sent successfully:', data?.id)
    return { 
      success: true, 
      id: data?.id 
    }

  } catch (error) {
    console.error('🚨 Email service error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Enhanced email templates with better styling
export const emailTemplates = {
  emailVerification: (verificationUrl: string, userName: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirma tu cuenta - Itineramio</title>
      <style>
        @media only screen and (max-width: 600px) {
          .container { padding: 10px !important; }
          .content { padding: 20px !important; }
          .button { display: block !important; width: 100% !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
      <div class="container" style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: white; border-radius: 10px 10px 0 0;">
          <h1 style="color: #8b5cf6; margin: 0; font-size: 28px;">Itineramio</h1>
          <p style="color: #666; margin: 5px 0;">Crea manuales de propiedades increíbles</p>
        </div>
        
        <!-- Content -->
        <div class="content" style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin-top: 0;">¡Hola ${userName}!</h2>
          <p style="color: #475569; margin-bottom: 25px;">
            Gracias por registrarte en Itineramio. Para completar tu registro y activar tu cuenta, 
            por favor confirma tu dirección de correo electrónico.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               class="button"
               style="background: #8b5cf6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);">
              Confirmar mi cuenta
            </a>
          </div>
          
          <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin-top: 25px;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              Si el botón no funciona, copia y pega este enlace en tu navegador:
            </p>
            <p style="margin: 5px 0;">
              <a href="${verificationUrl}" style="color: #8b5cf6; word-break: break-all; font-size: 13px;">${verificationUrl}</a>
            </p>
          </div>
          
          <p style="color: #94a3b8; font-size: 13px; margin-top: 20px; text-align: center;">
            Este enlace expirará en 24 horas por seguridad.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 13px;">
          <p style="margin: 5px 0;">Si no te registraste en Itineramio, puedes ignorar este correo.</p>
          <p style="margin: 15px 0 5px 0;">© 2024 Itineramio. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  welcomeEmail: (userName: string, dashboardUrl: string = 'https://itineramio.com/main') => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Bienvenido a Itineramio!</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header with celebration -->
        <div style="text-align: center; margin-bottom: 30px; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 32px;">🎉 ¡Bienvenido a Itineramio!</h1>
        </div>
        
        <!-- Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin-top: 0;">¡Hola ${userName}!</h2>
          <p style="color: #475569; font-size: 16px;">
            ¡Tu cuenta ha sido verificada exitosamente! Ya puedes empezar a crear manuales 
            increíbles para tus propiedades.
          </p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">✨ ¿Qué puedes hacer ahora?</h3>
            <ul style="color: #475569; padding-left: 20px;">
              <li style="margin: 8px 0;">📍 Crear tu primera propiedad</li>
              <li style="margin: 8px 0;">🏠 Añadir zonas personalizadas</li>
              <li style="margin: 8px 0;">📱 Generar códigos QR únicos</li>
              <li style="margin: 8px 0;">🌟 Compartir con tus huéspedes</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" 
               style="background: #8b5cf6; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);">
              Ir a mi dashboard
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px;">
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              💡 <strong>Consejo:</strong> Empieza creando las zonas esenciales como Check-in, 
              WiFi y Normas de la casa. ¡Tus huéspedes te lo agradecerán!
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 13px;">
          <p style="margin: 5px 0;">¿Necesitas ayuda? Contáctanos en support@itineramio.com</p>
          <p style="margin: 15px 0 5px 0;">© 2024 Itineramio. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Nueva plantilla para notificación de evaluación
  zoneEvaluationNotification: (propertyName: string, zoneName: string, rating: number, comment?: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nueva evaluación recibida - Itineramio</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: white; border-radius: 10px 10px 0 0;">
          <h1 style="color: #8b5cf6; margin: 0; font-size: 28px;">Itineramio</h1>
          <p style="color: #666; margin: 5px 0;">Nueva evaluación de zona</p>
        </div>
        
        <!-- Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; background: #fef3c7; padding: 15px; border-radius: 50%;">
              ${rating >= 4 ? '⭐' : rating >= 3 ? '👍' : '💬'}
            </div>
          </div>
          
          <h2 style="color: #1e293b; text-align: center; margin-top: 0;">
            ¡Has recibido una evaluación!
          </h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Propiedad:</strong> ${propertyName}</p>
            <p style="margin: 5px 0;"><strong>Zona:</strong> ${zoneName}</p>
            <p style="margin: 5px 0;"><strong>Valoración:</strong> ${'⭐'.repeat(rating)}${' ☆'.repeat(5 - rating)} (${rating}/5)</p>
            ${comment ? `
            <p style="margin: 15px 0 5px 0;"><strong>Comentario:</strong></p>
            <p style="margin: 5px 0; padding: 10px; background: white; border-radius: 6px; font-style: italic;">
              "${comment}"
            </p>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://itineramio.com/main" 
               style="background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Ver todas las evaluaciones
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 13px;">
          <p style="margin: 15px 0 5px 0;">© 2024 Itineramio. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Email queue for retry logic (to be implemented with a proper queue system)
export const emailQueue = {
  add: async (emailOptions: EmailOptions) => {
    // TODO: Implement with Bull or similar queue system
    console.log('📮 Email added to queue:', emailOptions.subject)
    return sendEmail(emailOptions)
  }
}