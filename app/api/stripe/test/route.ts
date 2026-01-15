import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY

    if (!secretKey) {
      return NextResponse.json({
        success: false,
        error: 'STRIPE_SECRET_KEY not found'
      })
    }

    // Direct HTTP call to Stripe API (no SDK)
    const response = await fetch('https://api.stripe.com/v1/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        httpStatus: response.status,
        stripeError: data,
        keyInfo: {
          length: secretKey.length,
          first20: secretKey.substring(0, 20) + '...'
        }
      })
    }

    return NextResponse.json({
      success: true,
      balance: data,
      keyInfo: {
        length: secretKey.length,
        first20: secretKey.substring(0, 20) + '...'
      }
    })

  } catch (error) {
    const err = error as Error
    return NextResponse.json({
      success: false,
      error: err.message,
      name: err.name
    }, { status: 500 })
  }
}
