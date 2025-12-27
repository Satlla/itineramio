import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      error: 'Calendar functionality temporarily disabled'
    }, { status: 503 })
    
  } catch (error) {
    console.error('Calendar error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}