import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyWithZones = searchParams.get('withZones')
    const propertyWithoutZones = searchParams.get('withoutZones')
    
    if (!propertyWithZones || !propertyWithoutZones) {
      return NextResponse.json({ 
        error: 'Required params: withZones (property ID with zones) and withoutZones (property ID without zones)' 
      }, { status: 400 })
    }
    
    // Get both properties
    const [propWithZones, propWithoutZones] = await Promise.all([
      prisma.property.findUnique({
        where: { id: propertyWithZones },
        include: {
          zones: {
            select: {
              id: true,
              name: true,
              status: true,
              isPublished: true
            }
          },
          _count: {
            select: { zones: true }
          }
        }
      }),
      prisma.property.findUnique({
        where: { id: propertyWithoutZones },
        include: {
          zones: {
            select: {
              id: true,
              name: true,
              status: true,
              isPublished: true
            }
          },
          _count: {
            select: { zones: true }
          }
        }
      })
    ])
    
    if (!propWithZones || !propWithoutZones) {
      return NextResponse.json({ error: 'One or both properties not found' }, { status: 404 })
    }
    
    // Try to create a test zone on both
    const testZoneData = (propertyId: string, suffix: string) => ({
      propertyId,
      name: { es: `Test Zone ${suffix}` },
      description: { es: 'Test description' },
      icon: 'wifi',
      color: 'bg-gray-100',
      order: 999,
      status: 'ACTIVE',
      isPublished: true,
      qrCode: `qr_test_${Date.now()}_${suffix}_${Math.random().toString(36).substr(2, 9)}`,
      accessCode: `ac_test_${Date.now()}_${suffix}_${Math.random().toString(36).substr(2, 9)}`
    })
    
    let resultWithZones = null
    let errorWithZones = null
    let resultWithoutZones = null
    let errorWithoutZones = null
    
    // Try creating on property WITH zones
    try {
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${propWithZones.hostId}, true)`
      resultWithZones = await prisma.zone.create({
        data: testZoneData(propertyWithZones, 'withzones')
      })
    } catch (err) {
      errorWithZones = {
        message: err instanceof Error ? err.message : 'Unknown error',
        code: (err as any)?.code,
        meta: (err as any)?.meta
      }
    }
    
    // Try creating on property WITHOUT zones
    try {
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${propWithoutZones.hostId}, true)`
      resultWithoutZones = await prisma.zone.create({
        data: testZoneData(propertyWithoutZones, 'withoutzones')
      })
    } catch (err) {
      errorWithoutZones = {
        message: err instanceof Error ? err.message : 'Unknown error',
        code: (err as any)?.code,
        meta: (err as any)?.meta
      }
    }
    
    // Clean up test zones if created
    if (resultWithZones) {
      await prisma.zone.delete({ where: { id: resultWithZones.id } })
    }
    if (resultWithoutZones) {
      await prisma.zone.delete({ where: { id: resultWithoutZones.id } })
    }
    
    return NextResponse.json({
      comparison: {
        propertyWithZones: {
          id: propWithZones.id,
          name: propWithZones.name,
          hostId: propWithZones.hostId,
          status: propWithZones.status,
          isPublished: propWithZones.isPublished,
          createdAt: propWithZones.createdAt,
          zoneCount: propWithZones._count.zones,
          zones: propWithZones.zones
        },
        propertyWithoutZones: {
          id: propWithoutZones.id,
          name: propWithoutZones.name,
          hostId: propWithoutZones.hostId,
          status: propWithoutZones.status,
          isPublished: propWithoutZones.isPublished,
          createdAt: propWithoutZones.createdAt,
          zoneCount: propWithoutZones._count.zones,
          zones: propWithoutZones.zones
        }
      },
      testResults: {
        withZones: {
          success: !!resultWithZones,
          error: errorWithZones
        },
        withoutZones: {
          success: !!resultWithoutZones,
          error: errorWithoutZones
        }
      }
    })
    
  } catch (error) {
    console.error('Comparison endpoint error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}