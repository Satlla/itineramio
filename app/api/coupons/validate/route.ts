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
    const { couponCode, propertyCount = 2, planCode = 'BASIC' } = await request.json()
    
    if (!couponCode) {
      return NextResponse.json({ error: 'Código de cupón requerido' }, { status: 400 })
    }
    
    // Find the coupon using raw query
    const coupons = await prisma.$queryRaw`
      SELECT * FROM coupons
      WHERE code = ${couponCode.toUpperCase()}
      AND "isActive" = true
      LIMIT 1
    `
    const coupon = Array.isArray(coupons) && coupons.length > 0 ? coupons[0] : null
    
    if (!coupon) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Código de cupón no válido' 
      }, { status: 404 })
    }
    
    // Check date validity
    const now = new Date()
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
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
    
    // Check user-specific usage limits - simplified for now
    // const userUsageCount = coupon.uses.filter(use => use.userId === decoded.userId).length
    // if (userUsageCount >= coupon.maxUsesPerUser) {
    //   return NextResponse.json({
    //     valid: false,
    //     error: 'Ya has usado este cupón el máximo de veces permitidas'
    //   })
    // }
    
    // Simplified pricing calculation based on plan
    const planPrices = {
      'BASIC': 9,
      'HOST': 29,
      'SUPERHOST': 69,
      'BUSINESS': 99
    }

    const basePrice = planPrices[planCode as keyof typeof planPrices] || 9
    let discountAmount = 0
    let finalAmount = basePrice

    // Calculate discount based on discountPercent
    if (coupon.discountPercent) {
      discountAmount = basePrice * (Number(coupon.discountPercent) / 100)
      finalAmount = basePrice - discountAmount
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
        originalAmount: basePrice,
        discountAmount,
        finalAmount,
        percentageOff: Number(coupon.discountPercent) || 0
      },
      details: {
        usesRemaining: coupon.maxUses ? coupon.maxUses - coupon.usedCount : 'Ilimitado',
        validUntil: coupon.validUntil
      }
    })
    
  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}