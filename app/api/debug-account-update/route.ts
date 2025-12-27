import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'itineramio-secret-key-2024'

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG ACCOUNT UPDATE ===')
    
    // Check headers
    const headers = Object.fromEntries(request.headers.entries())
    console.log('Request headers:', {
      'content-type': headers['content-type'],
      'user-agent': headers['user-agent'],
      'cookie': headers['cookie'] ? 'Present' : 'Missing'
    })
    
    // Check auth token
    const token = request.cookies.get('auth-token')?.value
    console.log('Auth token present:', !!token)
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
        console.log('Token decoded successfully, userId:', decoded.userId)
      } catch (jwtError) {
        console.log('JWT error:', jwtError)
      }
    }
    
    // Check request body
    let body: any
    try {
      body = await request.json()
      console.log('Request body parsed successfully')
      console.log('Body keys:', Object.keys(body))
      console.log('Body values:', JSON.stringify(body, null, 2))
      
      // Check each field
      const fields = ['firstName', 'lastName', 'email', 'phone', 'profileImage']
      fields.forEach(field => {
        const value = body[field]
        console.log(`${field}:`, {
          value,
          type: typeof value,
          length: typeof value === 'string' ? value.length : 'N/A',
          trimmed: typeof value === 'string' ? value.trim() : 'N/A'
        })
      })
      
    } catch (parseError) {
      console.log('Body parse error:', parseError)
      return NextResponse.json({ 
        error: 'Failed to parse body',
        details: parseError instanceof Error ? parseError.message : 'Unknown error'
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Debug completed - check server logs',
      receivedData: {
        hasToken: !!token,
        bodyKeys: Object.keys(body || {}),
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.log('Debug endpoint error:', error)
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}