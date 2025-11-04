import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { getAcademySession } from '../../../../src/lib/academy/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getAcademySession()

    if (!session?.userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { lessonId, completed } = body

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId es requerido' }, { status: 400 })
    }

    // Get lesson details for points
    const lesson = await prisma.academyLesson.findUnique({
      where: { id: lessonId },
      select: { points: true }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lección no encontrada' }, { status: 404 })
    }

    // Check if progress already exists
    const existingProgress = await prisma.academyUserProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: session.userId,
          lessonId
        }
      }
    })

    // Update or create progress
    const progress = await prisma.academyUserProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.userId,
          lessonId
        }
      },
      update: {
        completed: completed ?? existingProgress?.completed ?? false,
        completedAt: completed && !existingProgress?.completed ? new Date() : existingProgress?.completedAt,
        lastAccessedAt: new Date()
      },
      create: {
        userId: session.userId,
        lessonId,
        completed: completed ?? false,
        completedAt: completed ? new Date() : null,
        lastAccessedAt: new Date()
      }
    })

    // Award points if lesson was just completed (not already completed)
    if (completed && !existingProgress?.completed) {
      await prisma.academyUser.update({
        where: { id: session.userId },
        data: {
          academyPoints: { increment: lesson.points },
          lastActivityAt: new Date()
        }
      })
    } else if (!completed) {
      // Just update last activity
      await prisma.academyUser.update({
        where: { id: session.userId },
        data: { lastActivityAt: new Date() }
      })
    }

    return NextResponse.json({ success: true, progress })
  } catch (error) {
    console.error('Error saving progress:', error)
    return NextResponse.json(
      { error: 'Error al guardar progreso' },
      { status: 500 }
    )
  }
}
