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
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30d'
    
    // Calculate date range
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get user's properties with analytics
    const properties = await prisma.property.findMany({
      where: { hostId: userId },
      include: {
        analytics: true,
        zones: {
          include: {
            analytics: true,
            ratings: {
              where: {
                createdAt: {
                  gte: startDate
                }
              }
            },
            _count: {
              select: {
                steps: true
              }
            }
          }
        },
        trackingEvents: {
          where: {
            timestamp: {
              gte: startDate
            }
          }
        }
      }
    })

    // Process properties data
    const processedProperties = properties.map(property => {
      const zones = property.zones
      let totalViews = 0
      let totalTimeSpent = 0
      let totalCompletions = 0
      let totalTimeSaved = 0
      let totalRatings = 0
      let ratingSum = 0

      zones.forEach(zone => {
        if (zone.analytics) {
          totalViews += zone.analytics.totalViews
          totalTimeSpent += zone.analytics.avgTimeSpent * zone.analytics.totalViews
          totalCompletions += zone.analytics.totalCompletions
          totalTimeSaved += zone.analytics.timeSavedMinutes
        }

        zone.ratings.forEach(rating => {
          totalRatings++
          ratingSum += rating.overallRating
        })
      })

      const avgTimeSpent = totalViews > 0 ? totalTimeSpent / totalViews : 0
      const completionRate = totalViews > 0 ? (totalCompletions / totalViews) * 100 : 0
      const avgRating = totalRatings > 0 ? ratingSum / totalRatings : 0

      // Get top zones by views
      const topZones = zones
        .filter(z => z.analytics)
        .sort((a, b) => (b.analytics?.totalViews || 0) - (a.analytics?.totalViews || 0))
        .slice(0, 5)
        .map(zone => ({
          name: typeof zone.name === 'string' 
            ? zone.name 
            : (zone.name as any)?.es || (zone.name as any)?.en || 'Zone',
          views: zone.analytics?.totalViews || 0,
          avgTimeSpent: zone.analytics?.avgTimeSpent || 0,
          completionRate: zone.analytics?.completionRate || 0
        }))

      return {
        id: property.id,
        name: typeof property.name === 'string' 
          ? property.name 
          : (property.name as any)?.es || (property.name as any)?.en || 'Property',
        views: totalViews,
        avgTimeSpent,
        completionRate,
        avgRating,
        timeSavedMinutes: totalTimeSaved,
        zonesCount: zones.length,
        topZones
      }
    })

    // Calculate totals
    const totals = processedProperties.reduce((acc, property) => ({
      totalViews: acc.totalViews + property.views,
      totalTimeSaved: acc.totalTimeSaved + property.timeSavedMinutes,
      avgCompletionRate: acc.avgCompletionRate + property.completionRate,
      avgRating: acc.avgRating + property.avgRating
    }), { totalViews: 0, totalTimeSaved: 0, avgCompletionRate: 0, avgRating: 0 })

    if (processedProperties.length > 0) {
      totals.avgCompletionRate = totals.avgCompletionRate / processedProperties.length
      totals.avgRating = totals.avgRating / processedProperties.length
    }

    // Get trends data (daily aggregation)
    const trends = await prisma.trackingEvent.groupBy({
      by: ['timestamp'],
      where: {
        propertyId: {
          in: properties.map(p => p.id)
        },
        timestamp: {
          gte: startDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        timestamp: 'asc'
      }
    })

    // Group trends by date
    const trendsByDate = new Map<string, { views: number, completions: number }>()
    
    trends.forEach(trend => {
      const date = trend.timestamp.toISOString().split('T')[0]
      if (!trendsByDate.has(date)) {
        trendsByDate.set(date, { views: 0, completions: 0 })
      }
      const existing = trendsByDate.get(date)!
      existing.views += trend._count.id
    })

    // Get completion events
    const completionEvents = await prisma.trackingEvent.groupBy({
      by: ['timestamp'],
      where: {
        propertyId: {
          in: properties.map(p => p.id)
        },
        type: 'ZONE_COMPLETED',
        timestamp: {
          gte: startDate
        }
      },
      _count: {
        id: true
      }
    })

    completionEvents.forEach(event => {
      const date = event.timestamp.toISOString().split('T')[0]
      if (trendsByDate.has(date)) {
        trendsByDate.get(date)!.completions += event._count.id
      }
    })

    const trendsArray = Array.from(trendsByDate.entries()).map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      views: data.views,
      completions: data.completions
    }))

    return NextResponse.json({
      success: true,
      data: {
        properties: processedProperties.sort((a, b) => b.views - a.views),
        totals,
        trends: trendsArray
      }
    })

  } catch (error) {
    console.error('Error fetching detailed analytics:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}