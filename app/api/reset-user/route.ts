import { NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Hash password "123456"
    const hashedPassword = await bcrypt.hash('123456', 12)
    
    // Update or create user
    const user = await prisma.user.upsert({
      where: { email: 'colaboracionesbnb@gmail.com' },
      update: {
        password: hashedPassword,
        emailVerified: new Date(),
        status: 'ACTIVE'
      },
      create: {
        email: 'colaboracionesbnb@gmail.com',
        name: 'Test User',
        password: hashedPassword,
        emailVerified: new Date(),
        status: 'ACTIVE'
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'User ready for login',
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