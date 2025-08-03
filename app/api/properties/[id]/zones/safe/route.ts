import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../../src/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const propertyId = (await params).id

    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Set JWT claims for RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`

    // Verify user owns the property
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        hostId: userId
      },
      select: {
        id: true,
        name: true
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada o no autorizada' },
        { status: 404 }
      )
    }

    // Use raw SQL to get zones and step counts safely
    const zones = await prisma.$queryRaw`
      SELECT 
        z.id,
        z.name,
        z.slug,
        z.icon,
        z.description,
        z.color,
        z.status,
        z."isPublished",
        z."propertyId",
        z."createdAt",
        z."updatedAt",
        z."publishedAt",
        (
          SELECT COUNT(*)
          FROM steps s
          WHERE s."zoneId" = z.id
        ) as "stepsCount"
      FROM zones z
      WHERE z."propertyId" = ${propertyId}
      ORDER BY z.id ASC
    ` as any[]
    
    // Convert stepsCount from BigInt to number
    const transformedZones = zones.map(zone => ({
      ...zone,
      stepsCount: Number(zone.stepsCount) || 0
    }))
    
    console.log('🔍 Safe zones fetched:', transformedZones.length)
    
    return NextResponse.json({
      success: true,
      data: transformedZones
    })
  } catch (error) {
    console.error('Error fetching zones (safe):', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener las zonas',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}