import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../src/lib/prisma'
import { generateSlug, generateUniqueSlug } from '../../../src/lib/slug-utils'
import { requireAuth } from '../../../src/lib/auth'
import { emailNotificationService } from '../../../src/lib/email-notifications'

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
    
    // Auto-create essential zones for new properties to improve UX for new users
    try {
      console.log('🏠 Auto-creating essential zones for new property:', property.id)
      
      const zonasEsenciales = [
        { name: 'Check In', description: 'Proceso de entrada al apartamento', icon: 'key' },
        { name: 'WiFi', description: 'Información de conexión a internet', icon: 'wifi' },
        { name: 'Check Out', description: 'Instrucciones para la salida', icon: 'exit' },
        { name: 'Cómo Llegar', description: 'Direcciones desde aeropuerto, estación y ubicación exacta', icon: 'map-pin' },
        { name: 'Normas de la Casa', description: 'Reglas y políticas del apartamento', icon: 'list' },
        { name: 'Parking', description: 'Información sobre aparcamiento', icon: 'car' },
        { name: 'Climatización', description: 'Aire acondicionado y calefacción', icon: 'thermometer' },
        { name: 'Teléfonos de Emergencia', description: 'Contactos importantes y anfitrión', icon: 'phone' },
        { name: 'Transporte Público', description: 'Metro, autobús y opciones de movilidad', icon: 'bus' },
        { name: 'Recomendaciones', description: 'Restaurantes, tiendas y lugares de interés', icon: 'star' },
        { name: 'Basura y Reciclaje', description: 'Cómo y dónde desechar la basura', icon: 'trash' }
      ]

      // Prepare zones data with unique slugs
      const zonesData = zonasEsenciales.map((zoneData, index) => {
        const timestamp = Date.now() + index
        const random1 = Math.random().toString(36).substr(2, 12)
        const random2 = Math.random().toString(36).substr(2, 12)
        
        const baseSlug = generateSlug(zoneData.name)
        const uniqueSlug = `${baseSlug}-${timestamp}` // Ensure uniqueness with timestamp
        
        return {
          propertyId: property.id,
          name: { es: zoneData.name },
          slug: uniqueSlug,
          description: { es: zoneData.description },
          icon: zoneData.icon,
          color: 'bg-gray-100',
          status: 'ACTIVE',
          qrCode: `qr_${timestamp}_${random1}`,
          accessCode: `ac_${timestamp}_${random2}`
        }
      })

      // Create zones in a single transaction
      await prisma.$transaction(
        zonesData.map((data) => prisma.zone.create({ data }))
      )
      
      console.log('✅ Essential zones auto-created for property:', property.id)
    } catch (zoneError) {
      console.error('❌ Warning: Failed to auto-create zones for property:', property.id, zoneError)
      // Don't fail the property creation if zone creation fails
    }
    
    // Check if this property needs trial activation
    const activePropertiesCount = await prisma.property.count({
      where: {
        hostId: userId,
        status: { in: ['ACTIVE', 'TRIAL'] }
      }
    })
    
    // Determine if trial is needed
    const needsTrial = activePropertiesCount > 0 // First property is free
    const monthlyFee = activePropertiesCount >= 9 ? 2.00 : 2.50 // 10+ properties get discount
    
    // Send email notification to admins about new property
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          phone: true
        }
      })
      
      if (user) {
        await emailNotificationService.notifyNewProperty({
          id: property.id,
          name: property.name,
          user: {
            name: user.name,
            email: user.email,
            phone: user.phone || undefined
          },
          createdAt: property.createdAt
        })
      }
    } catch (error) {
      console.error('Error sending new property notification email:', error)
      // Don't fail the request if email fails
    }
    
    return NextResponse.json({
      success: true,
      data: property,
      subscription: {
        needsTrial,
        isFirstProperty: activePropertiesCount === 0,
        monthlyFee,
        trialDuration: 48, // hours
        message: needsTrial 
          ? 'Esta propiedad requiere un plan de pago. Puedes activar un período de prueba de 48 horas.'
          : '¡Tu primera propiedad es completamente gratuita!'
      }
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
    
    // Get properties with minimal includes to avoid DB schema issues
    const properties = await prisma.property.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        id: 'desc'  // Use ID instead of createdAt
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        type: true,
        city: true,
        state: true,
        bedrooms: true,
        bathrooms: true,
        maxGuests: true,
        status: true,
        isPublished: true,
        profileImage: true,
        propertySetId: true,
        hostContactName: true,
        hostContactPhoto: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    const total = await prisma.property.count({ where })
    
    // Transform properties data - simplified to avoid analytics/count issues
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
          zonesCount: 0, // Temporarily set to 0
          totalViews: 0, // Temporarily set to 0
          avgRating: 0, // Temporarily set to 0
          status: property.status,
          createdAt: property.createdAt,
          updatedAt: property.updatedAt,
          isPublished: property.isPublished,
          profileImage: property.profileImage,
          propertySetId: property.propertySetId,
          propertySet: null, // Temporarily set to null
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