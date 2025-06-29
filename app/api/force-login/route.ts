import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../src/lib/prisma'

const JWT_SECRET = 'itineramio-secret-key-2024'

export async function GET() {
  try {
    // Get alejandrosatlla user
    const user = await prisma.user.findUnique({
      where: { email: 'alejandrosatlla@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Create token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    // Create response with redirect
    const response = NextResponse.redirect(new URL('/main', 'https://itineramio.com'))
    
    // Set cookie
    response.cookies.set({
      name: 'auth-token',
      value: token,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: 'lax',
      secure: false
    })
    
    return response
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}