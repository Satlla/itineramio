import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    console.log('🔍 Public Property by-slug endpoint - received slug:', slug)
    
    // Find property by slug first
    let property = await prisma.property.findFirst({
      where: {
        slug: slug,
        isPublished: true
      },
      include: {
        zones: {
          where: {
            isPublished: true,
            status: 'ACTIVE'
          },
          include: {
            steps: {
              where: {
                isPublished: true
              },
              orderBy: {
                id: 'asc'
              }
            }
          },
          orderBy: {
            id: 'asc'
          }
        }
      }
    })
    
    // If not found by slug, try by ID (for backward compatibility)
    if (!property) {
      console.log('🔍 Property not found by slug, trying by ID:', slug)
      
      property = await prisma.property.findFirst({
        where: {
          id: slug,
          isPublished: true
        },
        include: {
          zones: {
            where: {
              isPublished: true,
              status: 'ACTIVE'
            },
            include: {
              steps: {
                where: {
                  isPublished: true
                },
                orderBy: {
                  id: 'asc'
                }
              }
            },
            orderBy: {
              id: 'asc'
            }
          }
        }
      })
    }
    
    console.log('🔍 Public Property final result found:', !!property)
    
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