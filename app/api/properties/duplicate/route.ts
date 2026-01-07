import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../src/lib/prisma'
import { generateSlug } from '../../../../src/lib/slug-utils'

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
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead

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
        },
        announcements: {
          orderBy: { createdAt: 'asc' }
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

    // Helper function to find all used numbers for a base name
    const findUsedNumbers = async (baseName: string): Promise<Set<number>> => {
      const allProperties = await prisma.property.findMany({
        where: { hostId: userId },
        select: { name: true }
      })

      const usedNumbers = new Set<number>()
      const regex = new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(\\d+)$`)

      for (const prop of allProperties) {
        const propName = typeof prop.name === 'string' ? prop.name : (prop.name as any)?.es || ''
        const match = propName.match(regex)
        if (match) {
          usedNumbers.add(parseInt(match[1]))
        }
      }

      return usedNumbers
    }

    // Helper function to find the next available sequential numbers
    const getNextAvailableNumbers = async (baseName: string, count: number): Promise<number[]> => {
      const usedNumbers = await findUsedNumbers(baseName)
      const nextNumbers: number[] = []

      // Start from 1 if no numbers exist, otherwise from max + 1
      let startNum = usedNumbers.size > 0 ? Math.max(...usedNumbers) + 1 : 1

      // Find 'count' consecutive available numbers
      let current = startNum
      while (nextNumbers.length < count) {
        if (!usedNumbers.has(current)) {
          nextNumbers.push(current)
        }
        current++
      }

      return nextNumbers
    }

    // Extract base name once (remove existing number if present)
    const extractBaseName = (name: string): string => {
      const match = name.match(/^(.+?)(\d+)$/)
      return match ? match[1].trim() : name
    }

    // Pre-calculate all available numbers BEFORE creating any properties
    // This ensures sequential numbering even when creating multiple duplicates at once
    let availableNumbers: number[] = []
    let baseName = ''

    if (typeof originalProperty.name === 'string') {
      baseName = extractBaseName(originalProperty.name)
      availableNumbers = await getNextAvailableNumbers(baseName, count)
    } else if (originalProperty.name && typeof originalProperty.name === 'object') {
      const nameObj = originalProperty.name as any
      baseName = extractBaseName(nameObj.es || '')
      availableNumbers = await getNextAvailableNumbers(baseName, count)
    }

    // Create multiple duplicates
    for (let i = 0; i < count; i++) {
      // Determine new property name with pre-calculated sequential numbering
      let newName
      if (typeof originalProperty.name === 'string') {
        newName = `${baseName} ${availableNumbers[i]}`
      } else if (originalProperty.name && typeof originalProperty.name === 'object') {
        const nameObj = originalProperty.name as any
        const num = availableNumbers[i]
        newName = {
          es: `${extractBaseName(nameObj.es || '')} ${num}`,
          en: `${extractBaseName(nameObj.en || '')} ${num}`,
          fr: `${extractBaseName(nameObj.fr || '')} ${num}`
        }
      } else {
        newName = `Propiedad Duplicada ${i + 1}`
      }

      // Generate unique slug for the new property
      const nameForSlug = typeof newName === 'string' ? newName : (newName as any).es || ''
      const baseSlug = generateSlug(nameForSlug)

      // Find unique slug by checking existing slugs
      let slugSuffix = 0
      let finalSlug = baseSlug
      while (true) {
        const testSlug = slugSuffix === 0 ? baseSlug : `${baseSlug}-${slugSuffix}`
        const existingProperty = await prisma.property.findFirst({
          where: { slug: testSlug },
          select: { id: true }
        })
        if (!existingProperty) {
          finalSlug = testSlug
          break
        }
        slugSuffix++
      }

      // Create the new property
      const newProperty = await prisma.property.create({
        data: {
          hostId: userId,
          organizationId: originalProperty.organizationId,
          buildingId: originalProperty.buildingId,
          propertySetId: assignToSet && propertySetId ? propertySetId : null,
          name: typeof newName === 'string' ? newName : JSON.stringify(newName),
          slug: finalSlug, // Add unique slug
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
        // Generate slug for the zone
        const zoneName = typeof originalZone.name === 'string'
          ? originalZone.name
          : (originalZone.name as any)?.es || 'zona'
        const zoneBaseSlug = generateSlug(zoneName)

        // Find unique zone slug within this property
        let zoneSlugSuffix = 0
        let finalZoneSlug = zoneBaseSlug
        while (true) {
          const testZoneSlug = zoneSlugSuffix === 0 ? zoneBaseSlug : `${zoneBaseSlug}-${zoneSlugSuffix}`
          const existingZone = await prisma.zone.findFirst({
            where: {
              propertyId: newProperty.id,
              slug: testZoneSlug
            },
            select: { id: true }
          })
          if (!existingZone) {
            finalZoneSlug = testZoneSlug
            break
          }
          zoneSlugSuffix++
        }

        const newZone = await prisma.zone.create({
          data: {
            propertyId: newProperty.id,
            organizationId: originalZone.organizationId,
            buildingId: originalZone.buildingId,
            name: originalZone.name as any,
            slug: finalZoneSlug, // Add unique zone slug
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

      // Copy announcements (avisos) from the original property
      if (originalProperty.announcements && originalProperty.announcements.length > 0) {
        for (const originalAnnouncement of originalProperty.announcements) {
          await prisma.announcement.create({
            data: {
              propertyId: newProperty.id,
              title: originalAnnouncement.title as any,
              message: originalAnnouncement.message as any,
              category: originalAnnouncement.category,
              priority: originalAnnouncement.priority,
              isActive: originalAnnouncement.isActive,
              startDate: originalAnnouncement.startDate,
              endDate: originalAnnouncement.endDate
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