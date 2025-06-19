'use client'

import React, { useState, useEffect } from 'react'

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
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Youtube,
  Globe,
  PlayCircle,
  ExternalLink,
  MapPin,
  Clock
} from 'lucide-react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Step {
  id: string
  type: string
  title: { es: string; en?: string; fr?: string }
  content: { es: string; en?: string; fr?: string }
  order: number
  media?: {
    url: string
    thumbnail?: string
    title?: string
  }
}

interface Zone {
  id: string
  name: string
  description: string
  icon: string
  color: string
  steps: Step[]
  property: {
    id: string
    name: string
    city: string
    country: string
  }
}

export default function PublicZonePage() {
  const params = useParams()
  const [zone, setZone] = useState<Zone | null>(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<'es' | 'en' | 'fr'>('es')
  const [error, setError] = useState<string | null>(null)
  
  const zoneCode = params.zoneCode as string

  useEffect(() => {
    if (zoneCode) {
      fetchZoneData()
    }
  }, [zoneCode])

  const fetchZoneData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/public/zones/${zoneCode}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Zona no encontrada')
        } else {
          setError('Error al cargar la zona')
        }
        return
      }

      const data = await response.json()
      setZone(data.data)
    } catch (error) {
      console.error('Error fetching zone:', error)
      setError('Error al cargar la zona')
    } finally {
      setLoading(false)
    }
  }

  const getStepIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'text':
        return <FileText className="w-5 h-5" />
      case 'image':
        return <ImageIcon className="w-5 h-5" />
      case 'video':
        return <PlayCircle className="w-5 h-5" />
      case 'youtube':
        return <Youtube className="w-5 h-5" />
      case 'link':
        return <Globe className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getContent = (content: { es: string; en?: string; fr?: string }) => {
    return content[language] || content.es || 'Contenido no disponible'
  }

  const getTitle = (title: { es: string; en?: string; fr?: string }) => {
    return title[language] || title.es || 'Sin título'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando zona...</p>
        </div>
      </div>
    )
  }

  if (error || !zone) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Zona no encontrada</h1>
            <p className="text-gray-600">
              {error || 'La zona que buscas no existe o ya no está disponible.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: zone.color || '#6366f1' }}
              >
                {zone.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{getText(zone.name, 'Zona')}</h1>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {getText(zone.property.name, 'Propiedad')} • {getText(zone.property.city, '')}, {getText(zone.property.country, '')}
                </p>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { code: 'es', label: 'ES', flag: '🇪🇸' },
                { code: 'en', label: 'EN', flag: '🇬🇧' },
                { code: 'fr', label: 'FR', flag: '🇫🇷' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as any)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    language === lang.code
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {lang.flag} {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Zone Description */}
        {zone.description && (
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-200">
            <p className="text-gray-700 leading-relaxed">{zone.description}</p>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Instrucciones paso a paso
            </h2>
            <span className="bg-violet-100 text-violet-700 px-2 py-1 rounded-full text-sm font-medium">
              {zone.steps?.length || 0} pasos
            </span>
          </div>

          {zone.steps?.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Timeline */}
              <div className="flex items-start gap-4">
                {/* Step number and line */}
                <div className="flex flex-col items-center">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg"
                    style={{ backgroundColor: '#484848' }}
                  >
                    {index + 1}
                  </div>
                  {index < zone.steps.length - 1 && (
                    <div className="w-0.5 h-16 mt-2" style={{ backgroundColor: '#f1f1f1' }} />
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  {/* Step header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-violet-600">
                      {getStepIcon(step.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getTitle(step.title)}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {step.type.toLowerCase()}
                      </p>
                    </div>
                  </div>

                  {/* Media content */}
                  {step.media?.url && (
                    <div className="mb-4 rounded-xl overflow-hidden">
                      {step.type.toLowerCase() === 'image' ? (
                        <img
                          src={step.media.url}
                          alt={getTitle(step.title)}
                          className="w-full h-64 object-cover"
                        />
                      ) : step.type.toLowerCase() === 'video' ? (
                        <div className="w-full h-64 bg-black rounded-xl flex items-center justify-center">
                          <PlayCircle className="w-16 h-16 text-white opacity-75" />
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Text content */}
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {getContent(step.content)}
                  </div>

                  {/* Link for external content */}
                  {step.type.toLowerCase() === 'link' && step.media?.url && (
                    <div className="mt-4">
                      <a
                        href={step.media.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Abrir enlace
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {(!zone.steps || zone.steps.length === 0) && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay pasos disponibles
              </h3>
              <p className="text-gray-600">
                Esta zona aún no tiene instrucciones configuradas.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Powered by{' '}
            <span className="font-semibold text-violet-600">Itineramio</span>
          </p>
        </div>
      </div>
    </div>
  )
}