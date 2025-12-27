import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Find property without any restrictions
    const property = await prisma.property.findFirst({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        propertySet: {
          select: {
            id: true,
            name: true
          }
        },
        zones: {
          select: {
            id: true,
            name: true,
            isPublished: true,
            steps: {
              select: {
                id: true,
                title: true,
                isPublished: true
              }
            }
          }
        }
      }
    })
    
    if (!property) {
      return NextResponse.json({
        exists: false,
        message: 'Property not found with ID: ' + id
      })
    }
    
    // Count published vs unpublished zones and steps
    const publishedZones = property.zones.filter(z => z.isPublished).length
    const totalZones = property.zones.length
    
    let publishedSteps = 0
    let totalSteps = 0
    property.zones.forEach(zone => {
      totalSteps += zone.steps.length
      publishedSteps += zone.steps.filter(s => s.isPublished).length
    })
    
    return NextResponse.json({
      exists: true,
      property: {
        id: property.id,
        name: property.name,
        isPublished: property.isPublished,
        status: property.status,
        slug: property.slug,
        createdAt: property.createdAt,
        publishedAt: property.publishedAt,
        hostId: property.hostId,
        hostEmail: property.host?.email,
        propertySetId: property.propertySetId,
        propertySetName: property.propertySet?.name
      },
      statistics: {
        totalZones,
        publishedZones,
        totalSteps,
        publishedSteps
      },
      publicUrl: property.isPublished ? `https://www.itineramio.com/guide/${property.id}` : null,
      issues: {
        notPublished: !property.isPublished,
        noPublishedZones: publishedZones === 0,
        noPublishedSteps: publishedSteps === 0
      }
    })
    
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}