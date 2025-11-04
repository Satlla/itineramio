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
          include: {
            lesson: {
              include: {
                module: true
              }
            }
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

    // Obtener el curso principal
    const course = await prisma.course.findFirst({
      where: { published: true },
      include: {
        modules: {
          where: { published: true },
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              where: { published: true },
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json({
        overallProgress: 0,
        completedLessons: 0,
        totalLessons: 0,
        points: user.academyPoints || 0,
        streak: user.academyStreak || 0,
        nextLesson: null,
        modules: [],
        recentAchievements: [],
        leaderboardPreview: []
      })
    }

    // Calcular progreso general
    const totalLessons = course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0
    )
    const completedLessonsCount = user.academyProgress.filter(
      (p) => p.completed
    ).length
    const overallProgress = totalLessons > 0
      ? Math.round((completedLessonsCount / totalLessons) * 100)
      : 0

    // Encontrar la próxima lección
    let nextLesson = null
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        const progress = user.academyProgress.find(
          (p) => p.lessonId === lesson.id
        )
        if (!progress || !progress.completed) {
          nextLesson = {
            id: lesson.id,
            title: lesson.title,
            moduleTitle: module.title,
            moduleSlug: module.slug,
            lessonSlug: lesson.slug
          }
          break
        }
      }
      if (nextLesson) break
    }

    // Preparar datos de módulos con progreso
    const modulesWithProgress = course.modules.map((module) => {
      const moduleLessons = module.lessons
      const completedInModule = moduleLessons.filter((lesson) =>
        user.academyProgress.some(
          (p) => p.lessonId === lesson.id && p.completed
        )
      ).length

      const moduleProgress =
        moduleLessons.length > 0
          ? Math.round((completedInModule / moduleLessons.length) * 100)
          : 0

      return {
        id: module.id,
        title: module.title,
        slug: module.slug,
        icon: module.icon || 'BookOpen',
        progress: moduleProgress,
        completedLessons: completedInModule,
        totalLessons: moduleLessons.length,
        isUnlocked: true // Por ahora todos desbloqueados
      }
    })

    // Obtener logros recientes (últimos 5)
    const recentAchievements = await prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: {
        achievement: true
      },
      orderBy: { unlockedAt: 'desc' },
      take: 5
    })

    const formattedAchievements = recentAchievements.map((ua) => ({
      id: ua.achievement.id,
      title: ua.achievement.title,
      description: ua.achievement.description,
      icon: ua.achievement.icon || 'Award',
      rarity: ua.achievement.rarity,
      unlockedAt: ua.unlockedAt.toISOString()
    }))

    // Obtener top 5 del leaderboard
    const topUsers = await prisma.user.findMany({
      where: {
        academyPoints: { gt: 0 }
      },
      orderBy: { academyPoints: 'desc' },
      take: 5,
      select: {
        id: true,
        username: true,
        academyPoints: true
      }
    })

    const leaderboardPreview = topUsers.map((u, index) => ({
      position: index + 1,
      username: u.username || u.id.substring(0, 8),
      points: u.academyPoints,
      isCurrentUser: u.id === user.id
    }))

    return NextResponse.json({
      overallProgress,
      completedLessons: completedLessonsCount,
      totalLessons,
      points: user.academyPoints || 0,
      streak: user.academyStreak || 0,
      nextLesson,
      modules: modulesWithProgress,
      recentAchievements: formattedAchievements,
      leaderboardPreview
    })
  } catch (error) {
    console.error('Error fetching academy progress:', error)
    return NextResponse.json(
      { error: 'Error al obtener el progreso' },
      { status: 500 }
    )
  }
}
