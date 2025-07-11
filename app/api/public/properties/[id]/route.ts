import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🔍 Public Property endpoint - received ID:', id)
    
    // Find property by exact ID match - try published first, then any property
    let property = await prisma.property.findFirst({
      where: {
        id: id,
        isPublished: true // Only published properties
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
    
    console.log('🔍 Published property found:', !!property)
    
    // If no published property found, try to find any property (for preview purposes)
    if (!property) {
      console.log('🔄 No published property found, trying any property...')
      property = await prisma.property.findFirst({
        where: {
          id: id // Any property with this ID
        },
        include: {
          zones: {
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
          }
        }
      })
    }
    
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
        error: 'Propiedad no encontrada'
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
      zones: processedZones,
      isPreview: !property.isPublished // Flag to indicate if this is a preview
    }
    
    return NextResponse.json({
      success: true,
      data: result,
      isPreview: !property.isPublished
    })
  } catch (error) {
    console.error('Error fetching public property:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener la propiedad'
    }, { status: 500 })
  }
}