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

    // Get user's properties
    const properties = await prisma.property.findMany({
      where: {
        hostId: userId
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get user's active subscriptions
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
            maxProperties: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    // Calculate property subscription coverage
    const now = new Date()
    let coveredProperties = 0
    let activeSubscriptionSlots = 0

    // Calculate total available slots from active subscriptions
    subscriptions.forEach(sub => {
      const endDate = new Date(sub.endDate)
      if (endDate > now && sub.status === 'ACTIVE') {
        activeSubscriptionSlots += sub.plan?.maxProperties || 0
      }
    })

    // Determine which properties are covered
    const propertiesWithStatus = properties.map((property, index) => {
      const isCovered = index < activeSubscriptionSlots
      if (isCovered) coveredProperties++

      // Find the subscription covering this property
      let coveringSubscription = null
      if (isCovered) {
        let currentSlot = 0
        for (const sub of subscriptions) {
          const endDate = new Date(sub.endDate)
          if (endDate > now && sub.status === 'ACTIVE') {
            const slotsInThisSub = sub.plan?.maxProperties || 0
            if (index >= currentSlot && index < currentSlot + slotsInThisSub) {
              const daysUntilExpiration = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
              coveringSubscription = {
                id: sub.id,
                planName: sub.plan?.name || 'Plan personalizado',
                endDate: sub.endDate,
                daysUntilExpiration,
                status: daysUntilExpiration <= 7 ? 'EXPIRING_SOON' : 'ACTIVE'
              }
              break
            }
            currentSlot += slotsInThisSub
          }
        }
      }

      return {
        ...property,
        isCovered,
        coveringSubscription,
        needsSubscription: !isCovered
      }
    })

    // Get plan limits and usage stats
    const currentPlanLimits = {
      freeLimit: 1, // Free plan allows 1 property
      usedSlots: coveredProperties,
      availableSlots: activeSubscriptionSlots,
      totalProperties: properties.length,
      uncoveredProperties: Math.max(0, properties.length - activeSubscriptionSlots)
    }

    return NextResponse.json({
      properties: propertiesWithStatus,
      subscriptions: subscriptions.map(sub => ({
        ...sub,
        plan: sub.plan ? {
          ...sub.plan,
          maxProperties: Number(sub.plan.maxProperties)
        } : null
      })),
      usage: currentPlanLimits,
      summary: {
        totalProperties: properties.length,
        coveredProperties,
        uncoveredProperties: properties.length - coveredProperties,
        activeSubscriptions: subscriptions.filter(sub => {
          const endDate = new Date(sub.endDate)
          return endDate > now && sub.status === 'ACTIVE'
        }).length
      }
    })

  } catch (error) {
    console.error('Error fetching properties subscription status:', error)
    return NextResponse.json(
      { error: 'Error al obtener el estado de las propiedades' },
      { status: 500 }
    )
  }
}