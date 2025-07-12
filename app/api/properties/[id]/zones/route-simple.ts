import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const propertyId = (await params).id
    const body = await request.json()
    
    console.log('🚀 SIMPLE Zone creation for property:', propertyId)
    console.log('🚀 Body received:', body)
    
    // Create zone directly without all the validation
    const zone = await prisma.zone.create({
      data: {
        propertyId,
        name: { es: body.name || 'Test Zone' },
        description: { es: body.description || 'Test Description' },
        icon: body.icon || 'test',
        color: body.color || 'bg-gray-100',
        order: 1,
        status: 'ACTIVE',
        isPublished: true,
        qrCode: `qr_test_${Date.now()}`,
        accessCode: `ac_test_${Date.now()}`
      }
    })
    
    console.log('✅ Zone created:', zone.id)
    
    return NextResponse.json({
      success: true,
      data: zone
    })
    
  } catch (error) {
    console.error('❌ Simple zone creation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}