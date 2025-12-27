import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '../../../../../src/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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