'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Play, Pause, ChevronLeft, ChevronRight, Phone, MessageCircle, Check, X, Star, Send } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../../../src/components/ui/Button'
import { Card, CardContent } from '../../../../../src/components/ui/Card'
import { ZoneIconDisplay } from '../../../../../src/components/ui/IconSelector'
import { ItineramioLogo } from '../../../../../src/components/ui/ItineramioLogo'
import { Badge } from '../../../../../src/components/ui/Badge'
import { AnimatedLoadingSpinner } from '../../../../../src/components/ui/AnimatedLoadingSpinner'

interface ZoneStep {
  id: string
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK'
  title: string | { es: string; en?: string; fr?: string }
  description?: string | { es: string; en?: string; fr?: string }
  content?: string | { es: string; en?: string; fr?: string }
  mediaUrl?: string
  linkUrl?: string
  estimatedTime?: number
  order: number
  status: string
}

interface Zone {
  id: string
  name: string | { es: string; en?: string; fr?: string }
  description: string | { es: string; en?: string; fr?: string }
  icon: string
  color?: string
  propertyId: string
  steps: ZoneStep[]
}

interface Property {
  id: string
  name: string | { es: string; en?: string; fr?: string }
  hostContactName: string
  hostContactPhone: string
  hostContactEmail: string
  hostContactPhoto?: string
}

// Helper function to get text from multilingual objects
const getText = (value: any, fallback: string = '') => {
  if (typeof value === 'string') {
    return value
  }
  if (value && typeof value === 'object') {
    return value.es || value.en || value.fr || fallback
  }
  return fallback
}

// Tracking functions according to OPEN_METRICS_ALGORITHM.md
const trackStepViewed = async (propertyId: string, zoneId: string, stepIndex: number, totalSteps: number) => {
  try {
    await fetch('/api/tracking/step-viewed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId,
        zoneId,
        stepIndex,
        totalSteps,
        timestamp: new Date()
      })
    })
  } catch (error) {
    console.error('Error tracking step view:', error)
  }
}

const trackZoneCompleted = async (propertyId: string, zoneId: string, completionTime: number) => {
  try {
    await fetch('/api/tracking/zone-completed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId,
        zoneId,
        completionTime,
        timestamp: new Date()
      })
    })
  } catch (error) {
    console.error('Error tracking zone completion:', error)
  }
}

const trackZoneRated = async (propertyId: string, zoneId: string, rating: number, comment?: string) => {
  try {
    await fetch('/api/tracking/zone-rated', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId,
        zoneId,
        rating,
        comment,
        timestamp: new Date()
      })
    })
  } catch (error) {
    console.error('Error tracking zone rating:', error)
  }
}

export default function ZoneGuidePage({ 
  params 
}: { 
  params: Promise<{ propertyId: string; zoneId: string }> 
}) {
  const [propertyId, setPropertyId] = useState<string>('')
  const [zoneId, setZoneId] = useState<string>('')
  const [zone, setZone] = useState<Zone | null>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [viewedSteps, setViewedSteps] = useState<Set<string>>(new Set())
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const [zoneCompleted, setZoneCompleted] = useState(false)
  const [activeStepIndex, setActiveStepIndex] = useState(0)

  // Unwrap params and fetch data
  useEffect(() => {
    params.then(({ propertyId: pId, zoneId: zId }) => {
      setPropertyId(pId)
      setZoneId(zId)
      fetchZoneData(pId, zId)
    })
  }, [params])

  // Track step views when active step changes
  useEffect(() => {
    if (zone && propertyId && zoneId && zone.steps.length > 0) {
      const currentStep = zone.steps.sort((a, b) => a.order - b.order)[activeStepIndex]
      if (currentStep && !viewedSteps.has(currentStep.id)) {
        // Track the step view
        trackStepViewed(propertyId, zoneId, activeStepIndex, zone.steps.length)
        setViewedSteps(prev => new Set(Array.from(prev).concat(currentStep.id)))
      }
    }
  }, [activeStepIndex, zone, propertyId, zoneId, viewedSteps])

  // Initialize first step as viewed
  useEffect(() => {
    if (zone && zone.steps.length > 0 && viewedSteps.size === 0) {
      const firstStep = zone.steps.sort((a, b) => a.order - b.order)[0]
      if (firstStep) {
        trackStepViewed(propertyId, zoneId, 0, zone.steps.length)
        setViewedSteps(new Set([firstStep.id]))
      }
    }
  }, [zone, propertyId, zoneId, viewedSteps.size])

  const fetchZoneData = async (pId: string, zId: string) => {
    try {
      setLoading(true)
      
      // Fetch both zone data and steps
      const [zoneResponse, stepsResponse, propertyResponse] = await Promise.all([
        fetch(`/api/properties/${pId}/zones/${zId}`),
        fetch(`/api/properties/${pId}/zones/${zId}/steps`),
        fetch(`/api/properties/${pId}`)
      ])
      
      const [zoneResult, stepsResult, propertyResult] = await Promise.all([
        zoneResponse.json(),
        stepsResponse.json(),
        propertyResponse.json()
      ])
      
      if (!zoneResponse.ok) {
        throw new Error(zoneResult.error || 'Zona no encontrada')
      }
      
      if (!propertyResponse.ok) {
        throw new Error(propertyResult.error || 'Propiedad no encontrada')
      }
      
      // Combine zone data with steps
      const zoneWithSteps = {
        ...zoneResult.data,
        steps: stepsResult.success ? stepsResult.data.map((step: any) => ({
          ...step,
          title: step.title || { es: `Paso ${step.order}`, en: `Step ${step.order}` },
          description: step.description || step.content,
          content: step.content
        })) : []
      }
      
      setZone(zoneWithSteps)
      setProperty(propertyResult.data)
    } catch (error) {
      console.error('Error fetching zone data:', error)
      setZone(null)
      setProperty(null)
    } finally {
      setLoading(false)
    }
  }

  const openWhatsApp = () => {
    if (property?.hostContactPhone && zone) {
      const message = encodeURIComponent(`Hola ${property.hostContactName}, tengo una consulta sobre la zona "${getText(zone.name, 'la zona')}" en ${getText(property.name, 'la propiedad')}`)
      const phoneNumber = property.hostContactPhone.replace(/\s/g, '').replace('+', '')
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
    }
  }

  const makeCall = () => {
    if (property?.hostContactPhone) {
      window.open(`tel:${property.hostContactPhone}`, '_self')
    }
  }

  const markStepCompleted = (stepId: string) => {
    setCompletedSteps(prev => new Set(Array.from(prev).concat(stepId)))
  }

  const markStepIncomplete = (stepId: string) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev)
      newSet.delete(stepId)
      return newSet
    })
  }

  const nextStep = () => {
    if (zone && activeStepIndex < zone.steps.length - 1) {
      const currentStep = zone.steps.sort((a, b) => a.order - b.order)[activeStepIndex]
      // Mark current step as completed
      setCompletedSteps(prev => new Set(Array.from(prev).concat(currentStep.id)))
      // Move to next step
      setActiveStepIndex(activeStepIndex + 1)
      
      // Scroll to next step smoothly
      setTimeout(() => {
        const nextStepElement = document.getElementById(`step-${activeStepIndex + 1}`)
        if (nextStepElement) {
          nextStepElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }

  const finishStep = () => {
    if (zone && zone.steps.length > 0) {
      const currentStep = zone.steps.sort((a, b) => a.order - b.order)[activeStepIndex]
      // Mark current step as completed
      setCompletedSteps(prev => new Set(Array.from(prev).concat(currentStep.id)))
      
      // If single step or last step, show rating modal
      if (zone.steps.length === 1 || activeStepIndex === zone.steps.length - 1) {
        setZoneCompleted(true)
        trackZoneCompleted(propertyId, zoneId, Date.now())
        setShowRatingModal(true)
      }
    }
  }

  const prevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(activeStepIndex - 1)
      
      // Scroll to previous step smoothly
      setTimeout(() => {
        const prevStepElement = document.getElementById(`step-${activeStepIndex - 1}`)
        if (prevStepElement) {
          prevStepElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }

  const submitRating = async () => {
    if (rating === 0) return
    
    setIsSubmittingRating(true)
    try {
      await trackZoneRated(propertyId, zoneId, rating, comment || undefined)
      setShowRatingModal(false)
      // Optionally redirect back to property page or show success message
    } catch (error) {
      console.error('Error submitting rating:', error)
    } finally {
      setIsSubmittingRating(false)
    }
  }

  const goToStep = (index: number) => {
    setActiveStepIndex(index)
    setTimeout(() => {
      const stepElement = document.getElementById(`step-${index}`)
      if (stepElement) {
        stepElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

  if (loading) {
    return <AnimatedLoadingSpinner text="Cargando instrucciones de la zona..." type="zones" />
  }

  if (!zone || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Zona no encontrada</h1>
          <p className="text-gray-600 mb-4">La zona que buscas no existe o no está disponible.</p>
          <Link href={`/guide/${propertyId}`}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la propiedad
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // If no steps, show empty state
  if (!zone.steps || zone.steps.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link href={`/guide/${propertyId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
          </div>
        </header>
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 text-4xl ${
              zone.color || 'bg-gray-100'
            }`}>
              {zone.icon || '📁'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{getText(zone.name, 'Zona')}</h2>
            <p className="text-gray-600 mb-6">{getText(zone.description, '')}</p>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-yellow-800">
                <strong>🚧 En construcción:</strong> El anfitrión aún está preparando el contenido de esta zona.
              </p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const sortedSteps = zone.steps.sort((a, b) => a.order - b.order)
  const progress = ((activeStepIndex + 1) / zone.steps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/guide/${zone.propertyId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                  zone.color || 'bg-gray-100'
                }`}>
                  {zone.icon || '📁'}
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">{getText(zone.name, 'Zona')}</h1>
                  <p className="text-sm text-gray-600">{getText(property.name, 'Propiedad')}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openWhatsApp}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={makeCall}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Phone className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Llamar</span>
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Paso {activeStepIndex + 1} de {zone.steps.length}</span>
              <span>{Math.round(progress)}% completado</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-violet-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Vertical Timeline */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="relative">
          {/* Timeline Steps */}
          {sortedSteps.map((step, index) => (
            <motion.div
              key={step.id}
              id={`step-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: index <= activeStepIndex ? 1 : 0.4,
                y: 0 
              }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex mb-8 ${index <= activeStepIndex ? '' : 'pointer-events-none'}`}
            >
              {/* Timeline Line */}
              <div className="flex flex-col items-center mr-6">
                {/* Step Number Circle */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 z-10 ${
                  completedSteps.has(step.id)
                    ? 'bg-green-600 text-white border-green-600'
                    : index === activeStepIndex
                    ? 'bg-violet-600 text-white border-violet-600'
                    : index < activeStepIndex
                    ? 'bg-violet-100 text-violet-600 border-violet-300'
                    : 'bg-gray-200 text-gray-500 border-gray-300'
                }`}>
                  {completedSteps.has(step.id) ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.order
                  )}
                </div>
                
                {/* Vertical Line */}
                {index < sortedSteps.length - 1 && (
                  <div className={`w-0.5 h-20 mt-2 ${
                    index < activeStepIndex
                      ? 'bg-violet-600'
                      : 'bg-gray-300'
                  }`} />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1">
                <Card className={`${
                  index === activeStepIndex 
                    ? 'border-violet-300 bg-violet-50/50' 
                    : index < activeStepIndex
                    ? 'border-green-200 bg-green-50/30'
                    : 'border-gray-200'
                }`}>
                  <CardContent className="p-6">
                    {/* Step Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant={step.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {step.type}
                          </Badge>
                          {step.estimatedTime && (
                            <span className="text-sm text-gray-500">
                              {step.estimatedTime} min
                            </span>
                          )}
                          {completedSteps.has(step.id) && (
                            <Badge variant="default" className="bg-green-600">
                              Completado
                            </Badge>
                          )}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                          {getText(step.title, 'Paso')}
                        </h2>
                        {step.description && (
                          <p className="text-gray-700 leading-relaxed mb-4">
                            {getText(step.description, '')}
                          </p>
                        )}
                        {step.content && (
                          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
                            {getText(step.content, '')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step Media */}
                    {step.type === 'IMAGE' && step.mediaUrl && (
                      <div className="mb-6">
                        <img
                          src={step.mediaUrl}
                          alt={getText(step.title, 'Imagen del paso')}
                          className="w-full h-auto rounded-lg shadow-lg"
                        />
                      </div>
                    )}

                    {step.type === 'VIDEO' && step.mediaUrl && (
                      <div className="mb-6">
                        <div className="relative rounded-lg overflow-hidden shadow-lg">
                          <video
                            className="w-full h-auto"
                            controls
                            poster="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop"
                          >
                            <source src={step.mediaUrl} type="video/mp4" />
                            Tu navegador no soporta videos.
                          </video>
                        </div>
                      </div>
                    )}

                    {step.type === 'LINK' && step.linkUrl && (
                      <div className="mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <ArrowRight className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-blue-900 mb-1">Enlace externo</h3>
                              <p className="text-blue-700 text-sm mb-3">
                                Haz clic para abrir este recurso en una nueva pestaña
                              </p>
                              <Button
                                onClick={() => window.open(step.linkUrl, '_blank')}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Abrir enlace
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step Actions - Show only for active step */}
                    {index === activeStepIndex && (
                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        {activeStepIndex > 0 && (
                          <Button
                            variant="outline"
                            onClick={prevStep}
                            className="flex-1"
                          >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Anterior
                          </Button>
                        )}
                        
                        {/* Single step or last step */}
                        {(sortedSteps.length === 1 || index === sortedSteps.length - 1) ? (
                          <Button
                            onClick={finishStep}
                            disabled={completedSteps.has(step.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {completedSteps.has(step.id) ? 'Completado' : '¡Ya lo tengo!'}
                            <Check className="w-4 h-4 ml-2" />
                          </Button>
                        ) : (
                          <Button
                            onClick={nextStep}
                            className="flex-1"
                          >
                            Siguiente
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-gray-500 text-sm mt-8"
        >
          <p>
            Powered by <ItineramioLogo size="sm" className="inline-block mx-1" /> Itineramio
          </p>
        </motion.div>
      </main>

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowRatingModal(false)
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {zone.steps.length === 1 ? '¡Instrucción completada!' : '¡Zona completada!'}
                </h3>
                <p className="text-gray-600">
                  ¿Te ha resultado útil la información?
                </p>
              </div>

              {/* Star Rating */}
              <div className="flex justify-center space-x-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-1 transition-colors ${
                      star <= rating 
                        ? 'text-yellow-500' 
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    <Star 
                      className="w-8 h-8" 
                      fill={star <= rating ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentario o reporte (opcional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Cuéntanos qué te pareció o reporta algún problema con el manual..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1"
                  disabled={isSubmittingRating}
                >
                  Omitir
                </Button>
                <Button
                  onClick={submitRating}
                  disabled={rating === 0 || isSubmittingRating}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  {isSubmittingRating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}