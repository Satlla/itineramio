import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get and verify token
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { hasCompleted: false },
        { status: 200 }
      )
    }

    // Decode token to get user ID
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { hasCompleted: false },
        { status: 200 }
      )
    }

    // Check if user has completed onboarding
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { onboardingCompletedAt: true }
    })

    return NextResponse.json({
      hasCompleted: user?.onboardingCompletedAt !== null
    })
  } catch (error) {
    console.error('Error checking onboarding:', error)
    return NextResponse.json(
      { hasCompleted: false },
      { status: 200 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get and verify token
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Decode token to get user ID
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Update user's onboardingCompletedAt in database
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { onboardingCompletedAt: new Date() }
    })

    console.log(`✅ Onboarding completed for user ${decoded.userId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error completing onboarding:', error)
    return NextResponse.json(
      { error: 'Error al completar onboarding' },
      { status: 500 }
    )
  }
}
