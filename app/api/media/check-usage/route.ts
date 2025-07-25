import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAuth } from '../../../../src/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const { mediaUrl } = body

    if (!mediaUrl) {
      return NextResponse.json({
        success: false,
        error: 'Media URL is required'
      }, { status: 400 })
    }

    // Find all properties that belong to this user
    const userProperties = await prisma.property.findMany({
      where: {
        hostId: userId
      },
      select: {
        id: true,
        name: true
      }
    })

    const propertyIds = userProperties.map(p => p.id)

    // Find all steps that use this media URL
    const zones = await prisma.zone.findMany({
      where: {
        propertyId: {
          in: propertyIds
        }
      },
      include: {
        steps: {
          where: {
            content: {
              string_contains: mediaUrl
            }
          }
        },
        property: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Also check properties that use this as profile image or host photo
    const propertiesWithImage = await prisma.property.findMany({
      where: {
        hostId: userId,
        OR: [
          { profileImage: mediaUrl },
          { hostContactPhoto: mediaUrl }
        ]
      },
      select: {
        id: true,
        name: true
      }
    })

    // Combine and deduplicate properties
    const affectedProperties = new Map()
    
    // From zones with steps
    zones.forEach(zone => {
      if (zone.steps.length > 0 && zone.property) {
        affectedProperties.set(zone.property.id, {
          id: zone.property.id,
          name: zone.property.name,
          usage: 'step'
        })
      }
    })

    // From property images
    propertiesWithImage.forEach(property => {
      if (affectedProperties.has(property.id)) {
        affectedProperties.get(property.id).usage = 'multiple'
      } else {
        affectedProperties.set(property.id, {
          id: property.id,
          name: property.name,
          usage: 'property_image'
        })
      }
    })

    const propertiesList = Array.from(affectedProperties.values())

    return NextResponse.json({
      success: true,
      mediaUrl,
      usageCount: propertiesList.length,
      properties: propertiesList,
      canDelete: propertiesList.length === 0
    })

  } catch (error) {
    console.error('Error checking media usage:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error checking media usage'
    }, { status: 500 })
  }
}