import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

// POST /api/tracking/property-view - Track property view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { propertyId, language, timezone, screenWidth, screenHeight } = body

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    // Get visitor info
    const userAgent = request.headers.get('user-agent') || undefined
    const referrer = request.headers.get('referer') || undefined
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'
    const visitorIp = ip.split(',')[0].trim()

    // Get property to obtain hostId
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { hostId: true }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Check if this IP has visited this property before
    const existingView = await prisma.propertyView.findFirst({
      where: {
        propertyId,
        visitorIp
      }
    })

    const isUniqueVisitor = !existingView

    // Create property view record for detailed analytics
    await prisma.propertyView.create({
      data: {
        propertyId,
        hostId: property.hostId,
        visitorIp,
        userAgent,
        referrer,
        language: language || 'es',
        timezone: timezone || 'UTC',
        screenWidth: screenWidth || null,
        screenHeight: screenHeight || null
      }
    })

    // Update property analytics
    const updateData: any = {
      totalViews: { increment: 1 },
      lastViewedAt: new Date(),
      lastCalculatedAt: new Date()
    }

    // Only increment uniqueVisitors if this is a new visitor
    if (isUniqueVisitor) {
      updateData.uniqueVisitors = { increment: 1 }
    }

    const analytics = await prisma.propertyAnalytics.upsert({
      where: { propertyId },
      create: {
        propertyId,
        totalViews: 1,
        uniqueVisitors: 1,
        whatsappClicks: 0,
        avgSessionDuration: 0,
        overallRating: 0,
        totalRatings: 0,
        lastViewedAt: new Date(),
        lastCalculatedAt: new Date()
      },
      update: updateData
    })

    // Update daily stats (async, don't wait)
    updateDailyStats(propertyId, isUniqueVisitor).catch(console.error)

    return NextResponse.json({
      success: true,
      data: {
        propertyId,
        totalViews: analytics.totalViews,
        uniqueVisitors: analytics.uniqueVisitors,
        isUniqueVisitor
      }
    })
  } catch (error) {
    console.error('Error tracking property view:', error)
    return NextResponse.json(
      { error: 'Error tracking property view' },
      { status: 500 }
    )
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
      views: { increment: 1 },
      updatedAt: new Date()
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
        views: 1,
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