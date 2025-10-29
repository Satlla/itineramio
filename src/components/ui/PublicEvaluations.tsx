'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, MessageCircle, User, Calendar } from 'lucide-react'
import { Card, CardContent } from './Card'

interface PublicEvaluation {
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
  hostResponse?: string
  hostRespondedAt?: string
}

interface PublicEvaluationsProps {
  propertyId: string
  zoneId?: string // If provided, show only evaluations for this zone
  maxEvaluations?: number
  showTitle?: boolean
  className?: string
}

export function PublicEvaluations({
  propertyId,
  zoneId,
  maxEvaluations = 10,
  showTitle = true,
  className = ''
}: PublicEvaluationsProps) {
  const [evaluations, setEvaluations] = useState<PublicEvaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{
    averageRating: number
    totalEvaluations: number
  } | null>(null)

  useEffect(() => {
    fetchPublicEvaluations()
  }, [propertyId, zoneId])

  const fetchPublicEvaluations = async () => {
    try {
      const url = zoneId 
        ? `/api/zones/${zoneId}/public-evaluations`
        : `/api/properties/${propertyId}/public-evaluations`
      
      const response = await fetch(url)
      const result = await response.json()
      
      if (result.success) {
        setEvaluations(result.data.evaluations.slice(0, maxEvaluations))
        setStats(result.data.stats)
      }
    } catch (error) {
      console.error('Error fetching public evaluations:', error)
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

  if (evaluations.length === 0) {
    return null // Don't show anything if no public evaluations
  }

  return (
    <div className={className}>
      {showTitle && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="w-5 h-5 text-violet-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {zoneId ? 'Evaluaciones de esta zona' : 'Evaluaciones de huéspedes'}
            </h3>
          </div>
          
          {stats && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                {renderStars(Math.round(stats.averageRating))}
                <span className="font-medium ml-1">
                  {Number(stats.averageRating).toFixed(1)}
                </span>
              </div>
              <span>•</span>
              <span>
                {stats.totalEvaluations} evaluación{stats.totalEvaluations !== 1 ? 'es' : ''}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {evaluations.map((evaluation, index) => (
          <motion.div
            key={evaluation.id}
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
                        {evaluation.userName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(evaluation.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {renderStars(evaluation.rating)}
                  </div>
                </div>

                {evaluation.comment && (
                  <p className="text-gray-700 text-sm leading-relaxed">
                    "{evaluation.comment}"
                  </p>
                )}

                {evaluation.hostResponse && (
                  <div className="mt-3 p-3 bg-violet-50 border-l-4 border-violet-400 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <p className="text-xs font-medium text-violet-700">Respuesta del anfitrión</p>
                      {evaluation.hostRespondedAt && (
                        <span className="text-xs text-violet-500">
                          • {formatDate(evaluation.hostRespondedAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-violet-900 leading-relaxed">
                      "{evaluation.hostResponse}"
                    </p>
                  </div>
                )}

                {!zoneId && evaluation.zone && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Evaluación sobre: <span className="font-medium">{evaluation.zone.name}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {evaluations.length >= maxEvaluations && (
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Mostrando las {maxEvaluations} evaluaciones más recientes
          </p>
        </div>
      )}
    </div>
  )
}