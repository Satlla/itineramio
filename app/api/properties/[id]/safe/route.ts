import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../src/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🔍 Safe Property endpoint - received ID:', id)
    
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    
    // Set JWT claims for PostgreSQL RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`
    
    // Use raw SQL to avoid Prisma trying to fetch non-existent columns
    const properties = await prisma.$queryRaw`
      SELECT 
        id, name, slug, description, type,
        street, city, state, country, "postalCode",
        bedrooms, bathrooms, "maxGuests", "squareMeters",
        "profileImage", "hostContactName", "hostContactPhone",
        "hostContactEmail", "hostContactLanguage", "hostContactPhoto",
        status, "isPublished", "propertySetId", "hostId",
        "createdAt", "updatedAt", "publishedAt"
      FROM properties
      WHERE id LIKE ${id + '%'}
        AND "hostId" = ${userId}
      LIMIT 1
    ` as any[]
    
    const property = properties[0]
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada'
      }, { status: 404 })
    }
    
    // Get zones safely
    const zones = await prisma.$queryRaw`
      SELECT 
        id, name, slug, icon, description, color,
        status, "isPublished", "propertyId",
        "createdAt", "updatedAt", "publishedAt",
        (SELECT COUNT(*) FROM steps WHERE steps."zoneId" = zones.id) as "stepsCount"
      FROM zones
      WHERE "propertyId" = ${property.id}
      ORDER BY id ASC
    ` as any[]
    
    // Get analytics safely
    const analyticsResult = await prisma.$queryRaw`
      SELECT "totalViews", "overallRating"
      FROM property_analytics
      WHERE "propertyId" = ${property.id}
      LIMIT 1
    ` as any[]
    
    const analytics = analyticsResult[0] || { totalViews: 0, overallRating: 0 }
    
    // Transform data
    const transformedProperty = {
      ...property,
      zonesCount: zones.length,
      totalViews: analytics.totalViews || 0,
      avgRating: analytics.overallRating || 0,
      zones: zones.map((zone: any) => ({
        ...zone,
        stepsCount: Number(zone.stepsCount) || 0
      }))
    }
    
    return NextResponse.json({
      success: true,
      data: transformedProperty
    })
    
  } catch (error) {
    console.error('Error fetching property (safe):', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}