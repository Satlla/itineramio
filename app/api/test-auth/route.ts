import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  
  // Get all cookies
  const allCookies: Record<string, string> = {}
  request.cookies.getAll().forEach(cookie => {
    allCookies[cookie.name] = cookie.value
  })
  
  return NextResponse.json({
    hasToken: !!token,
    tokenValue: token ? token.substring(0, 20) + '...' : null,
    cookies: allCookies,
    headers: {
      cookie: request.headers.get('cookie'),
      host: request.headers.get('host'),
      origin: request.headers.get('origin')
    }
  })
}

export async function POST() {
  try {
    // Create a test token
    const token = jwt.sign(
      { userId: 'test-user-id', email: 'test@example.com' },
      JWT_SECRET as string,
      { expiresIn: '24h' }
    )
    
    const response = NextResponse.json({
      success: true,
      message: 'Test token created',
      tokenPreview: token.substring(0, 20) + '...'
    })
    
    // Set cookie with different configurations to test
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: false, // Force false for testing
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/'
    })
    
    // Also set a test cookie
    response.cookies.set('test-cookie', 'test-value', {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/'
    })
    
    return response
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}