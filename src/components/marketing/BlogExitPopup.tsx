'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, ArrowRight, Check, Mail, User, Gift } from 'lucide-react'
import { trackGenerateLead } from '@/lib/analytics'

interface BlogExitPopupProps {
  delay?: number
  cooldownDays?: number
}

export function BlogExitPopup({
  delay = 8000,
  cooldownDays = 3
}: BlogExitPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [hasShownThisSession, setHasShownThisSession] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const pathname = usePathname()

  const storageKey = 'blogExitPopupShown'

  // Only show on blog pages
  const isBlogPage = pathname?.startsWith('/blog/') && pathname !== '/blog'

  const checkCooldown = useCallback(() => {
    if (typeof window === 'undefined') return false
    const lastShown = localStorage.getItem(storageKey)
    if (!lastShown) return true
    const daysSince = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24)
    return daysSince >= cooldownDays
  }, [cooldownDays])

  // Initialize after delay
  useEffect(() => {
    if (!isBlogPage) return

    // Check if user is already subscribed or recently shown
    const isSubscribed = localStorage.getItem('blogLeadCaptured')
    if (isSubscribed || !checkCooldown()) return

    const timer = setTimeout(() => {
      setIsReady(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay, checkCooldown, isBlogPage])

  // Detect exit intent
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (!isReady || isVisible || !isBlogPage || hasShownThisSession) return

    if (e.clientY <= 5) {
      setIsVisible(true)
      setHasShownThisSession(true)
      localStorage.setItem(storageKey, Date.now().toString())

      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'blog_exit_popup_shown', {
          event_category: 'engagement',
          page_path: pathname
        })
      }
    }
  }, [isReady, isVisible, isBlogPage, hasShownThisSession, pathname])

  useEffect(() => {
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [handleMouseLeave])

  const handleClose = () => {
    setIsVisible(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || name.trim().length < 2) {
      setStatus('error')
      setErrorMessage('Introduce tu nombre')
      return
    }

    if (!email || !email.includes('@')) {
      setStatus('error')
      setErrorMessage('Introduce un email válido')
      return
    }

    setStatus('loading')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email,
          source: 'blog-exit-popup',
          tags: ['blog-lead', 'lead-magnet', 'kit-anfitrion']
        })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        localStorage.setItem('blogLeadCaptured', 'true')

        trackGenerateLead({
          source: 'blog',
          value: 15,
          leadMagnet: 'kit-anfitrion-profesional'
        })

        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'blog_lead_captured', {
            event_category: 'conversion',
            event_label: 'kit-anfitrion'
          })
        }

        // Redirect to download or thank you page after 2 seconds
        setTimeout(() => {
          window.location.href = '/recursos/kit-anfitrion/gracias'
        }, 2000)
      } else {
        setStatus('error')
        setErrorMessage(data.error || 'Error al enviar. Inténtalo de nuevo.')
      }
    } catch (error) {
      setStatus('error')
      setErrorMessage('Error de conexión')
    }
  }

  if (!isBlogPage) return null

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
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-violet-600 to-purple-700 p-6 text-white">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-violet-200 text-sm font-medium">Antes de irte...</p>
                  <h2 className="text-xl font-bold">¡Llévate esto gratis!</h2>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">¡Listo!</h3>
                  <p className="text-gray-600">Revisa tu email para descargar el kit</p>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-start gap-4 mb-5 p-4 bg-violet-50 rounded-xl">
                    <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        Kit del Anfitrión Profesional
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Todo lo que necesitas para empezar con buen pie
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {[
                      'Checklist de requisitos legales 2026',
                      'Plantilla de normas de la casa',
                      'Guía: Cómo conseguir 5 estrellas',
                      'Lista de amenities imprescindibles'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tu nombre"
                        disabled={status === 'loading'}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none disabled:bg-gray-100"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        disabled={status === 'loading'}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none disabled:bg-gray-100"
                      />
                    </div>

                    {status === 'error' && (
                      <p className="text-sm text-red-600">{errorMessage}</p>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {status === 'loading' ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Descargar gratis
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    🔒 Sin spam. Te enviaremos el kit y consejos útiles.
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
