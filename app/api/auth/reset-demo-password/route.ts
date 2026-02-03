import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../src/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    // Requiere autenticación de admin
    const adminAuth = await requireAdminAuth(request)
    if (adminAuth instanceof Response) {
      return adminAuth
    }

    console.log('🔑 Resetting demo password by admin:', adminAuth.adminId)
    
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