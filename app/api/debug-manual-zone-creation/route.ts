import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { propertyId, zoneData } = body
    
    console.log('🧪 Manual Zone Creation Debug')
    console.log('🧪 Property ID:', propertyId)
    console.log('🧪 Zone Data:', JSON.stringify(zoneData, null, 2))
    
    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        zones: {
          select: {
            id: true,
            name: true,
            qrCode: true,
            accessCode: true
          }
        }
      }
    })
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Property not found',
        propertyId
      })
    }
    
    console.log('🧪 Property found:', {
      id: property.id,
      name: property.name,
      hostId: property.hostId,
      isPublished: property.isPublished,
      status: property.status,
      existingZones: property.zones.length
    })
    
    // Check authentication context
    const authCookie = request.cookies.get('auth-token')
    console.log('🧪 Auth cookie present:', !!authCookie?.value)
    
    // Try to create the zone directly
    const testZoneData = {
      propertyId,
      name: { es: zoneData.name || 'Test Zone' },
      description: { es: zoneData.description || 'Test description' },
      icon: zoneData.icon || 'wifi',
      color: zoneData.color || 'bg-gray-100',
      order: property.zones.length + 1,
      status: zoneData.status || 'ACTIVE',
      isPublished: property.isPublished,
      qrCode: `qr_debug_manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      accessCode: `ac_debug_manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    console.log('🧪 Attempting zone creation with:', JSON.stringify(testZoneData, null, 2))
    
    // Set RLS context
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${property.hostId}, true)`
    console.log('🧪 RLS context set for user:', property.hostId)
    
    // Verify RLS context
    const rlsCheck = await prisma.$queryRaw`SELECT current_setting('app.current_user_id', true) as current_user`
    console.log('🧪 RLS context verification:', rlsCheck)
    
    let createdZone = null
    let createError = null
    
    try {
      createdZone = await prisma.zone.create({
        data: testZoneData
      })
      console.log('✅ Zone created successfully:', createdZone.id)
    } catch (err) {
      createError = {
        message: err instanceof Error ? err.message : 'Unknown error',
        code: (err as any)?.code,
        meta: (err as any)?.meta,
        constraint: (err as any)?.meta?.target
      }
      console.log('❌ Zone creation failed:', createError)
    }
    
    return NextResponse.json({
      success: !!createdZone,
      debug: {
        propertyFound: !!property,
        propertyData: {
          id: property.id,
          hostId: property.hostId,
          isPublished: property.isPublished,
          status: property.status,
          zonesCount: property.zones.length
        },
        authCookiePresent: !!authCookie?.value,
        testZoneData,
        rlsContext: rlsCheck,
        createResult: createdZone ? { id: createdZone.id, success: true } : null,
        createError
      }
    })
    
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}