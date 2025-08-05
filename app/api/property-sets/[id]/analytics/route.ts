import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../src/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertySetId } = await params
    
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    
    // Verify ownership of property set
    const propertySet = await prisma.propertySet.findFirst({
      where: {
        id: propertySetId,
        hostId: userId
      }
    })
    
    if (!propertySet) {
      return NextResponse.json({
        success: false,
        error: 'Conjunto no encontrado'
      }, { status: 404 })
    }
    
    // Get all properties in this set with their analytics
    const properties = await prisma.property.findMany({
      where: { propertySetId },
      include: {
        analytics: true,
        zones: {
          include: {
            analytics: true,
            ratings: true,
            _count: {
              select: {
                comments: true,
                errorReports: true,
                ratings: true
              }
            }
          }
        },
        _count: {
          select: {
            propertyViews: true,
            reviews: true,
            trackingEvents: true
          }
        }
      }
    })
    
    // Calculate aggregate metrics
    let totalViews = 0
    let totalZoneViews = 0
    let totalTimeSaved = 0
    let totalRatings = 0
    let totalRatingSum = 0
    let totalEvaluationsOmitted = 0
    let totalZones = 0
    let totalCompletions = 0
    
    for (const property of properties) {
      // Property views
      totalViews += property.analytics?.totalViews || 0
      totalViews += property._count.propertyViews
      
      // Process zones
      for (const zone of property.zones) {
        totalZones++
        
        if (zone.analytics) {
          totalZoneViews += zone.analytics.totalViews
          totalTimeSaved += zone.analytics.timeSavedMinutes
          totalCompletions += zone.analytics.totalCompletions
          
          // Ratings
          if (zone.analytics.totalRatings > 0) {
            totalRatingSum += zone.analytics.avgRating * zone.analytics.totalRatings
            totalRatings += zone.analytics.totalRatings
          }
        }
        
        // Count actual ratings from zone
        totalRatings += zone.ratings.length
        for (const rating of zone.ratings) {
          totalRatingSum += rating.overallRating
        }
        
        // Calculate omitted evaluations
        // People who viewed but didn't rate
        const zoneViewsWithoutRating = (zone.analytics?.totalViews || 0) - zone._count.ratings
        if (zoneViewsWithoutRating > 0) {
          totalEvaluationsOmitted += zoneViewsWithoutRating
        }
      }
    }
    
    // Calculate averages
    const avgRating = totalRatings > 0 ? totalRatingSum / totalRatings : 0
    const omissionRate = totalZoneViews > 0 ? (totalEvaluationsOmitted / totalZoneViews) * 100 : 0
    
    // Last 30 days metrics
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    // Get recent views
    const recentViews = await prisma.propertyView.count({
      where: {
        propertyId: { in: properties.map(p => p.id) },
        viewedAt: { gte: thirtyDaysAgo }
      }
    })
    
    // Get recent zone views
    const recentZoneViews = await prisma.zoneView.count({
      where: {
        propertyId: { in: properties.map(p => p.id) },
        viewedAt: { gte: thirtyDaysAgo }
      }
    })
    
    // Get explicitly skipped evaluations from tracking events
    const skippedEvaluations = await prisma.trackingEvent.count({
      where: {
        propertyId: { in: properties.map(p => p.id) },
        type: 'EVALUATION_SKIPPED'
      }
    })
    
    // Get recent skipped evaluations
    const recentSkippedEvaluations = await prisma.trackingEvent.count({
      where: {
        propertyId: { in: properties.map(p => p.id) },
        type: 'EVALUATION_SKIPPED',
        createdAt: { gte: thirtyDaysAgo }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        propertySetId,
        propertySetName: propertySet.name,
        metrics: {
          // Basic counts
          totalProperties: properties.length,
          totalZones,
          
          // Views
          totalViews,
          totalZoneViews,
          monthlyViews: recentViews,
          monthlyZoneViews: recentZoneViews,
          
          // Ratings
          avgRating: Math.round(avgRating * 10) / 10,
          totalRatings,
          
          // Time saved
          totalTimeSavedMinutes: totalTimeSaved,
          totalTimeSavedHours: Math.round(totalTimeSaved / 60),
          monthlyTimeSaved: Math.round(totalTimeSaved / 12),
          
          // User behavior
          totalEvaluationsOmitted,
          skippedEvaluations,
          recentSkippedEvaluations,
          omissionRate: Math.round(omissionRate),
          totalCompletions,
          
          // Calculated metrics
          avgViewsPerProperty: properties.length > 0 ? Math.round(totalViews / properties.length) : 0,
          avgTimeSavedPerProperty: properties.length > 0 ? Math.round(totalTimeSaved / properties.length) : 0,
          avgRatingPerProperty: properties.length > 0 ? Math.round((avgRating * 10) / properties.length) / 10 : 0
        },
        properties: properties.map(p => ({
          id: p.id,
          name: p.name,
          views: (p.analytics?.totalViews || 0) + p._count.propertyViews,
          zones: p.zones.length,
          avgRating: p.analytics?.overallRating || 0
        }))
      }
    })
    
  } catch (error) {
    console.error('Error fetching property set analytics:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener analytics'
    }, { status: 500 })
  }
}