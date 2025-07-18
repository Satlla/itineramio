import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    console.log('🔍 Public Property by-slug endpoint - received slug:', slug)
    
    // Find property by slug
    const property = await prisma.property.findFirst({
      where: {
        slug: slug,
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
    
    console.log('🔍 Public Property by slug found:', !!property)
    
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
    console.error('Error fetching public property by slug:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener la propiedad'
    }, { status: 500 })
  }
}