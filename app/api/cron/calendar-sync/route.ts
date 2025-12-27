import { NextRequest, NextResponse } from 'next/server'

// This endpoint can be called by external cron services like Vercel Cron or GitHub Actions

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      message: 'Calendar sync cron temporarily disabled',
      processed: 0,
      errors: 0
    })
    
  } catch (error) {
    console.error('Cron calendar sync error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}