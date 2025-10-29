import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'

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

    // Onboarding completion is tracked via localStorage on client
    // This endpoint exists for future database tracking if needed
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
