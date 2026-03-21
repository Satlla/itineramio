import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAuth } from '../../../../src/lib/auth'
import { trialService } from '../../../../src/lib/trial-service'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Set JWT claims for PostgreSQL RLS policies
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead

    // Get user's properties with analytics and zones count in a SINGLE query
    let properties: any[] = []

    try {
      // Single query with _count to avoid N+1 problem
      const propsWithAnalytics = await prisma.property.findMany({
        where: { hostId: userId, deletedAt: null },
        include: {
          analytics: true,
          _count: {
            select: { zones: true }
          }
        }
      })

      // Map properties with zones array based on count
      properties = propsWithAnalytics.map(prop => ({
        ...prop,
        zones: Array(prop._count.zones).fill({ _count: { ratings: 0, steps: 0 } })
      }))
    } catch (error) {
      // Fallback to basic query
      const basicProps = await prisma.property.findMany({
        where: { hostId: userId, deletedAt: null }
      })
      properties = basicProps.map(p => ({
        ...p,
        analytics: null,
        zones: []
      }))
    }

    // Calculate aggregated stats
    let totalViews = 0
    let totalZonesViewed = 0
    let totalTimeSavedMinutes = 0
    let totalRatings = 0
    let totalRatingSum = 0
    let activeManuals = 0

    properties.forEach(property => {
      // Count active (published) properties as active manuals
      if (property.isPublished && property.status === 'ACTIVE') {
        activeManuals++
      }

      // Add property views
      if (property.analytics) {
        totalViews += property.analytics.totalViews
        // Add property rating to sum if available
        if (property.analytics.overallRating) {
          totalRatingSum += property.analytics.overallRating
          totalRatings += 1
        }
      }

      // Add zone views from property analytics
      if (property.analytics) {
        totalZonesViewed += property.analytics.zoneViews || 0
      }
    })

    // Calculate average rating from property analytics
    const avgRating = totalRatings > 0 ? totalRatingSum / totalRatings : 0

    // Calculate timeSavedMinutes from ZoneAnalytics
    const propertyIds = properties.map(p => p.id)
    if (propertyIds.length > 0) {
      const agg = await prisma.zoneAnalytics.aggregate({
        where: { zone: { propertyId: { in: propertyIds } } },
        _sum: { timeSavedMinutes: true }
      })
      totalTimeSavedMinutes = agg._sum.timeSavedMinutes || 0
    }

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get recent property views
    let recentActivity: any[] = []
    if (propertyIds.length > 0) {
      const recentViews = await prisma.propertyView.findMany({
        where: { propertyId: { in: propertyIds } },
        take: 5,
        orderBy: { viewedAt: 'desc' },
        include: { property: { select: { name: true } } }
      })
      recentActivity = recentViews.map(view => {
        const propertyName = typeof view.property.name === 'string'
          ? view.property.name
          : (view.property.name as any)?.es || (view.property.name as any)?.en || 'Property'
        return {
          type: 'property_view',
          propertyName,
          propertyId: view.propertyId,
          timestamp: view.viewedAt.toISOString(),
          visitorIp: view.visitorIp
        }
      })
    }

    // Get top performing properties (or all if less than 5)
    const topProperties = properties
      .sort((a, b) => (b.analytics?.totalViews || 0) - (a.analytics?.totalViews || 0))
      .slice(0, Math.min(5, properties.length))
      .map(property => ({
        id: property.id,
        name: typeof property.name === 'string' 
          ? property.name 
          : (property.name as any)?.es || (property.name as any)?.en || 'Property',
        views: property.analytics?.totalViews || 0,
        rating: property.analytics?.overallRating || 0,
        zonesCount: property.zones.length,
        city: typeof property.city === 'string'
          ? property.city
          : (property.city as any)?.es || (property.city as any)?.en || '',
        state: typeof property.state === 'string'
          ? property.state  
          : (property.state as any)?.es || (property.state as any)?.en || '',
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        maxGuests: property.maxGuests,
        status: property.status,
        totalViews: property.analytics?.totalViews || 0,
        profileImage: property.profileImage
      }))

    // Skip monthly stats for now
    const monthlyViews = 0

    // Get trial status
    const trialStatus = await trialService.getTrialStatus(userId)

    // Check if user has active subscription (not expired)
    const activeSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: {
          gte: new Date() // Not expired
        }
      }
    })

    const responseData = {
      stats: {
        totalProperties: properties.length,
        totalViews,
        activeManuals,
        avgRating: Math.round(avgRating * 10) / 10,
        zonesViewed: totalZonesViewed,
        timeSavedMinutes: totalTimeSavedMinutes,
        monthlyViews
      },
      trialStatus: {
        isActive: trialStatus.isActive,
        startedAt: trialStatus.startedAt?.toISOString() || null,
        endsAt: trialStatus.endsAt?.toISOString() || null,
        daysRemaining: trialStatus.daysRemaining,
        hasExpired: trialStatus.hasExpired
      },
      hasActiveSubscription: !!activeSubscription,
      topProperties,
      allProperties: properties.map(property => ({
        id: property.id,
        name: property.name || 'Property',
        slug: property.slug,
        description: property.description || '',
        type: property.type,
        city: property.city || '',
        state: property.state || '',
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        maxGuests: property.maxGuests,
        status: property.status,
        zonesCount: property.zones?.length || 0,
        totalViews: property.analytics?.totalViews || 0,
        avgRating: property.analytics?.overallRating || 0,
        profileImage: property.profileImage,
        propertySetId: property.propertySetId,
        createdAt: property.createdAt.toISOString(),
        updatedAt: property.updatedAt.toISOString()
      })),
      recentActivity
    }

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}