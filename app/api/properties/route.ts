import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../src/lib/prisma'
import { generateSlug, generateUniqueSlug } from '../../../src/lib/slug-utils'
import { essentialTemplates } from '../../../src/data/essentialTemplates'
import { requireAuth } from '../../../src/lib/auth'

// Validation schema for property creation
// Common zones that can be offered to users
const COMMON_ZONES = [
  { name: 'WiFi', iconId: 'wifi', description: 'Contraseña y conexión a internet', order: 1 },
  { name: 'Check-in', iconId: 'door', description: 'Proceso de entrada y llaves', order: 2 },
  { name: 'Check-out', iconId: 'exit', description: 'Proceso de salida', order: 3 },
  { name: 'Información General', iconId: 'info', description: 'Normas y datos importantes', order: 4 },
  { name: 'Parking', iconId: 'car', description: 'Dónde aparcar y cómo acceder', order: 5 },
  { name: 'Teléfonos de interés', iconId: 'phone', description: 'Emergencias y contactos útiles', order: 6 }
]

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
    
    // Generate unique slug for the property (optimized)
    const baseSlug = generateSlug(validatedData.name)
    console.log('Generated base slug:', baseSlug)
    
    // Check slug uniqueness efficiently using database constraints
    let uniqueSlug = baseSlug
    let slugSuffix = 0
    
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
          throw new Error('Unable to generate unique slug')
        }
      } catch (dbError: any) {
        if (dbError.message === 'Unable to generate unique slug') {
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
    
    // Auto-create essential zones from templates (optimized with transaction)
    console.log('Creating essential zones from templates...')
    try {
      await prisma.$transaction(async (tx) => {
        // Prepare zones data for batch creation
        const zonesData = essentialTemplates.map((template) => {
          const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase()
          return {
            name: { es: template.name, en: template.name },
            description: { es: template.description, en: template.description },
            icon: template.icon,
            order: template.order,
            status: 'ACTIVE' as const,
            isPublished: true,
            propertyId: property.id,
            qrCode: `https://itineramio.com/z/${accessCode}`,
            accessCode: accessCode,
            viewCount: 0,
            slug: `${uniqueSlug}-${generateSlug(template.name)}`
          }
        })
        
        // Create all zones in batch
        const createdZones = await Promise.all(
          zonesData.map((zoneData) => tx.zone.create({ data: zoneData }))
        )
        
        // Prepare steps data for batch creation
        const allStepsData: any[] = []
        createdZones.forEach((zone, zoneIndex) => {
          const template = essentialTemplates[zoneIndex]
          template.steps.forEach((stepTemplate) => {
            allStepsData.push({
              type: stepTemplate.media_type,
              title: { es: stepTemplate.title, en: stepTemplate.title },
              content: {
                text: stepTemplate.description,
                mediaUrl: stepTemplate.content.mediaUrl,
                thumbnail: stepTemplate.content.thumbnail,
                duration: stepTemplate.content.duration
              },
              order: stepTemplate.order,
              zoneId: zone.id,
              isPublished: true
            })
          })
        })
        
        // Create all steps in batches of 50 to avoid query limits
        const batchSize = 50
        for (let i = 0; i < allStepsData.length; i += batchSize) {
          const batch = allStepsData.slice(i, i + batchSize)
          await Promise.all(
            batch.map((stepData) => tx.step.create({ data: stepData }))
          )
        }
        
        console.log(`Created ${createdZones.length} essential zones with ${allStepsData.length} steps`)
      })
    } catch (zoneError) {
      console.error('Error creating essential zones:', zoneError)
      // Don't fail the property creation if zones fail, just log the error
    }
    
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
    
    // Get properties with zones count in a single query
    const properties = await prisma.property.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc'
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
    
    // Transform properties data without additional queries
    const propertiesWithZones = properties.map((property) => ({
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
      zonesCount: property._count.zones,
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
    }))
    
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