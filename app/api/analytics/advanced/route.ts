/**
 * API Endpoint: Advanced Analytics
 *
 * GET /api/analytics/advanced?propertyId=xxx&timeframe=7d
 * - Returns all advanced metrics for a property
 * - Includes: ROI, prevented calls, health score, NPS, engagement, user journey
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../../src/lib/auth'
import { prisma } from '../../../../src/lib/prisma'
import { getAdvancedAnalytics } from '../../../../src/lib/analytics/advanced-metrics'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const timeframe = searchParams.get('timeframe') || '30d'

    if (!propertyId) {
      return NextResponse.json({
        success: false,
        error: 'propertyId is required'
      }, { status: 400 })
    }

    // Verify user owns the property
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        hostId: userId
      }
    })

    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Property not found or unauthorized'
      }, { status: 404 })
    }

    // Calculate date range
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    // Get advanced analytics
    const analytics = await getAdvancedAnalytics(
      userId,
      propertyId,
      startDate,
      endDate
    )

    return NextResponse.json({
      success: true,
      data: analytics,
      meta: {
        propertyId,
        timeframe,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching advanced analytics:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
