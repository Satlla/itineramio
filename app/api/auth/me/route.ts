import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    console.log('Auth check - token exists:', !!token)

    if (!token) {
      // For development, create a simple auto-login
      const demoUser = {
        id: 'demo-user-id',
        name: 'Demo User',
        email: 'demo@itineramio.com'
      }
      
      // Create a token for the demo user
      const demoToken = jwt.sign(
        { userId: 'demo-user-id' },
        JWT_SECRET,
        { expiresIn: '24h' }
      )
      
      const response = NextResponse.json({ user: demoUser })
      response.cookies.set('auth-token', demoToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60,
        path: '/'
      })
      
      console.log('Auto-login for development - created demo user session')
      return response
    }

    console.log('Verifying token:', token.substring(0, 20) + '...')
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    console.log('Token decoded, userId:', decoded.userId)
    
    // For demo user, return without DB lookup
    if (decoded.userId === 'demo-user-id') {
      const demoUser = {
        id: 'demo-user-id',
        name: 'Demo User',
        email: 'demo@itineramio.com'
      }
      console.log('Auth successful for demo user')
      return NextResponse.json({ user: demoUser })
    }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    if (!user) {
      console.log('User not found for id:', decoded.userId)
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    console.log('Auth successful for user:', user.email)
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Auth verification error:', error)
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}