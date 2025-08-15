import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔑 Resetting demo password...')
    
    const hashedPassword = await bcrypt.hash('demo123', 10)
    
    const updatedUser = await prisma.user.update({
      where: { email: 'demo@itineramio.com' },
      data: { 
        password: hashedPassword,
        status: 'ACTIVE',
        emailVerified: new Date()
      }
    })
    
    console.log('✅ Demo password updated!')
    
    return NextResponse.json({
      success: true,
      message: 'Demo password updated',
      user: {
        email: updatedUser.email,
        name: updatedUser.name
      }
    })
    
  } catch (error) {
    console.error('Error updating demo password:', error)
    return NextResponse.json({
      error: 'Failed to update password'
    }, { status: 500 })
  }
}