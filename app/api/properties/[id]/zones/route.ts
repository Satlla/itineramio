import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../src/lib/auth'

// GET /api/properties/[id]/zones - Get all zones for a property
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
        z."order",
        z."isPublished",
        z."propertyId",
        z."createdAt",
        z."updatedAt",
        z."publishedAt"
      FROM zones z
      WHERE z."propertyId" = ${propertyId}
      ORDER BY z."order" ASC, z.id ASC
    ` as any[]

    // Get steps for each zone using raw SQL
    const zonesWithSteps = await Promise.all(
      zones.map(async (zone: any) => {
        const steps = await prisma.$queryRaw`
          SELECT 
            id, "zoneId", type, title, content, COALESCE("order", 0) as "order",
            "isPublished", "createdAt", "updatedAt"
          FROM steps
          WHERE "zoneId" = ${zone.id}
          ORDER BY COALESCE("order", 0) ASC, id ASC
        ` as any[]
        
        return {
          ...zone,
          steps: steps
        }
      })
    )
    
    console.log('🔍 Zones fetched:', zonesWithSteps.length)
    
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