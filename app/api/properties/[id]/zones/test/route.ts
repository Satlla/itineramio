import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'

// POST /api/properties/[id]/zones/test - Simple test endpoint
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const propertyId = (await params).id
    
    // Simple zone creation without authentication or slug generation
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    
    const zone = await prisma.zone.create({
      data: {
        propertyId,
        name: { es: `Test Zone ${timestamp}` },
        description: { es: 'Test Description' },
        icon: 'home',
        color: 'bg-gray-100',
          status: 'ACTIVE',
        qrCode: `test_qr_${timestamp}_${random}`,
        accessCode: `test_ac_${timestamp}_${random}`,
        slug: `test-zone-${timestamp}`
      }
    })
    
    return NextResponse.json({
      success: true,
      data: zone,
      message: 'Test zone created successfully'
    })
    
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}