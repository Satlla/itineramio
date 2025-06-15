import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../src/lib/prisma'

const JWT_SECRET = 'itineramio-secret-key-2024'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    console.log('Auth check - token exists:', !!token)

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'No authentication token provided'
      }, { status: 401 })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string }
    
    
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