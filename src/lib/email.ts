import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY || 'test_key'

if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === 'production') {
  // RESEND_API_KEY not set
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
    zonesCount?: number
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tu manual digital est&aacute; listo - Itineramio</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #0f0a1a;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; padding-top: 20px;">
          <h1 style="color: #a78bfa; margin: 0; font-size: 28px;">Itineramio</h1>
          <p style="color: #6b7280; margin: 5px 0; font-size: 14px;">Tu manual digital est&aacute; listo</p>
        </div>

        <div style="background: linear-gradient(135deg, #1a1025, #1e1533); padding: 35px; border-radius: 16px; margin-bottom: 20px; border: 1px solid #2d2240;">
          <h2 style="color: #e2e8f0; margin-top: 0; font-size: 22px;">Hola ${params.leadName},</h2>
          <p style="color: #a1a1aa; font-size: 16px;">
            Nuestra IA ha creado un manual completo para <strong style="color: #c4b5fd;">${params.propertyName}</strong>.
          </p>

          <!-- Stats -->
          <div style="margin: 25px 0;">
            <div style="display: flex; margin-bottom: 8px;">
              <div style="background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 10px; padding: 10px 16px; flex: 1; margin-right: 8px;">
                <span style="color: #a78bfa; font-size: 20px; font-weight: 700;">${params.zonesCount || 6}</span>
                <span style="color: #9ca3af; font-size: 13px; display: block;">zonas creadas</span>
              </div>
              <div style="background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 10px; padding: 10px 16px; flex: 1;">
                <span style="color: #22d3ee; font-size: 20px; font-weight: 700;">3</span>
                <span style="color: #9ca3af; font-size: 13px; display: block;">idiomas: ES &middot; EN &middot; FR</span>
              </div>
            </div>
            <div style="display: flex;">
              <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 10px; padding: 10px 16px; flex: 1; margin-right: 8px;">
                <span style="color: #34d399; font-size: 14px; font-weight: 600;">Chatbot IA</span>
                <span style="color: #9ca3af; font-size: 13px; display: block;">activado 24/7</span>
              </div>
              <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 10px 16px; flex: 1;">
                <span style="color: #fbbf24; font-size: 14px; font-weight: 600;">Servicios</span>
                <span style="color: #9ca3af; font-size: 13px; display: block;">cercanos incluidos</span>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${params.guideUrl}"
               style="background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 16px 44px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; font-size: 16px;">
              Explorar mi manual
            </a>
          </div>

          <!-- Coupon -->
          <div style="background: rgba(124, 58, 237, 0.1); padding: 20px; border-radius: 10px; border: 1px solid rgba(124, 58, 237, 0.2); margin-top: 20px;">
            <p style="color: #c4b5fd; font-size: 15px; font-weight: 600; margin: 0 0 8px; text-align: center;">Cup&oacute;n exclusivo: 20% de descuento</p>
            <div style="background: rgba(139, 92, 246, 0.15); padding: 12px 20px; border-radius: 8px; text-align: center; margin: 10px 0;">
              <span style="font-family: monospace; font-size: 22px; font-weight: 700; color: #a78bfa; letter-spacing: 2px;">${params.couponCode}</span>
            </div>
            <p style="color: #6b7280; font-size: 13px; text-align: center; margin-bottom: 0;">
              V&aacute;lido hasta: ${params.couponExpiresAt}
            </p>
          </div>

          <div style="text-align: center; margin: 25px 0 10px;">
            <a href="https://www.itineramio.com/register?coupon=${params.couponCode}${params.propertyId ? `&propertyId=${params.propertyId}` : ''}${params.leadEmail ? `&email=${encodeURIComponent(params.leadEmail)}` : ''}${params.leadName ? `&name=${encodeURIComponent(params.leadName)}` : ''}&utm_source=demo&utm_medium=email&utm_campaign=confirmation"
               style="background: #10b981; color: white; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 15px;">
              Crear mi cuenta con descuento
            </a>
          </div>

          <!-- Social proof -->
          <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 20px 0 5px;">
            &Uacute;nete a +500 anfitriones que ya usan Itineramio
          </p>

          <!-- WhatsApp share -->
          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #2d2240;">
            <p style="color: #9ca3af; font-size: 13px; margin: 0 0 10px;">&iquest;Conoces a otros anfitriones? Comp&aacute;rtelo</p>
            <a href="https://wa.me/?text=${encodeURIComponent(`Mira el manual digital que he creado con IA para mi alojamiento. ¡Es increíble! ${params.guideUrl}`)}"
               style="background: #25D366; color: white; padding: 10px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 14px;">
              Compartir por WhatsApp
            </a>
          </div>
        </div>

        <div style="text-align: center; color: #4b5563; font-size: 13px; padding-bottom: 20px;">
          <p>La demo expira en 15 minutos. Reg&iacute;strate para mantener tu manual activo.</p>
          <p>&copy; 2026 Itineramio. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Demo feedback request email (dark/violet theme)
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
      <title>&iquest;Qu&eacute; te ha parecido? - Itineramio</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #0f0a1a;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; padding-top: 20px;">
          <h1 style="color: #a78bfa; margin: 0; font-size: 28px;">Itineramio</h1>
          <p style="color: #6b7280; margin: 5px 0; font-size: 14px;">Tu opini&oacute;n nos importa</p>
        </div>

        <div style="background: linear-gradient(135deg, #1a1025, #1e1533); padding: 35px; border-radius: 16px; margin-bottom: 20px; border: 1px solid #2d2240;">
          <h2 style="color: #e2e8f0; margin-top: 0; font-size: 22px;">Hola ${params.leadName},</h2>
          <p style="color: #a1a1aa; font-size: 16px; margin-bottom: 5px;">
            Hace un rato generaste la demo de <strong style="color: #c4b5fd;">${params.propertyName}</strong>.
          </p>
          <p style="color: #a1a1aa; font-size: 16px;">
            Queremos ser honestos contigo: estamos construyendo algo nuevo y tu feedback es
            lo m&aacute;s valioso que podemos recibir. <strong style="color: #e2e8f0;">S&eacute; honesto, queremos mejorar.</strong>
          </p>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${params.feedbackUrl}"
               style="background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 16px 44px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; font-size: 16px;">
              Dejar mi opini&oacute;n
            </a>
          </div>

          <div style="background: rgba(124, 58, 237, 0.1); padding: 16px 20px; border-radius: 10px; border: 1px solid rgba(124, 58, 237, 0.2); margin-top: 25px;">
            <p style="color: #a1a1aa; font-size: 13px; margin: 0; text-align: center;">
              Recuerda: tienes un cup&oacute;n del <strong style="color: #c4b5fd;">20% de descuento</strong> &rarr;
              <span style="font-family: monospace; font-size: 15px; font-weight: 700; color: #a78bfa; letter-spacing: 1px;">${params.couponCode}</span>
              <br>V&aacute;lido hasta: ${params.couponExpiresAt}
            </p>
          </div>
        </div>

        <div style="text-align: center; color: #4b5563; font-size: 13px; padding-bottom: 20px;">
          <p>Solo te pedimos 1 minuto de tu tiempo. Cada opini&oacute;n cuenta.</p>
          <p>&copy; 2026 Itineramio. Todos los derechos reservados.</p>
        </div>
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
      <title>Tu cup&oacute;n expira pronto - Itineramio</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #0f0a1a;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; padding-top: 20px;">
          <h1 style="color: #fb923c; margin: 0; font-size: 28px;">Itineramio</h1>
          <p style="color: #6b7280; margin: 5px 0; font-size: 14px;">&Uacute;ltima oportunidad</p>
        </div>

        <div style="background: linear-gradient(135deg, #1a1008, #1e1510); padding: 35px; border-radius: 16px; margin-bottom: 20px; border: 1px solid #3d2a10;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size: 48px;">&#9200;</span>
          </div>
          <h2 style="color: #e2e8f0; margin-top: 0; font-size: 22px; text-align: center;">
            ${params.leadName}, tu cup&oacute;n expira en 1 hora
          </h2>
          <p style="color: #a1a1aa; font-size: 16px; text-align: center;">
            El descuento exclusivo del <strong style="color: #fb923c;">20%</strong> que generaste para
            <strong style="color: #fbbf24;">${params.propertyName}</strong> est&aacute; a punto de caducar.
          </p>

          <div style="background: rgba(251, 146, 60, 0.1); padding: 24px; border-radius: 12px; border: 2px solid rgba(251, 146, 60, 0.3); margin: 25px 0; text-align: center;">
            <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Tu c&oacute;digo de descuento</p>
            <div style="font-family: monospace; font-size: 32px; font-weight: 800; color: #fb923c; letter-spacing: 4px; padding: 8px 0;">
              ${params.couponCode}
            </div>
            <p style="color: #ef4444; font-size: 14px; font-weight: 600; margin: 8px 0 0 0;">
              Expira en menos de 1 hora
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${params.registerUrl}"
               style="background: linear-gradient(135deg, #f97316, #ef4444); color: white; padding: 18px 48px; text-decoration: none; border-radius: 10px; font-weight: 800; display: inline-block; font-size: 17px; text-transform: uppercase; letter-spacing: 0.5px;">
              Activar mi descuento ahora
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 20px;">
            &iquest;Prefieres hacerlo m&aacute;s tarde?
            <a href="${params.registerUrl}" style="color: #fb923c; text-decoration: underline;">Reg&iacute;strate aqu&iacute;</a>
            antes de que caduque.
          </p>
        </div>

        <div style="text-align: center; color: #4b5563; font-size: 13px; padding-bottom: 20px;">
          <p>Una vez caduque el cup&oacute;n no podr&aacute; recuperarse.</p>
          <p>&copy; 2026 Itineramio. Todos los derechos reservados.</p>
        </div>
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
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #0f0a1a;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; padding-top: 20px;">
          <h1 style="color: #a78bfa; margin: 0; font-size: 28px;">Itineramio</h1>
          <p style="color: #6b7280; margin: 5px 0; font-size: 14px;">Tu asistente IA para hu&eacute;spedes</p>
        </div>

        <div style="background: linear-gradient(135deg, #1a1025, #1e1533); padding: 35px; border-radius: 16px; margin-bottom: 20px; border: 1px solid #2d2240;">
          <h2 style="color: #e2e8f0; margin-top: 0; font-size: 22px;">${params.leadName}, mira lo que tu chatbot IA puede hacer</h2>

          <!-- Simulated conversation -->
          <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 20px 0;">
            <div style="margin-bottom: 12px;">
              <div style="background: #374151; color: white; padding: 10px 14px; border-radius: 12px 12px 12px 4px; display: inline-block; max-width: 80%; font-size: 14px;">
                &iquest;Cu&aacute;l es la contrase&ntilde;a del WiFi?
              </div>
            </div>
            <div style="text-align: right; margin-bottom: 12px;">
              <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 10px 14px; border-radius: 12px 12px 4px 12px; display: inline-block; max-width: 80%; font-size: 14px; text-align: left;">
                La contrase&ntilde;a del WiFi de <strong>${params.propertyName}</strong> es: [tu-contrase&ntilde;a]. La red se llama [tu-red]. Si tienes problemas de conexi&oacute;n, reinicia el router que est&aacute; en el sal&oacute;n.
              </div>
            </div>
            <div style="margin-bottom: 12px;">
              <div style="background: #374151; color: white; padding: 10px 14px; border-radius: 12px 12px 12px 4px; display: inline-block; max-width: 80%; font-size: 14px;">
                &iquest;D&oacute;nde puedo cenar cerca?
              </div>
            </div>
            <div style="text-align: right;">
              <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 10px 14px; border-radius: 12px 12px 4px 12px; display: inline-block; max-width: 80%; font-size: 14px; text-align: left;">
                Cerca de ${params.propertyName} tienes varios restaurantes recomendados...
              </div>
            </div>
          </div>

          <p style="color: #a1a1aa; font-size: 15px; text-align: center;">
            Tu chatbot responde <strong style="color: #c4b5fd;">24/7</strong> en <strong style="color: #c4b5fd;">3 idiomas</strong> (ES, EN, FR)
          </p>

          <!-- Testimonial -->
          <div style="background: rgba(124, 58, 237, 0.1); padding: 16px 20px; border-radius: 10px; border: 1px solid rgba(124, 58, 237, 0.2); margin: 20px 0;">
            <p style="color: #c4b5fd; font-size: 14px; font-style: italic; margin: 0 0 8px 0;">
              &ldquo;Desde que activ&eacute; el chatbot, mis hu&eacute;spedes no me llaman a las 3 AM preguntando por el WiFi&rdquo;
            </p>
            <p style="color: #6b7280; font-size: 13px; margin: 0;">
              &mdash; Carlos R., anfitri&oacute;n en Barcelona
            </p>
          </div>

          <!-- Coupon -->
          <div style="background: rgba(124, 58, 237, 0.08); padding: 12px 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="color: #a1a1aa; font-size: 12px; margin: 0 0 4px 0;">Tu cup&oacute;n de 20% sigue activo</p>
            <span style="font-family: monospace; font-size: 18px; font-weight: 700; color: #a78bfa; letter-spacing: 2px;">${params.couponCode}</span>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${params.registerUrl}"
               style="background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 16px 44px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; font-size: 16px;">
              Activar mi manual permanente
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
      <title>Tu manual ha expirado - Itineramio</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #0f0a1a;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; padding-top: 20px;">
          <h1 style="color: #a78bfa; margin: 0; font-size: 28px;">Itineramio</h1>
        </div>

        <div style="background: linear-gradient(135deg, #1a1025, #1e1533); padding: 35px; border-radius: 16px; margin-bottom: 20px; border: 1px solid #2d2240;">
          <div style="text-align: center; margin-bottom: 15px;">
            <span style="font-size: 40px;">&#128276;</span>
          </div>
          <h2 style="color: #e2e8f0; margin-top: 0; font-size: 22px; text-align: center;">
            Tu manual de ${params.propertyName} ha expirado
          </h2>

          <p style="color: #a1a1aa; font-size: 15px; text-align: center;">
            ${params.leadName}, tu demo ha expirado, pero puedes crear uno permanente.
          </p>

          <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin: 25px 0;">
            <p style="color: #e2e8f0; font-size: 15px; margin: 0 0 12px 0; font-weight: 600;">
              Los anfitriones que usan Itineramio:
            </p>
            <ul style="color: #a1a1aa; font-size: 14px; padding-left: 20px; margin: 0;">
              <li style="margin-bottom: 8px;">Ahorran <strong style="color: #c4b5fd;">5 horas/semana</strong> en consultas</li>
              <li style="margin-bottom: 8px;">Reciben <strong style="color: #c4b5fd;">mejores rese&ntilde;as</strong> de hu&eacute;spedes</li>
              <li style="margin-bottom: 8px;">Tienen un asistente IA <strong style="color: #c4b5fd;">24/7 en 3 idiomas</strong></li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${params.registerUrl}"
               style="background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 16px 44px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; font-size: 16px;">
              Crear mi cuenta
            </a>
          </div>

          <p style="color: #6b7280; font-size: 13px; text-align: center; margin-top: 20px;">
            P.S. Responde a este email y te damos un cup&oacute;n especial
          </p>
        </div>

        <div style="text-align: center; color: #4b5563; font-size: 13px; padding-bottom: 20px;">
          <p>&copy; 2026 Itineramio. Todos los derechos reservados.</p>
        </div>
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
}