import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAuthOrAdmin } from '../../../../../src/lib/auth'

// GET /api/properties/[id]/zones - Get all zones for a property
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
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead

    // Verify user owns the property
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        hostId: userId
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada o no autorizada' },
        { status: 404 }
      )
    }

    // Use raw SQL to avoid schema issues
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
        z."order",
        z."createdAt",
        z."updatedAt",
        z."publishedAt"
      FROM zones z
      WHERE z."propertyId" = ${propertyId}
      ORDER BY COALESCE(z."order", 0) ASC, z.id ASC
    ` as any[]

    // Get ALL steps for ALL zones in a SINGLE query (avoids N+1)
    const zoneIds = zones.map((z: any) => z.id)

    let allSteps: any[] = []
    if (zoneIds.length > 0) {
      allSteps = await prisma.$queryRaw`
        SELECT
          id, "zoneId", type, title, content, COALESCE("order", 0) as "order",
          "isPublished", "createdAt", "updatedAt"
        FROM steps
        WHERE "zoneId" = ANY(${zoneIds})
        ORDER BY COALESCE("order", 0) ASC, id ASC
      ` as any[]
    }

    // Group steps by zoneId in memory (fast)
    const stepsByZoneId = new Map<string, any[]>()
    for (const step of allSteps) {
      const zoneSteps = stepsByZoneId.get(step.zoneId) || []
      zoneSteps.push(step)
      stepsByZoneId.set(step.zoneId, zoneSteps)
    }

    // Combine zones with their steps
    const zonesWithSteps = zones.map((zone: any) => ({
      ...zone,
      steps: stepsByZoneId.get(zone.id) || []
    }))

    console.log('🔍 Zones fetched:', zonesWithSteps.length, '| Steps fetched:', allSteps.length)
    
    return NextResponse.json({
      success: true,
      data: zonesWithSteps
    })
  } catch (error) {
    console.error('Error fetching zones:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener las zonas' 
      },
      { status: 500 }
    )
  }
}

// POST /api/properties/[id]/zones - FORCE REDIRECT TO BATCH API
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const propertyId = (await params).id
    const body = await request.json()
    
    console.log('🔴 INDIVIDUAL ZONE CREATION -> REDIRECTING TO BATCH API')
    console.log('🔴 Original body:', JSON.stringify(body, null, 2))
    
    // Forward auth headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
      console.log('🔴 Auth header present:', !!authHeader)
    }
    
    const cookie = request.headers.get('cookie')
    if (cookie) {
      headers['Cookie'] = cookie
      console.log('🔴 Cookie present:', !!cookie)
    }
    
    const batchPayload = {
      zones: [{
        name: body.name,
        description: body.description || 'Descripción de la zona',
        icon: body.icon,
        color: body.color || 'bg-gray-100',
        status: body.status || 'ACTIVE'
      }]
    }
    
    console.log('🔴 Batch payload:', JSON.stringify(batchPayload, null, 2))
    
    // Redirect to batch API
    const batchResponse = await fetch(`${request.nextUrl.origin}/api/properties/${propertyId}/zones/batch`, {
      method: 'POST',
      headers,
      body: JSON.stringify(batchPayload)
    })
    
    if (!batchResponse.ok) {
      const errorText = await batchResponse.text()
      console.error('🔴 Batch redirect failed with status:', batchResponse.status)
      console.error('🔴 Batch error details:', errorText)
      
      let errorDetails
      try {
        errorDetails = JSON.parse(errorText)
      } catch {
        errorDetails = { text: errorText }
      }
      
      return NextResponse.json({
        success: false,
        error: `Error al crear la zona via batch (${batchResponse.status})`,
        details: errorDetails,
        batchStatus: batchResponse.status
      }, { status: batchResponse.status })
    }
    
    const batchResult = await batchResponse.json()
    console.log('🔴 Batch result:', batchResult)
    
    if (batchResult.success && batchResult.data?.zones?.length > 0) {
      return NextResponse.json({
        success: true,
        data: batchResult.data.zones[0]
      }, { status: 201 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Batch creation failed',
      details: batchResult
    }, { status: 500 })
    
  } catch (error) {
    console.error('🔴 Error in zone redirect:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}