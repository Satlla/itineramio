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
    
    // Transform data with real counts using raw SQL to avoid schema issues
    const transformedPropertySets = await Promise.all(propertySets.map(async (propertySet) => {
      try {
        // Get properties count for this property set using raw SQL
        const propertiesCount = await prisma.$queryRaw`
          SELECT COUNT(*)::integer as count
          FROM properties
          WHERE "propertySetId" = ${propertySet.id}
        ` as any[]
        
        console.log(`PropertySet ${propertySet.id} - ${propertySet.name}: ${propertiesCount[0]?.count} properties`)
        
        // Get total zones count for all properties in this set using raw SQL
        const totalZones = await prisma.$queryRaw`
          SELECT COUNT(*)::integer as count
          FROM zones z
          INNER JOIN properties p ON z."propertyId" = p.id
          WHERE p."propertySetId" = ${propertySet.id}
        ` as any[]
        
        // Get views from property_views table (more reliable)
        const propertyViews = await prisma.$queryRaw`
          SELECT COUNT(DISTINCT pv.id)::integer as view_count
          FROM properties p
          LEFT JOIN property_views pv ON p.id = pv."propertyId"
          WHERE p."propertySetId" = ${propertySet.id}
        ` as any[]
        
        // Get zone views (if table exists)
        let zoneViewsCount = 0
        try {
          const zoneViews = await prisma.$queryRaw`
            SELECT COUNT(DISTINCT zv.id)::integer as zone_view_count
            FROM properties p
            INNER JOIN zones z ON p.id = z."propertyId"
            LEFT JOIN zone_views zv ON z.id = zv."zoneId"
            WHERE p."propertySetId" = ${propertySet.id}
          ` as any[]
          zoneViewsCount = zoneViews[0]?.zone_view_count || 0
        } catch (zoneError) {
          console.log('Zone views table might not exist:', zoneError)
          zoneViewsCount = 0
        }
        
        // Get basic property analytics
        let analyticsData = { total_views: 0, avg_rating: 0 }
        try {
          const analytics = await prisma.$queryRaw`
            SELECT 
              COALESCE(SUM(pa."totalViews"), 0)::integer as total_views,
              COALESCE(AVG(pa."overallRating"), 0) as avg_rating
            FROM properties p
            LEFT JOIN property_analytics pa ON p.id = pa."propertyId"
            WHERE p."propertySetId" = ${propertySet.id}
          ` as any[]
          analyticsData = analytics[0] || analyticsData
        } catch (analyticsError) {
          console.log('Property analytics table might not exist:', analyticsError)
        }
        
        // Convert values properly - they should now be integers from the cast
        const propCount = propertiesCount[0]?.count || 0
        const zoneCount = totalZones[0]?.count || 0
        const viewCount = propertyViews[0]?.view_count || 0
        
        // Calculate total views (property views + zone views + analytics views)
        const totalViews = viewCount + zoneViewsCount + (analyticsData.total_views || 0)
        
        console.log(`PropertySet ${propertySet.id} metrics:`, {
          propertiesCount: propCount,
          totalZones: zoneCount,
          propertyViews: viewCount,
          zoneViews: zoneViewsCount,
          analyticsViews: analyticsData.total_views,
          totalViews: totalViews
        })
        
        return {
          ...propertySet,
          propertiesCount: Number(propCount),
          totalViews: totalViews,
          avgRating: parseFloat(String(analyticsData.avg_rating || 0)),
          totalZones: Number(zoneCount),
          timeSavedMinutes: 0 // Simplified for now
        }
      } catch (error) {
        console.error('Error transforming property set:', propertySet.id, error)
        // Return with zero counts if there's an error
        return {
          ...propertySet,
          propertiesCount: 0,
          totalViews: 0,
          avgRating: 0,
          totalZones: 0
        }
      }
    }))
    
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