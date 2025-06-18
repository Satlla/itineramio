import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/properties/[id]/zones/[zoneId] - Get specific zone
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  console.log('🔍 GET zone endpoint called')
  try {
    const { id: propertyId, zoneId } = await params
    console.log('🔍 Received params:', { propertyId, zoneId })

    console.log('🔍 Searching for zone with:', { zoneId, propertyId })
    
    // First try with the truncated zoneId to find the actual zone
    const zones = await prisma.zone.findMany({
      where: {
        id: {
          startsWith: zoneId // Use startsWith to find zones that begin with the truncated ID
        },
        propertyId: propertyId
      },
      include: {
        steps: {
          orderBy: {
            order: 'asc'
          }
        },
        property: {
          select: {
            name: true
          }
        }
      }
    })
    
    const zone = zones[0] // Take the first match

    console.log('🔍 Zone found:', !!zone)
    if (zone) {
      console.log('🔍 Zone details:', { id: zone.id, propertyId: zone.propertyId, stepsCount: zone.steps.length })
    }

    if (!zone) {
      console.log('🔍 Zone not found - returning 404')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Zona no encontrada',
          debug: { receivedPropertyId: propertyId, receivedZoneId: zoneId }
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: zone
    })
  } catch (error) {
    console.error('Error fetching zone:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener la zona' 
      },
      { status: 500 }
    )
  }
}

// PUT /api/properties/[id]/zones/[zoneId] - Update zone
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  try {
    const { id: propertyId, zoneId } = await params
    const body = await request.json()

    // Check if zone exists and belongs to the property
    const existingZone = await prisma.zone.findFirst({
      where: {
        id: zoneId,
        propertyId: propertyId
      }
    })

    if (!existingZone) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Zona no encontrada' 
        },
        { status: 404 }
      )
    }

    // Transform iconId to icon if provided
    const updateData = { ...body }
    if (updateData.iconId) {
      updateData.icon = updateData.iconId
      delete updateData.iconId
    }

    // Update the zone
    const zone = await prisma.zone.update({
      where: { id: zoneId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        steps: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: zone
    })

  } catch (error) {
    console.error('Error updating zone:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar la zona' 
      },
      { status: 500 }
    )
  }
}

// DELETE /api/properties/[id]/zones/[zoneId] - Delete zone
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  try {
    const { id: propertyId, zoneId } = await params

    // Check if zone exists and belongs to the property
    const existingZone = await prisma.zone.findFirst({
      where: {
        id: zoneId,
        propertyId: propertyId
      }
    })

    if (!existingZone) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Zona no encontrada' 
        },
        { status: 404 }
      )
    }

    // Delete all steps (cascade delete)
    await prisma.step.deleteMany({
      where: { zoneId: zoneId }
    })

    // Delete the zone
    await prisma.zone.delete({
      where: { id: zoneId }
    })

    return NextResponse.json({
      success: true,
      message: 'Zona eliminada correctamente'
    })

  } catch (error) {
    console.error('Error deleting zone:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al eliminar la zona' 
      },
      { status: 500 }
    )
  }
}