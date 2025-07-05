'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, MessageCircle, User, Calendar } from 'lucide-react'
import { Card, CardContent } from './Card'

interface PublicReview {
  id: string
  rating: number
  comment?: string
  userName: string
  createdAt: string
  reviewType: 'zone' | 'property'
  zone?: {
    name: string
    icon: string
  }
}

interface PublicReviewsProps {
  propertyId: string
  zoneId?: string // If provided, show only reviews for this zone
  maxReviews?: number
  showTitle?: boolean
  className?: string
}

export function PublicReviews({
  propertyId,
  zoneId,
  maxReviews = 10,
  showTitle = true,
  className = ''
}: PublicReviewsProps) {
  const [reviews, setReviews] = useState<PublicReview[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{
    averageRating: number
    totalReviews: number
  } | null>(null)

  useEffect(() => {
    fetchPublicReviews()
  }, [propertyId, zoneId])

  const fetchPublicReviews = async () => {
    try {
      const url = zoneId 
        ? `/api/zones/${zoneId}/public-reviews`
        : `/api/properties/${propertyId}/public-reviews`
      
      const response = await fetch(url)
      const result = await response.json()
      
      if (result.success) {
        setReviews(result.data.reviews.slice(0, maxReviews))
        setStats(result.data.stats)
      }
    } catch (error) {
      console.error('Error fetching public reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
    
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${starSize} ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showTitle && (
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        )}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (reviews.length === 0) {
    return null // Don't show anything if no public reviews
  }

  return (
    <div className={className}>
      {showTitle && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="w-5 h-5 text-violet-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {zoneId ? 'Opiniones de esta zona' : 'Opiniones de huéspedes'}
            </h3>
          </div>
          
          {stats && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                {renderStars(Math.round(stats.averageRating))}
                <span className="font-medium ml-1">
                  {stats.averageRating.toFixed(1)}
                </span>
              </div>
              <span>•</span>
              <span>
                {stats.totalReviews} opinión{stats.totalReviews !== 1 ? 'es' : ''}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {review.userName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                  </div>
                </div>

                {review.comment && (
                  <p className="text-gray-700 text-sm leading-relaxed">
                    "{review.comment}"
                  </p>
                )}

                {!zoneId && review.zone && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Opinión sobre: <span className="font-medium">{review.zone.name}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {reviews.length >= maxReviews && (
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Mostrando las {maxReviews} opiniones más recientes
          </p>
        </div>
      )}
    </div>
  )
}