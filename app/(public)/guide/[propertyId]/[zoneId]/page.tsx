'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Play, Pause, ChevronLeft, ChevronRight, Phone, MessageCircle, Check, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../../../src/components/ui/Button'
import { Card, CardContent } from '../../../../../src/components/ui/Card'
import { ZoneIconDisplay } from '../../../../../src/components/ui/IconSelector'
import { ItineramioLogo } from '../../../../../src/components/ui/ItineramioLogo'
import { Badge } from '../../../../../src/components/ui/Badge'

interface ZoneStep {
  id: string
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK'
  title: string
  description?: string
  content?: string
  mediaUrl?: string
  linkUrl?: string
  estimatedTime?: number
  order: number
  status: string
}

interface Zone {
  id: string
  name: string
  description: string
  icon: string
  color?: string
  propertyId: string
  steps: ZoneStep[]
}

interface Property {
  id: string
  name: string
  hostContactName: string
  hostContactPhone: string
  hostContactEmail: string
  hostContactPhoto?: string
}

export default async function ZoneGuidePage({ 
  params 
}: { 
  params: Promise<{ propertyId: string; zoneId: string }> 
}) {
  const { propertyId, zoneId } = await params
  const [zone, setZone] = useState<Zone | null>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchZoneData()
  }, [propertyId, zoneId])

  const fetchZoneData = async () => {
    try {
      setLoading(true)
      
      // Fetch both zone and property data
      const [zoneResponse, propertyResponse] = await Promise.all([
        fetch(`/api/properties/${propertyId}/zones/${zoneId}`),
        fetch(`/api/properties/${propertyId}`)
      ])
      
      const [zoneResult, propertyResult] = await Promise.all([
        zoneResponse.json(),
        propertyResponse.json()
      ])
      
      if (!zoneResponse.ok) {
        throw new Error(zoneResult.error || 'Zona no encontrada')
      }
      
      if (!propertyResponse.ok) {
        throw new Error(propertyResult.error || 'Propiedad no encontrada')
      }
      
      setZone(zoneResult.data)
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
      const message = encodeURIComponent(`Hola ${property.hostContactName}, tengo una consulta sobre la zona "${zone.name}" en ${property.name}`)
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
    if (zone && currentStepIndex < zone.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const goToStep = (index: number) => {
    setCurrentStepIndex(index)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full"
        />
      </div>
    )
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{zone.name}</h2>
            <p className="text-gray-600 mb-6">{zone.description}</p>
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

  const currentStep = zone.steps.sort((a, b) => a.order - b.order)[currentStepIndex]
  const progress = ((currentStepIndex + 1) / zone.steps.length) * 100

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
                  <h1 className="font-semibold text-gray-900">{zone.name}</h1>
                  <p className="text-sm text-gray-600">{property.name}</p>
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
              <span>Paso {currentStepIndex + 1} de {zone.steps.length}</span>
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-6">
              <CardContent className="p-8">
                {/* Step Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={currentStep.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {currentStep.type}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Paso {currentStep.order}
                      </span>
                      {currentStep.estimatedTime && (
                        <span className="text-sm text-gray-500">
                          • {currentStep.estimatedTime} min
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {currentStep.title}
                    </h2>
                    {currentStep.description && (
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {currentStep.description}
                      </p>
                    )}
                    {currentStep.content && (
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {currentStep.content}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    <Button
                      variant={completedSteps.has(currentStep.id) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => 
                        completedSteps.has(currentStep.id) 
                          ? markStepIncomplete(currentStep.id)
                          : markStepCompleted(currentStep.id)
                      }
                      className={completedSteps.has(currentStep.id) ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      {completedSteps.has(currentStep.id) ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Completado
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Marcar
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Step Media */}
                {currentStep.type === 'IMAGE' && currentStep.mediaUrl && (
                  <div className="mb-6">
                    <motion.img
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      src={currentStep.mediaUrl}
                      alt={currentStep.title}
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>
                )}

                {currentStep.type === 'VIDEO' && currentStep.mediaUrl && (
                  <div className="mb-6">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative rounded-lg overflow-hidden shadow-lg"
                    >
                      <video
                        className="w-full h-auto"
                        controls
                        poster="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop"
                      >
                        <source src={currentStep.mediaUrl} type="video/mp4" />
                        Tu navegador no soporta videos.
                      </video>
                      {currentStep.estimatedTime && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                          {Math.floor(currentStep.estimatedTime / 60)}:{String(currentStep.estimatedTime % 60).padStart(2, '0')}
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}

                {currentStep.type === 'LINK' && currentStep.linkUrl && (
                  <div className="mb-6">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-6"
                    >
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
                            onClick={() => window.open(currentStep.linkUrl, '_blank')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Abrir enlace
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="w-full sm:w-auto"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Paso anterior
          </Button>

          <div className="flex space-x-2">
            {zone.steps.sort((a, b) => a.order - b.order).map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStepIndex
                    ? 'bg-violet-600'
                    : index < currentStepIndex
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={nextStep}
            disabled={currentStepIndex === zone.steps.length - 1}
            className="w-full sm:w-auto"
          >
            Siguiente paso
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Steps Overview */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Todos los pasos
            </h3>
            <div className="space-y-3">
              {zone.steps.sort((a, b) => a.order - b.order).map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    index === currentStepIndex
                      ? 'bg-violet-100 border border-violet-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => goToStep(index)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    completedSteps.has(step.id)
                      ? 'bg-green-600 text-white'
                      : index === currentStepIndex
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {completedSteps.has(step.id) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.order
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{step.title}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Badge variant={step.status === 'ACTIVE' ? 'default' : 'secondary'} size="sm">
                        {step.type}
                      </Badge>
                      {step.estimatedTime && (
                        <span>• {step.estimatedTime} min</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

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
    </div>
  )
}