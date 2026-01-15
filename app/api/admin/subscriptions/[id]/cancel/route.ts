import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin-auth'

/**
 * POST /api/admin/subscriptions/[id]/cancel
 * Cancela una suscripción inmediatamente
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { reason = 'Admin cancelation', immediate = true } = body

    // Get subscription
    const subscription = await prisma.userSubscription.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        plan: { select: { name: true } }
      }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Suscripción no encontrada' }, { status: 404 })
    }

    // Cancel in Stripe if applicable
    if (subscription.stripeSubscriptionId && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          telemetry: false,
          httpClient: Stripe.createFetchHttpClient()
        })

        if (immediate) {
          await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
          console.log(`✅ Stripe subscription ${subscription.stripeSubscriptionId} canceled immediately`)
        } else {
          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true,
            metadata: {
              canceled_by_admin: 'true',
              cancel_reason: reason
            }
          })
          console.log(`✅ Stripe subscription ${subscription.stripeSubscriptionId} set to cancel at period end`)
        }
      } catch (stripeError) {
        console.error('Error canceling Stripe subscription:', stripeError)
        // Continue with local cancellation even if Stripe fails
      }
    }

    // Update in database
    const updateData: any = {
      status: immediate ? 'CANCELED' : 'ACTIVE',
      cancelAtPeriodEnd: !immediate,
      canceledAt: new Date(),
      cancelReason: `[ADMIN] ${reason}`,
      notes: `${subscription.notes || ''}\n\n[ADMIN] Cancelación ${immediate ? 'inmediata' : 'al final del período'} el ${new Date().toLocaleDateString('es-ES')} por: ${reason}`
    }

    if (immediate) {
      updateData.endDate = new Date()
    }

    const updatedSubscription = await prisma.userSubscription.update({
      where: { id },
      data: updateData
    })

    // Update user status if immediate cancellation
    if (immediate) {
      await prisma.user.update({
        where: { id: subscription.userId },
        data: { subscription: 'CANCELED' }
      })
    }

    return NextResponse.json({
      success: true,
      message: immediate
        ? 'Suscripción cancelada inmediatamente'
        : `Suscripción se cancelará el ${subscription.endDate?.toLocaleDateString('es-ES')}`,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
        endDate: updatedSubscription.endDate
      }
    })

  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: 'Error al cancelar suscripción' },
      { status: 500 }
    )
  }
}
