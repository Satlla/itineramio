'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gift, ArrowRight, Sparkles } from 'lucide-react'

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
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

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

    // Don't show if already subscribed or recently shown
    const hasSubscribed = localStorage.getItem('hasSubscribedNewsletter')
    if (hasSubscribed || !checkCooldown()) return

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          source: 'exit_intent',
          tags: ['exit-intent-subscriber']
        })
      })

      if (!response.ok) {
        throw new Error('Error al suscribirse')
      }

      setIsSuccess(true)
      localStorage.setItem('hasSubscribedNewsletter', 'true')

      // Track conversion
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'exit_intent_converted', {
          event_category: 'conversion',
        })
      }

      // Close after success
      setTimeout(() => {
        setIsVisible(false)
      }, 3000)

    } catch (err) {
      setError('Error al suscribirse. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
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
            <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 text-white">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">¡Espera!</h2>
                  <p className="text-violet-100 text-sm">Tenemos algo para ti</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-violet-100">
                <Sparkles className="w-4 h-4" />
                <span>Oferta exclusiva para nuevos suscriptores</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {isSuccess ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">¡Perfecto!</h3>
                  <p className="text-gray-600">Revisa tu email para recibir tu guía gratuita.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Descarga nuestra Guía Gratuita
                  </h3>
                  <p className="text-gray-600 mb-6">
                    <strong>50 puntos esenciales</strong> para crear manuales digitales que impresionan a tus huéspedes y reducen tus llamadas un 80%.
                  </p>

                  {/* Benefits */}
                  <ul className="space-y-2 mb-6">
                    {[
                      'Checklist completo de zonas',
                      'Plantillas de instrucciones',
                      'Tips para reducir consultas'
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Tu email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                      required
                    />

                    {error && (
                      <p className="text-red-600 text-sm">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Descargar Guía Gratis
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Sin spam. Puedes darte de baja cuando quieras.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
