import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../src/lib/auth'

// TEMPORARY FIX ENDPOINT - Force publish a property
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
    
    // Force publish everything
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        isPublished: true,
        status: 'ACTIVE',
        publishedAt: property.publishedAt || new Date()
      }
    })
    
    // Also publish all zones
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
    
    // Publish all steps
    await prisma.step.updateMany({
      where: { zoneId: { in: zoneIds } },
      data: { isPublished: true }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Property force published successfully',
      data: {
        propertyId: id,
        isPublished: updatedProperty.isPublished,
        status: updatedProperty.status,
        zonesPublished: zones.length
      }
    })
    
  } catch (error) {
    console.error('Error force publishing:', error)
    return NextResponse.json({
      error: 'Failed to force publish property'
    }, { status: 500 })
  }
}