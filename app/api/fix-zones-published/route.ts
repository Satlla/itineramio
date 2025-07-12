import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fixing unpublished zones...')
    
    // Update all zones to be published
    const result = await prisma.zone.updateMany({
      where: {
        isPublished: {
          not: true
        }
      },
      data: {
        isPublished: true
      }
    })
    
    console.log(`✅ Updated ${result.count} zones to be published`)
    
    // Also update all steps to be published
    const stepsResult = await prisma.step.updateMany({
      where: {
        isPublished: {
          not: true
        }
      },
      data: {
        isPublished: true
      }
    })
    
    console.log(`✅ Updated ${stepsResult.count} steps to be published`)
    
    return NextResponse.json({
      success: true,
      message: `Fixed ${result.count} zones and ${stepsResult.count} steps`
    })
    
  } catch (error) {
    console.error('Error fixing zones:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al arreglar las zonas'
    }, { status: 500 })
  }
}