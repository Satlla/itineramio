import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAuthOrAdmin } from '../../../../../../src/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const propertyId = (await params).id

    // Check authentication (allows admin bypass)
    const authResult = await requireAuthOrAdmin(request)
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

    // Use raw SQL to get zones safely
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
        z."publishedAt"
      FROM zones z
      WHERE z."propertyId" = ${propertyId}
      ORDER BY z.id ASC
    ` as any[]
    
    // Get steps for each zone using raw SQL
    const zonesWithSteps = await Promise.all(
      zones.map(async (zone: any) => {
        const steps = await prisma.$queryRaw`
          SELECT 
            id, "zoneId", type, title, content, "order",
            "isPublished", "createdAt", "updatedAt"
          FROM steps
          WHERE "zoneId" = ${zone.id}
          ORDER BY "order" ASC
        ` as any[]
        
        return {
          ...zone,
          steps: steps,
          stepsCount: steps.length
        }
      })
    )
    
    console.log('🔍 Safe zones fetched:', zonesWithSteps.length)
    
    return NextResponse.json({
      success: true,
      data: zonesWithSteps
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