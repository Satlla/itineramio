import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

// POST /api/tracking/property-view - Track property view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { propertyId } = body

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    // Update property analytics
    const analytics = await prisma.propertyAnalytics.upsert({
      where: { propertyId },
      create: {
        propertyId,
        totalViews: 1,
        uniqueVisitors: 1,
        whatsappClicks: 0,
        avgSessionDuration: 0,
        overallRating: 0,
        totalRatings: 0
      },
      update: {
        totalViews: { increment: 1 }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        propertyId,
        totalViews: analytics.totalViews
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