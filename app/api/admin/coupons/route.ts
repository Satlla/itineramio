import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../src/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    // Fetch all coupons with usage statistics
    const coupons = await prisma.coupon.findMany({
      include: {
        uses: {
          select: {
            id: true,
            userId: true,
            discountApplied: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate additional stats
    const stats = {
      totalCoupons: coupons.length,
      activeCoupons: coupons.filter(c => c.isActive).length,
      totalUses: coupons.reduce((sum, c) => sum + c.usedCount, 0),
      totalDiscountGiven: coupons.reduce((sum, c) => 
        sum + c.uses.reduce((useSum, use) => useSum + Number(use.discountApplied), 0), 0
      ),
      couponsByType: {
        PERCENTAGE: coupons.filter(c => c.type === 'PERCENTAGE').length,
        FIXED_AMOUNT: coupons.filter(c => c.type === 'FIXED_AMOUNT').length,
        FREE_MONTHS: coupons.filter(c => c.type === 'FREE_MONTHS').length,
        CUSTOM_PLAN: coupons.filter(c => c.type === 'CUSTOM_PLAN').length
      }
    }
    
    return NextResponse.json({ coupons, stats })
    
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    const {
      code,
      name,
      description,
      type,
      discountPercent,
      discountAmount,
      freeMonths,
      maxUses,
      maxUsesPerUser = 1,
      validFrom,
      validUntil,
      minAmount,
      minDuration,
      applicableToPlans = ['BASIC', 'HOST', 'SUPERHOST', 'BUSINESS'],
      applicableModule = null, // null = todos, 'MANUALES' o 'GESTION'
      isPublic = false,
      campaignSource
    } = await request.json()
    
    // Validate required fields
    if (!code || !name || !type) {
      return NextResponse.json({ 
        error: 'Código, nombre y tipo son requeridos' 
      }, { status: 400 })
    }
    
    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })
    
    if (existingCoupon) {
      return NextResponse.json({ 
        error: 'Ya existe un cupón con este código' 
      }, { status: 400 })
    }
    
    // Create the coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        name,
        description,
        type,
        discountPercent: type === 'PERCENTAGE' ? discountPercent : null,
        discountAmount: type === 'FIXED_AMOUNT' ? discountAmount : null,
        freeMonths: type === 'FREE_MONTHS' ? freeMonths : null,
        maxUses,
        maxUsesPerUser,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
        minAmount: minAmount ? minAmount : null,
        minDuration,
        applicableToPlans,
        applicableModule: applicableModule || null,
        isPublic,
        campaignSource,
        createdBy: authResult.adminId
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      coupon,
      message: `Cupón ${coupon.code} creado exitosamente` 
    })
    
  } catch (error) {
    console.error('Error creating coupon:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}