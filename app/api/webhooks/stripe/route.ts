import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

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
      console.error('STRIPE_SECRET_KEY not configured')
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

    // Verify webhook signature if secret is configured
    if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        )
      } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    } else {
      // For local development without webhook secret
      event = JSON.parse(body) as Stripe.Event
      console.warn('⚠️ Webhook signature not verified (development mode)')
    }

    console.log(`📨 Stripe webhook received: ${event.type}`)

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
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
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
  const couponDiscountAmount = session.metadata?.couponDiscountAmount

  // Handle module subscription (GESTION, etc.)
  if (isModuleSubscription && moduleCode && userId) {
    // Normalize FACTURAMIO to GESTION for backwards compatibility
    const normalizedModuleCode = moduleCode === 'FACTURAMIO' ? 'GESTION' : moduleCode

    console.log('📦 Module subscription checkout:', {
      userId,
      moduleCode: normalizedModuleCode,
      billingPeriod,
      couponCode: couponCode || 'none'
    })

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
        expiresAt: new Date(subscription.current_period_end * 1000)
      },
      update: {
        status: 'ACTIVE',
        isActive: true,
        activatedAt: new Date(),
        stripeSubscriptionId: subscription.id,
        expiresAt: new Date(subscription.current_period_end * 1000),
        trialEndsAt: null, // Clear trial if paying
        canceledAt: null
      }
    })

    console.log(`✅ Module ${normalizedModuleCode} activated for user ${userId}`)

    // Record coupon if used
    if (couponCode && couponCode.trim() !== '') {
      await recordCouponUsage(couponCode, userId, session.id, couponDiscountAmount, session.amount_total)
    }

    return
  }

  // Handle plan subscription (BASIC, HOST, etc.) - legacy flow
  if (!userId || !planCode) {
    console.error('Missing metadata in checkout session')
    return
  }

  console.log('📦 Plan subscription checkout:', {
    userId,
    planCode,
    billingPeriod,
    couponCode: couponCode || 'none',
    couponDiscountAmount: couponDiscountAmount || '0'
  })

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
      startDate: new Date(subscription.current_period_start * 1000),
      endDate: new Date(subscription.current_period_end * 1000),
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

  console.log(`✅ Subscription created: ${userSubscription.id} for user ${userId}`)

  // Record coupon usage if a coupon was applied
  if (couponCode && couponCode.trim() !== '') {
    await recordCouponUsage(couponCode, userId, session.id, couponDiscountAmount, session.amount_total)
  }
}

/**
 * Helper to record coupon usage
 */
async function recordCouponUsage(
  couponCode: string,
  userId: string,
  sessionId: string,
  discountAmount?: string | null,
  amountTotal?: number | null
) {
  try {
    console.log(`🎟️ Recording coupon usage: ${couponCode}`)

    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() }
    })

    if (coupon) {
      await prisma.couponUse.create({
        data: {
          couponId: coupon.id,
          userId,
          orderId: sessionId,
          discountApplied: discountAmount ? parseFloat(discountAmount) : 0,
          originalAmount: amountTotal ? amountTotal / 100 : 0,
          finalAmount: amountTotal ? amountTotal / 100 : 0
        }
      })

      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } }
      })

      console.log(`✅ Coupon usage recorded: ${couponCode} for user ${userId}`)
    } else {
      console.log(`⚠️ Coupon not found in database: ${couponCode}`)
    }
  } catch (couponError) {
    console.error('Error recording coupon usage:', couponError)
  }
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  console.log(`✅ Invoice paid: ${invoice.id} for customer ${customerId}`)

  // You could create an Invoice record here if needed
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  console.log(`❌ Invoice payment failed: ${invoice.id} for customer ${customerId}`)

  // You could send a notification email here
}

/**
 * Handle subscription updates (plan changes, cancellation requests, etc.)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`🔄 Subscription updated: ${subscription.id}, status: ${subscription.status}`)

  try {
    // Find subscription in our DB by Stripe ID
    const userSubscription = await prisma.userSubscription.findFirst({
      where: { stripeSubscriptionId: subscription.id }
    })

    if (!userSubscription) {
      console.log(`⚠️ No local subscription found for Stripe ID: ${subscription.id}`)
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
        endDate: new Date(subscription.current_period_end * 1000),
        notes: `${userSubscription.notes || ''}\n[Webhook] Updated from Stripe: ${subscription.status} at ${new Date().toISOString()}`
      }
    })

    console.log(`✅ Subscription ${userSubscription.id} updated to status: ${newStatus}`)
  } catch (error) {
    console.error('Error updating subscription from webhook:', error)
  }
}

/**
 * Handle subscription cancellation/deletion
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`🗑️ Subscription deleted: ${subscription.id}`)

  try {
    // Find subscription in our DB by Stripe ID
    const userSubscription = await prisma.userSubscription.findFirst({
      where: { stripeSubscriptionId: subscription.id }
    })

    if (!userSubscription) {
      console.log(`⚠️ No local subscription found for Stripe ID: ${subscription.id}`)
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

    console.log(`✅ Subscription ${userSubscription.id} marked as CANCELED`)
  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}
