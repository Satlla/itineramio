'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface TourStep {
  targetId: string
  title: string
  description: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'zonas',
    title: 'Secciones del manual',
    description: 'Estas son las secciones de tu manual. Tus huespedes acceden escaneando un QR.',
    position: 'top',
  },
  {
    targetId: 'demo-chatbot-btn',
    title: 'Asistente IA 24/7',
    description: 'Tu asistente IA 24/7. Pruebalo! Pregunta lo que quieras.',
    position: 'top',
  },
  {
    targetId: 'language-selector',
    title: '3 idiomas automaticos',
    description: 'Tu manual funciona en espanol, ingles y frances automaticamente.',
    position: 'bottom',
  },
  {
    targetId: 'demo-register-cta',
    title: 'Mantener tu manual',
    description: 'Registrate para mantener tu manual activo para siempre.',
    position: 'top',
  },
]

interface DemoGuidedTourProps {
  isActive: boolean
}

export default function DemoGuidedTour({ isActive }: DemoGuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(-1)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [dismissed, setDismissed] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isActive) return

    // Check if tour was already completed
    const completed = localStorage.getItem('demo-guided-tour-completed')
    if (completed) {
      setDismissed(true)
      return
    }

    // Start tour sequence with delays
    const stepDelays = [1000, 9000, 17000, 25000]
    const timers: NodeJS.Timeout[] = []

    stepDelays.forEach((delay, index) => {
      const timer = setTimeout(() => {
        if (!dismissed) {
          setCurrentStep(index)
          updatePosition(index)
        }
      }, delay)
      timers.push(timer)
    })

    // Auto-dismiss after last step + 8s
    const dismissTimer = setTimeout(() => {
      handleDismiss()
    }, 33000)
    timers.push(dismissTimer)

    return () => timers.forEach(clearTimeout)
  }, [isActive, dismissed])

  const updatePosition = (stepIndex: number) => {
    const step = TOUR_STEPS[stepIndex]
    if (!step) return

    const target = document.getElementById(step.targetId)
    if (!target) return

    const rect = target.getBoundingClientRect()
    const scrollTop = window.scrollY

    let top = 0
    let left = 0

    switch (step.position) {
      case 'top':
        top = rect.top + scrollTop - 12
        left = rect.left + rect.width / 2
        break
      case 'bottom':
        top = rect.bottom + scrollTop + 12
        left = rect.left + rect.width / 2
        break
      case 'left':
        top = rect.top + scrollTop + rect.height / 2
        left = rect.left - 12
        break
      case 'right':
        top = rect.top + scrollTop + rect.height / 2
        left = rect.right + 12
        break
    }

    // Clamp left to stay within viewport (tooltip is w-72 = 288px)
    const tooltipWidth = 288
    const viewportWidth = window.innerWidth
    const padding = 16
    if (step.position === 'top' || step.position === 'bottom') {
      // Centered tooltips: ensure they don't overflow
      const minLeft = padding + tooltipWidth / 2
      const maxLeft = viewportWidth - padding - tooltipWidth / 2
      left = Math.max(minLeft, Math.min(maxLeft, left))
    }

    setTooltipPosition({ top, left })

    // Scroll into view if needed
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleDismiss = () => {
    setDismissed(true)
    setCurrentStep(-1)
    localStorage.setItem('demo-guided-tour-completed', 'true')
  }

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const next = currentStep + 1
      setCurrentStep(next)
      updatePosition(next)
    } else {
      handleDismiss()
    }
  }

  if (dismissed || currentStep < 0 || currentStep >= TOUR_STEPS.length) return null

  const step = TOUR_STEPS[currentStep]

  return (
    <>
      {/* Semi-transparent overlay */}
      <div
        className="fixed inset-0 z-[80] bg-black/30"
        onClick={handleDismiss}
      />

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: step.position === 'top' ? 10 : step.position === 'bottom' ? -10 : 0 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{
            position: 'absolute',
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: step.position === 'top' ? 'translate(-50%, -100%)'
              : step.position === 'bottom' ? 'translate(-50%, 0)'
              : step.position === 'left' ? 'translate(-100%, -50%)'
              : 'translate(0, -50%)',
            zIndex: 90,
          }}
          className="w-72 pointer-events-auto"
        >
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-xl shadow-black/30">
            {/* Close */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="space-y-1.5 pr-6">
              <p className="text-sm font-semibold text-white">{step.title}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{step.description}</p>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-1">
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${i === currentStep ? 'bg-violet-400' : 'bg-gray-700'}`}
                  />
                ))}
              </div>
              <button
                onClick={handleNext}
                className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
              >
                {currentStep < TOUR_STEPS.length - 1 ? 'Siguiente' : 'Entendido'}
              </button>
            </div>

            {/* Arrow */}
            <div
              className={`absolute w-3 h-3 bg-gray-900 border border-gray-700 rotate-45 ${
                step.position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-t-0 border-l-0'
                : step.position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-b-0 border-r-0'
                : step.position === 'left' ? 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 border-b-0 border-l-0'
                : 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 border-t-0 border-r-0'
              }`}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}
