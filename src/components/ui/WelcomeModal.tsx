'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  QrCode,
  Send,
  MessageCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Smartphone,
  Printer,
  Mail,
  Target,
  X
} from 'lucide-react'
import { Button } from './Button'
import { useRouter } from 'next/navigation'

interface TrialStatus {
  isActive: boolean
  startedAt: Date | null
  endsAt: Date | null
  daysRemaining: number
  hasExpired: boolean
}

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  userName: string
  trialStatus?: TrialStatus | null
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  userName,
  trialStatus
}) => {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    console.log('🎨 WelcomeModal isOpen changed to:', isOpen)
    if (isOpen) {
      console.log('🎊 WelcomeModal opening - showing confetti')
      setShowConfetti(true)
      setCurrentSlide(0)
      // Import confetti dynamically to avoid SSR issues
      const loadConfetti = async () => {
        const confetti = (await import('canvas-confetti')).default
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B']
        })
      }
      loadConfetti()
    }
  }, [isOpen])

  const handleClose = () => {
    // ALWAYS save to localStorage when closing
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenWelcomeModal', 'true')
    }
    onClose()
  }

  const handleCreateFirstProperty = () => {
    handleClose()
    router.push('/properties/new')
  }

  const handleExploreDashboard = () => {
    handleClose()
    router.push('/main')
  }

  const features = [
    {
      icon: Home,
      title: "Crea zonas interactivas",
      description: "Divide tu propiedad en zonas con instrucciones detalladas"
    },
    {
      icon: QrCode,
      title: "Códigos QR imprimibles",
      description: "Acceso directo a las instrucciones desde cualquier dispositivo"
    },
    {
      icon: Mail,
      title: "Envío automático",
      description: "Tu manual se envía automáticamente antes del check-in"
    },
    {
      icon: MessageCircle,
      title: "Zonas individuales",
      description: "Envía solo la zona que necesiten tus huéspedes"
    },
    {
      icon: Clock,
      title: "Ahorra tiempo",
      description: "Hasta 8 horas/semana en gestión"
    },
    {
      icon: Sparkles,
      title: "Profesional y fácil",
      description: "Guías digitales en minutos, sin complicaciones"
    }
  ]

  const nextSlide = () => {
    if (currentSlide < 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[95vh] sm:max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 text-white p-4 sm:p-3 sm:p-4 md:p-3 sm:p-4 md:p-6 lg:p-8 rounded-t-2xl flex-shrink-0">
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  className="inline-block mb-2 sm:mb-4"
                >
                  <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
                </motion.div>

                <h1 className="text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">
                  ¡Bienvenido{userName ? `, ${userName}` : ''}!
                </h1>
                <p className="text-sm sm:text-base sm:text-lg md:text-xl opacity-90">
                  Tu herramienta para crear manuales digitales
                </p>
              </motion.div>

              {/* Slide indicators */}
              <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">
                {[0, 1].map((index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'w-8 bg-white'
                        : 'w-4 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Trial Countdown Banner */}
            {trialStatus && trialStatus.isActive && currentSlide === 0 && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mx-4 sm:mx-8 -mt-4 sm:-mt-6 mb-3 sm:mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-3 sm:p-3 sm:p-4 md:p-6 shadow-lg flex-shrink-0"
              >
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                  <div className="bg-amber-100 rounded-full p-2 sm:p-3">
                    <Clock className="w-5 h-5 sm:w-8 sm:h-8 text-amber-600" />
                  </div>
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1 sm:gap-2">
                      <span className="text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl sm:text-4xl font-bold text-amber-900">
                        {trialStatus.daysRemaining}
                      </span>
                      <span className="text-sm sm:text-lg font-semibold text-amber-700">
                        {trialStatus.daysRemaining === 1 ? 'día' : 'días'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-amber-700">
                      de período de prueba
                    </p>
                  </div>
                  <div className="bg-amber-100 rounded-full p-2 sm:p-3 hidden sm:block">
                    <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-amber-600" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Content Area - Scrollable if needed */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-3 sm:px-4 md:px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-3 sm:py-4 md:py-6">
              <AnimatePresence mode="wait">
                {/* Slide 1: Welcome */}
                {currentSlide === 0 && (
                  <motion.div
                    key="slide1"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    className="h-full flex flex-col justify-center"
                  >
                    <div className="text-center space-y-4 sm:space-y-6 py-4 sm:py-3 sm:py-4 md:py-3 sm:py-4 md:py-6 lg:py-8">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-block mx-auto"
                      >
                        <div className="w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                          <Home className="w-10 h-10 sm:w-14 sm:h-14 text-violet-600" />
                        </div>
                      </motion.div>

                      <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl sm:text-4xl font-bold text-gray-900"
                      >
                        Descubre todo lo que puedes hacer con Itineramio
                      </motion.h2>

                      <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-base sm:text-base sm:text-lg md:text-xl text-gray-600 max-w-[95vw] sm:max-w-[95vw] sm:max-w-[90vw] sm:max-w-[90vw] sm:max-w-sm md:max-w-md md:max-w-lg md:max-w-xl md:max-w-2xl mx-auto px-2"
                      >
                        Crea manuales digitales interactivos para tus propiedades en minutos.
                        Tus huéspedes accederán a toda la información desde su móvil.
                      </motion.p>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-3 sm:p-4 md:p-6 max-w-[95vw] sm:max-w-[90vw] sm:max-w-[90vw] sm:max-w-sm md:max-w-md md:max-w-lg md:max-w-xl mx-auto"
                      >
                        <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                          <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                          <h3 className="text-lg sm:text-base sm:text-lg md:text-xl font-bold text-green-900">
                            ¡Comienza hoy!
                          </h3>
                        </div>
                        <p className="text-sm sm:text-base text-center text-green-700">
                          Crea tu primera propiedad y descubre todas las funcionalidades
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* Slide 2: Features */}
                {currentSlide === 1 && (
                  <motion.div
                    key="slide2"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    className="h-full flex flex-col"
                  >
                    <motion.h2
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center"
                    >
                      Características principales
                    </motion.h2>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="bg-violet-100 rounded-lg p-2 flex-shrink-0">
                              <feature.icon className="w-5 h-5 text-violet-600" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                                {feature.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer with Navigation */}
            <div className="border-t border-gray-200 p-4 sm:p-3 sm:p-4 md:p-6 bg-gray-50 rounded-b-2xl flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                {/* Navigation Buttons */}
                <div className="flex gap-2 order-2 sm:order-1">
                  {currentSlide > 0 && (
                    <Button
                      onClick={prevSlide}
                      variant="outline"
                      className="px-4 py-2 text-sm sm:text-base"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </Button>
                  )}
                  {currentSlide < 1 && (
                    <Button
                      onClick={nextSlide}
                      className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 text-sm sm:text-base"
                    >
                      Siguiente
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto order-1 sm:order-2">
                  {currentSlide === 1 && (
                    <>
                      <Button
                        onClick={handleCreateFirstProperty}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 sm:px-3 sm:px-4 md:px-6 py-2 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 w-full sm:w-auto"
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Crear propiedad
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>

                      <Button
                        onClick={handleExploreDashboard}
                        variant="outline"
                        className="border-violet-200 text-violet-600 hover:bg-violet-50 px-4 sm:px-3 sm:px-4 md:px-6 py-2 text-sm sm:text-base font-semibold w-full sm:w-auto"
                      >
                        Explorar
                      </Button>
                    </>
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
