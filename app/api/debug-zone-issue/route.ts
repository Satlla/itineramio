import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId') || 'cmczg8lnv000dl1045cx744ir'
    const zoneId = searchParams.get('zoneId') || 'cmczg9agv000ul104ifab09ej'
    
    console.log('🔍 Debugging zone issue:', { propertyId, zoneId })
    
    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, name: true, isPublished: true }
    })
    
    console.log('🏠 Property:', property)
    
    // Check if zone exists
    const zone = await prisma.zone.findUnique({
      where: { id: zoneId },
      select: { 
        id: true, 
        name: true, 
        propertyId: true, 
        isPublished: true,
        _count: { select: { steps: true } }
      }
    })
    
    console.log('🎯 Zone:', zone)
    
    // Check steps
    const steps = await prisma.step.findMany({
      where: { zoneId: zoneId },
      select: { id: true, title: true, isPublished: true }
    })
    
    console.log('📋 Steps:', steps)
    
    // Check with startsWith for truncated IDs
    const zonesByPrefix = await prisma.zone.findMany({
      where: {
        id: { startsWith: zoneId.substring(0, 10) },
        propertyId: propertyId
      },
      select: { 
        id: true, 
        name: true, 
        isPublished: true,
        _count: { select: { steps: true } }
      }
    })
    
    console.log('🔍 Zones by prefix:', zonesByPrefix)
    
    // Auto-fix: Update zones and steps to be published
    if (zone && !zone.isPublished) {
      await prisma.zone.update({
        where: { id: zoneId },
        data: { isPublished: true }
      })
      console.log('✅ Fixed zone publication status')
    }
    
    // Fix steps
    const unpublishedSteps = steps.filter(s => !s.isPublished)
    if (unpublishedSteps.length > 0) {
      await prisma.step.updateMany({
        where: { 
          zoneId: zoneId,
          isPublished: false
        },
        data: { isPublished: true }
      })
      console.log(`✅ Fixed ${unpublishedSteps.length} unpublished steps`)
    }
    
    return NextResponse.json({
      success: true,
      data: {
        property,
        zone,
        steps,
        zonesByPrefix,
        searchParams: { propertyId, zoneId },
        fixes: {
          zoneFixed: zone && !zone.isPublished,
          stepsFixed: unpublishedSteps.length
        }
      }
    })
    
  } catch (error) {
    console.error('Error debugging zone:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}