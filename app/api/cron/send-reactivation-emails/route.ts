import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { resend } from '../../../../src/lib/resend'
import { TrialExpiredReactivation, getSubject } from '../../../../src/emails/templates/trial-expired-reactivation'
import { render } from '@react-email/render'

/**
 * Cron job to send reactivation emails to users whose trials expired
 * Sends emails at specific intervals: 3 days, 7 days, 14 days after expiration
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Starting reactivation email cron job...')

    // Verify cron secret
    const cronSecret = request.headers.get('x-cron-secret')
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const results = {
      sent3d: 0,
      sent7d: 0,
      sent14d: 0,
      errors: 0
    }

    // Define reactivation intervals (days after expiration)
    const intervals = [
      { days: 3, field: 'reactivationEmail3d' },
      { days: 7, field: 'reactivationEmail7d' },
      { days: 14, field: 'reactivationEmail14d' }
    ]

    for (const interval of intervals) {
      // Calculate the date range for this interval
      const targetDate = new Date(now)
      targetDate.setDate(targetDate.getDate() - interval.days)

      // Find users with SUSPENDED properties who haven't received this email
      // and whose trial expired around the target date
      const startDate = new Date(targetDate)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(targetDate)
      endDate.setHours(23, 59, 59, 999)

      // Get unique hosts with suspended trials from the target date
      const expiredProperties = await prisma.property.findMany({
        where: {
          status: 'SUSPENDED',
          trialEndsAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          host: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              analytics: true
            }
          }
        }
      })

      // Group by host to avoid sending multiple emails
      const hostMap = new Map<string, {
        host: { id: string; name: string; email: string }
        totalViews: number
        propertiesCount: number
      }>()

      for (const property of expiredProperties) {
        const existing = hostMap.get(property.hostId)
        const views = property._count?.analytics || 0

        if (existing) {
          existing.totalViews += views
          existing.propertiesCount += 1
        } else {
          hostMap.set(property.hostId, {
            host: property.host,
            totalViews: views,
            propertiesCount: 1
          })
        }
      }

      // Send emails to each host
      for (const [hostId, data] of hostMap) {
        try {
          // Check if user already has an active subscription (don't send reactivation)
          const activeSubscription = await prisma.userSubscription.findFirst({
            where: {
              userId: hostId,
              status: { in: ['active', 'trialing'] }
            }
          })

          if (activeSubscription) {
            console.log(`⏭️ Skipping ${data.host.email} - has active subscription`)
            continue
          }

          // Check if we already sent this interval's email
          const existingEmail = await prisma.emailLog.findFirst({
            where: {
              userId: hostId,
              type: `REACTIVATION_${interval.days}D`,
              createdAt: {
                gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // Within last 30 days
              }
            }
          })

          if (existingEmail) {
            console.log(`⏭️ Skipping ${data.host.email} - already received ${interval.days}d email`)
            continue
          }

          // Render the email
          const emailHtml = await render(
            TrialExpiredReactivation({
              name: data.host.name || 'Anfitrión',
              email: data.host.email,
              totalViews: data.totalViews,
              propertiesCount: data.propertiesCount,
              daysExpired: interval.days
            })
          )

          // Send via Resend
          const { data: emailData, error } = await resend.emails.send({
            from: 'Alejandro de Itineramio <hola@itineramio.com>',
            to: data.host.email,
            subject: getSubject(data.host.name || 'Anfitrión'),
            html: emailHtml,
            tags: [
              { name: 'type', value: 'reactivation' },
              { name: 'interval', value: `${interval.days}d` }
            ]
          })

          if (error) {
            console.error(`❌ Error sending to ${data.host.email}:`, error)
            results.errors++
            continue
          }

          // Log the email
          await prisma.emailLog.create({
            data: {
              userId: hostId,
              type: `REACTIVATION_${interval.days}D`,
              email: data.host.email,
              subject: getSubject(data.host.name || 'Anfitrión'),
              resendId: emailData?.id
            }
          })

          console.log(`✅ Reactivation email (${interval.days}d) sent to ${data.host.email}`)

          if (interval.days === 3) results.sent3d++
          else if (interval.days === 7) results.sent7d++
          else if (interval.days === 14) results.sent14d++

        } catch (error) {
          console.error(`❌ Error processing ${data.host.email}:`, error)
          results.errors++
        }
      }
    }

    console.log('✅ Reactivation email cron completed:', results)

    return NextResponse.json({
      success: true,
      ...results
    })

  } catch (error) {
    console.error('❌ Reactivation cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
