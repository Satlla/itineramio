import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    
    if (!propertyId) {
      return NextResponse.json({
        success: false,
        error: 'Property ID is required'
      }, { status: 400 })
    }
    
    console.log('🚀 Publishing all zones for property:', propertyId)
    
    // First, get all zones for this property
    const zones = await prisma.zone.findMany({
      where: { propertyId },
      select: {
        id: true,
        name: true,
        status: true,
        isPublished: true,
        },
      orderBy: { id: 'asc' }
    })
    
    console.log('Found zones:', zones.length)
    console.log('Zones status:', zones.map(z => ({ 
      id: z.id, 
      name: z.name, 
      status: z.status, 
      isPublished: z.isPublished 
    })))
    
    // Update all zones to be published and active
    const updateResult = await prisma.zone.updateMany({
      where: { 
        propertyId,
        status: 'DRAFT' // Only update zones that are in DRAFT
      },
      data: {
        status: 'ACTIVE',
        isPublished: true,
        publishedAt: new Date()
      }
    })
    
    console.log('Updated zones count:', updateResult.count)
    
    // Get updated zones
    const updatedZones = await prisma.zone.findMany({
      where: { propertyId },
      select: {
        id: true,
        name: true,
        status: true,
        isPublished: true,
        },
      orderBy: { id: 'asc' }
    })
    
    // Also update the property to be active if it's not
    await prisma.property.update({
      where: { id: propertyId },
      data: {
        status: 'ACTIVE',
        isPublished: true,
        publishedAt: new Date()
      }
    })
    
    return NextResponse.json({
      success: true,
      message: `Successfully published ${updateResult.count} zones`,
      beforeUpdate: zones,
      afterUpdate: updatedZones,
      totalZones: updatedZones.length
    })
    
  } catch (error) {
    console.error('💥 Publish zones error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}