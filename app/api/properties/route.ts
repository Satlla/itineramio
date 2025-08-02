import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../src/lib/prisma'
import { generateSlug, generateUniqueSlug } from '../../../src/lib/slug-utils'
import { requireAuth } from '../../../src/lib/auth'

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
  hostContactPhoto: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/properties - Start')
    
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Set JWT claims for PostgreSQL RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`

    const body = await request.json()
    
    console.log('Creating property with data:', body)
    
    // Validate request data
    const validatedData = createPropertySchema.parse(body)
    
    console.log('Validated data:', validatedData)
    console.log('User ID:', userId)
    
    // Generate unique slug efficiently (no need to fetch all properties)
    const baseSlug = generateSlug(validatedData.name)
    console.log('Generated base slug:', baseSlug)
    
    let uniqueSlug = baseSlug
    let slugSuffix = 0
    
    // Efficient slug generation - only check specific slugs
    while (true) {
      try {
        const testSlug = slugSuffix === 0 ? baseSlug : `${baseSlug}-${slugSuffix}`
        const existing = await prisma.property.findUnique({
          where: { slug: testSlug },
          select: { id: true }
        })
        
        if (!existing) {
          uniqueSlug = testSlug
          break
        }
        
        slugSuffix++
        if (slugSuffix > 100) {
          throw new Error('Unable to generate unique slug after 100 attempts')
        }
      } catch (dbError: any) {
        if (dbError.message.includes('Unable to generate unique slug')) {
          throw dbError
        }
        console.error('Error checking slug uniqueness:', dbError)
        throw new Error('Database connection error')
      }
    }
    
    console.log('Generated unique slug:', uniqueSlug)
    
    // Create property in database
    console.log('Attempting to create property in database...')
    const property = await prisma.property.create({
      data: {
        // Basic info
        name: validatedData.name,
        slug: uniqueSlug,
        description: validatedData.description,
        type: validatedData.type,
        
        // Address
        street: validatedData.street,
        city: validatedData.city,
        state: validatedData.state,
        country: validatedData.country,
        postalCode: validatedData.postalCode,
        
        // Characteristics
        bedrooms: validatedData.bedrooms,
        bathrooms: validatedData.bathrooms,
        maxGuests: validatedData.maxGuests,
        squareMeters: validatedData.squareMeters,
        
        // Property image
        profileImage: validatedData.profileImage,
        
        // Host contact
        hostContactName: validatedData.hostContactName,
        hostContactPhone: validatedData.hostContactPhone,
        hostContactEmail: validatedData.hostContactEmail,
        hostContactLanguage: validatedData.hostContactLanguage,
        hostContactPhoto: validatedData.hostContactPhoto,
        
        // Default values
        status: 'DRAFT',
        isPublished: false,
        
        // Associate with authenticated user
        hostId: userId,
        
        // Create analytics record
        analytics: {
          create: {}
        },
        
        // Timestamps are handled automatically by Prisma
      },
      include: {
        analytics: true
      }
    })
    
    console.log('Property created successfully:', property.id)
    
    // NO longer auto-creating zones - they are created on demand via modal
    
    return NextResponse.json({
      success: true,
      data: property
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating property:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Datos de entrada inválidos',
        details: error.errors
      }, { status: 400 })
    }
    
    // Check for Prisma errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({
        success: false,
        error: 'Ya existe una propiedad con ese nombre. Por favor, elige otro nombre.',
        details: error.message
      }, { status: 400 })
    }
    
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json({
        success: false,
        error: 'Error de autenticación. Por favor, inicia sesión nuevamente.',
        details: error.message
      }, { status: 401 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Set JWT claims for PostgreSQL RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const propertySetId = searchParams.get('propertySetId')
    const filter = searchParams.get('filter')
    
    // Build where clause
    const where: any = {
      hostId: userId
    }
    
    if (status) {
      where.status = status
    }
    
    if (type) {
      where.type = type
    }

    if (propertySetId) {
      where.propertySetId = propertySetId
    }

    // Handle filter for standalone properties (not in any set)
    if (filter === 'standalone') {
      where.propertySetId = null
    }
    
    // Get properties with zones count in a single query
    const properties = await prisma.property.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc'  // Most recent first
      },
      include: {
        analytics: true,
        propertySet: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            zones: true
          }
        }
      }
    })
    
    const total = await prisma.property.count({ where })
    
    // Log the first few properties to verify ordering
    console.log('Properties order (showing first 3):')
    properties.slice(0, 3).forEach((prop, index) => {
      console.log(`${index + 1}. ${prop.name} - Created: ${prop.createdAt}`)
    })

    // Transform properties data without additional queries
    const propertiesWithZones = properties.map((property) => {
      try {
        return {
          id: property.id,
          name: property.name,
          slug: property.slug,
          description: property.description,
          type: property.type,
          city: property.city,
          state: property.state,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          maxGuests: property.maxGuests,
          zonesCount: property._count?.zones || 0,
          totalViews: property.analytics?.totalViews || 0,
          avgRating: property.analytics?.overallRating || 0,
          status: property.status,
          createdAt: property.createdAt,
          updatedAt: property.updatedAt,
          isPublished: property.isPublished,
          profileImage: property.profileImage,
          propertySetId: property.propertySetId,
          propertySet: property.propertySet,
          hostContactName: property.hostContactName,
          hostContactPhoto: property.hostContactPhoto
        }
      } catch (error) {
        console.error('Error transforming property:', property.id, error)
        throw error
      }
    })
    
    return NextResponse.json({
      success: true,
      data: propertiesWithZones,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    console.error('Error fetching properties:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}