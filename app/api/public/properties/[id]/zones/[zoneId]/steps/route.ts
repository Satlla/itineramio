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
        id: 'asc'
      }
    })

    // Process steps to extract mediaUrl from content JSON and normalize content format
    const processedSteps = steps.map(step => {
      let mediaUrl = null
      let linkUrl = null
      let thumbnail = null
      let normalizedContent = step.content
      
      try {
        if (step.content && typeof step.content === 'object') {
          const content = step.content as any
          
          // Extract media URLs
          if (content.mediaUrl) {
            mediaUrl = content.mediaUrl
          }
          if (content.linkUrl) {
            linkUrl = content.linkUrl
          }
          if (content.thumbnail) {
            thumbnail = content.thumbnail
          }
          
          // Normalize content format for frontend
          if (content.text && !content.es) {
            // If content has 'text' but no 'es', move text to es
            normalizedContent = {
              ...content,
              es: content.text
            }
          }
        }
      } catch (error) {
        console.error('Error parsing step content:', error)
      }

      return {
        ...step,
        content: normalizedContent,
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