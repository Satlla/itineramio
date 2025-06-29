import { NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET() {
  try {
    console.log('🧹 Database cleanup started...')
    
    // Delete all verification tokens first
    await prisma.emailVerificationToken.deleteMany({})
    console.log('✅ Cleared verification tokens')
    
    // Delete all users except demo
    const result = await prisma.user.deleteMany({
      where: {
        email: {
          not: 'demo@itineramio.com'
        }
      }
    })
    
    console.log(`✅ Deleted ${result.count} users`)
    
    // Get remaining users
    const remainingUsers = await prisma.user.findMany({
      select: { email: true }
    })
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} users successfully`,
      deletedCount: result.count,
      remainingUsers: remainingUsers.map(u => u.email)
    })
    
  } catch (error) {
    console.error('Database cleanup error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}