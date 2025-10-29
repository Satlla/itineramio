import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '../../../../src/lib/auth'
import { prisma } from '../../../../src/lib/prisma'
import { PLANS } from '../../../../src/config/plans'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await getAuthUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authResult.userId

    // Get total properties count
    const totalProperties = await prisma.property.count({
      where: { hostId: userId }
    })

    // Get active subscription
    const activeSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      },
      include: {
        plan: true,
        invoices: {
          where: {
            status: 'PAID'
          },
          orderBy: {
            paidDate: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        endDate: 'desc'
      }
    })

    if (!activeSubscription || !activeSubscription.plan) {
      // No active subscription - return basic info
      return NextResponse.json({
        totalProperties,
        hasActiveSubscription: false,
        planCode: 'BASIC',
        planName: 'Basic',
        term: 'monthly',
        maxProperties: 3,
        daysUntilExpiry: null,
        nextPaymentAmount: null,
        nextPaymentDate: null
      })
    }

    // Calculate days until expiry
    const now = new Date()
    const endDate = new Date(activeSubscription.endDate)
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // ✅ FIX: Use billingPeriod from database instead of calculating from duration
    const savedBillingPeriod = activeSubscription.billingPeriod || 'MONTHLY'

    console.log('📊 [BILLING-OVERVIEW] Using billingPeriod from database:', {
      userId,
      subscriptionId: activeSubscription.id,
      savedBillingPeriod,
      planName: activeSubscription.plan.name
    })

    // Normalize billing period
    let term = 'monthly'
    let termLabel = 'Mensual'
    let periodMultiplier = 1

    const normalizedPeriod = savedBillingPeriod.toUpperCase()
    if (normalizedPeriod.includes('YEAR') || normalizedPeriod.includes('ANUAL')) {
      term = 'annual'
      termLabel = 'Anual'
      periodMultiplier = 12
    } else if (normalizedPeriod.includes('SEMI') || normalizedPeriod.includes('SEMEST')) {
      term = 'semiannual'
      termLabel = 'Semestral'
      periodMultiplier = 6
    }

    console.log('📊 [BILLING-OVERVIEW] Period determined from DB:', {
      term,
      termLabel,
      periodMultiplier,
      savedBillingPeriod
    })

    // Build full plan name with period
    const basePlanName = activeSubscription.plan.name || 'Basic'
    const fullPlanName = `${basePlanName} ${termLabel}`

    // ✅ FIX: Use ACTUAL paid invoice amount, not calculated from current PLANS prices
    let periodPrice = 0
    const lastInvoice = activeSubscription.invoices?.[0]

    if (lastInvoice?.finalAmount) {
      // Use the actual amount the user paid
      periodPrice = Number(lastInvoice.finalAmount)
      console.log('✅ [BILLING-OVERVIEW] Using actual paid amount from invoice:', {
        invoiceId: lastInvoice.id,
        invoiceNumber: lastInvoice.invoiceNumber,
        finalAmount: periodPrice
      })
    } else {
      // Fallback: calculate from current PLANS (for subscriptions without invoices)
      const planCode = activeSubscription.plan.name?.toUpperCase() || 'BASIC'
      const planConfig = PLANS[planCode as keyof typeof PLANS] || PLANS.BASIC

      if (term === 'annual') {
        periodPrice = planConfig.priceYearly || (planConfig.priceMonthly * 12)
      } else if (term === 'semiannual') {
        periodPrice = planConfig.priceSemestral || (planConfig.priceMonthly * 6)
      } else {
        periodPrice = planConfig.priceMonthly
      }

      console.log('⚠️  [BILLING-OVERVIEW] No invoice found, using calculated price from PLANS:', {
        planCode,
        periodPrice
      })
    }

    return NextResponse.json({
      totalProperties,
      hasActiveSubscription: true,
      planCode: activeSubscription.plan.name?.toUpperCase() || 'BASIC',
      planName: fullPlanName,
      term,
      termLabel,
      maxProperties: activeSubscription.plan.maxProperties || 3,
      daysUntilExpiry,
      nextPaymentAmount: periodPrice,
      nextPaymentDate: activeSubscription.endDate
    })

  } catch (error) {
    console.error('Error fetching billing overview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
