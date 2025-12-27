import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyAdminToken } from '../../../../src/lib/admin-auth'

/**
 * GET /api/admin/canceled-subscriptions
 * Obtiene todas las suscripciones que han sido canceladas
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

    // Obtener suscripciones canceladas (las que tienen cancelAtPeriodEnd = true)
    const canceledSubscriptions = await prisma.userSubscription.findMany({
      where: {
        cancelAtPeriodEnd: true,
        status: 'ACTIVE' // Todavía activas pero programadas para cancelarse
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            companyName: true
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
        canceledAt: 'desc' // Más recientes primero
      }
    })

    const now = new Date()

    const formattedSubscriptions = canceledSubscriptions.map(sub => {
      const daysRemaining = sub.endDate
        ? Math.floor((sub.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0

      return {
        id: sub.id,
        userId: sub.userId,
        userName: sub.user.name,
        userEmail: sub.user.email,
        userPhone: sub.user.phone,
        userCompany: sub.user.companyName,
        planName: sub.plan?.name || 'Custom',
        planCode: sub.plan?.code,
        startDate: sub.startDate,
        endDate: sub.endDate,
        daysRemaining,
        canceledAt: sub.canceledAt,
        cancelReason: sub.cancelReason,
        price: sub.customPrice
      }
    })

    return NextResponse.json({
      canceledSubscriptions: formattedSubscriptions,
      total: formattedSubscriptions.length
    })

  } catch (error) {
    console.error('Error fetching canceled subscriptions:', error)
    return NextResponse.json(
      { error: 'Error al obtener suscripciones canceladas' },
      { status: 500 }
    )
  }
}
