import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../src/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}

export async function GET() {
  try {
    // Get alejandrosatlla user
    const user = await prisma.user.findUnique({
      where: { email: 'alejandrosatlla@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        status: true
      }
    })
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        email: 'alejandrosatlla@gmail.com'
      }, { status: 404 })
    }
    
    // Create token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    // Create magic link
    const magicLink = `https://www.itineramio.com/api/auth-redirect?token=${token}`
    
    return NextResponse.json({
      success: true,
      message: 'Magic link generated',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        verified: !!user.emailVerified,
        status: user.status
      },
      magicLink,
      token,
      instructions: 'Copy the magicLink URL and paste it in your browser'
    })
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}