'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Play, Pause, ChevronLeft, ChevronRight, Phone, MessageCircle, Check, X, Star, Send, Wifi, Zap, Car, Utensils, Bed, Bath, Shield, Tv, Coffee, MapPin, Globe, Clock, Mail } from 'lucide-react'
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
  thumbnail?: string
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

// Zone icon mapping
const getZoneIcon = (iconName: string, className: string = "w-6 h-6") => {
  const iconMap: { [key: string]: JSX.Element } = {
    'wifi': <Wifi className={className} />,
    'zap': <Zap className={className} />,
    'car': <Car className={className} />,
    'parking': <Car className={className} />,
    'kitchen': <Utensils className={className} />,
    'cocina': <Utensils className={className} />,
    'bed': <Bed className={className} />,
    'dormitorio': <Bed className={className} />,
    'bath': <Bath className={className} />,
    'baño': <Bath className={className} />,
    'security': <Shield className={className} />,
    'seguridad': <Shield className={className} />,
    'tv': <Tv className={className} />,
    'coffee': <Coffee className={className} />,
    'location': <MapPin className={className} />,
    'ubicacion': <MapPin className={className} />
  }
  
  return iconMap[iconName.toLowerCase()] || <MapPin className={className} />
}

// Helper function to get text from multilingual objects
const getText = (value: any, language: string = 'es', fallback: string = '') => {
  if (typeof value === 'string') {
    return value
  }
  if (value && typeof value === 'object') {
    return value[language] || value.es || value.en || value.fr || fallback
  }
  return fallback
}

// Translations for the public interface
const translations = {
  es: {
    loading: 'Cargando instrucciones de la zona...',
    zoneNotFound: 'Zona no encontrada',
    zoneNotFoundDesc: 'La zona que buscas no existe o no está disponible.',
    backToProperty: 'Volver a la propiedad',
    noSteps: 'Sin instrucciones',
    noStepsDesc: 'Esta zona aún no tiene instrucciones configuradas.',
    previous: 'Anterior',
    next: 'Siguiente',
    finish: '¡Ya lo tengo!',
    rateExperience: '¿Te ha resultado útil la información?',
    rateExperienceDesc: 'Tu opinión nos ayuda a mejorar la experiencia para futuros huéspedes',
    addComment: 'Agregar comentario (opcional)',
    commentPlaceholder: '¿Algo que agregar o mejorar?',
    submitRating: 'Enviar valoración',
    skip: 'Omitir',
    contactHost: 'Contactar anfitrión',
    callHost: 'Llamar',
    messageHost: 'Mensaje',
    step: 'Paso',
    of: 'de',
    underConstruction: '🚧 En construcción:',
    underConstructionDesc: 'El anfitrión aún está preparando el contenido de esta zona.',
    completed: 'Completado',
    hostOf: 'Anfitrión de',
    close: 'Cerrar',
    call: 'Llamar',
    send: 'Enviar',
    email: 'Email',
    externalLink: 'Enlace externo',
    externalLinkDesc: 'Haz clic para abrir este recurso en una nueva pestaña',
    openLink: 'Abrir enlace',
    videoNotSupported: 'Tu navegador no soporta videos.',
    instructionCompleted: '¡Instrucción completada!',
    zoneCompleted: '¡Zona completada!',
    commentOptional: 'Comentario o reporte (opcional)',
    commentPlaceholder2: 'Cuéntanos qué te pareció o reporta algún problema con el manual...',
    viewed: 'Visto'
  },
  en: {
    loading: 'Loading zone instructions...',
    zoneNotFound: 'Zone not found',
    zoneNotFoundDesc: 'The zone you are looking for does not exist or is not available.',
    backToProperty: 'Back to property',
    noSteps: 'No instructions',
    noStepsDesc: 'This zone does not have instructions configured yet.',
    previous: 'Previous',
    next: 'Next',
    finish: 'Got it!',
    rateExperience: 'Was this information helpful?',
    rateExperienceDesc: 'Your feedback helps us improve the experience for future guests',
    addComment: 'Add comment (optional)',
    commentPlaceholder: 'Anything to add or improve?',
    submitRating: 'Submit rating',
    skip: 'Skip',
    contactHost: 'Contact host',
    callHost: 'Call',
    messageHost: 'Message',
    step: 'Step',
    of: 'of',
    underConstruction: '🚧 Under construction:',
    underConstructionDesc: 'The host is still preparing the content for this zone.',
    completed: 'Completed',
    hostOf: 'Host of',
    close: 'Close',
    call: 'Call',
    send: 'Send',
    email: 'Email',
    externalLink: 'External link',
    externalLinkDesc: 'Click to open this resource in a new tab',
    openLink: 'Open link',
    videoNotSupported: 'Your browser does not support videos.',
    instructionCompleted: 'Instruction completed!',
    zoneCompleted: 'Zone completed!',
    commentOptional: 'Comment or report (optional)',
    commentPlaceholder2: 'Tell us what you thought or report any problem with the manual...',
    viewed: 'Viewed'
  },
  fr: {
    loading: 'Chargement des instructions de la zone...',
    zoneNotFound: 'Zone non trouvée',
    zoneNotFoundDesc: 'La zone que vous recherchez n\'existe pas ou n\'est pas disponible.',
    backToProperty: 'Retour à la propriété',
    noSteps: 'Aucune instruction',
    noStepsDesc: 'Cette zone n\'a pas encore d\'instructions configurées.',
    previous: 'Précédent',
    next: 'Suivant',
    finish: 'Compris !',
    rateExperience: 'Cette information a-t-elle été utile ?',
    rateExperienceDesc: 'Vos commentaires nous aident à améliorer l\'expérience pour les futurs invités',
    addComment: 'Ajouter un commentaire (optionnel)',
    commentPlaceholder: 'Quelque chose à ajouter ou améliorer ?',
    submitRating: 'Soumettre l\'évaluation',
    skip: 'Ignorer',
    contactHost: 'Contacter l\'hôte',
    callHost: 'Appeler',
    messageHost: 'Message',
    step: 'Étape',
    of: 'sur',
    underConstruction: '🚧 En construction :',
    underConstructionDesc: 'L\'hôte prépare encore le contenu de cette zone.',
    completed: 'Terminé',
    hostOf: 'Hôte de',
    close: 'Fermer',
    call: 'Appeler',
    send: 'Envoyer',
    email: 'E-mail',
    externalLink: 'Lien externe',
    externalLinkDesc: 'Cliquez pour ouvrir cette ressource dans un nouvel onglet',
    openLink: 'Ouvrir le lien',
    videoNotSupported: 'Votre navigateur ne prend pas en charge les vidéos.',
    instructionCompleted: 'Instruction terminée !',
    zoneCompleted: 'Zone terminée !',
    commentOptional: 'Commentaire ou signalement (optionnel)',
    commentPlaceholder2: 'Dites-nous ce que vous en avez pensé ou signalez un problème avec le manuel...',
    viewed: 'Vu'
  }
}

// Get translation function
const t = (key: string, language: string = 'es') => {
  return translations[language as keyof typeof translations]?.[key as keyof typeof translations.es] || translations.es[key as keyof typeof translations.es] || key
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
    // Use the proper evaluations endpoint that saves to database
    const response = await fetch('/api/evaluations/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId,
        zoneId,
        rating,
        comment: comment || null,
        userName: 'Usuario anónimo',
        reviewType: 'zone',
        isPublic: false,
        clarity: rating,
        completeness: rating,
        helpfulness: rating,
        upToDate: rating
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Zone evaluation saved successfully')
    } else {
      console.error('❌ Failed to save zone evaluation:', result.error)
    }
  } catch (error) {
    console.error('Error saving zone evaluation:', error)
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
  const [language, setLanguage] = useState('es')
  const [showHostModal, setShowHostModal] = useState(false)
  const [animatingLines, setAnimatingLines] = useState<Set<number>>(new Set())

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
      
      // First resolve the property ID from slug if needed
      const resolveResponse = await fetch(`/api/public/resolve-property/${pId}`)
      const resolveResult = await resolveResponse.json()
      
      if (!resolveResponse.ok) {
        throw new Error(resolveResult.error || 'Propiedad no encontrada')
      }
      
      const actualPropertyId = resolveResult.data.id
      console.log('🔍 Resolved property ID:', actualPropertyId, 'from:', pId)
      
      // Fetch both zone data and steps using public APIs with resolved ID
      const [zoneResponse, stepsResponse, propertyResponse] = await Promise.all([
        fetch(`/api/public/properties/${actualPropertyId}/zones/${zId}`),
        fetch(`/api/public/properties/${actualPropertyId}/zones/${zId}/steps`),
        fetch(`/api/public/properties/${actualPropertyId}`)
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
        steps: stepsResult.success ? stepsResult.data.map((step: any) => {
          console.log('🔍 Frontend step:', {
            title: step.title,
            type: step.type,
            hasContent: !!step.content,
            contentEs: step.content?.es,
            mediaUrl: step.mediaUrl
          })
          return {
            ...step,
            title: step.title, // Keep original title, don't generate default
            description: step.description,
            content: step.content,
            mediaUrl: step.mediaUrl,
            linkUrl: step.linkUrl,
            thumbnail: step.thumbnail
          }
        }) : []
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
      const greeting = language === 'en' ? 'Hello' : language === 'fr' ? 'Bonjour' : 'Hola'
      const question = language === 'en' 
        ? 'I have a question about the zone' 
        : language === 'fr' 
        ? 'J\'ai une question sur la zone' 
        : 'tengo una consulta sobre la zona'
      const inText = language === 'en' ? 'in' : language === 'fr' ? 'dans' : 'en'
      
      const message = encodeURIComponent(`${greeting} ${property.hostContactName}, ${question} "${getText(zone.name, language, 'la zona')}" ${inText} ${getText(property.name, language, 'la propiedad')}`)
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
      
      // Animate the connecting line
      setAnimatingLines(prev => new Set(Array.from(prev).concat(activeStepIndex)))
      
      // Move to next step with delay for line animation
      setTimeout(() => {
        setActiveStepIndex(activeStepIndex + 1)
        
        // Scroll to next step smoothly
        setTimeout(() => {
          const nextStepElement = document.getElementById(`step-${activeStepIndex + 1}`)
          if (nextStepElement) {
            nextStepElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 300)
      }, 150)
    }
  }

  const finishStep = () => {
    if (zone && zone.steps.length > 0) {
      const currentStep = zone.steps.sort((a, b) => a.order - b.order)[activeStepIndex]
      // Mark current step as completed
      setCompletedSteps(prev => new Set(Array.from(prev).concat(currentStep.id)))
      
      // If single step or last step, complete zone and show rating modal only if not already viewed
      if (zone.steps.length === 1 || activeStepIndex === zone.steps.length - 1) {
        setZoneCompleted(true)
        trackZoneCompleted(propertyId, zoneId, Date.now())
        
        // Check if zone was already rated to avoid showing modal again
        const wasAlreadyViewed = localStorage.getItem(`zone-${zoneId}-viewed`)
        if (!wasAlreadyViewed) {
          setShowRatingModal(true)
        } else {
          // If already viewed, redirect directly to property guide
          setTimeout(() => {
            window.location.href = `/guide/${propertyId}`
          }, 500)
        }
      }
    }
  }

  // Check if zone is already viewed
  const isZoneViewed = () => {
    return localStorage.getItem(`zone-${zoneId}-viewed`) === 'true'
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
      // Mark zone as viewed in localStorage
      localStorage.setItem(`zone-${zoneId}-viewed`, 'true')
      setShowRatingModal(false)
      // Redirect back to zones view
      setTimeout(() => {
        window.location.href = `/guide/${propertyId}`
      }, 500)
    } catch (error) {
      console.error('Error submitting rating:', error)
    } finally {
      setIsSubmittingRating(false)
    }
  }

  const skipRating = () => {
    // Mark zone as viewed even if rating is skipped
    localStorage.setItem(`zone-${zoneId}-viewed`, 'true')
    setShowRatingModal(false)
    // Redirect back to zones view
    setTimeout(() => {
      window.location.href = `/guide/${propertyId}`
    }, 500)
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
    return <AnimatedLoadingSpinner text={t('loading', language)} type="zones" />
  }

  if (!zone || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">{t('zoneNotFound', language)}</h1>
          <p className="text-gray-600 mb-4">{t('zoneNotFoundDesc', language)}</p>
          <Link href={`/guide/${propertyId}`}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToProperty', language)}
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
          <div className="max-w-3xl mx-auto px-4 py-4">
            <Link href={`/guide/${propertyId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('backToProperty', language)}
              </Button>
            </Link>
          </div>
        </header>
        
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 text-4xl ${
              zone.color || 'bg-gray-100'
            }`}>
              {zone.icon || '📁'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{getText(zone.name, language, 'Zona')}</h2>
            <p className="text-gray-600 mb-6">{getText(zone.description, language, '')}</p>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-yellow-800">
                <strong>{t('underConstruction', language)}</strong> {t('underConstructionDesc', language)}
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
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* First row - Back button and controls */}
          <div className="flex items-center justify-between mb-3">
            <Link href={`/guide/${zone.propertyId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{t('backToProperty', language)}</span>
                <span className="sm:hidden">Volver</span>
              </Button>
            </Link>
            
            <div className="flex items-center space-x-2">
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="es">🇪🇸</option>
                <option value="en">🇬🇧</option>
                <option value="fr">🇫🇷</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHostModal(true)}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Contacto</span>
              </Button>
            </div>
          </div>

          {/* Second row - Zone info */}
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
              zone.color || 'bg-gradient-to-br from-violet-500 to-purple-600'
            }`}>
              {zone.icon ? getZoneIcon(zone.icon, "w-6 h-6") : <MapPin className="w-6 h-6" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-bold text-lg text-gray-900 truncate">{getText(zone.name, language, 'Zona')}</h1>
                {isZoneViewed() && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full whitespace-nowrap">
                    {t('viewed', language)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">{getText(property.name, language, 'Propiedad')}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>{t('step', language)} {activeStepIndex + 1} {t('of', language)} {zone.steps.length}</span>
              <span>{Math.round(progress)}% {t('completed', language)}</span>
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

      {/* Main Content - Dynamic Vertical Timeline */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="relative">
          {/* Timeline Steps */}
          {sortedSteps.map((step, index) => (
            <motion.div
              key={step.id}
              id={`step-${index}`}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ 
                opacity: index <= activeStepIndex ? 1 : 0.3,
                y: 0,
                scale: index === activeStepIndex ? 1 : 0.95
              }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.15,
                type: "spring",
                stiffness: 100
              }}
              className={`relative flex mb-12 ${index <= activeStepIndex ? '' : 'pointer-events-none'}`}
            >
              {/* Enhanced Timeline Line */}
              <div className="flex flex-col items-center mr-8">
                {/* Step Number Circle with Glow Effect */}
                <motion.div 
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-3 z-10 shadow-lg ${
                    completedSteps.has(step.id)
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400 shadow-green-400/50'
                      : index === activeStepIndex
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-violet-400 shadow-violet-400/50'
                      : index < activeStepIndex
                      ? 'bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border-violet-300'
                      : 'bg-white text-gray-400 border-gray-300'
                  }`}
                  animate={{
                    scale: 1, // Remove the infinite scaling animation
                    boxShadow: index === activeStepIndex 
                      ? "0 0 0 4px rgba(139, 92, 246, 0.2)" // Static shadow instead of animated
                      : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  }}
                  transition={{
                    scale: { duration: 0.3 }, // Short transition only
                    boxShadow: { duration: 0.3 }
                  }}
                >
                  {completedSteps.has(step.id) ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <Check className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <span className="text-lg font-bold">{index + 1}</span>
                  )}
                </motion.div>
                
                {/* Animated Connecting Line */}
                {index < sortedSteps.length - 1 && (
                  <div className="relative mt-3">
                    {/* Background line */}
                    <div className="w-1 h-32 bg-gray-200" />
                    
                    {/* Animated progress line */}
                    <motion.div
                      className={`absolute top-0 w-1 ${
                        animatingLines.has(index)
                          ? 'bg-gradient-to-b from-violet-500 to-purple-600'
                          : index < activeStepIndex
                          ? 'bg-gradient-to-b from-green-500 to-emerald-600'
                          : 'bg-gray-200'
                      }`}
                      initial={{ height: 0 }}
                      animate={{ 
                        height: animatingLines.has(index) || index < activeStepIndex ? '100%' : 0 
                      }}
                      transition={{ 
                        duration: animatingLines.has(index) ? 0.8 : 0.3,
                        ease: "easeInOut"
                      }}
                      style={{
                        background: animatingLines.has(index) 
                          ? 'linear-gradient(to bottom, #8b5cf6, #a855f7, #10b981)'
                          : undefined,
                        borderLeft: animatingLines.has(index) ? '2px dashed rgba(255,255,255,0.5)' : undefined
                      }}
                    />
                    
                    {/* Flowing particles effect */}
                    {animatingLines.has(index) && (
                      <motion.div
                        className="absolute top-0 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 shadow-lg"
                        animate={{ y: [0, 128] }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Enhanced Step Content */}
              <motion.div 
                className="flex-1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <Card className={`relative overflow-hidden transition-all duration-500 ${
                  index === activeStepIndex 
                    ? 'border-violet-300 bg-gradient-to-br from-violet-50 to-purple-50 shadow-xl shadow-violet-100' 
                    : index < activeStepIndex
                    ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md'
                    : 'border-gray-200 bg-white'
                }`}>
                  {/* Glowing border for active step - single animation */}
                  {index === activeStepIndex && (
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      initial={{
                        background: "linear-gradient(0deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.1))"
                      }}
                      animate={{
                        background: [
                          "linear-gradient(0deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.1))",
                          "linear-gradient(90deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.2))",
                          "linear-gradient(180deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.1))",
                          "linear-gradient(270deg, rgba(168, 85, 247, 0.2), rgba(139, 92, 246, 0.2))",
                          "linear-gradient(360deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.1))"
                        ]
                      }}
                      transition={{ 
                        duration: 2, 
                        ease: "easeInOut",
                        repeat: 0 // Solo una vez, no infinito
                      }}
                    />
                  )}
                  
                  <CardContent className="p-8 relative z-10">
                    {/* Step Header - Clean, no badges */}
                    <div className="mb-6">
                      {/* Show title if provided and different from content */}
                      {(() => {
                        const titleText = getText(step.title, language, '');
                        const contentText = getText(step.content, language, '');
                        
                        // Show title only if it exists, is not empty, AND is different from content
                        if (titleText && titleText.trim() && titleText !== contentText) {
                          return (
                            <motion.h2 
                              className={`text-2xl font-bold mb-3 break-words ${
                                index === activeStepIndex ? 'text-violet-900' : 'text-gray-900'
                              }`}
                              layoutId={`title-${step.id}`}
                            >
                              {titleText}
                            </motion.h2>
                          );
                        }
                        return null;
                      })()}
                      
                      {step.estimatedTime && (
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{step.estimatedTime} min</span>
                        </div>
                      )}
                      
                      {/* Content rendering - show full content for all types */}
                      {(() => {
                        const contentText = getText(step.content, language, '');
                        
                        // For all step types, show content if it exists
                        if (contentText && contentText.trim()) {
                          return (
                            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap mt-4 break-words text-base">
                              {contentText}
                            </div>
                          );
                        }
                        
                        return null;
                      })()}
                      
                      {completedSteps.has(step.id) && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 flex items-center text-green-600 font-medium"
                        >
                          <Check className="w-5 h-5 mr-2" />
                          Completado
                        </motion.div>
                      )}
                    </div>

                    {/* Enhanced Step Media */}
                    <AnimatePresence mode="wait">
                      {step.type === 'IMAGE' && step.mediaUrl && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="mb-6"
                        >
                          <div className="relative rounded-xl overflow-hidden shadow-lg">
                            <img
                              src={step.mediaUrl}
                              alt={getText(step.title, language, 'Imagen del paso')}
                              className="w-full h-auto max-w-xs mx-auto block rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                              style={{
                                maxHeight: '50vh',
                                objectFit: 'contain'
                              }}
                            />
                            
                            {/* Mobile-optimized image hint */}
                            <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded pointer-events-none">
                              📱 Optimizado para móvil
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {step.type === 'VIDEO' && step.mediaUrl && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="mb-6"
                        >
                          <div className="relative rounded-2xl overflow-hidden shadow-lg bg-black mx-auto max-w-sm">
                            {/* Video optimized for vertical format */}
                            <video
                              className="w-full h-auto block"
                              controls
                              playsInline
                              preload="metadata"
                              poster={step.thumbnail || undefined}
                              style={{
                                maxHeight: '70vh',
                                minHeight: '300px',
                                aspectRatio: '9/16', // Force vertical aspect ratio
                                objectFit: 'cover'
                              }}
                            >
                              <source src={step.mediaUrl} type="video/mp4" />
                              <source src={step.mediaUrl} type="video/webm" />
                              {t('videoNotSupported', language) || 'Tu navegador no soporta este video'}
                            </video>
                            
                            {/* Mobile-optimized video controls hint */}
                            <div className="absolute bottom-3 left-3 right-3 bg-black bg-opacity-60 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm pointer-events-none">
                              <div className="flex items-center justify-center space-x-2">
                                <span>📱</span>
                                <span>Optimizado para móvil - Toca para reproducir</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {step.type === 'LINK' && step.linkUrl && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          className="mb-6"
                        >
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <ArrowRight className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-blue-900 mb-1">{t('externalLink', language)}</h3>
                                <p className="text-blue-700 text-sm mb-3">
                                  {t('externalLinkDesc', language)}
                                </p>
                                <Button
                                  onClick={() => window.open(step.linkUrl, '_blank')}
                                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                >
                                  {t('openLink', language)}
                                  <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Enhanced Step Actions - Show only for active step */}
                    {index === activeStepIndex && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex gap-4 pt-6 border-t border-gray-200"
                      >
                        {activeStepIndex > 0 && (
                          <Button
                            variant="outline"
                            onClick={prevStep}
                            className="flex-1 border-violet-200 text-violet-700 hover:bg-violet-50"
                          >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            {t('previous', language)}
                          </Button>
                        )}
                        
                        {/* Single step or last step */}
                        {(sortedSteps.length === 1 || index === sortedSteps.length - 1) ? (
                          <Button
                            onClick={finishStep}
                            disabled={completedSteps.has(step.id)}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                          >
                            {completedSteps.has(step.id) ? t('completed', language) : t('finish', language)}
                            <Check className="w-4 h-4 ml-2" />
                          </Button>
                        ) : (
                          <Button
                            onClick={nextStep}
                            className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg"
                          >
                            {t('next', language)}
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
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

      {/* Host Contact Modal */}
      <AnimatePresence>
        {showHostModal && property && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowHostModal(false)
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
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  {property.hostContactPhoto ? (
                    <img 
                      src={property.hostContactPhoto} 
                      alt={property.hostContactName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <MessageCircle className="w-10 h-10 text-white" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {property.hostContactName}
                </h3>
                <p className="text-gray-600">
                  {t('hostOf', language)} {getText(property.name, language, 'esta propiedad')}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-500 mr-3" />
                    <span className="text-gray-700">{property.hostContactPhone}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => window.open(`tel:${property.hostContactPhone}`, '_self')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {t('call', language)}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <MessageCircle className="w-5 h-5 text-gray-500 mr-3" />
                    <span className="text-gray-700">WhatsApp</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={openWhatsApp}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {t('send', language)}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-500 mr-3" />
                    <span className="text-gray-700 truncate">{property.hostContactEmail}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => window.open(`mailto:${property.hostContactEmail}`, '_self')}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {t('email', language)}
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowHostModal(false)}
                className="w-full"
              >
                {t('close', language)}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  {zone.steps.length === 1 
                    ? t('instructionCompleted', language)
                    : t('zoneCompleted', language)
                  }
                </h3>
                <p className="text-gray-600">
                  {t('rateExperience', language)}
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
                  {t('commentOptional', language)}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('commentPlaceholder2', language)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={skipRating}
                  className="flex-1"
                  disabled={isSubmittingRating}
                >
                  {t('skip', language)}
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
                      {t('submitRating', language)}
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