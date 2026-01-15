'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, ArrowRight, Gift } from 'lucide-react'
import Link from 'next/link'

interface ExitIntentPopupProps {
  // Delay before popup can show (ms)
  delay?: number
  // How long to wait before showing again (days)
  cooldownDays?: number
  // Storage key for tracking
  storageKey?: string
  // Auto-show after delay (not just on exit intent)
  autoShowDelay?: number
}

// ONLY show popup on these landing pages (for non-customers)
// NOTE: /main is the user dashboard - DO NOT include it here
const ALLOWED_PAGES = [
  '/',
  '/comparar',
  '/funcionalidades',
]

export function ExitIntentPopup({
  delay = 5000,
  cooldownDays = 7,
  storageKey = 'exitIntentShown',
  autoShowDelay
}: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [hasShownThisSession, setHasShownThisSession] = useState(false) // Only show once per session
  const pathname = usePathname()

  // ONLY show on allowed landing pages (whitelist approach)
  const isAllowedPage = ALLOWED_PAGES.some(path => pathname === path)

  // Check cooldown function
  const checkCooldown = useCallback(() => {
    if (typeof window === 'undefined') return false

    const lastShown = localStorage.getItem(storageKey)
    if (!lastShown) return true

    const lastShownDate = new Date(parseInt(lastShown))
    const now = new Date()
    const daysSince = (now.getTime() - lastShownDate.getTime()) / (1000 * 60 * 60 * 24)

    return daysSince >= cooldownDays
  }, [storageKey, cooldownDays])

  // Check if we should show the popup (only on allowed pages)
  useEffect(() => {
    if (!isAllowedPage) return

    // Don't show if already used calculator or recently shown
    const hasUsedCalculator = localStorage.getItem('hasUsedTimeCalculator')
    if (hasUsedCalculator || !checkCooldown()) return

    // Wait for delay before enabling exit intent
    const timer = setTimeout(() => {
      setIsReady(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay, checkCooldown, isAllowedPage])

  // Auto-show after specified delay (ONLY on allowed landing pages)
  useEffect(() => {
    if (!isAllowedPage || !autoShowDelay || isVisible || hasShownThisSession) return

    // Don't show if already used calculator or recently shown
    const hasUsedCalculator = localStorage.getItem('hasUsedTimeCalculator')
    if (hasUsedCalculator || !checkCooldown()) return

    const autoTimer = setTimeout(() => {
      setIsVisible(true)
      setHasShownThisSession(true)
      localStorage.setItem(storageKey, Date.now().toString())

      // Track event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'time_popup_auto_shown', {
          event_category: 'engagement',
          event_label: 'time_calculator_popup',
          page_path: pathname
        })
      }
    }, autoShowDelay)

    return () => clearTimeout(autoTimer)
  }, [autoShowDelay, isAllowedPage, isVisible, hasShownThisSession, checkCooldown, storageKey, pathname])

  // Detect exit intent (mouse leaving viewport at top) - ONLY on allowed pages
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (!isReady || isVisible || !isAllowedPage || hasShownThisSession) return

    // Only trigger if mouse leaves at the top
    if (e.clientY <= 5) {
      setIsVisible(true)
      setHasShownThisSession(true)
      localStorage.setItem(storageKey, Date.now().toString())

      // Track event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'exit_intent_shown', {
          event_category: 'engagement',
          event_label: 'time_calculator_popup'
        })
      }
    }
  }, [isReady, isVisible, storageKey, isAllowedPage, hasShownThisSession])

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

  // Only render on allowed landing pages
  if (!isAllowedPage) return null

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
                  <h2 className="text-2xl font-bold">¡Espera, no te vayas!</h2>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#222222] mb-3">
                Calcula en menos de 1 minuto cuánto tiempo gastas al año en tareas repetitivas
              </h3>

              <p className="text-[#717171] mb-5">
                Responder siempre lo mismo: WiFi, parking, cómo funciona la vitro, normas de la comunidad...
              </p>

              {/* Discount offer */}
              <div className="bg-[#F0FDF4] border border-[#22C55E] rounded-xl p-4 mb-5">
                <div className="flex items-start gap-3">
                  <Gift className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#166534] text-sm">
                      20% de descuento si superas las 40h/año
                    </p>
                    <p className="text-[#15803D] text-xs mt-1">
                      Te enviamos el código por email si el tiempo que pierdes es una locura
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <ul className="space-y-2 mb-6">
                {[
                  'Resultado en 30 segundos',
                  'Informe detallado por email',
                  'Si superas 40h: código WELCOME20'
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
                className="w-full py-3.5 bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                Calcular mi tiempo perdido
                <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="text-xs text-[#717171] text-center mt-4">
                Sin registro. Solo tu email para enviarte el informe.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
