import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const propertiesParam = searchParams.get('properties');
    
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

    // Get active pricing tiers
    const tiers = await prisma.pricingTier.findMany({
      where: { isActive: true },
      orderBy: { minProperties: 'asc' }
    });

    // Find applicable tier
    const applicableTier = tiers.find(tier => 
      properties >= tier.minProperties && 
      (tier.maxProperties === null || properties <= tier.maxProperties)
    );

    if (!applicableTier) {
      return NextResponse.json({ 
        success: false, 
        error: 'No pricing tier found for this number of properties' 
      }, { status: 404 });
    }

    const pricePerProperty = Number(applicableTier.pricePerProperty);
    const totalPrice = properties * pricePerProperty;

    // Get all tiers for reference
    const allTiers = tiers.map(tier => ({
      minProperties: tier.minProperties,
      maxProperties: tier.maxProperties,
      pricePerProperty: Number(tier.pricePerProperty),
      label: `${tier.minProperties}${tier.maxProperties ? ` - ${tier.maxProperties}` : '+'} propiedades`
    }));

    return NextResponse.json({
      success: true,
      calculation: {
        properties,
        pricePerProperty,
        totalPrice,
        tier: {
          minProperties: applicableTier.minProperties,
          maxProperties: applicableTier.maxProperties,
          pricePerProperty: Number(applicableTier.pricePerProperty)
        }
      },
      allTiers
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
    const { properties, couponCode } = await request.json();
    
    if (!properties || properties < 1) {
      return NextResponse.json({ 
        success: false, 
        error: 'Properties must be a positive number' 
      }, { status: 400 });
    }

    // Get active pricing tiers
    const tiers = await prisma.pricingTier.findMany({
      where: { isActive: true },
      orderBy: { minProperties: 'asc' }
    });

    // Find applicable tier
    const applicableTier = tiers.find(tier => 
      properties >= tier.minProperties && 
      (tier.maxProperties === null || properties <= tier.maxProperties)
    );

    if (!applicableTier) {
      return NextResponse.json({ 
        success: false, 
        error: 'No pricing tier found for this number of properties' 
      }, { status: 404 });
    }

    const pricePerProperty = Number(applicableTier.pricePerProperty);
    let totalPrice = properties * pricePerProperty;
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
        }

        finalPrice = totalPrice - discountAmount;

        couponInfo = {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          type: coupon.type,
          discountPercent: coupon.discountPercent,
          discountAmount: coupon.discountAmount ? Number(coupon.discountAmount) : null,
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
        pricePerProperty,
        totalPrice,
        discountAmount,
        finalPrice,
        tier: {
          minProperties: applicableTier.minProperties,
          maxProperties: applicableTier.maxProperties,
          pricePerProperty: Number(applicableTier.pricePerProperty)
        },
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