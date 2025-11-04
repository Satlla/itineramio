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
    const { attemptId, answers } = body

    if (!attemptId || !answers) {
      return NextResponse.json({ error: 'attemptId y answers son requeridos' }, { status: 400 })
    }

    // Get attempt with quiz and questions
    const attempt = await prisma.academyUserQuizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })

    if (!attempt) {
      return NextResponse.json({ error: 'Intento no encontrado' }, { status: 404 })
    }

    if (attempt.userId !== session.userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    if (attempt.completedAt) {
      return NextResponse.json({ error: 'Este examen ya ha sido enviado' }, { status: 400 })
    }

    // Calculate score
    let totalPoints = 0
    let earnedPoints = 0
    const results: Array<{
      questionId: string
      userAnswer: number | null
      correctAnswer: number
      isCorrect: boolean
      explanation: string
    }> = []

    for (const answer of answers) {
      const question = attempt.quiz.questions.find(q => q.id === answer.questionId)

      if (!question) continue

      totalPoints += question.points
      const isCorrect = answer.selectedAnswer === question.correctAnswer

      if (isCorrect) {
        earnedPoints += question.points
      }

      results.push({
        questionId: question.id,
        userAnswer: answer.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation || ''
      })

      // Store individual answer
      await prisma.academyUserQuizAnswer.create({
        data: {
          attemptId: attempt.id,
          questionId: question.id,
          selectedAnswer: answer.selectedAnswer,
          isCorrect
        }
      })
    }

    const scorePercentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
    const passed = scorePercentage >= attempt.quiz.passingScore

    // Update attempt
    await prisma.academyUserQuizAttempt.update({
      where: { id: attemptId },
      data: {
        completedAt: new Date(),
        score: scorePercentage,
        passed
      }
    })

    // Award points if passed and this is first time passing
    if (passed) {
      // Check if user has passed this quiz before
      const previousPasses = await prisma.academyUserQuizAttempt.count({
        where: {
          userId: session.userId,
          quizId: attempt.quizId,
          passed: true,
          id: { not: attemptId }
        }
      })

      // Only award points if this is the first time passing
      if (previousPasses === 0) {
        await prisma.academyUser.update({
          where: { id: session.userId },
          data: {
            academyPoints: { increment: attempt.quiz.points },
            lastActivityAt: new Date()
          }
        })
      }
    }

    return NextResponse.json({
      score: scorePercentage,
      passed,
      totalPoints,
      earnedPoints,
      answers: results
    })
  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json(
      { error: 'Error al enviar el examen' },
      { status: 500 }
    )
  }
}
