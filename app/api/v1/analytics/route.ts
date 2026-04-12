import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiKey, hasPermission } from '@/lib/api-keys'
import { apiSuccess, apiError } from '@/lib/api-response'

/**
 * GET /api/v1/analytics
 *
 * Returns analytics for all properties belonging to the authenticated user.
 * Used by SatllaBot to include Itineramio metrics in weekly owner reports.
 *
 * Query params:
 *   - period: 'week' | 'month' | 'all' (default: 'week')
 *   - propertyId: optional, filter to a single property
 *
 * Required permission: properties:read
 * Auth: x-api-key header
 */
export async function GET(request: NextRequest) {
  const auth = await requireApiKey(request)
  if (auth instanceof Response) return auth

  if (!hasPermission(auth, 'properties:read')) {
    return apiError('Missing permission: properties:read', 403)
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'week'
  const propertyId = searchParams.get('propertyId')

  // Calculate date range
  const now = new Date()
  let startDate: Date
  if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  } else if (period === 'all') {
    startDate = new Date(2020, 0, 1) // effectively all time
  } else {
    // Default: last 7 days
    startDate = new Date(now)
    startDate.setDate(startDate.getDate() - 7)
  }

  try {
    // Build where clause
    const propertyWhere: Record<string, unknown> = {
      hostId: auth.userId,
      deletedAt: null,
    }
    if (propertyId) {
      propertyWhere.id = propertyId
    }

    // Get properties with their analytics
    const properties = await prisma.property.findMany({
      where: propertyWhere,
      select: {
        id: true,
        name: true,
        slug: true,
        isPublished: true,
        city: true,
        type: true,
        analytics: {
          select: {
            totalViews: true,
            uniqueVisitors: true,
            avgSessionDuration: true,
            overallRating: true,
            totalRatings: true,
            whatsappClicks: true,
            zoneViews: true,
            lastViewedAt: true,
          },
        },
        zones: {
          where: { deletedAt: null },
          select: {
            analytics: {
              select: {
                timeSavedMinutes: true,
                totalViews: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    // Get period-specific view counts from PropertyView
    const periodViews = await prisma.propertyView.groupBy({
      by: ['propertyId'],
      where: {
        propertyId: { in: properties.map((p) => p.id) },
        viewedAt: { gte: startDate, lte: now },
      },
      _count: { id: true },
    })

    const periodViewMap = new Map(
      periodViews.map((pv) => [pv.propertyId, pv._count.id])
    )

    // Get period-specific unique visitors
    const periodVisitors = await prisma.propertyView.groupBy({
      by: ['propertyId'],
      where: {
        propertyId: { in: properties.map((p) => p.id) },
        viewedAt: { gte: startDate, lte: now },
      },
      _count: { _all: true },
    })

    // Get chatbot conversations for the period
    const periodChats = await prisma.chatbotConversation.groupBy({
      by: ['propertyId'],
      where: {
        propertyId: { in: properties.map((p) => p.id) },
        createdAt: { gte: startDate, lte: now },
      },
      _count: { id: true },
    })

    const periodChatMap = new Map(
      periodChats.map((pc) => [pc.propertyId, pc._count.id])
    )

    // Get daily stats for the period (for trend data)
    const dailyStats = await prisma.dailyStats.findMany({
      where: {
        propertyId: { in: properties.map((p) => p.id) },
        date: { gte: startDate, lte: now },
      },
      select: {
        propertyId: true,
        date: true,
        views: true,
        uniqueVisitors: true,
        whatsappClicks: true,
      },
      orderBy: { date: 'asc' },
    })

    // Build response
    const data = properties.map((p) => {
      const totalTimeSaved = p.zones.reduce(
        (sum, z) => sum + (z.analytics?.timeSavedMinutes || 0),
        0
      )

      return {
        propertyId: p.id,
        name: p.name,
        slug: p.slug,
        city: p.city,
        type: p.type,
        isPublished: p.isPublished,

        // All-time metrics (from PropertyAnalytics)
        allTime: {
          totalViews: p.analytics?.totalViews || 0,
          uniqueVisitors: p.analytics?.uniqueVisitors || 0,
          avgSessionDuration: p.analytics?.avgSessionDuration || 0,
          overallRating: p.analytics?.overallRating || 0,
          totalRatings: p.analytics?.totalRatings || 0,
          whatsappClicks: p.analytics?.whatsappClicks || 0,
          zoneViews: p.analytics?.zoneViews || 0,
          timeSavedMinutes: totalTimeSaved,
          lastViewedAt: p.analytics?.lastViewedAt,
        },

        // Period-specific metrics
        period: {
          label: period,
          startDate: startDate.toISOString(),
          endDate: now.toISOString(),
          views: periodViewMap.get(p.id) || 0,
          chatbotConversations: periodChatMap.get(p.id) || 0,
        },

        // Daily breakdown for charts
        dailyStats: dailyStats
          .filter((d) => d.propertyId === p.id)
          .map((d) => ({
            date: d.date.toISOString().split('T')[0],
            views: d.views,
            uniqueVisitors: d.uniqueVisitors,
            whatsappClicks: d.whatsappClicks,
          })),
      }
    })

    // Global summary
    const summary = {
      totalProperties: data.length,
      publishedProperties: data.filter((d) => d.isPublished).length,
      periodViews: data.reduce((s, d) => s + d.period.views, 0),
      periodChats: data.reduce((s, d) => s + d.period.chatbotConversations, 0),
      totalTimeSavedMinutes: data.reduce(
        (s, d) => s + d.allTime.timeSavedMinutes,
        0
      ),
      avgRating:
        data.length > 0
          ? data.reduce((s, d) => s + d.allTime.overallRating, 0) / data.length
          : 0,
    }

    return apiSuccess({ summary, properties: data })
  } catch (error) {
    console.error('[v1/analytics] Error:', error)
    return apiError('Internal server error', 500)
  }
}
