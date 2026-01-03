import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'

/**
 * POST /api/subscription/cancel
 * Cancela la suscripción activa del usuario
 * Funciona tanto para suscripciones de Stripe como manuales
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

    const body = await request.json()
    const { reason, immediate = false } = body

    // Buscar suscripción activa
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: decoded.userId,
        status: 'ACTIVE',
        endDate: { gte: new Date() }
      },
      include: {
        plan: true
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'No tienes suscripción activa para cancelar' },
        { status: 404 }
      )
    }

    // Si tiene suscripción de Stripe, cancelarla también en Stripe
    if (subscription.stripeSubscriptionId && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2024-12-18.acacia'
        })

        if (immediate) {
          // Cancelación inmediata
          await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
          console.log(`✅ Stripe subscription ${subscription.stripeSubscriptionId} canceled immediately`)
        } else {
          // Cancelar al final del período
          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true,
            metadata: {
              canceled_at: new Date().toISOString(),
              canceled_by: decoded.userId,
              cancel_reason: reason || 'User requested'
            }
          })
          console.log(`✅ Stripe subscription ${subscription.stripeSubscriptionId} set to cancel at period end`)
        }
      } catch (stripeError) {
        console.error('Error canceling Stripe subscription:', stripeError)
        // Continuamos con la cancelación local aunque falle Stripe
        // El usuario puede contactar soporte si hay problemas
      }
    }

    // Actualizar estado en nuestra base de datos
    const updateData: any = {
      status: immediate ? 'CANCELED' : 'ACTIVE', // Si es inmediato, cancela ya
      cancelAtPeriodEnd: !immediate, // Marcar que se cancelará al final del período (si no es inmediato)
      canceledAt: new Date(), // Fecha en que se solicitó la cancelación
      cancelReason: reason || 'User requested', // Motivo de la cancelación
      notes: `CANCELACIÓN solicitada por usuario el ${new Date().toLocaleDateString('es-ES')}. ${immediate ? 'Inmediata' : 'Al final del período'}${reason ? `. Motivo: ${reason}` : ''}\n\n${subscription.notes || ''}`
    }

    // Si es cancelación inmediata, establecer la fecha de fin a ahora
    if (immediate) {
      updateData.endDate = new Date()
      updateData.cancelAtPeriodEnd = false // No esperará al final del período
    }

    const updatedSubscription = await prisma.userSubscription.update({
      where: { id: subscription.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: immediate
        ? 'Suscripción cancelada inmediatamente'
        : `Suscripción cancelada. Seguirá activa hasta ${subscription.endDate ? subscription.endDate.toLocaleDateString('es-ES') : 'fecha no definida'}`,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        endDate: updatedSubscription.endDate,
        willCancelAt: immediate ? null : subscription.endDate
      }
    })

  } catch (error) {
    console.error('Error cancelando suscripción:', error)
    return NextResponse.json(
      { error: 'Error al cancelar suscripción' },
      { status: 500 }
    )
  }
}
