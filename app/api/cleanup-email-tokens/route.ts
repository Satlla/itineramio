import { NextRequest, NextResponse } from 'next/server'
import { EmailVerificationService } from '../../../src/lib/auth-email'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  // Require CRON_SECRET for security
  if (!CRON_SECRET) {
    console.error('CRON_SECRET not configured')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const deletedCount = await EmailVerificationService.cleanupExpiredTokens()

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} expired email verification tokens`
    })
  } catch (error) {
    console.error('Error cleaning up email tokens:', error)
    return NextResponse.json(
      { error: 'Error cleaning up expired tokens' },
      { status: 500 }
    )
  }
}

// Also allow POST with same auth
export async function POST(request: NextRequest) {
  return GET(request)
}
