import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('=== AUTH ME REQUEST ===')
    const token = request.cookies.get('auth-token')?.value
    console.log('Token present:', !!token)
    console.log('Token length:', token?.length)

    if (!token) {
      console.log('No token provided')
      return NextResponse.json({
        success: false,
        error: 'No authentication token provided'
      }, { status: 401 })
    }

    console.log('Attempting to verify token...')
    const decoded = verifyToken(token)
    console.log('Token decoded successfully:', { userId: decoded.userId, email: decoded.email })
    
    // Set JWT claims for PostgreSQL RLS policies
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        phone: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Auth verification error:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json({ 
      error: 'Invalid token',
      debug: error instanceof Error ? {
        name: error.name,
        message: error.message
      } : 'Unknown error'
    }, { status: 401 })
  }
}