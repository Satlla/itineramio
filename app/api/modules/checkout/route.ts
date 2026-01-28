import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { MODULES } from '@/config/modules'

type BillingPeriod = 'MONTHLY' | 'SEMESTRAL' | 'YEARLY'

/**
 * POST /api/modules/checkout
 * Crear sesión de checkout de Stripe para suscripción a módulo
 */
export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not configured')
      return NextResponse.json(
        { success: false, error: 'Stripe no está configurado' },
        { status: 503 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      telemetry: false,
      httpClient: Stripe.createFetchHttpClient()
    })

    // Verify authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      moduleCode,
      billingPeriod = 'MONTHLY',
      couponCode,
      amount // Pre-calculated amount with discounts
    } = body

    // Validate module (accept GESTION and FACTURAMIO as the same)
    const normalizedModuleCode = moduleCode === 'FACTURAMIO' ? 'GESTION' : moduleCode
    if (!normalizedModuleCode || !['MANUALES', 'GESTION'].includes(normalizedModuleCode)) {
      return NextResponse.json(
        { success: false, error: 'Módulo no válido' },
        { status: 400 }
      )
    }

    const module = MODULES[normalizedModuleCode as keyof typeof MODULES]
    if (!module || module.basePriceMonthly === null) {
      return NextResponse.json(
        { success: false, error: 'Este módulo no tiene precio directo' },
        { status: 400 }
      )
    }

    // Calculate price
    const period = billingPeriod as BillingPeriod
    let priceToCharge = amount

    // If no amount provided, calculate from module config
    if (!priceToCharge) {
      const months = period === 'MONTHLY' ? 1 : period === 'SEMESTRAL' ? 6 : 12
      const discount = period === 'MONTHLY' ? 0 : period === 'SEMESTRAL' ? 0.1 : 0.2
      priceToCharge = module.basePriceMonthly * months * (1 - discount)
    }

    // Calculate Stripe interval
    let intervalCount = 1
    let interval: 'month' | 'year' = 'month'

    if (period === 'SEMESTRAL') {
      intervalCount = 6
      interval = 'month'
    } else if (period === 'YEARLY') {
      intervalCount = 1
      interval = 'year'
    }

    console.log('💰 Module Checkout:', {
      moduleCode: normalizedModuleCode,
      moduleName: module.name,
      billingPeriod: period,
      priceToCharge,
      couponCode: couponCode || 'none'
    })

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: module.name,
              description: `${module.shortDescription} - ${period === 'MONTHLY' ? 'Mensual' : period === 'SEMESTRAL' ? 'Semestral (-10%)' : 'Anual (-20%)'}`,
              metadata: {
                moduleCode: module.code
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
        moduleCode: module.code,
        billingPeriod: period,
        couponCode: couponCode || '',
        isModuleSubscription: 'true'
      },
      success_url: `${request.headers.get('origin')}/gestion?activated=true`,
      cancel_url: `${request.headers.get('origin')}/account/modules/gestion?cancelled=true`,
      locale: 'es',
      allow_promotion_codes: true
    })

    console.log(`✅ Module checkout session created: ${session.id}`)

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    })

  } catch (error) {
    console.error('Error creating module checkout:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { success: false, error: `Error de Stripe: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al crear sesión de pago' },
      { status: 500 }
    )
  }
}
