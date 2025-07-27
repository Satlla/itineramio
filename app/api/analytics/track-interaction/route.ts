import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { propertyId, zoneId, interactionType } = body

    if (!propertyId || !interactionType) {
      return NextResponse.json({
        success: false,
        error: 'Property ID and interaction type are required'
      }, { status: 400 })
    }

    // Track different types of interactions
    const updateData: any = {}
    
    switch (interactionType) {
      case 'zone_view':
        // When a guest views a zone, it's likely they had a question
        updateData.totalViews = { increment: 1 }
        break
      case 'step_completed':
        // When a step is completed, a potential query was avoided
        updateData.uniqueVisitors = { increment: 1 }
        break
      case 'whatsapp_click':
        updateData.whatsappClicks = { increment: 1 }
        break
      case 'session_complete':
        // When a full zone is completed
        updateData.avgSessionDuration = { increment: body.duration || 0 }
        break
    }

    // Update analytics
    const analytics = await prisma.propertyAnalytics.upsert({
      where: { propertyId },
      update: updateData,
      create: {
        propertyId,
        ...updateData
      }
    })

    return NextResponse.json({
      success: true,
      analytics
    })

  } catch (error) {
    console.error('Error tracking interaction:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error tracking interaction'
    }, { status: 500 })
  }
}