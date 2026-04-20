import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../../src/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertySetId } = await params

    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const propertySet = await prisma.propertySet.findFirst({
      where: { id: propertySetId, hostId: userId },
      select: { id: true, name: true, createdAt: true }
    })

    if (!propertySet) {
      return NextResponse.json({
        success: false,
        error: 'Conjunto no encontrado'
      }, { status: 404 })
    }

    const properties = await prisma.property.findMany({
      where: { propertySetId },
      select: { id: true, name: true, isPublished: true }
    })

    const propertyIds = properties.map(p => p.id)
    const publishedCount = properties.filter(p => p.isPublished).length
    const propertyNameMap = new Map(properties.map(p => [p.id, p.name]))

    if (propertyIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          propertySet: {
            id: propertySet.id,
            name: propertySet.name,
            propertiesCount: 0,
            publishedCount: 0,
            createdAt: propertySet.createdAt
          },
          summary: {
            totalViews: 0,
            uniqueVisitors: 0,
            avgSessionDuration: 0,
            maxSessionDuration: 0,
            minSessionDuration: 0,
            sessionsWithActivity: 0,
            avgPagesPerSession: 0,
            maxPagesPerSession: 0,
            avgRating: 0,
            totalRatings: 0,
            whatsappClicks: 0,
            engagementRate: 0,
            contactRate: 0,
            lastViewedAt: null,
            avgZonesPerSession: 0,
            avgZoneRating: 0,
            totalZoneRatings: 0
          },
          zones: [],
          insights: { mostViewedZone: null, leastViewedZone: null, totalZoneViews: 0 },
          dailyStats: [],
          recentEvaluations: [],
          viewsByHour: [],
          viewsByDayOfWeek: [],
          zoneReviews: [],
          zoneComments: [],
          propertyBreakdown: []
        }
      })
    }

    const idsList = Prisma.join(propertyIds)

    const analyticsRows = await prisma.$queryRaw<any[]>`
      SELECT
        COALESCE(SUM("totalViews"), 0)::int AS "totalViews",
        COALESCE(SUM("uniqueVisitors"), 0)::int AS "uniqueVisitors",
        COALESCE(SUM("whatsappClicks"), 0)::int AS "whatsappClicks",
        COALESCE(SUM("totalRatings"), 0)::int AS "totalRatings",
        AVG(NULLIF("overallRating", 0))::float AS "overallRating",
        MAX("lastViewedAt") AS "lastViewedAt"
      FROM property_analytics
      WHERE "propertyId" IN (${idsList})
    `

    const stats = analyticsRows[0] || {}

    const sessionDurations = await prisma.$queryRaw<any[]>`
      SELECT
        AVG(duration_seconds)::int AS avg_seconds,
        MAX(duration_seconds)::int AS max_seconds,
        MIN(duration_seconds)::int AS min_seconds,
        COUNT(*)::int AS sessions_with_activity
      FROM (
        SELECT
          "visitorIp",
          EXTRACT(EPOCH FROM (MAX("viewedAt") - MIN("viewedAt")))::int AS duration_seconds
        FROM (
          SELECT "visitorIp", "viewedAt" FROM property_views WHERE "propertyId" IN (${idsList})
          UNION ALL
          SELECT "visitorIp", "viewedAt" FROM zone_views WHERE "propertyId" IN (${idsList})
        ) all_views
        GROUP BY "visitorIp"
        HAVING COUNT(*) > 1
      ) sessions
      WHERE duration_seconds > 0 AND duration_seconds < 3600
    `
    const sd = sessionDurations[0] || { avg_seconds: 0, max_seconds: 0, min_seconds: 0, sessions_with_activity: 0 }

    const pagesPerSession = await prisma.$queryRaw<any[]>`
      SELECT
        AVG(pages_viewed)::numeric(10,1) AS avg_pages,
        MAX(pages_viewed)::int AS max_pages
      FROM (
        SELECT
          "visitorIp",
          COUNT(*)::int AS pages_viewed
        FROM (
          SELECT "visitorIp" FROM property_views WHERE "propertyId" IN (${idsList})
          UNION ALL
          SELECT "visitorIp" FROM zone_views WHERE "propertyId" IN (${idsList})
        ) all_views
        GROUP BY "visitorIp"
      ) sessions
    `
    const pageStats = pagesPerSession[0] || { avg_pages: 0, max_pages: 0 }

    const uniqueRows = await prisma.$queryRaw<any[]>`
      SELECT COUNT(DISTINCT "visitorIp")::int AS unique_visitors
      FROM (
        SELECT "visitorIp" FROM property_views WHERE "propertyId" IN (${idsList})
        UNION
        SELECT "visitorIp" FROM zone_views WHERE "propertyId" IN (${idsList})
      ) v
    `
    const realUniqueVisitors = uniqueRows[0]?.unique_visitors || 0

    const propertyViewsTotal = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*)::int AS total
      FROM property_views
      WHERE "propertyId" IN (${idsList})
    `
    const realTotalViews = propertyViewsTotal[0]?.total || 0

    const zoneRows = await prisma.$queryRaw<any[]>`
      SELECT
        z.id,
        z.name,
        z.icon,
        z."propertyId",
        COUNT(zv.id)::int AS "viewCount",
        COUNT(DISTINCT zv."visitorIp")::int AS "uniqueVisitors"
      FROM zones z
      LEFT JOIN zone_views zv ON zv."zoneId" = z.id
      WHERE z."propertyId" IN (${idsList})
      GROUP BY z.id, z.name, z.icon, z."propertyId"
      ORDER BY COUNT(zv.id) DESC
    `

    const totalZoneViews = zoneRows.reduce((sum, z) => sum + Number(z.viewCount), 0)

    const dailyStats = await prisma.$queryRaw<any[]>`
      SELECT
        date,
        SUM(views)::int AS views,
        SUM("uniqueVisitors")::int AS "uniqueVisitors",
        SUM("whatsappClicks")::int AS "whatsappClicks"
      FROM daily_stats
      WHERE "propertyId" IN (${idsList})
        AND date >= NOW() - INTERVAL '30 days'
      GROUP BY date
      ORDER BY date ASC
    `

    const recentEvaluations = await prisma.$queryRaw<any[]>`
      SELECT id, rating, comment, "createdAt"
      FROM property_ratings
      WHERE "propertyId" IN (${idsList})
      ORDER BY "createdAt" DESC
      LIMIT 5
    `

    const viewsByHour = await prisma.$queryRaw<any[]>`
      SELECT
        EXTRACT(HOUR FROM "viewedAt") AS hour,
        COUNT(*)::int AS count
      FROM property_views
      WHERE "propertyId" IN (${idsList})
        AND "viewedAt" >= NOW() - INTERVAL '30 days'
      GROUP BY EXTRACT(HOUR FROM "viewedAt")
      ORDER BY hour
    `

    const viewsByDayOfWeek = await prisma.$queryRaw<any[]>`
      SELECT
        EXTRACT(DOW FROM "viewedAt") AS "dayOfWeek",
        COUNT(*)::int AS count
      FROM property_views
      WHERE "propertyId" IN (${idsList})
        AND "viewedAt" >= NOW() - INTERVAL '30 days'
      GROUP BY EXTRACT(DOW FROM "viewedAt")
      ORDER BY "dayOfWeek"
    `

    const zoneRatings = await prisma.$queryRaw<any[]>`
      SELECT
        zr.id, zr."zoneId", z.name AS "zoneName",
        zr."overallRating", zr.clarity, zr.completeness, zr.helpfulness, zr."upToDate",
        zr.feedback, zr."improvementSuggestions", zr.language, zr."createdAt"
      FROM zone_ratings zr
      JOIN zones z ON z.id = zr."zoneId"
      WHERE z."propertyId" IN (${idsList})
      ORDER BY zr."createdAt" DESC
      LIMIT 20
    `

    const zoneComments = await prisma.$queryRaw<any[]>`
      SELECT
        zc.id, zc."zoneId", z.name AS "zoneName", zc.text, zc.rating,
        zc.language, zc."guestName", zc.status, zc."createdAt"
      FROM zone_comments zc
      JOIN zones z ON z.id = zc."zoneId"
      WHERE z."propertyId" IN (${idsList})
        AND zc.status = 'APPROVED'
      ORDER BY zc."createdAt" DESC
      LIMIT 20
    `

    const zonesPerSession = await prisma.$queryRaw<any[]>`
      SELECT
        "visitorIp",
        COUNT(DISTINCT "zoneId")::int AS "zonesVisited"
      FROM zone_views
      WHERE "propertyId" IN (${idsList})
        AND "viewedAt" >= NOW() - INTERVAL '30 days'
      GROUP BY "visitorIp"
    `
    const avgZonesPerSession = zonesPerSession.length > 0
      ? Math.round((zonesPerSession.reduce((sum, v) => sum + Number(v.zonesVisited), 0) / zonesPerSession.length) * 10) / 10
      : 0

    const zoneRatingStats = await prisma.$queryRaw<any[]>`
      SELECT
        AVG(zr."overallRating") AS "avgRating",
        COUNT(*)::int AS "totalRatings"
      FROM zone_ratings zr
      JOIN zones z ON z.id = zr."zoneId"
      WHERE z."propertyId" IN (${idsList})
    `
    const avgZoneRating = zoneRatingStats[0]?.avgRating ? Math.round(Number(zoneRatingStats[0].avgRating) * 10) / 10 : 0
    const totalZoneRatings = Number(zoneRatingStats[0]?.totalRatings) || 0

    const propertyBreakdown = await prisma.$queryRaw<any[]>`
      SELECT
        p.id,
        p.name,
        COALESCE(pv_count.total, 0)::int AS "propertyViews",
        COALESCE(zv_count.total, 0)::int AS "zoneViews",
        COALESCE(zv_count."uniqueVisitors", 0)::int AS "uniqueVisitors"
      FROM properties p
      LEFT JOIN (
        SELECT "propertyId", COUNT(*) AS total
        FROM property_views
        WHERE "propertyId" IN (${idsList})
        GROUP BY "propertyId"
      ) pv_count ON pv_count."propertyId" = p.id
      LEFT JOIN (
        SELECT "propertyId", COUNT(*) AS total, COUNT(DISTINCT "visitorIp") AS "uniqueVisitors"
        FROM zone_views
        WHERE "propertyId" IN (${idsList})
        GROUP BY "propertyId"
      ) zv_count ON zv_count."propertyId" = p.id
      WHERE p.id IN (${idsList})
      ORDER BY (COALESCE(pv_count.total, 0) + COALESCE(zv_count.total, 0)) DESC
    `

    const totalViews = realTotalViews || Number(stats.totalViews) || 0
    const uniqueVisitors = realUniqueVisitors || Number(stats.uniqueVisitors) || 0
    const whatsappClicks = Number(stats.whatsappClicks) || 0

    const engagementRate = totalViews > 0
      ? Math.round((totalZoneViews / totalViews) * 100)
      : 0

    const contactRate = uniqueVisitors > 0
      ? Math.round((whatsappClicks / uniqueVisitors) * 100)
      : 0

    const mostViewedZone = zoneRows.length > 0 && Number(zoneRows[0].viewCount) > 0 ? zoneRows[0] : null
    const leastViewedZone = zoneRows.length > 1 ? zoneRows.filter(z => Number(z.viewCount) > 0).slice(-1)[0] : null

    return NextResponse.json({
      success: true,
      data: {
        propertySet: {
          id: propertySet.id,
          name: propertySet.name,
          propertiesCount: properties.length,
          publishedCount,
          createdAt: propertySet.createdAt
        },
        summary: {
          totalViews,
          uniqueVisitors,
          avgSessionDuration: sd.avg_seconds || 0,
          maxSessionDuration: sd.max_seconds || 0,
          minSessionDuration: sd.min_seconds || 0,
          sessionsWithActivity: sd.sessions_with_activity || 0,
          avgPagesPerSession: Number(pageStats.avg_pages) || 0,
          maxPagesPerSession: Number(pageStats.max_pages) || 0,
          avgRating: stats.overallRating ? Math.round(Number(stats.overallRating) * 10) / 10 : 0,
          totalRatings: Number(stats.totalRatings) || 0,
          whatsappClicks,
          engagementRate,
          contactRate,
          lastViewedAt: stats.lastViewedAt,
          avgZonesPerSession,
          avgZoneRating,
          totalZoneRatings
        },
        zones: zoneRows.map(z => ({
          id: z.id,
          name: z.name,
          icon: z.icon,
          propertyName: propertyNameMap.get(z.propertyId) || '',
          viewCount: Number(z.viewCount),
          uniqueVisitors: Number(z.uniqueVisitors),
          percentage: totalZoneViews > 0 ? Math.round((Number(z.viewCount) / totalZoneViews) * 100) : 0
        })),
        insights: {
          mostViewedZone: mostViewedZone ? {
            name: mostViewedZone.name,
            views: Number(mostViewedZone.viewCount),
            propertyName: propertyNameMap.get(mostViewedZone.propertyId) || ''
          } : null,
          leastViewedZone: leastViewedZone ? {
            name: leastViewedZone.name,
            views: Number(leastViewedZone.viewCount),
            propertyName: propertyNameMap.get(leastViewedZone.propertyId) || ''
          } : null,
          totalZoneViews
        },
        dailyStats: dailyStats.map(d => ({
          date: d.date,
          views: Number(d.views) || 0,
          uniqueVisitors: Number(d.uniqueVisitors) || 0,
          whatsappClicks: Number(d.whatsappClicks) || 0
        })),
        recentEvaluations: recentEvaluations.map(e => ({
          id: e.id,
          rating: e.rating,
          comment: e.comment,
          createdAt: e.createdAt
        })),
        viewsByHour: viewsByHour.map(v => ({ hour: Number(v.hour), count: Number(v.count) })),
        viewsByDayOfWeek: viewsByDayOfWeek.map(v => ({ dayOfWeek: Number(v.dayOfWeek), count: Number(v.count) })),
        zoneReviews: zoneRatings.map(r => ({
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
        zoneComments: zoneComments.map(c => ({
          id: c.id,
          zoneId: c.zoneId,
          zoneName: c.zoneName,
          text: c.text,
          rating: c.rating,
          guestName: c.guestName,
          language: c.language,
          createdAt: c.createdAt
        })),
        propertyBreakdown: propertyBreakdown.map(p => ({
          id: p.id,
          name: p.name,
          propertyViews: Number(p.propertyViews),
          zoneViews: Number(p.zoneViews),
          uniqueVisitors: Number(p.uniqueVisitors),
          totalViews: Number(p.propertyViews) + Number(p.zoneViews)
        }))
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Error al obtener analíticas',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
