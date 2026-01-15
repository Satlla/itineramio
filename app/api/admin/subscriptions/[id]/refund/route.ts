import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin-auth'

/**
 * POST /api/admin/subscriptions/[id]/refund
 * Procesa un reembolso a través de Stripe
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
    const { amount, reason = 'requested_by_customer' } = body

    // Get subscription
    const subscription = await prisma.userSubscription.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        plan: { select: { name: true, priceMonthly: true } }
      }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Suscripción no encontrada' }, { status: 404 })
    }

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Esta suscripción no tiene ID de Stripe asociado' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe no configurado' }, { status: 503 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      telemetry: false,
      httpClient: Stripe.createFetchHttpClient()
    })

    // Get the latest invoice for this subscription to refund
    const invoices = await stripe.invoices.list({
      subscription: subscription.stripeSubscriptionId,
      limit: 1
    })

    if (invoices.data.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron facturas para esta suscripción en Stripe' },
        { status: 404 }
      )
    }

    const latestInvoice = invoices.data[0]

    if (!latestInvoice.payment_intent) {
      return NextResponse.json(
        { error: 'No se encontró el pago asociado a esta factura' },
        { status: 400 }
      )
    }

    // Calculate refund amount
    const refundAmount = amount
      ? Math.round(amount * 100) // Convert to cents
      : latestInvoice.amount_paid // Full refund

    // Process refund
    const refund = await stripe.refunds.create({
      payment_intent: latestInvoice.payment_intent as string,
      amount: refundAmount,
      reason: reason as Stripe.RefundCreateParams.Reason
    })

    // Update subscription in database
    await prisma.userSubscription.update({
      where: { id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
        cancelReason: `REEMBOLSO: €${(refundAmount / 100).toFixed(2)} - ${reason}`,
        notes: `${subscription.notes || ''}\n\n[ADMIN] Reembolso procesado: €${(refundAmount / 100).toFixed(2)} el ${new Date().toLocaleDateString('es-ES')} - Refund ID: ${refund.id}`
      }
    })

    // Update user status
    await prisma.user.update({
      where: { id: subscription.userId },
      data: { subscription: 'CANCELED' }
    })

    console.log(`✅ Refund processed: ${refund.id} for subscription ${id}`)

    return NextResponse.json({
      success: true,
      message: `Reembolso de €${(refundAmount / 100).toFixed(2)} procesado correctamente`,
      refund: {
        id: refund.id,
        amount: refundAmount / 100,
        status: refund.status
      }
    })

  } catch (error) {
    console.error('Error processing refund:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Error de Stripe: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error al procesar reembolso' },
      { status: 500 }
    )
  }
}
