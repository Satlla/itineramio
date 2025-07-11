'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Star, 
  MessageCircle, 
  MapPin,
  User,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  Reply
} from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import { LoadingSpinner } from './LoadingSpinner'

interface Review {
  id: string
  rating: number
  comment: string | null
  userName: string
  userEmail: string | null
  reviewType: string
  isPublic: boolean
  isApproved: boolean
  hostResponse: string | null
  hostRespondedAt: string | null
  emailSent: boolean
  createdAt: string
  zone?: {
    id: string
    name: string
  }
}

interface ReviewsStats {
  total: number
  averageRating: number
  publicCount: number
  zoneReviews: number
  propertyReviews: number
}

interface ReviewsModalProps {
  isOpen: boolean
  onClose: () => void
  propertyId: string
  propertyName: string
}

export default function ReviewsModal({ 
  isOpen, 
  onClose, 
  propertyId, 
  propertyName 
}: ReviewsModalProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewsStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'property' | 'zones'>('all')
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [hostResponse, setHostResponse] = useState('')
  const [submittingResponse, setSubmittingResponse] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchReviews()
    }
  }, [isOpen, propertyId])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/properties/${propertyId}/evaluations`)
      const result = await response.json()
      
      if (result.success) {
        setReviews(result.evaluations || [])
        setStats(result.stats || null)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveReview = async (reviewId: string, isApproved: boolean) => {
    try {
      const response = await fetch(`/api/evaluations/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved })
      })

      if (response.ok) {
        await fetchReviews() // Refresh reviews
      }
    } catch (error) {
      console.error('Error updating review approval:', error)
    }
  }

  const handleSubmitResponse = async (reviewId: string) => {
    if (!hostResponse.trim()) return

    try {
      setSubmittingResponse(true)
      const response = await fetch(`/api/evaluations/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostResponse: hostResponse.trim() })
      })

      if (response.ok) {
        setHostResponse('')
        setRespondingTo(null)
        await fetchReviews() // Refresh reviews
      }
    } catch (error) {
      console.error('Error submitting host response:', error)
    } finally {
      setSubmittingResponse(false)
    }
  }

  const filteredReviews = reviews.filter(review => {
    if (filter === 'property') return review.reviewType === 'property'
    if (filter === 'zones') return review.reviewType === 'zone'
    return true
  })

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Evaluaciones de {propertyName}
              </h2>
              {stats && (
                <p className="text-sm text-gray-600 mt-1">
                  {stats.total} evaluaciones • Promedio: {stats.averageRating.toFixed(1)} ⭐
                </p>
              )}
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="p-6 bg-gray-50 border-b">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Promedio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.propertyReviews}</div>
                  <div className="text-sm text-gray-600">Propiedad</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.zoneReviews}</div>
                  <div className="text-sm text-gray-600">Zonas</div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="p-6 border-b">
            <div className="flex gap-2">
              <Button
                onClick={() => setFilter('all')}
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
              >
                Todas ({reviews.length})
              </Button>
              <Button
                onClick={() => setFilter('property')}
                variant={filter === 'property' ? 'default' : 'outline'}
                size="sm"
              >
                Propiedad ({reviews.filter(r => r.reviewType === 'property').length})
              </Button>
              <Button
                onClick={() => setFilter('zones')}
                variant={filter === 'zones' ? 'default' : 'outline'}
                size="sm"
              >
                Zonas ({reviews.filter(r => r.reviewType === 'zone').length})
              </Button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="flex-1 overflow-y-auto max-h-96">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center p-8">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {filter === 'all' 
                    ? 'No hay evaluaciones aún' 
                    : `No hay evaluaciones de ${filter === 'property' ? 'propiedad' : 'zonas'}`
                  }
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {filteredReviews.map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {review.userName}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {formatDate(review.createdAt)}
                            {review.zone && (
                              <>
                                <span>•</span>
                                <MapPin className="w-3 h-3" />
                                {review.zone.name}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <div className="flex items-center gap-1 ml-2">
                          {review.isPublic ? (
                            <Eye className="w-4 h-4 text-green-600" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                          {review.isApproved ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {review.comment && (
                      <p className="text-gray-700 mb-3 leading-relaxed">
                        "{review.comment}"
                      </p>
                    )}

                    {/* Host Response */}
                    {review.hostResponse && (
                      <div className="mt-3 p-3 bg-violet-50 border-l-4 border-violet-400 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                            <Reply className="w-3 h-3 text-white" />
                          </div>
                          <p className="text-xs font-medium text-violet-700">Respuesta del anfitrión</p>
                          <span className="text-xs text-violet-600">
                            {review.hostRespondedAt && formatDate(review.hostRespondedAt)}
                          </span>
                        </div>
                        <p className="text-sm text-violet-900 leading-relaxed">
                          "{review.hostResponse}"
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex gap-2">
                        {!review.isApproved && (
                          <Button
                            onClick={() => handleApproveReview(review.id, true)}
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Aprobar
                          </Button>
                        )}
                        
                        {!review.hostResponse && (
                          <Button
                            onClick={() => setRespondingTo(review.id)}
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <Reply className="w-3 h-3 mr-1" />
                            Responder
                          </Button>
                        )}
                      </div>

                      <div className="text-xs text-gray-500">
                        {review.reviewType === 'property' ? 'Evaluación general' : 'Evaluación de zona'}
                      </div>
                    </div>

                    {/* Response Input */}
                    {respondingTo === review.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <textarea
                          value={hostResponse}
                          onChange={(e) => setHostResponse(e.target.value)}
                          placeholder="Escribe tu respuesta al huésped..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                        <div className="flex gap-2 mt-3">
                          <Button
                            onClick={() => handleSubmitResponse(review.id)}
                            disabled={!hostResponse.trim() || submittingResponse}
                            size="sm"
                          >
                            {submittingResponse ? (
                              <>
                                <LoadingSpinner size="sm" />
                                Enviando...
                              </>
                            ) : (
                              'Enviar respuesta'
                            )}
                          </Button>
                          <Button
                            onClick={() => {
                              setRespondingTo(null)
                              setHostResponse('')
                            }}
                            size="sm"
                            variant="outline"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}