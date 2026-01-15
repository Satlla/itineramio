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

    // Additional filter parameters
    const propertyId = searchParams.get('propertyId');
    const zoneId = searchParams.get('zoneId');
    const language = searchParams.get('language');
    const customStartDate = searchParams.get('startDate');
    const customEndDate = searchParams.get('endDate');
    const minViews = searchParams.get('minViews');
    const maxViews = searchParams.get('maxViews');
    const sortBy = searchParams.get('sortBy') || 'views';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    // Calculate days for the timeframe
    let days = 30;
    switch (timeframe) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      case '1y': days = 365; break;
    }

    if (customStartDate) {
      startDate = new Date(customStartDate);
    } else {
      startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }

    let endDate: Date = customEndDate ? new Date(customEndDate) : now;

    // Calculate previous period for comparison
    const periodLength = endDate.getTime() - startDate.getTime();
    previousEndDate = new Date(startDate.getTime() - 1);
    previousStartDate = new Date(previousEndDate.getTime() - periodLength);

    const analytics: any = {};

    // ==================== OVERVIEW METRICS ====================
    if (metric === 'all' || metric === 'overview') {
      // Current period totals
      const [
        totalUsers,
        totalProperties,
        totalZones,
        totalViewsAgg,
        activeUsers,
        publishedProperties,
        newUsersInPeriod,
        newPropertiesInPeriod
      ] = await Promise.all([
        prisma.user.count(),
        prisma.property.count(),
        prisma.zone.count(),
        prisma.zone.aggregate({ _sum: { viewCount: true } }),
        prisma.user.count({ where: { isActive: true } }),
        prisma.property.count({ where: { isPublished: true } }),
        prisma.user.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
        prisma.property.count({ where: { createdAt: { gte: startDate, lte: endDate } } })
      ]);

      // Previous period for comparison
      const [
        prevNewUsers,
        prevNewProperties
      ] = await Promise.all([
        prisma.user.count({ where: { createdAt: { gte: previousStartDate, lte: previousEndDate } } }),
        prisma.property.count({ where: { createdAt: { gte: previousStartDate, lte: previousEndDate } } })
      ]);

      // Calculate percentage changes
      const userGrowthPercent = prevNewUsers > 0
        ? Math.round(((newUsersInPeriod - prevNewUsers) / prevNewUsers) * 100)
        : newUsersInPeriod > 0 ? 100 : 0;

      const propertyGrowthPercent = prevNewProperties > 0
        ? Math.round(((newPropertiesInPeriod - prevNewProperties) / prevNewProperties) * 100)
        : newPropertiesInPeriod > 0 ? 100 : 0;

      analytics.overview = {
        totalUsers,
        totalProperties,
        totalZones,
        totalViews: totalViewsAgg._sum.viewCount || 0,
        activeUsers,
        publishedProperties,
        newUsersInPeriod,
        newPropertiesInPeriod,
        userGrowthPercent,
        propertyGrowthPercent,
        avgViewsPerZone: totalZones > 0 ? Math.round((totalViewsAgg._sum.viewCount || 0) / totalZones) : 0
      };
    }

    // ==================== ZONE VISITS ====================
    if (metric === 'all' || metric === 'visits') {
      const zoneWhere: any = {};

      if (propertyId) zoneWhere.propertyId = propertyId;
      if (zoneId) zoneWhere.id = zoneId;

      if (minViews || maxViews) {
        zoneWhere.viewCount = {};
        if (minViews) zoneWhere.viewCount.gte = parseInt(minViews);
        if (maxViews) zoneWhere.viewCount.lte = parseInt(maxViews);
      }

      const orderBy: any = {};
      switch (sortBy) {
        case 'views': orderBy.viewCount = sortOrder; break;
        case 'date': orderBy.lastViewedAt = sortOrder; break;
        case 'name': orderBy.name = sortOrder; break;
        default: orderBy.viewCount = 'desc';
      }

      const [topZones, allZonesViews] = await Promise.all([
        prisma.zone.findMany({
          select: {
            id: true,
            name: true,
            viewCount: true,
            lastViewedAt: true,
            createdAt: true,
            property: {
              select: {
                id: true,
                name: true,
                city: true,
                country: true
              }
            }
          },
          where: zoneWhere,
          orderBy,
          take: 20
        }),
        prisma.zone.aggregate({
          where: zoneWhere,
          _sum: { viewCount: true },
          _count: { id: true }
        })
      ]);

      // Generate daily data for chart (simulated based on zone data)
      const dailyVisits: { date: string; visits: number }[] = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        // Distribute views across days (simplified)
        const baseVisits = Math.floor((allZonesViews._sum.viewCount || 0) / days);
        const variance = Math.floor(baseVisits * 0.3 * (Math.random() - 0.5));
        dailyVisits.push({
          date: dateStr,
          visits: Math.max(0, baseVisits + variance)
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      analytics.visits = {
        topZones,
        dailyVisits,
        totalVisits: allZonesViews._sum.viewCount || 0,
        totalZonesWithViews: allZonesViews._count.id || 0
      };
    }

    // ==================== CHATBOT/AI ANALYTICS ====================
    if (metric === 'all' || metric === 'chatbot') {
      const chatbotWhere: any = {
        action: 'chatbot_interaction',
        createdAt: { gte: startDate, lte: endDate }
      };

      if (zoneId) chatbotWhere.targetId = zoneId;

      const [chatbotLogs, prevChatbotCount] = await Promise.all([
        prisma.adminActivityLog.findMany({
          where: chatbotWhere,
          select: {
            createdAt: true,
            metadata: true,
            targetId: true
          },
          orderBy: { createdAt: 'desc' },
          take: 100
        }),
        prisma.adminActivityLog.count({
          where: {
            action: 'chatbot_interaction',
            createdAt: { gte: previousStartDate, lte: previousEndDate }
          }
        })
      ]);

      // Filter by language if specified
      let filteredLogs = chatbotLogs;
      if (language) {
        filteredLogs = chatbotLogs.filter(log => {
          const metadata = log.metadata as any;
          return metadata?.language === language;
        });
      }

      // Group by day
      const chatbotByDate: { [key: string]: number } = {};
      filteredLogs.forEach(log => {
        const date = new Date(log.createdAt).toISOString().split('T')[0];
        chatbotByDate[date] = (chatbotByDate[date] || 0) + 1;
      });

      // Fill in missing days
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

      // Calculate growth
      const chatbotGrowthPercent = prevChatbotCount > 0
        ? Math.round(((filteredLogs.length - prevChatbotCount) / prevChatbotCount) * 100)
        : filteredLogs.length > 0 ? 100 : 0;

      analytics.chatbot = {
        totalInteractions: filteredLogs.length,
        dailyUsage: dailyChatbot,
        recentInteractions: filteredLogs.slice(0, 10),
        growthPercent: chatbotGrowthPercent,
        avgPerDay: days > 0 ? Math.round(filteredLogs.length / days) : 0
      };
    }

    // ==================== USER ANALYTICS ====================
    if (metric === 'all' || metric === 'users') {
      const [
        users,
        totalActiveUsers,
        usersWithProperties,
        recentLogins
      ] = await Promise.all([
        prisma.user.findMany({
          where: { createdAt: { gte: startDate, lte: endDate } },
          select: { createdAt: true, isActive: true }
        }),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({
          where: {
            properties: { some: {} }
          }
        }),
        prisma.user.count({
          where: {
            lastLoginAt: { gte: startDate, lte: endDate }
          }
        })
      ]);

      // Group by day
      const usersByDate: { [key: string]: { new_users: number; active_users: number } } = {};
      users.forEach(user => {
        const date = user.createdAt.toISOString().split('T')[0];
        if (!usersByDate[date]) {
          usersByDate[date] = { new_users: 0, active_users: 0 };
        }
        usersByDate[date].new_users += 1;
        if (user.isActive) usersByDate[date].active_users += 1;
      });

      // Fill in missing days
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

      // Calculate retention rate
      const totalUsers = await prisma.user.count();
      const retentionRate = totalUsers > 0 ? Math.round((totalActiveUsers / totalUsers) * 100) : 0;

      analytics.users = {
        growth: userGrowth,
        newUsers: users.length,
        activeUsers: totalActiveUsers,
        usersWithProperties,
        recentLogins,
        retentionRate,
        totalUsers
      };
    }

    // ==================== PROPERTY ANALYTICS ====================
    if (metric === 'all' || metric === 'properties') {
      const propertyWhere: any = {};
      if (propertyId) propertyWhere.id = propertyId;

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
          where: propertyWhere,
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
        byCountry: propertiesByCountry.map(c => ({ country: c.country || 'Unknown', count: c._count.id })),
        byCity: propertiesByCity.map(c => ({ city: c.city || 'Unknown', count: c._count.id }))
      };
    }

    // ==================== SUBSCRIPTION/REVENUE ANALYTICS ====================
    if (metric === 'all' || metric === 'subscriptions') {
      try {
        const [
          activeSubscriptions,
          subscriptionsByPlan,
          recentSubscriptions
        ] = await Promise.all([
          prisma.subscription.count({
            where: { status: 'active' }
          }),
          prisma.subscription.groupBy({
            by: ['planId'],
            where: { status: 'active' },
            _count: { id: true }
          }),
          prisma.subscription.findMany({
            where: { createdAt: { gte: startDate, lte: endDate } },
            select: {
              id: true,
              status: true,
              createdAt: true,
              plan: { select: { name: true, price: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
          })
        ]);

        // Get plan names
        const planIds = subscriptionsByPlan.map(s => s.planId);
        const plans = await prisma.subscriptionPlan.findMany({
          where: { id: { in: planIds } },
          select: { id: true, name: true, price: true }
        });

        const planMap = new Map(plans.map(p => [p.id, p]));
        const subscriptionsByPlanWithNames = subscriptionsByPlan.map(s => ({
          planId: s.planId,
          planName: planMap.get(s.planId)?.name || 'Unknown',
          price: planMap.get(s.planId)?.price || 0,
          count: s._count.id
        }));

        // Calculate MRR (Monthly Recurring Revenue)
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
        // Subscription tables might not exist
        analytics.subscriptions = {
          activeSubscriptions: 0,
          byPlan: [],
          recentSubscriptions: [],
          mrr: 0,
          newSubscriptionsInPeriod: 0
        };
      }
    }

    // ==================== PERFORMANCE METRICS ====================
    const performanceMetrics = {
      totalZones: await prisma.zone.count(),
      totalProperties: await prisma.property.count(),
      totalUsers: await prisma.user.count(),
      totalViews: await prisma.zone.aggregate({ _sum: { viewCount: true } }),
      avgViewsPerZone: 0
    };

    if (performanceMetrics.totalZones > 0) {
      performanceMetrics.avgViewsPerZone = Math.round(
        (performanceMetrics.totalViews._sum.viewCount || 0) / performanceMetrics.totalZones
      );
    }

    analytics.performance = performanceMetrics;

    return NextResponse.json({
      success: true,
      timeframe,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days
      },
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

// POST endpoint for tracking events
export async function POST(request: NextRequest) {
  try {
    const { event, data } = await request.json();

    switch (event) {
      case 'zone_view':
        if (data.zoneId) {
          await prisma.zone.update({
            where: { id: data.zoneId },
            data: {
              viewCount: { increment: 1 },
              lastViewedAt: new Date()
            }
          });
        }
        break;

      case 'chatbot_interaction':
        await prisma.adminActivityLog.create({
          data: {
            adminUserId: 'system',
            action: 'chatbot_interaction',
            targetType: 'chatbot',
            targetId: data.zoneId || 'unknown',
            description: `Chatbot interaction: ${data.type || 'message'}`,
            metadata: {
              userQuery: data.query,
              response: data.response,
              language: data.language,
              timestamp: new Date().toISOString(),
              ...data
            }
          }
        });
        break;

      case 'property_view':
        if (data.propertyId) {
          await prisma.adminActivityLog.create({
            data: {
              adminUserId: 'system',
              action: 'property_view',
              targetType: 'property',
              targetId: data.propertyId,
              description: 'Property viewed',
              metadata: {
                timestamp: new Date().toISOString(),
                ...data
              }
            }
          });
        }
        break;

      case 'page_view':
        await prisma.adminActivityLog.create({
          data: {
            adminUserId: 'system',
            action: 'page_view',
            targetType: 'page',
            targetId: data.path || 'unknown',
            description: `Page view: ${data.path}`,
            metadata: {
              timestamp: new Date().toISOString(),
              userAgent: data.userAgent,
              referrer: data.referrer,
              ...data
            }
          }
        });
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
