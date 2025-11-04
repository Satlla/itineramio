import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/src/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
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
      where: { email: session.user.email },
      include: {
        academyProgress: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Buscar el módulo
    const module = await prisma.module.findFirst({
      where: {
        slug: params.slug,
        published: true
      },
      include: {
        lessons: {
          where: { published: true },
          orderBy: { order: 'asc' }
        },
        quiz: true
      }
    })

    if (!module) {
      return NextResponse.json(
        { error: 'Módulo no encontrado' },
        { status: 404 }
      )
    }

    // Determinar el estado de cada lección
    const lessonsWithStatus = module.lessons.map((lesson, index) => {
      const progress = user.academyProgress.find(
        (p) => p.lessonId === lesson.id
      )

      let status: 'completed' | 'in-progress' | 'locked' = 'locked'

      if (progress?.completed) {
        status = 'completed'
      } else if (index === 0 || user.academyProgress.some(
        (p) => p.lessonId === module.lessons[index - 1]?.id && p.completed
      )) {
        status = 'in-progress'
      }

      return {
        id: lesson.id,
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description || '',
        duration: lesson.duration,
        points: lesson.points,
        order: lesson.order,
        status,
        coverImage: lesson.coverImage || undefined
      }
    })

    // Calcular progreso del módulo
    const completedLessons = lessonsWithStatus.filter(
      (l) => l.status === 'completed'
    ).length
    const progress = module.lessons.length > 0
      ? Math.round((completedLessons / module.lessons.length) * 100)
      : 0

    // Preparar datos del quiz si existe
    let quizData = undefined
    if (module.quiz) {
      const allLessonsCompleted = completedLessons === module.lessons.length

      // Verificar si ya pasó el quiz
      const quizAttempt = await prisma.quizAttempt.findFirst({
        where: {
          userId: user.id,
          quizId: module.quiz.id,
          passed: true
        }
      })

      quizData = {
        id: module.quiz.id,
        title: module.quiz.title,
        isUnlocked: allLessonsCompleted,
        passed: !!quizAttempt,
        points: module.quiz.points
      }
    }

    return NextResponse.json({
      id: module.id,
      title: module.title,
      slug: module.slug,
      description: module.description,
      icon: module.icon || 'BookOpen',
      progress,
      completedLessons,
      totalLessons: module.lessons.length,
      estimatedTime: module.estimatedTime,
      lessons: lessonsWithStatus,
      quiz: quizData
    })
  } catch (error) {
    console.error('Error fetching module:', error)
    return NextResponse.json(
      { error: 'Error al obtener el módulo' },
      { status: 500 }
    )
  }
}
