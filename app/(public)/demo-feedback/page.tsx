'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Send, MessageCircle, Gift, Sparkles, CheckCircle, ArrowRight } from 'lucide-react'

// ============================================
// CONFETTI
// ============================================

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  rotation: number
  velocityX: number
  velocityY: number
}

function ConfettiBurst({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!active) return
    const colors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#6d28d9', '#ddd6fe', '#ede9fe', '#f59e0b', '#fbbf24']
    const newParticles: Particle[] = []
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: 50 + (Math.random() - 0.5) * 30,
        y: 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8,
        rotation: Math.random() * 360,
        velocityX: (Math.random() - 0.5) * 80,
        velocityY: -30 - Math.random() * 60,
      })
    }
    setParticles(newParticles)
    const timer = setTimeout(() => setParticles([]), 2500)
    return () => clearTimeout(timer)
  }, [active])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            rotate: 0,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            left: `${p.x + p.velocityX}%`,
            top: `${p.y + p.velocityY + 120}%`,
            rotate: p.rotation + 720,
            scale: 0,
            opacity: 0,
          }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  )
}

// ============================================
// STAR RATING
// ============================================

function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hovered || value)
        return (
          <motion.button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => !disabled && setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            whileHover={!disabled ? { scale: 1.2 } : undefined}
            whileTap={!disabled ? { scale: 0.9 } : undefined}
            className={`transition-all duration-200 ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <Star
              size={44}
              className={`transition-all duration-200 ${
                isFilled
                  ? 'fill-violet-400 text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]'
                  : 'fill-transparent text-gray-600 hover:text-gray-400'
              }`}
            />
          </motion.button>
        )
      })}
    </div>
  )
}

// ============================================
// MAIN PAGE
// ============================================

type Phase = 'form' | 'submitting' | 'thanks-positive' | 'thanks-negative'

export default function DemoFeedbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
      </div>
    }>
      <DemoFeedbackContent />
    </Suspense>
  )
}

function DemoFeedbackContent() {
  const searchParams = useSearchParams()
  const leadId = searchParams.get('leadId') || ''
  const coupon = searchParams.get('coupon') || ''
  const property = searchParams.get('property') || ''
  const propertyId = searchParams.get('propertyId') || ''

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [improveComment, setImproveComment] = useState('')
  const [phase, setPhase] = useState<Phase>('form')
  const [confettiKey, setConfettiKey] = useState(0)
  const [returnedCoupon, setReturnedCoupon] = useState(coupon)
  const [error, setError] = useState('')

  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://www.itineramio.com'

  const handleSubmit = useCallback(async () => {
    if (rating === 0) {
      setError('Selecciona una puntuación')
      return
    }
    setError('')
    setPhase('submitting')

    try {
      const res = await fetch('/api/public/demo-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          rating,
          comment: comment.trim() || null,
          improveComment: improveComment.trim() || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al enviar')
        setPhase('form')
        return
      }

      if (data.couponCode) {
        setReturnedCoupon(data.couponCode)
      }

      if (rating >= 4) {
        setConfettiKey((k) => k + 1)
        setPhase('thanks-positive')
      } else {
        setPhase('thanks-negative')
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
      setPhase('form')
    }
  }, [rating, comment, improveComment, leadId])

  const registerUrl = `${baseUrl}/register?coupon=${returnedCoupon}${propertyId ? `&propertyId=${propertyId}` : ''}&utm_source=demo&utm_medium=feedback`

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <ConfettiBurst active={confettiKey > 0} key={confettiKey} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4"
          >
            <Sparkles size={14} className="text-violet-400" />
            <span className="text-violet-300 text-sm font-medium">Tu opinión importa</span>
          </motion.div>
          {property && (
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {decodeURIComponent(property)}
            </h1>
          )}
          <p className="text-gray-400 text-sm">
            Cuéntanos qué te ha parecido tu guía demo
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800/60 p-6 sm:p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            {/* ========== FORM ========== */}
            {(phase === 'form' || phase === 'submitting') && (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Stars */}
                <div className="mb-8">
                  <label className="block text-gray-300 text-sm font-medium mb-4 text-center">
                    ¿Cómo valorarías la experiencia?
                  </label>
                  <StarRating
                    value={rating}
                    onChange={setRating}
                    disabled={phase === 'submitting'}
                  />
                  {rating > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-violet-300 text-sm mt-3"
                    >
                      {rating === 5
                        ? 'Increíble'
                        : rating === 4
                        ? 'Muy bien'
                        : rating === 3
                        ? 'Bien'
                        : rating === 2
                        ? 'Regular'
                        : 'Mejorable'}
                    </motion.p>
                  )}
                </div>

                {/* Comment */}
                <div className="mb-6">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    <MessageCircle size={14} className="inline mr-1.5 text-violet-400" />
                    Cuéntanos qué te ha parecido
                    <span className="text-gray-500 font-normal ml-1">(opcional)</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={phase === 'submitting'}
                    placeholder="Lo que más te ha gustado, lo que te ha sorprendido..."
                    rows={3}
                    maxLength={1000}
                    className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 resize-none transition-all"
                  />
                </div>

                {/* Error */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-sm text-center mb-4"
                  >
                    {error}
                  </motion.p>
                )}

                {/* Submit */}
                <motion.button
                  onClick={handleSubmit}
                  disabled={phase === 'submitting' || rating === 0}
                  whileHover={phase !== 'submitting' ? { scale: 1.02 } : undefined}
                  whileTap={phase !== 'submitting' ? { scale: 0.98 } : undefined}
                  className={`w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                    rating === 0
                      ? 'bg-gray-700 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/20'
                  }`}
                >
                  {phase === 'submitting' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Enviar mi opinión
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* ========== THANKS POSITIVE (4-5 stars) ========== */}
            {phase === 'thanks-positive' && (
              <motion.div
                key="positive"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-500/20 mb-6"
                >
                  <CheckCircle size={36} className="text-violet-400" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  ¡Gracias por tu valoración!
                </h2>
                <p className="text-gray-400 mb-8">
                  Nos alegra que te haya gustado. Activa tu propiedad con un 20% de descuento.
                </p>

                {returnedCoupon && (
                  <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-5 mb-6">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Tu cupón</p>
                    <p className="text-violet-300 font-mono text-2xl font-bold tracking-widest">
                      {returnedCoupon}
                    </p>
                  </div>
                )}

                <a
                  href={registerUrl}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-violet-500/20"
                >
                  <Gift size={18} />
                  Crear mi cuenta con 20% dto
                  <ArrowRight size={16} />
                </a>
              </motion.div>
            )}

            {/* ========== THANKS NEGATIVE (1-3 stars) ========== */}
            {phase === 'thanks-negative' && (
              <motion.div
                key="negative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-6"
                >
                  <MessageCircle size={36} className="text-amber-400" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  Gracias por tu honestidad
                </h2>
                <p className="text-gray-400 mb-6">
                  Tu feedback nos ayuda a mejorar. ¿Hay algo concreto que mejorarías?
                </p>

                <div className="mb-6 text-left">
                  <textarea
                    value={improveComment}
                    onChange={(e) => setImproveComment(e.target.value)}
                    placeholder="¿Qué mejorarías? ¿Qué te hubiera gustado ver diferente?"
                    rows={3}
                    maxLength={1000}
                    className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 resize-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <motion.button
                    onClick={async () => {
                      if (!improveComment.trim()) return
                      try {
                        await fetch('/api/public/demo-feedback', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            leadId,
                            rating,
                            comment: comment.trim() || null,
                            improveComment: improveComment.trim(),
                          }),
                        })
                      } catch {
                        // Non-blocking
                      }
                      setPhase('thanks-positive')
                      setConfettiKey((k) => k + 1)
                    }}
                    disabled={!improveComment.trim()}
                    whileHover={improveComment.trim() ? { scale: 1.02 } : undefined}
                    className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                      !improveComment.trim()
                        ? 'bg-gray-700 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500'
                    }`}
                  >
                    <Send size={16} />
                    Enviar sugerencia
                  </motion.button>

                  <a
                    href={registerUrl}
                    className="text-gray-400 hover:text-gray-300 text-sm underline underline-offset-2 transition-colors"
                  >
                    Registrarme con mi cupón del 20%
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-6">
          &copy; 2026 Itineramio. Todos los derechos reservados.
        </p>
      </motion.div>
    </div>
  )
}
