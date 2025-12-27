import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeTestEmail } from '@/lib/resend'

/**
 * Test endpoint para verificar que el email de bienvenida se envíe con token
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email') || 'test@example.com'
  const subscriberId = searchParams.get('subscriberId') || 'test-subscriber-id'

  console.log('=== EMAIL PREVIEW TEST ===')
  console.log('Email:', email)
  console.log('SubscriberId:', subscriberId)

  try {
    const result = await sendWelcomeTestEmail({
      email,
      name: 'Test User',
      archetype: 'ESTRATEGA',
      subscriberId
    })

    return NextResponse.json({
      success: true,
      result,
      params: {
        email,
        subscriberId
      }
    })
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
