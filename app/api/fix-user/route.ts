import { NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Hash the password "123456"
    const hashedPassword = await bcrypt.hash('123456', 12)
    
    // Update user with new password and verify email
    const user = await prisma.user.update({
      where: { email: 'colaboracionesbnb@gmail.com' },
      data: {
        password: hashedPassword,
        emailVerified: new Date(),
        status: 'ACTIVE'
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'User fixed successfully',
      user: {
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        status: user.status
      },
      credentials: {
        email: 'colaboracionesbnb@gmail.com',
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