import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'

/**
 * Fallback: attempt to claim a demo property if it wasn't transferred during email verification.
 * Returns the propertyId if transfer was successful, null otherwise.
 */
async function tryClaimDemoProperty(userId: string, userEmail: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPreferences: true }
    })
    const prefs = (user?.notificationPreferences as Record<string, unknown>) || {}
    let propertyId = prefs.demoPropertyId as string | undefined

    if (!propertyId) {
      const lead = await prisma.lead.findFirst({
        where: { email: userEmail, source: 'demo' },
        orderBy: { createdAt: 'desc' },
        select: { metadata: true }
      })
      const leadMeta = (lead?.metadata as Record<string, unknown>) || {}
      propertyId = leadMeta.propertyId as string | undefined
    }

    if (!propertyId) return null

    const property = await prisma.property.findFirst({
      where: { id: propertyId, isDemoPreview: true }
    })
    if (!property) return null

    await prisma.property.update({
      where: { id: propertyId },
      data: { hostId: userId, isDemoPreview: false, demoExpiresAt: null, status: 'DRAFT' }
    })

    if (prefs.demoPropertyId) {
      const { demoPropertyId: _, ...cleanPrefs } = prefs
      await prisma.user.update({
        where: { id: userId },
        data: { notificationPreferences: cleanPrefs as Record<string, unknown> as any }
      })
    }

    console.log(`[dashboard/init] Fallback: transferred property ${propertyId} to user ${userId}`)
    return propertyId
  } catch (error) {
    console.error('[dashboard/init] Fallback claim error:', error)
    return null
  }
}

/**
 * GET /api/dashboard/init
 * Consolidated endpoint that returns subscription status + trial info + unread notification count
 * in a single request (replaces 2 separate calls from dashboard layout)
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 })
    }

    const decoded = verifyToken(token)

    // Run ALL queries in parallel
    const [user, activeSubscription, propertiesCount, unreadNotificationCount, subscriptionNotification] = await Promise.all([
      prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          trialStartedAt: true,
          trialEndsAt: true,
          subscription: true,
          notificationPreferences: true
        }
      }),
      prisma.userSubscription.count({
        where: {
          userId: decoded.userId,
          status: 'ACTIVE'
        }
      }),
      prisma.property.count({
        where: {
          hostId: decoded.userId,
          status: 'ACTIVE'
        }
      }),
      prisma.notification.count({
        where: {
          userId: decoded.userId,
          read: false
        }
      }),
      prisma.notification.findFirst({
        where: {
          userId: decoded.userId,
          type: 'subscription_approved',
          read: false
        },
        orderBy: { createdAt: 'desc' }
      })
    ])

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fallback: check if there's a pending demo property to claim
    const prefs = (user.notificationPreferences as Record<string, unknown>) || {}
    let demoClaimedPropertyId: string | null = null
    if (prefs.demoPropertyId) {
      demoClaimedPropertyId = await tryClaimDemoProperty(user.id, user.email)
    }

    const hasActiveSubscription = activeSubscription > 0

    // Calculate trial status
    let trialStatus = null
    if (user.trialStartedAt && user.trialEndsAt) {
      const now = new Date()
      const endsAt = new Date(user.trialEndsAt)
      const startedAt = new Date(user.trialStartedAt)
      const timeRemaining = endsAt.getTime() - now.getTime()
      const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)))
      const hasExpired = timeRemaining <= 0

      trialStatus = {
        isActive: !hasExpired && !hasActiveSubscription,
        startedAt: startedAt.toISOString(),
        endsAt: endsAt.toISOString(),
        daysRemaining,
        hasExpired
      }
    }

    return NextResponse.json({
      trialStatus,
      hasActiveSubscription,
      unreadNotificationCount,
      subscriptionNotification: subscriptionNotification || null,
      ...(demoClaimedPropertyId && { demoClaimedPropertyId })
    })
  } catch (error) {
    console.error('Error fetching dashboard init:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
