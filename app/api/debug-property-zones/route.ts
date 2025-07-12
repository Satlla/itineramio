import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId') || 'cmd01rd660003jr047ahyxxqt'
    
    console.log('🔍 Debugging property zones for:', propertyId)
    
    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        zones: {
          select: {
            id: true,
            name: true,
            icon: true,
            order: true,
            isPublished: true
          }
        }
      }
    })
    
    console.log('🏠 Property found:', !!property)
    if (property) {
      console.log('🏠 Property details:', {
        id: property.id,
        name: property.name,
        hostId: property.hostId,
        isPublished: property.isPublished,
        zonesCount: property.zones?.length || 0
      })
      console.log('🎯 Existing zones:', property.zones)
    }
    
    // Test zone creation payload
    const testZoneData = {
      name: 'Test Zone',
      description: 'Test description',
      icon: 'test-icon',
      color: 'bg-gray-100',
      status: 'ACTIVE'
    }
    
    console.log('🧪 Test zone data:', testZoneData)
    
    // Validate the test data
    const issues = []
    if (!testZoneData.name) issues.push('Missing name')
    if (!testZoneData.icon) issues.push('Missing icon')
    if (typeof testZoneData.name !== 'string') issues.push('Name not string')
    if (typeof testZoneData.icon !== 'string') issues.push('Icon not string')
    
    return NextResponse.json({
      success: true,
      propertyExists: !!property,
      property: property ? {
        id: property.id,
        name: property.name,
        hostId: property.hostId,
        isPublished: property.isPublished,
        zonesCount: property.zones?.length || 0,
        existingZones: property.zones
      } : null,
      testZoneData,
      validationIssues: issues,
      testWouldPass: issues.length === 0
    })
    
  } catch (error) {
    console.error('Debug property zones error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}