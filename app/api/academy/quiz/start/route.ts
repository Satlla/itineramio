import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { getAcademySession } from '../../../../../src/lib/academy/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getAcademySession()

    if (!session?.userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { quizId } = body

    if (!quizId) {
      return NextResponse.json({ error: 'quizId es requerido' }, { status: 400 })
    }

    // Get quiz details
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: {
        maxAttempts: true
      }
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Examen no encontrado' }, { status: 404 })
    }

    // Check if user has reached max attempts
    if (quiz.maxAttempts !== null) {
      const attemptCount = await prisma.academyUserQuizAttempt.count({
        where: {
          userId: session.userId,
          quizId
        }
      })

      if (attemptCount >= quiz.maxAttempts) {
        return NextResponse.json(
          { error: 'Has alcanzado el número máximo de intentos' },
          { status: 403 }
        )
      }
    }

    // Create new attempt
    const attempt = await prisma.academyUserQuizAttempt.create({
      data: {
        userId: session.userId,
        quizId,
        startedAt: new Date(),
        score: 0,
        passed: false
      }
    })

    return NextResponse.json({ attemptId: attempt.id })
  } catch (error) {
    console.error('Error starting quiz:', error)
    return NextResponse.json(
      { error: 'Error al iniciar el examen' },
      { status: 500 }
    )
  }
}
