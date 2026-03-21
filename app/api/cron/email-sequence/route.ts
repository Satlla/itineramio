import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { sendEmail, emailTemplates } from '../../../../src/lib/email-improved'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Called by Vercel Cron daily at 9am — sends Day 3 and Day 7 follow-up emails
// Uses Notification model to track sent emails (avoids schema changes)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const results = { day3Sent: 0, day7Sent: 0, errors: 0 }

  try {
    // Day 3: Users registered ~3 days ago who have no properties
    const day3Start = new Date(now.getTime() - 3.5 * 24 * 60 * 60 * 1000)
    const day3End = new Date(now.getTime() - 2.5 * 24 * 60 * 60 * 1000)

    const day3Users = await prisma.user.findMany({
      where: {
        emailVerified: { not: null },
        createdAt: { gte: day3Start, lte: day3End },
        properties: { none: {} },
        // Exclude users who already received this email (tracked via Notification)
        notifications: { none: { type: 'EMAIL_SEQUENCE_DAY3' } },
      },
      select: { id: true, email: true, name: true },
      take: 50,
    })

    for (const user of day3Users) {
      try {
        await sendEmail({
          to: user.email,
          subject: `${user.name || 'Hola'}, ¿ya creaste tu manual? - Itineramio`,
          html: emailTemplates.day3FollowUp(user.name || 'Hola'),
        })

        // Track that email was sent
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'EMAIL_SEQUENCE_DAY3',
            title: 'Email secuencia día 3 enviado',
            message: 'Follow-up: ¿Ya creaste tu manual?',
          },
        })

        results.day3Sent++
      } catch (err) {
        results.errors++
      }
    }

    // Day 7: Users registered ~7 days ago
    const day7Start = new Date(now.getTime() - 7.5 * 24 * 60 * 60 * 1000)
    const day7End = new Date(now.getTime() - 6.5 * 24 * 60 * 60 * 1000)

    const day7Users = await prisma.user.findMany({
      where: {
        emailVerified: { not: null },
        createdAt: { gte: day7Start, lte: day7End },
        notifications: { none: { type: 'EMAIL_SEQUENCE_DAY7' } },
      },
      select: { id: true, email: true, name: true },
      take: 50,
    })

    for (const user of day7Users) {
      try {
        await sendEmail({
          to: user.email,
          subject: '5 consejos para un manual perfecto - Itineramio',
          html: emailTemplates.day7Tips(user.name || 'Hola'),
        })

        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'EMAIL_SEQUENCE_DAY7',
            title: 'Email secuencia día 7 enviado',
            message: '5 consejos para un manual perfecto',
          },
        })

        results.day7Sent++
      } catch (err) {
        results.errors++
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      processedAt: now.toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
