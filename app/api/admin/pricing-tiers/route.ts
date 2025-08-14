import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import { requireAdminAuth } from '../../../../src/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    const tiers = await prisma.pricingTier.findMany({
      orderBy: { minProperties: 'asc' }
    });

    return NextResponse.json({
      success: true,
      tiers: tiers.map(tier => ({
        id: tier.id,
        minProperties: tier.minProperties,
        maxProperties: tier.maxProperties,
        pricePerProperty: Number(tier.pricePerProperty),
        isActive: tier.isActive,
        createdAt: tier.createdAt.toISOString(),
        updatedAt: tier.updatedAt.toISOString()
      }))
    });

  } catch (error) {
    console.error('Error fetching pricing tiers:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    const { 
      minProperties, 
      maxProperties, 
      pricePerProperty 
    } = await request.json();

    if (!minProperties || !pricePerProperty) {
      return NextResponse.json({ 
        success: false, 
        error: 'minProperties and pricePerProperty are required' 
      }, { status: 400 });
    }

    // Validate ranges don't overlap
    const existingTiers = await prisma.pricingTier.findMany({
      where: { isActive: true },
      orderBy: { minProperties: 'asc' }
    });

    // Check for overlap with existing tiers
    for (const tier of existingTiers) {
      const tierMax = tier.maxProperties || Infinity;
      const newMax = maxProperties || Infinity;
      
      // Check if ranges overlap
      if (
        (minProperties >= tier.minProperties && minProperties <= tierMax) ||
        (newMax >= tier.minProperties && newMax <= tierMax) ||
        (minProperties <= tier.minProperties && newMax >= tierMax)
      ) {
        return NextResponse.json({ 
          success: false, 
          error: `Range overlaps with existing tier: ${tier.minProperties}-${tier.maxProperties || '∞'}` 
        }, { status: 400 });
      }
    }

    const newTier = await prisma.pricingTier.create({
      data: {
        minProperties: parseInt(minProperties),
        maxProperties: maxProperties ? parseInt(maxProperties) : null,
        pricePerProperty: parseFloat(pricePerProperty),
        isActive: true
      }
    });

    // Log activity
    const adminUser = await prisma.user.findFirst({
      where: { isAdmin: true },
      select: { id: true }
    });
    
    if (adminUser) {
      await prisma.adminActivityLog.create({
        data: {
          adminUserId: adminUser.id,
          action: 'pricing_tier_created',
          targetType: 'pricing_tier',
          targetId: newTier.id,
          description: `Created pricing tier: ${minProperties}-${maxProperties || '∞'} properties at €${pricePerProperty}`,
          metadata: { 
            minProperties,
            maxProperties,
            pricePerProperty
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      tier: {
        id: newTier.id,
        minProperties: newTier.minProperties,
        maxProperties: newTier.maxProperties,
        pricePerProperty: Number(newTier.pricePerProperty),
        isActive: newTier.isActive,
        createdAt: newTier.createdAt.toISOString(),
        updatedAt: newTier.updatedAt.toISOString()
      },
      message: 'Pricing tier created successfully'
    });

  } catch (error) {
    console.error('Error creating pricing tier:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}