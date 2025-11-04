'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Lock,
  PlayCircle,
  Trophy,
  ChevronLeft,
  Award
} from 'lucide-react'
import Link from 'next/link'

interface Lesson {
  id: string
  title: string
  slug: string
  description: string
  duration: number
  points: number
  order: number
  status: 'completed' | 'in-progress' | 'locked'
  coverImage?: string
}

interface ModuleData {
  id: string
  title: string
  slug: string
  description: string
  icon: string
  progress: number
  completedLessons: number
  totalLessons: number
  estimatedTime: number
  lessons: Lesson[]
  quiz?: {
    id: string
    title: string
    isUnlocked: boolean
    passed: boolean
    points: number
  }
}

export default function ModulePage() {
  const params = useParams()
  const router = useRouter()
  const moduleSlug = params?.moduleSlug as string

  const [module, setModule] = useState<ModuleData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const response = await fetch(`/api/academia/module/${moduleSlug}`)
        if (response.ok) {
          const data = await response.json()
          setModule(data)
        } else {
          router.push('/academia/dashboard')
        }
      } catch (error) {
        console.error('Error fetching module:', error)
        router.push('/academia/dashboard')
      } finally {
        setLoading(false)
      }
    }

    if (moduleSlug) {
      fetchModule()
    }
  }, [moduleSlug, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  if (!module) {
    return null
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="text-green-600" size={20} />
      case 'in-progress':
        return <PlayCircle className="text-violet-600" size={20} />
      default:
        return <Lock className="text-gray-400" size={20} />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada'
      case 'in-progress':
        return 'Continuar'
      default:
        return 'Bloqueada'
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <Link
            href="/academia/dashboard"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ChevronLeft size={20} />
            Volver al Dashboard
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                <BookOpen size={32} />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{module.title}</h1>
                <p className="text-white/90 text-lg">{module.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 mt-8">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-white/80" />
                <span>{module.estimatedTime} minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={20} className="text-white/80" />
                <span>{module.completedLessons}/{module.totalLessons} lecciones</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy size={20} className="text-white/80" />
                <span>{module.progress}% completado</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-3">
                <div
                  className="bg-white h-3 rounded-full transition-all duration-500"
                  style={{ width: `${module.progress}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Lecciones</h2>

        <div className="space-y-4">
          {module.lessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={lesson.status !== 'locked' ? `/academia/leccion/${lesson.slug}` : '#'}
                className={`block bg-white rounded-xl shadow-lg p-6 border border-gray-100 transition-all ${
                  lesson.status !== 'locked'
                    ? 'hover:shadow-xl hover:border-violet-200 cursor-pointer'
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Lesson Number */}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg flex-shrink-0 ${
                    lesson.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : lesson.status === 'in-progress'
                      ? 'bg-violet-100 text-violet-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {lesson.order}
                  </div>

                  {/* Lesson Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {lesson.title}
                      </h3>
                      {getStatusIcon(lesson.status)}
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {lesson.description}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{lesson.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy size={16} />
                        <span>{lesson.points} puntos</span>
                      </div>
                    </div>

                    {lesson.status !== 'locked' && (
                      <div className="mt-4">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm ${
                          lesson.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-violet-100 text-violet-700'
                        }`}>
                          {lesson.status === 'completed' ? (
                            <>
                              <CheckCircle2 size={16} />
                              Completada
                            </>
                          ) : (
                            <>
                              <PlayCircle size={16} />
                              {getStatusText(lesson.status)}
                            </>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quiz Section */}
        {module.quiz && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: module.lessons.length * 0.1 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Examen del Módulo</h2>

            <div className={`bg-white rounded-xl shadow-lg p-8 border border-gray-100 ${
              module.quiz.isUnlocked
                ? 'hover:shadow-xl hover:border-violet-200 transition-all'
                : 'opacity-60'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-xl ${
                  module.quiz.passed
                    ? 'bg-green-100'
                    : module.quiz.isUnlocked
                    ? 'bg-violet-100'
                    : 'bg-gray-100'
                }`}>
                  {module.quiz.passed ? (
                    <CheckCircle2 className="text-green-600" size={32} />
                  ) : module.quiz.isUnlocked ? (
                    <Award className="text-violet-600" size={32} />
                  ) : (
                    <Lock className="text-gray-400" size={32} />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {module.quiz.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {module.quiz.isUnlocked
                      ? module.quiz.passed
                        ? 'Has aprobado este examen. ¡Felicidades!'
                        : 'Completa las lecciones para desbloquear el examen del módulo'
                      : 'Debes completar todas las lecciones para desbloquear el examen'}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-1">
                      <Trophy size={16} />
                      <span>{module.quiz.points} puntos</span>
                    </div>
                  </div>

                  {module.quiz.isUnlocked && !module.quiz.passed && (
                    <button className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                      <Award size={20} />
                      Comenzar Examen
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
