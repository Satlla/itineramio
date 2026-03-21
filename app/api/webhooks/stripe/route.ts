import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { sendPaymentFailedEmail } from '@/lib/resend'

/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events:
 * - checkout.session.completed: Create subscription
 * - invoice.paid: Mark invoice as paid
 * - invoice.payment_failed: Handle failed payment
 * - customer.subscription.updated: Sync subscription changes
 * - customer.subscription.deleted: Cancel subscription
 */

// Disable body parsing for webhook signature verification
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      telemetry: false,
      httpClient: Stripe.createFetchHttpClient()
    })

    // Get raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    let event: Stripe.Event

    // In production, webhook secret is REQUIRED
    const isProduction = process.env.NODE_ENV === 'production'
    if (isProduction && !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Verify webhook signature if secret is configured
    if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        )
      } catch (err) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    } else if (isProduction) {
      // Should not reach here due to earlier check, but extra safety
      return NextResponse.json({ error: 'Webhook verification required' }, { status: 400 })
    } else {
      // For local development without webhook secret
      event = JSON.parse(body) as Stripe.Event
    }


    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription' && session.subscription) {
          await handleCheckoutCompleted(stripe, session)
        }
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaid(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      default:
        break
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle successful checkout - create subscription in DB
 */
async function handleCheckoutCompleted(stripe: Stripe, session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const planCode = session.metadata?.planCode
  const moduleCode = session.metadata?.moduleCode
  const isModuleSubscription = session.metadata?.isModuleSubscription === 'true'
  const billingPeriod = session.metadata?.billingPeriod
  const couponCode = session.metadata?.couponCode

  // Handle module subscription (GESTION, etc.)
  if (isModuleSubscription && moduleCode && userId) {
    // Normalize FACTURAMIO to GESTION for backwards compatibility
    const normalizedModuleCode = moduleCode === 'FACTURAMIO' ? 'GESTION' : moduleCode


    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

    // Create or update UserModule
    await prisma.userModule.upsert({
      where: {
        userId_moduleType: {
          userId,
          moduleType: normalizedModuleCode as 'MANUALES' | 'GESTION'
        }
      },
      create: {
        userId,
        moduleType: normalizedModuleCode as 'MANUALES' | 'GESTION',
        status: 'ACTIVE',
        isActive: true,
        activatedAt: new Date(),
        stripeSubscriptionId: subscription.id,
        expiresAt: new Date((subscription as any).current_period_end * 1000)
      },
      update: {
        status: 'ACTIVE',
        isActive: true,
        activatedAt: new Date(),
        stripeSubscriptionId: subscription.id,
        expiresAt: new Date((subscription as any).current_period_end * 1000),
        trialEndsAt: null, // Clear trial if paying
        canceledAt: null
      }
    })


    // Record coupon if used — use fullPriceEur from metadata + Stripe's amount_total
    if (couponCode && couponCode.trim() !== '') {
      const fullPriceEur = session.metadata?.fullPriceEur || null
      await recordCouponUsage(couponCode, userId, session.id, fullPriceEur, session.amount_total)
    }

    return
  }

  // Handle plan subscription (BASIC, HOST, etc.) - legacy flow
  if (!userId || !planCode) {
    return
  }


  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

  // Find or create plan in DB
  let plan = await prisma.subscriptionPlan.findUnique({
    where: { code: planCode }
  })

  if (!plan) {
    // Create plan if it doesn't exist
    const planConfig = {
      BASIC: { name: 'Basic', priceMonthly: 9, maxProperties: 2 },
      HOST: { name: 'Host', priceMonthly: 29, maxProperties: 10 },
      SUPERHOST: { name: 'Superhost', priceMonthly: 69, maxProperties: 25 },
      BUSINESS: { name: 'Business', priceMonthly: 99, maxProperties: 50 }
    }[planCode] || { name: planCode, priceMonthly: 0, maxProperties: 1 }

    plan = await prisma.subscriptionPlan.create({
      data: {
        code: planCode,
        name: planConfig.name,
        priceMonthly: planConfig.priceMonthly,
        maxProperties: planConfig.maxProperties,
        isActive: true
      }
    })
  }

  // Create subscription in DB with Stripe subscription ID
  const userSubscription = await prisma.userSubscription.create({
    data: {
      userId,
      planId: plan.id,
      status: 'ACTIVE',
      startDate: new Date((subscription as any).current_period_start * 1000),
      endDate: new Date((subscription as any).current_period_end * 1000),
      stripeSubscriptionId: subscription.id,
      notes: `Billing period: ${billingPeriod}\nCheckout session: ${session.id}`
    }
  })

  // Update user status
  await prisma.user.update({
    where: { id: userId },
    data: {
      status: 'ACTIVE',
      subscription: planCode
    }
  })


  // Record coupon usage if a coupon was applied — use fullPriceEur + Stripe's amount_total
  if (couponCode && couponCode.trim() !== '') {
    const fullPriceEur = session.metadata?.fullPriceEur || null
    await recordCouponUsage(couponCode, userId, session.id, fullPriceEur, session.amount_total)
  }
}

/**
 * Helper to record coupon usage
 * Uses Stripe's amount_total as source of truth for the actual amount charged
 */
async function recordCouponUsage(
  couponCode: string,
  userId: string,
  sessionId: string,
  fullPriceEur?: string | null,
  amountTotal?: number | null
) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() }
    })

    if (!coupon) {
      return
    }

    // Revalidate coupon limits before recording
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return
    }

    // Calculate discount from Stripe's actual charge vs full price
    const fullPrice = fullPriceEur ? parseFloat(fullPriceEur) : 0
    const actualCharged = amountTotal ? amountTotal / 100 : 0
    const actualDiscount = fullPrice > 0 ? Math.max(0, fullPrice - actualCharged) : 0

    await prisma.couponUse.create({
      data: {
        couponId: coupon.id,
        userId,
        orderId: sessionId,
        discountApplied: actualDiscount,
        originalAmount: fullPrice,
        finalAmount: actualCharged
      }
    })

    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } }
    })

  } catch (couponError) {
    // ignore
  }
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string


  // You could create an Invoice record here if needed
}

/**
 * Handle failed invoice payment — send email + in-app notification
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const subscriptionId = (invoice as any).subscription as string | null


  try {
    // Find user by subscription ID
    let userId: string | null = null
    let userEmail: string | null = null
    let userName: string | null = null

    if (subscriptionId) {
      // Try UserSubscription first
      const userSub = await prisma.userSubscription.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
        include: { user: { select: { id: true, email: true, name: true } } }
      })

      if (userSub) {
        userId = userSub.user.id
        userEmail = userSub.user.email
        userName = userSub.user.name
      } else {
        // Fallback: try UserModule
        const userModule = await prisma.userModule.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
          include: { user: { select: { id: true, email: true, name: true } } }
        })

        if (userModule) {
          userId = userModule.user.id
          userEmail = userModule.user.email
          userName = userModule.user.name
        }
      }
    }

    if (!userId || !userEmail) {
      return
    }

    // Format amount
    const amount = invoice.amount_due ? `€${(invoice.amount_due / 100).toFixed(2)}` : undefined

    // Send email
    await sendPaymentFailedEmail({
      email: userEmail,
      name: userName || 'Usuario',
      amount,
    })

    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'PAYMENT_FAILED',
        title: '⚠️ Pago no procesado',
        message: `No hemos podido procesar tu pago${amount ? ` de ${amount}` : ''}. Actualiza tu método de pago para evitar la suspensión de tu servicio.`,
        data: {
          invoiceId: invoice.id,
          amount: invoice.amount_due,
        }
      }
    })
  } catch (error) {
    // Don't let errors here break the webhook response
  }
}

/**
 * Handle subscription updates (plan changes, cancellation requests, etc.)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {

  try {
    // Find subscription in our DB by Stripe ID
    const userSubscription = await prisma.userSubscription.findFirst({
      where: { stripeSubscriptionId: subscription.id }
    })

    if (!userSubscription) {
      return
    }

    // Map Stripe status to our status
    let newStatus = userSubscription.status
    if (subscription.status === 'active') {
      newStatus = 'ACTIVE'
    } else if (subscription.status === 'past_due') {
      newStatus = 'PAST_DUE'
    } else if (subscription.status === 'canceled') {
      newStatus = 'CANCELED'
    } else if (subscription.status === 'unpaid') {
      newStatus = 'UNPAID'
    }

    // Update subscription in our DB
    await prisma.userSubscription.update({
      where: { id: userSubscription.id },
      data: {
        status: newStatus,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        endDate: new Date((subscription as any).current_period_end * 1000),
        notes: `${userSubscription.notes || ''}\n[Webhook] Updated from Stripe: ${subscription.status} at ${new Date().toISOString()}`
      }
    })


    // Also update UserModule if this is a module subscription
    const userModule = await prisma.userModule.findFirst({
      where: { stripeSubscriptionId: subscription.id }
    })

    if (userModule) {
      const moduleUpdate: any = {
        expiresAt: new Date((subscription as any).current_period_end * 1000)
      }

      if (subscription.status === 'active') {
        moduleUpdate.status = 'ACTIVE'
        moduleUpdate.isActive = true
      } else if (subscription.status === 'past_due') {
        moduleUpdate.status = 'PAST_DUE'
        // isActive stays true during grace period — module-limits handles the cutoff
      } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
        moduleUpdate.status = 'CANCELED'
        moduleUpdate.isActive = false
        moduleUpdate.canceledAt = new Date()
      }

      await prisma.userModule.update({
        where: { id: userModule.id },
        data: moduleUpdate
      })
    }
  } catch (error) {
    // ignore
  }
}

/**
 * Handle subscription cancellation/deletion
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {

  try {
    // Find subscription in our DB by Stripe ID
    const userSubscription = await prisma.userSubscription.findFirst({
      where: { stripeSubscriptionId: subscription.id }
    })

    if (!userSubscription) {
      return
    }

    // Mark as canceled in our DB
    await prisma.userSubscription.update({
      where: { id: userSubscription.id },
      data: {
        status: 'CANCELED',
        cancelAtPeriodEnd: false,
        canceledAt: new Date(),
        notes: `${userSubscription.notes || ''}\n[Webhook] Canceled from Stripe at ${new Date().toISOString()}`
      }
    })

    // Update user subscription status
    await prisma.user.update({
      where: { id: userSubscription.userId },
      data: { subscription: 'CANCELED' }
    })


    // Also cancel UserModule if this is a module subscription
    const userModule = await prisma.userModule.findFirst({
      where: { stripeSubscriptionId: subscription.id }
    })

    if (userModule) {
      await prisma.userModule.update({
        where: { id: userModule.id },
        data: {
          status: 'CANCELED',
          isActive: false,
          canceledAt: new Date()
        }
      })
    }
  } catch (error) {
    // ignore
  }
}
