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

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all' // week, month, all

    // Calcular fecha de inicio según el periodo
    let dateFilter = {}
    const now = new Date()

    if (period === 'week') {
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      dateFilter = {
        lastAcademyActivityAt: {
          gte: weekAgo
        }
      }
    } else if (period === 'month') {
      const monthAgo = new Date(now)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      dateFilter = {
        lastAcademyActivityAt: {
          gte: monthAgo
        }
      }
    }

    // Obtener top 100 usuarios
    const users = await prisma.user.findMany({
      where: {
        academyPoints: {
          gt: 0
        },
        ...dateFilter
      },
      orderBy: {
        academyPoints: 'desc'
      },
      take: 100,
      select: {
        id: true,
        username: true,
        avatar: true,
        academyPoints: true,
        academyStreak: true,
        academyProgress: {
          where: {
            completed: true
          },
          select: {
            id: true
          }
        }
      }
    })

    // Preparar datos del leaderboard con posiciones
    const leaderboard = users.map((user, index) => ({
      position: index + 1,
      userId: user.id,
      username: user.username || `Usuario${user.id.substring(0, 8)}`,
      avatar: user.avatar || undefined,
      points: user.academyPoints,
      streak: user.academyStreak,
      completedLessons: user.academyProgress.length,
      isCurrentUser: user.id === currentUser.id
    }))

    // Si el usuario actual no está en el top 100, añadir su posición
    const currentUserInTop = leaderboard.find((u) => u.isCurrentUser)

    if (!currentUserInTop && currentUser.academyPoints > 0) {
      // Contar cuántos usuarios tienen más puntos
      const position = await prisma.user.count({
        where: {
          academyPoints: {
            gt: currentUser.academyPoints
          },
          ...dateFilter
        }
      })

      const completedLessonsCount = await prisma.academyProgress.count({
        where: {
          userId: currentUser.id,
          completed: true
        }
      })

      // Añadir el usuario actual al final
      leaderboard.push({
        position: position + 1,
        userId: currentUser.id,
        username: currentUser.username || `Usuario${currentUser.id.substring(0, 8)}`,
        avatar: currentUser.avatar || undefined,
        points: currentUser.academyPoints,
        streak: currentUser.academyStreak,
        completedLessons: completedLessonsCount,
        isCurrentUser: true
      })
    }

    return NextResponse.json({
      leaderboard,
      period,
      total: users.length
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Error al obtener el ranking' },
      { status: 500 }
    )
  }
}
