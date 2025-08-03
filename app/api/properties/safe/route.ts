import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../src/lib/prisma'
import { generateSlug } from '../../../../src/lib/slug-utils'
import { requireAuth } from '../../../../src/lib/auth'

// Validation schema for property creation
const createPropertySchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  type: z.enum(['APARTMENT', 'HOUSE', 'ROOM', 'VILLA']),
  
  // Address
  street: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  country: z.string().default('España'),
  postalCode: z.string().regex(/^[0-9]{5}$/),
  
  // Characteristics
  bedrooms: z.coerce.number().min(0).max(20),
  bathrooms: z.coerce.number().min(0).max(10),
  maxGuests: z.coerce.number().min(1).max(50),
  squareMeters: z.coerce.number().min(10).max(1000).optional(),
  
  // Property image
  profileImage: z.string().optional(),
  
  // Host contact
  hostContactName: z.string().min(2).max(100),
  hostContactPhone: z.string().regex(/^[+]?[(]?[0-9\s\-()]{9,}$/),
  hostContactEmail: z.string().email(),
  hostContactLanguage: z.string().default('es'),
  hostContactPhoto: z.string().optional(),
  
  // Property Set Association (optional for creation)
  propertySetId: z.string().nullable().optional()
})

// POST /api/properties/safe - Safe create property
export async function POST(request: NextRequest) {
  console.log('✅ SAFE POST /properties endpoint called')
  
  try {
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      console.log('✅ SAFE POST - Auth failed')
      return authResult
    }
    const userId = authResult.userId
    console.log('✅ SAFE POST - Auth success, userId:', userId)

    // Set RLS config (ignore if fails)
    try {
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`
    } catch (e) {
      console.log('✅ SAFE POST - RLS skipped:', String(e))
    }

    const body = await request.json()
    console.log('✅ SAFE POST - Body keys:', Object.keys(body))
    
    // Validate request data
    let validatedData
    try {
      validatedData = createPropertySchema.parse(body)
      console.log('✅ SAFE POST - Data validated successfully')
    } catch (validationError) {
      console.log('✅ SAFE POST - Validation failed:', validationError)
      return NextResponse.json({
        success: false,
        error: 'Datos de entrada inválidos',
        details: validationError instanceof Error ? validationError.message : String(validationError)
      }, { status: 400 })
    }
    
    // Generate unique slug with raw SQL
    const baseSlug = generateSlug(validatedData.name)
    console.log('✅ SAFE POST - Generated base slug:', baseSlug)
    
    let uniqueSlug = baseSlug
    let slugSuffix = 0
    
    while (true) {
      const testSlug = slugSuffix === 0 ? baseSlug : `${baseSlug}-${slugSuffix}`
      
      const existing = await prisma.$queryRaw`
        SELECT id FROM properties WHERE slug = ${testSlug} LIMIT 1
      ` as any[]
      
      if (existing.length === 0) {
        uniqueSlug = testSlug
        break
      }
      
      slugSuffix++
      if (slugSuffix > 100) {
        throw new Error('Unable to generate unique slug after 100 attempts')
      }
    }
    
    console.log('✅ SAFE POST - Generated unique slug:', uniqueSlug)
    
    // Generate property ID
    const propertyId = `prop-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    console.log('✅ SAFE POST - Generated property ID:', propertyId)
    
    // Create property with raw SQL
    await prisma.$executeRaw`
      INSERT INTO properties (
        id, name, slug, description, type,
        street, city, state, country, "postalCode",
        bedrooms, bathrooms, "maxGuests", "squareMeters",
        "profileImage", "hostContactName", "hostContactPhone",
        "hostContactEmail", "hostContactLanguage", "hostContactPhoto",
        status, "isPublished", "hostId", "propertySetId",
        "createdAt", "updatedAt"
      ) VALUES (
        ${propertyId}, ${validatedData.name}, ${uniqueSlug}, ${validatedData.description}, ${validatedData.type},
        ${validatedData.street}, ${validatedData.city}, ${validatedData.state}, ${validatedData.country}, ${validatedData.postalCode},
        ${validatedData.bedrooms}, ${validatedData.bathrooms}, ${validatedData.maxGuests}, ${validatedData.squareMeters || null},
        ${validatedData.profileImage || null}, ${validatedData.hostContactName}, ${validatedData.hostContactPhone},
        ${validatedData.hostContactEmail}, ${validatedData.hostContactLanguage}, ${validatedData.hostContactPhoto || null},
        'DRAFT', false, ${userId}, ${validatedData.propertySetId || null},
        NOW(), NOW()
      )
    `
    
    // Create analytics record
    const analyticsId = `analytics-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    await prisma.$executeRaw`
      INSERT INTO property_analytics (
        id, "propertyId", "totalViews", "overallRating",
        "createdAt", "updatedAt"
      ) VALUES (
        ${analyticsId}, ${propertyId}, 0, 0,
        NOW(), NOW()
      )
    `
    
    // Get the created property
    const createdProperty = await prisma.$queryRaw`
      SELECT 
        p.*,
        pa."totalViews", pa."overallRating"
      FROM properties p
      LEFT JOIN property_analytics pa ON pa."propertyId" = p.id
      WHERE p.id = ${propertyId}
      LIMIT 1
    ` as any[]
    
    console.log('✅ SAFE POST - Property created successfully:', propertyId)
    
    return NextResponse.json({
      success: true,
      data: createdProperty[0],
      message: 'Propiedad creada correctamente'
    })
    
  } catch (error) {
    console.error('✅ SAFE POST - Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al crear la propiedad',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}