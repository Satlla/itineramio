'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ChevronRight,
  ChevronLeft,
  Home,
  MapPin,
  CheckCircle,
  Lightbulb,
  ArrowRight
} from 'lucide-react'

interface Step {
  target: string // CSS selector del elemento a resaltar
  title: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  action?: string // Texto del botón de acción
}

interface FirstPropertyOnboardingProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export default function FirstPropertyOnboarding({
  isOpen,
  onClose,
  onComplete
}: FirstPropertyOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  const steps: Step[] = [
    {
      target: '[data-onboarding="create-property-button"]',
      title: '¡Comienza aquí!',
      description: 'Haz clic en este botón para crear tu primera propiedad. Es rápido y sencillo.',
      position: 'bottom',
      action: 'Crear mi primera propiedad'
    },
    {
      target: '[data-onboarding="property-name"]',
      title: 'Dale un nombre',
      description: 'Escribe el nombre de tu propiedad. Por ejemplo: "Apartamento Centro Madrid"',
      position: 'right'
    },
    {
      target: '[data-onboarding="property-details"]',
      title: 'Añade los detalles',
      description: 'Completa la información básica: ubicación, número de habitaciones, etc.',
      position: 'right'
    },
    {
      target: '[data-onboarding="save-property"]',
      title: '¡Guarda tu propiedad!',
      description: 'Una vez completes los datos, guarda tu propiedad. Las zonas se crearán automáticamente.',
      position: 'top',
      action: 'Guardar propiedad'
    }
  ]

  // Find and track the target element
  useEffect(() => {
    if (!isOpen) return

    const findTarget = () => {
      const element = document.querySelector(steps[currentStep].target) as HTMLElement
      if (element) {
        setTargetElement(element)
        updateTooltipPosition(element)
      } else {
        // Si no se encuentra el elemento, intentar de nuevo en 100ms
        setTimeout(findTarget, 100)
      }
    }

    findTarget()

    // Update position on scroll/resize
    const handleUpdate = () => {
      if (targetElement) {
        updateTooltipPosition(targetElement)
      }
    }

    window.addEventListener('scroll', handleUpdate, true)
    window.addEventListener('resize', handleUpdate)

    return () => {
      window.removeEventListener('scroll', handleUpdate, true)
      window.removeEventListener('resize', handleUpdate)
    }
  }, [isOpen, currentStep, targetElement])

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen])

  const updateTooltipPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const step = steps[currentStep]
    const tooltipWidth = 350
    const tooltipHeight = 200
    const gap = 20

    let top = 0
    let left = 0

    switch (step.position) {
      case 'top':
        top = rect.top - tooltipHeight - gap
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        break
      case 'bottom':
        top = rect.bottom + gap
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        break
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        left = rect.left - tooltipWidth - gap
        break
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        left = rect.right + gap
        break
      default:
        top = rect.bottom + gap
        left = rect.left + rect.width / 2 - tooltipWidth / 2
    }

    // Keep tooltip on screen
    top = Math.max(gap, Math.min(top, window.innerHeight - tooltipHeight - gap))
    left = Math.max(gap, Math.min(left, window.innerWidth - tooltipWidth - gap))

    setTooltipPosition({ top, left })
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    onComplete()
    onClose()
  }

  const handleClose = () => {
    onClose()
  }

  if (!isOpen || !targetElement) return null

  const targetRect = targetElement.getBoundingClientRect()
  const currentStepData = steps[currentStep]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark overlay with spotlight */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] pointer-events-none"
            style={{
              background: `radial-gradient(
                circle at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px,
                transparent ${Math.max(targetRect.width, targetRect.height) / 2 + 10}px,
                rgba(0, 0, 0, 0.75) ${Math.max(targetRect.width, targetRect.height) / 2 + 30}px
              )`
            }}
          />

          {/* Highlight border around target */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed z-[9999] rounded-lg pointer-events-none"
            style={{
              top: targetRect.top - 4,
              left: targetRect.left - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
              boxShadow: '0 0 0 4px rgba(139, 92, 246, 0.6), 0 0 0 8px rgba(139, 92, 246, 0.3)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          />

          {/* Tooltip */}
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed z-[10000] bg-white rounded-xl shadow-2xl"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              width: 350,
              maxWidth: 'calc(100vw - 40px)'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4 rounded-t-xl relative">
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{currentStepData.title}</h3>
                  <p className="text-xs text-white/80">
                    Paso {currentStep + 1} de {steps.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                {currentStepData.description}
              </p>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-gray-200 rounded-full mb-4">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={handleClose}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  Saltar guía
                </button>

                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <button
                      onClick={handlePrev}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </button>
                  )}

                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-lg flex items-center gap-1 text-sm font-semibold text-white transition-all shadow-lg hover:shadow-xl"
                  >
                    {currentStep === steps.length - 1 ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        ¡Entendido!
                      </>
                    ) : (
                      <>
                        Siguiente
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pulsing animation CSS */}
          <style jsx>{`
            @keyframes pulse {
              0%, 100% {
                box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.6), 0 0 0 8px rgba(139, 92, 246, 0.3);
              }
              50% {
                box-shadow: 0 0 0 6px rgba(139, 92, 246, 0.8), 0 0 0 12px rgba(139, 92, 246, 0.5);
              }
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  )
}
