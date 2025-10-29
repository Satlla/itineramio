import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'

function getUserIdFromToken(request: NextRequest): string | null {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return null

    const authUser = verifyToken(token)
    return authUser.userId
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Get user with subscription info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscription: true,
        subscriptions: {
          where: {
            status: 'ACTIVE'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            plan: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Get subscription info
    const activeSubscription = user.subscriptions[0]

    let subscriptionInfo = {
      plan: user.subscription || 'STARTER',
      expiresAt: null as string | null,
      status: activeSubscription ? 'ACTIVE' : 'INACTIVE'
    }

    if (activeSubscription) {
      // Calculate expiration date based on subscription period
      const createdAt = new Date(activeSubscription.createdAt)
      const billingPeriod = activeSubscription.billingPeriod || 'MONTHLY'

      let expiresAt = new Date(createdAt)

      switch (billingPeriod) {
        case 'MONTHLY':
          expiresAt.setMonth(expiresAt.getMonth() + 1)
          break
        case 'BIANNUAL':
          expiresAt.setMonth(expiresAt.getMonth() + 6)
          break
        case 'ANNUAL':
          expiresAt.setFullYear(expiresAt.getFullYear() + 1)
          break
      }

      subscriptionInfo.expiresAt = expiresAt.toISOString()
      subscriptionInfo.plan = activeSubscription.plan?.name || user.subscription || 'STARTER'
    }

    return NextResponse.json(subscriptionInfo)
  } catch (error) {
    console.error('Error fetching subscription status:', error)
    return NextResponse.json(
      { error: 'Error al obtener estado de suscripción' },
      { status: 500 }
    )
  }
}
