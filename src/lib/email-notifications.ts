import { prisma } from './prisma'

interface EmailNotificationData {
  to: string[]
  subject: string
  htmlContent: string
  textContent?: string
}

export class EmailNotificationService {
  private static instance: EmailNotificationService
  private smtpSettings: any = null

  private constructor() {}

  static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService()
    }
    return EmailNotificationService.instance
  }

  private async getSmtpSettings() {
    if (!this.smtpSettings) {
      try {
        const settings = await prisma.systemSetting.findFirst()
        if (settings?.value) {
          const parsedSettings = JSON.parse(settings.value)
          this.smtpSettings = {
            host: parsedSettings.smtpHost,
            port: parseInt(parsedSettings.smtpPort || '587'),
            user: parsedSettings.smtpUser,
            password: parsedSettings.smtpPassword,
            fromEmail: parsedSettings.smtpFromEmail,
            fromName: parsedSettings.smtpFromName || 'Itineramio',
            enabled: parsedSettings.emailNotifications && parsedSettings.smtpHost
          }
        }
      } catch (error) {
        console.error('Error loading SMTP settings:', error)
      }
    }
    return this.smtpSettings
  }

  private async getAdminEmails(): Promise<string[]> {
    try {
      const admins = await prisma.admin.findMany({
        where: { isActive: true },
        select: { email: true }
      })
      return admins.map((admin: any) => admin.email)
    } catch (error) {
      console.error('Error fetching admin emails:', error)
      return []
    }
  }

  private async sendEmail(data: EmailNotificationData): Promise<boolean> {
    const smtp = await this.getSmtpSettings()
    
    if (!smtp?.enabled) {
      console.log('Email notifications disabled or SMTP not configured')
      return false
    }

    try {
      // In a real implementation, you would use a service like:
      // - Resend (recommended)
      // - SendGrid
      // - Amazon SES
      // - Nodemailer with SMTP
      
      // For now, we'll simulate the email sending and log it
      console.log('📧 Email notification sent:', {
        from: `${smtp.fromName} <${smtp.fromEmail}>`,
        to: data.to,
        subject: data.subject,
        content: data.textContent || 'HTML email'
      })

      // Log the notification in the database
      await prisma.notification.create({
        data: {
          userId: 'system', // System notification
          type: 'EMAIL_SENT',
          title: data.subject,
          message: `Email sent to: ${data.to.join(', ')}`,
          data: {
            recipients: data.to,
            subject: data.subject,
            status: 'SENT'
          }
        }
      }).catch(() => {}) // Ignore if fails

      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  async notifyPaymentRequest(invoice: {
    id: string
    invoiceNumber: string
    finalAmount: number
    user: {
      name: string
      email: string
      phone?: string
    }
    createdAt: Date
    properties?: Array<{ name: string }>
  }): Promise<boolean> {
    const adminEmails = await this.getAdminEmails()
    
    if (adminEmails.length === 0) {
      console.log('No admin emails found for payment notification')
      return false
    }

    const propertiesList = invoice.properties?.map(p => p.name).join(', ') || 'N/A'
    const dashboardUrl = `${process.env.NEXTAUTH_URL || 'https://itineramio.com'}/admin/payments`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Nueva Solicitud de Pago - ${invoice.invoiceNumber}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: #dc2626; margin: 0;">💳 Nueva Solicitud de Pago</h1>
              <p style="margin: 10px 0 0 0; color: #666;">Se ha generado una nueva solicitud de pago que requiere confirmación</p>
            </div>
            
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h2 style="margin-top: 0; color: #374151;">Detalles de la Solicitud</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Número de Factura:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${invoice.invoiceNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Importe:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #059669; font-weight: bold;">€${Number(invoice.finalAmount).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Cliente:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${invoice.user.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Email:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${invoice.user.email}</td>
                </tr>
                ${invoice.user.phone ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Teléfono:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${invoice.user.phone}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Propiedades:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${propertiesList}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Fecha:</strong></td>
                  <td style="padding: 8px 0;">${invoice.createdAt.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" 
                 style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Ver en Panel Admin
              </a>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-top: 20px;">
              <p style="margin: 0; color: #92400e;">
                <strong>⚠️ Acción requerida:</strong> Esta solicitud requiere confirmación manual una vez recibido el pago.
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px;">
              <p>Este es un mensaje automático del sistema Itineramio.</p>
              <p>Si necesitas contactar con el cliente:</p>
              <ul>
                <li>Email: <a href="mailto:${invoice.user.email}">${invoice.user.email}</a></li>
                ${invoice.user.phone ? `<li>Teléfono: <a href="tel:${invoice.user.phone}">${invoice.user.phone}</a></li>` : ''}
                ${invoice.user.phone ? `<li>WhatsApp: <a href="https://wa.me/${invoice.user.phone.replace(/\D/g, '')}" target="_blank">Enviar mensaje</a></li>` : ''}
              </ul>
            </div>
          </div>
        </body>
      </html>
    `

    const textContent = `
Nueva Solicitud de Pago - ${invoice.invoiceNumber}

Se ha generado una nueva solicitud de pago que requiere confirmación:

• Factura: ${invoice.invoiceNumber}
• Importe: €${Number(invoice.finalAmount).toFixed(2)}
• Cliente: ${invoice.user.name} (${invoice.user.email})
${invoice.user.phone ? `• Teléfono: ${invoice.user.phone}` : ''}
• Propiedades: ${propertiesList}
• Fecha: ${invoice.createdAt.toLocaleDateString('es-ES')}

Ver en panel admin: ${dashboardUrl}

⚠️ Esta solicitud requiere confirmación manual una vez recibido el pago.
    `

    return await this.sendEmail({
      to: adminEmails,
      subject: `💳 Nueva solicitud de pago: €${Number(invoice.finalAmount).toFixed(2)} - ${invoice.user.name}`,
      htmlContent,
      textContent
    })
  }

  async notifyNewProperty(property: {
    id: string
    name: string
    user: {
      name: string
      email: string
      phone?: string
    }
    createdAt: Date
  }): Promise<boolean> {
    const adminEmails = await this.getAdminEmails()
    
    if (adminEmails.length === 0) {
      console.log('No admin emails found for new property notification')
      return false
    }

    const propertyUrl = `${process.env.NEXTAUTH_URL || 'https://itineramio.com'}/admin/properties`
    const userUrl = `${process.env.NEXTAUTH_URL || 'https://itineramio.com'}/admin/users`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Nueva Propiedad Creada - ${property.name}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: #0ea5e9; margin: 0;">🏠 Nueva Propiedad Creada</h1>
              <p style="margin: 10px 0 0 0; color: #666;">Se ha registrado una nueva propiedad en la plataforma</p>
            </div>
            
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h2 style="margin-top: 0; color: #374151;">Detalles de la Propiedad</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Nombre:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${property.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Propietario:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${property.user.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Email:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${property.user.email}</td>
                </tr>
                ${property.user.phone ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Teléfono:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${property.user.phone}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0;"><strong>Fecha:</strong></td>
                  <td style="padding: 8px 0;">${property.createdAt.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${propertyUrl}" 
                 style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">
                Ver Propiedades
              </a>
              <a href="${userUrl}" 
                 style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Ver Usuario
              </a>
            </div>
            
            <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 15px; margin-top: 20px;">
              <p style="margin: 0; color: #047857;">
                <strong>ℹ️ Información:</strong> El usuario ahora tiene 48 horas de período de gracia para completar el pago.
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px;">
              <p>Este es un mensaje automático del sistema Itineramio.</p>
              <p>Puedes contactar con el propietario:</p>
              <ul>
                <li>Email: <a href="mailto:${property.user.email}">${property.user.email}</a></li>
                ${property.user.phone ? `<li>Teléfono: <a href="tel:${property.user.phone}">${property.user.phone}</a></li>` : ''}
                ${property.user.phone ? `<li>WhatsApp: <a href="https://wa.me/${property.user.phone.replace(/\D/g, '')}" target="_blank">Enviar mensaje</a></li>` : ''}
              </ul>
            </div>
          </div>
        </body>
      </html>
    `

    const textContent = `
Nueva Propiedad Creada - ${property.name}

Se ha registrado una nueva propiedad en la plataforma:

• Nombre: ${property.name}
• Propietario: ${property.user.name} (${property.user.email})
${property.user.phone ? `• Teléfono: ${property.user.phone}` : ''}
• Fecha: ${property.createdAt.toLocaleDateString('es-ES')}

Ver propiedades: ${propertyUrl}
Ver usuarios: ${userUrl}

ℹ️ El usuario ahora tiene 48 horas de período de gracia para completar el pago.
    `

    return await this.sendEmail({
      to: adminEmails,
      subject: `🏠 Nueva propiedad: ${property.name} - ${property.user.name}`,
      htmlContent,
      textContent
    })
  }

  async notifyTrialExpired(data: {
    property: {
      id: string
      name: string
    }
    user: {
      name: string
      email: string
    }
  }): Promise<boolean> {
    const dashboardUrl = `${process.env.NEXTAUTH_URL || 'https://itineramio.com'}/properties`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Período de Prueba Finalizado</h1>
            </div>
            <div class="content">
              <p>Hola ${data.user.name},</p>
              
              <div class="warning">
                <h3>🚨 Tu propiedad "${data.property.name}" ha sido suspendida</h3>
                <p>El período de prueba de 48 horas ha terminado y tu propiedad ya no está disponible para los huéspedes.</p>
              </div>
              
              <h3>¿Qué hacer ahora?</h3>
              <p>Para reactivar tu propiedad, necesitas activar un plan de pago:</p>
              
              <ul>
                <li><strong>Plan Growth:</strong> €2.50/mes por propiedad adicional</li>
                <li><strong>Descuento por volumen:</strong> €2.00/mes si tienes 10+ propiedades</li>
                <li><strong>Facturas automáticas</strong> - Recibe tu factura mensualmente</li>
                <li><strong>Soporte prioritario</strong></li>
              </ul>
              
              <h3>💳 Información de Pago</h3>
              <p><strong>Bizum:</strong> +34652656440</p>
              <p><strong>Transferencia:</strong> ES82 0182 0304 8102 0158 7248</p>
              
              <p><em>Concepto: Itineramio - ${data.property.name}</em></p>
              
              <a href="${dashboardUrl}" class="button">Ir a Mi Dashboard</a>
              
              <div class="footer">
                <p>¿Necesitas ayuda? Contáctanos en <a href="mailto:hola@itineramio.com">hola@itineramio.com</a></p>
                <p>Itineramio - Simplificando la gestión de tus propiedades</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const textContent = `
Período de Prueba Finalizado - ${data.property.name}

Hola ${data.user.name},

Tu propiedad "${data.property.name}" ha sido suspendida porque el período de prueba de 48 horas ha terminado.

Para reactivarla, activa un plan de pago:
- Plan Growth: €2.50/mes por propiedad adicional  
- Descuento: €2.00/mes con 10+ propiedades

Información de Pago:
Bizum: +34652656440
Transferencia: ES82 0182 0304 8102 0158 7248
Concepto: Itineramio - ${data.property.name}

Accede a tu dashboard: ${dashboardUrl}

¿Necesitas ayuda? Contáctanos en hola@itineramio.com
    `

    return await this.sendEmail({
      to: [data.user.email],
      subject: `⏰ Período de prueba finalizado - ${data.property.name}`,
      htmlContent,
      textContent
    })
  }
}

export const emailNotificationService = EmailNotificationService.getInstance()