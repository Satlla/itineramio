import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAuth } from '../../../../src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Set JWT claims for PostgreSQL RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`

    // Get user's properties
    const properties = await prisma.property.findMany({
      where: { hostId: userId },
      include: {
        analytics: true,
        zones: {
          include: {
            analytics: true,
            ratings: true,
            _count: {
              select: {
                steps: true
              }
            }
          }
        }
      }
    })

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
      }

      // Process zones
      property.zones.forEach(zone => {
        if (zone.analytics) {
          totalZonesViewed += zone.analytics.totalViews
          totalTimeSavedMinutes += zone.analytics.timeSavedMinutes
        }

        // Process ratings
        zone.ratings.forEach(rating => {
          totalRatings++
          totalRatingSum += rating.overallRating
        })
      })
    })

    // Calculate average rating
    const avgRating = totalRatings > 0 ? totalRatingSum / totalRatings : 0

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentEvents = await prisma.trackingEvent.findMany({
      where: {
        propertyId: {
          in: properties.map(p => p.id)
        },
        timestamp: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10,
      include: {
        property: {
          select: {
            name: true
          }
        },
        zone: {
          select: {
            name: true
          }
        }
      }
    })

    // Get top performing properties
    const topProperties = properties
      .filter(p => p.analytics)
      .sort((a, b) => (b.analytics?.totalViews || 0) - (a.analytics?.totalViews || 0))
      .slice(0, 5)
      .map(property => ({
        id: property.id,
        name: property.name,
        views: property.analytics?.totalViews || 0,
        rating: property.analytics?.overallRating || 0,
        zonesCount: property.zones.length
      }))

    // Get monthly analytics for trends
    const monthlyStats = await prisma.trackingEvent.groupBy({
      by: ['propertyId'],
      where: {
        propertyId: {
          in: properties.map(p => p.id)
        },
        timestamp: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      }
    })

    const monthlyViews = monthlyStats.reduce((sum, stat) => sum + stat._count.id, 0)

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalProperties: properties.length,
          totalViews,
          activeManuals,
          avgRating: Math.round(avgRating * 10) / 10,
          zonesViewed: totalZonesViewed,
          timeSavedMinutes: totalTimeSavedMinutes,
          monthlyViews
        },
        topProperties,
        recentActivity: recentEvents.map(event => ({
          id: event.id,
          type: event.type,
          propertyName: typeof event.property.name === 'string' 
            ? event.property.name 
            : (event.property.name as any)?.es || (event.property.name as any)?.en || 'Property',
          zoneName: event.zone?.name ? 
            (typeof event.zone.name === 'string' 
              ? event.zone.name 
              : (event.zone.name as any)?.es || (event.zone.name as any)?.en || 'Zone')
            : null,
          timestamp: event.timestamp,
          metadata: event.metadata
        }))
      }
    })

  } catch (error) {
    console.error('Error fetching dashboard analytics:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}