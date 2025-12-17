import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../../src/lib/admin-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = (await params).id
    
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    // Get complete user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        properties: {
          include: {
            _count: {
              select: {
                zones: true,
                propertyViews: true,
                propertyRatings: true
              }
            },
            zones: {
              select: {
                _count: {
                  select: {
                    ratings: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        propertySets: {
          include: {
            _count: {
              select: {
                properties: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        callLogs: {
          include: {
            admin: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        userNotes: {
          include: {
            admin: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        subscriptions: {
          include: {
            plan: {
              select: {
                id: true,
                name: true,
                code: true,
                priceMonthly: true,
                priceSemestral: true,
                priceYearly: true,
                maxProperties: true
              }
            }
          },
          where: {
            status: 'ACTIVE'
          },
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Calculate stats
    const totalProperties = user.properties.length + user.propertySets.reduce((acc, set) => acc + set._count.properties, 0)
    const totalZones = user.properties.reduce((acc, prop) => acc + prop._count.zones, 0)
    const totalViews = user.properties.reduce((acc, prop) => acc + prop._count.propertyViews, 0)
    // Count both property ratings and zone ratings
    const totalPropertyRatings = user.properties.reduce((acc, prop) => acc + prop._count.propertyRatings, 0)
    const totalZoneRatings = user.properties.reduce((acc, prop) => {
      return acc + prop.zones.reduce((zAcc, zone) => zAcc + zone._count.ratings, 0)
    }, 0)
    const totalReviews = totalPropertyRatings + totalZoneRatings
    const recentCallsCount = await prisma.callLog.count({
      where: { 
        userId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24h
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        companyName: user.companyName,
        role: user.role,
        status: user.status,
        subscription: user.subscription,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        notes: user.notes,
        currentSubscription: user.subscriptions[0] || null,
        stats: {
          totalProperties,
          totalZones,
          totalViews,
          totalReviews,
          recentCallsCount
        },
        properties: user.properties.map(prop => ({
          ...prop,
          _count: {
            zones: prop._count.zones,
            propertyViews: prop._count.propertyViews,
            reviews: prop._count.propertyRatings + prop.zones.reduce((acc, z) => acc + z._count.ratings, 0)
          },
          zones: undefined // Don't send zones data to frontend
        })),
        propertySets: user.propertySets,
        recentCallLogs: user.callLogs,
        recentNotes: user.userNotes
      }
    })

  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}