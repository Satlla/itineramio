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

    // Step 5: Create property with Prisma ORM (ID auto-generated as cuid)
    let createdProperty
    try {
      createdProperty = await prisma.property.create({
        data: {
          slug,
          name: body.name,
          description: body.description,
          type: body.type || 'APARTMENT',
          street: body.street,
          city: body.city,
          state: body.state || 'Madrid',
          country: body.country || 'España',
          postalCode: body.postalCode || '28001',
          bedrooms: body.bedrooms || 2,
          bathrooms: body.bathrooms || 1,
          maxGuests: body.maxGuests || 4,
          hostContactName: body.hostContactName,
          hostContactPhone: body.hostContactPhone || '+34600000000',
          hostContactEmail: body.hostContactEmail || 'host@example.com',
          profileImage: body.profileImage || null,
          hostContactPhoto: body.hostContactPhoto || null,
          status: 'DRAFT',
          isPublished: false,
          hostId: userId,
        }
      })
    } catch (insertError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to insert property',
        details: insertError instanceof Error ? insertError.message : String(insertError)
      }, { status: 500 })
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