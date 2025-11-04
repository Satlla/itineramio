'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Trophy,
  ArrowRight,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

interface Slide {
  type: 'title' | 'content' | 'image' | 'video' | 'quote' | 'list'
  title?: string
  content?: string
  image?: string
  videoUrl?: string
  items?: string[]
  quote?: string
  author?: string
}

interface LessonData {
  id: string
  title: string
  slug: string
  description: string
  slides: Slide[]
  duration: number
  points: number
  moduleTitle: string
  moduleSlug: string
  nextLesson?: {
    title: string
    slug: string
  }
  isCompleted: boolean
}

function SlideViewer({ slide, slideNumber, totalSlides }: { slide: Slide; slideNumber: number; totalSlides: number }) {
  const renderSlideContent = () => {
    switch (slide.type) {
      case 'title':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-bold text-gray-900 mb-6"
            >
              {slide.title}
            </motion.h1>
            {slide.content && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 max-w-2xl"
              >
                {slide.content}
              </motion.p>
            )}
          </div>
        )

      case 'content':
        return (
          <div className="flex flex-col justify-center h-full px-8 max-w-4xl mx-auto">
            {slide.title && (
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-bold text-gray-900 mb-6"
              >
                {slide.title}
              </motion.h2>
            )}
            {slide.content && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-gray-700 leading-relaxed prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: slide.content }}
              />
            )}
          </div>
        )

      case 'image':
        return (
          <div className="flex flex-col justify-center h-full px-8">
            {slide.title && (
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-gray-900 mb-6 text-center"
              >
                {slide.title}
              </motion.h2>
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <img
                src={slide.image}
                alt={slide.title || 'Slide image'}
                className="max-h-[500px] rounded-xl shadow-2xl object-contain"
              />
            </motion.div>
            {slide.content && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center text-gray-600 mt-6 text-lg"
              >
                {slide.content}
              </motion.p>
            )}
          </div>
        )

      case 'list':
        return (
          <div className="flex flex-col justify-center h-full px-8 max-w-4xl mx-auto">
            {slide.title && (
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-bold text-gray-900 mb-8"
              >
                {slide.title}
              </motion.h2>
            )}
            <div className="space-y-4">
              {slide.items?.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-md"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-violet-100 text-violet-600 rounded-full font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-lg text-gray-700 flex-1">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case 'quote':
        return (
          <div className="flex flex-col items-center justify-center h-full px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl"
            >
              <div className="text-6xl text-violet-600 mb-4">"</div>
              <blockquote className="text-3xl font-medium text-gray-900 mb-6 italic">
                {slide.quote}
              </blockquote>
              {slide.author && (
                <cite className="text-xl text-gray-600 not-italic">
                  — {slide.author}
                </cite>
              )}
            </motion.div>
          </div>
        )

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Tipo de slide no soportado</p>
          </div>
        )
    }
  }

  return (
    <div className="h-full relative bg-gradient-to-br from-gray-50 to-violet-50">
      {renderSlideContent()}

      {/* Slide Counter */}
      <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
        <span className="text-sm font-medium text-gray-700">
          {slideNumber} / {totalSlides}
        </span>
      </div>
    </div>
  )
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const lessonSlug = params?.lessonSlug as string

  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await fetch(`/api/academia/lesson/${lessonSlug}`)
        if (response.ok) {
          const data = await response.json()
          setLesson(data)
        } else {
          router.push('/academia/dashboard')
        }
      } catch (error) {
        console.error('Error fetching lesson:', error)
        router.push('/academia/dashboard')
      } finally {
        setLoading(false)
      }
    }

    if (lessonSlug) {
      fetchLesson()
    }
  }, [lessonSlug, router])

  const completeLesson = async () => {
    if (!lesson || isCompleting) return

    setIsCompleting(true)
    try {
      const response = await fetch(`/api/academia/lesson/${lesson.id}/complete`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`¡Lección completada! +${lesson.points} puntos`, {
          icon: '🎉',
          duration: 4000,
        })

        if (data.achievements?.length > 0) {
          data.achievements.forEach((achievement: any) => {
            toast.success(`¡Logro desbloqueado: ${achievement.title}!`, {
              icon: '🏆',
              duration: 5000,
            })
          })
        }

        setLesson({ ...lesson, isCompleted: true })
      }
    } catch (error) {
      console.error('Error completing lesson:', error)
      toast.error('Error al completar la lección')
    } finally {
      setIsCompleting(false)
    }
  }

  const nextSlide = () => {
    if (!lesson) return

    if (currentSlide < lesson.slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else if (!lesson.isCompleted) {
      completeLesson()
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextSlide()
    if (e.key === 'ArrowLeft') prevSlide()
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentSlide, lesson])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  if (!lesson) {
    return null
  }

  const isLastSlide = currentSlide === lesson.slides.length - 1

  return (
    <div className="fixed inset-0 top-16 bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Link
            href={`/academia/modulo/${lesson.moduleSlug}`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
          >
            <ChevronLeft size={20} />
            <span className="hidden sm:inline">Volver</span>
          </Link>

          <div className="border-l border-gray-300 h-6" />

          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 truncate">{lesson.moduleTitle}</p>
            <h1 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
              {lesson.title}
            </h1>
          </div>
        </div>

        {lesson.isCompleted && (
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full flex-shrink-0">
            <CheckCircle2 size={16} />
            <span className="text-sm font-medium hidden sm:inline">Completada</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-200 h-1">
        <div
          className="bg-gradient-to-r from-violet-600 to-purple-600 h-1 transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / lesson.slides.length) * 100}%` }}
        />
      </div>

      {/* Slide Content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <SlideViewer
              slide={lesson.slides[currentSlide]}
              slideNumber={currentSlide + 1}
              totalSlides={lesson.slides.length}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            currentSlide === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <ChevronLeft size={20} />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <BookOpen size={16} />
          <span>{lesson.duration} min</span>
          <span className="text-gray-400">•</span>
          <Trophy size={16} />
          <span>{lesson.points} pts</span>
        </div>

        {!isLastSlide ? (
          <button
            onClick={nextSlide}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <span>Siguiente</span>
            <ChevronRight size={20} />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            {!lesson.isCompleted && (
              <button
                onClick={completeLesson}
                disabled={isCompleting}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-all disabled:opacity-50"
              >
                <CheckCircle2 size={20} />
                <span>{isCompleting ? 'Completando...' : 'Completar'}</span>
              </button>
            )}
            {lesson.nextLesson && (
              <Link
                href={`/academia/leccion/${lesson.nextLesson.slug}`}
                className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
              >
                <span className="hidden sm:inline">Siguiente lección</span>
                <span className="sm:hidden">Siguiente</span>
                <ArrowRight size={20} />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
