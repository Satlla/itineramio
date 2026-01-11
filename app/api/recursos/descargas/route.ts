import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { getFunnelResource } from '@/data/funnel-resources'

// Lead scoring based on qualification data
function calculateLeadScore(
  propiedades: string,
  automatizacion: string,
  intereses: string[]
): number {
  let score = 0

  // Properties score (max 40 points)
  const propScore: Record<string, number> = {
    '1': 5,
    '2-3': 15,
    '4-5': 30,
    '6-10': 40,
    '10+': 40
  }
  score += propScore[propiedades] || 0

  // Automation score (max 30 points) - less automation = higher need
  const autoScore: Record<string, number> = {
    'nada': 30,
    'basico': 15,
    'herramientas': 5
  }
  score += autoScore[automatizacion] || 0

  // Interests score (max 30 points) - more pain points = higher need
  score += Math.min(intereses.length * 6, 30)

  return score // Total max: 100
}

// Lazy initialization to avoid build errors
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')
  return _resend
}

// Email templates for each resource
function getResourceEmailHtml(resourceSlug: string, data: {
  email: string
  propiedades: string
  downloadUrl: string | null
}): string {
  const baseUrl = 'https://www.itineramio.com'

  switch (resourceSlug) {
    case 'plantillas-mensajes':
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f8f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">

          <!-- Header -->
          <tr>
            <td style="padding: 0 0 24px 0; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Itineramio</p>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">

                <!-- Hero -->
                <tr>
                  <td style="background: linear-gradient(135deg, #FF385C 0%, #E31C5F 100%); padding: 32px 28px; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 40px;">📩</p>
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Tus plantillas de mensajes</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 28px;">
                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
                      ¡Aquí tienes! 10 plantillas listas para copiar y pegar en tus respuestas guardadas de Airbnb.
                    </p>

                    <div style="background: #F0FDF4; border-left: 4px solid #22C55E; padding: 16px 20px; margin: 0 0 24px 0; border-radius: 0 8px 8px 0;">
                      <p style="margin: 0; font-size: 14px; color: #166534; line-height: 1.5;">
                        <strong>Incluye plantillas para:</strong><br>
                        • Confirmación de reserva<br>
                        • Instrucciones pre-llegada<br>
                        • Check-in y bienvenida<br>
                        • WiFi, parking, electrodomésticos<br>
                        • Check-out y despedida<br>
                        • Solicitud de reseña
                      </p>
                    </div>

                    <!-- Download Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 8px 0 24px 0;">
                          <a href="${baseUrl}${data.downloadUrl}"
                             style="display: inline-block; background: linear-gradient(135deg, #FF385C 0%, #E31C5F 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                            Descargar plantillas (PDF)
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">
                      <strong>Cómo usarlas:</strong><br>
                      1. Abre el PDF y copia la plantilla que necesites<br>
                      2. Ve a Airbnb → Mensajes → Respuestas guardadas<br>
                      3. Pega y personaliza con los datos de tu alojamiento<br>
                      4. ¡Listo! La próxima vez, un clic y enviado
                    </p>
                  </td>
                </tr>

                <!-- Next Steps -->
                <tr>
                  <td style="padding: 0 28px 28px 28px;">
                    <div style="background: #F8FAFC; border-radius: 8px; padding: 20px;">
                      <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">¿Y si pudieras ir un paso más allá?</p>
                      <p style="margin: 0; font-size: 13px; color: #666; line-height: 1.5;">
                        Las plantillas ahorran tiempo, pero sigues teniendo que enviar cada mensaje manualmente.
                        En los próximos días te contaré cómo algunos anfitriones han pasado de 20 mensajes por reserva a solo 3.
                      </p>
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align: center; padding: 24px 0;">
              <p style="margin: 0; color: #999; font-size: 11px;">
                <a href="${baseUrl}" style="color: #666; text-decoration: none;">itineramio.com</a> · Herramientas para anfitriones
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    case 'checklist-checkin':
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f8f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">

          <tr>
            <td style="padding: 0 0 24px 0; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Itineramio</p>
            </td>
          </tr>

          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">

                <tr>
                  <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 32px 28px; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 40px;">✅</p>
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Tu checklist de check-in</h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 28px;">
                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
                      Con esta checklist, nunca más te olvidarás de revisar algo antes de que llegue un huésped.
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 8px 0 24px 0;">
                          <a href="${baseUrl}${data.downloadUrl}"
                             style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                            Descargar checklist (PDF)
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <tr>
            <td style="text-align: center; padding: 24px 0;">
              <p style="margin: 0; color: #999; font-size: 11px;">
                <a href="${baseUrl}" style="color: #666; text-decoration: none;">itineramio.com</a> · Herramientas para anfitriones
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    default:
      // Generic template
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f8f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">

          <tr>
            <td style="padding: 0 0 24px 0; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Itineramio</p>
            </td>
          </tr>

          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">

                <tr>
                  <td style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); padding: 32px 28px; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 40px;">🎁</p>
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Tu recurso está listo</h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 28px;">
                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
                      ¡Gracias por tu interés! Aquí tienes el recurso que solicitaste.
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 8px 0 24px 0;">
                          <a href="${baseUrl}${data.downloadUrl}"
                             style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                            Descargar recurso
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <tr>
            <td style="text-align: center; padding: 24px 0;">
              <p style="margin: 0; color: #999; font-size: 11px;">
                <a href="${baseUrl}" style="color: #666; text-decoration: none;">itineramio.com</a> · Herramientas para anfitriones
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      propiedades,
      automatizacion,
      intereses = [],
      comentario,
      resourceSlug,
      // Tracking params from email clicks
      sourceEmail,   // e.g., 'email1', 'email2'
      sourceLevel    // e.g., '1', '2'
    } = body

    // Validate required fields
    if (!email || !propiedades || !automatizacion || !resourceSlug) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    // Get resource config
    const resource = getFunnelResource(resourceSlug)
    if (!resource) {
      return NextResponse.json(
        { error: 'Recurso no encontrado' },
        { status: 404 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Build tags for segmentation
    const tags = [
      ...resource.tags,
      'funnel-level-2',
      `propiedades-${propiedades}`,
      `automatizacion-${automatizacion}`,
      ...(intereses as string[]).map((i: string) => `interes-${i}`)
    ]

    // Build funnel journey tracking
    const funnelJourney = {
      // Current status
      currentLevel: 2, // 0=captured, 1=email1_sent, 2=form_completed, 3=resource_sent, etc.
      currentStage: 'form_completed',

      // Source tracking - how they arrived to this form
      arrivedFrom: sourceEmail || 'direct',  // 'email1', 'email2', 'direct'
      arrivedLevel: sourceLevel ? parseInt(sourceLevel) : 0,

      // History of interactions
      emailsClicked: sourceEmail ? [sourceEmail] : [],
      resourcesRequested: [resourceSlug],

      // Qualification data
      qualification: {
        propiedades,
        automatizacion,
        intereses,
        comentario: comentario || null,
        score: calculateLeadScore(propiedades, automatizacion, intereses)
      },

      // Timestamps
      firstTouch: new Date().toISOString(),
      lastTouch: new Date().toISOString(),
      formCompletedAt: new Date().toISOString()
    }

    // Save to Lead
    try {
      await prisma.lead.create({
        data: {
          name: normalizedEmail.split('@')[0], // Use email prefix as name
          email: normalizedEmail,
          source: `funnel-${resourceSlug}`,
          metadata: funnelJourney
        }
      })
      console.log(`[Lead] Created for ${normalizedEmail} from funnel-${resourceSlug}`)
    } catch (dbError: any) {
      // If lead already exists, update with new journey data
      if (dbError.code === 'P2002') {
        // Get existing lead to merge journey data
        const existingLead = await prisma.lead.findFirst({
          where: { email: normalizedEmail }
        })
        const existingMeta = (existingLead?.metadata as any) || {}

        // Merge journey history
        const mergedJourney = {
          ...funnelJourney,
          firstTouch: existingMeta.firstTouch || funnelJourney.firstTouch,
          emailsClicked: [...new Set([
            ...(existingMeta.emailsClicked || []),
            ...(sourceEmail ? [sourceEmail] : [])
          ])],
          resourcesRequested: [...new Set([
            ...(existingMeta.resourcesRequested || []),
            resourceSlug
          ])],
          emailsReceived: existingMeta.emailsReceived || []
        }

        await prisma.lead.updateMany({
          where: { email: normalizedEmail },
          data: {
            metadata: mergedJourney
          }
        })
        console.log(`[Lead] Updated for ${normalizedEmail} - funnel level 2`)
      } else {
        console.error('Error saving lead:', dbError)
      }
    }

    // Create or update EmailSubscriber
    try {
      await prisma.emailSubscriber.upsert({
        where: { email: normalizedEmail },
        create: {
          email: normalizedEmail,
          source: `funnel-${resourceSlug}`,
          status: 'active',
          tags,
          sourceMetadata: {
            propiedades,
            automatizacion,
            intereses,
            comentario: comentario || null,
            funnelLevel: 2
          }
        },
        update: {
          tags: {
            push: tags.filter(t => t !== 'funnel-level-2') // Don't duplicate base tags
          },
          sourceMetadata: {
            propiedades,
            automatizacion,
            intereses,
            comentario: comentario || null,
            funnelLevel: 2,
            updatedAt: new Date().toISOString()
          },
          updatedAt: new Date()
        }
      })
      console.log(`[EmailSubscriber] Upserted for ${normalizedEmail} with tags: ${tags.join(', ')}`)
    } catch (subscriberError) {
      console.error('Error creating subscriber:', subscriberError)
    }

    // Send email with resource
    const emailHtml = getResourceEmailHtml(resourceSlug, {
      email: normalizedEmail,
      propiedades,
      downloadUrl: resource.downloadUrl
    })

    const emailResult = await getResend().emails.send({
      from: 'Itineramio <hola@itineramio.com>',
      to: normalizedEmail,
      subject: resource.emailSubject,
      html: emailHtml
    })

    if (emailResult.error) {
      console.error('Resend error:', emailResult.error)
      return NextResponse.json({
        success: false,
        error: emailResult.error.message || 'Error enviando email'
      }, { status: 500 })
    }

    console.log(`[Email] Sent ${resource.emailSubject} to ${normalizedEmail}`)

    // Send notification for hot leads (4+ properties or 10+)
    const hotLeadProperties = ['4-5', '6-10', '10+']
    const isHotLead = hotLeadProperties.includes(propiedades) && automatizacion === 'nada'

    if (isHotLead) {
      try {
        await getResend().emails.send({
          from: 'Itineramio Leads <hola@itineramio.com>',
          to: ['alejandrosatlla@gmail.com'],
          subject: `🔥 Lead caliente: ${propiedades} propiedades, sin automatizar`,
          html: `
            <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #FF385C, #E31C5F); padding: 20px; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 20px;">🔥 Lead Caliente</h1>
              </div>
              <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 12px 12px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; width: 140px;">Email:</td>
                    <td style="padding: 8px 0; font-weight: 600;">${normalizedEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Propiedades:</td>
                    <td style="padding: 8px 0; font-weight: 600; color: #FF385C;">${propiedades}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Automatización:</td>
                    <td style="padding: 8px 0; font-weight: 600;">${automatizacion === 'nada' ? '❌ Nada' : automatizacion === 'basico' ? '⚠️ Básico' : '✅ Usa herramientas'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Intereses:</td>
                    <td style="padding: 8px 0;">${(intereses as string[]).join(', ') || 'No especificado'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Fuente:</td>
                    <td style="padding: 8px 0;">${resourceSlug}</td>
                  </tr>
                  ${comentario ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666; vertical-align: top;">Comentario:</td>
                    <td style="padding: 8px 0; background: white; border-radius: 8px; padding: 12px;">${comentario}</td>
                  </tr>
                  ` : ''}
                </table>

                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <a href="mailto:${normalizedEmail}" style="display: inline-block; background: #FF385C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    Contactar ahora
                  </a>
                </div>
              </div>
            </div>
          `
        })
        console.log(`[Notification] Hot lead alert sent for ${normalizedEmail}`)
      } catch (notifError) {
        console.error('Error sending hot lead notification:', notifError)
      }
    }

    return NextResponse.json({
      success: true,
      emailId: emailResult.data?.id
    })

  } catch (error) {
    console.error('Error processing funnel form:', error)
    return NextResponse.json(
      { error: 'Error al procesar el formulario' },
      { status: 500 }
    )
  }
}
