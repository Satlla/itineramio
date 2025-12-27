import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { signToken } from '../../../../src/lib/auth'
import * as jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    // Get the current token
    const currentToken = request.cookies.get('auth-token')?.value
    
    if (!currentToken) {
      return NextResponse.json({
        success: false,
        error: 'No token to refresh'
      }, { status: 401 })
    }

    // Decode without verification to get user info
    let decoded: any
    try {
      decoded = jwt.decode(currentToken)
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token format'
      }, { status: 400 })
    }

    if (!decoded || !decoded.userId) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token payload'
      }, { status: 400 })
    }

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true
      }
    })

    if (!user || !user.isActive) {
      return NextResponse.json({
        success: false,
        error: 'User not found or inactive'
      }, { status: 404 })
    }

    // Generate new token with current secret
    const newToken = signToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // Set the new token as a cookie
    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    })

    response.cookies.set('auth-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return response

  } catch (error) {
    console.error('Error refreshing token:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to refresh token'
    }, { status: 500 })
  }
}