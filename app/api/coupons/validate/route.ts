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
    const { couponCode, propertyCount = 1, duration = 1 } = await request.json()
    
    if (!couponCode) {
      return NextResponse.json({ error: 'Código de cupón requerido' }, { status: 400 })
    }
    
    // Find the coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
      include: { uses: true }
    })
    
    if (!coupon) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Código de cupón no válido' 
      }, { status: 404 })
    }
    
    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Este cupón ya no está disponible' 
      })
    }
    
    // Check date validity
    const now = new Date()
    if (coupon.validFrom > now) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Este cupón aún no está disponible' 
      })
    }
    
    if (coupon.validUntil && coupon.validUntil < now) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Este cupón ha expirado' 
      })
    }
    
    // Check usage limits
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Este cupón ha alcanzado su límite de uso' 
      })
    }
    
    // Check user-specific usage limits
    const userUsageCount = coupon.uses.filter(use => use.userId === decoded.userId).length
    if (userUsageCount >= coupon.maxUsesPerUser) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Ya has usado este cupón el máximo de veces permitidas' 
      })
    }
    
    // Check minimum requirements
    if (coupon.minDuration && duration < coupon.minDuration) {
      return NextResponse.json({ 
        valid: false, 
        error: `Este cupón requiere una duración mínima de ${coupon.minDuration} meses` 
      })
    }
    
    // Calculate discount
    const basePrice = propertyCount > 1 ? (propertyCount - 1) * 2.5 : 0
    const totalAmount = basePrice * duration
    let discountAmount = 0
    let finalAmount = totalAmount
    let freeMonthsGained = 0
    
    switch (coupon.type) {
      case 'PERCENTAGE':
        if (coupon.discountPercent) {
          discountAmount = totalAmount * (coupon.discountPercent / 100)
          finalAmount = totalAmount - discountAmount
        }
        break
        
      case 'FIXED_AMOUNT':
        if (coupon.discountAmount) {
          discountAmount = Number(coupon.discountAmount)
          finalAmount = Math.max(0, totalAmount - discountAmount)
        }
        break
        
      case 'FREE_MONTHS':
        if (coupon.freeMonths) {
          freeMonthsGained = coupon.freeMonths
          // Don't change the final amount, but note the free months
        }
        break
        
      case 'CUSTOM_PLAN':
        return NextResponse.json({
          valid: true,
          type: 'CUSTOM_PLAN',
          message: 'Este cupón te da acceso a un plan personalizado. Contacta con soporte para más información.'
        })
    }
    
    // Check minimum amount if specified
    if (coupon.minAmount && totalAmount < Number(coupon.minAmount)) {
      return NextResponse.json({ 
        valid: false, 
        error: `Este cupón requiere un monto mínimo de €${coupon.minAmount}` 
      })
    }
    
    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        type: coupon.type
      },
      discount: {
        originalAmount: totalAmount,
        discountAmount,
        finalAmount,
        freeMonthsGained,
        percentageOff: coupon.discountPercent || 0
      },
      details: {
        usesRemaining: coupon.maxUses ? coupon.maxUses - coupon.usedCount : 'Ilimitado',
        userUsesRemaining: coupon.maxUsesPerUser - userUsageCount,
        validUntil: coupon.validUntil
      }
    })
    
  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}