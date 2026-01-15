import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Generate invoice number format: INV-YYYY-XXXX
async function generateInvoiceNumber() {
  const year = new Date().getFullYear()

  const latestInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: `INV-${year}-`
      }
    },
    orderBy: {
      invoiceNumber: 'desc'
    }
  })

  let nextNumber = 1
  if (latestInvoice) {
    const currentNumber = parseInt(latestInvoice.invoiceNumber.split('-')[2])
    nextNumber = currentNumber + 1
  }

  return `INV-${year}-${nextNumber.toString().padStart(4, '0')}`
}

/**
 * POST /api/stripe/verify-session
 *
 * Verifies a Stripe checkout session and activates the subscription
 * if payment was successful. Used when webhooks can't reach localhost.
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe no configurado' },
        { status: 503 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil' as Stripe.LatestApiVersion
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

    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID requerido' },
        { status: 400 }
      )
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    })

    console.log('🔍 Verifying Stripe session:', {
      sessionId,
      paymentStatus: session.payment_status,
      status: session.status,
      userId: session.metadata?.userId
    })

    // Verify the session belongs to this user
    if (session.metadata?.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Sesión no válida para este usuario' },
        { status: 403 }
      )
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        success: false,
        status: session.payment_status,
        message: 'El pago aún no se ha completado'
      })
    }

    // Get plan info from metadata
    const planCode = session.metadata?.planCode
    const billingPeriod = session.metadata?.billingPeriod

    if (!planCode) {
      return NextResponse.json(
        { error: 'Información del plan no encontrada' },
        { status: 400 }
      )
    }

    // Check if subscription already exists for this session
    const existingSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: decoded.userId,
        notes: { contains: sessionId }
      }
    })

    if (existingSubscription) {
      console.log('✅ Subscription already exists for this session')

      // Find the related invoice
      const existingInvoice = await prisma.invoice.findFirst({
        where: {
          subscriptionId: existingSubscription.id,
          paymentReference: { contains: sessionId }
        }
      })

      // Get plan name
      const existingPlan = await prisma.subscriptionPlan.findUnique({
        where: { id: existingSubscription.planId }
      })

      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        message: 'La suscripción ya fue activada',
        subscription: {
          id: existingSubscription.id,
          planName: existingPlan?.name || 'Plan',
          startDate: existingSubscription.startDate,
          endDate: existingSubscription.endDate
        },
        invoice: existingInvoice ? {
          id: existingInvoice.id,
          invoiceNumber: existingInvoice.invoiceNumber,
          amount: Number(existingInvoice.finalAmount)
        } : undefined
      })
    }

    // Find or create the plan
    let plan = await prisma.subscriptionPlan.findUnique({
      where: { code: planCode }
    })

    if (!plan) {
      const planConfigs: Record<string, { name: string; priceMonthly: number; maxProperties: number }> = {
        BASIC: { name: 'Basic', priceMonthly: 9, maxProperties: 2 },
        HOST: { name: 'Host', priceMonthly: 29, maxProperties: 10 },
        SUPERHOST: { name: 'Superhost', priceMonthly: 69, maxProperties: 25 },
        BUSINESS: { name: 'Business', priceMonthly: 99, maxProperties: 50 }
      }

      const config = planConfigs[planCode]
      if (config) {
        plan = await prisma.subscriptionPlan.create({
          data: {
            code: planCode,
            name: config.name,
            priceMonthly: config.priceMonthly,
            maxProperties: config.maxProperties,
            isActive: true
          }
        })
      }
    }

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 400 }
      )
    }

    // Calculate subscription dates
    const startDate = new Date()
    let endDate = new Date()

    if (billingPeriod === 'YEARLY') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else if (billingPeriod === 'SEMESTRAL') {
      endDate.setMonth(endDate.getMonth() + 6)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }

    // Get Stripe subscription ID if available
    const stripeSubscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id

    // Cancel any existing active subscriptions
    await prisma.userSubscription.updateMany({
      where: {
        userId: decoded.userId,
        status: 'ACTIVE'
      },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
        cancelReason: 'Replaced by new Stripe subscription'
      }
    })

    // Create new subscription with Stripe subscription ID
    const subscription = await prisma.userSubscription.create({
      data: {
        userId: decoded.userId,
        planId: plan.id,
        status: 'ACTIVE',
        startDate,
        endDate,
        stripeSubscriptionId: stripeSubscriptionId || null,
        notes: `Stripe payment - Session: ${sessionId}\nBilling period: ${billingPeriod}\nAmount: €${session.metadata?.chargedPriceEur || 'N/A'}`
      }
    })

    // Get the actual charged price from metadata
    const chargedPrice = parseFloat(session.metadata?.chargedPriceEur || '0')
    const fullPrice = parseFloat(session.metadata?.fullPriceEur || '0')
    const hasProration = session.metadata?.hasProration === 'true'
    const discountAmount = hasProration ? (fullPrice - chargedPrice) : 0

    // Generate invoice number and create invoice
    const invoiceNumber = await generateInvoiceNumber()

    const invoice = await prisma.invoice.create({
      data: {
        userId: decoded.userId,
        subscriptionId: subscription.id,
        invoiceNumber,
        amount: fullPrice || chargedPrice,
        discountAmount: discountAmount,
        finalAmount: chargedPrice,
        status: 'PAID',
        paymentMethod: 'STRIPE',
        paymentReference: sessionId,
        dueDate: new Date(),
        paidDate: new Date(),
        notes: `Pago Stripe automático\nPlan: ${plan.name}\nPeríodo: ${billingPeriod}${hasProration ? '\nProrrateo aplicado' : ''}`
      }
    })

    console.log('📄 Invoice created:', {
      invoiceNumber,
      chargedPrice,
      discountAmount
    })

    // Update user status
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        status: 'ACTIVE',
        subscription: planCode
      }
    })

    console.log('✅ Subscription activated via Stripe:', {
      subscriptionId: subscription.id,
      planCode,
      billingPeriod,
      endDate,
      invoiceNumber
    })

    return NextResponse.json({
      success: true,
      message: '¡Suscripción activada correctamente!',
      subscription: {
        id: subscription.id,
        planName: plan.name,
        startDate,
        endDate
      },
      invoice: {
        id: invoice.id,
        invoiceNumber,
        amount: chargedPrice
      }
    })

  } catch (error) {
    console.error('Error verifying Stripe session:', error)
    return NextResponse.json(
      { error: 'Error al verificar el pago' },
      { status: 500 }
    )
  }
}
