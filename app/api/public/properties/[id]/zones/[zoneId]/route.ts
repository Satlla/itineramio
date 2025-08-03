import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../src/lib/prisma'

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
            id: 'asc'
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
              id: 'asc'
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