import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'hola@itineramio.com'

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
      from: fromEmail,
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

  // Property activation notification
  propertyActivated: (params: {
    userName: string,
    propertyName: string,
    activatedBy: 'admin' | 'payment',
    subscriptionEndsAt: string,
    reason?: string,
    invoiceNumber?: string
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>🎉 Propiedad Activada - Itineramio</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #8b5cf6; margin: 0;">🎉 Itineramio</h1>
        <p style="color: #666; margin: 5px 0;">Tu propiedad ha sido activada</p>
      </div>
      
      <div style="background: #f0fdf4; padding: 30px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #22c55e;">
        <h2 style="color: #166534; margin-top: 0;">¡Hola \${params.userName}!</h2>
        <p style="color: #15803d; margin-bottom: 25px; font-size: 18px; font-weight: 600;">
          🎉 Tu propiedad "\${params.propertyName}" ha sido activada con éxito.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #166534; margin-top: 0;">Detalles de la activación:</h3>
          <ul style="color: #15803d; padding-left: 20px;">
            <li><strong>Propiedad:</strong> \${params.propertyName}</li>
            <li><strong>Activada por:</strong> \${params.activatedBy === 'admin' ? 'Administrador' : 'Pago confirmado'}</li>
            <li><strong>Válida hasta:</strong> \${params.subscriptionEndsAt}</li>
            \${params.invoiceNumber ? \`<li><strong>Factura:</strong> \${params.invoiceNumber}</li>\` : ''}
            \${params.reason ? \`<li><strong>Motivo:</strong> \${params.reason}</li>\` : ''}
          </ul>
        </div>
        
        <p style="color: #15803d;">
          Tu propiedad ahora está publicada y visible para tus huéspedes. Puedes gestionar sus zonas, 
          añadir contenido y ver las estadísticas desde tu panel de control.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://www.itineramio.com/main" 
             style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            🏠 Ver mi propiedad
          </a>
        </div>
      </div>
      
      <div style="text-align: center; color: #94a3b8; font-size: 14px;">
        <p>¡Disfruta creando manuales increíbles para tus huéspedes!</p>
        <p>© 2024 Itineramio. Todos los derechos reservados.</p>
      </div>
    </body>
    </html>
  `,

  // Property deactivated notification
  propertyDeactivated: (params: {
    userName: string,
    propertyName: string,
    reason: string,
    deactivatedBy: 'admin' | 'expiration' | 'payment_failed'
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>❌ Propiedad Desactivada - Itineramio</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #8b5cf6; margin: 0;">❌ Itineramio</h1>
        <p style="color: #666; margin: 5px 0;">Tu propiedad ha sido desactivada</p>
      </div>
      
      <div style="background: #fef2f2; padding: 30px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #ef4444;">
        <h2 style="color: #991b1b; margin-top: 0;">Hola \${params.userName},</h2>
        <p style="color: #dc2626; margin-bottom: 25px; font-size: 18px; font-weight: 600;">
          Tu propiedad "\${params.propertyName}" ha sido desactivada.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #991b1b; margin-top: 0;">Detalles:</h3>
          <ul style="color: #dc2626; padding-left: 20px;">
            <li><strong>Propiedad:</strong> \${params.propertyName}</li>
            <li><strong>Motivo:</strong> \${params.reason}</li>
            <li><strong>Desactivada por:</strong> \${
              params.deactivatedBy === 'admin' ? 'Administrador' :
              params.deactivatedBy === 'expiration' ? 'Expiración de suscripción' :
              'Fallo en el pago'
            }</li>
          </ul>
        </div>
        
        <p style="color: #dc2626;">
          Tu propiedad ya no está visible para los huéspedes. Para reactivarla, ponte en contacto 
          con nuestro equipo o renueva tu suscripción.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://www.itineramio.com/subscriptions" 
             style="background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            💳 Renovar suscripción
          </a>
        </div>
      </div>
      
      <div style="text-align: center; color: #94a3b8; font-size: 14px;">
        <p>Si tienes alguna pregunta, no dudes en contactarnos</p>
        <p>© 2024 Itineramio. Todos los derechos reservados.</p>
      </div>
    </body>
    </html>
  `,

  // Plan change notification
  planChanged: (params: {
    userName: string,
    oldPlan: string,
    newPlan: string,
    changedBy: 'admin' | 'user',
    effectiveDate: string,
    features?: string[]
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>📋 Plan Actualizado - Itineramio</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #8b5cf6; margin: 0;">📋 Itineramio</h1>
        <p style="color: #666; margin: 5px 0;">Tu plan ha sido actualizado</p>
      </div>
      
      <div style="background: #fefbf3; padding: 30px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #f59e0b;">
        <h2 style="color: #92400e; margin-top: 0;">¡Hola \${params.userName}!</h2>
        <p style="color: #d97706; margin-bottom: 25px; font-size: 18px; font-weight: 600;">
          📋 Tu plan de suscripción ha sido actualizado.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #92400e; margin-top: 0;">Detalles del cambio:</h3>
          <ul style="color: #d97706; padding-left: 20px;">
            <li><strong>Plan anterior:</strong> \${params.oldPlan}</li>
            <li><strong>Plan nuevo:</strong> \${params.newPlan}</li>
            <li><strong>Cambiado por:</strong> \${params.changedBy === 'admin' ? 'Administrador' : 'Usuario'}</li>
            <li><strong>Efectivo desde:</strong> \${params.effectiveDate}</li>
          </ul>
          
          \${params.features && params.features.length > 0 ? \`
          <h4 style="color: #92400e;">Nuevas características incluidas:</h4>
          <ul style="color: #d97706; padding-left: 20px;">
            \${params.features.map(feature => \`<li>\${feature}</li>\`).join('')}
          </ul>
          \` : ''}
        </div>
        
        <p style="color: #d97706;">
          Los cambios en tu plan ya están activos. Puedes disfrutar de todas las características 
          de tu nuevo plan desde ahora mismo.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://www.itineramio.com/subscriptions" 
             style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            📊 Ver mi plan actual
          </a>
        </div>
      </div>
      
      <div style="text-align: center; color: #94a3b8; font-size: 14px;">
        <p>¡Aprovecha al máximo tu nuevo plan!</p>
        <p>© 2024 Itineramio. Todos los derechos reservados.</p>
      </div>
    </body>
    </html>
  `,

  invoiceNotification: (params: {
    userName: string,
    invoiceNumber: string,
    amount: string,
    dueDate: string,
    status: string,
    isPaid: boolean,
    paidDate?: string,
    paymentMethod?: string,
    downloadUrl: string
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Factura \${params.invoiceNumber} - Itineramio</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #8b5cf6; margin: 0;">📄 \${params.isPaid ? 'Factura Pagada' : 'Nueva Factura'}</h1>
      </div>
      
      <div style="background: \${params.isPaid ? '#f0fdf4' : '#f8fafc'}; border: 2px solid \${params.isPaid ? '#bbf7d0' : '#e2e8f0'}; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #1e293b; margin-top: 0;">Hola \${params.userName},</h2>
        <p style="color: #475569;">
          \${params.isPaid 
            ? 'Tu factura ha sido marcada como pagada. Aquí tienes los detalles:'
            : 'Tienes una nueva factura disponible. Aquí tienes los detalles:'
          }
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid \${params.isPaid ? '#10b981' : '#8b5cf6'};">
          <h3 style="color: #1e293b; margin-top: 0;">Detalles de la Factura</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Número de factura:</td>
              <td style="padding: 8px 0; color: #1f2937;">\${params.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Importe:</td>
              <td style="padding: 8px 0; color: #1f2937; font-weight: 600; font-size: 18px;">€\${params.amount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">\${params.isPaid ? 'Fecha de pago:' : 'Fecha de vencimiento:'}</td>
              <td style="padding: 8px 0; color: #1f2937;">\${params.isPaid ? params.paidDate : params.dueDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Estado:</td>
              <td style="padding: 8px 0;">
                <span style="background: \${params.isPaid ? '#dcfce7' : '#fef3c7'}; color: \${params.isPaid ? '#166534' : '#92400e'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                  \${params.isPaid ? '✅ PAGADA' : '⏳ PENDIENTE'}
                </span>
              </td>
            </tr>
            \${params.isPaid && params.paymentMethod ? \`
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Método de pago:</td>
              <td style="padding: 8px 0; color: #1f2937;">\${params.paymentMethod}</td>
            </tr>
            \` : ''}
          </table>
        </div>
        
        \${!params.isPaid ? \`
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            <strong>💡 Recordatorio:</strong> Esta factura vence el \${params.dueDate}. 
            Si ya has realizado el pago, por favor ignora este mensaje.
          </p>
        </div>
        \` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="\${params.downloadUrl}" 
             style="background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            📥 Descargar Factura PDF
          </a>
        </div>
        
        \${!params.isPaid ? \`
        <div style="text-align: center; margin: 20px 0;">
          <a href="https://itineramio.com/subscriptions" 
             style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            💳 Ver mis facturas
          </a>
        </div>
        \` : ''}
      </div>
      
      <div style="text-align: center; color: #94a3b8; font-size: 14px;">
        <p>Si tienes alguna pregunta sobre esta factura, no dudes en contactarnos</p>
        <p>© 2024 Itineramio. Todos los derechos reservados.</p>
      </div>
    </body>
    </html>
  `,

  paymentConfirmation: (params: {
    userName: string,
    invoiceNumber: string,
    amount: string,
    paymentMethod: string,
    paymentReference?: string,
    paidDate: string
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pago confirmado - Factura \${params.invoiceNumber}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #10b981; margin: 0;">✅ Pago Confirmado</h1>
      </div>
      
      <div style="background: #f0fdf4; border: 2px solid #bbf7d0; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #1e293b; margin-top: 0;">¡Hola \${params.userName}!</h2>
        <p style="color: #475569;">
          Tu pago ha sido procesado y confirmado exitosamente. A continuación encontrarás los detalles de tu transacción:
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="color: #1e293b; margin-top: 0;">Detalles del Pago</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Factura:</td>
              <td style="padding: 8px 0; color: #1f2937;">\${params.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Importe:</td>
              <td style="padding: 8px 0; color: #1f2937; font-weight: 600; font-size: 18px;">€\${params.amount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Método de pago:</td>
              <td style="padding: 8px 0; color: #1f2937;">\${params.paymentMethod}</td>
            </tr>
            \${params.paymentReference ? \`
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Referencia:</td>
              <td style="padding: 8px 0; color: #1f2937;">\${params.paymentReference}</td>
            </tr>
            \` : ''}
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Fecha de pago:</td>
              <td style="padding: 8px 0; color: #1f2937;">\${params.paidDate}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #1e40af; margin: 0; font-size: 14px;">
            <strong>💡 Información importante:</strong> Tu servicio continuará sin interrupciones. 
            Si tienes alguna pregunta sobre tu factura, no dudes en contactarnos.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://itineramio.com/subscriptions" 
             style="background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            Ver mis facturas
          </a>
        </div>
      </div>
      
      <div style="text-align: center; color: #94a3b8; font-size: 14px;">
        <p>Gracias por confiar en Itineramio</p>
        <p>© 2024 Itineramio. Todos los derechos reservados.</p>
      </div>
    </body>
    </html>
  `,

  // Notificación de nueva solicitud de suscripción para admins
  subscriptionRequestNotification: (params: {
    userName: string,
    userEmail: string,
    planName: string,
    totalAmount: string,
    paymentMethod: string,
    paymentReference: string,
    requestType?: string,
    requestId: string,
    adminUrl: string
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>🎯 Nueva Solicitud de ${params.requestType || 'Suscripción'} - Itineramio</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #8b5cf6; margin: 0;">🎯 Nueva Solicitud de ${params.requestType || 'Suscripción'}</h1>
        <p style="color: #666; margin: 5px 0;">Un usuario ha solicitado una ${params.requestType?.toLowerCase() || 'nueva suscripción'}</p>
      </div>
      
      <div style="background: #f0f9ff; padding: 30px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #0ea5e9;">
        <h2 style="color: #0c4a6e; margin-top: 0;">Detalles de la Solicitud</h2>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Cliente:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">\${params.userName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Email:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">\${params.userEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Plan:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">\${params.planName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Importe:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #059669; font-weight: bold;">€\${params.totalAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Método de pago:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">\${params.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Referencia:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">\${params.paymentReference}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>ID Solicitud:</strong></td>
              <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">\${params.requestId}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="\${params.adminUrl}" 
             style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            🎛️ Panel Admin
          </a>
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-top: 20px;">
          <p style="margin: 0; color: #92400e;">
            <strong>⚠️ Acción requerida:</strong> Revisar el justificante de pago y aprobar/rechazar la solicitud desde el panel de administración.
          </p>
        </div>
      </div>
      
      <div style="text-align: center; color: #94a3b8; font-size: 14px;">
        <p>Si necesitas contactar con el cliente:</p>
        <p>📧 Email: <a href="mailto:\${params.userEmail}">\${params.userEmail}</a></p>
        <p style="margin-top: 15px;">© 2024 Itineramio. Todos los derechos reservados.</p>
      </div>
    </body>
    </html>
  `,

  // Notificación de suscripción aprobada
  subscriptionApproved: (params: {
    userName: string,
    planName: string,
    startDate: string,
    endDate: string,
    invoiceNumber: string,
    totalAmount: string,
    dashboardUrl: string
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>🎉 Suscripción Activada - Itineramio</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #22c55e; margin: 0;">🎉 ¡Suscripción Activada!</h1>
        <p style="color: #666; margin: 5px 0;">Tu pago ha sido confirmado</p>
      </div>
      
      <div style="background: #f0fdf4; padding: 30px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #22c55e;">
        <h2 style="color: #166534; margin-top: 0;">¡Hola \${params.userName}!</h2>
        <p style="color: #15803d; margin-bottom: 20px; font-size: 18px;">
          🎉 ¡Excelentes noticias! Tu suscripción para <strong>\${params.planName}</strong> ha sido activada exitosamente.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #166534; margin-top: 0;">Detalles de tu Suscripción</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Plan:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">\${params.planName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Fecha de inicio:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">\${params.startDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Próxima renovación:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">\${params.endDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Factura:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">\${params.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Importe:</strong></td>
              <td style="padding: 8px 0; color: #059669; font-weight: bold;">€\${params.totalAmount}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #0c4a6e; margin-top: 0;">🚀 ¿Qué puedes hacer ahora?</h4>
          <ul style="color: #0369a1; margin: 0; padding-left: 20px;">
            <li>Crear múltiples propiedades</li>
            <li>Generar códigos QR ilimitados</li>
            <li>Acceder a estadísticas avanzadas</li>
            <li>Recibir soporte prioritario</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="\${params.dashboardUrl}" 
             style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            🏠 Ir a Mi Dashboard
          </a>
        </div>
      </div>
      
      <div style="text-align: center; color: #94a3b8; font-size: 14px;">
        <p>¡Gracias por confiar en Itineramio!</p>
        <p>Si tienes alguna pregunta, contáctanos en <a href="mailto:hola@itineramio.com">hola@itineramio.com</a></p>
        <p style="margin-top: 15px;">© 2024 Itineramio. Todos los derechos reservados.</p>
      </div>
    </body>
    </html>
  `,

  // Notificación de suscripción rechazada
  subscriptionRejected: (params: {
    userName: string,
    planName: string,
    rejectionReason: string,
    totalAmount: string,
    supportEmail: string,
    retryUrl: string
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>❌ Solicitud de Suscripción Rechazada - Itineramio</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ef4444; margin: 0;">❌ Solicitud Rechazada</h1>
        <p style="color: #666; margin: 5px 0;">Necesitamos revisar tu pago</p>
      </div>
      
      <div style="background: #fef2f2; padding: 30px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #ef4444;">
        <h2 style="color: #991b1b; margin-top: 0;">Hola \${params.userName},</h2>
        <p style="color: #dc2626; margin-bottom: 20px;">
          Lamentamos informarte que tu solicitud de suscripción para <strong>\${params.planName}</strong> ha sido rechazada.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #991b1b; margin-top: 0;">Motivo del rechazo</h3>
          <p style="color: #dc2626; margin: 0;">
            \${params.rejectionReason}
          </p>
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <h4 style="color: #92400e; margin-top: 0;">💡 ¿Qué hacer ahora?</h4>
          <ol style="color: #d97706; margin: 0; padding-left: 20px;">
            <li>Verifica que el pago se realizó correctamente</li>
            <li>Asegúrate de usar el concepto correcto: "Itineramio - \${params.planName}"</li>
            <li>Envía un justificante de pago más claro</li>
            <li>Contacta con nuestro soporte si necesitas ayuda</li>
          </ol>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="\${params.retryUrl}" 
             style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">
            🔄 Intentar de Nuevo
          </a>
          <a href="mailto:\${params.supportEmail}" 
             style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            📧 Contactar Soporte
          </a>
        </div>
        
        <div style="background: #e5e7eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #374151; margin: 0; font-size: 14px;">
            <strong>Información de la solicitud:</strong><br>
            Plan: \${params.planName}<br>
            Importe: €\${params.totalAmount}<br>
            No se ha realizado ningún cargo a tu cuenta.
          </p>
        </div>
      </div>
      
      <div style="text-align: center; color: #94a3b8; font-size: 14px;">
        <p>Estamos aquí para ayudarte. Contacta con nuestro equipo en <a href="mailto:\${params.supportEmail}">\${params.supportEmail}</a></p>
        <p style="margin-top: 15px;">© 2024 Itineramio. Todos los derechos reservados.</p>
      </div>
    </body>
    </html>
  `,

  // Template para confirmación de solicitud de renovación al usuario
  subscriptionRequestConfirmation: (params: {
    userName: string,
    planName: string,
    totalAmount: string,
    paymentMethod: string,
    paymentReference: string,
    requestId: string,
    supportEmail: string,
    requestType: string
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>📝 Solicitud de ${params.requestType} recibida - Itineramio</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3b82f6; margin: 0;">📝 Solicitud Recibida</h1>
        <p style="color: #666; margin: 5px 0;">Estamos procesando tu ${params.requestType}</p>
      </div>
      
      <div style="background: #eff6ff; padding: 30px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #3b82f6;">
        <h2 style="color: #1e40af; margin-top: 0;">¡Hola ${params.userName}!</h2>
        <p style="color: #1d4ed8;">
          Hemos recibido tu solicitud de ${params.requestType} para <strong>${params.planName}</strong> y la estamos procesando.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Detalles de la solicitud</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Plan:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${params.planName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Importe:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #059669; font-weight: bold;">€${params.totalAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Método de pago:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${params.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Referencia:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${params.paymentReference}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>ID de solicitud:</strong></td>
              <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${params.requestId}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <h4 style="color: #92400e; margin-top: 0;">⏳ ¿Qué pasa ahora?</h4>
          <ul style="color: #d97706; margin: 0; padding-left: 20px;">
            <li>Nuestro equipo verificará tu pago en las próximas 24 horas</li>
            <li>Recibirás un email de confirmación una vez aprobado</li>
            <li>Tu ${params.requestType} se activará automáticamente</li>
            <li>Podrás acceder a todas las características inmediatamente</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://www.itineramio.com/subscriptions" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            📊 Ver mis Suscripciones
          </a>
        </div>
      </div>
      
      <div style="text-align: center; color: #94a3b8; font-size: 14px;">
        <p>Si tienes alguna pregunta, contáctanos en <a href="mailto:${params.supportEmail}">${params.supportEmail}</a></p>
        <p style="margin-top: 15px;">© 2024 Itineramio. Todos los derechos reservados.</p>
      </div>
    </body>
    </html>
  `,

  // Plantilla simplificada para notificación de evaluación
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