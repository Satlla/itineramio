import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyAdminToken } from '../../../../src/lib/admin-auth'

/**
 * GET /api/admin/expiring-subscriptions
 * Obtiene las suscripciones que están por vencer en los próximos días
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const adminToken = request.cookies.get('admin-token')?.value
    if (!adminToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const adminDecoded = verifyAdminToken(adminToken)
    if (!adminDecoded) {
      return NextResponse.json({ error: 'Token de admin inválido' }, { status: 401 })
    }

    const now = new Date()
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const in15Days = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Obtener suscripciones activas que expiran en los próximos 30 días
    const expiringSubscriptions = await prisma.userSubscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: now,
          lte: in30Days
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        plan: {
          select: {
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        endDate: 'asc'
      }
    })

    // Categorizar por urgencia
    const urgent = [] // < 7 días
    const warning = [] // 7-15 días
    const upcoming = [] // 15-30 días

    for (const subscription of expiringSubscriptions) {
      const daysRemaining = Math.floor(
        (subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      const item = {
        id: subscription.id,
        userId: subscription.userId,
        userName: subscription.user.name,
        userEmail: subscription.user.email,
        userPhone: subscription.user.phone,
        planName: subscription.plan?.name || 'Custom',
        planCode: subscription.plan?.code,
        endDate: subscription.endDate,
        daysRemaining,
        price: subscription.customPrice || 0,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        canceledAt: subscription.canceledAt,
        cancelReason: subscription.cancelReason
      }

      if (subscription.endDate <= in7Days) {
        urgent.push(item)
      } else if (subscription.endDate <= in15Days) {
        warning.push(item)
      } else {
        upcoming.push(item)
      }
    }

    return NextResponse.json({
      urgent, // Expiran en < 7 días
      warning, // Expiran en 7-15 días
      upcoming, // Expiran en 15-30 días
      total: expiringSubscriptions.length
    })

  } catch (error) {
    console.error('Error fetching expiring subscriptions:', error)
    return NextResponse.json(
      { error: 'Error al obtener suscripciones por vencer' },
      { status: 500 }
    )
  }
}
