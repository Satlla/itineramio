import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * POST /api/gestion/onboarding-status
 * Track when user sees/skips onboarding for reminder emails
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const { action } = body // 'skipped' | 'started' | 'completed'

    // Get or create user invoice config to store onboarding status
    const existingConfig = await prisma.userInvoiceConfig.findUnique({
      where: { userId }
    })

    const now = new Date()

    if (existingConfig) {
      // Update existing config
      await prisma.userInvoiceConfig.update({
        where: { userId },
        data: {
          onboardingSkippedAt: action === 'skipped' ? now : existingConfig.onboardingSkippedAt,
          onboardingCompletedAt: action === 'completed' ? now : existingConfig.onboardingCompletedAt,
          onboardingReminderSentAt: existingConfig.onboardingReminderSentAt
        }
      })
    } else {
      // Create minimal config to track onboarding
      await prisma.userInvoiceConfig.create({
        data: {
          userId,
          businessName: '',
          nif: '',
          address: '',
          city: '',
          postalCode: '',
          onboardingSkippedAt: action === 'skipped' ? now : null,
          onboardingCompletedAt: action === 'completed' ? now : null
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating onboarding status:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/gestion/onboarding-status
 * Get onboarding status for current user
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const config = await prisma.userInvoiceConfig.findUnique({
      where: { userId },
      select: {
        onboardingSkippedAt: true,
        onboardingCompletedAt: true,
        onboardingReminderSentAt: true,
        businessName: true,
        nif: true
      }
    })

    const isComplete = !!(config?.businessName && config?.nif)

    return NextResponse.json({
      skippedAt: config?.onboardingSkippedAt,
      completedAt: config?.onboardingCompletedAt,
      reminderSentAt: config?.onboardingReminderSentAt,
      isComplete
    })
  } catch (error) {
    console.error('Error getting onboarding status:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
