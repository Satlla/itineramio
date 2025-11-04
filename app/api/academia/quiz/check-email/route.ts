import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { isDisposableEmail } from '../../../../../src/lib/disposable-emails'

/**
 * POST /api/academia/quiz/check-email
 * Verifica si un email ya ha completado el quiz
 * También valida si es un email desechable en el servidor
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Server-side check for disposable email
    if (isDisposableEmail(email)) {
      return NextResponse.json(
        { error: 'Email temporal no permitido' },
        { status: 400 }
      )
    }

    // Check if this email has already completed the quiz (in QuizLead table)
    const existingQuizLead = await prisma.quizLead.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
        completedAt: true
      }
    })

    // If email already has a quiz lead entry, deny access
    if (existingQuizLead) {
      return NextResponse.json({
        alreadyTaken: true,
        message: 'Este email ya ha completado el quiz'
      })
    }

    // Also check in AcademyUser (for backward compatibility)
    const existingUser = await prisma.academyUser.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        quizCompletedAt: true,
        quizScore: true
      }
    })

    // If user exists and has completed the quiz, deny access
    if (existingUser && existingUser.quizCompletedAt !== null) {
      return NextResponse.json({
        alreadyTaken: true,
        message: 'Este email ya ha completado el quiz'
      })
    }

    // Email is valid and has not taken the quiz
    return NextResponse.json({
      alreadyTaken: false,
      message: 'Email válido, puede realizar el quiz'
    })

  } catch (error) {
    console.error('Check email error:', error)
    return NextResponse.json(
      { error: 'Error al verificar email' },
      { status: 500 }
    )
  }
}
