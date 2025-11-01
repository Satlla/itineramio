import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../../../src/lib/prisma'
import jwt from 'jsonwebtoken'
import { generateSlug, generateUniqueSlug } from '../../../../../../src/lib/slug-utils'

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
    
    console.log('🔵 Batch zone creation started for property:', propertyId)
    
    // Validate request data
    const validatedData = batchZoneSchema.parse(body)
    
    // Get user from auth
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'No autorizado'
      }, { status: 401 })
    }
    
    let userId: string
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      userId = decoded.userId
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Token inválido'
      }, { status: 401 })
    }
    
    // Set JWT claims for RLS
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead
    
    // Verify property exists and user has access
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        hostId: userId
      }
    })
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada o no autorizada'
      }, { status: 404 })
    }
    
    // Get the next order number - using id since order field doesn't exist in current schema
    const lastZone = await prisma.zone.findFirst({
      where: { propertyId: propertyId },
      orderBy: { id: 'desc' },
      select: { id: true }
    })
    
    // Get existing slugs for uniqueness check
    const existingSlugs = await prisma.zone.findMany({
      where: { 
        propertyId,
        slug: { not: null }
      },
      select: { slug: true }
    }).then(results => results.map(r => r.slug).filter(Boolean) as string[])
    
    console.log('🔵 Existing slugs:', existingSlugs)
    
    // Prepare zones data with unique slugs
    const zonesData = validatedData.zones.map((zoneData, index) => {
      const timestamp = Date.now() + index // Ensure unique timestamps
      const random1 = Math.random().toString(36).substr(2, 12)
      const random2 = Math.random().toString(36).substr(2, 12)
      
      const baseSlug = generateSlug(zoneData.name)
      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs)
      existingSlugs.push(uniqueSlug) // Add to list to ensure next zones are also unique
      
      return {
        propertyId: propertyId,
        name: typeof zoneData.name === 'string' ? { es: zoneData.name } : zoneData.name,
        slug: uniqueSlug,
        description: typeof zoneData.description === 'string' ? { es: zoneData.description || '' } : (zoneData.description || { es: '' }),
        icon: zoneData.icon,
        color: zoneData.color,
        status: zoneData.status,
        qrCode: `qr_${timestamp}_${random1}`,
        accessCode: `ac_${timestamp}_${random2}`
      }
    })
    
    console.log('🔵 Creating', zonesData.length, 'zones in batch')
    
    // Create zones in a single transaction
    const createdZones = await prisma.$transaction(
      zonesData.map((data) => prisma.zone.create({ data }))
    )
    
    return NextResponse.json({
      success: true,
      data: {
        zones: createdZones,
        count: createdZones.length
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('🔴 Error creating zones batch:', error)
    console.error('🔴 Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Datos de entrada inválidos',
        details: error.errors
      }, { status: 400 })
    }
    
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      
      if (errorMessage.includes('unique constraint') || errorMessage.includes('duplicate key')) {
        return NextResponse.json({
          success: false,
          error: 'Ya existe una zona con ese nombre o código. Inténtalo de nuevo.',
          details: error.message
        }, { status: 400 })
      }
      
      if (errorMessage.includes('jwt') || errorMessage.includes('token')) {
        return NextResponse.json({
          success: false,
          error: 'Error de autenticación',
          details: error.message
        }, { status: 401 })
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}