import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'hola@itineramio.com'

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

  // Check if API key is configured
  if (!RESEND_API_KEY || !resend) {
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

    // First attempt with configured email
    let { data, error } = await resend.emails.send({
      from: fromEmail,
      to: cleanEmails,
      subject,
      html,
      ...(replyTo && { reply_to: replyTo })
    })

    if (error) {
      // Check for specific errors and retry with fallback email
      if (error.message?.includes('domain') || error.message?.includes('verified') || error.message?.includes('DNS')) {
        attempt = 2
        const retryResult = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: cleanEmails,
          subject,
          html,
          ...(replyTo && { reply_to: replyTo })
        })
        
        if (retryResult.data) {
          return { success: true, id: retryResult.data.id }
        }

        if (retryResult.error) {
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

    return {
      success: true,
      id: data?.id
    }

  } catch (error) {
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
          .button { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
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
               style="background: #8b5cf6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3); box-sizing: border-box; max-width: 100%;">
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
          <p style="margin: 15px 0 5px 0;">© 2026 Itineramio. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  welcomeEmail: (userName: string, dashboardUrl: string = 'https://www.itineramio.com/main', trialEndDate?: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenido a Itineramio</title>
      <style>
        @media only screen and (max-width: 600px) {
          .container { padding: 12px !important; }
          .content { padding: 24px 20px !important; }
          .feature-grid td { display: block !important; width: 100% !important; padding: 0 0 12px 0 !important; }
          .cta-btn { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
          .hero { padding: 32px 20px !important; }
          .hero h1 { font-size: 26px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #24292f; background-color: #f6f8fa;">
      <div class="container" style="max-width: 600px; margin: 0 auto; padding: 24px;">

        <!-- Header — minimal like GitHub -->
        <div style="text-align: center; padding: 16px 0 24px 0;">
          <img src="https://www.itineramio.com/logo.png" alt="Itineramio" width="140" style="display: inline-block;" />
        </div>

        <!-- Hero -->
        <div class="hero" style="background: #0d1117; border-radius: 16px 16px 0 0; padding: 44px 36px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 30px; font-weight: 700; letter-spacing: -0.5px;">
            Bienvenido, ${userName}
          </h1>
          <p style="color: #8b949e; margin: 0; font-size: 16px; font-weight: 400;">
            Tu cuenta ha sido verificada. Vamos a hacer que tu manual sea un <span style="color: #a78bfa; font-weight: 600;">10</span>.
          </p>
        </div>

        <!-- Main Content -->
        <div class="content" style="background: #ffffff; padding: 36px; border-radius: 0 0 16px 16px; border: 1px solid #d0d7de; border-top: none;">

          ${trialEndDate ? `
          <!-- Trial Badge -->
          <div style="background: #0d1117; color: #58a6ff; padding: 12px 20px; border-radius: 10px; margin-bottom: 28px; display: flex; align-items: center; text-align: center;">
            <p style="margin: 0; font-size: 14px; width: 100%; text-align: center;">
              <strong>15 dias de prueba gratuita</strong> &middot; Valido hasta el ${trialEndDate}
            </p>
          </div>
          ` : ''}

          <!-- Quick Start — like Apple's numbered steps -->
          <div style="margin-bottom: 32px;">
            <h2 style="color: #24292f; font-size: 20px; font-weight: 700; margin: 0 0 20px 0; letter-spacing: -0.3px;">
              Tu manual listo en 15 minutos
            </h2>

            <!-- Step 1 -->
            <div style="display: flex; margin-bottom: 16px;">
              <div style="min-width: 36px; width: 36px; height: 36px; background: #a78bfa; border-radius: 50%; color: white; font-weight: 700; font-size: 16px; text-align: center; line-height: 36px; margin-right: 16px;">1</div>
              <div>
                <p style="margin: 0; font-size: 15px; font-weight: 600; color: #24292f;">Usa el Asistente de IA</p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #656d76;">Nuestro wizard genera tu manual completo a partir de la direccion de tu propiedad. Zonas, instrucciones y contenido en minutos.</p>
              </div>
            </div>

            <!-- Step 2 -->
            <div style="display: flex; margin-bottom: 16px;">
              <div style="min-width: 36px; width: 36px; height: 36px; background: #a78bfa; border-radius: 50%; color: white; font-weight: 700; font-size: 16px; text-align: center; line-height: 36px; margin-right: 16px;">2</div>
              <div>
                <p style="margin: 0; font-size: 15px; font-weight: 600; color: #24292f;">Personaliza y sube fotos</p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #656d76;">Revisa el contenido generado, ajusta lo que necesites y sube fotos de cada zona. Las traducciones a ingles y frances son automaticas.</p>
              </div>
            </div>

            <!-- Step 3 -->
            <div style="display: flex; margin-bottom: 16px;">
              <div style="min-width: 36px; width: 36px; height: 36px; background: #a78bfa; border-radius: 50%; color: white; font-weight: 700; font-size: 16px; text-align: center; line-height: 36px; margin-right: 16px;">3</div>
              <div>
                <p style="margin: 0; font-size: 15px; font-weight: 600; color: #24292f;">Comparte con tus huespedes</p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #656d76;">Imprime el codigo QR, envia el link por WhatsApp, o activa el envio automatico antes del check-in.</p>
              </div>
            </div>
          </div>

          <!-- CTA Principal -->
          <div style="text-align: center; margin: 28px 0 32px 0;">
            <a href="${dashboardUrl.replace('/main', '/ai-setup')}"
               class="cta-btn"
               style="background: #8b5cf6; color: white; padding: 14px 36px; text-decoration: none; border-radius: 10px; font-weight: 600; display: inline-block; font-size: 15px; letter-spacing: -0.2px;">
              Crear mi manual con IA
            </a>
          </div>

          <!-- Divider -->
          <hr style="border: none; border-top: 1px solid #d8dee4; margin: 32px 0;" />

          <!-- Features Grid — 2x3 like Airbnb cards -->
          <h2 style="color: #24292f; font-size: 18px; font-weight: 700; margin: 0 0 20px 0; letter-spacing: -0.3px;">
            Lo que puedes hacer con Itineramio
          </h2>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
            <tr class="feature-grid">
              <td style="width: 50%; padding: 0 8px 16px 0; vertical-align: top;">
                <div style="background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 10px; padding: 16px;">
                  <p style="margin: 0 0 6px 0; font-size: 20px;">&#x1F916;</p>
                  <p style="margin: 0; font-size: 14px; font-weight: 600; color: #24292f;">Manual con IA</p>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #656d76;">La IA genera zonas, pasos e instrucciones automaticamente.</p>
                </div>
              </td>
              <td style="width: 50%; padding: 0 0 16px 8px; vertical-align: top;">
                <div style="background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 10px; padding: 16px;">
                  <p style="margin: 0 0 6px 0; font-size: 20px;">&#x1F4F1;</p>
                  <p style="margin: 0; font-size: 14px; font-weight: 600; color: #24292f;">Codigos QR</p>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #656d76;">General y por zona. Imprime y coloca en tu alojamiento.</p>
                </div>
              </td>
            </tr>
            <tr class="feature-grid">
              <td style="width: 50%; padding: 0 8px 16px 0; vertical-align: top;">
                <div style="background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 10px; padding: 16px;">
                  <p style="margin: 0 0 6px 0; font-size: 20px;">&#x1F514;</p>
                  <p style="margin: 0; font-size: 14px; font-weight: 600; color: #24292f;">Avisos en tiempo real</p>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #656d76;">Informa a huespedes de cambios: obras, piscina, eventos.</p>
                </div>
              </td>
              <td style="width: 50%; padding: 0 0 16px 8px; vertical-align: top;">
                <div style="background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 10px; padding: 16px;">
                  <p style="margin: 0 0 6px 0; font-size: 20px;">&#x1F310;</p>
                  <p style="margin: 0; font-size: 14px; font-weight: 600; color: #24292f;">Traducciones automaticas</p>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #656d76;">Tu manual en ES, EN y FR. Se detecta el idioma del huesped.</p>
                </div>
              </td>
            </tr>
            <tr class="feature-grid">
              <td style="width: 50%; padding: 0 8px 0 0; vertical-align: top;">
                <div style="background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 10px; padding: 16px;">
                  <p style="margin: 0 0 6px 0; font-size: 20px;">&#x1F4CA;</p>
                  <p style="margin: 0; font-size: 14px; font-weight: 600; color: #24292f;">Analytics</p>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #656d76;">Visitas, valoraciones, sesiones. Sabe que leen tus huespedes.</p>
                </div>
              </td>
              <td style="width: 50%; padding: 0 0 0 8px; vertical-align: top;">
                <div style="background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 10px; padding: 16px;">
                  <p style="margin: 0 0 6px 0; font-size: 20px;">&#x2B50;</p>
                  <p style="margin: 0; font-size: 14px; font-weight: 600; color: #24292f;">Valoraciones de huespedes</p>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #656d76;">Los huespedes valoran cada zona. Mejora con feedback real.</p>
                </div>
              </td>
            </tr>
          </table>

          <!-- Divider -->
          <hr style="border: none; border-top: 1px solid #d8dee4; margin: 28px 0;" />

          <!-- FAQ Section -->
          <h2 style="color: #24292f; font-size: 18px; font-weight: 700; margin: 0 0 16px 0; letter-spacing: -0.3px;">
            Preguntas frecuentes
          </h2>

          <div style="margin-bottom: 16px;">
            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #24292f;">¿Como creo mi primera propiedad?</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #656d76;">Ve a Dashboard &rarr; Crear manual con IA. El asistente te guia paso a paso: direccion, detalles, fotos y en 15 minutos tienes tu manual completo.</p>
          </div>
          <div style="margin-bottom: 16px;">
            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #24292f;">¿Como comparto el manual con huespedes?</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #656d76;">Imprime el codigo QR y colocalo en tu alojamiento, o envia el link directo por WhatsApp, email o mensajeria de Airbnb/Booking.</p>
          </div>
          <div style="margin-bottom: 16px;">
            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #24292f;">¿Que zonas crea la IA?</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #656d76;">Check-in, WiFi, Cocina, Normas de la casa, Recomendaciones locales, Checkout y mas. Puedes anadir, quitar o reordenar todas las zonas.</p>
          </div>
          <div style="margin-bottom: 16px;">
            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #24292f;">¿Las traducciones son automaticas?</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #656d76;">Si. Tu escribes en espanol y el manual se traduce automaticamente a ingles y frances. El idioma se detecta segun el navegador del huesped.</p>
          </div>

          <!-- Divider -->
          <hr style="border: none; border-top: 1px solid #d8dee4; margin: 28px 0;" />

          <!-- SofIA banner -->
          <div style="background: #0d1117; border-radius: 10px; padding: 20px; text-align: center;">
            <p style="color: #e6edf3; margin: 0 0 4px 0; font-size: 15px; font-weight: 600;">¿Tienes dudas? Habla con SofIA</p>
            <p style="color: #8b949e; margin: 0 0 14px 0; font-size: 13px;">Tu asistente con IA disponible 24/7 en el widget de soporte</p>
            <a href="https://www.itineramio.com/main"
               style="background: #a78bfa; color: white; padding: 10px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 14px;">
              Ir a mi panel
            </a>
          </div>
        </div>

        <!-- Footer — minimal like GitHub -->
        <div style="text-align: center; padding: 24px 0; color: #656d76; font-size: 12px;">
          <p style="margin: 0 0 8px 0;">
            <a href="https://www.itineramio.com/blog" style="color: #656d76; text-decoration: none; margin: 0 8px;">Blog</a>
            <a href="https://www.itineramio.com/academia" style="color: #656d76; text-decoration: none; margin: 0 8px;">Academia</a>
            <a href="https://www.itineramio.com/hub/tools" style="color: #656d76; text-decoration: none; margin: 0 8px;">Herramientas</a>
            <a href="https://wa.me/34652656440" style="color: #656d76; text-decoration: none; margin: 0 8px;">WhatsApp</a>
          </p>
          <p style="margin: 8px 0 0 0; color: #8b949e;">&copy; 2026 Itineramio. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Day 3 follow-up — "¿Ya creaste tu manual?"
  day3FollowUp: (userName: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @media only screen and (max-width: 600px) {
          .container { padding: 12px !important; }
          .content { padding: 24px 20px !important; }
          .cta-btn { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #24292f; background-color: #f6f8fa;">
      <div class="container" style="max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; padding: 16px 0 24px 0;">
          <img src="https://www.itineramio.com/logo.png" alt="Itineramio" width="140" />
        </div>
        <div class="content" style="background: #ffffff; padding: 36px; border-radius: 16px; border: 1px solid #d0d7de;">
          <h1 style="color: #24292f; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">${userName}, ¿ya creaste tu manual?</h1>
          <p style="font-size: 15px; color: #656d76; margin-bottom: 24px;">
            Han pasado unos dias desde que te registraste. Si aun no has creado tu primer manual digital,
            te contamos 3 cosas que quiza no sabias:
          </p>

          <div style="background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 10px; padding: 20px; margin-bottom: 16px;">
            <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #24292f;">La IA lo hace por ti</p>
            <p style="margin: 0; font-size: 14px; color: #656d76;">Solo necesitas la direccion de tu propiedad. El asistente genera todas las zonas, instrucciones y contenido automaticamente.</p>
          </div>
          <div style="background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 10px; padding: 20px; margin-bottom: 16px;">
            <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #24292f;">Se traduce solo</p>
            <p style="margin: 0; font-size: 14px; color: #656d76;">Escribe en espanol y tus huespedes lo ven en su idioma (ingles, frances). Sin configurar nada.</p>
          </div>
          <div style="background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #24292f;">QR en 1 click</p>
            <p style="margin: 0; font-size: 14px; color: #656d76;">Genera el codigo QR, imprimelo y colocalo en tu alojamiento. El huesped escanea y ya tiene toda la info.</p>
          </div>

          <div style="text-align: center; margin: 28px 0 0 0;">
            <a href="https://www.itineramio.com/ai-setup" class="cta-btn"
               style="background: #8b5cf6; color: white; padding: 14px 36px; text-decoration: none; border-radius: 10px; font-weight: 600; display: inline-block; font-size: 15px;">
              Crear mi manual ahora
            </a>
          </div>
        </div>
        <div style="text-align: center; padding: 20px 0; color: #8b949e; font-size: 12px;">
          <p style="margin: 0;">&copy; 2026 Itineramio</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Day 7 follow-up — Tips para ser Superhost
  day7Tips: (userName: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @media only screen and (max-width: 600px) {
          .container { padding: 12px !important; }
          .content { padding: 24px 20px !important; }
          .cta-btn { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #24292f; background-color: #f6f8fa;">
      <div class="container" style="max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; padding: 16px 0 24px 0;">
          <img src="https://www.itineramio.com/logo.png" alt="Itineramio" width="140" />
        </div>
        <div class="content" style="background: #ffffff; padding: 36px; border-radius: 16px; border: 1px solid #d0d7de;">
          <h1 style="color: #24292f; font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">5 consejos para un manual perfecto</h1>
          <p style="font-size: 14px; color: #8b949e; margin: 0 0 24px 0;">Hola ${userName} — estos tips marcan la diferencia entre un manual bueno y uno excelente.</p>

          <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #d8dee4;">
            <p style="margin: 0; font-size: 15px; font-weight: 600; color: #24292f;">1. Fotos reales de tu alojamiento</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #656d76;">La IA genera el texto, pero las fotos las pones tu. Un manual con fotos reales genera mucha mas confianza.</p>
          </div>
          <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #d8dee4;">
            <p style="margin: 0; font-size: 15px; font-weight: 600; color: #24292f;">2. Revisa la contrasena del WiFi</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #656d76;">Es la zona mas consultada. Asegurate de que la contrasena y el nombre de la red estan correctos.</p>
          </div>
          <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #d8dee4;">
            <p style="margin: 0; font-size: 15px; font-weight: 600; color: #24292f;">3. Pon el QR en la puerta de entrada</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #656d76;">Es lo primero que ve el huesped al llegar. Junto al QR de la propiedad, pon QR especificos en el router (WiFi) y la cocina.</p>
          </div>
          <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #d8dee4;">
            <p style="margin: 0; font-size: 15px; font-weight: 600; color: #24292f;">4. Usa los Avisos para cambios temporales</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #656d76;">Obras cerca, piscina en mantenimiento, un evento local... Los avisos se muestran destacados al huesped sin tocar el manual.</p>
          </div>
          <div style="margin-bottom: 24px;">
            <p style="margin: 0; font-size: 15px; font-weight: 600; color: #24292f;">5. Revisa las valoraciones</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #656d76;">Tus huespedes pueden valorar cada zona. Si alguna tiene nota baja, mejorala. Es feedback directo y gratuito.</p>
          </div>

          <div style="background: #0d1117; border-radius: 10px; padding: 20px; text-align: center;">
            <p style="color: #e6edf3; margin: 0 0 4px 0; font-size: 15px; font-weight: 600;">¿Necesitas ayuda? SofIA esta disponible 24/7</p>
            <p style="color: #8b949e; margin: 0 0 14px 0; font-size: 13px;">Tu asistente con IA en el widget de soporte del panel</p>
            <a href="https://www.itineramio.com/main" class="cta-btn"
               style="background: #a78bfa; color: white; padding: 10px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 14px;">
              Ir a mi panel
            </a>
          </div>
        </div>
        <div style="text-align: center; padding: 20px 0; color: #8b949e; font-size: 12px;">
          <p style="margin: 0;">&copy; 2026 Itineramio</p>
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
        <p>© 2026 Itineramio. Todos los derechos reservados.</p>
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
          <a href="https://www.itineramio.com/subscriptions"
             style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            💳 Ver mis facturas
          </a>
        </div>
        \` : ''}
      </div>
      
      <div style="text-align: center; color: #94a3b8; font-size: 14px;">
        <p>Si tienes alguna pregunta sobre esta factura, no dudes en contactarnos</p>
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
          <a href="https://www.itineramio.com/subscriptions" 
             style="background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
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
        <p style="margin-top: 15px;">© 2026 Itineramio. Todos los derechos reservados.</p>
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
    invoiceNumber?: string,
    totalAmount?: string,
    dashboardUrl: string,
    prorationCredit?: number,
    prorationBreakdown?: string
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Suscripción Activada - Itineramio</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #222222; max-width: 580px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">

      <!-- Logo/Header -->
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #222222; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Itineramio</h1>
      </div>

      <!-- Main Content -->
      <div>
        <h2 style="color: #222222; margin: 0 0 8px 0; font-size: 22px; font-weight: 600;">Hola ${params.userName},</h2>
        <p style="color: #484848; margin: 0 0 32px 0; font-size: 16px; line-height: 24px;">
          Tu suscripción para <strong>${params.planName}</strong> ha sido activada exitosamente.
        </p>

        <!-- Subscription Details -->
        <div style="background: #f7f7f7; border-radius: 12px; padding: 24px; margin: 32px 0;">
          <h3 style="color: #222222; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Detalles de tu suscripción</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #717171; font-size: 14px; border-bottom: 1px solid #dddddd;">Plan</td>
              <td style="padding: 10px 0; color: #222222; font-size: 14px; text-align: right; border-bottom: 1px solid #dddddd;">${params.planName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #717171; font-size: 14px; border-bottom: 1px solid #dddddd;">Fecha de inicio</td>
              <td style="padding: 10px 0; color: #222222; font-size: 14px; text-align: right; border-bottom: 1px solid #dddddd;">${params.startDate}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #717171; font-size: 14px; ${params.invoiceNumber || params.totalAmount ? 'border-bottom: 1px solid #dddddd;' : ''}">Próxima renovación</td>
              <td style="padding: 10px 0; color: #222222; font-size: 14px; text-align: right; ${params.invoiceNumber || params.totalAmount ? 'border-bottom: 1px solid #dddddd;' : ''}">${params.endDate}</td>
            </tr>
            ${params.invoiceNumber ? `
            <tr>
              <td style="padding: 10px 0; color: #717171; font-size: 14px; ${params.totalAmount ? 'border-bottom: 1px solid #dddddd;' : ''}">Número de factura</td>
              <td style="padding: 10px 0; color: #222222; font-size: 14px; text-align: right; ${params.totalAmount ? 'border-bottom: 1px solid #dddddd;' : ''}">${params.invoiceNumber}</td>
            </tr>
            ` : ''}
            ${params.totalAmount ? `
            <tr>
              <td style="padding: 10px 0; color: #717171; font-size: 14px;">Importe</td>
              <td style="padding: 10px 0; color: #222222; font-size: 16px; font-weight: 600; text-align: right;">€${params.totalAmount}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        ${params.prorationCredit && params.prorationCredit > 0 ? `
        <div style='background: #fffbf0; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #e8e8e8;'>
          <h4 style='color: #222222; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;'>Crédito aplicado</h4>
          <p style='color: #484848; margin: 0 0 12px 0; font-size: 14px; line-height: 20px;'>
            Has recibido un crédito de <strong>€${params.prorationCredit.toFixed(2)}</strong> por los días no utilizados de tu plan anterior.
          </p>
          ${params.prorationBreakdown ? `
          <div style='background: white; padding: 14px; border-radius: 8px; margin-top: 12px; font-size: 13px; color: #717171; white-space: pre-line; border: 1px solid #e8e8e8;'>
${params.prorationBreakdown}
          </div>
          ` : ''}
        </div>
        ` : ''}

        <!-- Features -->
        <div style="margin: 32px 0;">
          <h4 style="color: #222222; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Qué incluye tu plan</h4>
          <ul style="color: #484848; margin: 0; padding: 0; list-style: none; font-size: 14px; line-height: 24px;">
            <li style="padding: 6px 0; padding-left: 24px; position: relative;">
              <span style="position: absolute; left: 0;">✓</span> Crear múltiples propiedades
            </li>
            <li style="padding: 6px 0; padding-left: 24px; position: relative;">
              <span style="position: absolute; left: 0;">✓</span> Códigos QR ilimitados
            </li>
            <li style="padding: 6px 0; padding-left: 24px; position: relative;">
              <span style="position: absolute; left: 0;">✓</span> Estadísticas avanzadas
            </li>
            <li style="padding: 6px 0; padding-left: 24px; position: relative;">
              <span style="position: absolute; left: 0;">✓</span> Soporte prioritario
            </li>
          </ul>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 40px 0;">
          <a href="${params.dashboardUrl}"
             style="display: inline-block; background: #222222; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Ir a mi dashboard
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding-top: 40px; border-top: 1px solid #e8e8e8; margin-top: 40px;">
        <p style="color: #717171; font-size: 13px; margin: 0 0 8px 0;">
          ¿Tienes preguntas? Contáctanos en <a href="mailto:hola@itineramio.com" style="color: #222222; text-decoration: underline;">hola@itineramio.com</a>
        </p>
        <p style="color: #b0b0b0; font-size: 12px; margin: 8px 0 0 0;">© 2026 Itineramio. Todos los derechos reservados.</p>
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
        <p style="margin-top: 15px;">© 2026 Itineramio. Todos los derechos reservados.</p>
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
        <p style="margin-top: 15px;">© 2026 Itineramio. Todos los derechos reservados.</p>
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
            <a href="https://www.itineramio.com/main" 
               style="background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Ver todas las evaluaciones
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 13px;">
          <p style="margin: 15px 0 5px 0;">© 2026 Itineramio. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  supportTicketEscalated: (params: {
    ticketSubject: string
    userName?: string
    userEmail?: string
    reasonLabel: string
    messagesHtml: string
    adminUrl: string
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.5;color:#24292f;background-color:#f6f8fa;">
      <div style="max-width:600px;margin:0 auto;padding:24px;">
        <div style="text-align:center;padding:16px 0 24px;">
          <img src="https://www.itineramio.com/logo.png" alt="Itineramio" width="140" />
        </div>
        <div style="background:#0d1117;border-radius:16px 16px 0 0;padding:32px 36px;text-align:center;">
          <h1 style="color:#fff;margin:0 0 8px;font-size:24px;font-weight:700;">Ticket Escalado</h1>
          <p style="color:#8b949e;margin:0;font-size:15px;">${params.reasonLabel}</p>
        </div>
        <div style="background:#fff;padding:32px 36px;border-radius:0 0 16px 16px;border:1px solid #d0d7de;border-top:none;">
          <div style="background:#f6f8fa;border:1px solid #d0d7de;border-radius:10px;padding:16px;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:13px;color:#656d76;">Asunto</p>
            <p style="margin:0;font-size:16px;font-weight:600;color:#24292f;">${params.ticketSubject}</p>
            ${params.userName ? `<p style="margin:8px 0 0;font-size:13px;color:#656d76;">Usuario: <strong style="color:#24292f;">${params.userName}</strong></p>` : ''}
            ${params.userEmail ? `<p style="margin:4px 0 0;font-size:13px;color:#656d76;">Email: <strong style="color:#24292f;">${params.userEmail}</strong></p>` : ''}
          </div>
          ${params.messagesHtml ? `
          <p style="font-size:14px;font-weight:600;color:#24292f;margin:0 0 12px;">Últimos mensajes:</p>
          ${params.messagesHtml}
          ` : ''}
          <div style="text-align:center;margin:28px 0 0;">
            <a href="${params.adminUrl}" style="background:#8b5cf6;color:white;padding:14px 36px;text-decoration:none;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
              Ver ticket en Admin
            </a>
          </div>
        </div>
        <div style="text-align:center;padding:20px 0;color:#8b949e;font-size:12px;">
          <p style="margin:0;">&copy; 2026 Itineramio</p>
        </div>
      </div>
    </body>
    </html>
  `,

  supportAdminReply: (params: {
    ticketSubject: string
    adminMessage: string
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.5;color:#24292f;background-color:#f6f8fa;">
      <div style="max-width:600px;margin:0 auto;padding:24px;">
        <div style="text-align:center;padding:16px 0 24px;">
          <img src="https://www.itineramio.com/logo.png" alt="Itineramio" width="140" />
        </div>
        <div style="background:#0d1117;border-radius:16px 16px 0 0;padding:32px 36px;text-align:center;">
          <h1 style="color:#fff;margin:0 0 8px;font-size:24px;font-weight:700;">Nueva respuesta</h1>
          <p style="color:#8b949e;margin:0;font-size:15px;">Hemos respondido a tu consulta</p>
        </div>
        <div style="background:#fff;padding:32px 36px;border-radius:0 0 16px 16px;border:1px solid #d0d7de;border-top:none;">
          <p style="font-size:13px;color:#656d76;margin:0 0 4px;">Asunto</p>
          <p style="font-size:16px;font-weight:600;color:#24292f;margin:0 0 20px;">${params.ticketSubject}</p>
          <div style="background:#f6f8fa;border:1px solid #d0d7de;border-radius:10px;padding:16px;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#8b5cf6;">Equipo Itineramio</p>
            <p style="margin:0;font-size:14px;color:#24292f;white-space:pre-wrap;">${params.adminMessage}</p>
          </div>
          <p style="font-size:14px;color:#656d76;text-align:center;">
            Si necesitas algo más, responde directamente a este email o abre el chat de soporte en nuestra web.
          </p>
        </div>
        <div style="text-align:center;padding:20px 0;color:#8b949e;font-size:12px;">
          <p style="margin:0;">&copy; 2026 Itineramio</p>
        </div>
      </div>
    </body>
    </html>
  `,
}

// --- Support Ticket Escalation Email Helper ---

interface TicketEscalatedEmailParams {
  ticketId: string
  ticketSubject: string
  userName?: string
  userEmail?: string
  reason: 'manual' | 'low_confidence'
  recentMessages?: { sender: string; content: string }[]
}

export async function sendTicketEscalatedEmail(params: TicketEscalatedEmailParams) {
  const { ticketId, ticketSubject, userName, userEmail, reason, recentMessages = [] } = params
  const adminUrl = `https://www.itineramio.com/admin/support/tickets/${ticketId}`
  const reasonLabel = reason === 'manual'
    ? 'El usuario ha solicitado hablar con un agente'
    : 'La IA no pudo resolver con confianza suficiente'

  const messagesHtml = recentMessages.slice(-5).map(m => {
    const senderLabel = m.sender === 'USER' ? (userName || userEmail || 'Usuario') : m.sender === 'AI' ? 'SofIA' : 'Admin'
    const bgColor = m.sender === 'USER' ? '#ede9fe' : '#f1f5f9'
    return `<div style="background:${bgColor};border-radius:8px;padding:10px 14px;margin-bottom:8px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#64748b;">${senderLabel}</p>
      <p style="margin:0;font-size:14px;color:#1e293b;">${m.content.substring(0, 300)}</p>
    </div>`
  }).join('')

  const html = emailTemplates.supportTicketEscalated({
    ticketSubject,
    userName,
    userEmail,
    reasonLabel,
    messagesHtml,
    adminUrl,
  })

  return sendEmail({
    to: ['alejandrosatlla@gmail.com'],
    subject: `🎫 Ticket escalado: ${ticketSubject}`,
    html,
  })
}

// Email queue for retry logic (to be implemented with a proper queue system)
export const emailQueue = {
  add: async (emailOptions: EmailOptions) => {
    // TODO: Implement with Bull or similar queue system
    return sendEmail(emailOptions)
  }
}