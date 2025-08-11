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
    const timeframe = searchParams.get('timeframe') || '30d'; // 7d, 30d, 90d, 1y
    const metric = searchParams.get('metric') || 'all'; // visits, chatbot, users, properties
    
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
    
    // Use custom dates if provided, otherwise use timeframe
    if (customStartDate) {
      startDate = new Date(customStartDate);
    } else {
      switch (timeframe) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }
    
    let endDate: Date = customEndDate ? new Date(customEndDate) : now;

    const analytics: any = {};

    // Zone visits analytics
    if (metric === 'all' || metric === 'visits') {
      // Build where clause for zones
      const zoneWhere: any = {
        lastViewedAt: {
          gte: startDate,
          lte: endDate
        }
      };
      
      if (propertyId) {
        zoneWhere.propertyId = propertyId;
      }
      
      if (zoneId) {
        zoneWhere.id = zoneId;
      }
      
      if (minViews || maxViews) {
        zoneWhere.viewCount = {};
        if (minViews) {
          zoneWhere.viewCount.gte = parseInt(minViews);
        }
        if (maxViews) {
          zoneWhere.viewCount.lte = parseInt(maxViews);
        }
      }
      
      // Determine sort order
      const orderBy: any = {};
      switch (sortBy) {
        case 'views':
          orderBy.viewCount = sortOrder;
          break;
        case 'date':
          orderBy.lastViewedAt = sortOrder;
          break;
        case 'name':
          orderBy.name = sortOrder;
          break;
        default:
          orderBy.viewCount = 'desc';
      }
      
      const zoneVisits = await prisma.zone.findMany({
        select: {
          id: true,
          name: true,
          viewCount: true,
          lastViewedAt: true,
          property: {
            select: {
              name: true,
              city: true,
              country: true
            }
          }
        },
        where: zoneWhere,
        orderBy,
        take: 20
      });

      // Get daily visit counts for the timeframe - use same filters
      const dailyVisitsWhere = { ...zoneWhere };
      // Modify the date filter for daily visits to include created zones
      dailyVisitsWhere.OR = [
        { lastViewedAt: { gte: startDate, lte: endDate } },
        { createdAt: { gte: startDate, lte: endDate } }
      ];
      delete dailyVisitsWhere.lastViewedAt; // Remove the direct lastViewedAt filter since we're using OR
      
      const dailyVisits = await prisma.zone.findMany({
        where: dailyVisitsWhere,
        select: {
          viewCount: true,
          lastViewedAt: true,
          createdAt: true
        }
      });

      // Process daily visits data
      const visitsByDate: { [key: string]: number } = {};
      dailyVisits.forEach(zone => {
        const date = (zone.lastViewedAt || zone.createdAt).toISOString().split('T')[0];
        visitsByDate[date] = (visitsByDate[date] || 0) + (zone.viewCount || 0);
      });
      
      const dailyVisitsFormatted = Object.entries(visitsByDate).map(([date, visits]) => ({
        date,
        visits
      })).sort((a, b) => a.date.localeCompare(b.date));

      analytics.visits = {
        topZones: zoneVisits,
        dailyVisits: dailyVisitsFormatted,
        totalVisits: zoneVisits.reduce((sum: number, zone: any) => sum + (zone.viewCount || 0), 0)
      };
    }

    // Chatbot usage analytics
    if (metric === 'all' || metric === 'chatbot') {
      // Build where clause for chatbot logs
      const chatbotWhere: any = {
        action: 'chatbot_interaction',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      };
      
      // Filter by zone or property if specified
      if (zoneId) {
        chatbotWhere.targetId = zoneId;
      } else if (propertyId) {
        // We would need to get zones for this property first, but for simplicity
        // we'll filter in the metadata if available
        chatbotWhere.metadata = {
          path: ['propertyId'],
          equals: propertyId
        };
      }
      
      const chatbotLogs = await prisma.adminActivityLog.findMany({
        where: chatbotWhere,
        select: {
          createdAt: true,
          metadata: true,
          targetId: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Additional filtering for language if specified
      let filteredLogs = chatbotLogs;
      if (language) {
        filteredLogs = chatbotLogs.filter(log => {
          const metadata = log.metadata as any;
          return metadata?.language === language;
        });
      }

      // Group chatbot interactions by day - simplified
      const chatbotByDate: { [key: string]: number } = {};
      filteredLogs.forEach(log => {
        const date = new Date(log.createdAt).toISOString().split('T')[0];
        chatbotByDate[date] = (chatbotByDate[date] || 0) + 1;
      });
      
      const dailyChatbotUsage = Object.entries(chatbotByDate).map(([date, interactions]) => ({
        date,
        interactions
      })).sort((a, b) => a.date.localeCompare(b.date));

      analytics.chatbot = {
        totalInteractions: filteredLogs.length,
        dailyUsage: dailyChatbotUsage,
        recentInteractions: filteredLogs.slice(0, 10)
      };
    }

    // User growth analytics
    if (metric === 'all' || metric === 'users') {
      const users = await prisma.user.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        select: {
          createdAt: true,
          isActive: true
        }
      });

      const usersByDate: { [key: string]: { new_users: number, active_users: number } } = {};
      users.forEach(user => {
        const date = user.createdAt.toISOString().split('T')[0];
        if (!usersByDate[date]) {
          usersByDate[date] = { new_users: 0, active_users: 0 };
        }
        usersByDate[date].new_users += 1;
        if (user.isActive) {
          usersByDate[date].active_users += 1;
        }
      });

      const userGrowth = Object.entries(usersByDate).map(([date, data]) => ({
        date,
        ...data
      })).sort((a, b) => a.date.localeCompare(b.date));

      const userStats = await prisma.user.aggregate({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        _count: {
          id: true
        }
      });

      const activeUsers = await prisma.user.count({
        where: {
          isActive: true,
          lastLoginAt: {
            gte: startDate
          }
        }
      });

      analytics.users = {
        growth: userGrowth,
        newUsers: userStats._count.id,
        activeUsers: activeUsers
      };
    }

    // Property analytics
    if (metric === 'all' || metric === 'properties') {
      // Build where clause for properties
      const propertyWhere: any = {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      };
      
      if (propertyId) {
        propertyWhere.id = propertyId;
      }
      
      const propertyStats = await prisma.property.findMany({
        select: {
          id: true,
          name: true,
          city: true,
          country: true,
          isPublished: true,
          createdAt: true,
          zones: {
            select: {
              viewCount: true
            },
            where: zoneId ? { id: zoneId } : undefined
          }
        },
        where: propertyWhere
      });

      const propertyPerformance = propertyStats.map(property => ({
        ...property,
        totalViews: property.zones.reduce((sum, zone) => sum + (zone.viewCount || 0), 0),
        zonesCount: property.zones.length
      })).sort((a, b) => b.totalViews - a.totalViews);

      analytics.properties = {
        performance: propertyPerformance,
        totalProperties: propertyStats.length,
        publishedProperties: propertyStats.filter(p => p.isPublished).length
      };
    }

    // Performance metrics
    const performanceMetrics = {
      totalZones: await prisma.zone.count(),
      totalProperties: await prisma.property.count(),
      totalUsers: await prisma.user.count(),
      totalViews: await prisma.zone.aggregate({
        _sum: {
          viewCount: true
        }
      }),
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
      analytics
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// POST endpoint for tracking events
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    const { event, data } = await request.json();
    
    // Log different types of events
    switch (event) {
      case 'zone_view':
        // Update zone view count
        if (data.zoneId) {
          await prisma.zone.update({
            where: { id: data.zoneId },
            data: {
              viewCount: {
                increment: 1
              },
              lastViewedAt: new Date()
            }
          });
        }
        break;
        
      case 'chatbot_interaction':
        // Log chatbot interaction
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
              timestamp: new Date().toISOString(),
              ...data
            }
          }
        });
        break;
        
      case 'property_view':
        // Track property views
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