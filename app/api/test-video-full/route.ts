import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { requireAuth } from '../../../src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Set JWT claims for RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`

    // Get the most recent property
    const property = await prisma.property.findFirst({
      where: {
        hostId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!property) {
      return NextResponse.json({ error: 'No property found' })
    }

    // Get Check In zone
    const checkInZone = await prisma.zone.findFirst({
      where: {
        propertyId: property.id,
        OR: [
          { name: { equals: 'Check In' } },
          { name: { path: '$.es', equals: 'Check In' } }
        ]
      },
      include: {
        steps: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!checkInZone) {
      return NextResponse.json({ error: 'No Check In zone found' })
    }

    // Process steps to show exactly what's in the database
    const stepsInfo = checkInZone.steps.map(step => {
      const content = step.content as any
      return {
        id: step.id,
        title: step.title,
        type: step.type,
        order: step.order,
        content: content,
        contentKeys: content ? Object.keys(content) : [],
        hasMediaUrl: content && content.mediaUrl ? true : false,
        mediaUrl: content && content.mediaUrl ? content.mediaUrl : null,
        rawContent: JSON.stringify(step.content, null, 2)
      }
    })

    // Now test the public API
    const publicStepsResponse = await fetch(
      `http://localhost:3000/api/public/properties/${property.id}/zones/${checkInZone.id}/steps`
    )
    const publicStepsResult = await publicStepsResponse.json()

    // Test what the public view would see
    const publicViewData = publicStepsResult.success ? publicStepsResult.data.map((step: any) => ({
      id: step.id,
      title: step.title,
      type: step.type,
      mediaUrl: step.mediaUrl,
      hasMediaUrl: !!step.mediaUrl
    })) : []

    return NextResponse.json({
      property: {
        id: property.id,
        name: property.name
      },
      zone: {
        id: checkInZone.id,
        name: checkInZone.name
      },
      databaseSteps: stepsInfo,
      publicApiSteps: publicViewData,
      publicApiResponse: publicStepsResult
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ 
      error: 'Error in test', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}