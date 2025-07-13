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
    const propertyId = (await params).id
    const body = await request.json()

    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Set JWT claims for RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`

    // Validate required fields
    const { name, description, icon, color, order, status } = body

    if (!name || !icon) {
      console.log('Validation failed - missing name or icon')
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
    const property = await prisma.property.findFirst({
      where: { 
        id: propertyId,
        hostId: userId
      },
      include: {
        zones: true
      }
    })

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

    // Generate unique codes
    const qrCode = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const accessCode = `ac_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

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

    // Create the zone
    const zone = await prisma.zone.create({
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

    return NextResponse.json({
      success: true,
      data: zone
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating zone:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al crear la zona',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}