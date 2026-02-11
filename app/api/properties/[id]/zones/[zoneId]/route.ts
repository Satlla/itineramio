import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import jwt from 'jsonwebtoken'
import { translateFields } from '../../../../../../src/lib/translate'
import { translationRateLimiter, getRateLimitKey } from '../../../../../../src/lib/rate-limit'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}

// GET /api/properties/[id]/zones/[zoneId] - Get specific zone
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  console.log('🔍 GET zone endpoint called')
  try {
    const { id: propertyId, zoneId } = await params
    console.log('🔍 Received params:', { propertyId, zoneId })

    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let userId: string
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      userId = decoded.userId
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Set JWT claims for RLS policies
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead

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

    console.log('🔍 Searching for zone with:', { zoneId, propertyId })
    
    // First try with the truncated zoneId to find the actual zone
    const zones = await prisma.zone.findMany({
      where: {
        id: {
          startsWith: zoneId // Use startsWith to find zones that begin with the truncated ID
        },
        propertyId: propertyId
      },
      include: {
        steps: {
          orderBy: {
            order: 'asc'
          }
        },
        property: {
          select: {
            name: true
          }
        }
      }
    })
    
    const zone = zones[0] // Take the first match

    console.log('🔍 Zone found:', !!zone)
    if (zone) {
      console.log('🔍 Zone details:', { id: zone.id, propertyId: zone.propertyId, stepsCount: zone.steps.length })
    }

    if (!zone) {
      console.log('🔍 Zone not found - returning 404')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Zona no encontrada',
          debug: { receivedPropertyId: propertyId, receivedZoneId: zoneId }
        },
        { status: 404 }
      )
    }

    // Process steps to extract mediaUrl from content JSON
    const processedSteps = zone.steps.map(step => {
      let mediaUrl = null
      let linkUrl = null
      
      try {
        if (step.content && typeof step.content === 'object') {
          const content = step.content as any
          // Extract mediaUrl from content JSON
          if (content.mediaUrl) {
            mediaUrl = content.mediaUrl
          }
          if (content.linkUrl) {
            linkUrl = content.linkUrl
          }
        }
      } catch (error) {
        console.error('Error parsing step content:', error)
      }

      return {
        ...step,
        mediaUrl,
        linkUrl,
        // Also provide the original content for backward compatibility
        content: step.content
      }
    })

    const processedZone = {
      ...zone,
      steps: processedSteps
    }

    return NextResponse.json({
      success: true,
      data: processedZone
    })
  } catch (error) {
    console.error('Error fetching zone:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener la zona' 
      },
      { status: 500 }
    )
  }
}

// PUT /api/properties/[id]/zones/[zoneId] - Update zone
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  try {
    const { id: propertyId, zoneId } = await params
    const body = await request.json()

    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let userId: string
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      userId = decoded.userId
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Set JWT claims for RLS policies
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead

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

    // Check if zone exists and belongs to the property (using startsWith like in GET)
    const existingZones = await prisma.zone.findMany({
      where: {
        id: {
          startsWith: zoneId
        },
        propertyId: propertyId
      }
    })

    const existingZone = existingZones[0]

    if (!existingZone) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Zona no encontrada' 
        },
        { status: 404 }
      )
    }

    console.log('💾 Updating zone with data:', body)

    // Transform iconId to icon if provided
    const updateData = { ...body }
    if (updateData.iconId) {
      updateData.icon = updateData.iconId
      delete updateData.iconId
    }

    // Auto-translate zone name from Spanish to EN/FR
    if (updateData.name && typeof updateData.name === 'object' && updateData.name.es) {
      const rateLimitKey = getRateLimitKey(request, userId, 'translation')
      const rateLimitResult = translationRateLimiter(rateLimitKey)
      if (rateLimitResult.allowed) {
        try {
          const [translatedName] = await translateFields([updateData.name])
          updateData.name = translatedName
          console.log('💾 Zone name auto-translated')
        } catch (e) {
          console.log('💾 Zone name translation skipped:', String(e))
        }
      }
    }

    console.log('💾 Final update data:', updateData)

    // Check if we should apply to property set (NEW: optional parameters)
    const applyToPropertySet = body.applyToPropertySet || false
    const selectedPropertyIds = body.selectedPropertyIds || []

    let updatedZones = []

    if (applyToPropertySet || selectedPropertyIds.length > 0) {
      // NEW: Multi-property update logic
      const zoneName = existingZone.name

      let propertyFilter: any = {}

      if (selectedPropertyIds.length > 0) {
        // Update only selected properties
        propertyFilter = {
          id: { in: selectedPropertyIds }
        }
      } else if (applyToPropertySet && property.propertySetId) {
        // Update all properties in the set
        propertyFilter = {
          propertySetId: property.propertySetId
        }
      }

      // Find all zones with the same name in the filtered properties
      const zonesToUpdate = await prisma.zone.findMany({
        where: {
          name: zoneName,
          property: propertyFilter
        }
      })

      console.log(`💾 Updating ${zonesToUpdate.length} zones in property set/selection`)

      // Update all matching zones
      for (const zoneToUpdate of zonesToUpdate) {
        await prisma.zone.update({
          where: { id: zoneToUpdate.id },
          data: {
            ...updateData,
            updatedAt: new Date()
          }
        })
      }

      updatedZones = zonesToUpdate
    } else {
      // DEFAULT: Update only the single zone (existing behavior)
      const zone = await prisma.zone.update({
        where: { id: existingZone.id },
        data: {
          ...updateData,
          updatedAt: new Date()
        },
        include: {
          steps: {
            orderBy: {
              order: 'asc'
            }
          }
        }
      })

      updatedZones = [zone]
    }

    return NextResponse.json({
      success: true,
      data: updatedZones[0], // Return first zone for backward compatibility
      updatedCount: updatedZones.length
    })

  } catch (error) {
    console.error('Error updating zone:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar la zona' 
      },
      { status: 500 }
    )
  }
}

// DELETE /api/properties/[id]/zones/[zoneId] - Delete zone
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  try {
    const { id: propertyId, zoneId } = await params

    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let userId: string
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      userId = decoded.userId
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Set JWT claims for RLS policies
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead

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

    // Check if zone exists and belongs to the property (using startsWith like in GET)
    const existingZones = await prisma.zone.findMany({
      where: {
        id: {
          startsWith: zoneId
        },
        propertyId: propertyId
      }
    })

    const existingZone = existingZones[0]

    if (!existingZone) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Zona no encontrada' 
        },
        { status: 404 }
      )
    }

    // Delete all steps (cascade delete) using actual zone ID
    await prisma.step.deleteMany({
      where: { zoneId: existingZone.id }
    })

    // Delete the zone using actual zone ID
    await prisma.zone.delete({
      where: { id: existingZone.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Zona eliminada correctamente'
    })

  } catch (error) {
    console.error('Error deleting zone:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al eliminar la zona' 
      },
      { status: 500 }
    )
  }
}