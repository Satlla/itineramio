import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'
import { couponRateLimiter, getRateLimitKey } from '../../../../src/lib/rate-limit'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  telemetry: false,
  httpClient: Stripe.createFetchHttpClient()
})

/**
 * POST /api/billing/validate-coupon
 *
 * Validates a coupon code for a user.
 * Rate limited: 20 requests per minute per user
 */
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

    // Rate limiting: 20 requests per minute per user
    const rateLimitKey = getRateLimitKey(request, decoded.userId, 'validate-coupon')
    const rateLimitResult = couponRateLimiter(rateLimitKey)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          valid: false,
          message: 'Demasiadas solicitudes. Por favor, espera un momento.'
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(rateLimitResult.resetIn / 1000).toString()
          }
        }
      )
    }

    const { code, planCode } = await request.json()

    if (!code) {
      return NextResponse.json({ valid: false, message: 'Código de cupón requerido' }, { status: 400 })
    }

    const couponCode = code.toUpperCase().trim()

    // 1. Check in database first
    const coupon = await prisma.coupon.findFirst({
      where: { code: couponCode, isActive: true }
    })

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
          const rawCoupon = (promoCode as unknown as { coupon: string | { id: string } }).coupon
          const couponId = typeof rawCoupon === 'string' ? rawCoupon : rawCoupon.id
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
