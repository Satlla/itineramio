'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lightbulb, ArrowRight, SkipForward } from 'lucide-react'
import { Button } from './Button'

interface OnboardingPopupProps {
  isOpen: boolean
  title: string
  description: string
  onNext?: () => void
  onSkip: () => void
  showNextButton?: boolean
  nextButtonText?: string
}

export function OnboardingPopup({
  isOpen,
  title,
  description,
  onNext,
  onSkip,
  showNextButton = false,
  nextButtonText = 'Siguiente'
}: OnboardingPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] w-full max-w-md mx-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 text-white p-6">
                <button
                  onClick={onSkip}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  title="Salir del onboarding"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                    className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
                  >
                    <Lightbulb className="w-6 h-6 text-yellow-300" fill="currentColor" />
                  </motion.div>
                  <h2 className="text-2xl font-bold">{title}</h2>
                </div>

                <div className="h-1 w-full bg-white/20 rounded-full">
                  <motion.div
                    initial={{ width: "33%" }}
                    animate={{ width: "33%" }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  {description}
                </p>

                {/* Step-by-step instructions */}
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-4 mb-6 border border-violet-200">
                  <h3 className="font-semibold text-violet-900 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                    Pasos a seguir:
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-violet-600 font-bold mt-0.5">•</span>
                      <span><strong>Completa el formulario:</strong> Rellena todos los campos (nombre, descripción, habitaciones, baños, etc.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-600 font-bold mt-0.5">•</span>
                      <span><strong>Sube una foto:</strong> Añade una imagen principal de tu alojamiento</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-600 font-bold mt-0.5">•</span>
                      <span><strong>Busca el botón resaltado:</strong> Cuando completes todos los campos, el botón "Siguiente" se iluminará con un brillo morado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-600 font-bold mt-0.5">•</span>
                      <span><strong>Continúa:</strong> Haz clic en "Siguiente" para pasar al siguiente paso</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  {showNextButton && onNext && (
                    <Button
                      onClick={onNext}
                      className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      {nextButtonText}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}

                  <Button
                    onClick={onSkip}
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Salir del tutorial
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
