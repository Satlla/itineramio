import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({
        error: 'Email parameter is required'
      }, { status: 400 })
    }

    console.log('🔥 FORCE DELETE USER:', email)

    // Delete all related data in order
    
    // 1. Delete verification tokens
    const deletedTokens = await prisma.emailVerificationToken.deleteMany({
      where: { email }
    })
    console.log('✅ Deleted tokens:', deletedTokens.count)

    // 2. Find user first
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        properties: true,
        propertySets: true
      }
    })

    if (user) {
      // 3. Delete user's properties
      if (user.properties.length > 0) {
        await prisma.property.deleteMany({
          where: { hostId: user.id }
        })
        console.log('✅ Deleted properties:', user.properties.length)
      }

      // 4. Delete user's property sets
      if (user.propertySets.length > 0) {
        await prisma.propertySet.deleteMany({
          where: { hostId: user.id }
        })
        console.log('✅ Deleted property sets:', user.propertySets.length)
      }

      // 5. Finally delete the user
      await prisma.user.delete({
        where: { email }
      })
      console.log('✅ User deleted successfully')
    }

    // Double check if user still exists
    const checkUser = await prisma.user.findUnique({
      where: { email }
    })

    return NextResponse.json({
      success: true,
      message: 'Force delete completed',
      userExisted: !!user,
      userStillExists: !!checkUser,
      deletedTokens: deletedTokens.count,
      email
    })

  } catch (error) {
    console.error('❌ Force delete error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code
    }, { status: 500 })
  }
}