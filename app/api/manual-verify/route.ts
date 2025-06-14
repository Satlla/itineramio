import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email') || 'colaboracionesbnb@gmail.com'
    
    // Hash password "123456"
    const hashedPassword = await bcrypt.hash('123456', 12)
    
    // Find and update user
    const user = await prisma.user.update({
      where: { email: email },
      data: {
        password: hashedPassword,
        emailVerified: new Date(),
        status: 'ACTIVE'
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'User verified and password reset successfully',
      user: {
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        status: user.status
      },
      credentials: {
        email: user.email,
        password: '123456'
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}