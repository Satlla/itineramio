import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../src/lib/admin-auth'

// Force Vercel rebuild - fixed userSubscriptions -> subscriptions

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    // Build where clause
    const where = search ? {
      OR: [
        { email: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } },
        { companyName: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {}

    // Get users and count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          companyName: true,
          role: true,
          status: true,
          subscription: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          subscriptions: {
            select: {
              id: true,
              status: true,
              startDate: true,
              endDate: true,
              notes: true,
              plan: {
                select: {
                  name: true,
                  priceMonthly: true
                }
              },
              customPlan: {
                select: {
                  name: true,
                  pricePerProperty: true
                }
              }
            },
            where: {
              status: 'ACTIVE'
            },
            take: 1
          },
          _count: {
            select: {
              properties: true,
              propertySets: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    // Transform users to match expected format
    const transformedUsers = users.map(user => {
      let billingPeriod = 'Mensual'
      if (user.subscriptions && user.subscriptions.length > 0 && user.subscriptions[0].notes) {
        const periodMatch = user.subscriptions[0].notes.match(/Período:\s*(Mensual|Semestral|Anual)/i)
        if (periodMatch) {
          billingPeriod = periodMatch[1]
        }
      }

      return {
        ...user,
        currentSubscription: user.subscriptions && user.subscriptions.length > 0
          ? {
              id: user.subscriptions[0].id,
              startDate: user.subscriptions[0].startDate,
              endDate: user.subscriptions[0].endDate,
              billingPeriod,
              plan: {
                name: user.subscriptions[0].plan?.name || user.subscriptions[0].customPlan?.name || 'No Plan',
                priceMonthly: Number(user.subscriptions[0].plan?.priceMonthly || user.subscriptions[0].customPlan?.pricePerProperty || 0)
              }
            }
          : null
      }
    })

    return NextResponse.json({
      success: true,
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}