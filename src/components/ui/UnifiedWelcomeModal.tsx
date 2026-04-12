'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  QrCode,
  Globe,
  Zap,
  Check,
  X,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UnifiedWelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
  trialDaysRemaining?: number
}

interface Slide {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  tag?: string
  heading: string
  body: string
  items: string[]
}

const SLIDES: Slide[] = [
  {
    icon: Sparkles,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    heading: 'El manual digital que tus huéspedes necesitan',
    body: 'Sin más repeticiones. Sin más llamadas por la noche. Todo lo que necesita tu huésped, organizado y accesible desde su móvil.',
    items: [
      'Listo en 8 minutos con IA',
      'Sin conocimientos técnicos',
      '14 días de prueba gratuita',
    ],
  },
  {
    icon: QrCode,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-800',
    tag: 'Cómo funciona',
    heading: 'Un QR por zona. Pégalo donde toca.',
    body: 'Lavadora, vitrocerámica, caja de llaves, piscina… Tu huésped escanea y ve las instrucciones al instante. Sin apps, sin descargas.',
    items: [
      'Check-in autónomo sin contacto',
      'Cualquier móvil lo lee',
      'Cada zona tiene su propio QR',
    ],
  },
  {
    icon: Globe,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    tag: 'Multiidioma',
    heading: '3 idiomas, cero esfuerzo extra',
    body: 'La IA traduce el manual completo a Español, Inglés y Francés. El huésped lo ve en su idioma de forma automática.',
    items: [
      'Traducción automática con IA',
      'Español · English · Français',
      'Alcanza huéspedes de todo el mundo',
    ],
  },
  {
    icon: Zap,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    tag: 'Para empezar',
    heading: 'La IA crea tu manual en 8 minutos',
    body: 'Cuéntale cómo es tu alojamiento y la IA genera instrucciones profesionales para cada zona, ya traducidas y con QR.',
    items: [
      'Manual completo y personalizado',
      'Instrucciones en 3 idiomas',
      'QR únicos para cada zona',
    ],
  },
]

async function markOnboardingComplete() {
  try {
    await fetch('/api/user/complete-onboarding', {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    // silently fail — localStorage is the backup
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem('hasSeenUnifiedWelcome', 'true')
  }
}

export function UnifiedWelcomeModal({
  isOpen,
  onClose,
  userName,
  trialDaysRemaining,
}: UnifiedWelcomeModalProps) {
  const router = useRouter()
  const [current, setCurrent] = useState(0)

  const slide = SLIDES[current]
  const isLast = current === SLIDES.length - 1
  const IconComponent = slide.icon

  const handleNext = () => {
    if (!isLast) setCurrent(c => c + 1)
  }

  const handleSkip = async () => {
    await markOnboardingComplete()
    onClose()
  }

  const handleStart = async () => {
    await markOnboardingComplete()
    onClose()
    router.push('/ai-setup')
  }

  // Swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX)
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const delta = touchStart - e.changedTouches[0].clientX
    if (delta > 50 && !isLast) setCurrent(c => c + 1)
    if (delta < -50 && current > 0) setCurrent(c => c - 1)
    setTouchStart(null)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[99]"
            onClick={handleSkip}
          />

          {/* Modal — bottom sheet on mobile, centered dialog on desktop */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[100] sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4"
            onClick={e => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm shadow-2xl flex flex-col overflow-hidden max-h-[92dvh] sm:max-h-[85dvh]">

              {/* Handle bar — mobile only */}
              <div className="flex-shrink-0 flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>

              {/* Top bar: progress + close */}
              <div className="flex-shrink-0 flex items-center justify-between px-5 pt-3 pb-2 sm:pt-5">
                {/* Progress dots */}
                <div className="flex items-center gap-1.5">
                  {SLIDES.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        width: i === current ? 20 : 6,
                        backgroundColor: i === current ? '#7c3aed' : '#e5e7eb',
                      }}
                      transition={{ duration: 0.25 }}
                      className="h-1.5 rounded-full"
                    />
                  ))}
                </div>

                {/* Close */}
                <button
                  onClick={handleSkip}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Content — scrollable */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="flex-1 overflow-y-auto px-5 pt-4 pb-2"
                >
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl ${slide.iconBg} flex items-center justify-center mb-5`}>
                    <IconComponent className={`w-7 h-7 ${slide.iconColor}`} />
                  </div>

                  {/* Tag */}
                  {slide.tag && (
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                      {slide.tag}
                    </p>
                  )}

                  {/* Heading */}
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-3">
                    {current === 0 && userName
                      ? `Hola ${userName}, bienvenido a Itineramio`
                      : slide.heading}
                  </h2>

                  {/* Trial badge */}
                  {current === 0 && trialDaysRemaining && (
                    <div className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 text-xs font-semibold rounded-full px-3 py-1 mb-3">
                      <Sparkles className="w-3 h-3" />
                      {trialDaysRemaining} días de prueba gratis
                    </div>
                  )}

                  {/* Body */}
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">
                    {slide.body}
                  </p>

                  {/* Items */}
                  <div className="space-y-2.5">
                    {slide.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Footer actions — always visible */}
              <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 space-y-2">
                {isLast ? (
                  <button
                    onClick={handleStart}
                    className="w-full h-12 rounded-xl bg-gray-900 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                  >
                    Crear mi primer manual
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="w-full h-12 rounded-xl bg-gray-900 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                  >
                    Siguiente
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={handleSkip}
                  className="w-full h-10 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {isLast ? 'Ahora no' : 'Saltar introducción'}
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
