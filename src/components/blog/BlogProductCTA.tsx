'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, ArrowRight, Check, X, Sparkles, Clock } from 'lucide-react'
import { trackCTAClicked } from '@/lib/analytics'

interface BlogProductCTAProps {
  variant: 'inline' | 'sticky' | 'final'
  articleSlug?: string
}

export function BlogProductCTA({ variant, articleSlug = '' }: BlogProductCTAProps) {
  const [dismissed, setDismissed] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // For sticky variant: show after scrolling 30% of the page
  useEffect(() => {
    if (variant !== 'sticky') {
      setIsVisible(true)
      return
    }

    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      setIsVisible(scrollPercent > 20 && scrollPercent < 85)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [variant])

  const handleClick = () => {
    trackCTAClicked({
      ctaId: `blog-${variant}-cta`,
      ctaText: 'Prueba gratis',
      location: variant === 'sticky' ? 'sidebar' : 'inline',
      destination: '/register'
    })
  }

  if (dismissed) return null

  // INLINE VARIANT - Mid-article CTA
  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="my-10 relative overflow-hidden"
      >
        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white shadow-xl">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-medium text-violet-200">Prueba gratis 15 días</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">
                ¿Tienes un apartamento turístico?
              </h3>
              <p className="text-violet-100 text-sm md:text-base">
                Crea tu manual digital en 10 minutos. Sin tarjeta de crédito.
              </p>
            </div>

            <Link
              href="/register"
              onClick={handleClick}
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-violet-700 font-bold rounded-xl hover:bg-violet-50 transition-all transform hover:scale-105 shadow-lg whitespace-nowrap"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Empezar gratis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </motion.div>
    )
  }

  // STICKY VARIANT - Sidebar floating CTA (desktop only)
  if (variant === 'sticky') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:block"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 w-64">
              {/* Close button */}
              <button
                onClick={() => setDismissed(true)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>

              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Rocket className="w-6 h-6 text-white" />
                </div>

                <h4 className="font-bold text-gray-900 mb-1">
                  Prueba Itineramio
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                  Crea tu manual digital gratis
                </p>

                <ul className="text-left text-xs text-gray-600 space-y-1.5 mb-4">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    <span>15 días gratis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    <span>Sin tarjeta de crédito</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    <span>Listo en 10 minutos</span>
                  </li>
                </ul>

                <Link
                  href="/register"
                  onClick={handleClick}
                  className="block w-full py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all"
                >
                  Empezar gratis
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // FINAL VARIANT - End of article CTA
  if (variant === 'final') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="my-12"
      >
        <div className="bg-gradient-to-br from-gray-900 via-violet-900 to-purple-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />

          <div className="relative text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
              <Clock className="w-4 h-4 text-violet-300" />
              <span className="text-sm font-medium text-violet-200">Configúralo en 10 minutos</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para profesionalizar tu alojamiento?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Únete a más de 500 anfitriones que ya usan Itineramio para ofrecer
              una experiencia premium a sus huéspedes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link
                href="/register"
                onClick={handleClick}
                className="inline-flex items-center px-8 py-4 bg-white text-violet-700 font-bold rounded-xl hover:bg-violet-50 transition-all transform hover:scale-105 shadow-lg"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Prueba 15 días gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                Sin tarjeta de crédito
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                Cancela cuando quieras
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                Soporte en español
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return null
}
