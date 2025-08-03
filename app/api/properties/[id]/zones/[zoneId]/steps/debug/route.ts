import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../../../../src/lib/auth'

// GET /api/properties/[id]/zones/[zoneId]/steps/debug - Debug steps loading
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  const debug: any = {}
  const errors: any[] = []
  
  try {
    debug.step = 'Getting params'
    const { id: propertyId, zoneId } = await params
    debug.propertyId = propertyId
    debug.zoneId = zoneId

    // Check authentication
    debug.step = 'Checking authentication'
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      errors.push({ step: 'auth', error: 'Authentication failed' })
      return NextResponse.json({ debug, errors }, { status: 401 })
    }
    const userId = authResult.userId
    debug.userId = userId

    // Set JWT claims for RLS policies
    debug.step = 'Setting JWT claims'
    try {
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`
      debug.jwtClaimsSet = true
    } catch (rslError) {
      errors.push({ step: 'jwt_claims', error: rslError })
      debug.jwtClaimsError = String(rslError)
    }

    // Verify user owns the property
    debug.step = 'Checking property ownership'
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        hostId: userId
      }
    })
    debug.propertyFound = !!property

    if (!property) {
      errors.push({ step: 'property_check', error: 'Property not found or not authorized' })
      return NextResponse.json({ debug, errors }, { status: 404 })
    }

    // Find zone using startsWith due to Next.js truncating long IDs
    debug.step = 'Finding zone'
    const zones = await prisma.zone.findMany({
      where: {
        id: {
          startsWith: zoneId
        },
        propertyId: propertyId
      }
    })
    
    debug.zonesFound = zones.length
    debug.zoneIds = zones.map(z => z.id)
    const zone = zones[0]
    const actualZoneId = zone?.id || zoneId
    debug.actualZoneId = actualZoneId

    if (!zone) {
      errors.push({ step: 'zone_check', error: 'Zone not found' })
      return NextResponse.json({ debug, errors }, { status: 404 })
    }

    // Try to get steps using Prisma query first
    debug.step = 'Fetching steps with Prisma'
    let steps
    try {
      steps = await prisma.step.findMany({
        where: {
          zoneId: actualZoneId
        },
        orderBy: [
          { order: 'asc' },
          { id: 'asc' }
        ]
      })
      debug.prismaStepsCount = steps.length
      debug.prismaSteps = steps.map(s => ({
        id: s.id,
        type: s.type,
        title: s.title,
        hasContent: !!s.content,
        order: s.order,
        isPublished: s.isPublished
      }))
    } catch (prismaError) {
      errors.push({ step: 'prisma_query', error: String(prismaError) })
      debug.prismaError = String(prismaError)
      
      // Fallback to raw SQL if Prisma fails
      debug.step = 'Trying raw SQL fallback'
      try {
        steps = await prisma.$queryRaw`
          SELECT 
            id, 
            "zoneId", 
            type, 
            title, 
            content,
            "isPublished", 
            "createdAt", 
            "updatedAt",
            COALESCE("order", 0) as "order"
          FROM steps
          WHERE "zoneId" = ${actualZoneId}
          ORDER BY COALESCE("order", 0) ASC, id ASC
        ` as any[]
        debug.rawSqlStepsCount = steps.length
        debug.rawSqlSteps = steps.map((s: any) => ({
          id: s.id,
          type: s.type,
          title: s.title,
          hasContent: !!s.content,
          order: s.order,
          isPublished: s.isPublished
        }))
      } catch (rawSqlError) {
        errors.push({ step: 'raw_sql', error: String(rawSqlError) })
        debug.rawSqlError = String(rawSqlError)
      }
    }

    // Test direct raw query to check if steps exist at all
    debug.step = 'Testing direct steps query'
    try {
      const directSteps = await prisma.$queryRaw`
        SELECT id, "zoneId", type, title
        FROM steps
        WHERE "zoneId" = ${actualZoneId}
        LIMIT 5
      ` as any[]
      debug.directStepsCount = directSteps.length
      debug.directSteps = directSteps
    } catch (directError) {
      errors.push({ step: 'direct_query', error: String(directError) })
      debug.directError = String(directError)
    }

    // Check if there are ANY steps for this zone (without filters)
    debug.step = 'Checking all steps for zone'
    try {
      const allSteps = await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM steps
        WHERE "zoneId" = ${actualZoneId}
      ` as any[]
      debug.totalStepsCount = allSteps[0]?.count || 0
    } catch (countError) {
      errors.push({ step: 'count_query', error: String(countError) })
      debug.countError = String(countError)
    }

    return NextResponse.json({
      success: errors.length === 0,
      debug,
      errors,
      message: 'Steps debug endpoint'
    }, { status: 200 })

  } catch (error) {
    errors.push({ 
      step: debug.step || 'unknown', 
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json({
      success: false,
      debug,
      errors,
      message: 'Debug endpoint - error occurred'
    }, { status: 500 })
  }
}