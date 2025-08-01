import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../src/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertySetId } = await params
    
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Set JWT claims for PostgreSQL RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const includeDetails = searchParams.get('details') === 'true'

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Verify property set belongs to user
    const propertySet = await prisma.propertySet.findFirst({
      where: {
        id: propertySetId,
        hostId: userId
      },
      include: {
        properties: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true
          }
        }
      }
    })

    if (!propertySet) {
      return NextResponse.json({
        success: false,
        error: 'Conjunto de propiedades no encontrado'
      }, { status: 404 })
    }

    const propertyIds = propertySet.properties.map(p => p.id)

    // Get property views aggregated
    const propertyViews = await prisma.propertyView.groupBy({
      by: ['propertyId'],
      where: {
        propertyId: { in: propertyIds },
        viewedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      },
      _max: {
        viewedAt: true
      }
    })

    // Get zone views aggregated
    const zoneViews = await prisma.zoneView.groupBy({
      by: ['propertyId', 'zoneId'],
      where: {
        propertyId: { in: propertyIds },
        viewedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      },
      _sum: {
        timeSpent: true
      },
      _max: {
        viewedAt: true
      }
    })

    // Get unique visitors count
    const uniqueVisitors = await prisma.propertyView.groupBy({
      by: ['visitorIp'],
      where: {
        propertyId: { in: propertyIds },
        viewedAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // Calculate totals
    const totalPropertyViews = propertyViews.reduce((sum, pv) => sum + pv._count.id, 0)
    const totalZoneViews = zoneViews.reduce((sum, zv) => sum + zv._count.id, 0)
    const totalUniqueVisitors = uniqueVisitors.length
    const totalTimeSpent = zoneViews.reduce((sum, zv) => sum + (zv._sum.timeSpent || 0), 0)

    // Get detailed breakdown if requested
    let detailedViews = null
    if (includeDetails) {
      // Get property details with zones
      const propertiesWithZones = await prisma.property.findMany({
        where: {
          id: { in: propertyIds }
        },
        include: {
          zones: {
            select: {
              id: true,
              name: true,
              order: true
            },
            orderBy: {
              order: 'asc'
            }
          }
        }
      })

      detailedViews = propertiesWithZones.map(property => {
        const propertyViewData = propertyViews.find(pv => pv.propertyId === property.id)
        const propertyZoneViews = zoneViews.filter(zv => zv.propertyId === property.id)
        
        const zonesWithViews = property.zones.map(zone => {
          const zoneViewData = propertyZoneViews.find(zv => zv.zoneId === zone.id)
          return {
            id: zone.id,
            name: zone.name,
            order: zone.order,
            views: zoneViewData?._count.id || 0,
            timeSpent: zoneViewData?._sum.timeSpent || 0,
            lastViewedAt: zoneViewData?._max.viewedAt || null
          }
        })

        return {
          propertyId: property.id,
          propertyName: property.name,
          propertyViews: propertyViewData?._count.id || 0,
          lastViewedAt: propertyViewData?._max.viewedAt || null,
          zones: zonesWithViews,
          totalZoneViews: propertyZoneViews.reduce((sum, zv) => sum + zv._count.id, 0)
        }
      })
    }

    // Get daily breakdown for chart
    const dailyViews = await prisma.$queryRaw`
      SELECT 
        DATE(viewed_at) as date,
        COUNT(DISTINCT CASE WHEN table_name = 'property_views' THEN id END) as property_views,
        COUNT(DISTINCT CASE WHEN table_name = 'zone_views' THEN id END) as zone_views,
        COUNT(DISTINCT visitor_ip) as unique_visitors
      FROM (
        SELECT id, viewed_at, visitor_ip, 'property_views' as table_name
        FROM property_views 
        WHERE property_id = ANY(${propertyIds}) 
          AND viewed_at >= ${startDate} 
          AND viewed_at <= ${endDate}
        UNION ALL
        SELECT id, viewed_at, visitor_ip, 'zone_views' as table_name
        FROM zone_views 
        WHERE property_id = ANY(${propertyIds}) 
          AND viewed_at >= ${startDate} 
          AND viewed_at <= ${endDate}
      ) combined_views
      GROUP BY DATE(viewed_at)
      ORDER BY date DESC
      LIMIT 30
    `

    return NextResponse.json({
      success: true,
      data: {
        propertySet: {
          id: propertySet.id,
          name: propertySet.name,
          propertiesCount: propertySet.properties.length
        },
        period: {
          startDate,
          endDate,
          days
        },
        summary: {
          totalPropertyViews,
          totalZoneViews,
          totalViews: totalPropertyViews + totalZoneViews,
          totalUniqueVisitors,
          totalTimeSpent,
          avgTimeSpent: totalZoneViews > 0 ? Math.round(totalTimeSpent / totalZoneViews) : 0
        },
        dailyViews,
        ...(detailedViews && { detailedViews })
      }
    })

  } catch (error) {
    console.error('Error obteniendo visualizaciones del conjunto:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}