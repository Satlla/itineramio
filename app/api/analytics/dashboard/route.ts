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

    // Get user's properties with simple query
    const properties = await prisma.property.findMany({
      where: { hostId: userId },
      include: {
        analytics: true,
        zones: {
          include: {
            analytics: true,
            _count: {
              select: {
                ratings: true,
                steps: true
              }
            }
          }
        }
      }
    })

    console.log('🏠 Properties found for user:', userId, 'count:', properties.length)
    if (properties.length > 0) {
      console.log('🏠 First property:', {
        id: properties[0].id,
        name: properties[0].name,
        type: properties[0].type,
        status: properties[0].status
      })
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
      }

      // Process zones
      property.zones.forEach(zone => {
        if (zone.analytics) {
          totalZonesViewed += zone.analytics.totalViews
          totalTimeSavedMinutes += zone.analytics.timeSavedMinutes
        }

        // Add ratings count
        if (zone._count?.ratings) {
          totalRatings += zone._count.ratings
        }
        
        // Add average rating from analytics
        if (zone.analytics?.avgRating && zone.analytics.totalRatings > 0) {
          totalRatingSum += zone.analytics.avgRating * zone.analytics.totalRatings
        }
      })
    })

    // Calculate average rating
    const avgRating = totalRatings > 0 ? totalRatingSum / totalRatings : 0

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Skip recent events for now to avoid complexity
    const recentEvents: any[] = []

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
      recentActivity: []
    }

    console.log('📊 Sending response with allProperties count:', responseData.allProperties.length)

    return NextResponse.json({
      success: true,
      data: responseData
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