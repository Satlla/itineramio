import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Manually verify colaboracionesbnb@gmail.com
    const user = await prisma.user.update({
      where: { email: 'colaboracionesbnb@gmail.com' },
      data: {
        emailVerified: new Date(),
        status: 'ACTIVE'
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'User verified successfully',
      user: {
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        status: user.status
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}