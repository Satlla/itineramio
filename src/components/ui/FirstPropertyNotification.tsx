'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lightbulb, ArrowRight, Home } from 'lucide-react'

interface FirstPropertyNotificationProps {
  isOpen: boolean
  onClose: () => void
  onStartTour: () => void
}

export default function FirstPropertyNotification({
  isOpen,
  onClose,
  onStartTour
}: FirstPropertyNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Mostrar la notificación después de un pequeño delay para mejor UX
      const timer = setTimeout(() => setIsVisible(true), 500)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  const handleStartTour = () => {
    onStartTour()
    setIsVisible(false)
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed top-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 z-[10001] sm:w-full max-w-md"
        >
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl shadow-2xl overflow-hidden">
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 animate-pulse" />

            {/* Content */}
            <div className="relative p-4 sm:p-6">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-200/50 hover:bg-amber-300/50 flex items-center justify-center transition-colors group"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700 group-hover:text-amber-900" />
              </button>

              {/* Icon and content */}
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Animated lightbulb */}
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="flex-shrink-0"
                >
                  <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-60 animate-pulse" />

                    {/* Lightbulb */}
                    <div className="relative w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                      <Lightbulb className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="currentColor" />
                    </div>
                  </div>
                </motion.div>

                {/* Text content */}
                <div className="flex-1 pt-0 sm:pt-1 pr-6 sm:pr-0">
                  <h3 className="text-base sm:text-xl font-bold text-amber-900 mb-1.5 sm:mb-2">
                    ¡Crea tu primera propiedad!
                  </h3>
                  <p className="text-xs sm:text-base text-amber-800 mb-3 sm:mb-4 leading-relaxed">
                    Te guiaremos paso a paso para que puedas crear tu primera propiedad y comenzar a usar Itineramio.
                  </p>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={handleStartTour}
                      className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-xs sm:text-base"
                    >
                      <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Comenzar guía
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>

                    <button
                      onClick={handleClose}
                      className="px-4 sm:px-5 py-2 sm:py-2.5 bg-white/80 hover:bg-white text-amber-800 rounded-lg font-medium border border-amber-200 hover:border-amber-300 transition-colors text-xs sm:text-base"
                    >
                      Más tarde
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom tip */}
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-amber-200 flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse flex-shrink-0 mt-0.5 sm:mt-1" />
                <p className="text-[10px] sm:text-xs text-amber-700 leading-relaxed">
                  También verás un icono de bombilla en el botón de crear propiedad
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
