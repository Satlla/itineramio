import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing auth module...')
    
    // Test the auth system
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      console.log('❌ Auth failed as expected (no token)')
      return NextResponse.json({
        success: true,
        message: 'Auth system working - no token provided',
        authResult: 'Response object (failed auth)'
      })
    }
    
    console.log('✅ Auth passed:', authResult)
    return NextResponse.json({
      success: true,
      message: 'Auth system working - token valid',
      authResult: authResult
    })
    
  } catch (error) {
    console.error('💥 Auth test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
}