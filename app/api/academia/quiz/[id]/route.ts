import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/src/lib/prisma'

export async function GET(
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

    // Buscar el quiz con sus preguntas
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        },
        module: {
          select: {
            id: true,
            slug: true,
            title: true
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

    if (!quiz.published) {
      return NextResponse.json(
        { error: 'Este examen no está disponible' },
        { status: 403 }
      )
    }

    // Obtener intentos anteriores del usuario
    const previousAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId: user.id,
        quizId: quizId
      },
      orderBy: {
        startedAt: 'desc'
      }
    })

    const attemptCount = previousAttempts.length
    const bestAttempt = previousAttempts.reduce((best, current) => {
      return current.score > (best?.score || 0) ? current : best
    }, previousAttempts[0])

    // Mapear preguntas sin revelar la respuesta correcta
    const questions = quiz.questions.map((q) => ({
      id: q.id,
      question: q.question,
      type: q.type,
      options: q.options as string[],
      correctAnswer: q.correctAnswer, // Necesario para el componente
      explanation: q.explanation,
      points: q.points
    }))

    return NextResponse.json({
      id: quiz.id,
      moduleId: quiz.module.id,
      moduleSlug: quiz.module.slug,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      timeLimit: quiz.timeLimit,
      maxAttempts: quiz.maxAttempts,
      points: quiz.points,
      questions,
      previousAttempts: attemptCount,
      previousBestScore: bestAttempt?.score || null
    })
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json(
      { error: 'Error al cargar el examen' },
      { status: 500 }
    )
  }
}
