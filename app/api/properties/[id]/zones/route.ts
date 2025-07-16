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

    const zones = await prisma.zone.findMany({
      where: {
        propertyId: propertyId
      },
      include: {
        steps: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })
    
    console.log('🔍 Zones fetched:', zones.length)
    
    return NextResponse.json({
      success: true,
      data: zones
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
    
    // Forward auth headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    const cookie = request.headers.get('cookie')
    if (cookie) {
      headers['Cookie'] = cookie
    }
    
    // Redirect to batch API
    const batchResponse = await fetch(`${request.nextUrl.origin}/api/properties/${propertyId}/zones/batch`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        zones: [{
          name: body.name,
          description: body.description || 'Descripción de la zona',
          icon: body.icon,
          color: body.color || 'bg-gray-100',
          status: body.status || 'ACTIVE'
        }]
      })
    })
    
    if (!batchResponse.ok) {
      const errorText = await batchResponse.text()
      console.error('🔴 Batch redirect failed:', errorText)
      return NextResponse.json({
        success: false,
        error: 'Error al crear la zona via batch',
        details: errorText
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