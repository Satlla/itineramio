import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '../../../../../src/lib/prisma'
import { getAcademySession } from '../../../../../src/lib/academy/auth'
import QuizInterface from './QuizInterface'

interface PageProps {
  params: Promise<{
    moduleSlug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { moduleSlug } = await params

  return {
    title: `Examen | ${moduleSlug} | Academia Itineramio`,
    description: 'Demuestra tus conocimientos en este examen'
  }
}

export default async function ExamenPage({ params }: PageProps) {
  const session = await getAcademySession()

  if (!session?.userId) {
    const { moduleSlug } = await params
    redirect(`/academia/login?redirect=/academia/curso/${moduleSlug}/examen`)
  }

  const { moduleSlug } = await params

  // Get module with quiz
  const module = await prisma.module.findFirst({
    where: {
      slug: moduleSlug,
      published: true
    },
    include: {
      quiz: {
        include: {
          questions: {
            orderBy: { order: 'asc' }
          }
        }
      },
      course: {
        select: {
          title: true,
          passingScore: true
        }
      }
    }
  })

  if (!module || !module.quiz) {
    notFound()
  }

  // Get user's quiz attempts
  const attempts = await prisma.academyUserQuizAttempt.findMany({
    where: {
      userId: session.userId,
      quizId: module.quiz.id
    },
    orderBy: {
      startedAt: 'desc'
    },
    take: 5
  })

  const attemptCount = attempts.length
  const bestAttempt = attempts.find(a => a.passed)
  const canRetake = module.quiz.maxAttempts === null || attemptCount < module.quiz.maxAttempts
  const hasPassed = bestAttempt !== undefined

  // Get user info
  const user = await prisma.academyUser.findUnique({
    where: { id: session.userId },
    select: { fullName: true }
  })

  if (!user) {
    redirect('/academia/login')
  }

  return (
    <QuizInterface
      quiz={{
        id: module.quiz.id,
        title: module.quiz.title,
        description: module.quiz.description || '',
        passingScore: module.quiz.passingScore,
        timeLimit: module.quiz.timeLimit,
        maxAttempts: module.quiz.maxAttempts,
        points: module.quiz.points,
        questions: module.quiz.questions.map(q => ({
          id: q.id,
          question: q.question,
          type: q.type,
          options: q.options as string[],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          points: q.points,
          order: q.order
        }))
      }}
      module={{
        slug: module.slug,
        title: module.title,
        courseTitle: module.course.title
      }}
      attempts={{
        count: attemptCount,
        canRetake,
        hasPassed,
        bestScore: bestAttempt?.score,
        recentAttempts: attempts.map(a => ({
          score: a.score,
          passed: a.passed,
          startedAt: a.startedAt.toISOString()
        }))
      }}
      userId={session.userId}
      userName={user.fullName}
    />
  )
}
