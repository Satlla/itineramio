import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../src/lib/prisma'

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
    // Get user from JWT token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const userId = decoded.userId

    const body = await request.json()
    
    console.log('Creating property with data:', body)
    
    // Validate request data
    const validatedData = createPropertySchema.parse(body)
    
    console.log('Validated data:', validatedData)
    console.log('User ID:', userId)
    
    // Create property in database
    const property = await prisma.property.create({
      data: {
        // Basic info
        name: validatedData.name,
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
    
    // Zones will be created separately when user navigates to zones page
    
    return NextResponse.json({
      success: true,
      data: property
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating property:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Datos de entrada inválidos',
        details: error.errors
      }, { status: 400 })
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