import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAuth } from '../../../../src/lib/auth'

// POST /api/properties/ultra-safe - Ultra minimal property creation
export async function POST(request: NextRequest) {
  try {
    // Step 1: Get body
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body'
      }, { status: 400 })
    }

    // Step 2: Get authenticated user
    let userId
    try {
      const authResult = await requireAuth(request)
      if (authResult instanceof Response) {
        return authResult
      }
      userId = authResult.userId
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Authentication failed'
      }, { status: 401 })
    }

    // Step 3: Basic field validation
    const requiredFields = ['name', 'description', 'street', 'city', 'hostContactName']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`
        }, { status: 400 })
      }
    }
    // Step 4: Generate simple slug
    let slug
    try {
      slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

      if (!slug) slug = 'property'
      slug = `${slug}-${Date.now()}`
    } catch {
      slug = `property-${Date.now()}`
    }

    // Step 5: Generate property ID
    const propertyId = `prop-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

    // Step 6: Try to create property with minimal fields only
    try {
      
      await prisma.$executeRaw`
        INSERT INTO properties (
          id, 
          name, 
          slug,
          description, 
          type,
          street, 
          city, 
          state, 
          country, 
          "postalCode",
          bedrooms, 
          bathrooms, 
          "maxGuests",
          "hostContactName", 
          "hostContactPhone", 
          "hostContactEmail",
          "profileImage",
          "hostContactPhoto",
          status, 
          "isPublished",
          "hostId",
          "createdAt", 
          "updatedAt"
        ) VALUES (
          ${propertyId},
          ${body.name},
          ${slug},
          ${body.description},
          ${body.type || 'APARTMENT'},
          ${body.street},
          ${body.city},
          ${body.state || 'Madrid'},
          ${body.country || 'España'},
          ${body.postalCode || '28001'},
          ${body.bedrooms || 2},
          ${body.bathrooms || 1},
          ${body.maxGuests || 4},
          ${body.hostContactName},
          ${body.hostContactPhone || '+34600000000'},
          ${body.hostContactEmail || 'host@example.com'},
          ${body.profileImage || null},
          ${body.hostContactPhoto || null},
          'DRAFT',
          false,
          ${userId},
          NOW(),
          NOW()
        )
      `
      
    } catch (insertError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to insert property',
        details: insertError instanceof Error ? insertError.message : String(insertError)
      }, { status: 500 })
    }

    // Step 7: Try to fetch the created property
    let createdProperty
    try {
      const result = await prisma.$queryRaw`
        SELECT * FROM properties WHERE id = ${propertyId} LIMIT 1
      ` as any[]
      
      createdProperty = result[0]

    } catch {
      // Don't fail here, just return basic info
      createdProperty = { id: propertyId, name: body.name }
    }

    return NextResponse.json({
      success: true,
      data: createdProperty,
      message: 'Property created successfully'
    })
    
  } catch (generalError) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: generalError instanceof Error ? generalError.message : String(generalError)
    }, { status: 500 })
  }
}