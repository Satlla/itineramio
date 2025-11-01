import { resend, FROM_EMAIL } from '../lib/resend'
import { prisma } from '../lib/prisma'
import { render } from '@react-email/render'
import { ReactElement } from 'react'

interface SendEmailParams {
  to: string
  subject: string
  template: ReactElement
  templateName: string
  campaignId?: string
  leadId?: string
  userId?: string
}

export async function sendEmail({
  to,
  subject,
  template,
  templateName,
  campaignId,
  leadId,
  userId
}: SendEmailParams) {
  try {
    // Render the email template
    const html = render(template)

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html
    })

    if (error) {
      console.error('Error sending email:', error)

      // Track bounce event
      await prisma.emailEvent.create({
        data: {
          email: to,
          eventType: 'BOUNCED',
          templateName,
          subject,
          campaignId,
          leadId,
          userId,
          bounceReason: error.message
        }
      })

      return { success: false, error }
    }

    // Track sent event
    await prisma.emailEvent.create({
      data: {
        email: to,
        eventType: 'SENT',
        templateName,
        subject,
        campaignId,
        leadId,
        userId,
        deliveredAt: new Date() // Assume delivered for now
      }
    })

    // Update campaign stats if applicable
    if (campaignId) {
      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: {
          sentCount: {
            increment: 1
          }
        }
      })
    }

    console.log('Email sent successfully:', data)
    return { success: true, data }

  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}

// Track email opened (would be called from a tracking pixel or webhook)
export async function trackEmailOpened(emailEventId: string) {
  try {
    const emailEvent = await prisma.emailEvent.update({
      where: { id: emailEventId },
      data: {
        eventType: 'OPENED',
        openedAt: new Date()
      }
    })

    // Update campaign stats
    if (emailEvent.campaignId) {
      await prisma.emailCampaign.update({
        where: { id: emailEvent.campaignId },
        data: {
          openedCount: {
            increment: 1
          }
        }
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error tracking email open:', error)
    return { success: false, error }
  }
}

// Track email clicked (would be called from link tracking)
export async function trackEmailClicked(emailEventId: string, clickedUrl: string) {
  try {
    const emailEvent = await prisma.emailEvent.update({
      where: { id: emailEventId },
      data: {
        eventType: 'CLICKED',
        clickedAt: new Date(),
        clickedUrl
      }
    })

    // Update campaign stats
    if (emailEvent.campaignId) {
      await prisma.emailCampaign.update({
        where: { id: emailEvent.campaignId },
        data: {
          clickedCount: {
            increment: 1
          }
        }
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error tracking email click:', error)
    return { success: false, error }
  }
}
