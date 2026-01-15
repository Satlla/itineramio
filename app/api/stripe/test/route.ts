import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET() {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY

    // Check if key exists
    if (!secretKey) {
      return NextResponse.json({
        success: false,
        error: 'STRIPE_SECRET_KEY not found in environment',
        keyExists: false
      })
    }

    // Check key format
    const keyInfo = {
      length: secretKey.length,
      startsWithLive: secretKey.startsWith('sk_live_'),
      startsWithTest: secretKey.startsWith('sk_test_'),
      first20: secretKey.substring(0, 20) + '...',
      hasWhitespace: /\s/.test(secretKey)
    }

    // Try to connect to Stripe
    const stripe = new Stripe(secretKey)

    // Simple API call to test connection
    const balance = await stripe.balance.retrieve()

    return NextResponse.json({
      success: true,
      keyInfo,
      balanceAvailable: balance.available.map(b => ({ amount: b.amount, currency: b.currency })),
      message: 'Stripe connection successful!'
    })

  } catch (error) {
    const err = error as Error
    return NextResponse.json({
      success: false,
      error: err.message,
      name: err.name,
      keyInfo: {
        exists: !!process.env.STRIPE_SECRET_KEY,
        length: process.env.STRIPE_SECRET_KEY?.length || 0,
        first20: process.env.STRIPE_SECRET_KEY?.substring(0, 20) + '...'
      }
    }, { status: 500 })
  }
}
