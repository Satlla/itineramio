import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../src/lib/prisma'
import { checkHostManualesAccess, MANUAL_BLOCKED_MESSAGE } from '../../../../../../../src/lib/public-module-check'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  try {
    const { id: propertyId, zoneId } = await params
    console.log('🔍 Public Zone endpoint - propertyId:', propertyId, 'zoneId:', zoneId)
    
    // Find the zone with exact match first, then startsWith
    let zone = await prisma.zone.findFirst({
      where: {
        id: zoneId,
        propertyId: propertyId,
        property: {
          isPublished: true // Property must be published
        },
        AND: [
          {
            OR: [
              {
                AND: [
                  { isPublished: true },
                  { status: 'ACTIVE' }
                ]
              },
              {
                steps: {
                  some: {
                    isPublished: true
                  }
                }
              },
              {
                AND: [
                  { type: 'RECOMMENDATIONS' },
                  { isPublished: true },
                  { recommendations: { some: {} } }
                ]
              }
            ]
          }
        ]
      },
      include: {
        steps: {
          where: {
            isPublished: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        property: {
          select: {
            name: true,
            isPublished: true
          }
        }
      }
    })

    // If not found with exact match, try startsWith (for Next.js truncation)
    if (!zone) {
      const zones = await prisma.zone.findMany({
        where: {
          id: {
            startsWith: zoneId
          },
          propertyId: {
            startsWith: propertyId
          },
          property: {
            isPublished: true // Property must be published
          },
          AND: [
            {
              OR: [
                {
                  AND: [
                    { isPublished: true },
                    { status: 'ACTIVE' }
                  ]
                },
                {
                  steps: {
                    some: {
                      isPublished: true
                    }
                  }
                },
                {
                  AND: [
                    { type: 'RECOMMENDATIONS' },
                    { isPublished: true },
                    { recommendations: { some: {} } }
                  ]
                }
              ]
            }
          ]
        },
        include: {
          steps: {
            where: {
              isPublished: true
            },
            orderBy: {
              order: 'asc'
            }
          },
          property: {
            select: {
              name: true,
              isPublished: true
            }
          }
        }
      })
      zone = zones[0]
    }

    console.log('🔍 Public Zone found:', !!zone)
    if (zone) {
      console.log('🔍 Zone details:', { id: zone.id, propertyId: zone.propertyId, stepsCount: zone.steps.length })
    }

    if (!zone) {
      return NextResponse.json(
        {
          success: false,
          error: 'Zona no encontrada'
        },
        { status: 404 }
      )
    }

    // Check if host has MANUALES module access
    const property = await prisma.property.findFirst({
      where: { id: zone.propertyId, deletedAt: null },
      select: { hostId: true }
    })

    if (property?.hostId) {
      const moduleAccess = await checkHostManualesAccess(property.hostId)
      if (!moduleAccess.hasAccess) {
        console.log(`🚫 Zone blocked for property ${propertyId} - host ${property.hostId} has no MANUALES access: ${moduleAccess.blockedReason}`)
        return NextResponse.json({
          success: false,
          error: MANUAL_BLOCKED_MESSAGE.description,
          code: MANUAL_BLOCKED_MESSAGE.code,
          blocked: true
        }, { status: 403 })
      }
    }

    // For RECOMMENDATIONS zones, fetch recommendations with places instead of steps
    if (zone.type === 'RECOMMENDATIONS') {
      const recommendations = await prisma.recommendation.findMany({
        where: { zoneId: zone.id },
        include: {
          place: true,
        },
        orderBy: { order: 'asc' },
      })

      const processedZone = {
        ...zone,
        steps: [], // No steps for recommendation zones
        recommendations: recommendations.map(rec => ({
          id: rec.id,
          source: rec.source,
          description: rec.description,
          descriptionTranslations: rec.descriptionTranslations,
          distanceMeters: rec.distanceMeters,
          walkMinutes: rec.walkMinutes,
          order: rec.order,
          place: rec.place ? {
            id: rec.place.id,
            placeId: rec.place.placeId,
            name: rec.place.name,
            address: rec.place.address,
            latitude: rec.place.latitude,
            longitude: rec.place.longitude,
            rating: rec.place.rating,
            priceLevel: rec.place.priceLevel,
            phone: rec.place.phone,
            website: rec.place.website,
            photoUrl: rec.place.photoUrl,
            openingHours: rec.place.openingHours,
            source: rec.place.source,
            businessStatus: rec.place.businessStatus,
          } : null,
        })),
      }

      return NextResponse.json({
        success: true,
        data: processedZone
      })
    }

    // Process steps to extract mediaUrl from content JSON
    const processedSteps = zone.steps.map(step => {
      let mediaUrl = null
      let linkUrl = null

      try {
        if (step.content && typeof step.content === 'object') {
          const content = step.content as any
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
        linkUrl
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
    console.error('Error fetching public zone:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener la zona' 
      },
      { status: 500 }
    )
  }
}