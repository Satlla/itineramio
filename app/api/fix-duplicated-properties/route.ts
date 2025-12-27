import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting fix for duplicated properties...')
    
    // Find all published properties that might have unpublished zones/steps
    const properties = await prisma.property.findMany({
      where: {
        isPublished: true,
        status: 'ACTIVE'
      },
      include: {
        zones: {
          include: {
            steps: true
          }
        }
      }
    })
    
    console.log(`Found ${properties.length} published properties to check`)
    
    let fixedZonesCount = 0
    let fixedStepsCount = 0
    
    for (const property of properties) {
      console.log(`Checking property: ${property.name} (${property.id})`)
      
      for (const zone of property.zones) {
        let needsZoneUpdate = false
        const zoneUpdates: any = {}
        
        // Check if zone needs to be published
        if (!zone.isPublished || zone.status !== 'ACTIVE') {
          needsZoneUpdate = true
          zoneUpdates.isPublished = true
          zoneUpdates.status = 'ACTIVE'
          console.log(`  - Zone "${zone.name}" needs publishing`)
        }
        
        // Update zone if needed
        if (needsZoneUpdate) {
          await prisma.zone.update({
            where: { id: zone.id },
            data: zoneUpdates
          })
          fixedZonesCount++
        }
        
        // Check and fix steps
        for (const step of zone.steps) {
          let needsStepUpdate = false
          const stepUpdates: any = {}
          
          if (!step.isPublished) {
            needsStepUpdate = true
            stepUpdates.isPublished = true
            console.log(`    - Step "${step.title}" needs publishing`)
          }
          
          if (needsStepUpdate) {
            await prisma.step.update({
              where: { id: step.id },
              data: stepUpdates
            })
            fixedStepsCount++
          }
        }
      }
    }
    
    console.log('✅ Fix completed!')
    console.log(`Fixed ${fixedZonesCount} zones and ${fixedStepsCount} steps`)
    
    return NextResponse.json({
      success: true,
      message: 'Duplicated properties fixed successfully',
      stats: {
        propertiesChecked: properties.length,
        zonesFixed: fixedZonesCount,
        stepsFixed: fixedStepsCount
      }
    })
    
  } catch (error) {
    console.error('💥 Fix error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}