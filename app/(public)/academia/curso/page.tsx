import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '../../../../src/lib/prisma'
import { getAcademySession } from '../../../../src/lib/academy/auth'
import {
  BookOpen,
  Trophy,
  CheckCircle,
  Lock,
  Play,
  Target,
  TrendingUp,
  Award,
  Flame
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mi Curso | Academia Itineramio',
  description: 'Progreso del curso De Cero a Superhost'
}

export default async function CursoDashboardPage() {
  const session = await getAcademySession()

  if (!session?.userId) {
    redirect('/academia/login?redirect=/academia/curso')
  }

  // Get academy user with progress data
  const user = await prisma.academyUser.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      username: true,
      academyPoints: true,
      academyStreak: true,
      enrolledAt: true,
      progress: {
        include: {
          lesson: {
            include: {
              module: true
            }
          }
        }
      },
      quizAttempts: {
        include: {
          quiz: {
            include: {
              module: true
            }
          }
        },
        orderBy: {
          startedAt: 'desc'
        }
      }
    }
  })

  if (!user) {
    redirect('/academia/login')
  }

  // Get course with all modules, lessons, and quizzes
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
          },
          quiz: {
            include: {
              questions: true
            }
          }
        }
      }
    }
  })

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Curso en construcci�n</h1>
          <p className="text-gray-600">Estamos preparando el mejor contenido para ti.</p>
        </div>
      </div>
    )
  }

  // Calculate progress
  const completedLessons = user.progress.filter(p => p.completed).length
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  // Get user rank
  const usersAbove = await prisma.academyUser.count({
    where: {
      academyPoints: { gt: user.academyPoints }
    }
  })
  const userRank = usersAbove + 1

  const totalStudents = await prisma.academyUser.count()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with user stats - Gradient Style */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">De Cero a Superhost</h1>
              <p className="text-violet-100 text-sm sm:text-base">Bienvenido de vuelta, {user.fullName}</p>
            </div>
            <Link
              href="/academia/ranking"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg transition-all text-white font-medium text-sm"
            >
              Ver Ranking
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{user.academyPoints}</div>
                  <div className="text-xs text-violet-100">Puntos totales</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">#{userRank}</div>
                  <div className="text-xs text-violet-100">de {totalStudents.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{completedLessons}/{totalLessons}</div>
                  <div className="text-xs text-violet-100">Lecciones completadas</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{user.academyStreak}</div>
                  <div className="text-xs text-violet-100">Días de racha</div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-violet-100">Progreso del curso</span>
              <span className="text-sm font-bold text-white">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5">
              <div
                className="bg-white rounded-full h-2.5 transition-all duration-500 shadow-lg"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {course.modules.map((module) => {
            const moduleLessons = module.lessons
            const completedInModule = user.progress.filter(
              p => p.completed && moduleLessons.some(l => l.id === p.lessonId)
            ).length
            const moduleProgress = moduleLessons.length > 0
              ? Math.round((completedInModule / moduleLessons.length) * 100)
              : 0

            const quizAttempt = user.quizAttempts.find(a => a.quiz.module.id === module.id)
            const quizPassed = quizAttempt?.passed || false

            return (
              <div key={module.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {/* Module Header */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-semibold text-violet-700 bg-violet-100 rounded-full px-3 py-1">
                          M�dulo {module.order}
                        </span>
                        {quizPassed && (
                          <span className="text-sm font-semibold text-green-600 bg-green-100 rounded-full px-3 py-1 flex items-center space-x-1">
                            <Award className="w-3 h-3" />
                            <span>Aprobado</span>
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{module.title}</h2>
                      <p className="text-gray-600 mb-4">{module.description}</p>

                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{moduleLessons.length} lecciones</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Play className="w-4 h-4" />
                          <span>{module.estimatedTime} min</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900 mb-1">{moduleProgress}%</div>
                      <div className="text-sm text-gray-500">Completado</div>
                    </div>
                  </div>

                  {moduleProgress > 0 && moduleProgress < 100 && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-full h-2 transition-all duration-500"
                          style={{ width: `${moduleProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Lessons List */}
                <div className="divide-y divide-gray-200">
                  {moduleLessons.map((lesson, i) => {
                    const isCompleted = user.progress.some(
                      p => p.lessonId === lesson.id && p.completed
                    )

                    return (
                      <Link
                        key={lesson.id}
                        href={`/academia/curso/${module.slug}/${lesson.slug}`}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <span className="text-sm font-semibold text-gray-600">{i + 1}</span>
                            )}
                          </div>

                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 group-hover:text-violet-600 transition-colors">
                              {lesson.title}
                            </h3>
                            {lesson.description && (
                              <p className="text-sm text-gray-500 line-clamp-1">{lesson.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">{lesson.duration} min</span>
                          {isCompleted && (
                            <span className="text-xs text-green-600 font-medium">+{lesson.points} pts</span>
                          )}
                          <Play className="w-5 h-5 text-gray-400 group-hover:text-violet-600 transition-colors" />
                        </div>
                      </Link>
                    )
                  })}

                  {/* Quiz */}
                  {module.quiz && (
                    <Link
                      href={`/academia/curso/${module.slug}/examen`}
                      className="flex items-center justify-between p-4 bg-violet-50 hover:bg-violet-100 transition-colors group"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${quizPassed ? 'bg-green-100' : 'bg-violet-200'}`}>
                          {quizPassed ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Target className="w-5 h-5 text-violet-700" />
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">
                            Examen del M�dulo
                          </h3>
                          <p className="text-sm text-gray-600">
                            {module.quiz.questions.length} preguntas � {module.quiz.passingScore}% para aprobar
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {quizAttempt && (
                          <span className={`text-sm font-medium ${quizPassed ? 'text-green-600' : 'text-gray-600'}`}>
                            {Math.round(quizAttempt.score)}%
                          </span>
                        )}
                        <span className="text-xs text-violet-700 font-medium">+{module.quiz.points} pts</span>
                        <Target className="w-5 h-5 text-violet-600 group-hover:text-violet-700 transition-colors" />
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Check if course is completed */}
        {progressPercentage === 100 && (
          <div className="mt-12 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-8 text-center">
            <Award className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">�Felicidades!</h2>
            <p className="text-lg text-green-100 mb-6">
              Has completado todas las lecciones del curso
            </p>
            <Link
              href="/academia/diploma"
              className="inline-flex items-center px-6 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors"
            >
              <Award className="w-5 h-5 mr-2" />
              Obtener mi Diploma
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
