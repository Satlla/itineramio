import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { propertyId, zoneId, interactionType, duration, stepIndex, totalSteps, metadata: extraMetadata } = body

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

    // Normalize IP (take first IP if multiple)
    const visitorIp = ip.split(',')[0].trim()

    // Update property analytics for all interactions
    const propertyUpdateData: any = {
      lastCalculatedAt: new Date(),
      lastViewedAt: new Date()
    }

    switch (interactionType) {
      case 'property_view':
        // No-op: property views are handled by the canonical endpoint
        // /api/properties/[id]/view — only TrackingEvent is created below
        break
      case 'zone_view':
        // Track zone views - increment zone views counter
        propertyUpdateData.zoneViews = { increment: 1 }
        break
      case 'step_view':
        // Track individual step views - no counter increment needed
        break
      case 'step_completed':
        // Step completed - tracked via TrackingEvent, no analytics update needed
        break
      case 'whatsapp_click':
        propertyUpdateData.whatsappClicks = { increment: 1 }
        break
      case 'email_click':
        // Email click tracked via TrackingEvent, no dedicated counter in analytics
        break
      case 'call_click':
        // Call click tracked via TrackingEvent, no dedicated counter in analytics
        break
      case 'qr_download':
        // QR download tracked via TrackingEvent, no dedicated counter in analytics
        break
      case 'recommendation_click':
        // Recommendation interaction tracked via TrackingEvent
        break
      case 'session_complete':
        // When a session is completed, calculate proper average
        if (duration && duration > 0) {
          const [currentAnalytics, sessionEventCount] = await Promise.all([
            prisma.propertyAnalytics.findUnique({ where: { propertyId } }),
            prisma.trackingEvent.count({
              where: { propertyId, type: 'SESSION_COMPLETE' }
            })
          ])

          if (currentAnalytics) {
            const sessionCount = Math.max(sessionEventCount, 1)
            const newAvg = Math.round(
              (currentAnalytics.avgSessionDuration * sessionCount + duration) / (sessionCount + 1)
            )
            propertyUpdateData.avgSessionDuration = newAvg
          } else {
            propertyUpdateData.avgSessionDuration = duration
          }
        }
        break
    }

    // Update property analytics
    try {
      await prisma.propertyAnalytics.upsert({
        where: { propertyId },
        update: propertyUpdateData,
        create: {
          propertyId,
          totalViews: interactionType === 'property_view' ? 1 : 0,
          uniqueVisitors: interactionType === 'property_view' ? 1 : 0,
          whatsappClicks: interactionType === 'whatsapp_click' ? 1 : 0,
          avgSessionDuration: interactionType === 'session_complete' && duration ? duration : 0,
          zoneViews: interactionType === 'zone_view' ? 1 : 0,
          lastCalculatedAt: new Date(),
          lastViewedAt: new Date()
        }
      })
    } catch (error) {
      console.error('Property analytics error:', error)
      // Continue without failing the whole request
    }

    // Create tracking event for detailed analytics
    try {
      await prisma.trackingEvent.create({
        data: {
          type: interactionType.toUpperCase(),
          propertyId,
          zoneId: zoneId || null,
          duration: duration || null,
          metadata: {
            stepIndex,
            totalSteps,
            visitorIp,
            ...extraMetadata
          },
          timestamp: new Date(),
          userAgent,
          ipAddress: visitorIp
        }
      })
    } catch (error) {
      console.error('Tracking event error:', error)
    }

    // Update daily stats for whatsapp clicks
    if (interactionType === 'whatsapp_click') {
      updateDailyStats(propertyId, false, true).catch(console.error)
    }

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

// Helper function to update daily stats
async function updateDailyStats(
  propertyId: string,
  isUniqueVisitor: boolean,
  whatsappClick: boolean = false
) {
  try {
    // Get today's date at midnight UTC
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    const updateData: any = {
      updatedAt: new Date()
    }

    // Only increment views for property_view, not whatsapp_click
    if (!whatsappClick) {
      updateData.views = { increment: 1 }
    }

    if (isUniqueVisitor) {
      updateData.uniqueVisitors = { increment: 1 }
    }

    if (whatsappClick) {
      updateData.whatsappClicks = { increment: 1 }
    }

    await prisma.dailyStats.upsert({
      where: {
        propertyId_date: {
          propertyId,
          date: today
        }
      },
      create: {
        propertyId,
        date: today,
        views: whatsappClick ? 0 : 1,
        uniqueVisitors: isUniqueVisitor ? 1 : 0,
        whatsappClicks: whatsappClick ? 1 : 0,
        avgSessionDuration: 0,
        errorReports: 0,
        newComments: 0
      },
      update: updateData
    })
  } catch (error) {
    console.error('Error updating daily stats:', error)
  }
}