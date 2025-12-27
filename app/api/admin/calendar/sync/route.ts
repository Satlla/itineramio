import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '../../../../../src/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    // Temporarily disabled calendar sync functionality
    return NextResponse.json({
      error: 'Calendar sync temporarily disabled'
    }, { status: 503 })
    
  } catch (error) {
    console.error('Calendar sync error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}