import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    
    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId required' }, { status: 400 })
    }
    
    // Get property with all details
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        zones: true,
        _count: {
          select: { zones: true }
        }
      }
    })
    
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }
    
    // Test zone creation data
    const testZoneData = {
      propertyId,
      name: { es: 'Test Zone Debug' },
      description: { es: 'Test description' },
      icon: 'wifi',
      color: 'bg-gray-100',
      order: property._count.zones + 1,
      status: 'ACTIVE',
      isPublished: true,
      qrCode: `qr_debug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      accessCode: `ac_debug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    // Try to create zone directly
    let zoneCreated = null
    let createError = null
    
    try {
      // Set RLS context
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${property.hostId}, true)`
      
      zoneCreated = await prisma.zone.create({
        data: testZoneData
      })
    } catch (err) {
      createError = {
        message: err instanceof Error ? err.message : 'Unknown error',
        code: (err as any)?.code,
        meta: (err as any)?.meta,
        stack: err instanceof Error ? err.stack : undefined
      }
    }
    
    return NextResponse.json({
      property: {
        id: property.id,
        name: property.name,
        hostId: property.hostId,
        isPublished: property.isPublished,
        zoneCount: property._count.zones,
        hasZones: property.zones.length > 0,
        zones: property.zones.map(z => ({
          id: z.id,
          name: z.name,
          qrCode: z.qrCode.substring(0, 20) + '...',
          accessCode: z.accessCode.substring(0, 20) + '...'
        }))
      },
      testData: testZoneData,
      createResult: {
        success: !!zoneCreated,
        zone: zoneCreated,
        error: createError
      }
    })
    
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}