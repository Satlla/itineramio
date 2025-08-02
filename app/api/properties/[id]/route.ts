import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../src/lib/prisma'
import { requireAuth } from '../../../../src/lib/auth'

// Validation schema for property update
const updatePropertySchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(1000).optional(),
  type: z.enum(['APARTMENT', 'HOUSE', 'ROOM', 'VILLA']).optional(),
  
  // Address
  street: z.string().min(5).optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  country: z.string().optional(),
  postalCode: z.string().regex(/^[0-9]{5}$/).optional(),
  
  // Characteristics
  bedrooms: z.coerce.number().min(0).max(20).optional(),
  bathrooms: z.coerce.number().min(0).max(10).optional(),
  maxGuests: z.coerce.number().min(1).max(50).optional(),
  squareMeters: z.coerce.number().min(10).max(1000).optional(),
  
  // Property image
  profileImage: z.string().optional(),
  
  // Host contact
  hostContactName: z.string().min(2).max(100).optional(),
  hostContactPhone: z.string().regex(/^[+]?[(]?[0-9\s\-()]{9,}$/).optional(),
  hostContactEmail: z.string().email().optional(),
  hostContactLanguage: z.string().optional(),
  hostContactPhoto: z.string().optional(),
  
  // Status
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE']).optional(),
  isPublished: z.boolean().optional(),
  
  // Property Set Association
  propertySetId: z.string().nullable().optional()
}).strict()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🔍 Property endpoint - received ID:', id)
    
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    
    // Set JWT claims for PostgreSQL RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`
    
    // Handle potential ID truncation
    const properties = await prisma.property.findMany({
      where: {
        id: {
          startsWith: id
        },
        hostId: userId
      },
      include: {
        analytics: true
      }
    })
    
    const property = properties[0]
    const actualPropertyId = property?.id || id
    console.log('🔍 Property found:', !!property, 'actualId:', actualPropertyId)
    // console.log('🔍 Property slug:', property?.slug) // Temporarily disabled
    
    // Fetch zones separately using the actual property ID
    let zones: any[] = []
    try {
      zones = await prisma.zone.findMany({
        where: {
          propertyId: actualPropertyId
        },
        include: {
          _count: {
            select: {
              steps: true
            }
          }
        },
        orderBy: {
          id: 'asc'
        }
      })
    } catch (zoneError) {
      console.error('Error fetching zones:', zoneError)
      zones = []
    }
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada'
      }, { status: 404 })
    }
    
    // Transform data to include counts and analytics
    const transformedProperty = {
      ...property,
      zonesCount: zones.length,
      totalViews: property.analytics?.totalViews || 0,
      avgRating: property.analytics?.overallRating || 0,
      zones: zones.map(zone => ({
        ...zone,
        stepsCount: zone._count.steps
      }))
    }
    
    return NextResponse.json({
      success: true,
      data: transformedProperty
    })
    
  } catch (error) {
    console.error('Error fetching property:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    
    // Set JWT claims for PostgreSQL RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`
    
    // Validate request data
    const validatedData = updatePropertySchema.parse(body)
    
    // Handle potential ID truncation for PUT as well
    const properties = await prisma.property.findMany({
      where: {
        id: {
          startsWith: id
        },
        hostId: userId
      }
    })
    
    const property = properties[0]
    const actualPropertyId = property?.id || id
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada'
      }, { status: 404 })
    }
    
    const updatedProperty = await prisma.property.update({
      where: { id: actualPropertyId },
      data: {
        ...validatedData,
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json({
      success: true,
      data: updatedProperty
    })
    
  } catch (error) {
    console.error('Error updating property:', error)
    
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    
    // Set JWT claims for PostgreSQL RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`
    
    // Simple validation for status update
    if (body.status && !['DRAFT', 'ACTIVE', 'INACTIVE'].includes(body.status)) {
      return NextResponse.json({
        success: false,
        error: 'Estado inválido'
      }, { status: 400 })
    }
    
    // Find property
    const property = await prisma.property.findFirst({
      where: {
        id,
        hostId: userId
      }
    })
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada'
      }, { status: 404 })
    }
    
    // Update property with special handling for ACTIVE status
    const updateData = {
      ...body,
      updatedAt: new Date()
    }
    
    // If setting status to ACTIVE, also set isPublished to true and publishedAt
    if (body.status === 'ACTIVE') {
      updateData.isPublished = true
      if (!property.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }
    
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: updateData
    })
    
    // If property was activated, also publish zones and steps
    if (body.status === 'ACTIVE') {
      await prisma.zone.updateMany({
        where: { propertyId: id },
        data: { 
          isPublished: true,
          status: 'ACTIVE'
        }
      })
      
      // Get all zone IDs for this property
      const zones = await prisma.zone.findMany({
        where: { propertyId: id },
        select: { id: true }
      })
      const zoneIds = zones.map(z => z.id)
      
      // Publish all steps
      await prisma.step.updateMany({
        where: { zoneId: { in: zoneIds } },
        data: { isPublished: true }
      })
    }
    
    return NextResponse.json({
      success: true,
      data: updatedProperty
    })
    
  } catch (error) {
    console.error('Error updating property:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    
    // Set JWT claims for PostgreSQL RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`
    
    const property = await prisma.property.findFirst({
      where: {
        id,
        hostId: userId // Using hostId to match the correct user
      }
    })
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada'
      }, { status: 404 })
    }
    
    // Delete property and all related data (zones, steps, etc.)
    // Thanks to the cascade delete in the schema, this will handle cleanup
    await prisma.property.delete({
      where: { id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Propiedad eliminada exitosamente'
    })
    
  } catch (error) {
    console.error('Error deleting property:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}