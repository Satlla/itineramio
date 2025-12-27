import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({
        error: 'Email parameter is required'
      }, { status: 400 })
    }

    // Safety check - don't delete demo user
    if (email === 'demo@itineramio.com') {
      return NextResponse.json({
        error: 'Cannot delete demo user'
      }, { status: 400 })
    }

    // Delete verification tokens first
    const deletedTokens = await prisma.emailVerificationToken.deleteMany({
      where: { email }
    })

    // Delete user
    const deletedUser = await prisma.user.delete({
      where: { email }
    }).catch(error => {
      if (error.code === 'P2025') {
        return null // User not found
      }
      throw error
    })

    return NextResponse.json({
      success: true,
      message: deletedUser ? 'User deleted' : 'User not found',
      deletedTokens: deletedTokens.count,
      email
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}