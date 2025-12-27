import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function POST() {
  try {
    // Update all properties to be active and published
    const result = await prisma.property.updateMany({
      data: {
        status: 'ACTIVE',
        isPublished: true,
        publishedAt: new Date()
      }
    })

    // Also update all zones to be published
    const zonesResult = await prisma.zone.updateMany({
      data: {
        isPublished: true
      }
    })

    // And all steps
    const stepsResult = await prisma.step.updateMany({
      data: {
        isPublished: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'All properties, zones, and steps published successfully',
      propertiesUpdated: result.count,
      zonesUpdated: zonesResult.count,
      stepsUpdated: stepsResult.count
    })
  } catch (error) {
    console.error('Error publishing all properties:', error)
    return NextResponse.json({
      success: false,
      error: 'Error publishing properties'
    }, { status: 500 })
  }
}