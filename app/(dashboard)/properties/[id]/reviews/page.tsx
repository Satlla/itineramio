'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Star, 
  MessageCircle, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  Users, 
  BarChart3,
  Calendar,
  Filter,
  ArrowLeft,
  ExternalLink,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Button } from '../../../../../src/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../src/components/ui/Card'
import { ZoneIconDisplay } from '../../../../../src/components/ui/IconSelector'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'

interface Review {
  id: string
  rating: number
  comment?: string
  userName: string
  userEmail?: string
  reviewType: 'zone' | 'property'
  isPublic: boolean
  createdAt: string
  updatedAt: string
  zone?: {
    id: string
    name: string
    icon: string
  }
}

interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  publicReviews: number
  privateReviews: number
  recentActivity: Review[]
}

export default function PropertyReviewsPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [propertyName, setPropertyName] = useState<string>('')
  const [filterType, setFilterType] = useState<'all' | 'zone' | 'property' | 'public' | 'private'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating-high' | 'rating-low'>('newest')

  useEffect(() => {
    fetchReviewsData()
    fetchPropertyInfo()
  }, [propertyId])

  const fetchPropertyInfo = async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`)
      const result = await response.json()
      if (result.success) {
        setPropertyName(result.data.name)
      }
    } catch (error) {
      console.error('Error fetching property info:', error)
    }
  }

  const fetchReviewsData = async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/reviews`)
      const result = await response.json()
      
      if (result.success) {
        setReviews(result.data.reviews)
        setStats(result.data.stats)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePublic = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/toggle-public`, {
        method: 'PATCH'
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Update local state
        setReviews(reviews.map(review => 
          review.id === reviewId 
            ? { ...review, isPublic: !review.isPublic }
            : review
        ))
        
        // Update stats
        if (stats) {
          const review = reviews.find(r => r.id === reviewId)
          if (review) {
            setStats({
              ...stats,
              publicReviews: review.isPublic ? stats.publicReviews - 1 : stats.publicReviews + 1,
              privateReviews: review.isPublic ? stats.privateReviews + 1 : stats.privateReviews - 1
            })
          }
        }
      }
    } catch (error) {
      console.error('Error toggling review visibility:', error)
    }
  }

  const filteredAndSortedReviews = () => {
    let filtered = reviews

    // Apply filters
    switch (filterType) {
      case 'zone':
        filtered = reviews.filter(r => r.reviewType === 'zone')
        break
      case 'property':
        filtered = reviews.filter(r => r.reviewType === 'property')
        break
      case 'public':
        filtered = reviews.filter(r => r.isPublic)
        break
      case 'private':
        filtered = reviews.filter(r => !r.isPublic)
        break
    }

    // Apply sorting
    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'rating-high':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'rating-low':
        filtered.sort((a, b) => a.rating - b.rating)
        break
      default: // newest
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return filtered
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push(`/guide/${propertyId}`)}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Ver Manual Público
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900">
          Reseñas de {propertyName}
        </h1>
        <p className="text-gray-600 mt-2">
          Gestiona las reseñas y valoraciones de tu propiedad
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Valoración Media</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.averageRating.toFixed(1)}
                  </p>
                  <div className="flex mt-1">
                    {renderStars(Math.round(stats.averageRating))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reseñas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Públicas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.publicReviews}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <EyeOff className="h-8 w-8 text-gray-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Privadas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.privateReviews}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rating Distribution */}
      {stats && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Distribución de Valoraciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: stats.totalReviews > 0 
                          ? `${(stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">Filtrar:</span>
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">Todas</option>
          <option value="zone">Por Zona</option>
          <option value="property">Propiedad General</option>
          <option value="public">Públicas</option>
          <option value="private">Privadas</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="newest">Más Recientes</option>
          <option value="oldest">Más Antiguas</option>
          <option value="rating-high">Mayor Valoración</option>
          <option value="rating-low">Menor Valoración</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredAndSortedReviews().length === 0 ? (
          <Card className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay reseñas {filterType !== 'all' && `${filterType}s`}
            </h3>
            <p className="text-gray-600">
              {filterType === 'all' 
                ? 'Aún no has recibido ninguna reseña para esta propiedad.'
                : `No tienes reseñas ${filterType}s para esta propiedad.`
              }
            </p>
          </Card>
        ) : (
          filteredAndSortedReviews().map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {review.zone && (
                          <div className="flex items-center gap-2">
                            <ZoneIconDisplay iconId={review.zone.icon} size="sm" />
                            <span className="text-sm font-medium text-gray-600">
                              {review.zone.name}
                            </span>
                          </div>
                        )}
                        
                        {review.reviewType === 'property' && (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                              <Star className="w-3 h-3 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-600">
                              Reseña General
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>

                        <div className="flex items-center gap-2">
                          {review.isPublic ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <Eye className="w-4 h-4" />
                              <span className="text-xs font-medium">Pública</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-gray-500">
                              <EyeOff className="w-4 h-4" />
                              <span className="text-xs font-medium">Privada</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">
                          Por <span className="font-medium">{review.userName}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>

                      {review.comment && (
                        <p className="text-gray-800 text-sm leading-relaxed">
                          "{review.comment}"
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePublic(review.id)}
                        className={`flex items-center gap-2 ${
                          review.isPublic 
                            ? 'border-green-500 text-green-600 hover:bg-green-50' 
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {review.isPublic ? (
                          <>
                            <Eye className="w-4 h-4" />
                            Ocultar
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4" />
                            Publicar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}