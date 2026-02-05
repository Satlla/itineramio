import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { requireAuth } from '../../../src/lib/auth'

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
    
    const propertySets = await prisma.propertySet.findMany({
      where: {
        hostId: userId
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        city: true,
        state: true,
        country: true,
        profileImage: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        id: 'desc'
      }
    })

    // Early return if no property sets
    if (propertySets.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // Get all property set IDs for batch queries
    const propertySetIds = propertySets.map(ps => ps.id)

    // BATCH QUERIES: All data in PARALLEL (avoids N+1 problem)
    const [propertyCounts, zoneCounts, viewsData, analyticsData] = await Promise.all([
      // 1. Properties count per set
      prisma.$queryRaw`
        SELECT "propertySetId", COUNT(*)::integer as count
        FROM properties
        WHERE "propertySetId" = ANY(${propertySetIds})
        GROUP BY "propertySetId"
      ` as Promise<Array<{ propertySetId: string; count: number }>>,

      // 2. Zones count per set
      prisma.$queryRaw`
        SELECT p."propertySetId", COUNT(DISTINCT z.id)::integer as count
        FROM properties p
        INNER JOIN zones z ON z."propertyId" = p.id
        WHERE p."propertySetId" = ANY(${propertySetIds})
        GROUP BY p."propertySetId"
      ` as Promise<Array<{ propertySetId: string; count: number }>>,

      // 3. Views per set (property_views + zone_views combined)
      prisma.$queryRaw`
        SELECT
          p."propertySetId",
          COUNT(DISTINCT pv.id)::integer as property_views,
          COUNT(DISTINCT zv.id)::integer as zone_views
        FROM properties p
        LEFT JOIN property_views pv ON pv."propertyId" = p.id
        LEFT JOIN zones z ON z."propertyId" = p.id
        LEFT JOIN zone_views zv ON zv."zoneId" = z.id
        WHERE p."propertySetId" = ANY(${propertySetIds})
        GROUP BY p."propertySetId"
      ` as Promise<Array<{ propertySetId: string; property_views: number; zone_views: number }>>,

      // 4. Analytics per set
      prisma.$queryRaw`
        SELECT
          p."propertySetId",
          COALESCE(SUM(pa."totalViews"), 0)::integer as total_views,
          COALESCE(AVG(pa."overallRating"), 0) as avg_rating
        FROM properties p
        LEFT JOIN property_analytics pa ON pa."propertyId" = p.id
        WHERE p."propertySetId" = ANY(${propertySetIds})
        GROUP BY p."propertySetId"
      ` as Promise<Array<{ propertySetId: string; total_views: number; avg_rating: number }>>
    ])

    // Create lookup maps for O(1) access
    const propertyCountMap = new Map(propertyCounts.map(p => [p.propertySetId, p.count]))
    const zoneCountMap = new Map(zoneCounts.map(z => [z.propertySetId, z.count]))
    const viewsMap = new Map(viewsData.map(v => [v.propertySetId, { propertyViews: v.property_views, zoneViews: v.zone_views }]))
    const analyticsMap = new Map(analyticsData.map(a => [a.propertySetId, { totalViews: a.total_views, avgRating: a.avg_rating }]))

    // Transform data using lookup maps (no async needed)
    const transformedPropertySets = propertySets.map(propertySet => {
      const propCount = propertyCountMap.get(propertySet.id) || 0
      const zoneCount = zoneCountMap.get(propertySet.id) || 0
      const views = viewsMap.get(propertySet.id) || { propertyViews: 0, zoneViews: 0 }
      const analytics = analyticsMap.get(propertySet.id) || { totalViews: 0, avgRating: 0 }

      const totalViews = views.propertyViews + views.zoneViews + analytics.totalViews

      return {
        ...propertySet,
        propertiesCount: propCount,
        totalViews: totalViews,
        avgRating: parseFloat(String(analytics.avgRating || 0)),
        totalZones: zoneCount,
        timeSavedMinutes: 0
      }
    })
    
    return NextResponse.json({
      success: true,
      data: transformedPropertySets
    })
    
  } catch (error) {
    console.error('Error fetching property sets:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    
    console.log('🔍 Creating property set for user:', userId)
    console.log('🔍 Property set data:', { name: body.name, type: body.type, city: body.city })
    
    // Create the property set
    const propertySet = await prisma.propertySet.create({
      data: {
        // Basic info
        name: body.name,
        description: body.description,
        type: body.type,
        
        // Address
        street: body.street,
        city: body.city,
        state: body.state,
        country: body.country,
        postalCode: body.postalCode,
        
        // Images
        profileImage: body.profileImage,
        
        // Host contact
        hostContactName: body.hostContactName,
        hostContactPhone: body.hostContactPhone,
        hostContactEmail: body.hostContactEmail,
        hostContactLanguage: body.hostContactLanguage,
        hostContactPhoto: body.hostContactPhoto,
        
        // Owner
        hostId: userId,
        
        // Status
        status: 'DRAFT'
      }
    })
    
    console.log('🔍 Property set created:', { id: propertySet.id, name: propertySet.name, hostId: propertySet.hostId })
    
    // If properties are selected, update them to belong to this set
    if (body.selectedProperties && body.selectedProperties.length > 0) {
      await prisma.property.updateMany({
        where: {
          id: { in: body.selectedProperties },
          hostId: userId // Security: only update user's own properties
        },
        data: {
          propertySetId: propertySet.id
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      data: propertySet
    })
    
  } catch (error) {
    console.error('Error creating property set:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}