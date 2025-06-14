import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Delete all email verification tokens first
    await prisma.emailVerificationToken.deleteMany({})
    console.log('✅ All email verification tokens deleted')
    
    // Delete all users
    const deletedUsers = await prisma.user.deleteMany({})
    console.log(`✅ ${deletedUsers.count} users deleted`)
    
    return NextResponse.json({
      success: true,
      message: 'All users and verification tokens deleted successfully',
      deletedUsers: deletedUsers.count
    })
    
  } catch (error) {
    console.error('Error deleting users:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}