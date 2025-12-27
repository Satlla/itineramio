import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { propertyId, zoneId, completionTime, timestamp, sessionId, userId, stepsCompleted, totalSteps } = await request.json()

    // Validate required fields
    if (!propertyId || !zoneId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Save tracking event to database
    await prisma.trackingEvent.create({
      data: {
        type: 'ZONE_COMPLETED',
        propertyId,
        zoneId,
        userId: userId || null,
        sessionId: sessionId || null,
        duration: completionTime || null,
        metadata: {
          completionTime,
          stepsCompleted,
          totalSteps
        },
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      }
    })

    // Update zone analytics with completion data
    updateZoneCompletionAnalytics(zoneId, completionTime, stepsCompleted, totalSteps).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Zone completion tracked successfully'
    })
  } catch (error) {
    console.error('Error tracking zone completion:', error)
    return NextResponse.json(
      { error: 'Failed to track zone completion' },
      { status: 500 }
    )
  }
}

async function updateZoneCompletionAnalytics(zoneId: string, completionTime?: number, stepsCompleted?: number, totalSteps?: number) {
  try {
    // Get current analytics
    const analytics = await prisma.zoneAnalytics.findUnique({
      where: { zoneId }
    })

    if (analytics) {
      // Calculate new averages
      const newCompletions = analytics.totalCompletions + 1
      let newAvgTimeSpent = analytics.avgTimeSpent
      let newAvgStepsCompleted = analytics.avgStepsCompleted
      let newCompletionRate = analytics.completionRate
      let newTimeSaved = analytics.timeSavedMinutes

      if (completionTime) {
        newAvgTimeSpent = Math.round((analytics.avgTimeSpent * analytics.totalCompletions + completionTime) / newCompletions)
        // Estimate time saved (assume manual instructions would take 3x longer)
        const estimatedManualTime = completionTime * 3
        const timeSavedThisSession = Math.max(0, estimatedManualTime - completionTime)
        newTimeSaved = analytics.timeSavedMinutes + Math.round(timeSavedThisSession / 60) // Convert to minutes
      }

      if (stepsCompleted && totalSteps) {
        newAvgStepsCompleted = (analytics.avgStepsCompleted * analytics.totalCompletions + stepsCompleted) / newCompletions
        // Calculate weighted average of completion rate (not just last value)
        const thisSessionRate = (stepsCompleted / totalSteps) * 100
        newCompletionRate = (analytics.completionRate * analytics.totalCompletions + thisSessionRate) / newCompletions
      }

      await prisma.zoneAnalytics.update({
        where: { zoneId },
        data: {
          totalCompletions: newCompletions,
          avgTimeSpent: newAvgTimeSpent,
          avgStepsCompleted: newAvgStepsCompleted,
          completionRate: newCompletionRate,
          timeSavedMinutes: newTimeSaved,
          lastCalculatedAt: new Date()
        }
      })
    } else {
      // Create new analytics record
      await prisma.zoneAnalytics.create({
        data: {
          zoneId,
          totalCompletions: 1,
          avgTimeSpent: completionTime || 0,
          avgStepsCompleted: stepsCompleted || 0,
          completionRate: stepsCompleted && totalSteps ? (stepsCompleted / totalSteps) * 100 : 0,
          timeSavedMinutes: completionTime ? Math.round((completionTime * 2) / 60) : 0, // Estimate time saved
          lastCalculatedAt: new Date()
        }
      })
    }
  } catch (error) {
    console.error('Error updating completion analytics:', error)
  }
}