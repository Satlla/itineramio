'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Send, CheckCircle, MessageCircle, Share2, X } from 'lucide-react'

interface DemoInlineFeedbackProps {
  propertyId: string
  propertyName: string
  leadEmail?: string
  onOpenShare: () => void
}

export default function DemoInlineFeedback({
  propertyId,
  propertyName,
  leadEmail,
  onOpenShare,
}: DemoInlineFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [improvementText, setImprovementText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Check if already submitted
    const done = localStorage.getItem(`demo-feedback-inline-${propertyId}`)
    if (done) return

    // Show after 3+ zones explored or 3+ minutes
    const checkVisibility = () => {
      const viewedZones = document.querySelectorAll('[data-zone-viewed="true"]').length
      if (viewedZones >= 3) {
        setIsVisible(true)
        return
      }
    }

    // Check zones periodically
    const zoneInterval = setInterval(checkVisibility, 2000)

    // Also show after 3 minutes
    const timer = setTimeout(() => {
      const done = localStorage.getItem(`demo-feedback-inline-${propertyId}`)
      if (!done) setIsVisible(true)
    }, 180000)

    return () => {
      clearInterval(zoneInterval)
      clearTimeout(timer)
    }
  }, [propertyId])

  const handleRatingSelect = async (value: number) => {
    setRating(value)

    if (value >= 4) {
      // High rating: submit immediately and show share buttons
      await submitFeedback(value)
      setShowFollowUp(true)
    } else {
      // Low rating: ask what to improve
      setShowFollowUp(true)
    }
  }

  const submitFeedback = async (ratingValue: number, comment?: string) => {
    setSubmitting(true)
    try {
      await fetch('/api/public/demo-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          rating: ratingValue,
          comment: comment || '',
          email: leadEmail || '',
          source: 'inline',
        }),
      })

      fetch('/api/admin/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'demo_feedback_submitted',
          data: { propertyId, rating: ratingValue, source: 'inline' },
        }),
      }).catch(() => {})

      localStorage.setItem(`demo-feedback-inline-${propertyId}`, 'true')
      setSubmitted(true)
    } catch {
      // Silent fail
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitImprovement = () => {
    if (!improvementText.trim()) return
    submitFeedback(rating, improvementText.trim())
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="mx-4 sm:mx-0 my-6 p-5 bg-gray-50 border border-gray-200 rounded-2xl relative"
      >
        {/* Dismiss button */}
        {!submitted && !showFollowUp && (
          <button
            onClick={() => {
              setIsVisible(false)
              localStorage.setItem(`demo-feedback-inline-${propertyId}`, 'dismissed')
            }}
            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {!submitted && !showFollowUp && (
          <div className="text-center space-y-3">
            <p className="text-base font-semibold text-gray-800">
              Que te ha parecido tu manual?
            </p>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleRatingSelect(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      value <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* High rating follow-up: share */}
        {showFollowUp && rating >= 4 && !submitted && (
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((v) => (
                <Star key={v} className={`w-5 h-5 ${v <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-base font-semibold text-gray-800">
              Increible! Compartelo con otros anfitriones
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  const shareText = encodeURIComponent(`He creado un manual digital con IA para mi alojamiento en Itineramio. Es increible! ${window.location.href}`)
                  window.open(`https://wa.me/?text=${shareText}`, '_blank')
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
              <button
                onClick={onOpenShare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Mas opciones
              </button>
            </div>
          </div>
        )}

        {/* Low rating follow-up: textarea */}
        {showFollowUp && rating < 4 && !submitted && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((v) => (
                <Star key={v} className={`w-5 h-5 ${v <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-sm font-medium text-gray-700 text-center">
              Gracias por tu honestidad. Que mejorarias?
            </p>
            <textarea
              value={improvementText}
              onChange={(e) => setImprovementText(e.target.value)}
              placeholder="Tu opinion nos ayuda a mejorar..."
              rows={3}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 resize-none transition-colors"
            />
            <button
              onClick={handleSubmitImprovement}
              disabled={!improvementText.trim() || submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        )}

        {/* Submitted state */}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-2 py-2"
          >
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
            <p className="text-sm font-medium text-gray-700">Gracias por tu opinion!</p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
