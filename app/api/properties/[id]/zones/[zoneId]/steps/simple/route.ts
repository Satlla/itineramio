import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../../../../src/lib/auth'

// GET /api/properties/[id]/zones/[zoneId]/steps/simple - Simplified steps endpoint
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  try {
    const { id: propertyId, zoneId } = await params

    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Set JWT claims for RLS policies
    try {
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead
    } catch (rslError) {
      console.error('🔍 SIMPLE - RLS config failed:', rslError)
    }

    // Check property ownership
    try {
      const property = await prisma.property.findFirst({
        where: {
          id: propertyId,
          hostId: userId
        }
      })

      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 })
      }
    } catch (propError) {
      console.error('🔍 SIMPLE - Property check failed:', propError)
      return NextResponse.json({ error: 'Property check failed' }, { status: 500 })
    }

    // Find zone
    try {
      const zone = await prisma.zone.findFirst({
        where: {
          id: zoneId,
          propertyId: propertyId
        }
      })

      if (!zone) {
        return NextResponse.json({ error: 'Zone not found' }, { status: 404 })
      }
    } catch (zoneError) {
      console.error('🔍 SIMPLE - Zone check failed:', zoneError)
      return NextResponse.json({ error: 'Zone check failed' }, { status: 500 })
    }

    // Get steps with direct raw SQL to bypass all potential issues
    try {
      const steps = await prisma.$queryRaw`
        SELECT 
          id, 
          "zoneId", 
          type, 
          title, 
          content,
          COALESCE("order", 0) as "order",
          "isPublished", 
          "createdAt", 
          "updatedAt"
        FROM steps
        WHERE "zoneId" = ${zoneId}
        ORDER BY COALESCE("order", 0) ASC, id ASC
      ` as any[]
      
      return NextResponse.json({
        success: true,
        data: steps,
        debug: { propertyId, zoneId, userId, count: steps.length }
      })
      
    } catch (stepsError) {
      console.error('🔍 SIMPLE - Steps query failed:', stepsError)
      return NextResponse.json({ 
        error: 'Steps query failed', 
        details: String(stepsError) 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('🔍 SIMPLE - General error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: String(error)
    }, { status: 500 })
  }
}