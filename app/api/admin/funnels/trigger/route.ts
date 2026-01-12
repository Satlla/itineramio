import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { Resend } from 'resend'
import {
  LEAD_MAGNETS_BY_THEME,
  FUNNELS,
  type FunnelTheme
} from '@/data/funnels'

const resend = new Resend(process.env.RESEND_API_KEY)

// Email templates for each funnel
function generateFunnelEmail(
  theme: FunnelTheme,
  day: number,
  leadName: string,
  leadEmail: string
): { subject: string; html: string } {
  const funnel = FUNNELS[LEAD_MAGNETS_BY_THEME[theme].funnelId]
  const emailConfig = funnel.emails.find(e => e.day === day)

  if (!emailConfig) {
    throw new Error(`No email found for day ${day} in funnel ${theme}`)
  }

  const firstName = leadName?.split(' ')[0] || 'Hola'
  const baseUrl = 'https://www.itineramio.com'

  // Generate HTML based on theme and day
  const html = generateEmailHtml(theme, day, firstName, leadEmail, emailConfig, baseUrl)

  return {
    subject: emailConfig.subject,
    html
  }
}

function generateEmailHtml(
  theme: FunnelTheme,
  day: number,
  firstName: string,
  email: string,
  emailConfig: any,
  baseUrl: string
): string {
  const leadMagnet = LEAD_MAGNETS_BY_THEME[theme]

  // Day 0 emails - delivery of lead magnet
  if (day === 0) {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f8f8; padding: 40px 16px; margin: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; margin: 0 auto;">
    <tr>
      <td style="text-align: center; padding-bottom: 24px;">
        <p style="margin: 0; color: #717171; font-size: 13px; letter-spacing: 0.5px;">ITINERAMIO</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #ffffff; border-radius: 12px; padding: 40px 32px; border: 1px solid #DDDDDD;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 48px;">${leadMagnet.icon}</span>
        </div>
        <h1 style="margin: 0 0 24px 0; color: #222222; font-size: 24px; font-weight: 600; line-height: 1.3; text-align: center;">
          ${firstName}, aquí tienes tu recurso
        </h1>
        <p style="margin: 0 0 24px 0; color: #222222; font-size: 16px; line-height: 1.6;">
          Gracias por tu interes en <strong>${leadMagnet.title}</strong>.
        </p>
        ${leadMagnet.downloadUrl ? `
        <div style="text-align: center; margin: 32px 0;">
          <a href="${baseUrl}${leadMagnet.downloadUrl}"
             style="display: inline-block; background-color: #222222; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Descargar PDF
          </a>
        </div>
        ` : leadMagnet.resourceUrl ? `
        <div style="text-align: center; margin: 32px 0;">
          <a href="${baseUrl}${leadMagnet.resourceUrl}"
             style="display: inline-block; background-color: #222222; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Acceder al recurso
          </a>
        </div>
        ` : ''}
        <p style="margin: 24px 0 0 0; color: #222222; font-size: 16px; line-height: 1.6;">
          En los próximos días te enviaré contenido relacionado que te ayudara a sacar el maximo partido.
        </p>
        <p style="margin: 24px 0 0 0; color: #222222; font-size: 16px; line-height: 1.6;">
          Un saludo,<br>
          <strong>Alejandro</strong><br>
          <span style="color: #717171; font-size: 14px;">Fundador de Itineramio</span>
        </p>
      </td>
    </tr>
    <tr>
      <td style="text-align: center; padding-top: 24px;">
        <p style="margin: 0; color: #717171; font-size: 12px;">
          <a href="${baseUrl}/api/email/unsubscribe?email=${encodeURIComponent(email)}" style="color: #717171; text-decoration: none;">Cancelar suscripcion</a>
          · <a href="${baseUrl}" style="color: #717171; text-decoration: none;">itineramio.com</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
  }

  // Content emails (day 2, 4, 7, etc.)
  const blogLink = emailConfig.blogUrl
    ? `<div style="text-align: center; margin: 32px 0;">
        <a href="${baseUrl}${emailConfig.blogUrl}"
           style="display: inline-block; background-color: #222222; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
          Leer articulo completo →
        </a>
      </div>`
    : ''

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f8f8; padding: 40px 16px; margin: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; margin: 0 auto;">
    <tr>
      <td style="text-align: center; padding-bottom: 24px;">
        <p style="margin: 0; color: #717171; font-size: 13px; letter-spacing: 0.5px;">ITINERAMIO</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #ffffff; border-radius: 12px; padding: 40px 32px; border: 1px solid #DDDDDD;">
        <h1 style="margin: 0 0 24px 0; color: #222222; font-size: 24px; font-weight: 600; line-height: 1.3;">
          ${emailConfig.subject}
        </h1>
        <p style="margin: 0 0 20px 0; color: #222222; font-size: 16px; line-height: 1.6;">
          ${firstName}, ${emailConfig.previewText}
        </p>
        ${blogLink}
        <p style="margin: 24px 0 0 0; color: #222222; font-size: 16px; line-height: 1.6;">
          Alejandro
        </p>
      </td>
    </tr>
    <tr>
      <td style="text-align: center; padding-top: 24px;">
        <p style="margin: 0; color: #717171; font-size: 12px;">
          <a href="${baseUrl}/api/email/unsubscribe?email=${encodeURIComponent(email)}" style="color: #717171; text-decoration: none;">Cancelar suscripcion</a>
          · <a href="${baseUrl}" style="color: #717171; text-decoration: none;">itineramio.com</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { leadId, theme } = body

    if (!leadId || !theme) {
      return NextResponse.json(
        { error: 'LeadId y theme son requeridos' },
        { status: 400 }
      )
    }

    // Get the lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead no encontrado' },
        { status: 404 }
      )
    }

    // Generate and send the first email (day 0)
    const emailContent = generateFunnelEmail(
      theme as FunnelTheme,
      0,
      lead.name,
      lead.email
    )

    const leadMagnet = LEAD_MAGNETS_BY_THEME[theme as FunnelTheme]

    // Send email
    const result = await resend.emails.send({
      from: 'Alejandro de Itineramio <hola@itineramio.com>',
      to: lead.email,
      subject: emailContent.subject,
      html: emailContent.html
    })

    if (result.error) {
      console.error('Error sending email:', result.error)
      return NextResponse.json(
        { error: 'Error al enviar email' },
        { status: 500 }
      )
    }

    // Update lead with funnel start info - try with funnel fields, fallback to metadata
    try {
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          funnelTheme: theme,
          funnelStartedAt: new Date(),
          funnelCurrentDay: 0
        }
      })
    } catch {
      // Fallback if funnel fields don't exist yet - store in metadata
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          metadata: {
            ...(lead.metadata as object || {}),
            funnelTheme: theme,
            funnelStartedAt: new Date().toISOString(),
            funnelCurrentDay: 0
          }
        }
      })
    }

    // Log the email event
    await prisma.emailEvent.create({
      data: {
        leadId: lead.id,
        email: lead.email,
        eventType: 'SENT',
        templateName: `funnel-${theme}-day0`,
        subject: emailContent.subject,
        metadata: {
          resendId: result.data?.id,
          theme,
          day: 0,
          leadMagnet: leadMagnet.name
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Embudo "${leadMagnet.name}" iniciado para ${lead.email}`,
      emailId: result.data?.id
    })
  } catch (error) {
    console.error('Error triggering funnel:', error)
    return NextResponse.json(
      { error: 'Error al lanzar embudo' },
      { status: 500 }
    )
  }
}
