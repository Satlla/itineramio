import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin-auth'
import { cookies } from 'next/headers'

/**
 * GET - Obtener todos los usuarios inscritos en la academia
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const admin = await verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener usuarios con academyEnrolledAt definido
    const users = await prisma.user.findMany({
      where: {
        academyEnrolledAt: {
          not: null
        }
      },
      orderBy: {
        academyEnrolledAt: 'desc'
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        academyPoints: true,
        academyStreak: true,
        academyEnrolledAt: true,
        lastAcademyActivityAt: true,
        _count: {
          select: {
            academyProgress: true,
            quizAttempts: true
          }
        }
      }
    })

    // Formatear respuesta
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      fullName: user.name,
      username: user.username,
      academyPoints: user.academyPoints,
      academyStreak: user.academyStreak,
      enrolledAt: user.academyEnrolledAt,
      lastActivityAt: user.lastAcademyActivityAt,
      _count: {
        progress: user._count.academyProgress,
        quizAttempts: user._count.quizAttempts
      }
    }))

    return NextResponse.json({
      users: formattedUsers,
      total: formattedUsers.length
    })

  } catch (error) {
    console.error('Error fetching academy users:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuarios de academia' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Eliminar un usuario de la academia (no lo borra, solo resetea datos de academia)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const admin = await verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      )
    }

    // Eliminar datos relacionados con la academia
    await prisma.$transaction([
      // Eliminar progreso
      prisma.academyProgress.deleteMany({
        where: { userId }
      }),
      // Eliminar intentos de quiz
      prisma.quizAttempt.deleteMany({
        where: { userId }
      }),
      // Eliminar logros
      prisma.userAchievement.deleteMany({
        where: { userId }
      }),
      // Resetear campos de academia en el usuario
      prisma.user.update({
        where: { id: userId },
        data: {
          username: null,
          academyEnrolledAt: null,
          academyPoints: 0,
          academyStreak: 0,
          lastAcademyActivityAt: null
        }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado de la academia exitosamente'
    })

  } catch (error) {
    console.error('Error deleting academy user:', error)
    return NextResponse.json(
      { error: 'Error al eliminar usuario de la academia' },
      { status: 500 }
    )
  }
}
