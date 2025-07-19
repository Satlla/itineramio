import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../src/lib/auth'

// POST /api/properties/[id]/force-publish - Force publish a property and all its content
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    
    // Verify user owns the property
    const property = await prisma.property.findFirst({
      where: {
        id,
        hostId: userId
      }
    })
    
    if (!property) {
      return NextResponse.json({
        error: 'Property not found or not authorized'
      }, { status: 404 })
    }
    
    // Force publish the property
    await prisma.property.update({
      where: { id },
      data: {
        isPublished: true,
        status: 'ACTIVE',
        publishedAt: property.publishedAt || new Date(),
        updatedAt: new Date()
      }
    })
    
    // Force publish all zones
    await prisma.zone.updateMany({
      where: { propertyId: id },
      data: { 
        isPublished: true,
        status: 'ACTIVE'
      }
    })
    
    // Get all zone IDs
    const zones = await prisma.zone.findMany({
      where: { propertyId: id },
      select: { id: true }
    })
    const zoneIds = zones.map(z => z.id)
    
    // Force publish all steps
    if (zoneIds.length > 0) {
      await prisma.step.updateMany({
        where: { zoneId: { in: zoneIds } },
        data: { isPublished: true }
      })
    }
    
    // Get updated property for response
    const updatedProperty = await prisma.property.findUnique({
      where: { id },
      include: {
        zones: {
          include: {
            steps: {
              select: { isPublished: true }
            }
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Property force published successfully',
      data: {
        propertyId: id,
        name: updatedProperty?.name,
        isPublished: updatedProperty?.isPublished,
        status: updatedProperty?.status,
        publishedAt: updatedProperty?.publishedAt,
        zonesPublished: zones.length,
        stepsPublished: zoneIds.length > 0 ? await prisma.step.count({
          where: { 
            zoneId: { in: zoneIds },
            isPublished: true
          }
        }) : 0
      }
    })
    
  } catch (error) {
    console.error('Error force publishing property:', error)
    return NextResponse.json({
      error: 'Failed to force publish property',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}