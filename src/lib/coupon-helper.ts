import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil' as Stripe.LatestApiVersion
})

export interface CouponStatus {
  code: string
  percentOff: number
  maxRedemptions: number
  timesRedeemed: number
  remaining: number
  isValid: boolean
}

/**
 * Obtiene el estado actual de un cupón de Stripe
 */
export async function getCouponStatus(couponId: string): Promise<CouponStatus | null> {
  try {
    const coupon = await stripe.coupons.retrieve(couponId)

    const maxRedemptions = coupon.max_redemptions || 0
    const timesRedeemed = coupon.times_redeemed || 0
    const remaining = maxRedemptions > 0 ? maxRedemptions - timesRedeemed : -1 // -1 = unlimited

    return {
      code: coupon.id,
      percentOff: coupon.percent_off || 0,
      maxRedemptions,
      timesRedeemed,
      remaining,
      isValid: coupon.valid && (remaining === -1 || remaining > 0)
    }
  } catch (error) {
    console.error('Error getting coupon status:', error)
    return null
  }
}

/**
 * Obtiene los cupones restantes del código BIENVENIDO20
 */
export async function getBienvenido20Remaining(): Promise<number> {
  const status = await getCouponStatus('BIENVENIDO20')
  return status?.remaining ?? 0
}
