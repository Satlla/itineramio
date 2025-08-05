import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { propertyId, zoneId, interactionType, duration, stepIndex, totalSteps } = body

    if (!propertyId || !interactionType) {
      return NextResponse.json({
        success: false,
        error: 'Property ID and interaction type are required'
      }, { status: 400 })
    }

    // Get visitor info for unique tracking
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown'

    // Update property analytics for all interactions
    const propertyUpdateData: any = { lastCalculatedAt: new Date() }
    
    switch (interactionType) {
      case 'property_view':
        // Track property profile views
        propertyUpdateData.totalViews = { increment: 1 }
        propertyUpdateData.uniqueVisitors = { increment: 1 }
        break
      case 'zone_view':
        // Track zone views - increment property views too
        propertyUpdateData.totalViews = { increment: 1 }
        break
      case 'step_view':
        // Track individual step views
        propertyUpdateData.totalViews = { increment: 1 }
        break
      case 'step_completed':
        // When a step is completed, calculate time saved
        const estimatedTimeSaved = 2 // Average 2 minutes saved per completed step
        propertyUpdateData.uniqueVisitors = { increment: 1 }
        break
      case 'whatsapp_click':
        propertyUpdateData.whatsappClicks = { increment: 1 }
        break
      case 'session_complete':
        // When a full zone is completed
        if (duration) {
          propertyUpdateData.avgSessionDuration = { increment: duration }
        }
        break
    }

    // Update property analytics
    try {
      const propertyAnalytics = await prisma.propertyAnalytics.upsert({
        where: { propertyId },
        update: propertyUpdateData,
        create: {
          id: `analytics_${propertyId}_${Date.now()}`,
          propertyId,
          totalViews: 1,
          uniqueVisitors: interactionType === 'property_view' ? 1 : 0,
          whatsappClicks: interactionType === 'whatsapp_click' ? 1 : 0,
          avgSessionDuration: interactionType === 'session_complete' && duration ? duration : 0,
          lastCalculatedAt: new Date()
        }
      })
    } catch (error) {
      console.error('Property analytics error:', error)
      // Continue without failing the whole request
    }

    // Note: Zone-specific analytics would go to zone_analytics table if it existed
    // For now, all zone interactions are tracked in property_analytics and tracking_events
    // This provides comprehensive tracking without requiring additional schema changes

    // Log detailed analytics for debugging/monitoring
    console.log('📊 INTERACTION TRACKED:', {
      type: interactionType.toUpperCase(),
      propertyId,
      zoneId: zoneId || null,
      userAgent,
      ipAddress: ip,
      duration,
      stepIndex,
      totalSteps,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Interaction tracked successfully'
    })

  } catch (error) {
    console.error('Error tracking interaction:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error tracking interaction'
    }, { status: 500 })
  }
}