import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import {
  getSuggestedPlan,
  calculatePrice,
  getDiscount,
  VISIBLE_PLANS,
  type BillingPeriod
} from '../../../../src/config/plans';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const propertiesParam = searchParams.get('properties');
    const periodParam = searchParams.get('period') as BillingPeriod | null;

    if (!propertiesParam) {
      return NextResponse.json({
        success: false,
        error: 'Properties parameter is required'
      }, { status: 400 });
    }

    const properties = parseInt(propertiesParam);

    if (isNaN(properties) || properties < 1) {
      return NextResponse.json({
        success: false,
        error: 'Properties must be a positive number'
      }, { status: 400 });
    }

    // Get suggested plan based on property count
    const suggestedPlan = getSuggestedPlan(properties);
    const period: BillingPeriod = periodParam || 'MONTHLY';

    // Calculate price for selected period
    const price = calculatePrice(suggestedPlan, period);
    const discount = getDiscount(period);

    // Get all available plans for comparison
    const allPlans = VISIBLE_PLANS.map(plan => ({
      code: plan.code,
      name: plan.name,
      description: plan.description,
      maxProperties: plan.maxProperties,
      priceMonthly: plan.priceMonthly,
      priceSemestral: plan.priceSemestral,
      priceYearly: plan.priceYearly,
      features: plan.features,
      color: plan.color
    }));

    return NextResponse.json({
      success: true,
      calculation: {
        properties,
        suggestedPlan: {
          code: suggestedPlan.code,
          name: suggestedPlan.name,
          description: suggestedPlan.description,
          maxProperties: suggestedPlan.maxProperties,
          price,
          period,
          discount,
          priceMonthly: suggestedPlan.priceMonthly,
          priceSemestral: suggestedPlan.priceSemestral,
          priceYearly: suggestedPlan.priceYearly
        }
      },
      allPlans
    });

  } catch (error) {
    console.error('Error calculating pricing:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { properties, couponCode, period } = await request.json();

    if (!properties || properties < 1) {
      return NextResponse.json({
        success: false,
        error: 'Properties must be a positive number'
      }, { status: 400 });
    }

    // Get suggested plan based on property count
    const suggestedPlan = getSuggestedPlan(properties);
    const billingPeriod: BillingPeriod = period || 'MONTHLY';

    // Calculate price for selected period
    let totalPrice = calculatePrice(suggestedPlan, billingPeriod);
    const discount = getDiscount(billingPeriod);
    let discountAmount = 0;
    let finalPrice = totalPrice;
    let couponInfo = null;

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
          isActive: true,
          validFrom: { lte: new Date() },
          OR: [
            { validUntil: null },
            { validUntil: { gte: new Date() } }
          ]
        }
      });

      if (coupon) {
        // Check usage limits
        const usageCount = await prisma.couponUse.count({
          where: { couponId: coupon.id }
        });

        if (coupon.maxUses && usageCount >= coupon.maxUses) {
          return NextResponse.json({
            success: false,
            error: 'Coupon usage limit exceeded'
          }, { status: 400 });
        }

        // Check minimum amount
        if (coupon.minAmount && totalPrice < Number(coupon.minAmount)) {
          return NextResponse.json({
            success: false,
            error: `Minimum amount required: €${coupon.minAmount}`
          }, { status: 400 });
        }

        // Calculate discount
        if (coupon.type === 'PERCENTAGE' && coupon.discountPercent) {
          discountAmount = (totalPrice * coupon.discountPercent) / 100;
        } else if (coupon.type === 'FIXED_AMOUNT' && coupon.discountAmount) {
          discountAmount = Math.min(Number(coupon.discountAmount), totalPrice);
        } else if (coupon.type === 'FREE_MONTHS' && coupon.freeMonths) {
          // For FREE_MONTHS, calculate the equivalent value but don't reduce current payment
          discountAmount = totalPrice * coupon.freeMonths;
          // Customer pays the same but gets additional months free
        }

        finalPrice = coupon.type === 'FREE_MONTHS' ? totalPrice : totalPrice - discountAmount;

        couponInfo = {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          type: coupon.type,
          discountPercent: coupon.discountPercent,
          discountAmount: coupon.discountAmount ? Number(coupon.discountAmount) : null,
          freeMonths: coupon.freeMonths || 0,
          equivalentValue: discountAmount,
          applied: true
        };
      } else {
        return NextResponse.json({
          success: false,
          error: 'Invalid or expired coupon code'
        }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      calculation: {
        properties,
        plan: {
          code: suggestedPlan.code,
          name: suggestedPlan.name,
          description: suggestedPlan.description,
          maxProperties: suggestedPlan.maxProperties,
          priceMonthly: suggestedPlan.priceMonthly,
          priceSemestral: suggestedPlan.priceSemestral,
          priceYearly: suggestedPlan.priceYearly
        },
        period: billingPeriod,
        periodDiscount: discount,
        totalPrice,
        discountAmount,
        finalPrice,
        coupon: couponInfo
      }
    });

  } catch (error) {
    console.error('Error calculating pricing with coupon:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}