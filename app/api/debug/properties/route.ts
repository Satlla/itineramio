import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function GET() {
  try {
    // Get all properties with their publication status
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        isPublished: true,
        publishedAt: true,
        zones: {
          select: {
            id: true
          }
        }
      }
    })

    const propertiesWithZoneCount = properties.map(p => ({
      ...p,
      zonesCount: p.zones.length,
      zones: undefined // Remove zones array from response
    }))

    return NextResponse.json({
      success: true,
      properties: propertiesWithZoneCount,
      summary: {
        total: properties.length,
        active: properties.filter(p => p.status === 'ACTIVE').length,
        published: properties.filter(p => p.isPublished).length,
        activeAndPublished: properties.filter(p => p.status === 'ACTIVE' && p.isPublished).length
      }
    })
  } catch (error) {
    console.error('Error fetching properties debug info:', error)
    return NextResponse.json({
      success: false,
      error: 'Error fetching properties'
    }, { status: 500 })
  }
}