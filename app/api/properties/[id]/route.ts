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

    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    userId = authResult.userId

    // OPTIMIZED: Single query to get property with zones and step counts
    const result = await prisma.$queryRaw`
      SELECT
        p.id, p.name, p.slug, p.description, p.type,
        p.street, p.city, p.state, p.country, p."postalCode",
        p.bedrooms, p.bathrooms, p."maxGuests", p."squareMeters",
        p."profileImage", p."hostContactName", p."hostContactPhone",
        p."hostContactEmail", p."hostContactLanguage", p."hostContactPhoto",
        p.status, p."isPublished", p."propertySetId", p."hostId",
        p."createdAt", p."updatedAt", p."publishedAt",
        p."propertyCode",
        COALESCE(
          json_agg(
            json_build_object(
              'id', z.id,
              'name', z.name,
              'slug', z.slug,
              'icon', z.icon,
              'description', z.description,
              'color', z.color,
              'status', z.status,
              'isPublished', z."isPublished",
              'propertyId', z."propertyId",
              'createdAt', z."createdAt",
              'updatedAt', z."updatedAt",
              'publishedAt', z."publishedAt",
              'stepsCount', COALESCE(sc.steps_count, 0)
            ) ORDER BY z.id ASC
          ) FILTER (WHERE z.id IS NOT NULL),
          '[]'::json
        ) as zones
      FROM properties p
      LEFT JOIN zones z ON z."propertyId" = p.id
      LEFT JOIN (
        SELECT "zoneId", COUNT(*)::integer as steps_count
        FROM steps
        GROUP BY "zoneId"
      ) sc ON sc."zoneId" = z.id
      WHERE p.id LIKE ${id + '%'} AND p."hostId" = ${userId}
      GROUP BY p.id
      LIMIT 1
    ` as any[]

    const property = result[0]

    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada'
      }, { status: 404 })
    }

    // Transform data
    const transformedProperty = {
      ...property,
      zonesCount: property.zones?.length || 0,
      totalViews: 0,
      avgRating: 0
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
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead
    
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
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead
    
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
    console.log('💥 NUCLEAR DELETE MODE ACTIVATED - Property ID:', id)
    
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    
    // Verify user owns this property first with simple query
    const ownerCheck = await prisma.$queryRaw`
      SELECT id FROM properties WHERE id = ${id} AND "hostId" = ${userId}
    ` as any[]
    
    if (ownerCheck.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada o no autorizada'
      }, { status: 404 })
    }
    
    console.log('💥 NUCLEAR DELETE: Confirmed ownership, proceeding with total destruction...')
    
    // 💥💥💥 ELIMINACIÓN NUCLEAR - SQL DIRECTO SIN MIRAMIENTOS 💥💥💥
    try {
      await prisma.$transaction(async (tx) => {
      console.log('💥 Step 1: Eliminating steps...')
      await tx.$executeRaw`
        DELETE FROM steps WHERE "zoneId" IN (
          SELECT id FROM zones WHERE "propertyId" = ${id}
        )
      `
      
      console.log('💥 Step 2: Eliminating zone comments...')
      await tx.$executeRaw`
        DELETE FROM zone_comments WHERE "zoneId" IN (
          SELECT id FROM zones WHERE "propertyId" = ${id}
        )
      `
      
      console.log('💥 Step 3: Eliminating zone ratings...')
      await tx.$executeRaw`
        DELETE FROM zone_ratings WHERE "zoneId" IN (
          SELECT id FROM zones WHERE "propertyId" = ${id}
        )
      `
      
      console.log('💥 Step 4: Eliminating error reports...')
      await tx.$executeRaw`
        DELETE FROM error_reports WHERE "zoneId" IN (
          SELECT id FROM zones WHERE "propertyId" = ${id}
        )
      `
      
      console.log('💥 Step 5: Eliminating zone analytics...')
      await tx.$executeRaw`
        DELETE FROM zone_analytics WHERE "zoneId" IN (
          SELECT id FROM zones WHERE "propertyId" = ${id}
        )
      `
      
      console.log('💥 Step 6: Eliminating zone views...')
      await tx.$executeRaw`DELETE FROM zone_views WHERE "propertyId" = ${id}`
      
      console.log('💥 Step 7: Eliminating zones...')
      await tx.$executeRaw`DELETE FROM zones WHERE "propertyId" = ${id}`
      
      console.log('💥 Step 8: Eliminating property analytics...')
      await tx.$executeRaw`DELETE FROM property_analytics WHERE "propertyId" = ${id}`
      
      console.log('💥 Step 9: Eliminating property ratings...')
      await tx.$executeRaw`DELETE FROM property_ratings WHERE "propertyId" = ${id}`
      
      console.log('💥 Step 10: Eliminating property views...')
      await tx.$executeRaw`DELETE FROM property_views WHERE "propertyId" = ${id}`
      
      console.log('💥 Step 11: Eliminating reviews...')
      await tx.$executeRaw`DELETE FROM reviews WHERE "propertyId" = ${id}`
      
      console.log('💥 Step 12: Eliminating tracking events...')
      await tx.$executeRaw`DELETE FROM tracking_events WHERE "propertyId" = ${id}`
      
      console.log('💥 Step 13: Eliminating announcements...')
      await tx.$executeRaw`DELETE FROM announcements WHERE "propertyId" = ${id}`
      
      console.log('💥 FINAL NUCLEAR STRIKE: Eliminating property...')
      await tx.$executeRaw`DELETE FROM properties WHERE id = ${id}`
    })
    
    console.log('💥💥💥 NUCLEAR DELETE SUCCESSFUL - Property completely obliterated! 💥💥💥')
    } catch (txError) {
      console.error('💥 TRANSACTION ERROR:', txError)
      
      // If transaction fails, try deleting just the property
      console.log('💥 Attempting simple property deletion...')
      try {
        await prisma.$executeRaw`DELETE FROM properties WHERE id = ${id} AND "hostId" = ${userId}`
        console.log('💥 Simple deletion successful!')
      } catch (simpleError) {
        console.error('💥 Simple deletion also failed:', simpleError)
        
        // Return more specific error info
        if (txError instanceof Error && txError.message.includes('violates foreign key constraint')) {
          const match = txError.message.match(/on table "(\w+)"/)
          const table = match ? match[1] : 'unknown'
          
          return NextResponse.json({
            success: false,
            error: `Cannot delete: Data exists in related table '${table}'`,
            details: txError.message,
            suggestion: 'Delete all zones and related data first'
          }, { status: 400 })
        }
        
        throw txError
      }
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