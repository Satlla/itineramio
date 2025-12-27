import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

/**
 * POST /api/academia/quiz/check-verification
 * Verifica si un email ha sido verificado
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    // Check if email has been verified in QuizLead table
    const lead = await prisma.quizLead.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        emailVerified: true
      },
      select: {
        id: true,
        emailVerified: true,
        verifiedAt: true
      }
    })

    return NextResponse.json({
      verified: !!lead,
      verifiedAt: lead?.verifiedAt || null
    })

  } catch (error) {
    console.error('Check verification error:', error)
    return NextResponse.json(
      { error: 'Error al verificar estado' },
      { status: 500 }
    )
  }
}
