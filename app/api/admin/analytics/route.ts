import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import { requireAdminAuth } from '../../../../src/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const searchParams = request.nextUrl.searchParams;
    const timeframe = searchParams.get('timeframe') || '30d';
    const metric = searchParams.get('metric') || 'all';
    const propertyId = searchParams.get('propertyId');

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    let days = 30;
    switch (timeframe) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      case '1y': days = 365; break;
    }

    startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const endDate = now;

    // Calculate previous period for comparison
    const periodLength = endDate.getTime() - startDate.getTime();
    previousEndDate = new Date(startDate.getTime() - 1);
    previousStartDate = new Date(previousEndDate.getTime() - periodLength);

    const analytics: any = {};

    // ==================== OVERVIEW METRICS ====================
    if (metric === 'all' || metric === 'overview') {
      const [
        totalUsers,
        totalProperties,
        totalZones,
        totalViewsAgg,
        activeUsers,
        publishedProperties,
        newUsersInPeriod,
        newPropertiesInPeriod,
        prevNewUsers,
        prevNewProperties,
        // Real views in period from ZoneView table
        realViewsInPeriod,
        prevRealViews
      ] = await Promise.all([
        prisma.user.count(),
        prisma.property.count(),
        prisma.zone.count(),
        prisma.zone.aggregate({ _sum: { viewCount: true } }),
        prisma.user.count({ where: { isActive: true } }),
        prisma.property.count({ where: { isPublished: true } }),
        prisma.user.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
        prisma.property.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
        prisma.user.count({ where: { createdAt: { gte: previousStartDate, lte: previousEndDate } } }),
        prisma.property.count({ where: { createdAt: { gte: previousStartDate, lte: previousEndDate } } }),
        prisma.zoneView.count({ where: { viewedAt: { gte: startDate, lte: endDate } } }),
        prisma.zoneView.count({ where: { viewedAt: { gte: previousStartDate, lte: previousEndDate } } })
      ]);

      const userGrowthPercent = prevNewUsers > 0
        ? Math.round(((newUsersInPeriod - prevNewUsers) / prevNewUsers) * 100)
        : newUsersInPeriod > 0 ? 100 : 0;

      const propertyGrowthPercent = prevNewProperties > 0
        ? Math.round(((newPropertiesInPeriod - prevNewProperties) / prevNewProperties) * 100)
        : newPropertiesInPeriod > 0 ? 100 : 0;

      const viewsGrowthPercent = prevRealViews > 0
        ? Math.round(((realViewsInPeriod - prevRealViews) / prevRealViews) * 100)
        : realViewsInPeriod > 0 ? 100 : 0;

      analytics.overview = {
        totalUsers,
        totalProperties,
        totalZones,
        totalViews: totalViewsAgg._sum.viewCount || 0,
        viewsInPeriod: realViewsInPeriod,
        viewsGrowthPercent,
        activeUsers,
        publishedProperties,
        newUsersInPeriod,
        newPropertiesInPeriod,
        userGrowthPercent,
        propertyGrowthPercent,
        avgViewsPerZone: totalZones > 0 ? Math.round((totalViewsAgg._sum.viewCount || 0) / totalZones) : 0
      };
    }

    // ==================== ZONE VISITS (REAL DATA from ZoneView table) ====================
    if (metric === 'all' || metric === 'visits') {
      const zoneViewWhere: any = {
        viewedAt: { gte: startDate, lte: endDate }
      };
      if (propertyId) zoneViewWhere.propertyId = propertyId;

      // Get REAL zone views from ZoneView table
      const [zoneViews, topZones, prevZoneViewsCount] = await Promise.all([
        prisma.zoneView.findMany({
          where: zoneViewWhere,
          select: {
            viewedAt: true,
            zoneId: true,
            isHostView: true
          }
        }),
        prisma.zone.findMany({
          select: {
            id: true,
            name: true,
            viewCount: true,
            lastViewedAt: true,
            property: {
              select: {
                id: true,
                name: true,
                city: true,
                country: true
              }
            }
          },
          where: propertyId ? { propertyId } : {},
          orderBy: { viewCount: 'desc' },
          take: 20
        }),
        prisma.zoneView.count({
          where: {
            viewedAt: { gte: previousStartDate, lte: previousEndDate },
            ...(propertyId ? { propertyId } : {})
          }
        })
      ]);

      // Group views by day (REAL DATA)
      const viewsByDate: { [key: string]: number } = {};
      const guestViewsByDate: { [key: string]: number } = {};

      zoneViews.forEach(view => {
        const date = view.viewedAt.toISOString().split('T')[0];
        viewsByDate[date] = (viewsByDate[date] || 0) + 1;
        if (!view.isHostView) {
          guestViewsByDate[date] = (guestViewsByDate[date] || 0) + 1;
        }
      });

      // Fill in all days in the range
      const dailyVisits: { date: string; visits: number; guestVisits: number }[] = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        dailyVisits.push({
          date: dateStr,
          visits: viewsByDate[dateStr] || 0,
          guestVisits: guestViewsByDate[dateStr] || 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Format zone names (they're stored as JSON)
      const formattedTopZones = topZones.map(zone => ({
        id: zone.id,
        name: typeof zone.name === 'object' ? (zone.name as any).es || (zone.name as any).en || 'Sin nombre' : zone.name,
        viewCount: zone.viewCount || 0,
        lastViewedAt: zone.lastViewedAt,
        property: zone.property
      }));

      // Calculate growth
      const visitsGrowthPercent = prevZoneViewsCount > 0
        ? Math.round(((zoneViews.length - prevZoneViewsCount) / prevZoneViewsCount) * 100)
        : zoneViews.length > 0 ? 100 : 0;

      analytics.visits = {
        topZones: formattedTopZones,
        dailyVisits,
        totalVisits: zoneViews.length,
        guestVisits: zoneViews.filter(v => !v.isHostView).length,
        hostVisits: zoneViews.filter(v => v.isHostView).length,
        totalZonesWithViews: new Set(zoneViews.map(v => v.zoneId)).size,
        growthPercent: visitsGrowthPercent,
        dataSource: 'real' // Flag indicating this is real data
      };
    }

    // ==================== CHATBOT/AI ANALYTICS (REAL DATA from CerebellumQuery) ====================
    if (metric === 'all' || metric === 'chatbot') {
      // Get chatbot interactions from CerebellumQuery table (real AI assistant queries)
      const [chatbotQueries, prevChatbotCount] = await Promise.all([
        prisma.cerebellumQuery.findMany({
          where: {
            createdAt: { gte: startDate, lte: endDate }
          },
          select: {
            createdAt: true,
            wasHelpful: true,
            country: true,
            language: true
          }
        }),
        prisma.cerebellumQuery.count({
          where: {
            createdAt: { gte: previousStartDate, lte: previousEndDate }
          }
        })
      ]);

      // Group by day (REAL DATA)
      const chatbotByDate: { [key: string]: number } = {};
      chatbotQueries.forEach(query => {
        const date = query.createdAt.toISOString().split('T')[0];
        chatbotByDate[date] = (chatbotByDate[date] || 0) + 1;
      });

      // Fill in all days
      const dailyChatbot: { date: string; interactions: number }[] = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        dailyChatbot.push({
          date: dateStr,
          interactions: chatbotByDate[dateStr] || 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const chatbotGrowthPercent = prevChatbotCount > 0
        ? Math.round(((chatbotQueries.length - prevChatbotCount) / prevChatbotCount) * 100)
        : chatbotQueries.length > 0 ? 100 : 0;

      const helpfulCount = chatbotQueries.filter(q => q.wasHelpful === true).length;
      const notHelpfulCount = chatbotQueries.filter(q => q.wasHelpful === false).length;
      const ratedCount = helpfulCount + notHelpfulCount;

      analytics.chatbot = {
        totalInteractions: chatbotQueries.length,
        dailyUsage: dailyChatbot,
        recentInteractions: [],
        growthPercent: chatbotGrowthPercent,
        avgPerDay: days > 0 ? Math.round(chatbotQueries.length / days) : 0,
        helpfulRate: ratedCount > 0 ? Math.round((helpfulCount / ratedCount) * 100) : 0,
        dataSource: 'real'
      };
    }

    // ==================== USER ANALYTICS (REAL DATA) ====================
    if (metric === 'all' || metric === 'users') {
      const [
        usersInPeriod,
        totalActiveUsers,
        usersWithProperties,
        recentLogins
      ] = await Promise.all([
        prisma.user.findMany({
          where: { createdAt: { gte: startDate, lte: endDate } },
          select: { createdAt: true, isActive: true }
        }),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { properties: { some: {} } } }),
        prisma.user.count({
          where: { lastLoginAt: { gte: startDate, lte: endDate } }
        })
      ]);

      // Group by day (REAL DATA)
      const usersByDate: { [key: string]: { new_users: number; active_users: number } } = {};
      usersInPeriod.forEach(user => {
        const date = user.createdAt.toISOString().split('T')[0];
        if (!usersByDate[date]) {
          usersByDate[date] = { new_users: 0, active_users: 0 };
        }
        usersByDate[date].new_users += 1;
        if (user.isActive) usersByDate[date].active_users += 1;
      });

      // Fill in all days
      const userGrowth: { date: string; new_users: number; active_users: number }[] = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        userGrowth.push({
          date: dateStr,
          new_users: usersByDate[dateStr]?.new_users || 0,
          active_users: usersByDate[dateStr]?.active_users || 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const totalUsers = await prisma.user.count();
      const retentionRate = totalUsers > 0 ? Math.round((totalActiveUsers / totalUsers) * 100) : 0;

      analytics.users = {
        growth: userGrowth,
        newUsers: usersInPeriod.length,
        activeUsers: totalActiveUsers,
        usersWithProperties,
        recentLogins,
        retentionRate,
        totalUsers,
        dataSource: 'real'
      };
    }

    // ==================== PROPERTY ANALYTICS ====================
    if (metric === 'all' || metric === 'properties') {
      const [properties, propertiesByCountry, propertiesByCity] = await Promise.all([
        prisma.property.findMany({
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
            isPublished: true,
            createdAt: true,
            zones: {
              select: { viewCount: true, id: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 50
        }),
        prisma.property.groupBy({
          by: ['country'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        }),
        prisma.property.groupBy({
          by: ['city'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        })
      ]);

      const propertyPerformance = properties.map(property => ({
        id: property.id,
        name: property.name,
        city: property.city,
        country: property.country,
        isPublished: property.isPublished,
        createdAt: property.createdAt,
        totalViews: property.zones.reduce((sum, zone) => sum + (zone.viewCount || 0), 0),
        zonesCount: property.zones.length
      })).sort((a, b) => b.totalViews - a.totalViews);

      const publishedCount = properties.filter(p => p.isPublished).length;

      analytics.properties = {
        performance: propertyPerformance,
        totalProperties: properties.length,
        publishedProperties: publishedCount,
        unpublishedProperties: properties.length - publishedCount,
        publishRate: properties.length > 0 ? Math.round((publishedCount / properties.length) * 100) : 0,
        byCountry: propertiesByCountry.map(c => ({ country: c.country || 'Desconocido', count: c._count.id })),
        byCity: propertiesByCity.map(c => ({ city: c.city || 'Desconocida', count: c._count.id }))
      };
    }

    // ==================== SUBSCRIPTION ANALYTICS ====================
    if (metric === 'all' || metric === 'subscriptions') {
      try {
        const [activeSubscriptions, subscriptionsByPlan, recentSubscriptions] = await Promise.all([
          prisma.userSubscription.count({ where: { status: 'active' } }),
          prisma.userSubscription.groupBy({
            by: ['planId'],
            where: { status: 'active', planId: { not: null } },
            _count: { id: true }
          }),
          prisma.userSubscription.findMany({
            where: { createdAt: { gte: startDate, lte: endDate } },
            select: {
              id: true,
              status: true,
              createdAt: true,
              plan: { select: { name: true, priceMonthly: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
          })
        ]);

        const planIds = subscriptionsByPlan.map(s => s.planId).filter(Boolean) as string[];
        const plans = await prisma.subscriptionPlan.findMany({
          where: { id: { in: planIds } },
          select: { id: true, name: true, priceMonthly: true }
        });

        const planMap = new Map(plans.map(p => [p.id, p]));
        const subscriptionsByPlanWithNames = subscriptionsByPlan.map(s => ({
          planId: s.planId || '',
          planName: planMap.get(s.planId || '')?.name || 'Desconocido',
          price: Number(planMap.get(s.planId || '')?.priceMonthly) || 0,
          count: s._count.id
        }));

        const mrr = subscriptionsByPlanWithNames.reduce((total, plan) => {
          return total + (plan.price * plan.count);
        }, 0);

        analytics.subscriptions = {
          activeSubscriptions,
          byPlan: subscriptionsByPlanWithNames,
          recentSubscriptions,
          mrr,
          newSubscriptionsInPeriod: recentSubscriptions.length
        };
      } catch {
        analytics.subscriptions = {
          activeSubscriptions: 0,
          byPlan: [],
          recentSubscriptions: [],
          mrr: 0,
          newSubscriptionsInPeriod: 0
        };
      }
    }

    // ==================== TRACKING EVENTS (REAL DATA) ====================
    if (metric === 'all' || metric === 'events') {
      try {
        const [eventsByType, totalEventsInPeriod] = await Promise.all([
          prisma.trackingEvent.groupBy({
            by: ['type'],
            where: { timestamp: { gte: startDate, lte: endDate } },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } }
          }),
          prisma.trackingEvent.count({
            where: { timestamp: { gte: startDate, lte: endDate } }
          })
        ]);

        analytics.events = {
          byType: eventsByType.map(e => ({ type: e.type, count: e._count.id })),
          totalEvents: totalEventsInPeriod
        };
      } catch {
        analytics.events = { byType: [], totalEvents: 0 };
      }
    }

    // ==================== PERFORMANCE METRICS ====================
    const [totalZonesCount, totalPropsCount, totalUsersCount, totalViewsAggFinal] = await Promise.all([
      prisma.zone.count(),
      prisma.property.count(),
      prisma.user.count(),
      prisma.zone.aggregate({ _sum: { viewCount: true } })
    ]);

    analytics.performance = {
      totalZones: totalZonesCount,
      totalProperties: totalPropsCount,
      totalUsers: totalUsersCount,
      totalViews: { _sum: { viewCount: totalViewsAggFinal._sum.viewCount || 0 } },
      avgViewsPerZone: totalZonesCount > 0 ? Math.round((totalViewsAggFinal._sum.viewCount || 0) / totalZonesCount) : 0
    };

    return NextResponse.json({
      success: true,
      timeframe,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days
      },
      dataSource: 'real', // All data is now from real database tables
      analytics
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST endpoint for tracking events (creates real records)
export async function POST(request: NextRequest) {
  try {
    const { event, data } = await request.json();

    switch (event) {
      case 'zone_view':
        if (data.zoneId && data.propertyId && data.hostId) {
          await Promise.all([
            // Update zone view count
            prisma.zone.update({
              where: { id: data.zoneId },
              data: {
                viewCount: { increment: 1 },
                lastViewedAt: new Date()
              }
            }),
            // Create detailed view record in ZoneView table
            prisma.zoneView.create({
              data: {
                zoneId: data.zoneId,
                propertyId: data.propertyId,
                hostId: data.hostId,
                visitorIp: data.visitorIp || 'unknown',
                userAgent: data.userAgent,
                referrer: data.referrer,
                language: data.language || 'es',
                isHostView: data.isHostView || false
              }
            }),
            // Create tracking event
            prisma.trackingEvent.create({
              data: {
                type: 'zone_view',
                propertyId: data.propertyId,
                zoneId: data.zoneId,
                sessionId: data.sessionId,
                userAgent: data.userAgent,
                ipAddress: data.visitorIp,
                metadata: data
              }
            })
          ]);
        }
        break;

      case 'property_view':
        if (data.propertyId && data.hostId) {
          await Promise.all([
            prisma.propertyView.create({
              data: {
                propertyId: data.propertyId,
                hostId: data.hostId,
                visitorIp: data.visitorIp || 'unknown',
                userAgent: data.userAgent,
                referrer: data.referrer,
                language: data.language || 'es'
              }
            }),
            prisma.trackingEvent.create({
              data: {
                type: 'property_view',
                propertyId: data.propertyId,
                sessionId: data.sessionId,
                userAgent: data.userAgent,
                ipAddress: data.visitorIp,
                metadata: data
              }
            })
          ]);
        }
        break;

      case 'step_view':
        if (data.propertyId) {
          await prisma.trackingEvent.create({
            data: {
              type: 'step_view',
              propertyId: data.propertyId,
              zoneId: data.zoneId,
              stepId: data.stepId,
              sessionId: data.sessionId,
              userAgent: data.userAgent,
              ipAddress: data.visitorIp,
              duration: data.duration,
              metadata: data
            }
          });
        }
        break;

      case 'whatsapp_click':
        if (data.propertyId) {
          await prisma.trackingEvent.create({
            data: {
              type: 'whatsapp_click',
              propertyId: data.propertyId,
              zoneId: data.zoneId,
              sessionId: data.sessionId,
              metadata: data
            }
          });
        }
        break;

      case 'qr_scan':
        if (data.propertyId) {
          await prisma.trackingEvent.create({
            data: {
              type: 'qr_scan',
              propertyId: data.propertyId,
              zoneId: data.zoneId,
              sessionId: data.sessionId,
              userAgent: data.userAgent,
              ipAddress: data.visitorIp,
              metadata: data
            }
          });
        }
        break;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json({
      success: false,
      error: 'Error tracking event'
    }, { status: 500 });
  }
}
