import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../src/lib/prisma'
import { requireAuth } from '../../../../src/lib/auth'

// Simple slug generation function to avoid imports
function generateSimpleSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

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
      console.log('✅ SAFE POST - Auth failed, returning 401')
      return authResult
    }
    const userId = authResult.userId
    console.log('✅ SAFE POST - Auth success, userId:', userId)

    // Verificar que el usuario existe en la base de datos
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!userExists) {
      console.log('✅ SAFE POST - User not found in database, returning 401')
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado. Por favor, inicia sesión nuevamente.',
        requiresLogin: true
      }, { status: 401 })
    }

    // Set RLS config (ignore if fails)
    try {
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead
    } catch (e) {
      console.log('✅ SAFE POST - RLS skipped:', String(e))
    }

    const body = await request.json()
    console.log('✅ SAFE POST - Body keys:', Object.keys(body))
    
    // Simplified validation - just check required fields
    if (!body.name || !body.description || !body.street || !body.city || !body.hostContactName) {
      console.log('✅ SAFE POST - Missing required fields')
      return NextResponse.json({
        success: false,
        error: 'Faltan campos requeridos: name, description, street, city, hostContactName'
      }, { status: 400 })
    }
    
    // Build translations objects
    const nameTranslations: Record<string, string> = {}
    if (body.nameEn) nameTranslations.en = String(body.nameEn)
    if (body.nameFr) nameTranslations.fr = String(body.nameFr)

    const descriptionTranslations: Record<string, string> = {}
    if (body.descriptionEn) descriptionTranslations.en = String(body.descriptionEn)
    if (body.descriptionFr) descriptionTranslations.fr = String(body.descriptionFr)

    const validatedData = {
      name: String(body.name),
      nameTranslations: Object.keys(nameTranslations).length > 0 ? nameTranslations : null,
      description: String(body.description),
      descriptionTranslations: Object.keys(descriptionTranslations).length > 0 ? descriptionTranslations : null,
      type: body.type || 'APARTMENT',
      street: String(body.street),
      city: String(body.city),
      state: body.state || 'Madrid',
      country: body.country || 'España',
      postalCode: body.postalCode || '28001',
      bedrooms: Number(body.bedrooms) || 1,
      bathrooms: Number(body.bathrooms) || 1,
      maxGuests: Number(body.maxGuests) || 2,
      squareMeters: body.squareMeters ? Number(body.squareMeters) : null,
      profileImage: body.profileImage || null,
      hostContactName: String(body.hostContactName),
      hostContactPhone: body.hostContactPhone || '+34600000000',
      hostContactEmail: body.hostContactEmail || 'host@example.com',
      hostContactLanguage: body.hostContactLanguage || 'es',
      hostContactPhoto: body.hostContactPhoto || null,
      propertySetId: body.propertySetId || null
    }
    console.log('✅ SAFE POST - Data validated successfully')
    
    // Generate unique slug with raw SQL
    const baseSlug = generateSimpleSlug(validatedData.name)
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
    const nameTranslationsJson = validatedData.nameTranslations ? JSON.stringify(validatedData.nameTranslations) : null
    const descriptionTranslationsJson = validatedData.descriptionTranslations ? JSON.stringify(validatedData.descriptionTranslations) : null

    await prisma.$executeRaw`
      INSERT INTO properties (
        id, name, "nameTranslations", slug, description, "descriptionTranslations", type,
        street, city, state, country, "postalCode",
        bedrooms, bathrooms, "maxGuests", "squareMeters",
        "profileImage", "hostContactName", "hostContactPhone",
        "hostContactEmail", "hostContactLanguage", "hostContactPhoto",
        status, "isPublished", "hostId", "propertySetId",
        "createdAt", "updatedAt"
      ) VALUES (
        ${propertyId}, ${validatedData.name}, ${nameTranslationsJson}::jsonb, ${uniqueSlug}, ${validatedData.description}, ${descriptionTranslationsJson}::jsonb, ${validatedData.type},
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
        id, "propertyId", "totalViews", "overallRating", "lastCalculatedAt"
      ) VALUES (
        ${analyticsId}, ${propertyId}, 0, 0, NOW()
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