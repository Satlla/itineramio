import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '../../../src/lib/auth'

export async function GET(request: NextRequest) {
  console.log('=== COOKIE DEBUG ===')
  
  try {
    // Get all cookies
    const allCookies = request.cookies.getAll()
    console.log('All cookies:', allCookies)
    
    // Get auth token specifically
    const authToken = request.cookies.get('auth-token')?.value
    console.log('Auth token present:', !!authToken)
    console.log('Auth token length:', authToken?.length)
    
    if (authToken) {
      console.log('First 20 chars of token:', authToken.substring(0, 20) + '...')
      
      try {
        const decoded = verifyToken(authToken)
        console.log('Token verification successful:', {
          userId: decoded.userId,
          email: decoded.email,
          exp: decoded.exp ? new Date(decoded.exp * 1000) : 'No expiry'
        })
        
        return NextResponse.json({
          success: true,
          tokenPresent: true,
          tokenValid: true,
          decoded: {
            userId: decoded.userId,
            email: decoded.email,
            exp: decoded.exp ? new Date(decoded.exp * 1000) : null
          },
          allCookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value }))
        })
        
      } catch (verifyError) {
        console.log('Token verification failed:', verifyError)
        return NextResponse.json({
          success: false,
          tokenPresent: true,
          tokenValid: false,
          error: verifyError instanceof Error ? verifyError.message : 'Unknown error',
          allCookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value }))
        })
      }
    } else {
      return NextResponse.json({
        success: false,
        tokenPresent: false,
        tokenValid: false,
        allCookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value }))
      })
    }
    
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}