import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { propertyId } = body
    
    if (!propertyId) {
      return NextResponse.json({
        success: false,
        error: 'Property ID is required'
      }, { status: 400 })
    }
    
    console.log('📤 Publishing property:', propertyId)
    
    // 1. Get the property with all its data
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        zones: {
          include: {
            steps: true
          }
        }
      }
    })
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Property not found'
      }, { status: 404 })
    }
    
    // 2. Publish the property
    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: {
        isPublished: true,
        publishedAt: new Date()
      }
    })
    
    // 3. Publish all zones that have steps
    const zonesWithSteps = property.zones.filter(z => z.steps.length > 0)
    let publishedZonesCount = 0
    let publishedStepsCount = 0
    
    for (const zone of zonesWithSteps) {
      // Publish the zone
      await prisma.zone.update({
        where: { id: zone.id },
        data: {
          isPublished: true,
          publishedAt: new Date()
        }
      })
      publishedZonesCount++
      
      // Publish all steps in the zone
      await prisma.step.updateMany({
        where: { zoneId: zone.id },
        data: {
          isPublished: true,
          publishedAt: new Date()
        }
      })
      publishedStepsCount += zone.steps.length
    }
    
    console.log('✅ Property published successfully')
    console.log(`   - Zones published: ${publishedZonesCount}`)
    console.log(`   - Steps published: ${publishedStepsCount}`)
    
    return NextResponse.json({
      success: true,
      message: 'Property published successfully',
      data: {
        propertyId: updatedProperty.id,
        propertyName: updatedProperty.name,
        isPublished: updatedProperty.isPublished,
        publishedAt: updatedProperty.publishedAt,
        zonesPublished: publishedZonesCount,
        stepsPublished: publishedStepsCount,
        publicUrl: `https://www.itineramio.com/guide/${updatedProperty.id}`
      }
    })
    
  } catch (error: any) {
    console.error('❌ Error publishing property:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}