import { NextRequest, NextResponse } from 'next/server'
import * as jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'itineramio-secret-key-2024'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Auth - Starting diagnosis...')
    
    // Check if we have a token
    const token = request.cookies.get('auth-token')?.value
    console.log('Token exists:', !!token)
    console.log('Token length:', token?.length || 0)
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'No auth token found',
        debug: {
          hasToken: false,
          cookieNames: request.cookies.getAll().map(cookie => cookie.name),
          totalCookies: request.cookies.getAll().length
        }
      })
    }
    
    // Try to decode without verification first
    let decoded: any = null
    let decodedWithoutVerify: any = null
    
    try {
      decodedWithoutVerify = jwt.decode(token)
      console.log('Decoded without verification:', decodedWithoutVerify)
    } catch (decodeError) {
      console.log('Failed to decode token:', decodeError)
    }
    
    // Try to verify with current secret
    try {
      decoded = jwt.verify(token, JWT_SECRET)
      console.log('Token verified successfully:', decoded)
    } catch (verifyError) {
      console.log('Token verification failed:', verifyError)
      
      return NextResponse.json({
        success: false,
        error: 'Token verification failed',
        debug: {
          hasToken: true,
          decodedWithoutVerify,
          verifyError: verifyError instanceof Error ? {
            name: verifyError.name,
            message: verifyError.message
          } : 'Unknown error',
          jwtSecretLength: JWT_SECRET.length,
          jwtSecretFromEnv: !!process.env.JWT_SECRET
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      debug: {
        hasToken: true,
        tokenDecoded: true,
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        issuedAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : null,
        expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null,
        isExpired: decoded.exp ? (Date.now() / 1000) > decoded.exp : false,
        jwtSecretFromEnv: !!process.env.JWT_SECRET
      }
    })
    
  } catch (error) {
    console.error('💥 Auth debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}