'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Star, Check, X, MessageCircle, Calendar, Clock } from 'lucide-react'
import { Button } from '../../../src/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/Card'
import { AnimatedLoadingSpinner } from '../../../src/components/ui/AnimatedLoadingSpinner'
import { useNotifications } from '../../../src/hooks/useNotifications'

interface Rating {
  id: string
  rating: number
  comment?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  reviewedAt?: string
  property: {
    id: string
    name: string
  }
}

export default function RatingReviewPage() {
  const params = useParams()
  const router = useRouter()
  const { addNotification } = useNotifications()
  const ratingId = params.ratingId as string

  const [rating, setRating] = useState<Rating | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchRating()
  }, [ratingId])

  const fetchRating = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/ratings/${ratingId}`)
      const result = await response.json()

      if (response.ok && result.success) {
        setRating(result.data)
      } else {
        throw new Error(result.error || 'Error al cargar la evaluación')
      }
    } catch (error) {
      console.error('Error fetching rating:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo cargar la evaluación',
        read: false
      })
      router.push('/properties')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!rating) return

    try {
      setProcessing(true)
      const response = await fetch(`/api/ratings/${ratingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        addNotification({
          type: 'info',
          title: action === 'approve' ? 'Evaluación aprobada' : 'Evaluación rechazada',
          message: result.message,
          read: false
        })
        
        // Update local state
        setRating(prev => prev ? { ...prev, status: result.data.status, reviewedAt: new Date().toISOString() } : null)
      } else {
        throw new Error(result.error || 'Error al procesar la acción')
      }
    } catch (error) {
      console.error('Error processing action:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo procesar la acción',
        read: false
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <AnimatedLoadingSpinner text="Cargando evaluación..." type="properties" />
  }

  if (!rating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Evaluación no encontrada</h2>
          <Button onClick={() => router.push('/properties')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a propiedades
          </Button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente de revisión'
      case 'APPROVED': return 'Aprobada y publicada'
      case 'REJECTED': return 'Rechazada'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            onClick={() => router.push('/properties')}
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a propiedades
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Revisar Evaluación
          </h1>
          <p className="text-gray-600">
            Decide si quieres publicar esta evaluación en tu propiedad
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Rating Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    📍 {rating.property.name}
                  </CardTitle>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(rating.status)}`}>
                    {getStatusText(rating.status)}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Rating Display */}
                <div className="text-center py-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg">
                  <div className="text-4xl mb-2">
                    {'⭐'.repeat(rating.rating)}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {rating.rating} de 5 estrellas
                  </p>
                  <p className="text-gray-600">
                    Calificación del huésped
                  </p>
                </div>

                {/* Comment */}
                {rating.comment && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <MessageCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Comentario del huésped:
                        </h4>
                        <p className="text-gray-700 italic">
                          "{rating.comment}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Fecha de evaluación</p>
                      <p>{formatDate(rating.createdAt)}</p>
                    </div>
                  </div>
                  
                  {rating.reviewedAt && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <div>
                        <p className="font-medium">Fecha de revisión</p>
                        <p>{formatDate(rating.reviewedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Acciones</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {rating.status === 'PENDING' ? (
                  <>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 mb-4">
                        Esta evaluación está pendiente de tu revisión. Puedes aprobarla para que aparezca públicamente o rechazarla.
                      </p>
                      
                      <Button
                        onClick={() => handleAction('approve')}
                        disabled={processing}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Aprobar y Publicar
                      </Button>
                      
                      <Button
                        onClick={() => handleAction('reject')}
                        disabled={processing}
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Rechazar
                      </Button>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">💡 Consejos:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Las evaluaciones positivas mejoran tu visibilidad</li>
                        <li>• Puedes rechazar evaluaciones inapropiadas</li>
                        <li>• Las evaluaciones aprobadas son públicas</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                      rating.status === 'APPROVED' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {rating.status === 'APPROVED' ? (
                        <Check className="w-8 h-8 text-green-600" />
                      ) : (
                        <X className="w-8 h-8 text-red-600" />
                      )}
                    </div>
                    <p className="font-medium text-gray-900 mb-2">
                      {rating.status === 'APPROVED' ? 'Evaluación Aprobada' : 'Evaluación Rechazada'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {rating.status === 'APPROVED' 
                        ? 'Esta evaluación ya está publicada y visible para otros huéspedes.'
                        : 'Esta evaluación fue rechazada y no aparece públicamente.'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}