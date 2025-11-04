import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '../../../../../../src/lib/prisma'
import { getAcademySession } from '../../../../../../src/lib/academy/auth'
import SlideViewer from './SlideViewer'

interface PageProps {
  params: Promise<{
    moduleSlug: string
    lessonSlug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lessonSlug } = await params

  return {
    title: `${lessonSlug} | Academia Itineramio`,
    description: 'Lección interactiva del curso De Cero a Superhost'
  }
}

export default async function LessonPage({ params }: PageProps) {
  const session = await getAcademySession()

  if (!session?.userId) {
    const { moduleSlug, lessonSlug } = await params
    redirect(`/academia/login?redirect=/academia/curso/${moduleSlug}/${lessonSlug}`)
  }

  const { moduleSlug, lessonSlug } = await params

  // Get lesson with module info
  const lesson = await prisma.lesson.findFirst({
    where: {
      slug: lessonSlug,
      module: {
        slug: moduleSlug,
        published: true
      },
      published: true
    },
    include: {
      module: {
        include: {
          course: true,
          lessons: {
            where: { published: true },
            orderBy: { order: 'asc' },
            select: {
              id: true,
              slug: true,
              title: true,
              order: true
            }
          }
        }
      }
    }
  })

  if (!lesson) {
    notFound()
  }

  // Get user progress for this lesson
  const progress = await prisma.academyUserProgress.findUnique({
    where: {
      userId_lessonId: {
        userId: session.userId,
        lessonId: lesson.id
      }
    }
  })

  // Get user's current points
  const user = await prisma.academyUser.findUnique({
    where: { id: session.userId },
    select: { academyPoints: true, fullName: true }
  })

  if (!user) {
    redirect('/academia/login')
  }

  // Find next lesson
  const currentLessonIndex = lesson.module.lessons.findIndex(l => l.id === lesson.id)
  const nextLesson = currentLessonIndex < lesson.module.lessons.length - 1
    ? lesson.module.lessons[currentLessonIndex + 1]
    : null

  return (
    <SlideViewer
      lesson={{
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || '',
        slides: lesson.slides as any[],
        duration: lesson.duration,
        points: lesson.points
      }}
      module={{
        slug: lesson.module.slug,
        title: lesson.module.title,
        courseTitle: lesson.module.course.title
      }}
      progress={{
        completed: progress?.completed || false,
        lastSlideIndex: progress?.lastSlideIndex || 0
      }}
      nextLesson={nextLesson ? {
        slug: nextLesson.slug,
        title: nextLesson.title
      } : null}
      userId={session.userId}
      userName={user.fullName}
    />
  )
}
