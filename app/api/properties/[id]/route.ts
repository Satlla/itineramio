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
  let id: string = ''
  let userId: string = ''
  
  try {
    const paramResult = await params
    id = paramResult.id
    console.log('🔍 Property endpoint - received ID:', id)
    
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    userId = authResult.userId
    
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
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        type: true,
        street: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        bedrooms: true,
        bathrooms: true,
        maxGuests: true,
        squareMeters: true,
        profileImage: true,
        hostContactName: true,
        hostContactPhone: true,
        hostContactEmail: true,
        hostContactLanguage: true,
        hostContactPhoto: true,
        status: true,
        isPublished: true,
        propertySetId: true,
        hostId: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true
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
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          description: true,
          color: true,
          status: true,
          isPublished: true,
          propertyId: true,
          createdAt: true,
          updatedAt: true,
          publishedAt: true,
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
      console.error('Zone error details:', {
        propertyId: actualPropertyId,
        error: zoneError instanceof Error ? zoneError.message : 'Unknown error'
      })
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
      id: property.id,
      name: property.name,
      slug: property.slug,
      description: property.description,
      type: property.type,
      street: property.street,
      city: property.city,
      state: property.state,
      country: property.country,
      postalCode: property.postalCode,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      maxGuests: property.maxGuests,
      squareMeters: property.squareMeters,
      profileImage: property.profileImage,
      hostContactName: property.hostContactName,
      hostContactPhone: property.hostContactPhone,
      hostContactEmail: property.hostContactEmail,
      hostContactLanguage: property.hostContactLanguage,
      hostContactPhoto: property.hostContactPhoto,
      status: property.status,
      isPublished: property.isPublished,
      propertySetId: property.propertySetId,
      hostId: property.hostId,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      publishedAt: property.publishedAt,
      // Computed fields
      zonesCount: zones.length,
      totalViews: 0, // Temporarily set to 0
      avgRating: 0, // Temporarily set to 0
      zones: zones.map(zone => ({
        id: zone.id,
        name: zone.name,
        slug: zone.slug,
        icon: zone.icon,
        description: zone.description,
        color: zone.color,
        status: zone.status,
        isPublished: zone.isPublished,
        propertyId: zone.propertyId,
        createdAt: zone.createdAt,
        updatedAt: zone.updatedAt,
        publishedAt: zone.publishedAt,
        stepsCount: zone._count?.steps || 0
      }))
    }
    
    return NextResponse.json({
      success: true,
      data: transformedProperty
    })
    
  } catch (error) {
    console.error('Error fetching property:', error)
    console.error('Error details:', {
      propertyId: id,
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    // Try safe method as fallback
    try {
      console.log('🔄 Attempting safe property fetch as fallback...')
      
      const safeProperties = await prisma.$queryRaw`
        SELECT 
          id, name, slug, description, type,
          street, city, state, country, "postalCode",
          bedrooms, bathrooms, "maxGuests", "squareMeters",
          "profileImage", "hostContactName", "hostContactPhone",
          "hostContactEmail", "hostContactLanguage", "hostContactPhoto",
          status, "isPublished", "propertySetId", "hostId",
          "createdAt", "updatedAt", "publishedAt"
        FROM properties
        WHERE id LIKE ${id + '%'}
          AND "hostId" = ${userId}
        LIMIT 1
      ` as any[]
      
      const safeProperty = safeProperties[0]
      
      if (safeProperty) {
        // Get zones count safely
        const zonesCount = await prisma.$queryRaw`
          SELECT COUNT(*) as count
          FROM zones
          WHERE "propertyId" = ${safeProperty.id}
        ` as any[]
        
        const count = Number(zonesCount[0]?.count || 0)
        
        const fallbackResult = {
          ...safeProperty,
          zonesCount: count,
          totalViews: 0,
          avgRating: 0,
          zones: [] // Empty zones array for fallback
        }
        
        console.log('✅ Safe fallback successful')
        
        return NextResponse.json({
          success: true,
          data: fallbackResult,
          fallback: true
        })
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError)
    }
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
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
    console.log('🗑️ DELETE property request - ID:', id)
    
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      console.log('❌ Auth failed for property deletion')
      return authResult
    }
    const userId = authResult.userId
    console.log('✅ Auth successful - User ID:', userId)
    
    // Set JWT claims for PostgreSQL RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`
    
    // First, let's find the property with more detailed logging
    console.log('🔍 Looking for property with ID:', id, 'and hostId:', userId)
    
    const property = await prisma.property.findFirst({
      where: {
        id,
        hostId: userId
      },
      include: {
        zones: {
          include: {
            steps: true
          }
        }
      }
    })
    
    if (!property) {
      console.log('❌ Property not found or user not authorized')
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada'
      }, { status: 404 })
    }
    
    console.log('✅ Property found:', property.name, 'with', property.zones.length, 'zones')
    
    // Manual deletion to handle any cascade issues
    try {
      // First delete all steps
      for (const zone of property.zones) {
        console.log('🗑️ Deleting', zone.steps.length, 'steps from zone:', zone.name)
        await prisma.step.deleteMany({
          where: { zoneId: zone.id }
        })
      }
      
      // Then delete all zones
      console.log('🗑️ Deleting', property.zones.length, 'zones')
      await prisma.zone.deleteMany({
        where: { propertyId: id }
      })
      
      // Delete property analytics if exists
      console.log('🗑️ Deleting property analytics')
      await prisma.propertyAnalytics.deleteMany({
        where: { propertyId: id }
      })
      
      // Finally delete the property
      console.log('🗑️ Deleting property')
      await prisma.property.delete({
        where: { id }
      })
      
      console.log('✅ Property deleted successfully')
      
    } catch (deleteError) {
      console.error('❌ Error during manual deletion:', deleteError)
      throw deleteError
    }
    
    return NextResponse.json({
      success: true,
      message: 'Propiedad eliminada exitosamente'
    })
    
  } catch (error) {
    console.error('❌ Error deleting property:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}