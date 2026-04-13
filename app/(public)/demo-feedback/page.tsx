'use client'

import React, { useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Send, MessageCircle, Gift, CheckCircle, ArrowRight } from 'lucide-react'

// ============================================
// STAR RATING
// ============================================

const LABELS = ['', 'Mejorable', 'Regular', 'Bien', 'Muy bien', 'Increíble']

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
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2">
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
              whileHover={!disabled ? { scale: 1.15 } : undefined}
              whileTap={!disabled ? { scale: 0.9 } : undefined}
              className={`transition-all duration-200 ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <Star
                size={40}
                className={`transition-all duration-200 ${
                  isFilled
                    ? 'fill-gray-900 text-gray-900'
                    : 'fill-transparent text-gray-300 hover:text-gray-400'
                }`}
              />
            </motion.button>
          )
        })}
      </div>
      {(hovered || value) > 0 && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-gray-500"
        >
          {LABELS[hovered || value]}
        </motion.p>
      )}
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-8 pb-4 text-center">
            {property && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                {decodeURIComponent(property)}
              </p>
            )}
            <h1 className="text-xl font-bold text-gray-900">
              ¿Qué te ha parecido tu guía?
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Tu opinión nos ayuda a mejorar
            </p>
          </div>

          {/* Content */}
          <div className="px-6 pb-8">
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
                  <div className="py-6 border-b border-gray-100 mb-6">
                    <StarRating
                      value={rating}
                      onChange={setRating}
                      disabled={phase === 'submitting'}
                    />
                  </div>

                  {/* Comment */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cuéntanos más
                      <span className="text-gray-400 font-normal ml-1">(opcional)</span>
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      disabled={phase === 'submitting'}
                      placeholder="Lo que más te ha gustado, lo que mejorarías..."
                      rows={3}
                      maxLength={1000}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 resize-none transition-all text-sm"
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-sm text-center mb-4"
                    >
                      {error}
                    </motion.p>
                  )}

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={phase === 'submitting' || rating === 0}
                    className={`w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                      rating === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {phase === 'submitting' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Enviar mi opinión
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {/* ========== THANKS POSITIVE (4-5 stars) ========== */}
              {phase === 'thanks-positive' && (
                <motion.div
                  key="positive"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-6"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-5">
                    <CheckCircle size={28} className="text-gray-900" />
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    ¡Gracias!
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Nos alegra que te haya gustado. Crea tu cuenta con un 20% de descuento.
                  </p>

                  {returnedCoupon && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tu cupón</p>
                      <p className="text-gray-900 font-mono text-xl font-bold tracking-widest">
                        {returnedCoupon}
                      </p>
                    </div>
                  )}

                  <a
                    href={registerUrl}
                    className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm"
                  >
                    <Gift size={16} />
                    Crear mi cuenta con 20% dto
                    <ArrowRight size={14} />
                  </a>
                </motion.div>
              )}

              {/* ========== THANKS NEGATIVE (1-3 stars) ========== */}
              {phase === 'thanks-negative' && (
                <motion.div
                  key="negative"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-6"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-5">
                    <MessageCircle size={28} className="text-gray-900" />
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Gracias por tu honestidad
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    ¿Hay algo concreto que mejorarías?
                  </p>

                  <div className="mb-5 text-left">
                    <textarea
                      value={improveComment}
                      onChange={(e) => setImproveComment(e.target.value)}
                      placeholder="¿Qué mejorarías? ¿Qué te hubiera gustado ver?"
                      rows={3}
                      maxLength={1000}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 resize-none transition-all text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
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
                      }}
                      disabled={!improveComment.trim()}
                      className={`w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                        !improveComment.trim()
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      <Send size={14} />
                      Enviar sugerencia
                    </button>

                    <a
                      href={registerUrl}
                      className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
                    >
                      Registrarme con mi cupón del 20%
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          &copy; 2026 Itineramio
        </p>
      </motion.div>
    </div>
  )
}
