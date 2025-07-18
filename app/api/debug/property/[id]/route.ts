import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    console.log('🔍 Debug: Looking for property with ID:', id)
    
    // Find property with all details
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        zones: {
          include: {
            steps: {
              select: {
                id: true,
                isPublished: true
              }
            }
          }
        }
      }
    })
    
    if (!property) {
      console.log('❌ Debug: Property not found')
      return NextResponse.json({
        success: false,
        error: 'Property not found',
        searchedId: id
      }, { status: 404 })
    }
    
    console.log('✅ Debug: Property found')
    console.log('Property details:', {
      id: property.id,
      name: property.name,
      isPublished: property.isPublished,
      status: property.status,
      publishedAt: property.publishedAt,
      zonesCount: property.zones.length
    })
    
    const debugInfo = {
      property: {
        id: property.id,
        name: property.name,
        isPublished: property.isPublished,
        status: property.status,
        publishedAt: property.publishedAt,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt
      },
      zones: property.zones.map(zone => ({
        id: zone.id,
        name: zone.name,
        isPublished: zone.isPublished,
        status: zone.status,
        stepsCount: zone.steps.length,
        publishedStepsCount: zone.steps.filter(s => s.isPublished).length
      })),
      issues: []
    }
    
    // Check for potential issues
    if (!property.isPublished) {
      debugInfo.issues.push('Property is not published (isPublished: false)')
    }
    
    if (property.status !== 'ACTIVE') {
      debugInfo.issues.push(`Property status is: ${property.status} (should be ACTIVE)`)
    }
    
    if (property.zones.length === 0) {
      debugInfo.issues.push('Property has no zones')
    }
    
    const unpublishedZones = property.zones.filter(z => !z.isPublished)
    if (unpublishedZones.length > 0) {
      debugInfo.issues.push(`${unpublishedZones.length} zones are not published`)
    }
    
    return NextResponse.json({
      success: true,
      debug: debugInfo
    })
    
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}