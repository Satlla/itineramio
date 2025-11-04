import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/src/lib/prisma'

export async function GET(request: NextRequest) {
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
        academyProgress: {
          where: { completed: true }
        },
        quizAttempts: true,
        achievements: {
          include: {
            achievement: true
          },
          orderBy: {
            unlockedAt: 'desc'
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Obtener total de lecciones
    const totalLessons = await prisma.lesson.count({
      where: { published: true }
    })

    // Calcular promedio de quizzes
    const passedQuizzes = user.quizAttempts.filter((q) => q.passed)
    const averageQuizScore =
      passedQuizzes.length > 0
        ? Math.round(
            passedQuizzes.reduce((sum, q) => sum + q.score, 0) /
              passedQuizzes.length
          )
        : 0

    // Obtener posición en el ranking
    const rankPosition = await prisma.user.count({
      where: {
        academyPoints: {
          gt: user.academyPoints
        }
      }
    })

    // Formatear logros
    const achievements = user.achievements.map((ua) => ({
      id: ua.achievement.id,
      title: ua.achievement.title,
      description: ua.achievement.description,
      icon: ua.achievement.icon || 'Award',
      badge: ua.achievement.badge || undefined,
      rarity: ua.achievement.rarity,
      points: ua.achievement.points,
      unlockedAt: ua.unlockedAt.toISOString()
    }))

    // Generar datos de progreso histórico (últimos 30 días)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const progressHistory = await prisma.academyProgress.groupBy({
      by: ['completedAt'],
      where: {
        userId: user.id,
        completed: true,
        completedAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: true
    })

    // Crear array de los últimos 30 días con puntos acumulados
    const historyMap = new Map<string, number>()
    let cumulativePoints = 0

    // Obtener puntos por lección
    const lessons = await prisma.lesson.findMany({
      where: {
        id: {
          in: user.academyProgress
            .filter((p) => p.completed && p.completedAt)
            .map((p) => p.lessonId)
        }
      },
      select: {
        id: true,
        points: true
      }
    })

    const lessonPointsMap = new Map(lessons.map((l) => [l.id, l.points]))

    // Ordenar progreso por fecha
    const sortedProgress = user.academyProgress
      .filter((p) => p.completed && p.completedAt)
      .sort(
        (a, b) =>
          (a.completedAt?.getTime() || 0) - (b.completedAt?.getTime() || 0)
      )

    // Calcular puntos acumulados por día
    sortedProgress.forEach((progress) => {
      if (progress.completedAt) {
        const dateKey = progress.completedAt.toISOString().split('T')[0]
        const points = lessonPointsMap.get(progress.lessonId) || 0
        cumulativePoints += points
        historyMap.set(dateKey, cumulativePoints)
      }
    })

    // Generar array de los últimos 30 días
    const progressHistoryData = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      const points = historyMap.get(dateKey) || cumulativePoints

      progressHistoryData.push({
        date: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        points
      })
    }

    // Verificar si tiene certificado (completó todas las lecciones)
    const hasCertificate = user.academyProgress.length === totalLessons

    return NextResponse.json({
      username: user.username || `Usuario${user.id.substring(0, 8)}`,
      avatar: user.avatar || undefined,
      enrolledAt: user.academyEnrolledAt?.toISOString() || user.createdAt.toISOString(),
      stats: {
        points: user.academyPoints,
        streak: user.academyStreak,
        completedLessons: user.academyProgress.length,
        totalLessons,
        completedQuizzes: passedQuizzes.length,
        averageQuizScore,
        rankPosition: rankPosition + 1
      },
      achievements,
      progressHistory: progressHistoryData,
      hasCertificate,
      certificateUrl: hasCertificate ? `/api/academia/certificate` : undefined
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Error al obtener el perfil' },
      { status: 500 }
    )
  }
}
