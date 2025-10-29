import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'

/**
 * GET /api/user/active-subscription
 * Obtiene la suscripción activa del usuario autenticado
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Buscar suscripción activa
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: decoded.userId,
        status: 'ACTIVE',
        endDate: { gte: new Date() }
      },
      include: {
        plan: {
          select: {
            id: true,
            code: true,
            name: true,
            priceMonthly: true,
            priceSemestral: true,
            priceYearly: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!subscription) {
      return NextResponse.json({
        hasActiveSubscription: false,
        subscription: null
      })
    }

    // Calcular billing period basado en la duración
    let billingPeriod = 'MONTHLY'
    let daysRemaining = 0

    if (subscription.endDate) {
      const totalDays = Math.floor(
        (subscription.endDate.getTime() - subscription.startDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (totalDays > 150 && totalDays < 250) {
        billingPeriod = 'BIANNUAL'
      } else if (totalDays > 300) {
        billingPeriod = 'ANNUAL'
      }

      daysRemaining = Math.max(0, Math.floor(
        (subscription.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      ))
    }

    // Calcular precio correcto según el período de facturación
    let price = subscription.customPrice || subscription.plan?.priceMonthly
    if (!subscription.customPrice && subscription.plan) {
      if (billingPeriod === 'BIANNUAL') {
        price = subscription.plan.priceSemestral || subscription.plan.priceMonthly
      } else if (billingPeriod === 'ANNUAL') {
        price = subscription.plan.priceYearly || subscription.plan.priceMonthly
      }
    }

    return NextResponse.json({
      hasActiveSubscription: true,
      subscription: {
        id: subscription.id,
        planCode: subscription.plan?.code,
        planName: subscription.plan?.name,
        price,
        billingPeriod,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        daysRemaining,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd, // Si está programada para cancelarse
        canceledAt: subscription.canceledAt, // Cuándo se solicitó la cancelación
        cancelReason: subscription.cancelReason // Motivo de la cancelación
      }
    })

  } catch (error) {
    console.error('Error fetching active subscription:', error)
    return NextResponse.json(
      { error: 'Error al obtener suscripción activa' },
      { status: 500 }
    )
  }
}
