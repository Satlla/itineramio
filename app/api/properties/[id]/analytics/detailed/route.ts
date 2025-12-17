import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../../src/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Verify property belongs to user
    const property = await prisma.$queryRaw`
      SELECT id, name, "isPublished", "createdAt"
      FROM properties
      WHERE id = ${id} AND "hostId" = ${userId}
      LIMIT 1
    ` as any[]

    if (property.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada'
      }, { status: 404 })
    }

    // Get general analytics
    const analytics = await prisma.$queryRaw`
      SELECT
        "totalViews",
        "uniqueVisitors",
        "avgSessionDuration",
        "overallRating",
        "totalRatings",
        "whatsappClicks",
        "errorReportsCount",
        "commentsCount",
        "lastViewedAt"
      FROM property_analytics
      WHERE "propertyId" = ${id}
      LIMIT 1
    ` as any[]

    const stats = analytics[0] || {
      totalViews: 0,
      uniqueVisitors: 0,
      avgSessionDuration: 0,
      overallRating: 0,
      totalRatings: 0,
      whatsappClicks: 0,
      errorReportsCount: 0,
      commentsCount: 0,
      lastViewedAt: null
    }

    // Calculate REAL session duration from timestamps (property_views + zone_views)
    const sessionDurations = await prisma.$queryRaw`
      SELECT
        AVG(duration_seconds)::int as avg_seconds,
        MAX(duration_seconds)::int as max_seconds,
        MIN(duration_seconds)::int as min_seconds,
        COUNT(*)::int as sessions_with_activity
      FROM (
        SELECT
          "visitorIp",
          EXTRACT(EPOCH FROM (MAX("viewedAt") - MIN("viewedAt")))::int as duration_seconds,
          COUNT(*)::int as pages_viewed
        FROM (
          SELECT "visitorIp", "viewedAt" FROM property_views WHERE "propertyId" = ${id}
          UNION ALL
          SELECT "visitorIp", "viewedAt" FROM zone_views WHERE "propertyId" = ${id}
        ) all_views
        GROUP BY "visitorIp"
        HAVING COUNT(*) > 1
      ) sessions
      WHERE duration_seconds > 0 AND duration_seconds < 3600
    ` as any[]

    const realSessionDuration = sessionDurations[0] || {
      avg_seconds: 0,
      max_seconds: 0,
      min_seconds: 0,
      sessions_with_activity: 0
    }

    // Get average pages per session
    const pagesPerSession = await prisma.$queryRaw`
      SELECT
        AVG(pages_viewed)::numeric(10,1) as avg_pages,
        MAX(pages_viewed)::int as max_pages
      FROM (
        SELECT
          "visitorIp",
          COUNT(*)::int as pages_viewed
        FROM (
          SELECT "visitorIp" FROM property_views WHERE "propertyId" = ${id}
          UNION ALL
          SELECT "visitorIp" FROM zone_views WHERE "propertyId" = ${id}
        ) all_views
        GROUP BY "visitorIp"
      ) sessions
    ` as any[]

    const pageStats = pagesPerSession[0] || { avg_pages: 0, max_pages: 0 }

    // Get zone views with zone names
    const zoneViews = await prisma.$queryRaw`
      SELECT
        z.id,
        z.name,
        z.icon,
        COUNT(zv.id) as "viewCount",
        COUNT(DISTINCT zv."visitorIp") as "uniqueVisitors"
      FROM zones z
      LEFT JOIN zone_views zv ON zv."zoneId" = z.id
      WHERE z."propertyId" = ${id}
      GROUP BY z.id, z.name, z.icon
      ORDER BY COUNT(zv.id) DESC
    ` as any[]

    // Get daily stats for the last 30 days
    const dailyStats = await prisma.$queryRaw`
      SELECT
        date,
        views,
        "uniqueVisitors",
        "whatsappClicks"
      FROM daily_stats
      WHERE "propertyId" = ${id}
        AND date >= NOW() - INTERVAL '30 days'
      ORDER BY date ASC
    ` as any[]

    // Get recent evaluations
    const recentEvaluations = await prisma.$queryRaw`
      SELECT
        id,
        rating,
        comment,
        "createdAt"
      FROM property_ratings
      WHERE "propertyId" = ${id}
      ORDER BY "createdAt" DESC
      LIMIT 5
    ` as any[]

    // Get views by hour (for heatmap)
    const viewsByHour = await prisma.$queryRaw`
      SELECT
        EXTRACT(HOUR FROM "viewedAt") as hour,
        COUNT(*) as count
      FROM property_views
      WHERE "propertyId" = ${id}
        AND "viewedAt" >= NOW() - INTERVAL '30 days'
      GROUP BY EXTRACT(HOUR FROM "viewedAt")
      ORDER BY hour
    ` as any[]

    // Get views by day of week
    const viewsByDayOfWeek = await prisma.$queryRaw`
      SELECT
        EXTRACT(DOW FROM "viewedAt") as "dayOfWeek",
        COUNT(*) as count
      FROM property_views
      WHERE "propertyId" = ${id}
        AND "viewedAt" >= NOW() - INTERVAL '30 days'
      GROUP BY EXTRACT(DOW FROM "viewedAt")
      ORDER BY "dayOfWeek"
    ` as any[]

    // Get zone ratings with feedback (reviews de zonas)
    const zoneRatings = await prisma.$queryRaw`
      SELECT
        zr.id,
        zr."zoneId",
        z.name as "zoneName",
        zr."overallRating",
        zr.clarity,
        zr.completeness,
        zr.helpfulness,
        zr."upToDate",
        zr.feedback,
        zr."improvementSuggestions",
        zr.language,
        zr."createdAt"
      FROM zone_ratings zr
      JOIN zones z ON z.id = zr."zoneId"
      WHERE z."propertyId" = ${id}
      ORDER BY zr."createdAt" DESC
      LIMIT 20
    ` as any[]

    // Get zone comments
    const zoneComments = await prisma.$queryRaw`
      SELECT
        zc.id,
        zc."zoneId",
        z.name as "zoneName",
        zc.text,
        zc.rating,
        zc.language,
        zc."guestName",
        zc.status,
        zc."createdAt"
      FROM zone_comments zc
      JOIN zones z ON z.id = zc."zoneId"
      WHERE z."propertyId" = ${id}
        AND zc.status = 'APPROVED'
      ORDER BY zc."createdAt" DESC
      LIMIT 20
    ` as any[]

    // Calculate average zones per session (unique visitors)
    const zonesPerSession = await prisma.$queryRaw`
      SELECT
        "visitorIp",
        COUNT(DISTINCT "zoneId") as "zonesVisited"
      FROM zone_views
      WHERE "propertyId" = ${id}
        AND "viewedAt" >= NOW() - INTERVAL '30 days'
      GROUP BY "visitorIp"
    ` as any[]

    const avgZonesPerSession = zonesPerSession.length > 0
      ? Math.round((zonesPerSession.reduce((sum: number, v: any) => sum + Number(v.zonesVisited), 0) / zonesPerSession.length) * 10) / 10
      : 0

    // Calculate average zone rating
    const zoneRatingStats = await prisma.$queryRaw`
      SELECT
        AVG(zr."overallRating") as "avgRating",
        COUNT(*) as "totalRatings"
      FROM zone_ratings zr
      JOIN zones z ON z.id = zr."zoneId"
      WHERE z."propertyId" = ${id}
    ` as any[]

    const avgZoneRating = zoneRatingStats[0]?.avgRating ? Math.round(Number(zoneRatingStats[0].avgRating) * 10) / 10 : 0
    const totalZoneRatings = Number(zoneRatingStats[0]?.totalRatings) || 0

    // Calculate some derived metrics
    const totalZoneViews = zoneViews.reduce((sum: number, z: any) => sum + Number(z.viewCount), 0)
    const mostViewedZone = zoneViews[0] || null
    const leastViewedZone = zoneViews.length > 1 ? zoneViews[zoneViews.length - 1] : null

    // Calculate engagement rate (views that led to zone exploration)
    const engagementRate = stats.totalViews > 0
      ? Math.round((totalZoneViews / stats.totalViews) * 100)
      : 0

    // Calculate contact rate (WhatsApp clicks / unique visitors)
    const contactRate = stats.uniqueVisitors > 0
      ? Math.round((stats.whatsappClicks / stats.uniqueVisitors) * 100)
      : 0

    return NextResponse.json({
      success: true,
      data: {
        property: property[0],
        summary: {
          totalViews: stats.totalViews || 0,
          uniqueVisitors: stats.uniqueVisitors || 0,
          // Use REAL calculated duration instead of stored value
          avgSessionDuration: realSessionDuration.avg_seconds || 0,
          maxSessionDuration: realSessionDuration.max_seconds || 0,
          minSessionDuration: realSessionDuration.min_seconds || 0,
          sessionsWithActivity: realSessionDuration.sessions_with_activity || 0,
          avgPagesPerSession: Number(pageStats.avg_pages) || 0,
          maxPagesPerSession: pageStats.max_pages || 0,
          avgRating: stats.overallRating || 0,
          totalRatings: stats.totalRatings || 0,
          whatsappClicks: stats.whatsappClicks || 0,
          engagementRate,
          contactRate,
          lastViewedAt: stats.lastViewedAt,
          avgZonesPerSession,
          avgZoneRating,
          totalZoneRatings
        },
        zones: zoneViews.map((z: any) => ({
          id: z.id,
          name: z.name,
          icon: z.icon,
          viewCount: Number(z.viewCount),
          uniqueVisitors: Number(z.uniqueVisitors),
          percentage: totalZoneViews > 0 ? Math.round((Number(z.viewCount) / totalZoneViews) * 100) : 0
        })),
        insights: {
          mostViewedZone: mostViewedZone ? {
            name: mostViewedZone.name,
            views: Number(mostViewedZone.viewCount)
          } : null,
          leastViewedZone: leastViewedZone && Number(leastViewedZone.viewCount) > 0 ? {
            name: leastViewedZone.name,
            views: Number(leastViewedZone.viewCount)
          } : null,
          totalZoneViews
        },
        dailyStats: dailyStats.map((d: any) => ({
          date: d.date,
          views: d.views || 0,
          uniqueVisitors: d.uniqueVisitors || 0,
          whatsappClicks: d.whatsappClicks || 0
        })),
        recentEvaluations: recentEvaluations.map((e: any) => ({
          id: e.id,
          rating: e.rating,
          comment: e.comment,
          createdAt: e.createdAt
        })),
        viewsByHour: viewsByHour.map((v: any) => ({
          hour: Number(v.hour),
          count: Number(v.count)
        })),
        viewsByDayOfWeek: viewsByDayOfWeek.map((v: any) => ({
          dayOfWeek: Number(v.dayOfWeek),
          count: Number(v.count)
        })),
        // Zone reviews and feedback
        zoneReviews: zoneRatings.map((r: any) => ({
          id: r.id,
          zoneId: r.zoneId,
          zoneName: r.zoneName,
          overallRating: r.overallRating,
          clarity: r.clarity,
          completeness: r.completeness,
          helpfulness: r.helpfulness,
          upToDate: r.upToDate,
          feedback: r.feedback,
          improvementSuggestions: r.improvementSuggestions,
          language: r.language,
          createdAt: r.createdAt
        })),
        zoneComments: zoneComments.map((c: any) => ({
          id: c.id,
          zoneId: c.zoneId,
          zoneName: c.zoneName,
          text: c.text,
          rating: c.rating,
          guestName: c.guestName,
          language: c.language,
          createdAt: c.createdAt
        }))
      }
    })

  } catch (error) {
    console.error('Error fetching detailed analytics:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener analíticas',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
