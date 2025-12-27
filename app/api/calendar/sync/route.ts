import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({
      error: 'Calendar sync functionality temporarily disabled'
    }, { status: 503 })
    
  } catch (error) {
    console.error('Calendar sync error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}