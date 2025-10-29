import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'

/**
 * POST /api/subscription/reactivate
 * Reactiva una suscripción que fue cancelada pero aún está activa
 *
 * Casos de uso:
 * 1. Manual: Usuario ya pagó hasta endDate, simplemente quitamos la marca de cancelación
 * 2. Stripe: Llamamos a Stripe API para remover cancel_at_period_end
 */
export async function POST(request: NextRequest) {
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

    // Buscar suscripción cancelada pero aún activa
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: decoded.userId,
        status: 'ACTIVE',
        cancelAtPeriodEnd: true, // Fue cancelada pero sigue activa
        endDate: { gte: new Date() } // Aún no ha expirado
      },
      include: {
        plan: true
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'No tienes suscripción cancelada para reactivar' },
        { status: 404 }
      )
    }

    // TODO: Integración con Stripe (cuando esté implementado)
    // if (subscription.stripeSubscriptionId) {
    //   const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    //   await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    //     cancel_at_period_end: false,
    //     metadata: {
    //       reactivated_at: new Date().toISOString(),
    //       reactivated_by: decoded.userId
    //     }
    //   })
    // }

    // Reactivar en nuestra base de datos
    const reactivatedSubscription = await prisma.userSubscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: false,
        // Guardamos el historial de reactivación en notes
        notes: `REACTIVADA por usuario el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}\n\nMotivo previo de cancelación: ${subscription.cancelReason || 'No especificado'}\n\n${subscription.notes || ''}`
      }
    })

    console.log(`✅ Suscripción reactivada: ${subscription.id} por usuario ${decoded.userId}`)

    return NextResponse.json({
      success: true,
      message: `¡Suscripción reactivada! Seguirás disfrutando de tu plan ${subscription.plan?.name || 'Custom'} sin interrupciones.`,
      subscription: {
        id: reactivatedSubscription.id,
        status: reactivatedSubscription.status,
        endDate: reactivatedSubscription.endDate,
        cancelAtPeriodEnd: reactivatedSubscription.cancelAtPeriodEnd,
        willRenew: true
      }
    })

  } catch (error) {
    console.error('Error reactivando suscripción:', error)
    return NextResponse.json(
      { error: 'Error al reactivar suscripción' },
      { status: 500 }
    )
  }
}
