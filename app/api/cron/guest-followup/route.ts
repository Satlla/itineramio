import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/resend'
import { GuestFollowupEmail, getFollowupSubject } from '@/emails/templates/guest-followup'

/**
 * Cron job diario para enviar emails de follow-up a huéspedes
 * que interactuaron con el chatbot hace 24-48h.
 *
 * Schedule: diario a las 10:00 UTC
 */

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  // Verificar autorización
  if (!CRON_SECRET) {
    console.error('CRON_SECRET not configured')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)

    // Find conversations created 24-48h ago with email, that haven't had follow-up sent
    const conversations = await prisma.chatbotConversation.findMany({
      where: {
        guestEmail: { not: null },
        followUpSentAt: null,
        createdAt: {
          gte: fortyEightHoursAgo,
          lte: twentyFourHoursAgo
        }
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            slug: true,
            host: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      take: 100 // Process max 100 per run
    })

    let sent = 0
    let errors = 0

    for (const conversation of conversations) {
      try {
        if (!conversation.guestEmail || !conversation.property) continue

        const propertyName = typeof conversation.property.name === 'object'
          ? (conversation.property.name as any)[conversation.language] || (conversation.property.name as any).es || ''
          : conversation.property.name || ''

        const hostName = conversation.property.host?.name || 'Tu anfitrión'
        const guestName = conversation.guestName || conversation.guestEmail.split('@')[0]

        // Build guide URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.itineramio.com'
        const guideUrl = conversation.property.slug
          ? `${baseUrl}/guide/${conversation.property.slug}`
          : `${baseUrl}/guide/${conversation.property.id}`

        const subject = getFollowupSubject(propertyName, conversation.language)

        const result = await sendEmail({
          to: conversation.guestEmail,
          subject,
          react: GuestFollowupEmail({
            guestName,
            propertyName,
            guideUrl,
            hostName,
            language: conversation.language as 'es' | 'en' | 'fr'
          }),
          tags: ['guest-followup', `property-${conversation.propertyId}`]
        })

        if (result.success) {
          await prisma.chatbotConversation.update({
            where: { id: conversation.id },
            data: { followUpSentAt: new Date() }
          })
          sent++
        } else {
          errors++
          console.error(`[GuestFollowup] Failed to send to ${conversation.guestEmail}:`, result.error)
        }
      } catch (emailError) {
        errors++
        console.error(`[GuestFollowup] Error processing conversation ${conversation.id}:`, emailError)
      }
    }

    console.log(`[GuestFollowup] Processed: ${conversations.length}, Sent: ${sent}, Errors: ${errors}`)

    return NextResponse.json({
      success: true,
      processed: conversations.length,
      sent,
      errors
    })

  } catch (error) {
    console.error('[GuestFollowup] Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
