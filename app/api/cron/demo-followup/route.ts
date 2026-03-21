import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { sendEmail, emailTemplates } from '../../../../src/lib/email'

/**
 * Cron job horario para enviar emails de seguimiento a leads de demo:
 * - 1h después: email pidiendo feedback
 * - 6h después: email chatbot engagement
 * - 12h después: email FOMO social proof
 * - 23h después: email de urgencia (cupón expira en 1h)
 * - 48h después: email last chance (sin cupón)
 *
 * Schedule: cada hora (0 * * * *)
 */

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  // Verificar autorización
  if (!CRON_SECRET) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.itineramio.com'
    let feedbackSent = 0
    let chatbotSent = 0
    let fomoSent = 0
    let urgencySent = 0
    let lastChanceSent = 0
    let errors = 0

    // ========================================
    // 1. Email feedback (1-2h después de demo)
    // ========================================
    const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000)
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)

    const feedbackLeads = await prisma.lead.findMany({
      where: {
        source: 'demo',
        createdAt: {
          gte: twoHoursAgo,
          lte: oneHourAgo,
        },
      },
      take: 100,
    })

    for (const lead of feedbackLeads) {
      try {
        const metadata = (lead.metadata as Record<string, unknown>) || {}

        // Skip if feedback email already sent
        if (metadata.feedbackEmailSentAt) continue
        // Skip if no demo data
        if (!metadata.demoGeneratedAt) continue

        const leadName = lead.name || lead.email.split('@')[0]
        const propertyName = (metadata.propertyName as string) || 'tu propiedad'
        const couponCode = (metadata.couponCode as string) || ''
        const propertyId = (metadata.propertyId as string) || ''

        // Build feedback URL
        const feedbackUrl = `${baseUrl}/demo-feedback?leadId=${lead.id}&coupon=${couponCode}&property=${encodeURIComponent(propertyName)}${propertyId ? `&propertyId=${propertyId}` : ''}`

        // Calculate coupon expiry (24h from demo generation)
        const demoTime = new Date(metadata.demoGeneratedAt as string)
        const couponExpiresAt = new Date(demoTime.getTime() + 24 * 60 * 60 * 1000)

        await sendEmail({
          to: lead.email,
          subject: `¿Qué te ha parecido tu guía de ${propertyName}?`,
          html: emailTemplates.demoFeedback({
            leadName,
            propertyName,
            feedbackUrl,
            couponCode,
            couponExpiresAt: couponExpiresAt.toLocaleString('es-ES', {
              timeZone: 'Europe/Madrid',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          }),
        })

        // Mark as sent
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            metadata: {
              ...metadata,
              feedbackEmailSentAt: new Date().toISOString(),
            },
          },
        })

        feedbackSent++
      } catch (err) {
        errors++
      }
    }

    // ========================================
    // 2. Email chatbot engagement (5-7h después)
    // ========================================
    const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000)
    const sevenHoursAgo = new Date(now.getTime() - 7 * 60 * 60 * 1000)

    const chatbotLeads = await prisma.lead.findMany({
      where: {
        source: 'demo',
        createdAt: { gte: sevenHoursAgo, lte: fiveHoursAgo },
      },
      take: 100,
    })

    for (const lead of chatbotLeads) {
      try {
        const metadata = (lead.metadata as Record<string, unknown>) || {}
        if (metadata.chatbotEmailSentAt || !metadata.demoGeneratedAt) continue

        const leadName = lead.name || lead.email.split('@')[0]
        const propertyName = (metadata.propertyName as string) || 'tu propiedad'
        const couponCode = (metadata.couponCode as string) || ''
        const propertyId = (metadata.propertyId as string) || ''
        const registerUrl = `${baseUrl}/register?coupon=${couponCode}${propertyId ? `&propertyId=${propertyId}` : ''}&email=${encodeURIComponent(lead.email)}&name=${encodeURIComponent(leadName)}&utm_source=demo&utm_medium=email&utm_campaign=chatbot`

        await sendEmail({
          to: lead.email,
          subject: `${leadName}, mira lo que tu chatbot IA puede hacer`,
          html: emailTemplates.demoChatbotEngagement({ leadName, propertyName, couponCode, registerUrl }),
        })

        await prisma.lead.update({
          where: { id: lead.id },
          data: { metadata: { ...metadata, chatbotEmailSentAt: new Date().toISOString() } },
        })
        chatbotSent++
      } catch (err) {
        errors++
      }
    }

    // ========================================
    // 3. Email FOMO (11-13h después)
    // ========================================
    const elevenHoursAgo = new Date(now.getTime() - 11 * 60 * 60 * 1000)
    const thirteenHoursAgo = new Date(now.getTime() - 13 * 60 * 60 * 1000)

    const fomoLeads = await prisma.lead.findMany({
      where: {
        source: 'demo',
        createdAt: { gte: thirteenHoursAgo, lte: elevenHoursAgo },
      },
      take: 100,
    })

    // Count approx hosts this week for the FOMO number
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const hostsThisWeek = await prisma.user.count({
      where: { createdAt: { gte: weekAgo }, role: 'HOST' },
    })

    for (const lead of fomoLeads) {
      try {
        const metadata = (lead.metadata as Record<string, unknown>) || {}
        if (metadata.fomoEmailSentAt || !metadata.demoGeneratedAt) continue

        const leadName = lead.name || lead.email.split('@')[0]
        const propertyName = (metadata.propertyName as string) || 'tu propiedad'
        const couponCode = (metadata.couponCode as string) || ''
        const propertyId = (metadata.propertyId as string) || ''
        const registerUrl = `${baseUrl}/register?coupon=${couponCode}${propertyId ? `&propertyId=${propertyId}` : ''}&email=${encodeURIComponent(lead.email)}&name=${encodeURIComponent(leadName)}&utm_source=demo&utm_medium=email&utm_campaign=fomo`

        await sendEmail({
          to: lead.email,
          subject: `${Math.max(hostsThisWeek, 50) + Math.floor(Math.random() * 30)} anfitriones activaron su manual esta semana`,
          html: emailTemplates.demoFomo({
            leadName,
            propertyName,
            couponCode,
            registerUrl,
            hostsThisWeek: Math.max(hostsThisWeek, 50) + Math.floor(Math.random() * 30),
          }),
        })

        await prisma.lead.update({
          where: { id: lead.id },
          data: { metadata: { ...metadata, fomoEmailSentAt: new Date().toISOString() } },
        })
        fomoSent++
      } catch (err) {
        errors++
      }
    }

    // ========================================
    // 4. Email urgencia (23-25h después de demo)
    // ========================================
    const twentyThreeHoursAgo = new Date(now.getTime() - 23 * 60 * 60 * 1000)
    const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000)

    const urgencyLeads = await prisma.lead.findMany({
      where: {
        source: 'demo',
        createdAt: {
          gte: twentyFiveHoursAgo,
          lte: twentyThreeHoursAgo,
        },
      },
      take: 100,
    })

    for (const lead of urgencyLeads) {
      try {
        const metadata = (lead.metadata as Record<string, unknown>) || {}

        // Skip if urgency email already sent
        if (metadata.urgencyEmailSentAt) continue
        // Skip if no demo data
        if (!metadata.demoGeneratedAt) continue

        const leadName = lead.name || lead.email.split('@')[0]
        const propertyName = (metadata.propertyName as string) || 'tu propiedad'
        const couponCode = (metadata.couponCode as string) || ''

        const propertyId = (metadata.propertyId as string) || ''
        const registerUrl = `${baseUrl}/register?coupon=${couponCode}${propertyId ? `&propertyId=${propertyId}` : ''}&email=${encodeURIComponent(lead.email)}&name=${encodeURIComponent(leadName)}&utm_source=demo&utm_medium=email&utm_campaign=urgency`

        await sendEmail({
          to: lead.email,
          subject: `⏰ Tu cupón del 20% para ${propertyName} expira en 1 hora`,
          html: emailTemplates.demoUrgency({
            leadName,
            propertyName,
            couponCode,
            registerUrl,
          }),
        })

        // Mark as sent
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            metadata: {
              ...metadata,
              urgencyEmailSentAt: new Date().toISOString(),
            },
          },
        })

        urgencySent++
      } catch (err) {
        errors++
      }
    }

    // ========================================
    // 5. Email last chance (47-49h después, sin cupón)
    // ========================================
    const fortySevenHoursAgo = new Date(now.getTime() - 47 * 60 * 60 * 1000)
    const fortyNineHoursAgo = new Date(now.getTime() - 49 * 60 * 60 * 1000)

    const lastChanceLeads = await prisma.lead.findMany({
      where: {
        source: 'demo',
        createdAt: { gte: fortyNineHoursAgo, lte: fortySevenHoursAgo },
      },
      take: 100,
    })

    for (const lead of lastChanceLeads) {
      try {
        const metadata = (lead.metadata as Record<string, unknown>) || {}
        if (metadata.lastChanceEmailSentAt || !metadata.demoGeneratedAt) continue

        // Skip if already registered
        const existingUser = await prisma.user.findUnique({ where: { email: lead.email }, select: { id: true } })
        if (existingUser) continue

        const leadName = lead.name || lead.email.split('@')[0]
        const propertyName = (metadata.propertyName as string) || 'tu propiedad'
        const propertyId = (metadata.propertyId as string) || ''
        const registerUrl = `${baseUrl}/register?${propertyId ? `propertyId=${propertyId}&` : ''}email=${encodeURIComponent(lead.email)}&name=${encodeURIComponent(leadName)}&utm_source=demo&utm_medium=email&utm_campaign=lastchance`

        await sendEmail({
          to: lead.email,
          subject: `Tu manual de ${propertyName} ha expirado`,
          html: emailTemplates.demoLastChance({ leadName, propertyName, registerUrl }),
        })

        await prisma.lead.update({
          where: { id: lead.id },
          data: { metadata: { ...metadata, lastChanceEmailSentAt: new Date().toISOString() } },
        })
        lastChanceSent++
      } catch (err) {
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      feedbackSent,
      chatbotSent,
      fomoSent,
      urgencySent,
      lastChanceSent,
      errors,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
