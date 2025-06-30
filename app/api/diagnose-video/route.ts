import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const propertyId = 'cmciqm5uu0005l804tmz98fj2'
    const zoneId = 'cmciqm6tj0008l80404xjx4x7'

    console.log('🔍 Starting video diagnosis...')

    // Step 1: Check if property exists and is published
    const property = await prisma.property.findFirst({
      where: { id: propertyId }
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' })
    }

    // Step 2: Check if zone exists
    const zone = await prisma.zone.findFirst({
      where: { 
        id: zoneId,
        propertyId: propertyId
      },
      include: {
        steps: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!zone) {
      return NextResponse.json({ error: 'Zone not found' })
    }

    // Step 3: Analyze all steps in detail
    const stepsAnalysis = zone.steps.map(step => {
      const content = step.content as any
      const title = typeof step.title === 'string' ? step.title : (step.title as any)?.es || 'Sin título'
      
      return {
        id: step.id,
        title: title,
        type: step.type,
        order: step.order,
        isPublished: step.isPublished,
        hasContent: !!content,
        contentType: typeof content,
        contentKeys: content ? Object.keys(content) : [],
        hasMediaUrl: !!(content?.mediaUrl),
        mediaUrl: content?.mediaUrl || null,
        contentPreview: content ? JSON.stringify(content, null, 2).substring(0, 200) + '...' : null
      }
    })

    // Step 4: Test public API directly
    const publicResponse = await fetch(`https://www.itineramio.com/api/public/properties/${propertyId}/zones/${zoneId}/steps`)
    const publicResult = await publicResponse.json()

    // Step 5: Check video file accessibility
    const videoCheckResponse = await fetch('https://www.itineramio.com/templates/videos/check-in.mp4', { method: 'HEAD' })

    return NextResponse.json({
      diagnosis: {
        propertyExists: !!property,
        propertyPublished: property?.isPublished,
        zoneExists: !!zone,
        zonePublished: zone?.isPublished,
        totalSteps: zone?.steps.length || 0,
        videoSteps: stepsAnalysis.filter(s => s.type === 'VIDEO').length,
        videoFileAccessible: videoCheckResponse.ok,
        videoFileStatus: videoCheckResponse.status
      },
      property: {
        id: property.id,
        name: property.name,
        isPublished: property.isPublished
      },
      zone: {
        id: zone.id,
        name: zone.name,
        isPublished: zone.isPublished,
        stepsCount: zone.steps.length
      },
      steps: stepsAnalysis,
      publicApiTest: {
        success: publicResult.success,
        dataCount: publicResult.data?.length || 0,
        videoStepsInPublic: publicResult.data?.filter((s: any) => s.type === 'VIDEO' && s.mediaUrl) || []
      }
    })
  } catch (error) {
    console.error('Diagnosis error:', error)
    return NextResponse.json({ 
      error: 'Error in diagnosis', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}