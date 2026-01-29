import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPlan, calculatePrice, type PlanCode, type BillingPeriod } from '@/config/plans'

/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout session for subscription payment.
 * Uses dynamic pricing based on plan and billing period.
 */
export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not configured')
      return NextResponse.json(
        { error: 'Stripe no está configurado', requiresSetup: true },
        { status: 503 }
      )
    }

    // Initialize Stripe with minimal config
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      telemetry: false,
      httpClient: Stripe.createFetchHttpClient()
    })

    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const {
      planCode,
      billingPeriod = 'MONTHLY',
      successUrl,
      cancelUrl,
      // Proration data
      hasProration,
      proratedAmount,
      originalPrice,
      // Coupon data
      couponCode,
      couponDiscountAmount
    } = body

    // Validate plan
    if (!planCode || !['BASIC', 'HOST', 'SUPERHOST', 'BUSINESS'].includes(planCode)) {
      return NextResponse.json(
        { error: 'Plan inválido' },
        { status: 400 }
      )
    }

    // Get plan details and calculate price
    const plan = getPlan(planCode as PlanCode)
    const period = billingPeriod as BillingPeriod
    const fullPrice = calculatePrice(plan, period)

    // Use prorated amount if available, otherwise use full price
    let priceToCharge = hasProration && proratedAmount ? proratedAmount : fullPrice

    // Apply coupon discount if available
    if (couponDiscountAmount && couponDiscountAmount > 0) {
      priceToCharge = Math.max(0, priceToCharge - couponDiscountAmount)
    }

    console.log('💰 Stripe Checkout - Price Calculation:', {
      planCode,
      planName: plan.name,
      billingPeriod: period,
      priceMonthly: plan.priceMonthly,
      priceSemestral: plan.priceSemestral,
      priceYearly: plan.priceYearly,
      fullPrice,
      hasProration,
      proratedAmount,
      couponCode: couponCode || null,
      couponDiscountAmount: couponDiscountAmount || 0,
      priceToCharge,
      priceInCents: Math.round(priceToCharge * 100)
    })

    // Calculate interval for Stripe
    let intervalCount = 1
    let interval: 'month' | 'year' = 'month'

    if (period === 'SEMESTRAL') {
      intervalCount = 6
      interval = 'month'
    } else if (period === 'YEARLY') {
      intervalCount = 1
      interval = 'year'
    }

    // Create Stripe Checkout session with dynamic pricing
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Plan ${plan.name}`,
              description: hasProration
                ? `${plan.description} - ${period === 'MONTHLY' ? 'Mensual' : period === 'SEMESTRAL' ? 'Semestral (-10%)' : 'Anual (-20%)'} (Prorrateo aplicado)`
                : `${plan.description} - ${period === 'MONTHLY' ? 'Mensual' : period === 'SEMESTRAL' ? 'Semestral (-10%)' : 'Anual (-20%)'}`,
              metadata: {
                planCode: plan.code,
                maxProperties: plan.maxProperties.toString()
              }
            },
            unit_amount: Math.round(priceToCharge * 100), // Stripe uses cents
            recurring: {
              interval,
              interval_count: intervalCount
            }
          },
          quantity: 1
        }
      ],
      metadata: {
        userId: user.id,
        planCode: plan.code,
        billingPeriod: period,
        fullPriceEur: fullPrice.toString(),
        chargedPriceEur: priceToCharge.toString(),
        hasProration: hasProration ? 'true' : 'false',
        // Coupon tracking
        couponCode: couponCode || '',
        couponDiscountAmount: couponDiscountAmount ? couponDiscountAmount.toString() : '0'
      },
      success_url: successUrl || `${request.headers.get('origin')}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${request.headers.get('origin')}/account/plans?cancelled=true`,
      locale: 'es',
      allow_promotion_codes: true
    })

    console.log(`✅ Stripe checkout session created: ${session.id} for user ${user.id}`)

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)

    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe Error Details:', {
        type: error.type,
        code: error.code,
        message: error.message,
        param: error.param,
        statusCode: error.statusCode
      })
      return NextResponse.json(
        {
          error: `Error de Stripe: ${error.message}`,
          code: error.code,
          type: error.type
        },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Non-Stripe error:', errorMessage)

    return NextResponse.json(
      { error: `Error al crear sesión de pago: ${errorMessage}` },
      { status: 500 }
    )
  }
}
