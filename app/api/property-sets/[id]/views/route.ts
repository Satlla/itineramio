import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../src/lib/auth'

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

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const includeDetails = searchParams.get('details') === 'true'

    const propertySet = await prisma.propertySet.findFirst({
      where: { id: propertySetId, hostId: userId },
      select: { id: true, name: true }
    })

    if (!propertySet) {
      return NextResponse.json({
        success: false,
        error: 'Conjunto de propiedades no encontrado'
      }, { status: 404 })
    }

    const properties = await prisma.property.findMany({
      where: { propertySetId },
      select: {
        id: true,
        name: true,
        zones: { select: { id: true, name: true } }
      }
    })

    const propertyIds = properties.map(p => p.id)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    if (propertyIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          propertySet: { id: propertySet.id, name: propertySet.name, propertiesCount: 0 },
          period: { startDate, endDate, days },
          summary: {
            totalPropertyViews: 0,
            totalZoneViews: 0,
            totalViews: 0,
            totalUniqueVisitors: 0,
            totalTimeSpent: 0,
            avgTimeSpent: 0
          },
          dailyViews: [],
          detailedViews: []
        }
      })
    }

    const propertyViewWhere = {
      propertyId: { in: propertyIds },
      viewedAt: { gte: startDate, lte: endDate }
    }
    const zoneViewWhere = {
      propertyId: { in: propertyIds },
      viewedAt: { gte: startDate, lte: endDate },
      isHostView: false
    }

    const [
      propertyViewsByProperty,
      zoneViewsAggregate,
      zoneViewsByZone,
      uniqueIpsProperty,
      uniqueIpsZone
    ] = await Promise.all([
      prisma.propertyView.groupBy({
        by: ['propertyId'],
        where: propertyViewWhere,
        _count: { _all: true }
      }),
      prisma.zoneView.aggregate({
        where: zoneViewWhere,
        _count: { _all: true },
        _sum: { timeSpent: true }
      }),
      prisma.zoneView.groupBy({
        by: ['propertyId', 'zoneId'],
        where: zoneViewWhere,
        _count: { _all: true },
        _sum: { timeSpent: true }
      }),
      prisma.propertyView.groupBy({
        by: ['visitorIp'],
        where: propertyViewWhere
      }),
      prisma.zoneView.groupBy({
        by: ['visitorIp'],
        where: zoneViewWhere
      })
    ])

    const totalPropertyViews = propertyViewsByProperty.reduce((sum, g) => sum + g._count._all, 0)
    const totalZoneViews = zoneViewsAggregate._count._all
    const totalTimeSpent = zoneViewsAggregate._sum.timeSpent || 0

    const uniqueSet = new Set<string>()
    for (const g of uniqueIpsProperty) uniqueSet.add(g.visitorIp)
    for (const g of uniqueIpsZone) uniqueSet.add(g.visitorIp)
    const totalUniqueVisitors = uniqueSet.size

    const avgTimeSpent = totalZoneViews > 0 ? Math.round(totalTimeSpent / totalZoneViews) : 0

    const propertyViewsMap = new Map<string, number>()
    for (const g of propertyViewsByProperty) {
      propertyViewsMap.set(g.propertyId, g._count._all)
    }

    const zoneStatsMap = new Map<string, { views: number; timeSpent: number }>()
    for (const g of zoneViewsByZone) {
      zoneStatsMap.set(g.zoneId, {
        views: g._count._all,
        timeSpent: g._sum.timeSpent || 0
      })
    }

    let detailedViews: Array<{
      propertyId: string
      propertyName: string
      propertyViews: number
      totalZoneViews: number
      zones: Array<{ id: string; name: unknown; views: number; timeSpent: number }>
    }> = []

    if (includeDetails) {
      detailedViews = properties.map(p => {
        const zones = p.zones.map(z => {
          const stats = zoneStatsMap.get(z.id) || { views: 0, timeSpent: 0 }
          return {
            id: z.id,
            name: z.name,
            views: stats.views,
            timeSpent: stats.timeSpent
          }
        })
        const propertyZoneTotal = zones.reduce((sum, z) => sum + z.views, 0)
        return {
          propertyId: p.id,
          propertyName: p.name,
          propertyViews: propertyViewsMap.get(p.id) || 0,
          totalZoneViews: propertyZoneTotal,
          zones
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        propertySet: {
          id: propertySet.id,
          name: propertySet.name,
          propertiesCount: properties.length
        },
        period: { startDate, endDate, days },
        summary: {
          totalPropertyViews,
          totalZoneViews,
          totalViews: totalPropertyViews + totalZoneViews,
          totalUniqueVisitors,
          totalTimeSpent,
          avgTimeSpent
        },
        dailyViews: [],
        detailedViews
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
