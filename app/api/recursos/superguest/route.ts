import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { enrollSubscriberInSequences } from '@/lib/email-sequences'

// Lazy initialization to avoid build errors
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')
  return _resend
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, hostName, propertyName, guestName, discount, code, fileData, format = 'png' } = body

    if (!email || !guestName) {
      return NextResponse.json(
        { error: 'Email y nombre del huésped son obligatorios' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Save lead to database
    try {
      await prisma.lead.create({
        data: {
          name: hostName || 'Anfitrión',
          email: normalizedEmail,
          source: 'superguest-generator',
          metadata: {
            hostName,
            propertyName,
            guestName,
            discount,
            code,
            format
          }
        }
      })
      console.log(`[Lead] Created for ${normalizedEmail} from superguest-generator`)
    } catch (dbError) {
      console.error('Error saving lead:', dbError)
    }

    // Create or update EmailSubscriber for nurturing sequence
    let subscriber = null
    try {
      const baseTags = ['superguest-generator', 'recurso-gratuito', 'herramienta-fidelizacion']

      subscriber = await prisma.emailSubscriber.upsert({
        where: { email: normalizedEmail },
        create: {
          email: normalizedEmail,
          name: hostName || 'Anfitrión',
          source: 'superguest-generator',
          status: 'active',
          tags: baseTags,
          archetype: 'EXPERIENCIAL' // Users interested in guest loyalty programs
        },
        update: {
          tags: {
            push: baseTags
          },
          updatedAt: new Date()
        }
      })

      console.log(`[EmailSubscriber] Created/updated for ${normalizedEmail} from superguest-generator`)

      // Enroll in nurturing sequences
      await enrollSubscriberInSequences(subscriber.id, 'SUBSCRIBER_CREATED', {
        archetype: subscriber.archetype || 'EXPERIENCIAL',
        source: 'superguest-generator',
        tags: baseTags
      })

      console.log(`[EmailSubscriber] Enrolled ${normalizedEmail} in sequences`)
    } catch (subscriberError) {
      console.error('Error creating subscriber:', subscriberError)
    }

    // Prepare attachment based on format
    const attachments: { filename: string; content: string }[] = []
    const fileSlug = guestName.toLowerCase().replace(/\s+/g, '-')

    if (fileData) {
      if (format === 'pdf' && fileData.startsWith('data:application/pdf;base64,')) {
        attachments.push({
          filename: `superguest-${fileSlug}.pdf`,
          content: fileData.replace('data:application/pdf;base64,', '')
        })
      } else if (fileData.startsWith('data:image/png;base64,')) {
        attachments.push({
          filename: `superguest-${fileSlug}.png`,
          content: fileData.replace('data:image/png;base64,', '')
        })
      }
    }

    const formatText = format === 'pdf' ? 'PDF' : 'PNG'

    // Send email with the badge
    const emailResult = await getResend().emails.send({
      from: 'Itineramio <hola@itineramio.com>',
      to: normalizedEmail,
      subject: `Tu insignia SuperGuest para ${guestName} está lista`,
      attachments,
      html: `
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
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px;">

          <!-- Header -->
          <tr>
            <td style="padding: 0 0 32px 0; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Itineramio</p>
              <h1 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">🏆 Tu insignia SuperGuest</h1>
              <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">Hola ${hostName || 'Anfitrión'}, aquí tienes la insignia para ${guestName}.</p>
            </td>
          </tr>

          <!-- Badge Preview Box -->
          <tr>
            <td style="padding: 24px; background: linear-gradient(135deg, #fff1f2 0%, #fef3c7 100%); border-radius: 16px; border: 1px solid #fecdd3; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">🏆</div>
              <h2 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 800; background: linear-gradient(90deg, #f43f5e, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">SuperGuest</h2>
              <p style="margin: 0 0 4px 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">${guestName}</p>
              <div style="display: inline-block; background: linear-gradient(90deg, #f43f5e, #f59e0b); color: white; padding: 8px 20px; border-radius: 20px; margin: 12px 0;">
                <span style="font-size: 24px; font-weight: 800;">${discount}%</span>
                <span style="font-size: 12px; margin-left: 4px;">OFF</span>
              </div>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #666;">Código: <strong style="font-family: monospace; color: #1a1a1a;">${code}</strong></p>
              ${propertyName ? `<p style="margin: 8px 0 0 0; font-size: 13px; color: #888;">${propertyName}</p>` : ''}
            </td>
          </tr>

          <!-- Download Info -->
          <tr>
            <td style="padding: 24px 0;">
              <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 20px;">
                <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #166534;">📎 Archivo adjunto</p>
                <p style="margin: 0; font-size: 13px; color: #166534; line-height: 1.5;">
                  Hemos adjuntado la insignia en formato ${formatText} lista para enviar a tu huésped por WhatsApp, Airbnb o email.
                </p>
              </div>
            </td>
          </tr>

          <!-- How to use -->
          <tr>
            <td style="padding: 0 0 24px 0;">
              <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">💡 Cómo usar la insignia</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #555; border-bottom: 1px solid #f0f0f0;">
                    <strong style="color: #f43f5e;">1.</strong> Envía la insignia junto con tu mensaje de agradecimiento post-checkout
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #555; border-bottom: 1px solid #f0f0f0;">
                    <strong style="color: #f43f5e;">2.</strong> Explica que el código es para reserva directa (sin Airbnb/Booking)
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #555;">
                    <strong style="color: #f43f5e;">3.</strong> Guarda el código ${code} para aplicar el descuento cuando te contacten
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 24px; background: #f8f8f8; border-radius: 12px; text-align: center;">
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #666;">¿Quieres crear más insignias?</p>
              <a href="https://www.itineramio.com/recursos/superguest-generator" style="display: inline-block; background: linear-gradient(90deg, #f43f5e, #f59e0b); color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 8px;">
                Crear otra insignia
              </a>
            </td>
          </tr>

          <!-- Related Resources -->
          <tr>
            <td style="padding: 24px 0 0 0;">
              <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 1px;">Recursos relacionados</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0;">
                    <a href="https://www.itineramio.com/recursos/plantilla-reviews" style="color: #7c3aed; text-decoration: none; font-size: 14px;">📋 Plantilla significado de estrellas →</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <a href="https://www.itineramio.com/blog/como-conseguir-reseñas-5-estrellas-airbnb" style="color: #7c3aed; text-decoration: none; font-size: 14px;">⭐ Cómo conseguir reseñas de 5 estrellas →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align: center; padding: 32px 0 0 0; border-top: 1px solid #e5e5e5; margin-top: 24px;">
              <p style="margin: 0; color: #999; font-size: 11px;">
                <a href="https://www.itineramio.com" style="color: #666; text-decoration: none;">itineramio.com</a> · Herramientas para anfitriones
              </p>
              <p style="margin: 8px 0 0 0; color: #ccc; font-size: 10px;">
                <a href="https://www.itineramio.com/api/email/unsubscribe?email=${encodeURIComponent(normalizedEmail)}" style="color: #ccc; text-decoration: none;">Cancelar suscripción</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
    })

    console.log('Resend result:', JSON.stringify(emailResult, null, 2))

    if (emailResult.error) {
      console.error('Resend error:', emailResult.error)
      return NextResponse.json({
        success: false,
        error: emailResult.error.message || 'Error enviando email'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      emailId: emailResult.data?.id
    })

  } catch (error) {
    console.error('Error processing superguest request:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
