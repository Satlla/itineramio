import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOnboardingReminderEmail } from '@/lib/resend'

/**
 * GET /api/cron/onboarding-reminders
 * Send reminder emails to users who skipped onboarding 24+ hours ago
 * Should be called by a cron job (e.g., Vercel Cron)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret if configured
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Find users who:
    // 1. Skipped onboarding more than 24 hours ago
    // 2. Haven't completed onboarding
    // 3. Haven't received a reminder email yet
    // 4. Have empty config (not completed)
    const usersToRemind = await prisma.userInvoiceConfig.findMany({
      where: {
        onboardingSkippedAt: {
          not: null,
          lt: oneDayAgo
        },
        onboardingCompletedAt: null,
        onboardingReminderSentAt: null,
        // Must have empty/minimal config (not completed)
        OR: [
          { businessName: '' },
          { nif: '' }
        ]
      },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      take: 50 // Limit batch size
    })

    const results = {
      total: usersToRemind.length,
      sent: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const config of usersToRemind) {
      if (!config.user?.email) continue

      try {
        await sendOnboardingReminderEmail({
          to: config.user.email,
          userName: config.user.name || 'Usuario'
        })

        // Mark reminder as sent
        await prisma.userInvoiceConfig.update({
          where: { id: config.id },
          data: { onboardingReminderSentAt: new Date() }
        })

        results.sent++
      } catch (error: any) {
        results.failed++
        results.errors.push(`${config.user.email}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      ...results
    })
  } catch (error) {
    console.error('Error sending onboarding reminders:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
