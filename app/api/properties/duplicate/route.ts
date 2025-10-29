import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../src/lib/prisma'

const JWT_SECRET = 'itineramio-secret-key-2024'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { 
      propertyId, 
      count, 
      shareMedia, 
      copyCompleteProperty, 
      selectedZones, 
      assignToSet, 
      propertySetId,
      autoPublish 
    } = body

    // Validate input
    if (!propertyId || !count || count < 1 || count > 50) {
      return NextResponse.json({
        success: false,
        error: 'Datos de duplicación inválidos'
      }, { status: 400 })
    }

    // Get the original property with all its data
    const originalProperty = await prisma.property.findFirst({
      where: {
        id: propertyId,
        hostId: userId
      },
      include: {
        zones: {
          include: {
            steps: {
              orderBy: { id: 'asc' }
            }
          },
          orderBy: { id: 'asc' }
        }
      }
    })

    if (!originalProperty) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada'
      }, { status: 404 })
    }

    // If assigning to set, validate the property set exists and belongs to user
    if (assignToSet && propertySetId) {
      const propertySet = await prisma.propertySet.findFirst({
        where: {
          id: propertySetId,
          hostId: userId
        }
      })

      if (!propertySet) {
        return NextResponse.json({
          success: false,
          error: 'Conjunto de propiedades no encontrado'
        }, { status: 404 })
      }
    }

    const createdProperties = []

    // Helper function to find the highest number for a base name
    const findHighestNumber = async (baseName: string): Promise<number> => {
      const allProperties = await prisma.property.findMany({
        where: { hostId: userId },
        select: { name: true }
      })

      let highest = 0
      const regex = new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(\\d+)$`)

      for (const prop of allProperties) {
        const propName = typeof prop.name === 'string' ? prop.name : (prop.name as any)?.es || ''
        const match = propName.match(regex)
        if (match) {
          const num = parseInt(match[1])
          if (num > highest) highest = num
        }
      }

      return highest
    }

    // Helper function to increment number in name
    const incrementPropertyName = async (name: string, startFrom: number): Promise<string> => {
      // Extract base name (remove existing number if present)
      const match = name.match(/^(.+?)(\d+)$/)
      const baseName = match ? match[1].trim() : name

      // Find highest existing number for this base name
      const highestExisting = await findHighestNumber(baseName)

      // Start from the highest + startFrom
      return `${baseName} ${highestExisting + startFrom}`
    }

    // Create multiple duplicates
    for (let i = 1; i <= count; i++) {
      // Determine new property name with smart numbering
      let newName
      if (typeof originalProperty.name === 'string') {
        newName = await incrementPropertyName(originalProperty.name, i)
      } else if (originalProperty.name && typeof originalProperty.name === 'object') {
        const nameObj = originalProperty.name as any
        newName = {
          es: await incrementPropertyName(nameObj.es || '', i),
          en: await incrementPropertyName(nameObj.en || '', i),
          fr: await incrementPropertyName(nameObj.fr || '', i)
        }
      } else {
        newName = `Propiedad Duplicada ${i + 1}`
      }

      // Create the new property
      const newProperty = await prisma.property.create({
        data: {
          hostId: userId,
          organizationId: originalProperty.organizationId,
          buildingId: originalProperty.buildingId,
          propertySetId: assignToSet && propertySetId ? propertySetId : null,
          name: typeof newName === 'string' ? newName : JSON.stringify(newName),
          description: typeof originalProperty.description === 'string' ? originalProperty.description : JSON.stringify(originalProperty.description),
          street: typeof originalProperty.street === 'string' ? originalProperty.street : JSON.stringify(originalProperty.street),
          city: typeof originalProperty.city === 'string' ? originalProperty.city : JSON.stringify(originalProperty.city),
          state: typeof originalProperty.state === 'string' ? originalProperty.state : JSON.stringify(originalProperty.state),
          country: originalProperty.country,
          postalCode: originalProperty.postalCode,
          type: originalProperty.type,
          bedrooms: originalProperty.bedrooms,
          bathrooms: originalProperty.bathrooms,
          maxGuests: originalProperty.maxGuests,
          squareMeters: originalProperty.squareMeters,
          defaultLanguages: originalProperty.defaultLanguages as any,
          isPublished: autoPublish !== undefined ? autoPublish : originalProperty.isPublished, // Use autoPublish if provided, otherwise inherit from original
          profileImage: shareMedia ? originalProperty.profileImage : null,
          hostContactName: originalProperty.hostContactName,
          hostContactPhone: originalProperty.hostContactPhone,
          hostContactEmail: originalProperty.hostContactEmail,
          hostContactLanguage: originalProperty.hostContactLanguage,
          hostContactPhoto: shareMedia ? originalProperty.hostContactPhoto : null,
          status: autoPublish !== undefined ? (autoPublish ? 'ACTIVE' : 'DRAFT') : (originalProperty.status || 'DRAFT'),
          publishedAt: (autoPublish !== undefined ? autoPublish : originalProperty.isPublished) ? (originalProperty.publishedAt || new Date()) : null
        }
      })

      // Determine which zones to copy
      let zonesToCopy = originalProperty.zones
      if (!copyCompleteProperty && selectedZones && selectedZones.length > 0) {
        zonesToCopy = originalProperty.zones.filter(zone => selectedZones.includes(zone.id))
      }

      // Copy zones and their steps
      for (const originalZone of zonesToCopy) {
        const newZone = await prisma.zone.create({
          data: {
            propertyId: newProperty.id,
            organizationId: originalZone.organizationId,
            buildingId: originalZone.buildingId,
            name: originalZone.name as any,
            description: originalZone.description as any,
            icon: originalZone.icon,
            color: originalZone.color,
            isPublished: autoPublish !== undefined ? autoPublish : originalZone.isPublished,
            status: autoPublish !== undefined ? (autoPublish ? 'ACTIVE' : 'DRAFT') : (originalZone.status || 'DRAFT'),
            qrCode: `${newProperty.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate new QR code
            accessCode: `${newProperty.id.slice(-6)}${Date.now().toString().slice(-4)}` // Generate new access code
          }
        })

        // Copy steps for this zone
        for (const originalStep of originalZone.steps) {
          await prisma.step.create({
            data: {
              zoneId: newZone.id,
              title: originalStep.title as any,
              content: shareMedia ? originalStep.content as any : {
                ...(originalStep.content as any),
                mediaUrl: null, // Remove media if not sharing
                imageUrl: null,
                videoUrl: null
              },
              type: originalStep.type,
              order: originalStep.order,
              isPublished: autoPublish !== undefined ? autoPublish : originalStep.isPublished
            }
          })
        }
      }

      // Create analytics entry for the new property
      await prisma.propertyAnalytics.create({
        data: {
          propertyId: newProperty.id,
          totalViews: 0,
          overallRating: 0
        }
      })

      createdProperties.push({
        id: newProperty.id,
        name: newProperty.name,
        zonesCount: zonesToCopy.length
      })
    }

    return NextResponse.json({
      success: true,
      message: `${count} ${count === 1 ? 'propiedad creada' : 'propiedades creadas'} exitosamente`,
      data: {
        originalPropertyId: propertyId,
        createdProperties,
        assignedToSet: assignToSet ? propertySetId : null
      }
    })

  } catch (error) {
    console.error('Error duplicating property:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    }, { status: 500 })
  }
}