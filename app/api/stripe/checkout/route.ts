import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPlan, calculatePrice, type PlanCode, type BillingPeriod } from '@/config/plans'
import { paymentRateLimiter, getRateLimitKey } from '@/lib/rate-limit'
import { calculateProration } from '@/lib/proration-service'

/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout session for subscription payment.
 * ALL prices are calculated server-side. Client values for amounts are ignored.
 *
 * Rate limited: 10 requests per minute per user
 */
export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
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

    // Rate limiting: 10 requests per minute per user
    const rateLimitKey = getRateLimitKey(request, decoded.userId, 'checkout')
    const rateLimitResult = paymentRateLimiter(rateLimitKey)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Demasiadas solicitudes. Por favor, espera un momento antes de intentarlo de nuevo.',
          retryAfter: Math.ceil(rateLimitResult.resetIn / 1000)
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(rateLimitResult.resetIn / 1000).toString(),
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
          }
        }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Parse request body — only accept plan, period, coupon code and URLs
    const body = await request.json()
    const {
      planCode,
      billingPeriod = 'MONTHLY',
      successUrl,
      cancelUrl,
      couponCode
    } = body

    // Validate plan
    if (!planCode || !['BASIC', 'HOST', 'SUPERHOST', 'BUSINESS'].includes(planCode)) {
      return NextResponse.json(
        { error: 'Plan inválido' },
        { status: 400 }
      )
    }

    // Get plan details and calculate full price SERVER-SIDE
    const plan = getPlan(planCode as PlanCode)
    const period = billingPeriod as BillingPeriod
    const fullPrice = calculatePrice(plan, period)

    // ─── Server-side proration calculation ───
    let priceToCharge = fullPrice
    let hasProration = false
    let creditAmount = 0

    const activeSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
        endDate: { gte: new Date() }
      },
      include: {
        plan: { select: { code: true, name: true, priceMonthly: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (activeSubscription?.plan && activeSubscription.endDate) {
      // Determine current billing period from subscription duration
      const existingDuration = activeSubscription.endDate.getTime() - activeSubscription.startDate.getTime()
      const daysInExisting = existingDuration / (1000 * 60 * 60 * 24)

      let currentBillingPeriod: 'monthly' | 'biannual' | 'annual' = 'monthly'
      if (daysInExisting > 150 && daysInExisting < 250) {
        currentBillingPeriod = 'biannual'
      } else if (daysInExisting > 300) {
        currentBillingPeriod = 'annual'
      }

      // Get actual amount paid from invoice
      const currentMonthlyPrice = Number(activeSubscription.plan.priceMonthly)
      let currentMonthsMultiplier = 1
      let currentDiscountPercent = 0
      if (currentBillingPeriod === 'biannual') { currentMonthsMultiplier = 6; currentDiscountPercent = 10 }
      if (currentBillingPeriod === 'annual') { currentMonthsMultiplier = 12; currentDiscountPercent = 20 }

      const paidInvoice = await prisma.invoice.findFirst({
        where: { subscriptionId: activeSubscription.id, status: 'PAID' },
        orderBy: { createdAt: 'desc' }
      })

      const theoreticalPrice = currentMonthlyPrice * currentMonthsMultiplier * (1 - currentDiscountPercent / 100)
      const currentTotalPricePaid = paidInvoice ? Number(paidInvoice.finalAmount) : theoreticalPrice

      // Map billing period for proration service
      const newBillingPeriod = period === 'SEMESTRAL' ? 'biannual' : period === 'YEARLY' ? 'annual' : 'monthly'

      const proration = calculateProration({
        currentSubscription: {
          planName: activeSubscription.plan.name,
          amountPaid: currentTotalPricePaid,
          startDate: activeSubscription.startDate,
          endDate: activeSubscription.endDate
        },
        newPlan: {
          name: plan.name,
          priceMonthly: plan.priceMonthly,
          billingPeriod: newBillingPeriod
        },
        today: new Date()
      })

      if (proration.creditAmount > 0) {
        hasProration = true
        creditAmount = proration.creditAmount
        priceToCharge = proration.finalPrice
      }
    }

    // ─── Server-side coupon validation ───
    let validatedCouponCode: string | null = null
    let couponDiscountAmount = 0

    if (couponCode && typeof couponCode === 'string' && couponCode.trim() !== '') {
      const normalizedCode = couponCode.toUpperCase().trim()

      // Look up coupon in database
      const dbCoupon = await prisma.coupon.findUnique({
        where: { code: normalizedCode }
      })

      if (dbCoupon && dbCoupon.isActive) {
        const now = new Date()
        const isDateValid = (!dbCoupon.validUntil || new Date(dbCoupon.validUntil) >= now) &&
                           (!dbCoupon.validFrom || new Date(dbCoupon.validFrom) <= now)
        const isUsageValid = !dbCoupon.maxUses || dbCoupon.usedCount < dbCoupon.maxUses

        // Check per-user usage
        let isUserUsageValid = true
        if (dbCoupon.maxUsesPerUser) {
          const userUsageCount = await prisma.couponUse.count({
            where: { couponId: dbCoupon.id, userId: user.id }
          })
          isUserUsageValid = userUsageCount < dbCoupon.maxUsesPerUser
        }

        // Check plan applicability
        const isPlanApplicable = !dbCoupon.applicableToPlans?.length || dbCoupon.applicableToPlans.includes(planCode)

        if (isDateValid && isUsageValid && isUserUsageValid && isPlanApplicable) {
          validatedCouponCode = normalizedCode

          if (dbCoupon.discountPercent && Number(dbCoupon.discountPercent) > 0) {
            couponDiscountAmount = priceToCharge * (Number(dbCoupon.discountPercent) / 100)
          } else if (dbCoupon.discountAmount && Number(dbCoupon.discountAmount) > 0) {
            couponDiscountAmount = Number(dbCoupon.discountAmount)
          }

          priceToCharge = Math.max(0, priceToCharge - couponDiscountAmount)
        }
      }
    }

    // Ensure minimum charge (Stripe requires >= €0.50 for subscriptions)
    if (priceToCharge > 0 && priceToCharge < 0.50) {
      priceToCharge = 0.50
    }


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
        couponCode: validatedCouponCode || '',
        couponDiscountAmount: couponDiscountAmount > 0 ? couponDiscountAmount.toFixed(2) : '0'
      },
      success_url: successUrl || `${request.headers.get('origin')}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${request.headers.get('origin')}/account/plans?cancelled=true`,
      locale: 'es',
      allow_promotion_codes: !validatedCouponCode // Only allow Stripe promos if no DB coupon applied
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    })

  } catch (error) {

    if (error instanceof Stripe.errors.StripeError) {
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
    return NextResponse.json(
      { error: `Error al crear sesión de pago: ${errorMessage}` },
      { status: 500 }
    )
  }
}
