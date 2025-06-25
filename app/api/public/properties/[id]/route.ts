import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🔍 Public Property endpoint - received ID:', id)
    
    // Handle potential ID truncation by trying exact match first, then startsWith
    let property = await prisma.property.findFirst({
      where: {
        id: id
        // TODO: Add back isPublished: true when properties are properly published
        // isPublished: true // Only published properties
      },
      include: {
        zones: {
          where: {
            // Only include published zones or zones with steps
            OR: [
              { isPublished: true },
              { steps: { some: { isPublished: true } } }
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
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })
    
    // If not found with exact match, try startsWith (for Next.js truncation)
    if (!property) {
      const properties = await prisma.property.findMany({
        where: {
          id: {
            startsWith: id
          }
          // TODO: Add back isPublished: true when properties are properly published
        },
        include: {
          zones: {
            where: {
              OR: [
                { isPublished: true },
                { steps: { some: { isPublished: true } } }
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
              }
            },
            orderBy: {
              order: 'asc'
            }
          }
        }
      })
      property = properties[0]
    }
    
    console.log('🔍 Public Property found:', !!property)
    if (property) {
      console.log('🔍 Property details:', { 
        id: property.id, 
        name: property.name, 
        zonesCount: property.zones.length,
        isPublished: property.isPublished 
      })
    }
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada o no publicada'
      }, { status: 404 })
    }

    // Process zones to include step counts and extract mediaUrl from content
    const processedZones = property.zones.map(zone => {
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

      return {
        ...zone,
        stepsCount: zone.steps.length,
        steps: processedSteps
      }
    })

    const result = {
      ...property,
      zones: processedZones
    }
    
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error fetching public property:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener la propiedad'
    }, { status: 500 })
  }
}