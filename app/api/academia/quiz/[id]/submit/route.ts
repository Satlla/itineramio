import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/src/lib/prisma'

interface SubmitAnswer {
  questionId: string
  selectedAnswer: number
}

interface SubmitBody {
  answers: SubmitAnswer[]
  timeSpent: number
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const quizId = params.id
    const body: SubmitBody = await request.json()
    const { answers, timeSpent } = body

    // Buscar el quiz con sus preguntas
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
        module: {
          select: {
            id: true,
            slug: true,
            courseId: true
          }
        }
      }
    })

    if (!quiz) {
      return NextResponse.json(
        { error: 'Examen no encontrado' },
        { status: 404 }
      )
    }

    // Verificar límite de intentos
    if (quiz.maxAttempts) {
      const attemptCount = await prisma.quizAttempt.count({
        where: {
          userId: user.id,
          quizId: quizId
        }
      })

      if (attemptCount >= quiz.maxAttempts) {
        return NextResponse.json(
          { error: 'Has alcanzado el número máximo de intentos' },
          { status: 403 }
        )
      }
    }

    // Calcular score
    let correctAnswers = 0
    let totalPoints = 0
    let earnedPoints = 0

    const answerRecords = answers.map((answer) => {
      const question = quiz.questions.find((q) => q.id === answer.questionId)
      if (!question) return null

      const isCorrect = answer.selectedAnswer === question.correctAnswer
      totalPoints += question.points

      if (isCorrect) {
        correctAnswers++
        earnedPoints += question.points
      }

      return {
        questionId: question.id,
        selectedAnswer: answer.selectedAnswer,
        isCorrect
      }
    }).filter((a) => a !== null) as {
      questionId: string
      selectedAnswer: number
      isCorrect: boolean
    }[]

    // Calcular porcentaje
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
    const passed = score >= quiz.passingScore

    // Crear intento de quiz
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId: quizId,
        score,
        passed,
        completedAt: new Date(),
        timeSpent
      }
    })

    // Guardar respuestas individuales
    await prisma.quizAnswer.createMany({
      data: answerRecords.map((record) => ({
        attemptId: attempt.id,
        questionId: record.questionId,
        selectedAnswer: record.selectedAnswer,
        isCorrect: record.isCorrect
      }))
    })

    // Si aprobó, otorgar puntos
    let pointsEarned = 0
    if (passed) {
      // Verificar si ya había aprobado antes
      const previousPassedAttempt = await prisma.quizAttempt.findFirst({
        where: {
          userId: user.id,
          quizId: quizId,
          passed: true,
          id: {
            not: attempt.id
          }
        }
      })

      // Solo otorgar puntos si es la primera vez que aprueba
      if (!previousPassedAttempt) {
        pointsEarned = quiz.points

        await prisma.user.update({
          where: { id: user.id },
          data: {
            academyPoints: {
              increment: pointsEarned
            },
            lastAcademyActivityAt: new Date()
          }
        })
      }
    }

    // Verificar y otorgar logros
    const achievements = await checkAndGrantAchievements(user.id, quizId, score, passed)

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score: Math.round(score * 100) / 100, // Redondear a 2 decimales
      passed,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      pointsEarned,
      totalPoints: (user.academyPoints || 0) + pointsEarned,
      achievements: achievements.map((a) => ({
        id: a.id,
        code: a.code,
        title: a.title,
        description: a.description,
        points: a.points,
        rarity: a.rarity
      }))
    })
  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json(
      { error: 'Error al enviar el examen' },
      { status: 500 }
    )
  }
}

async function checkAndGrantAchievements(
  userId: string,
  quizId: string,
  score: number,
  passed: boolean
) {
  const newAchievements = []

  // Obtener el usuario con sus logros
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      achievements: {
        include: {
          achievement: true
        }
      },
      quizAttempts: {
        where: { passed: true },
        include: { quiz: true }
      }
    }
  })

  if (!user) return newAchievements

  const hasAchievement = (code: string) =>
    user.achievements.some((ua) => ua.achievement.code === code)

  // PERFECT_SCORE - Obtener 100% en un examen
  if (score === 100 && !hasAchievement('PERFECT_SCORE')) {
    const achievement = await prisma.achievement.findUnique({
      where: { code: 'PERFECT_SCORE' }
    })

    if (achievement) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id
        }
      })

      await prisma.user.update({
        where: { id: userId },
        data: {
          academyPoints: {
            increment: achievement.points
          }
        }
      })

      newAchievements.push(achievement)
    }
  }

  // QUIZ_MASTER - Aprobar 5 exámenes
  if (passed) {
    const passedQuizzesCount = user.quizAttempts.length + 1 // +1 por el actual

    if (passedQuizzesCount >= 5 && !hasAchievement('QUIZ_MASTER')) {
      const achievement = await prisma.achievement.findUnique({
        where: { code: 'QUIZ_MASTER' }
      })

      if (achievement) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id
          }
        })

        await prisma.user.update({
          where: { id: userId },
          data: {
            academyPoints: {
              increment: achievement.points
            }
          }
        })

        newAchievements.push(achievement)
      }
    }

    // FIRST_QUIZ - Aprobar primer examen
    if (passedQuizzesCount === 1 && !hasAchievement('FIRST_QUIZ')) {
      const achievement = await prisma.achievement.findUnique({
        where: { code: 'FIRST_QUIZ' }
      })

      if (achievement) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id
          }
        })

        await prisma.user.update({
          where: { id: userId },
          data: {
            academyPoints: {
              increment: achievement.points
            }
          }
        })

        newAchievements.push(achievement)
      }
    }
  }

  // QUIZ_PERFECTIONIST - Obtener 100% en 3 exámenes diferentes
  if (score === 100) {
    const perfectScoreCount = await prisma.quizAttempt.count({
      where: {
        userId,
        score: 100,
        passed: true
      },
      distinct: ['quizId']
    })

    if (perfectScoreCount >= 3 && !hasAchievement('QUIZ_PERFECTIONIST')) {
      const achievement = await prisma.achievement.findUnique({
        where: { code: 'QUIZ_PERFECTIONIST' }
      })

      if (achievement) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id
          }
        })

        await prisma.user.update({
          where: { id: userId },
          data: {
            academyPoints: {
              increment: achievement.points
            }
          }
        })

        newAchievements.push(achievement)
      }
    }
  }

  // SPEED_DEMON - Completar un quiz en menos de la mitad del tiempo límite con 100%
  // (Este requeriría más lógica con el timeLimit del quiz)

  return newAchievements
}
