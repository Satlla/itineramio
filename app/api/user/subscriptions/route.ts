import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const authResult = await verifyToken(request)
    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const userId = authResult.user.id

    // Get active subscriptions with related data
    const subscriptions = await prisma.userSubscription.findMany({
      where: {
        userId: userId,
        status: {
          in: ['ACTIVE', 'EXPIRED', 'EXPIRING_SOON']
        }
      },
      include: {
        plan: {
          select: {
            name: true,
            priceMonthly: true,
            maxProperties: true,
            features: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    // Get current property count for this user
    const propertyCount = await prisma.property.count({
      where: {
        hostId: userId
      }
    })

    // Calculate subscription status and days until expiration
    const now = new Date()
    const subscriptionsWithStatus = subscriptions.map(sub => {
      const endDate = new Date(sub.endDate)
      const daysUntilExpiration = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      let status = sub.status
      if (status === 'ACTIVE') {
        if (daysUntilExpiration <= 0) {
          status = 'EXPIRED'
        } else if (daysUntilExpiration <= 7) {
          status = 'EXPIRING_SOON'
        }
      }

      return {
        ...sub,
        status,
        daysUntilExpiration,
        plan: sub.plan ? {
          ...sub.plan,
          priceMonthly: Number(sub.plan.priceMonthly)
        } : null
      }
    })

    // Get user's current plan info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscription: true,
        subscriptionStatus: true
      }
    })

    return NextResponse.json({
      subscriptions: subscriptionsWithStatus,
      propertyCount,
      currentPlan: user?.subscription || 'FREE',
      planStatus: user?.subscriptionStatus || 'ACTIVE'
    })

  } catch (error) {
    console.error('Error fetching user subscriptions:', error)
    return NextResponse.json(
      { error: 'Error al obtener las suscripciones' },
      { status: 500 }
    )
  }
}