import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '../../../../src/lib/prisma'
import { getAcademySession } from '../../../../src/lib/academy/auth'
import {
  Trophy,
  Medal,
  Award,
  Flame,
  TrendingUp,
  ArrowLeft,
  Crown,
  Zap
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Ranking | Academia Itineramio',
  description: 'Ranking de estudiantes de la Academia Itineramio'
}

export default async function RankingPage() {
  const session = await getAcademySession()

  if (!session?.userId) {
    redirect('/academia/login?redirect=/academia/ranking')
  }

  // Get current user
  const currentUser = await prisma.academyUser.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      fullName: true,
      username: true,
      avatar: true,
      academyPoints: true,
      academyStreak: true,
      enrolledAt: true
    }
  })

  if (!currentUser) {
    redirect('/academia/login')
  }

  // Get top students
  const topStudents = await prisma.academyUser.findMany({
    orderBy: { academyPoints: 'desc' },
    take: 100,
    select: {
      id: true,
      fullName: true,
      username: true,
      avatar: true,
      academyPoints: true,
      academyStreak: true,
      enrolledAt: true,
      progress: {
        where: { completed: true },
        select: { id: true }
      }
    }
  })

  // Calculate user's rank
  const userRank = topStudents.findIndex(u => u.id === currentUser.id) + 1

  // Get total students
  const totalStudents = await prisma.academyUser.count()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Link
            href="/academia/curso"
            className="flex items-center space-x-2 text-yellow-100 hover:text-white transition-colors mb-4 sm:mb-6"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Volver al curso</span>
          </Link>

          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            <Trophy className="w-8 h-8 sm:w-12 sm:h-12" />
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold">Ranking de Estudiantes</h1>
              <p className="text-yellow-100 text-sm sm:text-base hidden sm:block">Los mejores de la Academia Itineramio</p>
            </div>
          </div>

          {/* User's rank card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between flex-wrap sm:flex-nowrap gap-3">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl sm:text-2xl font-bold text-white">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-yellow-100">Tu posición</p>
                  <h3 className="text-lg sm:text-2xl font-bold">{currentUser.fullName}</h3>
                  <p className="text-yellow-100 text-xs sm:text-base">
                    {currentUser.username ? `@${currentUser.username}` : 'Estudiante'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl sm:text-4xl font-bold mb-1">#{userRank}</div>
                <div className="text-xs sm:text-sm text-yellow-100">de {totalStudents.toLocaleString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm text-yellow-100">Puntos</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold">{currentUser.academyPoints}</div>
              </div>

              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                  <Flame className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm text-yellow-100">Racha</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold">{currentUser.academyStreak} días</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Top 3 Podium */}
        {topStudents.length >= 3 && (
          <div className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-6 sm:mb-8">
              🏆 Top 3 Superhosts en Formación
            </h2>

            <div className="hidden md:flex items-end justify-center space-x-6 mb-12">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-3xl font-bold text-white">
                      {topStudents[1].fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center border-2 border-white">
                    <span className="text-white font-bold">2</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg border-2 border-gray-300 p-6 w-64 text-center">
                  <Medal className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <h3 className="font-bold text-gray-900 mb-1">{topStudents[1].fullName}</h3>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Trophy className="w-4 h-4" />
                      <span>{topStudents[1].academyPoints}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Flame className="w-4 h-4" />
                      <span>{topStudents[1].academyStreak}</span>
                    </span>
                  </div>
                </div>
                <div className="w-48 h-32 bg-gradient-to-b from-gray-300 to-gray-400 mt-4 rounded-t-lg flex items-center justify-center">
                  <span className="text-6xl font-bold text-white opacity-30">2</span>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center -mt-8">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-4 border-white shadow-2xl">
                    <span className="text-4xl font-bold text-white">
                      {topStudents[0].fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Crown className="w-12 h-12 text-yellow-400" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center border-2 border-white">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-2xl border-4 border-yellow-400 p-6 w-72 text-center">
                  <Trophy className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                  <h3 className="font-bold text-xl text-gray-900 mb-1">{topStudents[0].fullName}</h3>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Trophy className="w-4 h-4" />
                      <span className="font-semibold">{topStudents[0].academyPoints}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Flame className="w-4 h-4" />
                      <span className="font-semibold">{topStudents[0].academyStreak}</span>
                    </span>
                  </div>
                </div>
                <div className="w-56 h-40 bg-gradient-to-b from-yellow-400 to-yellow-600 mt-4 rounded-t-lg flex items-center justify-center">
                  <span className="text-8xl font-bold text-white opacity-30">1</span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-3xl font-bold text-white">
                      {topStudents[2].fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center border-2 border-white">
                    <span className="text-white font-bold">3</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg border-2 border-orange-300 p-6 w-64 text-center">
                  <Award className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <h3 className="font-bold text-gray-900 mb-1">{topStudents[2].fullName}</h3>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Trophy className="w-4 h-4" />
                      <span>{topStudents[2].academyPoints}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Flame className="w-4 h-4" />
                      <span>{topStudents[2].academyStreak}</span>
                    </span>
                  </div>
                </div>
                <div className="w-48 h-24 bg-gradient-to-b from-orange-300 to-orange-500 mt-4 rounded-t-lg flex items-center justify-center">
                  <span className="text-6xl font-bold text-white opacity-30">3</span>
                </div>
              </div>
            </div>

            {/* Mobile Top 3 - Simple Cards */}
            <div className="md:hidden space-y-4">
              {[topStudents[0], topStudents[1], topStudents[2]].map((student, index) => {
                const rank = index + 1
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'
                const bgColor = rank === 1 ? 'from-yellow-400 to-yellow-600' : rank === 2 ? 'from-gray-300 to-gray-400' : 'from-orange-300 to-orange-500'
                const borderColor = rank === 1 ? 'border-yellow-400' : rank === 2 ? 'border-gray-300' : 'border-orange-300'

                return (
                  <div key={student.id} className={`bg-white rounded-xl shadow-lg border-2 ${borderColor} p-4`}>
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{medal}</div>
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${bgColor} flex items-center justify-center border-3 border-white shadow-lg flex-shrink-0`}>
                        <span className="text-2xl font-bold text-white">
                          {student.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-gray-900 text-lg truncate">{student.fullName}</h3>
                          {rank === 1 && <Crown className="w-5 h-5 text-yellow-500 flex-shrink-0" />}
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                          <span className="flex items-center space-x-1">
                            <Trophy className="w-3 h-3" />
                            <span className="font-semibold">{student.academyPoints}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Flame className="w-3 h-3" />
                            <span>{student.academyStreak}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Tabla Completa de Clasificación</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {topStudents.map((student, index) => {
              const isCurrentUser = student.id === currentUser.id
              const rank = index + 1
              const completedLessons = student.progress.length

              return (
                <div
                  key={student.id}
                  className={`p-3 sm:p-4 flex items-center space-x-2 sm:space-x-4 hover:bg-gray-50 transition-colors ${
                    isCurrentUser ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 sm:w-12 text-center flex-shrink-0">
                    {rank <= 3 ? (
                      <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full ${
                        rank === 1 ? 'bg-yellow-100 text-yellow-600' :
                        rank === 2 ? 'bg-gray-100 text-gray-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        <span className="font-bold text-base sm:text-lg">{rank}</span>
                      </div>
                    ) : (
                      <span className="text-sm sm:text-lg font-semibold text-gray-600">#{rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    rank === 1 ? 'bg-yellow-500' :
                    rank === 2 ? 'bg-gray-400' :
                    rank === 3 ? 'bg-orange-400' :
                    'bg-red-600'
                  }`}>
                    <span className="text-lg sm:text-xl font-bold text-white">
                      {student.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{student.fullName}</h3>
                      {isCurrentUser && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium flex-shrink-0">
                          Tú
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                      <span className="hidden sm:inline">{completedLessons} lecciones</span>
                      <span className="sm:hidden">{completedLessons} lecc.</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden md:inline">Desde {new Date(student.enrolledAt).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-3 sm:space-x-6">
                    <div className="text-right">
                      <div className="flex items-center space-x-0.5 sm:space-x-1 text-gray-900">
                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                        <span className="font-semibold text-xs sm:text-base">{student.academyPoints}</span>
                      </div>
                      <div className="text-xs text-gray-500 hidden sm:block">puntos</div>
                    </div>

                    <div className="text-right hidden sm:block">
                      <div className="flex items-center space-x-1 text-gray-900">
                        <Flame className="w-4 h-4 text-orange-600" />
                        <span className="font-semibold">{student.academyStreak}</span>
                      </div>
                      <div className="text-xs text-gray-500">días</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Motivational message */}
        <div className="mt-8 sm:mt-12 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl p-6 sm:p-8 text-center">
          <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold mb-2">¡Sigue Aprendiendo!</h3>
          <p className="text-red-100 mb-4 sm:mb-6 text-sm sm:text-base">
            Completa más lecciones y exámenes para subir en el ranking
          </p>
          <Link
            href="/academia/curso"
            className="inline-flex items-center px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors text-sm sm:text-base"
          >
            <span>Continuar Curso</span>
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  )
}
