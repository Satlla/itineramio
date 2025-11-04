'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/src/providers/AuthProvider'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Trophy,
  Flame,
  Target,
  Clock,
  CheckCircle2,
  Lock,
  PlayCircle,
  Award,
  TrendingUp,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

interface ProgressData {
  overallProgress: number
  completedLessons: number
  totalLessons: number
  points: number
  streak: number
  nextLesson: {
    id: string
    title: string
    moduleTitle: string
    moduleSlug: string
    lessonSlug: string
  } | null
  modules: Array<{
    id: string
    title: string
    slug: string
    icon: string
    progress: number
    completedLessons: number
    totalLessons: number
    isUnlocked: boolean
  }>
  recentAchievements: Array<{
    id: string
    title: string
    description: string
    icon: string
    rarity: string
    unlockedAt: string
  }>
  leaderboardPreview: Array<{
    position: number
    username: string
    points: number
    isCurrentUser: boolean
  }>
}

export default function AcademiaDashboard() {
  const { user } = useAuth()
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch('/api/academia/progress')
        if (response.ok) {
          const data = await response.json()
          setProgress(data)
        }
      } catch (error) {
        console.error('Error fetching progress:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY': return 'from-yellow-400 to-orange-500'
      case 'EPIC': return 'from-purple-400 to-pink-500'
      case 'RARE': return 'from-blue-400 to-cyan-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Hola, {user?.name || user?.username || 'Estudiante'} 👋
        </h1>
        <p className="text-gray-600">
          Continua tu camino hacia el éxito en el alquiler vacacional
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-violet-100 rounded-lg">
              <Target className="text-violet-600" size={24} />
            </div>
            <span className="text-2xl font-bold text-violet-600">
              {progress?.overallProgress || 0}%
            </span>
          </div>
          <h3 className="text-gray-900 font-semibold mb-1">Progreso General</h3>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-violet-600 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress?.overallProgress || 0}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="text-green-600" size={24} />
            </div>
            <span className="text-2xl font-bold text-green-600">
              {progress?.completedLessons || 0}/{progress?.totalLessons || 0}
            </span>
          </div>
          <h3 className="text-gray-900 font-semibold">Lecciones Completadas</h3>
          <p className="text-sm text-gray-500">
            {progress?.totalLessons ?
              `${progress.totalLessons - (progress.completedLessons || 0)} restantes`
              : 'Comienza ahora'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Trophy className="text-amber-600" size={24} />
            </div>
            <span className="text-2xl font-bold text-amber-600">
              {progress?.points || 0}
            </span>
          </div>
          <h3 className="text-gray-900 font-semibold">Puntos Totales</h3>
          <p className="text-sm text-gray-500">Sigue aprendiendo</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Flame className="text-orange-600" size={24} />
            </div>
            <span className="text-2xl font-bold text-orange-600">
              {progress?.streak || 0}
            </span>
          </div>
          <h3 className="text-gray-900 font-semibold">Racha de Días</h3>
          <p className="text-sm text-gray-500">
            {progress?.streak === 0 ? 'Comienza tu racha' : 'Sigue así'}
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* Next Lesson */}
          {progress?.nextLesson && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl shadow-xl p-8 text-white"
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock size={20} />
                <span className="text-sm font-medium opacity-90">Continuar aprendiendo</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">{progress.nextLesson.title}</h2>
              <p className="opacity-90 mb-6">{progress.nextLesson.moduleTitle}</p>
              <Link
                href={`/academia/leccion/${progress.nextLesson.lessonSlug}`}
                className="inline-flex items-center gap-2 bg-white text-violet-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                <PlayCircle size={20} />
                Continuar Lección
              </Link>
            </motion.div>
          )}

          {/* Modules */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Módulos del Curso</h2>
            <div className="space-y-4">
              {progress?.modules?.map((module, index) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link
                    href={module.isUnlocked ? `/academia/modulo/${module.slug}` : '#'}
                    className={`block bg-white rounded-xl shadow-lg p-6 border border-gray-100 transition-all ${
                      module.isUnlocked
                        ? 'hover:shadow-xl hover:border-violet-200 cursor-pointer'
                        : 'opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${
                          module.isUnlocked ? 'bg-violet-100' : 'bg-gray-100'
                        }`}>
                          {module.isUnlocked ? (
                            <BookOpen className="text-violet-600" size={24} />
                          ) : (
                            <Lock className="text-gray-400" size={24} />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {module.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span>{module.completedLessons}/{module.totalLessons} lecciones</span>
                            <span>{module.progress}% completado</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-violet-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${module.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      {module.isUnlocked && (
                        <ChevronRight className="text-gray-400 flex-shrink-0" size={24} />
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-8">
          {/* Recent Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-6">
              <Award className="text-violet-600" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Últimos Logros</h3>
            </div>
            <div className="space-y-4">
              {progress?.recentAchievements?.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  Completa lecciones para desbloquear logros
                </p>
              ) : (
                progress?.recentAchievements?.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className={`p-2 bg-gradient-to-br ${getRarityColor(achievement.rarity)} rounded-lg flex-shrink-0`}>
                      <Award className="text-white" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">
                        {achievement.title}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Leaderboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-violet-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Top 5</h3>
              </div>
              <Link
                href="/academia/leaderboard"
                className="text-sm text-violet-600 hover:text-violet-700 font-medium"
              >
                Ver todos
              </Link>
            </div>
            <div className="space-y-3">
              {progress?.leaderboardPreview?.map((entry) => (
                <div
                  key={entry.position}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    entry.isCurrentUser ? 'bg-violet-50 border border-violet-200' : 'bg-gray-50'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                    entry.position === 1
                      ? 'bg-yellow-100 text-yellow-700'
                      : entry.position === 2
                      ? 'bg-gray-200 text-gray-700'
                      : entry.position === 3
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {entry.position}
                  </div>
                  <span className="flex-1 font-medium text-gray-900 truncate">
                    {entry.username}
                  </span>
                  <span className="text-sm font-semibold text-violet-600">
                    {entry.points} pts
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
