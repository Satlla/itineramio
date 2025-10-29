'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Home,
  Wifi,
  QrCode,
  Share2,
  FolderOpen,
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
    subtitle: 'Tu plataforma de manuales digitales',
    description: 'Crea experiencias inolvidables para tus huéspedes con manuales digitales interactivos.',
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    iconColor: 'text-violet-500',
    features: [
      { icon: '✨', text: 'Interfaz intuitiva y moderna' },
      { icon: '⚡', text: 'Configuración en minutos' },
      { icon: '📱', text: 'Optimizado para móvil' }
    ]
  },
  {
    id: 'zones',
    icon: Wifi,
    title: 'Zonas inteligentes',
    subtitle: 'Pre-configuradas para ti',
    description: 'Creamos automáticamente las zonas más comunes. Solo personaliza con tu información.',
    gradient: 'from-blue-600 via-cyan-600 to-teal-600',
    iconColor: 'text-blue-500',
    features: [
      { icon: '🔐', text: 'WiFi y códigos de acceso' },
      { icon: '🍳', text: 'Electrodomésticos' },
      { icon: '🎬', text: 'Vídeos de check-in' }
    ]
  },
  {
    id: 'qr',
    icon: QrCode,
    title: 'Códigos QR',
    subtitle: 'Acceso instantáneo',
    description: 'Genera QR únicos para cada zona. Tus huéspedes solo tienen que escanear.',
    gradient: 'from-emerald-600 via-green-600 to-lime-600',
    iconColor: 'text-emerald-500',
    features: [
      { icon: '🔲', text: 'QR por zona o completo' },
      { icon: '🖨️', text: 'Imprime fácilmente' },
      { icon: '📊', text: 'Estadísticas de uso' }
    ]
  },
  {
    id: 'share',
    icon: Share2,
    title: 'Comparte fácilmente',
    subtitle: 'Integrado con todo',
    description: 'Envía por WhatsApp, email o intégralo con Airbnb y Booking.',
    gradient: 'from-amber-600 via-orange-600 to-red-600',
    iconColor: 'text-amber-500',
    features: [
      { icon: '🔗', text: 'Enlace único' },
      { icon: '✉️', text: 'Email y WhatsApp' },
      { icon: '🤖', text: 'Integración OTAs' }
    ]
  },
  {
    id: 'manage',
    icon: FolderOpen,
    title: 'Gestiona múltiples',
    subtitle: 'Todo en un lugar',
    description: 'Perfecto para gestores y hoteleros. Organiza todas tus propiedades.',
    gradient: 'from-pink-600 via-rose-600 to-red-600',
    iconColor: 'text-pink-500',
    features: [
      { icon: '🏢', text: 'Conjuntos de propiedades' },
      { icon: '📋', text: 'Panel centralizado' },
      { icon: '⚡', text: 'Duplica contenido' }
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

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenUnifiedWelcome', 'true')
      localStorage.setItem('hasSeenWelcomeModal', 'true')
      localStorage.setItem('hasCompletedOnboarding', 'true')
    }
    onClose()
    router.push('/properties/new')
  }

  const handleSkip = () => {
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
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Progress dots */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
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
            <div className={`relative bg-gradient-to-br ${slide.gradient} text-white pt-16 pb-12 px-8`}>
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
                className="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center"
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
                  <IconComponent className="w-10 h-10 text-white" />
                </motion.div>
              </motion.div>

              {/* Trial badge - only on first slide */}
              {currentSlide === 0 && trialDaysRemaining && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
                >
                  <p className="text-sm font-semibold text-white">
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
                  <h1 className="text-3xl font-bold mb-2">
                    {currentSlide === 0 && userName ? `¡Hola, ${userName}!` : slide.title}
                  </h1>
                  <p className="text-lg opacity-90">{slide.subtitle}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Content */}
            <div className="p-8">
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
                  <p className="text-gray-600 text-center mb-8 text-lg">
                    {slide.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {slide.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                        className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-2xl">{feature.icon}</span>
                        <span className="text-gray-700 font-medium">{feature.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-700"
                >
                  Saltar
                </Button>

                <div className="flex gap-3">
                  {!isFirstSlide && (
                    <Button
                      onClick={handlePrevious}
                      variant="outline"
                      className="border-gray-300"
                    >
                      Anterior
                    </Button>
                  )}

                  {!isLastSlide ? (
                    <Button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      Siguiente
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleComplete}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Crear primera propiedad
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
