'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, Bot, QrCode, Globe, Clock, MessageCircle, Zap } from 'lucide-react'

interface DemoGuidedTourProps {
  isActive: boolean
}

const SLIDES = [
  {
    emoji: '🏠',
    tag: 'Tu manual ya está activo',
    title: 'Esto es lo que ven tus huéspedes',
    bullets: [
      { icon: QrCode, text: 'Acceden escaneando el QR de la habitación' },
      { icon: Globe, text: 'En español, inglés y francés automáticamente' },
      { icon: Clock, text: 'Check-in, WiFi, checkout — todo en segundos' },
    ],
    stat: { number: '4h', label: 'menos de gestión cada semana en Airbnb' },
    cta: 'Ver cómo funciona el asistente',
  },
  {
    emoji: '📱',
    tag: 'Cero mensajes repetitivos',
    title: 'Preguntas que dejan de llegar a tu móvil',
    bullets: [
      { icon: MessageCircle, text: '¿Cuál es el código del cajetín?' },
      { icon: MessageCircle, text: '¿A qué hora tengo que salir?' },
      { icon: MessageCircle, text: '¿Dónde están las toallas extra?' },
    ],
    stat: { number: '23min', label: 'de media que tarda un huésped en leer tu guía' },
    cta: 'Probar el asistente IA',
  },
  {
    emoji: '🤖',
    tag: 'Asistente IA 24/7 incluido',
    title: 'Responde por ti a las 3am',
    description:
      'Tus huéspedes pueden preguntar cualquier cosa — el asistente conoce tu propiedad y responde en su idioma al instante.',
    examples: [
      '"¿Cómo enciendo el aire acondicionado?"',
      '"¿Hay parkings cerca?"',
      '"¿Qué restaurantes recomiendas?"',
    ],
    stat: { number: '0', label: 'llamadas de urgencia de noche' },
    cta: 'Abrir el asistente ahora →',
    isChatbotSlide: true,
  },
]

export default function DemoGuidedTour({ isActive }: DemoGuidedTourProps) {
  const [visible, setVisible] = useState(false)
  const [slide, setSlide] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!isActive) return
    if (localStorage.getItem('demo-onboarding-v2-done')) {
      setDismissed(true)
      return
    }
    // Show after a short delay so the guide loads first
    const t = setTimeout(() => setVisible(true), 1200)
    return () => clearTimeout(t)
  }, [isActive])

  const handleDismiss = () => {
    setVisible(false)
    setDismissed(true)
    localStorage.setItem('demo-onboarding-v2-done', 'true')
  }

  const handleCTA = () => {
    const current = SLIDES[slide]
    if ((current as any).isChatbotSlide) {
      handleDismiss()
      // Open chatbot via custom event — ChatBot listens for this
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('demo:open-chatbot'))
      }, 300)
      return
    }
    if (slide < SLIDES.length - 1) {
      setSlide(slide + 1)
    } else {
      handleDismiss()
    }
  }

  if (dismissed || !visible) return null

  const current = SLIDES[slide]

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
            onClick={handleDismiss}
          />

          {/* Sheet — bottom on mobile, centered on desktop */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[91] sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:right-auto sm:w-[440px] sm:-translate-x-1/2 sm:-translate-y-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
              {/* Handle (mobile only) */}
              <div className="flex justify-center pt-3 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>

              {/* Close */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="px-6 pt-4 pb-6 sm:pt-6">
                {/* Tag */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold">
                    <Zap className="w-3 h-3" />
                    {current.tag}
                  </span>
                </div>

                {/* Emoji + Title */}
                <div className="flex items-start gap-4 mb-5">
                  <span className="text-4xl leading-none">{current.emoji}</span>
                  <h2 className="text-xl font-bold text-gray-900 leading-snug">
                    {current.title}
                  </h2>
                </div>

                {/* Content */}
                {'bullets' in current && current.bullets && (
                  <ul className="space-y-3 mb-5">
                    {current.bullets.map((b, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                          <b.icon className="w-4 h-4 text-violet-600" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{b.text}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {'description' in current && current.description && (
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {current.description}
                  </p>
                )}

                {'examples' in current && current.examples && (
                  <div className="space-y-2 mb-5">
                    {current.examples.map((ex, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                        <Bot className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                        <span className="text-xs text-gray-600 italic">{ex}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stat */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-2xl px-4 py-3 mb-6">
                  <span className="text-3xl font-black text-violet-600">{current.stat.number}</span>
                  <span className="text-sm text-gray-600 leading-tight">{current.stat.label}</span>
                </div>

                {/* CTA */}
                <button
                  onClick={handleCTA}
                  className="w-full h-13 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30 active:scale-[0.98] transition-transform"
                >
                  {(current as any).isChatbotSlide
                    ? <><Bot className="w-5 h-5" />{current.cta}</>
                    : <>{current.cta}<ChevronRight className="w-5 h-5" /></>
                  }
                </button>

                {/* Skip + Dots */}
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={handleDismiss}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Saltar tour
                  </button>
                  <div className="flex gap-1.5">
                    {SLIDES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSlide(i)}
                        className={`rounded-full transition-all duration-200 ${
                          i === slide
                            ? 'w-5 h-1.5 bg-violet-500'
                            : 'w-1.5 h-1.5 bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
