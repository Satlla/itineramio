import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../src/lib/prisma'
import { generateSlug, generateUniqueSlug } from '../../../src/lib/slug-utils'
import { essentialTemplates } from '../../../src/data/essentialTemplates'

const JWT_SECRET = 'itineramio-secret-key-2024'

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
    
    // Get user from JWT token
    const token = request.cookies.get('auth-token')?.value
    console.log('Auth token present:', !!token)
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let decoded: { userId: string }
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      console.log('JWT decoded successfully, userId:', decoded.userId)
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError)
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }
    
    const userId = decoded.userId

    // Set JWT claims for PostgreSQL RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`

    const body = await request.json()
    
    console.log('Creating property with data:', body)
    
    // Validate request data
    const validatedData = createPropertySchema.parse(body)
    
    console.log('Validated data:', validatedData)
    console.log('User ID:', userId)
    
    // Generate unique slug for the property
    const baseSlug = generateSlug(validatedData.name)
    console.log('Generated base slug:', baseSlug)
    
    let existingSlugs: string[] = []
    try {
      const existingProperties = await prisma.property.findMany({
        where: { slug: { not: null } },
        select: { slug: true }
      })
      existingSlugs = existingProperties.map(r => r.slug).filter(Boolean) as string[]
      console.log('Found existing slugs:', existingSlugs.length)
    } catch (dbError) {
      console.error('Error fetching existing slugs:', dbError)
      throw new Error('Database connection error')
    }
    
    const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs)
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
    
    // Auto-create essential zones from templates
    console.log('Creating essential zones from templates...')
    try {
      const createdZones = []
      
      for (const template of essentialTemplates) {
        // Create the zone
        const zone = await prisma.zone.create({
          data: {
            name: { es: template.name, en: template.name },
            description: { es: template.description, en: template.description },
            icon: template.icon,
            order: template.order,
            status: 'ACTIVE',
            isPublished: true,
            propertyId: property.id,
            isSystemTemplate: true, // Mark as system template
            viewCount: 0
          }
        })
        
        // Create steps for this zone
        for (const stepTemplate of template.steps) {
          await prisma.step.create({
            data: {
              title: stepTemplate.title,
              description: stepTemplate.description,
              content: {
                type: stepTemplate.media_type,
                text: stepTemplate.content.text,
                mediaUrl: stepTemplate.content.mediaUrl,
                thumbnail: stepTemplate.content.thumbnail,
                duration: stepTemplate.content.duration
              },
              order: stepTemplate.order,
              zoneId: zone.id,
              isVisible: true,
              templateVariables: stepTemplate.variables // Store variables for user customization
            }
          })
        }
        
        createdZones.push({
          id: zone.id,
          name: template.name,
          stepsCount: template.steps.length
        })
      }
      
      console.log(`Created ${createdZones.length} essential zones with steps`)
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
    // Get user from JWT token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const userId = decoded.userId

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