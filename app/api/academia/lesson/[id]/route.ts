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

    // Buscar la lección por slug o id
    const lesson = await prisma.lesson.findFirst({
      where: {
        OR: [
          { id: params.id },
          { slug: params.id }
        ],
        published: true
      },
      include: {
        module: true
      }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lección no encontrada' },
        { status: 404 }
      )
    }

    // Verificar el progreso
    const progress = user.academyProgress.find(
      (p) => p.lessonId === lesson.id
    )

    // Buscar la siguiente lección
    const nextLesson = await prisma.lesson.findFirst({
      where: {
        moduleId: lesson.moduleId,
        order: {
          gt: lesson.order
        },
        published: true
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json({
      id: lesson.id,
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.description || '',
      slides: lesson.slides,
      duration: lesson.duration,
      points: lesson.points,
      moduleTitle: lesson.module.title,
      moduleSlug: lesson.module.slug,
      nextLesson: nextLesson
        ? {
            title: nextLesson.title,
            slug: nextLesson.slug
          }
        : undefined,
      isCompleted: progress?.completed || false
    })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json(
      { error: 'Error al obtener la lección' },
      { status: 500 }
    )
  }
}
