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

  console.log('📧 Sending email to:', cleanEmails[0], '| Subject:', subject)

  // Skip email sending if no API key is configured
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'test_key') {
    console.warn('❌ Email sending skipped - no valid RESEND_API_KEY configured')
    return { id: 'test-email-id', skipped: true }
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: cleanEmails[0],
      subject,
      html,
    })

    if (error) {
      console.error('❌ Email send failed:', error)
      throw new Error(`Failed to send email: ${JSON.stringify(error)}`)
    }

    console.log('✅ Email sent:', data?.id)
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
          <a href="https://www.itineramio.com/main" 
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
      <title>Pago confirmado - Factura ${params.invoiceNumber}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #10b981; margin: 0;">✅ Pago Confirmado</h1>
      </div>
      
      <div style="background: #f0fdf4; border: 2px solid #bbf7d0; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #1e293b; margin-top: 0;">¡Hola ${params.userName}!</h2>
        <p style="color: #475569;">
          Tu pago ha sido procesado y confirmado exitosamente. A continuación encontrarás los detalles de tu transacción:
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="color: #1e293b; margin-top: 0;">Detalles del Pago</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Factura:</td>
              <td style="padding: 8px 0; color: #1f2937;">${params.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Importe:</td>
              <td style="padding: 8px 0; color: #1f2937; font-weight: 600; font-size: 18px;">€${params.amount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Método de pago:</td>
              <td style="padding: 8px 0; color: #1f2937;">${params.paymentMethod}</td>
            </tr>
            ${params.paymentReference ? `
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Referencia:</td>
              <td style="padding: 8px 0; color: #1f2937;">${params.paymentReference}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Fecha de pago:</td>
              <td style="padding: 8px 0; color: #1f2937;">${params.paidDate}</td>
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
          <a href="https://www.itineramio.com/account/billing" 
             style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
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
      <title>Factura ${params.invoiceNumber} - Itineramio</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">📄 ${params.isPaid ? 'Factura Pagada' : 'Nueva Factura'}</h1>
      </div>
      
      <div style="background: ${params.isPaid ? '#f0fdf4' : '#f8fafc'}; border: 2px solid ${params.isPaid ? '#bbf7d0' : '#e2e8f0'}; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #1e293b; margin-top: 0;">Hola ${params.userName},</h2>
        <p style="color: #475569;">
          ${params.isPaid 
            ? 'Tu factura ha sido marcada como pagada. Aquí tienes los detalles:'
            : 'Tienes una nueva factura disponible. Aquí tienes los detalles:'
          }
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${params.isPaid ? '#10b981' : '#2563eb'};">
          <h3 style="color: #1e293b; margin-top: 0;">Detalles de la Factura</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Número de factura:</td>
              <td style="padding: 8px 0; color: #1f2937;">${params.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Importe:</td>
              <td style="padding: 8px 0; color: #1f2937; font-weight: 600; font-size: 18px;">€${params.amount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">${params.isPaid ? 'Fecha de pago:' : 'Fecha de vencimiento:'}</td>
              <td style="padding: 8px 0; color: #1f2937;">${params.isPaid ? params.paidDate : params.dueDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Estado:</td>
              <td style="padding: 8px 0;">
                <span style="background: ${params.isPaid ? '#dcfce7' : '#fef3c7'}; color: ${params.isPaid ? '#166534' : '#92400e'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                  ${params.isPaid ? '✅ PAGADA' : '⏳ PENDIENTE'}
                </span>
              </td>
            </tr>
            ${params.isPaid && params.paymentMethod ? `
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Método de pago:</td>
              <td style="padding: 8px 0; color: #1f2937;">${params.paymentMethod}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        ${!params.isPaid ? `
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            <strong>💡 Recordatorio:</strong> Esta factura vence el ${params.dueDate}. 
            Si ya has realizado el pago, por favor ignora este mensaje.
          </p>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${params.downloadUrl}" 
             style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            📥 Descargar Factura PDF
          </a>
        </div>
        
        ${!params.isPaid ? `
        <div style="text-align: center; margin: 20px 0;">
          <a href="https://www.itineramio.com/account/billing" 
             style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            💳 Ver mis facturas
          </a>
        </div>
        ` : ''}
      </div>
      
      <div style="text-align: center; color: #94a3b8; font-size: 14px;">
        <p>Si tienes alguna pregunta sobre esta factura, no dudes en contactarnos</p>
        <p>© 2024 Itineramio. Todos los derechos reservados.</p>
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
        <h1 style="color: #2563eb; margin: 0;">🎉 Itineramio</h1>
        <p style="color: #666; margin: 5px 0;">Tu propiedad ha sido activada</p>
      </div>
      
      <div style="background: #f0fdf4; padding: 30px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #22c55e;">
        <h2 style="color: #166534; margin-top: 0;">¡Hola ${params.userName}!</h2>
        <p style="color: #15803d; margin-bottom: 25px; font-size: 18px; font-weight: 600;">
          🎉 Tu propiedad "${params.propertyName}" ha sido activada con éxito.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #166534; margin-top: 0;">Detalles de la activación:</h3>
          <ul style="color: #15803d; padding-left: 20px;">
            <li><strong>Propiedad:</strong> ${params.propertyName}</li>
            <li><strong>Activada por:</strong> ${params.activatedBy === 'admin' ? 'Administrador' : 'Pago confirmado'}</li>
            <li><strong>Válida hasta:</strong> ${params.subscriptionEndsAt}</li>
            ${params.invoiceNumber ? `<li><strong>Factura:</strong> ${params.invoiceNumber}</li>` : ''}
            ${params.reason ? `<li><strong>Motivo:</strong> ${params.reason}</li>` : ''}
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
        <h1 style="color: #2563eb; margin: 0;">❌ Itineramio</h1>
        <p style="color: #666; margin: 5px 0;">Tu propiedad ha sido desactivada</p>
      </div>
      
      <div style="background: #fef2f2; padding: 30px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #ef4444;">
        <h2 style="color: #991b1b; margin-top: 0;">Hola ${params.userName},</h2>
        <p style="color: #dc2626; margin-bottom: 25px; font-size: 18px; font-weight: 600;">
          Tu propiedad "${params.propertyName}" ha sido desactivada.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #991b1b; margin-top: 0;">Detalles:</h3>
          <ul style="color: #dc2626; padding-left: 20px;">
            <li><strong>Propiedad:</strong> ${params.propertyName}</li>
            <li><strong>Motivo:</strong> ${params.reason}</li>
            <li><strong>Desactivada por:</strong> ${
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
          <a href="https://www.itineramio.com/account/billing" 
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
        <h1 style="color: #2563eb; margin: 0;">📋 Itineramio</h1>
        <p style="color: #666; margin: 5px 0;">Tu plan ha sido actualizado</p>
      </div>
      
      <div style="background: #fefbf3; padding: 30px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #f59e0b;">
        <h2 style="color: #92400e; margin-top: 0;">¡Hola ${params.userName}!</h2>
        <p style="color: #d97706; margin-bottom: 25px; font-size: 18px; font-weight: 600;">
          📋 Tu plan de suscripción ha sido actualizado.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #92400e; margin-top: 0;">Detalles del cambio:</h3>
          <ul style="color: #d97706; padding-left: 20px;">
            <li><strong>Plan anterior:</strong> ${params.oldPlan}</li>
            <li><strong>Plan nuevo:</strong> ${params.newPlan}</li>
            <li><strong>Cambiado por:</strong> ${params.changedBy === 'admin' ? 'Administrador' : 'Usuario'}</li>
            <li><strong>Efectivo desde:</strong> ${params.effectiveDate}</li>
          </ul>
          
          ${params.features && params.features.length > 0 ? `
          <h4 style="color: #92400e;">Nuevas características incluidas:</h4>
          <ul style="color: #d97706; padding-left: 20px;">
            ${params.features.map(feature => `<li>${feature}</li>`).join('')}
          </ul>
          ` : ''}
        </div>
        
        <p style="color: #d97706;">
          Los cambios en tu plan ya están activos. Puedes disfrutar de todas las características 
          de tu nuevo plan desde ahora mismo.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://www.itineramio.com/account/billing" 
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
  `
}