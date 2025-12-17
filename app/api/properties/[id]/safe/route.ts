import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../src/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🔍 Safe Property endpoint - received ID:', id)
    
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    
    // Set JWT claims for PostgreSQL RLS policies
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead
    
    // Use raw SQL to avoid Prisma trying to fetch non-existent columns
    const properties = await prisma.$queryRaw`
      SELECT
        id, name, "nameTranslations", slug, description, "descriptionTranslations", type,
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
    
    const property = properties[0]
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada'
      }, { status: 404 })
    }
    
    // Get zones safely
    const zones = await prisma.$queryRaw`
      SELECT 
        id, name, slug, icon, description, color,
        status, "isPublished", "propertyId",
        "createdAt", "updatedAt", "publishedAt",
        (SELECT COUNT(*) FROM steps WHERE steps."zoneId" = zones.id) as "stepsCount"
      FROM zones
      WHERE "propertyId" = ${property.id}
      ORDER BY id ASC
    ` as any[]
    
    // Get analytics safely
    const analyticsResult = await prisma.$queryRaw`
      SELECT "totalViews", "overallRating"
      FROM property_analytics
      WHERE "propertyId" = ${property.id}
      LIMIT 1
    ` as any[]
    
    const analytics = analyticsResult[0] || { totalViews: 0, overallRating: 0 }
    
    // Transform data
    const transformedProperty = {
      ...property,
      zonesCount: zones.length,
      totalViews: analytics.totalViews || 0,
      avgRating: analytics.overallRating || 0,
      zones: zones.map((zone: any) => ({
        ...zone,
        stepsCount: Number(zone.stepsCount) || 0
      }))
    }
    
    return NextResponse.json({
      success: true,
      data: transformedProperty
    })
    
  } catch (error) {
    console.error('Error fetching property (safe):', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT /api/properties/[id]/safe - Safe update property
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('✅ SAFE PUT /properties/[id] endpoint called')
  
  try {
    const { id } = await params
    const body = await request.json()
    console.log('✅ SAFE PUT - Params:', { id })
    console.log('✅ SAFE PUT - Body keys:', Object.keys(body))
    
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      console.log('✅ SAFE PUT - Auth failed')
      return authResult
    }
    const userId = authResult.userId
    console.log('✅ SAFE PUT - Auth success, userId:', userId)
    
    // Set RLS config (ignore if fails)
    try {
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead
    } catch (e) {
      console.log('✅ SAFE PUT - RLS skipped:', String(e))
    }
    
    // Find property with raw SQL (handle potential ID truncation)
    const properties = await prisma.$queryRaw`
      SELECT id FROM properties 
      WHERE (id = ${id} OR id LIKE ${id + '%'}) 
      AND "hostId" = ${userId}
      LIMIT 1
    ` as any[]
    
    if (properties.length === 0) {
      console.log('✅ SAFE PUT - Property not found')
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada o no autorizada'
      }, { status: 404 })
    }
    
    const actualPropertyId = properties[0].id
    console.log('✅ SAFE PUT - Property found:', actualPropertyId)
    
    // Handle propertySetId update specifically
    if (body.propertySetId !== undefined) {
      console.log('✅ SAFE PUT - Updating propertySetId to:', body.propertySetId)
      
      if (body.propertySetId === null || body.propertySetId === '') {
        // Remove from property set
        await prisma.$executeRaw`
          UPDATE properties 
          SET "propertySetId" = NULL, "updatedAt" = NOW()
          WHERE id = ${actualPropertyId}
        `
      } else {
        // Add to property set - verify it exists and belongs to user
        const propertySets = await prisma.$queryRaw`
          SELECT id FROM property_sets 
          WHERE id = ${body.propertySetId} AND "hostId" = ${userId}
          LIMIT 1
        ` as any[]
        
        if (propertySets.length === 0) {
          console.log('✅ SAFE PUT - Property set not found or unauthorized')
          return NextResponse.json({
            success: false,
            error: 'Conjunto de propiedades no encontrado o no autorizado'
          }, { status: 404 })
        }
        
        await prisma.$executeRaw`
          UPDATE properties 
          SET "propertySetId" = ${body.propertySetId}, "updatedAt" = NOW()
          WHERE id = ${actualPropertyId}
        `
      }
    }
    
    // Handle translations specifically
    console.log('✅ SAFE PUT - Checking translations:', {
      nameEn: body.nameEn,
      nameFr: body.nameFr,
      descriptionEn: body.descriptionEn,
      descriptionFr: body.descriptionFr
    })

    // Always update translations if any translation field is present in the body
    const nameTranslations: Record<string, string> = {}
    if (body.nameEn && body.nameEn.trim()) nameTranslations.en = String(body.nameEn).trim()
    if (body.nameFr && body.nameFr.trim()) nameTranslations.fr = String(body.nameFr).trim()

    const descriptionTranslations: Record<string, string> = {}
    if (body.descriptionEn && body.descriptionEn.trim()) descriptionTranslations.en = String(body.descriptionEn).trim()
    if (body.descriptionFr && body.descriptionFr.trim()) descriptionTranslations.fr = String(body.descriptionFr).trim()

    // Update name translations
    const nameTranslationsJson = Object.keys(nameTranslations).length > 0 ? JSON.stringify(nameTranslations) : null
    console.log('✅ SAFE PUT - nameTranslationsJson:', nameTranslationsJson)

    await prisma.$executeRaw`
      UPDATE properties
      SET "nameTranslations" = ${nameTranslationsJson}::jsonb, "updatedAt" = NOW()
      WHERE id = ${actualPropertyId}
    `
    console.log('✅ SAFE PUT - Updated nameTranslations')

    // Update description translations
    const descriptionTranslationsJson = Object.keys(descriptionTranslations).length > 0 ? JSON.stringify(descriptionTranslations) : null
    console.log('✅ SAFE PUT - descriptionTranslationsJson:', descriptionTranslationsJson)

    await prisma.$executeRaw`
      UPDATE properties
      SET "descriptionTranslations" = ${descriptionTranslationsJson}::jsonb, "updatedAt" = NOW()
      WHERE id = ${actualPropertyId}
    `
    console.log('✅ SAFE PUT - Updated descriptionTranslations')

    // Handle other fields if present
    const allowedFields = [
      'name', 'description', 'type', 'street', 'city', 'state',
      'country', 'postalCode', 'bedrooms', 'bathrooms', 'maxGuests',
      'squareMeters', 'profileImage', 'hostContactName', 'hostContactPhone',
      'hostContactEmail', 'hostContactLanguage', 'hostContactPhoto',
      'status', 'isPublished'
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined && field !== 'propertySetId') {
        console.log(`✅ SAFE PUT - Updating ${field} to:`, body[field])

        await prisma.$executeRawUnsafe(`
          UPDATE properties
          SET "${field}" = $1, "updatedAt" = NOW()
          WHERE id = $2
        `, body[field], actualPropertyId)
      }
    }
    
    // Get updated property
    const updatedProperty = await prisma.$queryRaw`
      SELECT * FROM properties WHERE id = ${actualPropertyId}
      LIMIT 1
    ` as any[]
    
    console.log('✅ SAFE PUT - Property updated successfully')
    
    return NextResponse.json({
      success: true,
      data: updatedProperty[0],
      message: 'Propiedad actualizada correctamente'
    })
    
  } catch (error) {
    console.error('✅ SAFE PUT - Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al actualizar la propiedad',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}