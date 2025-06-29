import { NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET() {
  try {
    // Delete verification tokens for alejandrosatlla@gmail.com
    await prisma.emailVerificationToken.deleteMany({
      where: { email: 'alejandrosatlla@gmail.com' }
    })
    
    // Delete the user
    const deletedUser = await prisma.user.delete({
      where: { email: 'alejandrosatlla@gmail.com' }
    })
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      deletedUser: {
        email: deletedUser.email,
        name: deletedUser.name
      }
    })
    
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}