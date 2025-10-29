import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 })
    }
    
    const decoded = verifyToken(token)
    const { 
      couponCode, 
      propertyCount = 1, 
      duration = 1,
      paymentReference 
    } = await request.json()
    
    if (!couponCode || !paymentReference) {
      return NextResponse.json({ 
        error: 'Código de cupón y referencia de pago requeridos' 
      }, { status: 400 })
    }
    
    // Validate coupon first (reuse validation logic)
    const validationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${token}`
      },
      body: JSON.stringify({ couponCode, propertyCount, duration })
    })
    
    if (!validationResponse.ok) {
      const error = await validationResponse.json()
      return NextResponse.json(error, { status: validationResponse.status })
    }
    
    const validationResult = await validationResponse.json()
    
    if (!validationResult.valid) {
      return NextResponse.json({ 
        error: validationResult.error 
      }, { status: 400 })
    }
    
    // Get the coupon from database
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() }
    })
    
    if (!coupon) {
      return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 })
    }
    
    // Create coupon use record
    const couponUse = await prisma.couponUse.create({
      data: {
        couponId: coupon.id,
        userId: decoded.userId,
        orderId: paymentReference,
        discountApplied: validationResult.discount.discountAmount,
        originalAmount: validationResult.discount.originalAmount,
        finalAmount: validationResult.discount.finalAmount
      }
    })
    
    // Update coupon usage count
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } }
    })
    
    // If it's free months, handle differently
    if (coupon.type === 'FREE_MONTHS' && coupon.freeMonths) {
      // Find user's most recent property to extend
      const recentProperty = await prisma.property.findFirst({
        where: { 
          hostId: decoded.userId,
          status: { in: ['ACTIVE', 'TRIAL'] }
        },
        orderBy: { createdAt: 'desc' }
      })
      
      if (recentProperty) {
        const extensionDate = new Date()
        extensionDate.setMonth(extensionDate.getMonth() + coupon.freeMonths)
        
        await prisma.property.update({
          where: { id: recentProperty.id },
          data: { 
            subscriptionEndsAt: extensionDate,
            status: 'ACTIVE'
          }
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      couponUse: {
        id: couponUse.id,
        couponName: coupon.name,
        discountApplied: couponUse.discountApplied,
        finalAmount: couponUse.finalAmount,
        freeMonthsGained: coupon.type === 'FREE_MONTHS' ? coupon.freeMonths : 0
      },
      message: `Cupón ${coupon.code} aplicado exitosamente`
    })
    
  } catch (error) {
    console.error('Error applying coupon:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}