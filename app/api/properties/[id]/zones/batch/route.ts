import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../../../src/lib/prisma'

const batchZoneSchema = z.object({
  zones: z.array(z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    icon: z.string().min(1),
    color: z.string().default('bg-gray-100'),
    status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).default('ACTIVE')
  }))
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
    const body = await request.json()
    
    // Validate request data
    const validatedData = batchZoneSchema.parse(body)
    
    // Verify property exists and user has access
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@itineramio.com' }
    })
    
    if (!demoUser) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado'
      }, { status: 404 })
    }
    
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        hostId: demoUser.id
      }
    })
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada'
      }, { status: 404 })
    }
    
    // Get the next order number
    const lastZone = await prisma.zone.findFirst({
      where: { propertyId: propertyId },
      orderBy: { order: 'desc' }
    })
    
    let currentOrder = lastZone ? lastZone.order + 1 : 1
    
    // Create zones in a single transaction
    const createdZones = await prisma.$transaction(
      validatedData.zones.map((zoneData) => {
        const zone = prisma.zone.create({
          data: {
            propertyId: propertyId,
            name: typeof zoneData.name === 'string' ? { es: zoneData.name } : zoneData.name,
            description: typeof zoneData.description === 'string' ? { es: zoneData.description || '' } : (zoneData.description || { es: '' }),
            icon: zoneData.icon,
            color: zoneData.color,
            order: currentOrder++,
            status: zoneData.status,
            qrCode: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            accessCode: `ac_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }
        })
        return zone
      })
    )
    
    return NextResponse.json({
      success: true,
      data: {
        zones: createdZones,
        count: createdZones.length
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating zones batch:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Datos de entrada inválidos',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}