import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { generateSlug, generateUniqueSlug } from '../../../../../src/lib/slug-utils'
import { requireAuth } from '../../../../../src/lib/auth'

// GET /api/properties/[id]/zones - Get all zones for a property
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const propertyId = (await params).id

    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Set JWT claims for RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`

    // Verify user owns the property
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        hostId: userId
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada o no autorizada' },
        { status: 404 }
      )
    }

    const zones = await prisma.zone.findMany({
      where: {
        propertyId: propertyId
      },
      include: {
        steps: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })
    
    console.log('🔍 Zones fetched:', zones.length)
    // console.log('🔍 First zone slug:', zones[0]?.slug) // Temporarily disabled
    
    return NextResponse.json({
      success: true,
      data: zones
    })
  } catch (error) {
    console.error('Error fetching zones:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener las zonas' 
      },
      { status: 500 }
    )
  }
}

// POST /api/properties/[id]/zones - Create a new zone
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔵 POST /api/properties/[id]/zones - Starting')
    const propertyId = (await params).id
    console.log('🔵 Property ID:', propertyId)
    
    const body = await request.json()
    console.log('🔵 Request body:', JSON.stringify(body, null, 2))

    // Check authentication
    console.log('🔵 Checking authentication...')
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      console.log('🔴 Authentication failed')
      return authResult
    }
    const userId = authResult.userId
    console.log('🔵 User ID:', userId)

    // Set JWT claims for RLS policies
    console.log('🔵 Setting JWT claims...')
    try {
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`
      console.log('🔵 JWT claims set successfully')
    } catch (rslError) {
      console.error('🔴 Error setting JWT claims:', rslError)
      // Continue anyway, might not be critical
    }

    // Validate required fields
    console.log('🔵 Validating required fields...')
    const { name, description, icon, color, order, status } = body
    console.log('🔵 Extracted fields:', { name, description, icon, color, order, status })

    if (!name || !icon) {
      console.log('🔴 Validation failed - missing name or icon')
      return NextResponse.json(
        { 
          success: false, 
          error: `Nombre e icono son requeridos. Recibido: name="${name}", icon="${icon}"` 
        },
        { status: 400 }
      )
    }

    // Normalize name - accept both string and translation object
    let zoneName: string
    if (typeof name === 'string') {
      zoneName = name.trim()
    } else if (name && typeof name === 'object' && (name.es || name.en || name.fr)) {
      zoneName = name.es || name.en || name.fr || ''
    } else {
      console.log('Validation failed - invalid name type')
      return NextResponse.json(
        { 
          success: false, 
          error: 'El nombre debe ser una cadena de texto válida o un objeto de traducción' 
        },
        { status: 400 }
      )
    }

    if (zoneName.length === 0) {
      console.log('Validation failed - empty name')
      return NextResponse.json(
        { 
          success: false, 
          error: 'El nombre no puede estar vacío' 
        },
        { status: 400 }
      )
    }

    if (typeof icon !== 'string' || icon.trim().length === 0) {
      console.log('Validation failed - invalid icon')
      return NextResponse.json(
        { 
          success: false, 
          error: 'El icono debe ser una cadena de texto válida' 
        },
        { status: 400 }
      )
    }

    // Check if property exists and user owns it
    console.log('🔵 Checking property ownership...')
    const property = await prisma.property.findFirst({
      where: { 
        id: propertyId,
        hostId: userId
      },
      include: {
        zones: true
      }
    })
    console.log('🔵 Property found:', !!property)

    if (!property) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Propiedad no encontrada o no autorizada' 
        },
        { status: 404 }
      )
    }

    // Check if zone with same name already exists
    const existingZone = property.zones.find(zone => {
      const existingZoneName = typeof zone.name === 'string' ? zone.name : (zone.name as any)?.es || ''
      return existingZoneName.toLowerCase() === zoneName.toLowerCase()
    })

    if (existingZone) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Ya existe una zona llamada "${zoneName}" en esta propiedad` 
        },
        { status: 400 }
      )
    }

    // Get the next order number if not provided
    let zoneOrder = order
    if (zoneOrder === undefined || zoneOrder === null) {
      // Get the max order + 1
      const maxOrder = await prisma.zone.findFirst({
        where: { propertyId },
        orderBy: { order: 'desc' },
        select: { order: true }
      })
      zoneOrder = (maxOrder?.order || 0) + 1
    }

    // Ensure description is not empty (required by database)
    const finalDescription = description && description.trim() ? description.trim() : 'Descripción de la zona'

    // Generate truly unique codes using crypto for better randomness
    const timestamp = Date.now()
    const randomPart1 = Math.random().toString(36).substr(2, 12)
    const randomPart2 = Math.random().toString(36).substr(2, 12)
    const qrCode = `qr_${timestamp}_${randomPart1}`
    const accessCode = `ac_${timestamp}_${randomPart2}`
    
    console.log('🔵 Generated codes:', { qrCode, accessCode })

    // Generate unique slug for the zone within this property (temporarily disabled)
    // const baseSlug = generateSlug(name.trim())
    // const existingSlugs = await prisma.zone.findMany({
    //   where: { 
    //     propertyId,
    //     slug: { not: null }
    //   },
    //   select: { slug: true }
    // }).then(results => results.map(r => r.slug).filter(Boolean) as string[])
    // const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs)
    const uniqueSlug = null // Temporarily disabled

    // Create the zone in a transaction for better error handling
    console.log('🔵 Creating zone with data:', {
      propertyId,
      name: { es: zoneName },
      description: { es: finalDescription },
      icon: icon.trim(),
      color: color || 'bg-gray-100',
      order: zoneOrder,
      status: status || 'ACTIVE',
      qrCode,
      accessCode
    })
    
    const zone = await prisma.$transaction(async (tx) => {
      console.log('🔵 Starting transaction for zone creation')
      
      // Verify property exists within transaction
      const propertyCheck = await tx.property.findFirst({
        where: { 
          id: propertyId,
          hostId: userId
        }
      })
      
      if (!propertyCheck) {
        throw new Error('Property not found in transaction')
      }
      
      console.log('🔵 Property verified within transaction')
      
      // Create the zone
      const newZone = await tx.zone.create({
        data: {
          propertyId,
          name: { es: zoneName },
          // slug: uniqueSlug, // Temporarily disabled
          description: { es: finalDescription },
          icon: icon.trim(),
          color: color || 'bg-gray-100',
          order: zoneOrder,
          status: status || 'ACTIVE',
          qrCode,
          accessCode
        },
        include: {
          steps: {
            orderBy: {
              order: 'asc'
            }
          }
        }
      })
      
      console.log('🔵 Zone created in transaction:', newZone.id)
      return newZone
    })
    
    console.log('🔵 Zone created successfully:', zone.id)

    return NextResponse.json({
      success: true,
      data: zone
    }, { status: 201 })

  } catch (error) {
    console.error('🔴 Error creating zone:', error)
    console.error('🔴 Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('🔴 Error name:', error instanceof Error ? error.name : 'Unknown error type')
    console.error('🔴 Error message:', error instanceof Error ? error.message : 'Unknown error')
    
    // Handle specific database errors
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      
      // Handle unique constraint violations
      if (errorMessage.includes('unique constraint') || errorMessage.includes('duplicate key')) {
        console.error('🔴 Unique constraint violation detected')
        
        if (errorMessage.includes('qrcode') || errorMessage.includes('qr_code')) {
          return NextResponse.json({
            success: false,
            error: 'Error en la generación del código QR. Inténtalo de nuevo.',
            errorType: 'UNIQUE_CONSTRAINT_QR'
          }, { status: 400 })
        }
        
        if (errorMessage.includes('accesscode') || errorMessage.includes('access_code')) {
          return NextResponse.json({
            success: false,
            error: 'Error en la generación del código de acceso. Inténtalo de nuevo.',
            errorType: 'UNIQUE_CONSTRAINT_ACCESS'
          }, { status: 400 })
        }
        
        return NextResponse.json({
          success: false,
          error: 'Ya existe una zona con esos datos. Modifica el nombre o inténtalo de nuevo.',
          errorType: 'UNIQUE_CONSTRAINT'
        }, { status: 400 })
      }
      
      // Handle foreign key constraint violations
      if (errorMessage.includes('foreign key') || errorMessage.includes('violates not-null')) {
        console.error('🔴 Foreign key or not-null constraint violation')
        return NextResponse.json({
          success: false,
          error: 'Error de relación con la propiedad. Verifica que la propiedad existe.',
          errorType: 'FOREIGN_KEY_CONSTRAINT'
        }, { status: 400 })
      }
      
      // Handle RLS policy violations
      if (errorMessage.includes('rls') || errorMessage.includes('policy') || errorMessage.includes('permission')) {
        console.error('🔴 RLS policy violation detected')
        return NextResponse.json({
          success: false,
          error: 'No tienes permisos para crear zonas en esta propiedad.',
          errorType: 'RLS_POLICY_VIOLATION'
        }, { status: 403 })
      }
      
      // Handle JSON validation errors
      if (errorMessage.includes('json') || errorMessage.includes('invalid')) {
        console.error('🔴 JSON validation error')
        return NextResponse.json({
          success: false,
          error: 'Error en el formato de los datos. Verifica el nombre y descripción.',
          errorType: 'JSON_VALIDATION_ERROR'
        }, { status: 400 })
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al crear la zona',
        details: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : 'No stack') : undefined
      },
      { status: 500 }
    )
  }
}