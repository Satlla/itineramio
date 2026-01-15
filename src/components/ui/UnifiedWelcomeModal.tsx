'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Home,
  Globe,
  MessageCircle,
  Bell,
  ChevronRight,
  X,
  Check
} from 'lucide-react'
import { Button } from './Button'
import { useRouter } from 'next/navigation'

interface UnifiedWelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
  trialDaysRemaining?: number
}

const slides = [
  {
    id: 'welcome',
    icon: Sparkles,
    title: '¡Bienvenido a Itineramio!',
    subtitle: 'Deja de repetir lo mismo a cada huésped',
    description: 'Crea un manual digital con toda la información que tus huéspedes necesitan. WiFi, check-in, electrodomésticos... todo en un solo lugar.',
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    iconColor: 'text-violet-500',
    features: [
      { icon: '🔁', text: 'Olvídate de repetir las mismas respuestas' },
      { icon: '📱', text: 'Accesible desde cualquier móvil' },
      { icon: '⚡', text: 'Configúralo en minutos' }
    ]
  },
  {
    id: 'zones',
    icon: Home,
    title: 'Zonas ilimitadas',
    subtitle: 'WiFi, Check-in, Lavadora, Cocina...',
    description: 'Crea todas las zonas que necesites con vídeos, imágenes o texto. Tus huéspedes tendrán toda la información organizada.',
    gradient: 'from-blue-600 via-cyan-600 to-teal-600',
    iconColor: 'text-blue-500',
    features: [
      { icon: '🎬', text: 'Añade vídeos explicativos' },
      { icon: '📸', text: 'Sube imágenes paso a paso' },
      { icon: '📝', text: 'Instrucciones detalladas' }
    ]
  },
  {
    id: 'multilang',
    icon: Globe,
    title: 'Manual en varios idiomas',
    subtitle: 'Español, Inglés, Francés',
    description: 'Tu manual se muestra automáticamente en el idioma del huésped. Llega a visitantes de todo el mundo.',
    gradient: 'from-emerald-600 via-green-600 to-lime-600',
    iconColor: 'text-emerald-500',
    features: [
      { icon: '🇪🇸', text: 'Español' },
      { icon: '🇬🇧', text: 'Inglés' },
      { icon: '🇫🇷', text: 'Francés' }
    ]
  },
  {
    id: 'whatsapp',
    icon: MessageCircle,
    title: 'WhatsApp a un click',
    subtitle: 'Conexión directa con tus huéspedes',
    description: 'Si tienen un problema, pueden contactarte por WhatsApp con un solo toque. Sin buscar números ni copiar enlaces.',
    gradient: 'from-green-600 via-emerald-600 to-teal-600',
    iconColor: 'text-green-500',
    features: [
      { icon: '💬', text: 'Botón directo a WhatsApp' },
      { icon: '🚀', text: 'Respuesta inmediata' },
      { icon: '✅', text: 'Menos llamadas, más soluciones' }
    ]
  },
  {
    id: 'announcements',
    icon: Bell,
    title: 'Avisos importantes',
    subtitle: 'Lo primero que ven al entrar',
    description: 'Añade avisos destacados para que tus huéspedes sepan lo esencial nada más aterrizar en tu manual.',
    gradient: 'from-amber-600 via-orange-600 to-red-600',
    iconColor: 'text-amber-500',
    features: [
      { icon: '🔔', text: 'Avisos visibles al entrar' },
      { icon: '⚠️', text: 'Información importante primero' },
      { icon: '📌', text: 'Normas, horarios, contactos' }
    ]
  }
]

export function UnifiedWelcomeModal({
  isOpen,
  onClose,
  userName,
  trialDaysRemaining
}: UnifiedWelcomeModalProps) {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)
  const isLastSlide = currentSlide === slides.length - 1
  const isFirstSlide = currentSlide === 0
  const slide = slides[currentSlide]

  useEffect(() => {
    if (isOpen && currentSlide === 0) {
      // Confetti only on first slide
      const loadConfetti = async () => {
        const confetti = (await import('canvas-confetti')).default
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#8B5CF6', '#06B6D4', '#10B981']
        })
      }
      loadConfetti()
    }
  }, [isOpen, currentSlide])

  const handleNext = () => {
    if (!isLastSlide) {
      setDirection(1)
      setCurrentSlide(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstSlide) {
      setDirection(-1)
      setCurrentSlide(prev => prev - 1)
    }
  }

  const handleComplete = async () => {
    // Save to database
    try {
      await fetch('/api/user/complete-onboarding', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Error saving onboarding completion:', error)
    }

    // Save to localStorage as backup
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenUnifiedWelcome', 'true')
      localStorage.setItem('hasSeenWelcomeModal', 'true')
      localStorage.setItem('hasCompletedOnboarding', 'true')
    }
    onClose()
    router.push('/properties/new')
  }

  const handleSkip = async () => {
    // Save to database
    try {
      await fetch('/api/user/complete-onboarding', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Error saving onboarding completion:', error)
    }

    // Save to localStorage as backup
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenUnifiedWelcome', 'true')
      localStorage.setItem('hasSeenWelcomeModal', 'true')
      localStorage.setItem('hasCompletedOnboarding', 'true')
    }
    onClose()
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  const IconComponent = slide.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4"
          onClick={handleSkip}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-lg md:max-w-xl overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>

            {/* Progress dots */}
            <div className="absolute top-3 sm:top-3 sm:p-4 md:p-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
              {slides.map((_, index) => (
                <motion.div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentSlide
                      ? 'bg-white w-8'
                      : 'bg-white/40 w-1.5'
                  }`}
                  layout
                />
              ))}
            </div>

            {/* Header with gradient */}
            <div className={`relative bg-gradient-to-br ${slide.gradient} text-white pt-10 sm:pt-14 pb-6 sm:pb-10 px-4 sm:px-6`}>
              {/* Animated Icon */}
              <motion.div
                key={currentSlide}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                className="w-14 h-14 sm:w-18 md:w-20 sm:h-18 md:h-20 mx-auto mb-4 sm:mb-6 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center"
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                </motion.div>
              </motion.div>

              {/* Trial badge - only on first slide */}
              {currentSlide === 0 && trialDaysRemaining && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2"
                >
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    ✨ {trialDaysRemaining} días de prueba
                  </p>
                </motion.div>
              )}

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentSlide}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="text-center"
                >
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">
                    {currentSlide === 0 && userName ? `¡Hola, ${userName}!` : slide.title}
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg opacity-90">{slide.subtitle}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentSlide}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                >
                  <p className="text-gray-600 text-center mb-4 sm:mb-6 md:mb-8 text-xs sm:text-sm md:text-base lg:text-lg">
                    {slide.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {slide.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                        className="flex items-center gap-3 sm:gap-4 bg-gray-50 rounded-xl p-3 sm:p-4 hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-lg sm:text-xl flex-shrink-0">{feature.icon}</span>
                        <span className="text-gray-700 font-medium text-xs sm:text-sm md:text-base">{feature.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex flex-row items-center justify-between gap-3">
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-700 text-sm px-3 py-2"
                >
                  Saltar
                </Button>

                <div className="flex gap-3">
                  {!isFirstSlide && (
                    <Button
                      onClick={handlePrevious}
                      variant="outline"
                      className="border-gray-300 text-sm px-4 py-2"
                    >
                      Anterior
                    </Button>
                  )}

                  {!isLastSlide ? (
                    <Button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all text-sm px-5 py-2"
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleComplete}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all text-sm px-5 py-2"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      ¡Empezar!
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
