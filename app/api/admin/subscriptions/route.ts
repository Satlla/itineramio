import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

/**
 * GET /api/admin/subscriptions
 * Lista todas las suscripciones con información completa
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const subscriptions = await prisma.userSubscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
            status: true
          }
        },
        plan: {
          select: {
            id: true,
            name: true,
            code: true,
            priceMonthly: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate metrics
    const now = new Date()
    const activeSubscriptions = subscriptions.filter(s => s.status === 'ACTIVE' && new Date(s.endDate) >= now)
    const cancelingSubscriptions = subscriptions.filter(s => s.status === 'ACTIVE' && s.cancelAtPeriodEnd)
    const expiredSubscriptions = subscriptions.filter(s => s.status === 'CANCELED' || new Date(s.endDate) < now)

    // MRR calculation (Monthly Recurring Revenue)
    const mrr = activeSubscriptions.reduce((total, sub) => {
      const monthlyPrice = sub.plan?.priceMonthly || 0
      return total + Number(monthlyPrice)
    }, 0)

    return NextResponse.json({
      success: true,
      subscriptions,
      metrics: {
        total: subscriptions.length,
        active: activeSubscriptions.length,
        canceling: cancelingSubscriptions.length,
        expired: expiredSubscriptions.length,
        mrr
      }
    })

  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Error al obtener suscripciones' },
      { status: 500 }
    )
  }
}
