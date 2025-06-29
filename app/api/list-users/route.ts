import { NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET() {
  try {
    // Get all users with limited info for privacy
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        status: true,
        createdAt: true,
        role: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Count email verification tokens
    const tokenCount = await prisma.emailVerificationToken.count()
    
    // Get users created in last 24 hours
    const recentUsers = users.filter(user => {
      const hoursSinceCreation = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60)
      return hoursSinceCreation < 24
    })

    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      recentUsers: recentUsers.length,
      verificationTokens: tokenCount,
      users: users.map(user => ({
        ...user,
        emailMasked: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        isVerified: !!user.emailVerified
      }))
    })
  } catch (error) {
    console.error('Error listing users:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}