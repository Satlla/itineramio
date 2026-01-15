import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

/**
 * POST /api/user/cancel-subscription
 * Cancel subscription at period end
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const body = await request.json()
    const { subscriptionId, reason } = body

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'subscriptionId es requerido' },
        { status: 400 }
      )
    }

    // Verify subscription belongs to user
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        id: subscriptionId,
        userId: decoded.userId
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      )
    }

    // Mark subscription to cancel at period end
    await prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
        cancelReason: reason || 'No especificado'
      }
    })

    console.log(`✅ Subscription ${subscriptionId} scheduled for cancellation. Reason: ${reason || 'No especificado'}`)

    return NextResponse.json({
      success: true,
      message: 'Tu suscripción se cancelará al final del período actual'
    })

  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json(
      { error: 'Error al cancelar la suscripción' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/user/cancel-subscription
 * Reactivate a subscription that was scheduled for cancellation
 */
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const subscriptionId = searchParams.get('subscriptionId')

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'subscriptionId es requerido' },
        { status: 400 }
      )
    }

    // Verify subscription belongs to user
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        id: subscriptionId,
        userId: decoded.userId
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      )
    }

    // Reactivate subscription
    await prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd: false,
        canceledAt: null,
        cancelReason: null
      }
    })

    console.log(`✅ Subscription ${subscriptionId} reactivated`)

    return NextResponse.json({
      success: true,
      message: 'Tu suscripción ha sido reactivada'
    })

  } catch (error) {
    console.error('Error reactivating subscription:', error)
    return NextResponse.json(
      { error: 'Error al reactivar la suscripción' },
      { status: 500 }
    )
  }
}
