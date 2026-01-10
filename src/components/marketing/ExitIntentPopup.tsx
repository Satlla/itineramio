'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, ArrowRight, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface ExitIntentPopupProps {
  // Delay before popup can show (ms)
  delay?: number
  // How long to wait before showing again (days)
  cooldownDays?: number
  // Storage key for tracking
  storageKey?: string
}

export function ExitIntentPopup({
  delay = 5000,
  cooldownDays = 7,
  storageKey = 'exitIntentShown'
}: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isReady, setIsReady] = useState(false)

  // Check if we should show the popup
  useEffect(() => {
    const checkCooldown = () => {
      if (typeof window === 'undefined') return false

      const lastShown = localStorage.getItem(storageKey)
      if (!lastShown) return true

      const lastShownDate = new Date(parseInt(lastShown))
      const now = new Date()
      const daysSince = (now.getTime() - lastShownDate.getTime()) / (1000 * 60 * 60 * 24)

      return daysSince >= cooldownDays
    }

    // Don't show if already used calculator or recently shown
    const hasUsedCalculator = localStorage.getItem('hasUsedTimeCalculator')
    if (hasUsedCalculator || !checkCooldown()) return

    // Wait for delay before enabling
    const timer = setTimeout(() => {
      setIsReady(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay, cooldownDays, storageKey])

  // Detect exit intent (mouse leaving viewport at top)
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (!isReady || isVisible) return

    // Only trigger if mouse leaves at the top
    if (e.clientY <= 5) {
      setIsVisible(true)
      localStorage.setItem(storageKey, Date.now().toString())

      // Track event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'exit_intent_shown', {
          event_category: 'engagement',
          event_label: 'time_calculator_popup'
        })
      }
    }
  }, [isReady, isVisible, storageKey])

  useEffect(() => {
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [handleMouseLeave])

  const handleClose = () => {
    setIsVisible(false)
  }

  const handleCalculatorClick = () => {
    // Track conversion
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exit_intent_click', {
        event_category: 'conversion',
        event_label: 'time_calculator'
      })
    }
    localStorage.setItem('hasUsedTimeCalculator', 'true')
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-[#FF385C] p-6 text-white">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Antes de irte...</h2>
                  <p className="text-white/80 text-sm">Descubre algo importante</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Alert */}
              <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-xl p-4 mb-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#92400E] text-sm">
                      El anfitrion medio pierde 150+ horas al ano
                    </p>
                    <p className="text-[#A16207] text-xs mt-1">
                      En tareas repetitivas que podrian automatizarse
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-[#222222] mb-2">
                Cuanto tiempo pierdes tu?
              </h3>
              <p className="text-[#717171] mb-5">
                Calcula en 30 segundos las horas que dedicas a responder las mismas preguntas: WiFi, normas, parking, electrodomesticos...
              </p>

              {/* Benefits */}
              <ul className="space-y-2 mb-6">
                {[
                  'Resultado personalizado al instante',
                  'Informe detallado por email',
                  'Consejos para automatizar'
                ].map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#222222]">
                    <svg className="w-4 h-4 text-[#16A34A] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/hub/tools/time-calculator"
                onClick={handleCalculatorClick}
                className="w-full py-3.5 bg-[#222222] hover:bg-[#000000] text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                Calcular mi tiempo perdido
                <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="text-xs text-[#717171] text-center mt-4">
                Solo tarda 30 segundos. Sin registro.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
