import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 })
    }

    const decoded = verifyToken(token)

    // Get all data in PARALLEL (3 queries at once instead of sequential)
    const [user, activeSubscription, propertiesCount] = await Promise.all([
      // Get user data including trial information
      prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          trialStartedAt: true,
          trialEndsAt: true,
          subscription: true
        }
      }),
      // Check if user has active subscription
      prisma.userSubscription.count({
        where: {
          userId: decoded.userId,
          status: 'ACTIVE'
        }
      }),
      // Count active properties
      prisma.property.count({
        where: {
          hostId: decoded.userId,
          status: 'ACTIVE'
        }
      })
    ])

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
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

    // Calculate plan info
    let currentPlan = ''
    let monthlyFee = 0

    if (propertiesCount > 1) {
      const additionalProperties = propertiesCount - 1
      // Check if user has 10+ properties for Business plan
      if (propertiesCount >= 10) {
        currentPlan = 'Business'
        monthlyFee = (propertiesCount - 1) * 2 // €2/property for additional ones
      } else {
        currentPlan = 'HOST'
        monthlyFee = additionalProperties * 2.5 // €2.50/property for additional ones
      }
    }

    // Get next billing date (first day of next month)
    const now = new Date()
    const nextBillingDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    return NextResponse.json({
      currentPlan,
      propertiesCount,
      monthlyFee,
      nextBillingDate: nextBillingDate.toISOString(),
      planDescription: getPlanDescription(currentPlan, propertiesCount),
      trialStatus,
      hasActiveSubscription
    })
  } catch (error) {
    console.error('Error fetching plan info:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getPlanDescription(plan: string, count: number) {
  switch (plan) {
    case '':
      return 'Sin plan activo'
    case 'HOST':
      return `${count} propiedades (1 gratuita + ${count - 1} adicionales)`
    case 'Business':
      return `${count} propiedades con descuento por volumen`
    default:
      return ''
  }
}