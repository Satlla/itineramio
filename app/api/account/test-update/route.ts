import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'itineramio-secret-key-2024'

export async function POST(request: NextRequest) {
  console.log('=== TEST UPDATE ENDPOINT ===')
  
  try {
    // Check auth
    const token = request.cookies.get('auth-token')?.value
    console.log('Token present:', !!token)
    
    if (!token) {
      console.log('No token - returning 401')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let decoded: { userId: string }
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      console.log('Token valid, userId:', decoded.userId)
    } catch (jwtError) {
      console.log('JWT error:', jwtError)
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }
    
    // Parse body
    let body: any
    try {
      body = await request.json()
      console.log('Body parsed successfully:', JSON.stringify(body, null, 2))
    } catch (parseError) {
      console.log('Body parse error:', parseError)
      return NextResponse.json({ error: 'Error parsing body' }, { status: 400 })
    }

    // Simple validation
    const { email } = body
    if (!email) {
      console.log('Missing email field')
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    console.log('All checks passed - returning success')
    return NextResponse.json({ 
      success: true,
      message: 'Test endpoint working',
      userId: decoded.userId,
      receivedEmail: email
    })

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ 
      error: 'Server error: ' + (error instanceof Error ? error.message : 'Unknown')
    }, { status: 500 })
  }
}