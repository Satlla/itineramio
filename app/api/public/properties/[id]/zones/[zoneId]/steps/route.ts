import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../../src/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  try {
    const { id: propertyId, zoneId } = await params
    console.log('🔍 Public Steps endpoint - propertyId:', propertyId, 'zoneId:', zoneId)
    
    // First verify the property is published
    const property = await prisma.property.findFirst({
      where: {
        OR: [
          { id: propertyId },
          { id: { startsWith: propertyId } }
        ],
        isPublished: true
      }
    })

    if (!property) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Propiedad no encontrada o no publicada' 
        },
        { status: 404 }
      )
    }

    // Find zones that match the zoneId
    const zones = await prisma.zone.findMany({
      where: {
        OR: [
          { id: zoneId },
          { id: { startsWith: zoneId } }
        ],
        propertyId: property.id
      }
    })
    
    const zone = zones[0]
    const actualZoneId = zone?.id || zoneId

    if (!zone) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Zona no encontrada' 
        },
        { status: 404 }
      )
    }

    const steps = await prisma.step.findMany({
      where: {
        zoneId: actualZoneId,
        isPublished: true
      },
      orderBy: {
        order: 'asc'
      }
    })

    // Process steps to extract mediaUrl from content JSON
    const processedSteps = steps.map(step => {
      let mediaUrl = null
      let linkUrl = null
      let thumbnail = null
      
      try {
        if (step.content && typeof step.content === 'object') {
          const content = step.content as any
          if (content.mediaUrl) {
            mediaUrl = content.mediaUrl
          }
          if (content.linkUrl) {
            linkUrl = content.linkUrl
          }
          if (content.thumbnail) {
            thumbnail = content.thumbnail
          }
        }
      } catch (error) {
        console.error('Error parsing step content:', error)
      }

      return {
        ...step,
        mediaUrl,
        linkUrl,
        thumbnail
      }
    })

    return NextResponse.json({
      success: true,
      data: processedSteps
    })
  } catch (error) {
    console.error('Error fetching public steps:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener los pasos' 
      },
      { status: 500 }
    )
  }
}