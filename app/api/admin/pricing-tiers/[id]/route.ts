import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../src/lib/prisma';
import { requireAdminAuth } from '../../../../../src/lib/admin-auth';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    const params = await context.params;
    const { id } = params;
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

    // Check if tier exists
    const existingTier = await prisma.pricingTier.findUnique({
      where: { id }
    });

    if (!existingTier) {
      return NextResponse.json({ 
        success: false, 
        error: 'Pricing tier not found' 
      }, { status: 404 });
    }

    // Validate ranges don't overlap with other tiers
    const otherTiers = await prisma.pricingTier.findMany({
      where: { 
        isActive: true,
        id: { not: id } // Exclude current tier
      },
      orderBy: { minProperties: 'asc' }
    });

    // Check for overlap with other tiers
    for (const tier of otherTiers) {
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

    const updatedTier = await prisma.pricingTier.update({
      where: { id },
      data: {
        minProperties: parseInt(minProperties),
        maxProperties: maxProperties ? parseInt(maxProperties) : null,
        pricePerProperty: parseFloat(pricePerProperty)
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
          action: 'pricing_tier_updated',
          targetType: 'pricing_tier',
          targetId: updatedTier.id,
          description: `Updated pricing tier: ${minProperties}-${maxProperties || '∞'} properties at €${pricePerProperty}`,
          metadata: { 
            minProperties,
            maxProperties,
            pricePerProperty,
            previousValues: {
              minProperties: existingTier.minProperties,
              maxProperties: existingTier.maxProperties,
              pricePerProperty: Number(existingTier.pricePerProperty)
            }
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      tier: {
        id: updatedTier.id,
        minProperties: updatedTier.minProperties,
        maxProperties: updatedTier.maxProperties,
        pricePerProperty: Number(updatedTier.pricePerProperty),
        isActive: updatedTier.isActive,
        createdAt: updatedTier.createdAt.toISOString(),
        updatedAt: updatedTier.updatedAt.toISOString()
      },
      message: 'Pricing tier updated successfully'
    });

  } catch (error) {
    console.error('Error updating pricing tier:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    const params = await context.params;
    const { id } = params;

    // Check if tier exists
    const existingTier = await prisma.pricingTier.findUnique({
      where: { id }
    });

    if (!existingTier) {
      return NextResponse.json({ 
        success: false, 
        error: 'Pricing tier not found' 
      }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    const deletedTier = await prisma.pricingTier.update({
      where: { id },
      data: { isActive: false }
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
          action: 'pricing_tier_deleted',
          targetType: 'pricing_tier',
          targetId: deletedTier.id,
          description: `Deleted pricing tier: ${existingTier.minProperties}-${existingTier.maxProperties || '∞'} properties`,
          metadata: { 
            minProperties: existingTier.minProperties,
            maxProperties: existingTier.maxProperties,
            pricePerProperty: Number(existingTier.pricePerProperty)
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Pricing tier deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting pricing tier:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}