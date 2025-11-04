import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/src/lib/prisma'

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

    const lessonId = params.id

    // Buscar la lección
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lección no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si ya existe progreso
    let progress = await prisma.academyProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: lessonId
        }
      }
    })

    const wasAlreadyCompleted = progress?.completed || false

    if (!progress) {
      // Crear nuevo progreso
      progress = await prisma.academyProgress.create({
        data: {
          userId: user.id,
          lessonId: lessonId,
          completed: true,
          completedAt: new Date(),
          lastAccessedAt: new Date()
        }
      })
    } else if (!progress.completed) {
      // Actualizar progreso existente
      progress = await prisma.academyProgress.update({
        where: {
          userId_lessonId: {
            userId: user.id,
            lessonId: lessonId
          }
        },
        data: {
          completed: true,
          completedAt: new Date(),
          lastAccessedAt: new Date()
        }
      })
    }

    // Si ya estaba completada, no dar puntos ni actualizar racha
    if (wasAlreadyCompleted) {
      return NextResponse.json({
        success: true,
        points: 0,
        streak: user.academyStreak,
        achievements: []
      })
    }

    // Actualizar puntos del usuario
    const newPoints = (user.academyPoints || 0) + lesson.points

    // Actualizar racha (verificar si es el mismo día o consecutivo)
    let newStreak = user.academyStreak || 0
    const lastActivity = user.lastAcademyActivityAt
    const now = new Date()

    if (lastActivity) {
      const daysDiff = Math.floor(
        (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysDiff === 1) {
        // Día consecutivo
        newStreak++
      } else if (daysDiff > 1) {
        // Rompió la racha
        newStreak = 1
      }
      // Si es el mismo día, mantener la racha
    } else {
      // Primera actividad
      newStreak = 1
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        academyPoints: newPoints,
        academyStreak: newStreak,
        lastAcademyActivityAt: now
      }
    })

    // Verificar y otorgar logros
    const achievements = await checkAndGrantAchievements(user.id)

    return NextResponse.json({
      success: true,
      points: lesson.points,
      totalPoints: newPoints,
      streak: newStreak,
      achievements: achievements.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        points: a.points
      }))
    })
  } catch (error) {
    console.error('Error completing lesson:', error)
    return NextResponse.json(
      { error: 'Error al completar la lección' },
      { status: 500 }
    )
  }
}

async function checkAndGrantAchievements(userId: string) {
  const newAchievements = []

  // Obtener el conteo de lecciones completadas
  const completedCount = await prisma.academyProgress.count({
    where: {
      userId,
      completed: true
    }
  })

  // Obtener el usuario actualizado
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      achievements: {
        include: {
          achievement: true
        }
      }
    }
  })

  if (!user) return newAchievements

  const hasAchievement = (code: string) =>
    user.achievements.some((ua) => ua.achievement.code === code)

  // FIRST_LESSON - Primera lección completada
  if (completedCount === 1 && !hasAchievement('FIRST_LESSON')) {
    const achievement = await prisma.achievement.findUnique({
      where: { code: 'FIRST_LESSON' }
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

  // LESSON_STREAK_3 - 3 días consecutivos
  if (user.academyStreak >= 3 && !hasAchievement('LESSON_STREAK_3')) {
    const achievement = await prisma.achievement.findUnique({
      where: { code: 'LESSON_STREAK_3' }
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

  // LESSON_STREAK_7 - 7 días consecutivos
  if (user.academyStreak >= 7 && !hasAchievement('LESSON_STREAK_7')) {
    const achievement = await prisma.achievement.findUnique({
      where: { code: 'LESSON_STREAK_7' }
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

  // COMPLETE_MODULE - Completó un módulo completo
  const modules = await prisma.module.findMany({
    where: { published: true },
    include: {
      lessons: {
        where: { published: true }
      }
    }
  })

  for (const module of modules) {
    const moduleLessonsCount = module.lessons.length
    const completedInModule = await prisma.academyProgress.count({
      where: {
        userId,
        completed: true,
        lessonId: {
          in: module.lessons.map((l) => l.id)
        }
      }
    })

    if (
      moduleLessonsCount > 0 &&
      completedInModule === moduleLessonsCount &&
      !hasAchievement(`MODULE_${module.slug.toUpperCase()}`)
    ) {
      // Buscar o crear logro para este módulo
      let achievement = await prisma.achievement.findUnique({
        where: { code: `MODULE_${module.slug.toUpperCase()}` }
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

  return newAchievements
}
