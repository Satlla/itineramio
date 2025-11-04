'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, CheckCircle, Play } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Keyboard } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'

import 'swiper/css'

interface Slide {
  type: 'intro' | 'text' | 'image' | 'text-image' | 'video' | 'key-points'
  title: string
  content?: string
  image?: string // URL de Unsplash
  points?: string[] // Para key-points
  imagePosition?: 'left' | 'right' | 'full' // Para text-image
  videoUrl?: string // YouTube URL
}

interface Props {
  slides: Slide[]
  lessonTitle: string
  onComplete: () => void
  onProgress: (slideIndex: number) => void
}

export default function SlideViewer({ slides, lessonTitle, onComplete, onProgress }: Props) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLastSlide, setIsLastSlide] = useState(false)

  useEffect(() => {
    onProgress(currentSlide)
    setIsLastSlide(currentSlide === slides.length - 1)
  }, [currentSlide, slides.length, onProgress])

  const handleNext = () => {
    swiper?.slideNext()
  }

  const handlePrev = () => {
    swiper?.slidePrev()
  }

  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentSlide(swiper.activeIndex)
  }

  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1]
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url
  }

  return (
    <div className="relative w-full h-screen bg-gray-950 overflow-hidden">
      {/* Progress Bar */}
      <motion.div
        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500 z-50"
        initial={{ width: 0 }}
        animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        transition={{ duration: 0.3 }}
      />

      {/* Slide Counter */}
      <div className="absolute top-6 right-6 z-40 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
        <span className="text-white font-medium">
          {currentSlide + 1} / {slides.length}
        </span>
      </div>

      {/* Main Swiper */}
      <Swiper
        modules={[Navigation, Keyboard]}
        onSwiper={setSwiper}
        onSlideChange={handleSlideChange}
        keyboard={{ enabled: true }}
        allowTouchMove={true}
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} className="w-full h-full">
            <SlideContent slide={slide} isActive={currentSlide === index} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Buttons */}
      <AnimatePresence>
        {currentSlide > 0 && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={handlePrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-40 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-4 rounded-full transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
        )}

        {!isLastSlide && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-40 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-4 rounded-full transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Complete Button */}
      {isLastSlide && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40"
        >
          <button
            onClick={onComplete}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Marcar como completada
          </button>
        </motion.div>
      )}
    </div>
  )
}

function SlideContent({ slide, isActive }: { slide: Slide; isActive: boolean }) {
  const slideVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  }

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.2, ease: 'easeOut' }
    }
  }

  switch (slide.type) {
    case 'intro':
      return (
        <motion.div
          variants={slideVariants}
          initial="hidden"
          animate={isActive ? 'visible' : 'hidden'}
          className="relative w-full h-full flex items-center justify-center"
        >
          {/* Background Image */}
          {slide.image && (
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-purple-900/30" />
            </div>
          )}

          {/* Content */}
          <motion.div
            variants={contentVariants}
            className="relative z-10 text-center max-w-4xl px-8"
          >
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              {slide.title}
            </h1>
            {slide.content && (
              <p className="text-xl md:text-2xl text-gray-200 mb-12 leading-relaxed">
                {slide.content}
              </p>
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Play className="w-5 h-5" />
              Comenzar
            </motion.div>
          </motion.div>
        </motion.div>
      )

    case 'text':
      return (
        <motion.div
          variants={slideVariants}
          initial="hidden"
          animate={isActive ? 'visible' : 'hidden'}
          className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900"
        >
          <motion.div
            variants={contentVariants}
            className="max-w-4xl px-8 md:px-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
              {slide.title}
            </h2>
            {slide.content && (
              <div className="text-lg md:text-xl text-gray-300 leading-relaxed space-y-4">
                {slide.content.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )

    case 'image':
      return (
        <motion.div
          variants={slideVariants}
          initial="hidden"
          animate={isActive ? 'visible' : 'hidden'}
          className="relative w-full h-full"
        >
          {slide.image && (
            <>
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </>
          )}
          <motion.div
            variants={contentVariants}
            className="absolute bottom-0 left-0 right-0 p-8 md:p-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {slide.title}
            </h2>
            {slide.content && (
              <p className="text-lg md:text-xl text-gray-200 max-w-3xl">
                {slide.content}
              </p>
            )}
          </motion.div>
        </motion.div>
      )

    case 'text-image':
      const imageOnLeft = slide.imagePosition === 'left'
      return (
        <motion.div
          variants={slideVariants}
          initial="hidden"
          animate={isActive ? 'visible' : 'hidden'}
          className="relative w-full h-full bg-gradient-to-br from-gray-900 to-gray-800"
        >
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Text Column */}
            <motion.div
              variants={contentVariants}
              className={`flex items-center justify-center p-8 md:p-16 ${
                imageOnLeft ? 'lg:order-2' : 'lg:order-1'
              }`}
            >
              <div className="max-w-xl">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  {slide.title}
                </h2>
                {slide.content && (
                  <div className="text-base md:text-lg text-gray-300 leading-relaxed space-y-4">
                    {slide.content.split('\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Image Column */}
            <div
              className={`relative overflow-hidden ${
                imageOnLeft ? 'lg:order-1' : 'lg:order-2'
              }`}
            >
              {slide.image && (
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        </motion.div>
      )

    case 'video':
      return (
        <motion.div
          variants={slideVariants}
          initial="hidden"
          animate={isActive ? 'visible' : 'hidden'}
          className="relative w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-8 md:p-16"
        >
          <motion.div variants={contentVariants} className="w-full max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
              {slide.title}
            </h2>
            {slide.videoUrl && (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={getYoutubeEmbedUrl(slide.videoUrl)}
                  className="absolute top-0 left-0 w-full h-full rounded-2xl shadow-2xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      )

    case 'key-points':
      return (
        <motion.div
          variants={slideVariants}
          initial="hidden"
          animate={isActive ? 'visible' : 'hidden'}
          className="relative w-full h-full bg-gradient-to-br from-purple-900 via-gray-900 to-gray-800 flex items-center justify-center p-8 md:p-16"
        >
          <motion.div variants={contentVariants} className="max-w-4xl w-full">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-12 text-center">
              {slide.title}
            </h2>
            {slide.points && (
              <div className="space-y-6">
                {slide.points.map((point, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                    className="flex items-start gap-4 bg-white/5 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/10 transition-colors"
                  >
                    <CheckCircle className="w-7 h-7 text-green-400 flex-shrink-0 mt-1" />
                    <p className="text-lg md:text-xl text-gray-100 leading-relaxed">
                      {point}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )

    default:
      return null
  }
}

function getYoutubeEmbedUrl(url: string) {
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1]
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url
}
