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

interface Evaluation {
  id: string
  rating: number
  comment?: string
  userName: string
  userEmail?: string
  reviewType: 'zone' | 'property'
  isPublic: boolean
  isApproved: boolean
  hostResponse?: string
  hostRespondedAt?: string
  createdAt: string
  updatedAt: string
  zone?: {
    id: string
    name: string
    icon: string
  }
  // Additional zone rating details
  clarity?: number
  completeness?: number
  helpfulness?: number
  upToDate?: number
  language?: string
  guestInfo?: {
    ageRange?: string
    country?: string
    travelType?: string
  }
}

interface EvaluationStats {
  totalEvaluations: number
  averageRating: number
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  publicEvaluations: number
  privateEvaluations: number
  recentActivity: Evaluation[]
}

export default function PropertyEvaluationsPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [stats, setStats] = useState<EvaluationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [propertyName, setPropertyName] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'zone' | 'public'>('zone')
  const [filterType, setFilterType] = useState<'all' | 'zone' | 'property' | 'public' | 'private' | 'approved' | 'pending'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating-high' | 'rating-low'>('newest')

  useEffect(() => {
    fetchEvaluationsData()
    fetchPropertyInfo()
  }, [propertyId])

  const fetchPropertyInfo = async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        credentials: 'include'
      })
      const result = await response.json()
      if (result.success) {
        setPropertyName(result.data.name)
      }
    } catch (error) {
      console.error('Error fetching property info:', error)
    }
  }

  const fetchEvaluationsData = async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/evaluations`, {
        credentials: 'include'
      })
      const result = await response.json()
      
      console.log('📊 Evaluations API response:', {
        success: result.success,
        evaluationsCount: result.data?.evaluations?.length || 0,
        stats: result.data?.stats
      })
      
      if (result.success) {
        setEvaluations(result.data.evaluations)
        setStats(result.data.stats)
      } else {
        console.error('❌ Failed to fetch evaluations:', result.error)
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePublic = async (evaluationId: string) => {
    try {
      const response = await fetch(`/api/evaluations/${evaluationId}/toggle-public`, {
        method: 'PATCH',
        credentials: 'include'
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Update local state
        setEvaluations(evaluations.map(evaluation => 
          evaluation.id === evaluationId 
            ? { ...evaluation, isPublic: !evaluation.isPublic }
            : evaluation
        ))
        
        // Update stats
        if (stats) {
          const evaluation = evaluations.find(e => e.id === evaluationId)
          if (evaluation) {
            setStats({
              ...stats,
              publicEvaluations: evaluation.isPublic ? stats.publicEvaluations - 1 : stats.publicEvaluations + 1,
              privateEvaluations: evaluation.isPublic ? stats.privateEvaluations + 1 : stats.privateEvaluations - 1
            })
          }
        }
      }
    } catch (error) {
      console.error('Error toggling evaluation visibility:', error)
    }
  }

  const handleApproveEvaluation = async (evaluationId: string) => {
    try {
      const response = await fetch(`/api/evaluations/${evaluationId}/approve`, {
        method: 'PATCH',
        credentials: 'include'
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Update local state
        setEvaluations(evaluations.map(evaluation => 
          evaluation.id === evaluationId 
            ? { ...evaluation, isApproved: !evaluation.isApproved }
            : evaluation
        ))
      }
    } catch (error) {
      console.error('Error approving evaluation:', error)
    }
  }

  const filteredAndSortedEvaluations = () => {
    let filtered = evaluations

    // Apply tab filter first
    if (activeTab === 'zone') {
      filtered = evaluations.filter(e => e.reviewType === 'zone')
    } else if (activeTab === 'public') {
      filtered = evaluations.filter(e => e.reviewType === 'property')
    }

    // Apply additional filters
    switch (filterType) {
      case 'public':
        filtered = filtered.filter(e => e.isPublic)
        break
      case 'private':
        filtered = filtered.filter(e => !e.isPublic)
        break
      case 'approved':
        filtered = filtered.filter(e => e.isApproved)
        break
      case 'pending':
        filtered = filtered.filter(e => !e.isApproved)
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

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${sizeClass} ${
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
          Evaluaciones de {propertyName}
        </h1>
        <p className="text-gray-600 mt-2">
          Gestiona las evaluaciones y valoraciones de tu propiedad
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
                  <p className="text-sm font-medium text-gray-600">Total Evaluaciones</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEvaluations}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.publicEvaluations}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.privateEvaluations}</p>
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
                        width: stats.totalEvaluations > 0 
                          ? `${(stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] / stats.totalEvaluations) * 100}%`
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

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('zone')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'zone'
                  ? 'border-violet-500 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Evaluaciones por Zona
            </button>
            <button
              onClick={() => setActiveTab('public')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'public'
                  ? 'border-violet-500 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Evaluaciones Públicas
            </button>
          </nav>
        </div>
      </div>

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
          {activeTab === 'public' && (
            <>
              <option value="approved">Aprobadas</option>
              <option value="pending">Pendientes</option>
            </>
          )}
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

      {/* Evaluations List */}
      <div className="space-y-4">
        {filteredAndSortedEvaluations().length === 0 ? (
          <Card className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay evaluaciones {filterType !== 'all' && `${filterType}s`}
            </h3>
            <p className="text-gray-600">
              {filterType === 'all' 
                ? 'Aún no has recibido ninguna evaluación para esta propiedad.'
                : `No tienes evaluaciones ${filterType}s para esta propiedad.`
              }
            </p>
          </Card>
        ) : (
          filteredAndSortedEvaluations().map((evaluation) => (
            <motion.div
              key={evaluation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {evaluation.zone && (
                          <div className="flex items-center gap-2">
                            <ZoneIconDisplay iconId={evaluation.zone.icon} size="sm" />
                            <span className="text-sm font-medium text-gray-600">
                              {evaluation.zone.name}
                            </span>
                          </div>
                        )}
                        
                        {evaluation.reviewType === 'property' && (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                              <Star className="w-3 h-3 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-600">
                              Evaluación General
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          {renderStars(evaluation.rating)}
                        </div>

                        <div className="flex items-center gap-2">
                          {evaluation.isPublic ? (
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
                          Por <span className="font-medium">{evaluation.userName}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(evaluation.createdAt)}
                        </p>
                      </div>

                      {evaluation.comment && (
                        <p className="text-gray-800 text-sm leading-relaxed mb-3">
                          "{evaluation.comment}"
                        </p>
                      )}

                      {/* Additional details for zone evaluations */}
                      {evaluation.reviewType === 'zone' && (evaluation.clarity || evaluation.completeness || evaluation.helpfulness || evaluation.upToDate) && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-600 mb-2">Valoración detallada:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {evaluation.clarity && (
                              <div className="flex items-center gap-1 text-xs">
                                <span className="text-gray-500">Claridad:</span>
                                <div className="flex">{renderStars(evaluation.clarity, 'sm')}</div>
                              </div>
                            )}
                            {evaluation.completeness && (
                              <div className="flex items-center gap-1 text-xs">
                                <span className="text-gray-500">Completitud:</span>
                                <div className="flex">{renderStars(evaluation.completeness, 'sm')}</div>
                              </div>
                            )}
                            {evaluation.helpfulness && (
                              <div className="flex items-center gap-1 text-xs">
                                <span className="text-gray-500">Utilidad:</span>
                                <div className="flex">{renderStars(evaluation.helpfulness, 'sm')}</div>
                              </div>
                            )}
                            {evaluation.upToDate && (
                              <div className="flex items-center gap-1 text-xs">
                                <span className="text-gray-500">Actualización:</span>
                                <div className="flex">{renderStars(evaluation.upToDate, 'sm')}</div>
                              </div>
                            )}
                          </div>
                          
                          {evaluation.guestInfo && (evaluation.guestInfo.country || evaluation.guestInfo.ageRange || evaluation.guestInfo.travelType) && (
                            <div className="mt-2 text-xs text-gray-500">
                              {evaluation.guestInfo.country && <span>País: {evaluation.guestInfo.country} • </span>}
                              {evaluation.guestInfo.ageRange && <span>Edad: {evaluation.guestInfo.ageRange} • </span>}
                              {evaluation.guestInfo.travelType && <span>Tipo: {evaluation.guestInfo.travelType}</span>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {activeTab === 'public' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveEvaluation(evaluation.id)}
                          className={`flex items-center gap-2 ${
                            evaluation.isApproved 
                              ? 'border-green-500 text-green-600 hover:bg-green-50' 
                              : 'border-orange-500 text-orange-600 hover:bg-orange-50'
                          }`}
                        >
                          {evaluation.isApproved ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Aprobada
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4" />
                              Aprobar
                            </>
                          )}
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePublic(evaluation.id)}
                        className={`flex items-center gap-2 ${
                          evaluation.isPublic 
                            ? 'border-green-500 text-green-600 hover:bg-green-50' 
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {evaluation.isPublic ? (
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