import { NextResponse } from 'next/server'
import { EmailVerificationService } from '../../../src/lib/auth-email'

export async function POST() {
  try {
    const deletedCount = await EmailVerificationService.cleanupExpiredTokens()
    
    return NextResponse.json({
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

// Allow GET for cron jobs
export async function GET() {
  return POST()
}