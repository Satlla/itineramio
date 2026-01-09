import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ valid: false, message: 'No autenticado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded?.userId) {
      return NextResponse.json({ valid: false, message: 'Token inválido' }, { status: 401 })
    }

    const { code, planCode } = await request.json()

    if (!code) {
      return NextResponse.json({ valid: false, message: 'Código de cupón requerido' }, { status: 400 })
    }

    const couponCode = code.toUpperCase().trim()

    // 1. Check in database first
    const dbCoupon = await prisma.$queryRaw<Array<{
      id: string
      code: string
      name: string
      description: string | null
      type: string
      discountPercent: number | null
      discountAmount: number | null
      freeMonths: number | null
      maxUses: number | null
      usedCount: number
      maxUsesPerUser: number | null
      validFrom: Date | null
      validUntil: Date | null
      applicableToPlans: string[]
      isActive: boolean
    }>>`
      SELECT * FROM coupons
      WHERE code = ${couponCode}
      AND "isActive" = true
      LIMIT 1
    `

    const coupon = dbCoupon.length > 0 ? dbCoupon[0] : null

    if (!coupon) {
      // Try to validate in Stripe as promotion code
      try {
        const promoCodes = await stripe.promotionCodes.list({
          code: couponCode,
          active: true,
          limit: 1
        })

        if (promoCodes.data.length > 0) {
          const promoCode = promoCodes.data[0]
          const couponId = typeof promoCode.coupon === 'string' ? promoCode.coupon : promoCode.coupon.id
          const stripeCoupon = await stripe.coupons.retrieve(couponId)

          return NextResponse.json({
            valid: true,
            coupon: {
              code: couponCode,
              name: stripeCoupon.name || couponCode,
              discountType: stripeCoupon.percent_off ? 'PERCENTAGE' : 'FIXED',
              discountValue: stripeCoupon.percent_off || (stripeCoupon.amount_off ? stripeCoupon.amount_off / 100 : 0)
            }
          })
        }
      } catch {
        // Stripe lookup failed, continue to return invalid
      }

      return NextResponse.json({
        valid: false,
        message: 'Cupón no válido o expirado'
      })
    }

    // 2. Check date validity
    const now = new Date()
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return NextResponse.json({
        valid: false,
        message: 'Este cupón ha expirado'
      })
    }

    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return NextResponse.json({
        valid: false,
        message: 'Este cupón aún no es válido'
      })
    }

    // 3. Check usage limits
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({
        valid: false,
        message: 'Este cupón ha alcanzado su límite de uso'
      })
    }

    // 4. Check user-specific usage
    if (coupon.maxUsesPerUser) {
      const userUsageCount = await prisma.couponUse.count({
        where: {
          couponId: coupon.id,
          userId: decoded.userId
        }
      })

      if (userUsageCount >= coupon.maxUsesPerUser) {
        return NextResponse.json({
          valid: false,
          message: 'Ya has usado este cupón'
        })
      }
    }

    // 5. Check plan applicability
    if (coupon.applicableToPlans && coupon.applicableToPlans.length > 0 && planCode) {
      if (!coupon.applicableToPlans.includes(planCode)) {
        return NextResponse.json({
          valid: false,
          message: `Este cupón no es válido para el plan ${planCode}`
        })
      }
    }

    // 6. Determine discount type and value
    let discountType: 'PERCENTAGE' | 'FIXED' | 'FREE_MONTHS' = 'PERCENTAGE'
    let discountValue = 0

    if (coupon.discountPercent && Number(coupon.discountPercent) > 0) {
      discountType = 'PERCENTAGE'
      discountValue = Number(coupon.discountPercent)
    } else if (coupon.discountAmount && Number(coupon.discountAmount) > 0) {
      discountType = 'FIXED'
      discountValue = Number(coupon.discountAmount)
    } else if (coupon.freeMonths && Number(coupon.freeMonths) > 0) {
      discountType = 'FREE_MONTHS'
      discountValue = Number(coupon.freeMonths)
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountType,
        discountValue
      }
    })

  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json({
      valid: false,
      message: 'Error al validar el cupón'
    }, { status: 500 })
  }
}
