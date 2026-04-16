import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY || 'test_key'

if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === 'production') {
  // RESEND_API_KEY not set
}

const resend = new Resend(RESEND_API_KEY)

export interface EmailAttachment {
  filename: string
  content: Buffer
  contentType?: string
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  attachments?: EmailAttachment[]
}

export async function sendEmail({ to, subject, html, from = 'hola@itineramio.com', attachments }: EmailOptions) {
  // Ensure email is properly formatted
  const formattedTo = Array.isArray(to) ? to : [to]
  const cleanEmails = formattedTo.map(email => {
    // Handle emails with + symbol by encoding them properly
    const cleanEmail = email.trim()
    return cleanEmail
  })

  // Skip email sending if no API key is configured
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'test_key') {
    return { id: 'test-email-id', skipped: true }
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: cleanEmails[0],
      subject,
      html,
      ...(attachments?.length ? { attachments: attachments.map(a => ({ filename: a.filename, content: a.content })) } : {}),
    })

    if (error) {
      throw new Error(`Failed to send email: ${JSON.stringify(error)}`)
    }

    return data
  } catch (error) {
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
        <p>© 2026 Itineramio. Todos los derechos reservados.</p>
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
        <p>© 2026 Itineramio. Todos los derechos reservados.</p>
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
        <p>© 2026 Itineramio. Todos los derechos reservados.</p>
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
        <p>© 2026 Itineramio. Todos los derechos reservados.</p>
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
        <p>© 2026 Itineramio. Todos los derechos reservados.</p>
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
        <p>© 2026 Itineramio. Todos los derechos reservados.</p>
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
        <p>© 2026 Itineramio. Todos los derechos reservados.</p>
      </div>
    </body>
    </html>
  `,

  // Magic Link for Property Owner Portal
  ownerPortalLink: (params: {
    ownerName: string,
    managerName: string,
    portalUrl: string,
    monthName: string,
    year: number
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tu resumen de ${params.monthName} ${params.year}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">📊 Resumen Mensual</h1>
        <p style="color: #666; margin: 5px 0;">${params.monthName} ${params.year}</p>
      </div>

      <div style="background: #f0f9ff; padding: 30px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #2563eb;">
        <h2 style="color: #1e3a5f; margin-top: 0;">Hola ${params.ownerName},</h2>
        <p style="color: #475569; font-size: 16px;">
          ${params.managerName} te ha enviado el resumen de tus propiedades correspondiente a <strong>${params.monthName} ${params.year}</strong>.
        </p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <p style="color: #1e3a5f; margin: 0; font-weight: 500;">
            En tu portal podrás ver:
          </p>
          <ul style="color: #475569; margin: 10px 0; padding-left: 20px;">
            <li>Detalle de todas las reservas del mes</li>
            <li>Liquidación con ingresos y comisiones</li>
            <li>Factura descargable en PDF</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${params.portalUrl}"
             style="background: #2563eb; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
            Ver mi resumen
          </a>
        </div>

        <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-bottom: 0;">
          Este enlace es personal y caduca en 7 días
        </p>
      </div>

      <div style="text-align: center; color: #94a3b8; font-size: 13px;">
        <p>Si tienes alguna duda, contacta directamente con ${params.managerName}</p>
      </div>
    </body>
    </html>
  `,

  // Demo confirmation email with coupon
  demoConfirmation: (params: {
    leadName: string,
    propertyName: string,
    guideUrl: string,
    couponCode: string,
    couponExpiresAt: string,
    propertyId?: string,
    leadEmail?: string,
    zonesCount?: number,
    registerUrl?: string
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; margin: 0; padding: 0; background-color: #ffffff;">
      <div style="max-width: 520px; margin: 0 auto; padding: 40px 24px;">
        <p style="font-size: 15px; color: #1a1a1a;">Hola ${params.leadName},</p>
        <p style="font-size: 15px; color: #374151;">El manual de <strong style="color: #1a1a1a;">${params.propertyName}</strong> est&aacute; listo. Hemos generado ${params.zonesCount || 6} zonas con instrucciones en 3 idiomas y un asistente IA que responde por ti.</p>
        <p style="font-size: 15px; color: #374151;"><strong style="color: #1a1a1a;">Tienes 15 minutos para probarlo.</strong> Despu&eacute;s, el acceso se cierra.</p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${params.guideUrl}" style="background: #1a1a1a; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; display: inline-block; font-size: 15px;">Abrir mi manual ahora</a>
        </div>

        <p style="font-size: 14px; font-weight: 600; color: #1a1a1a; margin: 24px 0 8px;">Qu&eacute; probar en esos 15 minutos:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #374151; vertical-align: top; width: 24px;">1.</td>
            <td style="padding: 8px 0; font-size: 14px; color: #374151;"><strong style="color: #1a1a1a;">Navega como tu hu&eacute;sped</strong> — abre las zonas y mira las instrucciones. As&iacute; es como lo ver&aacute; cuando escanee el QR de cada zona.</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #374151; vertical-align: top;">2.</td>
            <td style="padding: 8px 0; font-size: 14px; color: #374151;"><strong style="color: #1a1a1a;">Habla con el asistente IA</strong> — preg&uacute;ntale &laquo;&iquest;cu&aacute;l es el WiFi?&raquo; o &laquo;&iquest;c&oacute;mo funciona el check-in?&raquo;. Responde 24/7 en el idioma del hu&eacute;sped.</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #374151; vertical-align: top;">3.</td>
            <td style="padding: 8px 0; font-size: 14px; color: #374151;"><strong style="color: #1a1a1a;">Cambia de idioma</strong> — tu manual ya est&aacute; traducido a espa&ntilde;ol, ingl&eacute;s y franc&eacute;s. Comprueba que las traducciones tienen sentido.</td>
          </tr>
        </table>

        <p style="font-size: 13px; color: #9ca3af; margin: 16px 0 0; line-height: 1.6;">Esto es solo la demo. Con tu cuenta tendr&aacute;s mucho m&aacute;s: QR f&iacute;sicos por zona, recomendaciones locales, avisos a hu&eacute;spedes, panel Intelligence para entrenar al chatbot, y conjuntos para gestionar varios apartamentos a la vez.</p>

        <div style="text-align: center; margin: 32px 0 24px;">
          <a href="${params.guideUrl}" style="background: #1a1a1a; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; display: inline-block; font-size: 15px;">Abrir mi manual ahora</a>
        </div>

        <div style="background: #f9fafb; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
          <p style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.6;">
            <strong style="color: #374151;">Si te convence</strong>, reg&iacute;strate desde el propio manual. Tienes 15 d&iacute;as de prueba gratis y un cup&oacute;n del 20% que puedes usar cuando quieras suscribirte.
          </p>
        </div>

        <p style="font-size: 14px; color: #9ca3af; margin: 0;">Si hay algo que no funciona, responde a este email.</p>
        <p style="font-size: 15px; color: #1a1a1a; margin-top: 20px;">Equipo de Itineramio</p>
      </div>
    </body>
    </html>
  `,

  // Demo feedback request email
  demoFeedback: (params: {
    leadName: string,
    propertyName: string,
    feedbackUrl: string,
    couponCode: string,
    couponExpiresAt: string
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; margin: 0; padding: 0; background-color: #ffffff;">
      <div style="max-width: 520px; margin: 0 auto; padding: 40px 24px;">
        <p style="font-size: 15px; color: #1a1a1a;">Hola ${params.leadName},</p>
        <p style="font-size: 15px; color: #374151;">Hace un rato generaste el manual de <strong style="color: #1a1a1a;">${params.propertyName}</strong>.</p>
        <p style="font-size: 15px; color: #374151;">Queremos pedirte un favor: cu&eacute;ntanos qu&eacute; te ha parecido. Estamos construyendo esta herramienta y tu opini&oacute;n es lo que nos permite mejorarla. S&eacute; honesto &mdash; es lo &uacute;nico que funciona.</p>
        <p style="font-size: 15px; color: #374151;">Solo te llevar&aacute; 1 minuto.</p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${params.feedbackUrl}" style="background: #1a1a1a; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; display: inline-block; font-size: 15px;">Dejar mi opini&oacute;n</a>
        </div>

        <p style="font-size: 13px; color: #9ca3af; margin: 0 0 4px;">Recuerda que tienes un cup&oacute;n del 20% de descuento: <strong style="color: #374151; font-family: monospace;">${params.couponCode}</strong></p>
        <p style="font-size: 13px; color: #9ca3af; margin: 0;">V&aacute;lido hasta: ${params.couponExpiresAt}</p>

        <p style="font-size: 15px; color: #1a1a1a; margin-top: 28px;">Equipo de Itineramio</p>
      </div>
    </body>
    </html>
  `,

  // Demo urgency email — coupon expiring (dark + orange/red accents)
  demoUrgency: (params: {
    leadName: string,
    propertyName: string,
    couponCode: string,
    registerUrl: string
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; margin: 0; padding: 0; background-color: #ffffff;">
      <div style="max-width: 520px; margin: 0 auto; padding: 40px 24px;">
        <p style="font-size: 15px; color: #1a1a1a;">Hola ${params.leadName},</p>
        <p style="font-size: 15px; color: #374151;">Tu cup&oacute;n del 20% para <strong style="color: #1a1a1a;">${params.propertyName}</strong> expira en menos de 1 hora.</p>
        <p style="font-size: 15px; color: #374151;">Despu&eacute;s de eso, el c&oacute;digo deja de funcionar y no podemos recuperarlo.</p>

        <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Tu c&oacute;digo</p>
          <p style="font-family: monospace; font-size: 24px; font-weight: 700; color: #1a1a1a; letter-spacing: 3px; margin: 0 0 8px;">${params.couponCode}</p>
          <p style="font-size: 13px; color: #ef4444; font-weight: 600; margin: 0;">Expira en menos de 1 hora</p>
        </div>

        <p style="font-size: 15px; color: #374151;">Reg&iacute;strate ahora y tienes 15 d&iacute;as gratis para probarlo con tu alojamiento real. Sin tarjeta de cr&eacute;dito.</p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${params.registerUrl}" style="background: #1a1a1a; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; display: inline-block; font-size: 15px;">Crear mi cuenta con 20% dto</a>
        </div>

        <p style="font-size: 15px; color: #1a1a1a; margin-top: 28px;">Equipo de Itineramio</p>
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
        <p>© 2026 Itineramio. Todos los derechos reservados.</p>
      </div>
    </body>
    </html>
  `,

  // Demo chatbot engagement email (T+6h)
  demoChatbotEngagement: (params: {
    leadName: string,
    propertyName: string,
    couponCode: string,
    registerUrl: string
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tu chatbot IA - Itineramio</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; margin: 0; padding: 0; background-color: #ffffff;">
      <div style="max-width: 520px; margin: 0 auto; padding: 40px 24px;">
        <p style="font-size: 15px; color: #1a1a1a;">Hola ${params.leadName},</p>
        <p style="font-size: 15px; color: #374151;">Ayer generaste el manual de <strong style="color: #1a1a1a;">${params.propertyName}</strong>. Si lo probaste, ya sabes lo que hace. Si no, esto es lo que te est&aacute;s perdiendo:</p>

        <p style="font-size: 15px; color: #374151;">Cada vez que un hu&eacute;sped te escribe &laquo;&iquest;cu&aacute;l es el WiFi?&raquo; o &laquo;&iquest;c&oacute;mo se enciende la vitro?&raquo;, t&uacute; respondes. Con Itineramio, el asistente IA responde por ti. En el idioma del hu&eacute;sped. A las 3 de la ma&ntilde;ana. Sin que toques el m&oacute;vil.</p>

        <p style="font-size: 15px; color: #374151;">Y eso es solo el chatbot. Con tu cuenta tambi&eacute;n tienes:</p>

        <table style="width: 100%; border-collapse: collapse; margin: 8px 0 20px;">
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #374151; vertical-align: top; width: 20px;">&bull;</td>
            <td style="padding: 6px 0; font-size: 14px; color: #374151;"><strong style="color: #1a1a1a;">QR f&iacute;sicos por zona</strong> &mdash; lavadora, vitro, piscina. El hu&eacute;sped escanea y ve c&oacute;mo funciona.</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #374151; vertical-align: top;">&bull;</td>
            <td style="padding: 6px 0; font-size: 14px; color: #374151;"><strong style="color: #1a1a1a;">Panel Intelligence</strong> &mdash; entrena al chatbot con tus propias respuestas y preguntas frecuentes.</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #374151; vertical-align: top;">&bull;</td>
            <td style="padding: 6px 0; font-size: 14px; color: #374151;"><strong style="color: #1a1a1a;">Recomendaciones locales</strong> &mdash; restaurantes, farmacias, transporte. El hu&eacute;sped deja de preguntarte.</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #374151; vertical-align: top;">&bull;</td>
            <td style="padding: 6px 0; font-size: 14px; color: #374151;"><strong style="color: #1a1a1a;">Avisos y conjuntos</strong> &mdash; gestiona varios apartamentos, env&iacute;a avisos a hu&eacute;spedes activos.</td>
          </tr>
        </table>

        <p style="font-size: 15px; color: #374151;">15 d&iacute;as de prueba gratis. Sin tarjeta. Y tu cup&oacute;n del 20% sigue activo: <strong style="font-family: monospace; color: #1a1a1a;">${params.couponCode}</strong></p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${params.registerUrl}" style="background: #1a1a1a; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; display: inline-block; font-size: 15px;">Crear mi cuenta gratis</a>
        </div>

        <p style="font-size: 14px; color: #9ca3af; margin: 0;">Si tienes dudas, responde a este email.</p>
        <p style="font-size: 15px; color: #1a1a1a; margin-top: 20px;">Equipo de Itineramio</p>
      </div>
    </body>
    </html>
  `,

  // Demo FOMO social proof email (T+12h)
  demoFomo: (params: {
    leadName: string,
    propertyName: string,
    couponCode: string,
    registerUrl: string,
    hostsThisWeek: number
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Anfitriones activos - Itineramio</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #0f0a1a;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; padding-top: 20px;">
          <h1 style="color: #a78bfa; margin: 0; font-size: 28px;">Itineramio</h1>
        </div>

        <div style="background: linear-gradient(135deg, #1a1025, #1e1533); padding: 35px; border-radius: 16px; margin-bottom: 20px; border: 1px solid #2d2240;">
          <h2 style="color: #e2e8f0; margin-top: 0; font-size: 22px; text-align: center;">
            ${params.hostsThisWeek} anfitriones activaron su manual esta semana
          </h2>

          <p style="color: #a1a1aa; font-size: 15px; text-align: center; margin-bottom: 25px;">
            ${params.leadName}, otros anfitriones como t&uacute; ya est&aacute;n ahorrando tiempo y mejorando la experiencia de sus hu&eacute;spedes.
          </p>

          <!-- Testimonials -->
          <div style="space-y: 16px;">
            <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 10px; margin-bottom: 12px;">
              <p style="color: #e2e8f0; font-size: 14px; margin: 0 0 8px 0;">
                &ldquo;80% menos consultas de hu&eacute;spedes desde que uso Itineramio&rdquo;
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">&mdash; Mar&iacute;a G., Madrid</p>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 10px; margin-bottom: 12px;">
              <p style="color: #e2e8f0; font-size: 14px; margin: 0 0 8px 0;">
                &ldquo;Mis hu&eacute;spedes dejan mejores rese&ntilde;as porque encuentran todo en el manual&rdquo;
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">&mdash; Ana P., Valencia</p>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 10px;">
              <p style="color: #e2e8f0; font-size: 14px; margin: 0 0 8px 0;">
                &ldquo;El chatbot IA es incre&iacute;ble. Responde en 3 idiomas sin que yo haga nada&rdquo;
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">&mdash; Luis M., Malaga</p>
            </div>
          </div>

          <!-- Coupon -->
          <div style="background: rgba(124, 58, 237, 0.08); padding: 14px 16px; border-radius: 8px; text-align: center; margin: 25px 0;">
            <p style="color: #c4b5fd; font-size: 14px; margin: 0 0 4px 0;">Tu cup&oacute;n del 20% a&uacute;n est&aacute; activo</p>
            <span style="font-family: monospace; font-size: 20px; font-weight: 700; color: #a78bfa; letter-spacing: 2px;">${params.couponCode}</span>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${params.registerUrl}"
               style="background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 16px 44px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; font-size: 16px;">
              Reg&iacute;strate ahora
            </a>
          </div>
        </div>

        <div style="text-align: center; color: #4b5563; font-size: 13px; padding-bottom: 20px;">
          <p>&copy; 2026 Itineramio. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Demo last chance email (T+48h, no coupon)
  demoLastChance: (params: {
    leadName: string,
    propertyName: string,
    registerUrl: string
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; margin: 0; padding: 0; background-color: #ffffff;">
      <div style="max-width: 520px; margin: 0 auto; padding: 40px 24px;">
        <p style="font-size: 15px; color: #1a1a1a;">Hola ${params.leadName},</p>
        <p style="font-size: 15px; color: #374151;">Tu demo de <strong style="color: #1a1a1a;">${params.propertyName}</strong> ha expirado. El manual y el chatbot ya no est&aacute;n accesibles.</p>
        <p style="font-size: 15px; color: #374151;">Mientras tanto, tus hu&eacute;spedes siguen escribi&eacute;ndote las mismas preguntas de siempre. WiFi. Check-in. Normas. Vitrocer&aacute;mica.</p>
        <p style="font-size: 15px; color: #374151;">Si creas tu cuenta, la IA genera un manual nuevo en 8 minutos con todo lo que ya configuraste. 15 d&iacute;as gratis. Sin tarjeta.</p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${params.registerUrl}" style="background: #1a1a1a; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; display: inline-block; font-size: 15px;">Crear mi cuenta gratis</a>
        </div>

        <p style="font-size: 13px; color: #9ca3af; margin: 24px 0 0;">P.S. Si crees que le falt&oacute; algo a la demo o hay algo que mejorar&iacute;as, responde a este email. Lo leemos todo.</p>
        <p style="font-size: 15px; color: #1a1a1a; margin-top: 20px;">Equipo de Itineramio</p>
      </div>
    </body>
    </html>
  `,

  // Demo OTP verification email (dark/violet theme)
  demoOtpVerification: (params: {
    otpCode: string,
    leadName?: string,
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tu c&oacute;digo de verificaci&oacute;n - Itineramio</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #0f0a1a;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; padding-top: 20px;">
          <h1 style="color: #a78bfa; margin: 0; font-size: 28px;">Itineramio</h1>
          <p style="color: #6b7280; margin: 5px 0; font-size: 14px;">Verificaci&oacute;n de email</p>
        </div>

        <div style="background: linear-gradient(135deg, #1a1025, #1e1533); padding: 35px; border-radius: 16px; margin-bottom: 20px; border: 1px solid #2d2240;">
          <h2 style="color: #e2e8f0; margin-top: 0; font-size: 22px; text-align: center;">
            ${params.leadName ? `Hola ${params.leadName},` : 'Hola,'}
          </h2>
          <p style="color: #a1a1aa; font-size: 16px; text-align: center;">
            Introduce este c&oacute;digo para verificar tu email y generar tu demo gratuito:
          </p>

          <div style="background: rgba(139, 92, 246, 0.15); padding: 20px; border-radius: 12px; text-align: center; margin: 25px 0; border: 1px solid rgba(139, 92, 246, 0.3);">
            <span style="font-family: monospace; font-size: 36px; font-weight: 700; color: #a78bfa; letter-spacing: 8px;">${params.otpCode}</span>
          </div>

          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-bottom: 0;">
            Este c&oacute;digo expira en <strong style="color: #a78bfa;">10 minutos</strong>.
          </p>
          <p style="color: #4b5563; font-size: 13px; text-align: center;">
            Si no solicitaste este c&oacute;digo, puedes ignorar este email.
          </p>
        </div>

        <div style="text-align: center; color: #4b5563; font-size: 13px; padding-bottom: 20px;">
          <p>&copy; 2026 Itineramio. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  liquidationSentToOwner: (params: {
    ownerName: string
    managerName: string
    monthName: string
    year: number
    totalAmount: string
    portalUrl: string
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f6f8fa; color: #24292f;">
      <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; padding: 16px 0 24px 0;">
          <h2 style="color: #8b5cf6; margin: 0;">Itineramio</h2>
        </div>
        <div style="background: #0d1117; border-radius: 12px 12px 0 0; padding: 36px; text-align: center;">
          <h1 style="color: #fff; margin: 0 0 8px 0; font-size: 24px;">Liquidación lista para revisar</h1>
          <p style="color: #8b949e; margin: 0;">Hola ${params.ownerName}, tienes una liquidación pendiente de confirmación</p>
        </div>
        <div style="background: #fff; border-radius: 0 0 12px 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <p style="color: #475569; margin-top: 0;">
            <strong>${params.managerName}</strong> ha preparado la liquidación de <strong>${params.monthName} ${params.year}</strong>.
          </p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 4px 0; color: #166534; font-size: 14px;">Total a percibir</p>
            <p style="margin: 0; color: #15803d; font-size: 28px; font-weight: 700;">${params.totalAmount}</p>
          </div>
          <p style="color: #475569;">Revisa el detalle y confirma que todo es correcto pulsando el botón:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${params.portalUrl}" style="background: #8b5cf6; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Ver y confirmar liquidación
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">Si tienes alguna duda, contacta directamente con ${params.managerName}.</p>
        </div>
        <div style="text-align: center; color: #6b7280; font-size: 13px; padding: 16px 0;">
          <p>&copy; 2026 Itineramio. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  ownerConfirmedLiquidation: (params: {
    managerName: string
    ownerName: string
    monthName: string
    year: number
    liquidationUrl: string
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f6f8fa; color: #24292f;">
      <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; padding: 16px 0 24px 0;">
          <h2 style="color: #8b5cf6; margin: 0;">Itineramio</h2>
        </div>
        <div style="background: #0d1117; border-radius: 12px 12px 0 0; padding: 36px; text-align: center;">
          <h1 style="color: #fff; margin: 0 0 8px 0; font-size: 24px;">&#10003; Liquidación confirmada</h1>
          <p style="color: #8b949e; margin: 0;">El propietario ha dado el OK</p>
        </div>
        <div style="background: #fff; border-radius: 0 0 12px 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <p style="color: #475569; margin-top: 0;">
            Hola <strong>${params.managerName}</strong>,
          </p>
          <p style="color: #475569;">
            <strong>${params.ownerName}</strong> ha confirmado la liquidación de <strong>${params.monthName} ${params.year}</strong>.
            Ya puedes proceder a marcarla como pagada o generar la factura correspondiente.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${params.liquidationUrl}" style="background: #22c55e; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Ver liquidación
            </a>
          </div>
        </div>
        <div style="text-align: center; color: #6b7280; font-size: 13px; padding: 16px 0;">
          <p>&copy; 2026 Itineramio. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Demo activation email (T+24h) — enfocado en Intelligence + próximos pasos
  demoActivation: (params: {
    leadName: string,
    propertyName: string,
    couponCode: string,
    registerUrl: string,
    guideUrl: string,
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tu manual de ${params.propertyName} espera — Itineramio</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; padding: 24px 16px;">

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 28px; padding-top: 8px;">
          <div style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #7c3aed, #db2777); padding: 8px 16px; border-radius: 20px;">
            <span style="color: white; font-weight: 800; font-size: 16px; letter-spacing: -0.5px;">Itineramio</span>
          </div>
        </div>

        <!-- Main card -->
        <div style="background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); margin-bottom: 20px;">

          <!-- Top accent -->
          <div style="height: 4px; background: linear-gradient(90deg, #7c3aed, #db2777);"></div>

          <div style="padding: 32px 28px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">Hola ${params.leadName} 👋</p>
            <h1 style="color: #111827; font-size: 22px; font-weight: 800; margin: 0 0 12px 0; line-height: 1.3;">
              Tu manual de <span style="background: linear-gradient(135deg, #7c3aed, #db2777); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${params.propertyName}</span> está listo
            </h1>
            <p style="color: #4b5563; font-size: 15px; margin: 0 0 24px 0; line-height: 1.6;">
              Creaste tu guía digital ayer. Ahora te explicamos los <strong>3 pasos que marcan la diferencia</strong> entre un manual que funciona y uno que nadie usa.
            </p>

            <!-- Step 1 -->
            <div style="background: #faf5ff; border-radius: 14px; padding: 20px; margin-bottom: 16px; border-left: 4px solid #7c3aed;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #7c3aed, #db2777); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <span style="color: white; font-weight: 800; font-size: 14px;">1</span>
                </div>
                <div>
                  <p style="color: #111827; font-weight: 700; margin: 0 0 6px 0; font-size: 15px;">Nutre el chatbot desde Intelligence</p>
                  <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">
                    Cuando actives tu cuenta, ve a la sección <strong style="color: #7c3aed;">Intelligence</strong> de tu propiedad. Ahí puedes añadir preguntas frecuentes, respuestas personalizadas y contexto que el chatbot usará para responder a tus huéspedes.
                  </p>
                  <p style="color: #9333ea; font-size: 13px; margin: 8px 0 0 0; font-weight: 600;">
                    💡 Cuanto más completo esté, menos preguntas recibirás.
                  </p>
                </div>
              </div>
            </div>

            <!-- Step 2 -->
            <div style="background: #fff1f2; border-radius: 14px; padding: 20px; margin-bottom: 16px; border-left: 4px solid #db2777;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #db2777, #f43f5e); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <span style="color: white; font-weight: 800; font-size: 14px;">2</span>
                </div>
                <div>
                  <p style="color: #111827; font-weight: 700; margin: 0 0 6px 0; font-size: 15px;">El chatbot responde y envía vídeos automáticamente</p>
                  <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">
                    Tu huésped pregunta "¿cómo funciona la lavadora?" — el chatbot responde en su idioma <em>y</em> envía el vídeo que subiste. Sin que toques el móvil. En <strong>7 idiomas</strong> (ES, EN, FR, DE, IT, PT, NL).
                  </p>
                </div>
              </div>
            </div>

            <!-- Step 3 -->
            <div style="background: #f0fdf4; border-radius: 14px; padding: 20px; margin-bottom: 28px; border-left: 4px solid #22c55e;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #16a34a, #22c55e); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <span style="color: white; font-weight: 800; font-size: 14px;">3</span>
                </div>
                <div>
                  <p style="color: #111827; font-weight: 700; margin: 0 0 6px 0; font-size: 15px;">Un agente de Itineramio te contactará hoy</p>
                  <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">
                    Uno de nuestros agentes analizará tu caso y te ayudará a optimizar el manual. La llamada es corta — ya tienes el manual creado, solo nos falta ajustar los detalles.
                  </p>
                </div>
              </div>
            </div>

            <!-- CTA buttons -->
            <div style="text-align: center; margin-bottom: 16px;">
              <a href="${params.registerUrl}"
                 style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #db2777); color: white; padding: 15px 36px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; letter-spacing: -0.3px; box-shadow: 0 4px 20px rgba(124,58,237,0.3);">
                Activar mi manual permanente →
              </a>
            </div>
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${params.guideUrl}"
                 style="display: inline-block; color: #7c3aed; padding: 10px 24px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; border: 1.5px solid #ddd6fe;">
                Ver mi guía ahora
              </a>
            </div>

            <!-- Coupon -->
            <div style="background: linear-gradient(135deg, #faf5ff, #fff1f2); border-radius: 12px; padding: 16px 20px; text-align: center; border: 1.5px dashed #d8b4fe;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">Tu cupón de 20% de descuento</p>
              <span style="font-family: 'Courier New', monospace; font-size: 22px; font-weight: 800; color: #7c3aed; letter-spacing: 3px;">${params.couponCode}</span>
              <p style="color: #9ca3af; font-size: 12px; margin: 6px 0 0 0;">Aplica al registrarte · Válido 48h más</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; color: #9ca3af; font-size: 13px; padding-bottom: 20px;">
          <p style="margin: 0 0 4px 0;">&copy; 2026 Itineramio · <a href="https://itineramio.com" style="color: #9ca3af;">itineramio.com</a></p>
          <p style="margin: 0; font-size: 12px;">Recibes este email porque creaste una demo en itineramio.com</p>
        </div>

      </div>
    </body>
    </html>
  `,
}