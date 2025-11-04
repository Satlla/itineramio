'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Trophy,
  Lightbulb,
  AlertCircle,
  Info,
  Sparkles
} from 'lucide-react'

interface Slide {
  type: 'title' | 'text' | 'reveal' | 'image' | 'highlight'
  title?: string
  content: string
  reveals?: Array<{ title: string; content: string }>
  imageUrl?: string
  highlightType?: 'success' | 'info' | 'warning'
}

interface SlideViewerProps {
  lesson: {
    id: string
    title: string
    description: string
    slides: Slide[]
    duration: number
    points: number
  }
  module: {
    slug: string
    title: string
    courseTitle: string
  }
  progress: {
    completed: boolean
    lastSlideIndex: number
  }
  nextLesson: {
    slug: string
    title: string
  } | null
  userId: string
  userName: string
}

export default function SlideViewer({
  lesson,
  module,
  progress,
  nextLesson,
  userId,
  userName
}: SlideViewerProps) {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(progress.lastSlideIndex || 0)
  const [revealedItems, setRevealedItems] = useState<number[]>([])
  const [isCompleting, setIsCompleting] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)

  const slide = lesson.slides[currentSlide]
  const isLastSlide = currentSlide === lesson.slides.length - 1
  const progressPercentage = Math.round(((currentSlide + 1) / lesson.slides.length) * 100)

  // Save progress to database
  const saveProgress = async (slideIndex: number, completed: boolean = false) => {
    try {
      await fetch('/api/academy/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          lastSlideIndex: slideIndex,
          completed
        })
      })
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }

  // Navigate to next slide
  const nextSlide = () => {
    if (currentSlide < lesson.slides.length - 1) {
      const newSlide = currentSlide + 1
      setCurrentSlide(newSlide)
      setRevealedItems([])
      saveProgress(newSlide)
    }
  }

  // Navigate to previous slide
  const prevSlide = () => {
    if (currentSlide > 0) {
      const newSlide = currentSlide - 1
      setCurrentSlide(newSlide)
      setRevealedItems([])
      saveProgress(newSlide)
    }
  }

  // Reveal next item in reveal-type slides
  const revealNext = () => {
    if (slide.type === 'reveal' && slide.reveals) {
      if (revealedItems.length < slide.reveals.length) {
        setRevealedItems([...revealedItems, revealedItems.length])
      } else {
        nextSlide()
      }
    }
  }

  // Complete lesson
  const completeLesson = async () => {
    if (isCompleting || progress.completed) return

    setIsCompleting(true)
    try {
      await saveProgress(currentSlide, true)
      setShowCompletion(true)
    } catch (error) {
      console.error('Error completing lesson:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (slide.type === 'reveal' && slide.reveals && revealedItems.length < slide.reveals.length) {
          revealNext()
        } else {
          nextSlide()
        }
      } else if (e.key === 'ArrowLeft') {
        prevSlide()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlide, revealedItems, slide])

  // Completion screen
  if (showCompletion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-6 sm:p-12 max-w-2xl w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
          >
            <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-green-600" />
          </motion.div>

          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            ¡Lección Completada!
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">
            Has ganado <span className="font-bold text-green-600">+{lesson.points} puntos</span>
          </p>

          <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="font-semibold text-gray-900 mb-2 text-base sm:text-lg">{lesson.title}</h3>
            <p className="text-xs sm:text-sm text-gray-600">{lesson.description}</p>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4">
            {nextLesson ? (
              <Link
                href={`/academia/curso/${module.slug}/${nextLesson.slug}`}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <span>Siguiente Lección</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            ) : (
              <Link
                href="/academia/curso"
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <span>Volver al Curso</span>
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            )}

            <Link
              href="/academia/curso"
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors text-sm sm:text-base"
            >
              Ver Progreso
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <Link
              href="/academia/curso"
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm hidden sm:inline ml-2">Volver</span>
            </Link>

            <div className="flex-1 mx-2 sm:mx-8">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <div className="text-xs sm:text-sm text-gray-400">
                  {currentSlide + 1} / {lesson.slides.length}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-white">
                  {progressPercentage}%
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2">
                <motion.div
                  className="bg-red-600 rounded-full h-1.5 sm:h-2"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <div className="flex items-center">
              <div className="text-xs sm:text-sm text-gray-400">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 inline mr-0.5 sm:mr-1" />
                <span className="hidden sm:inline">{lesson.points} pts</span>
                <span className="sm:hidden">{lesson.points}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12 min-h-[calc(100vh-160px)] sm:min-h-[calc(100vh-200px)] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {/* Title Slide */}
            {slide.type === 'title' && (
              <div className="text-center space-y-4 sm:space-y-6">
                <motion.h1
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 px-2"
                >
                  {slide.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto px-2"
                >
                  {slide.content}
                </motion.p>
              </div>
            )}

            {/* Text Slide */}
            {slide.type === 'text' && (
              <div className="space-y-4 sm:space-y-6">
                {slide.title && (
                  <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl sm:text-4xl font-bold"
                  >
                    {slide.title}
                  </motion.h2>
                )}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-base sm:text-xl text-gray-300 leading-relaxed"
                >
                  {slide.content}
                </motion.p>
              </div>
            )}

            {/* Reveal Slide */}
            {slide.type === 'reveal' && slide.reveals && (
              <div className="space-y-4 sm:space-y-6">
                <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4"
                >
                  {slide.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm sm:text-lg text-gray-300 mb-4 sm:mb-8"
                >
                  {slide.content}
                </motion.p>

                <div className="space-y-3 sm:space-y-4">
                  {slide.reveals.map((item, index) => (
                    <AnimatePresence key={index}>
                      {revealedItems.includes(index) && (
                        <motion.div
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4 }}
                          className="bg-gray-800 rounded-xl p-4 sm:p-6 border-l-4 border-red-600"
                        >
                          <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2">{item.title}</h3>
                          <p className="text-sm sm:text-base text-gray-300">{item.content}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ))}
                </div>

                {revealedItems.length < slide.reveals.length && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={revealNext}
                    className="mt-6 sm:mt-8 px-6 sm:px-8 py-3 sm:py-4 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors text-sm sm:text-base w-full sm:w-auto"
                  >
                    Revelar siguiente
                  </motion.button>
                )}
              </div>
            )}

            {/* Image Slide */}
            {slide.type === 'image' && (
              <div className="space-y-4 sm:space-y-6">
                {slide.title && (
                  <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl sm:text-4xl font-bold"
                  >
                    {slide.title}
                  </motion.h2>
                )}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gray-800 rounded-xl overflow-hidden"
                >
                  {slide.imageUrl && (
                    <img
                      src={slide.imageUrl}
                      alt={slide.title || 'Lesson image'}
                      className="w-full h-auto"
                    />
                  )}
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm sm:text-lg text-gray-300 text-center"
                >
                  {slide.content}
                </motion.p>
              </div>
            )}

            {/* Highlight Slide */}
            {slide.type === 'highlight' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`rounded-xl sm:rounded-2xl p-5 sm:p-8 ${
                  slide.highlightType === 'success'
                    ? 'bg-green-900/50 border-2 border-green-500'
                    : slide.highlightType === 'warning'
                    ? 'bg-yellow-900/50 border-2 border-yellow-500'
                    : 'bg-blue-900/50 border-2 border-blue-500'
                }`}
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    slide.highlightType === 'success'
                      ? 'bg-green-500'
                      : slide.highlightType === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                  }`}>
                    {slide.highlightType === 'success' && <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                    {slide.highlightType === 'warning' && <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                    {slide.highlightType === 'info' && <Info className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                  </div>
                  <div className="flex-1">
                    {slide.title && (
                      <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3">{slide.title}</h3>
                    )}
                    <p className="text-base sm:text-xl leading-relaxed">{slide.content}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2.5 sm:py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Anterior</span>
            </button>

            <div className="text-center hidden sm:block">
              <div className="text-sm text-gray-400 mb-1">{module.title}</div>
              <div className="font-semibold">{lesson.title}</div>
            </div>

            {isLastSlide && !progress.completed ? (
              <button
                onClick={completeLesson}
                disabled={isCompleting}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold disabled:opacity-50 text-sm sm:text-base"
              >
                <span className="hidden xs:inline">{isCompleting ? 'Completando...' : 'Completar'}</span>
                <span className="xs:hidden">✓</span>
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 hidden xs:inline" />
              </button>
            ) : (
              <button
                onClick={() => {
                  if (slide.type === 'reveal' && slide.reveals && revealedItems.length < slide.reveals.length) {
                    revealNext()
                  } else {
                    nextSlide()
                  }
                }}
                disabled={isLastSlide}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <span className="hidden xs:inline">Siguiente</span>
                <span className="xs:hidden">→</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 hidden xs:inline" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
