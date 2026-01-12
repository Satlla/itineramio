import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { Resend } from 'resend'
import { enrollSubscriberInSequences } from '../../../../../src/lib/email-sequences'

// Lazy initialization of Resend
let resend: Resend | null = null
function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

interface CalculationResult {
  hoursPerMonth: number
  hoursPerYear: number
  moneyLostPerYear: number
  tasksAutomatable: number
}

// Threshold for "insane" time loss - triggers WELCOME20 discount
const INSANE_HOURS_THRESHOLD = 40

function generateResultsHTML(data: {
  name: string
  email: string
  properties: number
  checkinsPerMonth: number
  minutesPerCheckin: number
  result: CalculationResult
}): string {
  const { name, email, properties, checkinsPerMonth, minutesPerCheckin, result } = data
  const firstName = name.split(' ')[0]
  const qualifiesForDiscount = result.hoursPerYear >= INSANE_HOURS_THRESHOLD

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f8f8; padding: 40px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; margin: 0 auto;">
        <!-- Header -->
        <tr>
          <td style="text-align: center; padding-bottom: 24px;">
            <p style="margin: 0; color: #717171; font-size: 13px; letter-spacing: 0.5px;">ITINERAMIO</p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="background-color: #ffffff; border-radius: 12px; padding: 40px 32px; border: 1px solid #DDDDDD;">
            <!-- Alert -->
            <div style="background-color: #FEF3C7; border: 1px solid #F59E0B; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 32px; vertical-align: top;">
                    <span style="font-size: 24px;">⚠️</span>
                  </td>
                  <td>
                    <p style="margin: 0; color: #92400E; font-size: 16px; font-weight: 600;">
                      ${firstName}, estás perdiendo ${result.hoursPerYear} horas al año
                    </p>
                    <p style="margin: 4px 0 0 0; color: #A16207; font-size: 14px;">
                      En tareas repetitivas que podrían automatizarse
                    </p>
                  </td>
                </tr>
              </table>
            </div>

            <h1 style="margin: 0 0 24px 0; color: #222222; font-size: 22px; font-weight: 600;">
              Tu informe de tiempo
            </h1>

            <!-- Stats Grid -->
            <table width="100%" cellpadding="0" cellspacing="8" style="margin-bottom: 24px;">
              <tr>
                <td width="50%" style="background-color: #F7F7F7; border-radius: 12px; padding: 20px; text-align: center;">
                  <p style="margin: 0; font-size: 28px; font-weight: 700; color: #222222;">${result.hoursPerMonth}h</p>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #717171;">horas al mes</p>
                </td>
                <td width="50%" style="background-color: #F7F7F7; border-radius: 12px; padding: 20px; text-align: center;">
                  <p style="margin: 0; font-size: 28px; font-weight: 700; color: #222222;">${result.hoursPerYear}h</p>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #717171;">horas al año</p>
                </td>
              </tr>
              <tr>
                <td width="50%" style="background-color: #FEE2E2; border-radius: 12px; padding: 20px; text-align: center;">
                  <p style="margin: 0; font-size: 28px; font-weight: 700; color: #DC2626;">${result.moneyLostPerYear}€</p>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #991B1B;">valor perdido/año</p>
                </td>
                <td width="50%" style="background-color: #DCFCE7; border-radius: 12px; padding: 20px; text-align: center;">
                  <p style="margin: 0; font-size: 28px; font-weight: 700; color: #16A34A;">${result.tasksAutomatable}h</p>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #166534;">automatizables</p>
                </td>
              </tr>
            </table>

            <!-- Data Summary -->
            <div style="background-color: #F7F7F7; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px 0; color: #717171; font-size: 13px; font-weight: 600;">Tus datos:</p>
              <p style="margin: 0; color: #222222; font-size: 14px; line-height: 1.6;">
                ${properties} propiedades × ${checkinsPerMonth} check-ins/mes × ${minutesPerCheckin} min/reserva
              </p>
            </div>

            <!-- What you could do -->
            <p style="margin: 0 0 16px 0; color: #222222; font-size: 16px; font-weight: 600;">
              Con ${result.hoursPerYear} horas podrías:
            </p>
            <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #222222; font-size: 15px; line-height: 2;">
              <li>✅ Conseguir ${Math.round(result.hoursPerYear / 5)} nuevas propiedades</li>
              <li>✅ Mejorar tus anuncios y fotos</li>
              <li>✅ Disfrutar de ${Math.round(result.hoursPerYear / 8)} días libres más</li>
              <li>✅ Responder solo lo importante</li>
            </ul>

            <!-- Solution -->
            <div style="background-color: #F0FDF4; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 12px 0; color: #166534; font-size: 15px; font-weight: 600;">
                💡 Cómo automatizar estás tareas:
              </p>
              <p style="margin: 0; color: #15803D; font-size: 14px; line-height: 1.6;">
                Un <strong>manual digital</strong> responde las preguntas repetitivas por ti: WiFi, normas, parking, electrodomésticos, recomendaciones... El huésped lo consulta cuando quiere, tu no tienes que repetir lo mismo.
              </p>
            </div>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
              <tr>
                <td align="center">
                  <a href="https://www.itineramio.com/register?utm_source=email&utm_medium=tool&utm_campaign=time-calculator"
                     style="display: inline-block; background-color: #FF385C; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    Crear mi manual digital gratis
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin: 0; color: #717171; font-size: 13px; text-align: center;">
              15 días de prueba. Sin tarjeta de crédito.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="text-align: center; padding-top: 24px;">
            <p style="margin: 0; color: #717171; font-size: 12px;">
              <a href="https://www.itineramio.com/api/email/unsubscribe?email=${encodeURIComponent(email)}" style="color: #717171; text-decoration: none;">Cancelar suscripción</a>
              · <a href="https://www.itineramio.com" style="color: #717171; text-decoration: none;">itineramio.com</a>
            </p>
          </td>
        </tr>
      </table>
    </div>
  `
}

// Email sent 5 minutes later if they qualify for WELCOME20
function generateDiscountEmailHTML(data: {
  name: string
  email: string
  hoursPerYear: number
}): string {
  const { name, email, hoursPerYear } = data
  const firstName = name.split(' ')[0]

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f8f8; padding: 40px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; margin: 0 auto;">
        <!-- Header -->
        <tr>
          <td style="text-align: center; padding-bottom: 24px;">
            <p style="margin: 0; color: #717171; font-size: 13px; letter-spacing: 0.5px;">ITINERAMIO</p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="background-color: #ffffff; border-radius: 12px; padding: 40px 32px; border: 1px solid #DDDDDD;">
            <h1 style="margin: 0 0 20px 0; color: #222222; font-size: 24px; font-weight: 600; line-height: 1.3;">
              ${firstName}, ${hoursPerYear} horas al año es una locura
            </h1>

            <p style="margin: 0 0 20px 0; color: #222222; font-size: 16px; line-height: 1.6;">
              Piénsalo un momento: cada vez que un huésped te pregunta por el WiFi, cómo funciona la vitro, o dónde está el parking...
            </p>

            <p style="margin: 0 0 20px 0; color: #222222; font-size: 16px; line-height: 1.6;">
              <strong>Tienes que parar lo que estás haciendo.</strong>
            </p>

            <p style="margin: 0 0 24px 0; color: #717171; font-size: 15px; line-height: 1.6;">
              Parar el coche. Dejar una conversación interesante. Atender a los tuyos a medias. Despertarte a las 4 AM.
            </p>

            <div style="background-color: #FEF3C7; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0; color: #92400E; font-size: 15px; line-height: 1.6;">
                Y todo para responder <strong>siempre lo mismo</strong>. Las mismas preguntas. Una y otra vez.
              </p>
            </div>

            <p style="margin: 0 0 20px 0; color: #222222; font-size: 16px; line-height: 1.6;">
              Con un manual digital, cuando te pregunten por la vitro... solo tienes que enviar un enlace con el video.
            </p>

            <p style="margin: 0 0 24px 0; color: #222222; font-size: 16px; line-height: 1.6;">
              Ya esta. Sin explicaciones. Sin repetir lo mismo. Sin interrupciones.
            </p>

            <!-- Discount Box -->
            <div style="background-color: #FF385C; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #ffffff; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                Tu código de descuento
              </p>
              <p style="margin: 0 0 12px 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 2px;">
                WELCOME20
              </p>
              <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                20% de descuento en tu primera suscripción
              </p>
            </div>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
              <tr>
                <td align="center">
                  <a href="https://www.itineramio.com/register?utm_source=email&utm_medium=tool&utm_campaign=time-calculator-discount&coupon=WELCOME20"
                     style="display: inline-block; background-color: #222222; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    Crear mi manual con 20% dto
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin: 0 0 24px 0; color: #717171; font-size: 13px; text-align: center;">
              Aplica en cualquier plan. 15 días de prueba gratis.
            </p>

            <p style="margin: 0; color: #222222; font-size: 16px; line-height: 1.6;">
              Un saludo,<br />
              <strong>Alejandro</strong><br />
              <span style="color: #717171; font-size: 14px;">Fundador de Itineramio</span>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="text-align: center; padding-top: 24px;">
            <p style="margin: 0; color: #717171; font-size: 12px;">
              <a href="https://www.itineramio.com/api/email/unsubscribe?email=${encodeURIComponent(email)}" style="color: #717171; text-decoration: none;">Cancelar suscripción</a>
              · <a href="https://www.itineramio.com" style="color: #717171; text-decoration: none;">itineramio.com</a>
            </p>
          </td>
        </tr>
      </table>
    </div>
  `
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, properties, checkinsPerMonth, minutesPerCheckin, result, prioridades = [] } = body

    // Validate required fields
    if (!name || !email || !result) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Convert priorities to tags
    const priorityTags = (prioridades as string[]).map((p: string) => `interes-${p}`)

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalido' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Capture lead
    const existingLead = await prisma.lead.findFirst({
      where: {
        email: normalizedEmail,
        source: 'time-calculator',
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    })

    if (!existingLead) {
      await prisma.lead.create({
        data: {
          name,
          email: normalizedEmail,
          source: 'time-calculator',
          metadata: {
            properties,
            checkinsPerMonth,
            minutesPerCheckin,
            hoursPerYear: result.hoursPerYear,
            moneyLostPerYear: result.moneyLostPerYear,
            prioridades: prioridades as string[]
          }
        }
      })
    }

    // Create/update EmailSubscriber
    const existingSubscriber = await prisma.emailSubscriber.findUnique({
      where: { email: normalizedEmail }
    })

    let subscriber
    const baseTags = ['tool_time-calculator', 'time-calculator', ...priorityTags]

    if (!existingSubscriber) {
      subscriber = await prisma.emailSubscriber.create({
        data: {
          email: normalizedEmail,
          name,
          source: 'tool_time-calculator',
          sourceMetadata: {
            properties,
            checkinsPerMonth,
            hoursLost: result.hoursPerYear
          },
          status: 'active',
          sequenceStatus: 'active',
          sequenceStartedAt: new Date(),
          tags: baseTags,
          currentJourneyStage: 'lead',
          engagementScore: 'warm'
        }
      })

      // Enroll in universal funnel sequences
      await enrollSubscriberInSequences(subscriber.id, 'SUBSCRIBER_CREATED', {
        source: 'tool_time-calculator',
        tags: ['tool_time-calculator', 'time-calculator']
      }).catch(error => {
        console.error('Failed to enroll subscriber in sequences:', error)
      })
    } else {
      subscriber = existingSubscriber
      // Update tags if needed - add time-calculator and priority tags
      const newTags = baseTags.filter(tag => !existingSubscriber.tags?.includes(tag))
      if (newTags.length > 0) {
        await prisma.emailSubscriber.update({
          where: { email: normalizedEmail },
          data: { tags: { push: newTags } }
        })
      }
    }

    // Generate and send email with results
    const htmlContent = generateResultsHTML({
      name,
      email: normalizedEmail,
      properties,
      checkinsPerMonth,
      minutesPerCheckin,
      result
    })

    await getResend().emails.send({
      from: 'Itineramio <hola@itineramio.com>',
      to: normalizedEmail,
      subject: `${name.split(' ')[0]}, estás perdiendo ${result.hoursPerYear} horas al año ⏰`,
      html: htmlContent
    })

    console.log(`[Time Calculator] Sent results to ${normalizedEmail}: ${result.hoursPerYear}h/year lost`)

    // If they qualify for WELCOME20 (>= 40h/year), send discount email in 5 minutes
    if (result.hoursPerYear >= INSANE_HOURS_THRESHOLD) {
      const discountHtml = generateDiscountEmailHTML({
        name,
        email: normalizedEmail,
        hoursPerYear: result.hoursPerYear
      })

      // Schedule email for 5 minutes from now
      const sendAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

      await getResend().emails.send({
        from: 'Alejandro de Itineramio <hola@itineramio.com>',
        to: normalizedEmail,
        subject: `${result.hoursPerYear} horas respondiendo lo mismo... usa WELCOME20 🎁`,
        html: discountHtml,
        scheduledAt: sendAt.toISOString()
      })

      console.log(`[Time Calculator] Scheduled WELCOME20 email for ${normalizedEmail} at ${sendAt.toISOString()}`)

      // Add tag to subscriber
      await prisma.emailSubscriber.update({
        where: { email: normalizedEmail },
        data: { tags: { push: 'welcome20-eligible' } }
      }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      message: 'Informe enviado correctamente'
    })

  } catch (error) {
    console.error('Error sending time calculator results:', error)
    return NextResponse.json(
      { error: 'Error al enviar el informe. Inténtalo de nuevo.' },
      { status: 500 }
    )
  }
}
