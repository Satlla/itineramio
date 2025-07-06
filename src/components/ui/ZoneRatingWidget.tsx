'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MessageCircle, Send, X, CheckCircle } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'

interface ZoneRatingWidgetProps {
  propertyId: string
  zoneId: string
  zoneName: string
  onRatingSubmitted?: (rating: number, comment?: string) => void
  autoShow?: boolean
  className?: string
}

export function ZoneRatingWidget({
  propertyId,
  zoneId,
  zoneName,
  onRatingSubmitted,
  autoShow = false,
  className = ''
}: ZoneRatingWidgetProps) {
  const [isVisible, setIsVisible] = useState(autoShow)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [showCommentField, setShowCommentField] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  // Check if user already rated this zone
  useEffect(() => {
    checkExistingRating()
  }, [propertyId, zoneId])

  const checkExistingRating = async () => {
    try {
      // Check localStorage for existing rating
      const existingRating = localStorage.getItem(`rating_${propertyId}_${zoneId}`)
      if (existingRating) {
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error('Error checking existing rating:', error)
    }
  }

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating)
    if (selectedRating <= 3) {
      setShowCommentField(true)
    }
  }

  const handleSubmit = async () => {
    if (rating === 0) return

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/evaluations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          propertyId,
          zoneId,
          rating,
          comment: comment.trim() || null,
          userName: userName.trim() || 'Usuario anónimo',
          userEmail: userEmail.trim() || null,
          reviewType: 'zone',
          isPublic: false // Zone reviews start private
        })
      })

      const result = await response.json()

      if (result.success) {
        setIsSubmitted(true)
        
        // Store in localStorage to prevent duplicate ratings
        localStorage.setItem(`rating_${propertyId}_${zoneId}`, JSON.stringify({
          rating,
          comment,
          timestamp: new Date().toISOString()
        }))

        if (onRatingSubmitted) {
          onRatingSubmitted(rating, comment)
        }

        // Auto-hide after success
        setTimeout(() => {
          setIsVisible(false)
        }, 3000)
      } else {
        console.error('Error submitting rating:', result.error)
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starRating = i + 1
      const isActive = interactive 
        ? starRating <= (hoveredRating || rating)
        : starRating <= rating

      return (
        <motion.button
          key={i}
          type="button"
          disabled={!interactive || isSubmitting}
          className={`transition-all duration-150 ${
            interactive 
              ? 'hover:scale-110 cursor-pointer disabled:cursor-not-allowed' 
              : 'cursor-default'
          }`}
          onClick={() => interactive && handleRatingClick(starRating)}
          onMouseEnter={() => interactive && setHoveredRating(starRating)}
          onMouseLeave={() => interactive && setHoveredRating(0)}
          whileHover={interactive ? { scale: 1.1 } : {}}
          whileTap={interactive ? { scale: 0.95 } : {}}
        >
          <Star
            className={`w-6 h-6 transition-colors duration-150 ${
              isActive 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-200'
            }`}
          />
        </motion.button>
      )
    })
  }

  if (!isVisible) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsVisible(true)}
        className={`fixed bottom-6 right-6 bg-violet-600 hover:bg-violet-700 text-white p-3 rounded-full shadow-lg z-50 transition-all duration-200 ${className}`}
      >
        <Star className="w-5 h-5" />
      </motion.button>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className={`fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl border max-w-sm w-full mx-4 z-50 ${className}`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {isSubmitted ? '¡Gracias!' : '¿Cómo estuvo esta zona?'}
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isSubmitted ? (
            /* Success State */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4"
            >
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">
                Tu valoración de <strong>{zoneName}</strong> ha sido enviada.
              </p>
              <div className="flex justify-center mb-3">
                {renderStars(false)}
              </div>
              <p className="text-sm text-gray-500">
                El propietario podrá ver tu opinión para mejorar la experiencia.
              </p>
            </motion.div>
          ) : (
            /* Rating Form */
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-3">
                  <strong>{zoneName}</strong>
                </p>
                <div className="flex justify-center gap-1 mb-4">
                  {renderStars(true)}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-gray-500">
                    {rating === 5 && '⭐ ¡Excelente!'}
                    {rating === 4 && '👍 Muy bien'}
                    {rating === 3 && '👌 Bien'}
                    {rating === 2 && '😐 Regular'}
                    {rating === 1 && '😞 Necesita mejoras'}
                  </p>
                )}
              </div>

              {/* User Info (optional) */}
              {rating > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Tu nombre (opcional)"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="text-sm"
                    />
                    <Input
                      placeholder="Email (opcional)"
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </motion.div>
              )}

              {/* Comment Field */}
              {(showCommentField || rating <= 3) && rating > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <textarea
                    placeholder={rating <= 3 
                      ? "¿Qué se podría mejorar? (opcional)" 
                      : "Cuéntanos más (opcional)"
                    }
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 text-right">
                    {comment.length}/500
                  </p>
                </motion.div>
              )}

              {/* Actions */}
              {rating > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRating(0)
                      setComment('')
                      setShowCommentField(false)
                    }}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cambiar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-violet-600 hover:bg-violet-700"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Enviando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Enviar
                      </div>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}