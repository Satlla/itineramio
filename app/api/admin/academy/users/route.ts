import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { getAdminUser } from '../../../../../src/lib/admin-auth'

// GET - List all academy users
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminSession = await getAdminUser(request)
    if (!adminSession) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const users = await prisma.academyUser.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        academyPoints: true,
        academyStreak: true,
        enrolledAt: true,
        lastActivityAt: true,
        _count: {
          select: {
            progress: true,
            quizAttempts: true
          }
        }
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching academy users:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
}

// DELETE - Delete academy user
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminSession = await getAdminUser(request)
    if (!adminSession) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      )
    }

    // Delete user (cascade will delete related records)
    await prisma.academyUser.delete({
      where: { id: userId }
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error deleting academy user:', error)
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    )
  }
}
