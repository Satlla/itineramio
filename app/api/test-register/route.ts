import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    console.log('🧪 TEST REGISTER ENDPOINT')
    
    // Test database connection
    const userCount = await prisma.user.count()
    console.log('👥 Current user count:', userCount)
    
    // Test if we can query users
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@itineramio.com' }
    })
    console.log('🔍 Demo user exists:', !!demoUser)
    
    // Test password hashing
    const testPassword = 'Test1234'
    const hashedPassword = await bcrypt.hash(testPassword, 12)
    console.log('🔐 Password hashing works:', !!hashedPassword)
    
    // Test email verification token table
    const tokenCount = await prisma.emailVerificationToken.count()
    console.log('🎫 Token table accessible, count:', tokenCount)
    
    return NextResponse.json({
      success: true,
      tests: {
        databaseConnection: true,
        userCount,
        demoUserExists: !!demoUser,
        passwordHashingWorks: true,
        tokenTableAccessible: true,
        tokenCount
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasResendKey: !!process.env.RESEND_API_KEY,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      }
    })
  } catch (error) {
    console.error('❌ Test register error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error?.constructor?.name,
      tests: {
        databaseConnection: false
      }
    }, { status: 500 })
  }
}