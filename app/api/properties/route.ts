import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../src/lib/prisma'
import { generateSlug, generateUniqueSlug } from '../../../src/lib/slug-utils'
import { requireAuth } from '../../../src/lib/auth'
import { emailNotificationService } from '../../../src/lib/email-notifications'
import { planLimitsService } from '../../../src/lib/plan-limits'
import { generatePropertyNumber, extractNumberFromReference } from '../../../src/lib/property-number-generator'

// Tiempo de respuesta estimado por tipo de zona (en minutos)
// Basado en cuánto tiempo tarda un anfitrión en explicar cada tema
const ZONE_TIME_MAP: Record<string, number> = {
  // Check-in/out - instrucciones complejas
  'key': 2.5,
  'door-open': 2.5,
  'exit': 2.0,
  'log-out': 2.0,

  // WiFi - simple
  'wifi': 0.5,

  // Cocina/electrodomésticos
  'chef-hat': 1.5,
  'utensils': 1.5,
  'microwave': 1.0,
  'coffee': 1.0,

  // Parking
  'car': 2.0,
  'parking-circle': 2.0,

  // Normas y documentos
  'scroll-text': 1.0,
  'file-text': 1.0,
  'list': 1.0,
  'clipboard': 1.0,

  // Emergencias/contacto
  'phone': 1.5,
  'alert-triangle': 1.5,
  'siren': 1.5,

  // Transporte/ubicación
  'bus': 2.0,
  'train': 2.0,
  'plane': 2.0,
  'map-pin': 2.0,
  'map': 1.5,
  'navigation': 1.5,

  // Climatización
  'thermometer': 1.5,
  'snowflake': 1.5,
  'sun': 1.0,
  'fan': 1.0,

  // Exterior/amenities
  'trees': 1.0,
  'umbrella': 1.0,
  'waves': 1.0,
  'dumbbell': 1.0,
  'tv': 1.0,

  // Limpieza/basura
  'trash': 1.0,
  'recycle': 1.0,
  'sparkles': 1.0,

  // Recomendaciones
  'star': 1.5,
  'heart': 1.0,
  'utensils-crossed': 1.5,
  'shopping-bag': 1.0,
}

// Tiempo por defecto si no se encuentra el icono
const DEFAULT_ZONE_TIME = 1.0

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

    // Verificar que el usuario existe en la base de datos
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!userExists) {
      console.log('POST /api/properties - User not found in database')
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado. Por favor, inicia sesión nuevamente.',
        requiresLogin: true
      }, { status: 401 })
    }

    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead

    // Check plan limits BEFORE processing the request
    const limitsCheck = await planLimitsService.validatePropertyCreation(userId)
    if (!limitsCheck.valid) {
      return NextResponse.json({
        success: false,
        error: limitsCheck.error,
        upgradeRequired: true,
        upgradeUrl: limitsCheck.upgradeUrl
      }, { status: 403 })
    }

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

    // Generate sequential property number (ITN-XXXXX)
    console.log('Generating property number (ITN-XXXXX)...')
    let propertyCode = 'ITN-00001' // Default if no properties exist

    try {
      // Get the last property with a propertyCode
      const lastProperty = await prisma.property.findFirst({
        where: {
          propertyCode: {
            not: null,
            startsWith: 'ITN-'
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          propertyCode: true
        }
      })

      if (lastProperty && lastProperty.propertyCode) {
        // Extract number and generate next one
        const lastNumber = extractNumberFromReference(lastProperty.propertyCode) || 0
        propertyCode = generatePropertyNumber(lastNumber)
      }

      console.log('Generated property code:', propertyCode)
    } catch (error) {
      console.error('Error generating property code, using default:', error)
      // If error, use default ITN-00001
    }

    // Create property in database
    console.log('Attempting to create property in database...')
    const property = await prisma.property.create({
      data: {
        // Basic info
        name: validatedData.name,
        slug: uniqueSlug,
        propertyCode: propertyCode, // Add ITN number
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

    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead

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

    // Get zones count, steps count, and video count for all properties in one query
    const propertyIds = properties.map(p => p.id)

    const zoneCounts = await prisma.$queryRaw`
      SELECT
        z."propertyId",
        COUNT(DISTINCT z.id) as "zonesCount",
        COUNT(DISTINCT s.id) as "stepsCount",
        COUNT(DISTINCT CASE WHEN s.type = 'video' THEN s.id END) as "videosCount"
      FROM zones z
      LEFT JOIN steps s ON s."zoneId" = z.id
      WHERE z."propertyId" = ANY(${propertyIds})
      GROUP BY z."propertyId"
    ` as Array<{ propertyId: string; zonesCount: bigint; stepsCount: bigint; videosCount: bigint }>

    // Get analytics for all properties
    const analytics = await prisma.$queryRaw`
      SELECT "propertyId", "totalViews", "overallRating", "uniqueVisitors", "whatsappClicks"
      FROM property_analytics
      WHERE "propertyId" = ANY(${propertyIds})
    ` as Array<{ propertyId: string; totalViews: number; overallRating: number; uniqueVisitors: number; whatsappClicks: number }>

    // Get time saved per property based on zone views (excluding host views)
    // Each zone view contributes time based on the zone's icon type
    const timeSavedData = await prisma.$queryRaw`
      SELECT
        z."propertyId",
        z.icon,
        COUNT(zv.id) as "viewCount"
      FROM zones z
      LEFT JOIN zone_views zv ON zv."zoneId" = z.id
        AND (zv."isHostView" = false OR zv."isHostView" IS NULL)
      WHERE z."propertyId" = ANY(${propertyIds})
      GROUP BY z."propertyId", z.icon
    ` as Array<{ propertyId: string; icon: string; viewCount: bigint }>

    // Calculate time saved per property
    const timeSavedMap = new Map<string, number>()
    timeSavedData.forEach(row => {
      const timePerView = ZONE_TIME_MAP[row.icon] || DEFAULT_ZONE_TIME
      const timeSaved = Number(row.viewCount) * timePerView
      const current = timeSavedMap.get(row.propertyId) || 0
      timeSavedMap.set(row.propertyId, current + timeSaved)
    })

    // Create lookup maps
    const zoneCountMap = new Map(zoneCounts.map(z => [z.propertyId, {
      zonesCount: Number(z.zonesCount),
      stepsCount: Number(z.stepsCount),
      videosCount: Number(z.videosCount)
    }]))
    const analyticsMap = new Map(analytics.map(a => [a.propertyId, {
      totalViews: a.totalViews || 0,
      avgRating: a.overallRating || 0,
      uniqueVisitors: a.uniqueVisitors || 0,
      whatsappClicks: a.whatsappClicks || 0
    }]))

    // Transform properties data with real counts
    const propertiesWithZones = properties.map((property) => {
      try {
        const counts = zoneCountMap.get(property.id) || { zonesCount: 0, stepsCount: 0, videosCount: 0 }
        const stats = analyticsMap.get(property.id) || { totalViews: 0, avgRating: 0, uniqueVisitors: 0, whatsappClicks: 0 }
        const timeSavedMinutes = Math.round(timeSavedMap.get(property.id) || 0)

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
          zonesCount: counts.zonesCount,
          stepsCount: counts.stepsCount,
          videosCount: counts.videosCount,
          totalViews: stats.totalViews,
          avgRating: stats.avgRating,
          uniqueVisitors: stats.uniqueVisitors,
          whatsappClicks: stats.whatsappClicks,
          timeSavedMinutes, // Tiempo ahorrado basado en vistas de zonas (excluye host)
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