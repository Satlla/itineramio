'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  MapPin, 
  Users, 
  Bed, 
  Bath,
  Star,
  MessageCircle,
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft,
  Clock,
  ArrowRight,
  Share2,
  Copy,
  CheckCircle,
  Home,
  Shield,
  Wifi,
  Car,
  Utensils,
  Tv,
  Coffee,
  Zap,
  Eye,
  BarChart3,
  Lightbulb,
  Send,
  X,
  Key,
  DoorOpen,
  DoorClosed,
  Info,
  AlertTriangle,
  AlertCircle,
  FileText,
  Heart,
  Sofa,
  TreePine,
  Waves,
  Sun,
  Thermometer,
  Volume2,
  Trash2,
  Package,
  Settings,
  HelpCircle,
  Dumbbell,
  Book,
  ShoppingBag,
  Bus,
  Building
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '../../../../src/components/ui/Button'
import { Card } from '../../../../src/components/ui/Card'
import { ZoneIconDisplay } from '../../../../src/components/ui/IconSelector'
import { getZoneIconByName } from '../../../../src/data/zoneIconsExtended'
import { AnimatedLoadingSpinner } from '../../../../src/components/ui/AnimatedLoadingSpinner'

interface Property {
  id: string
  name: string | { es: string; en?: string; fr?: string }
  description: string | { es: string; en?: string; fr?: string }
  type: string
  city: string | { es: string; en?: string; fr?: string }
  state: string | { es: string; en?: string; fr?: string }
  street: string
  bedrooms: number
  bathrooms: number
  maxGuests: number
  profileImage?: string
  hostContactName: string
  hostContactPhone: string
  hostContactEmail: string
  hostContactPhoto?: string
  zones: Zone[]
}

interface Zone {
  id: string
  name: string | { es: string; en?: string; fr?: string }
  description: string | { es: string; en?: string; fr?: string }
  icon: string
  color?: string
  order: number
  stepsCount?: number
  status: string
}

// Zone icon component using the extended icon system
const getZoneIcon = (iconName: string, className: string = "w-6 h-6") => {
  if (!iconName) {
    const IconComponent = Home
    return <IconComponent className={className} />
  }
  
  // Use the extended zone icon mapping which handles all cases properly
  const IconComponent = getZoneIconByName(iconName)
  return <IconComponent className={className} />
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
    loading: 'Cargando manual de la propiedad...',
    manualNotFound: 'Manual no encontrado',
    manualNotFoundDesc: 'No pudimos encontrar el manual de esta propiedad. Es posible que el enlace sea incorrecto.',
    back: 'Volver',
    aboutYourAccommodation: 'Sobre tu alojamiento',
    aboutYourApartment: 'Sobre tu apartamento', 
    aboutYourHouse: 'Sobre tu casa',
    aboutYourHotel: 'Sobre tu hotel',
    aboutYourProperty: 'Sobre tu propiedad',
    accommodationWelcome: 'Bienvenido a este hermoso alojamiento. Esperamos que disfrutes tu estancia.',
    guests: 'Huéspedes',
    rooms: 'Habitaciones',
    bathrooms: 'Baños',
    type: 'Tipo',
    location: 'Ubicación',
    yourHost: 'Tu anfitrión',
    superhost: 'Anfitrión Verificado',
    contactWhatsApp: 'Contactar por WhatsApp',
    sendEmail: 'Enviar email',
    call: 'Llamar',
    emergencies247: 'Emergencias 24/7',
    share: 'Compartir',
    progressWarningTitle: '¡Has visto solo el {progress}% del manual!',
    progressWarningDesc: 'Para tener una estancia sin dudas, te recomendamos revisar todas las secciones. Esto te ayudará a conocer todos los servicios y evitar inconvenientes durante tu viaje.',
    apartmentManual: 'Manual del apartamento',
    houseManual: 'Manual de la casa',
    hotelManual: 'Manual del hotel',
    propertyManual: 'Manual de la propiedad',
    sectionsAvailable: 'secciones disponibles',
    completed: 'completado',
    suggestions: 'Sugerencias',
    manualInPreparation: 'Manual en preparación',
    manualInPreparationDesc: 'El anfitrión está preparando el manual de esta propiedad.',
    viewed: 'Visto',
    available: 'Disponible',
    inPreparation: 'En preparación',
    instructions: 'instrucciones',
    zone: 'Zona',
    zoneCopied: 'URL de la zona copiada',
    digitalManualFooter: 'Manual digital creado con ❤️ para tu comodidad',
    suggestionsFooter: '¿Tienes alguna sugerencia? Contacta con tu anfitrión',
    suggestionBoxTitle: 'Buzón de Sugerencias',
    suggestionBoxDesc: 'Ayuda a {hostName} a mejorar este manual',
    yourSuggestion: 'Tu sugerencia',
    suggestionPlaceholder: '¿Qué información adicional te gustaría ver? ¿Hay algo que no está claro? Comparte tus ideas...',
    cancel: 'Cancelar',
    send: 'Enviar',
    takeMeThere: 'Llévame',
    swipe: 'Desliza'
  },
  en: {
    loading: 'Loading property manual...',
    manualNotFound: 'Manual not found',
    manualNotFoundDesc: 'We could not find the manual for this property. The link may be incorrect.',
    back: 'Back',
    aboutYourAccommodation: 'About your accommodation',
    aboutYourApartment: 'About your apartment',
    aboutYourHouse: 'About your house', 
    aboutYourHotel: 'About your hotel',
    aboutYourProperty: 'About your property',
    accommodationWelcome: 'Welcome to this beautiful accommodation. We hope you enjoy your stay.',
    guests: 'Guests',
    rooms: 'Rooms',
    bathrooms: 'Bathrooms',
    type: 'Type',
    location: 'Location',
    yourHost: 'Your host',
    superhost: 'Verified Host',
    contactWhatsApp: 'Contact via WhatsApp',
    sendEmail: 'Send email',
    call: 'Call',
    emergencies247: '24/7 Emergencies',
    share: 'Share',
    progressWarningTitle: 'You have only seen {progress}% of the manual!',
    progressWarningDesc: 'For a worry-free stay, we recommend reviewing all sections. This will help you know all the services and avoid inconveniences during your trip.',
    apartmentManual: 'Apartment manual',
    houseManual: 'House manual',
    hotelManual: 'Hotel manual',
    propertyManual: 'Property manual',
    sectionsAvailable: 'sections available',
    completed: 'completed',
    suggestions: 'Suggestions',
    manualInPreparation: 'Manual in preparation',
    manualInPreparationDesc: 'The host is preparing the manual for this property.',
    viewed: 'Viewed',
    available: 'Available',
    inPreparation: 'In preparation',
    instructions: 'instructions',
    zone: 'Zone',
    zoneCopied: 'Zone URL copied',
    digitalManualFooter: 'Digital manual created with ❤️ for your comfort',
    suggestionsFooter: 'Have any suggestions? Contact your host',
    suggestionBoxTitle: 'Suggestion Box',
    suggestionBoxDesc: 'Help {hostName} improve this manual',
    yourSuggestion: 'Your suggestion',
    suggestionPlaceholder: 'What additional information would you like to see? Is there anything that is not clear? Share your ideas...',
    cancel: 'Cancel',
    send: 'Send',
    takeMeThere: 'Take me there',
    swipe: 'Swipe'
  },
  fr: {
    loading: 'Chargement du manuel de la propriété...',
    manualNotFound: 'Manuel non trouvé',
    manualNotFoundDesc: 'Nous n\'avons pas pu trouver le manuel de cette propriété. Le lien peut être incorrect.',
    back: 'Retour',
    aboutYourAccommodation: 'À propos de votre hébergement',
    aboutYourApartment: 'À propos de votre appartement',
    aboutYourHouse: 'À propos de votre maison',
    aboutYourHotel: 'À propos de votre hôtel',
    aboutYourProperty: 'À propos de votre propriété',
    accommodationWelcome: 'Bienvenue dans ce bel hébergement. Nous espérons que vous apprécierez votre séjour.',
    guests: 'Invités',
    rooms: 'Chambres',
    bathrooms: 'Salles de bain',
    type: 'Type',
    location: 'Localisation',
    yourHost: 'Votre hôte',
    superhost: 'Hôte Vérifié',
    contactWhatsApp: 'Contacter via WhatsApp',
    sendEmail: 'Envoyer un email',
    call: 'Appeler',
    emergencies247: 'Urgences 24h/24',
    share: 'Partager',
    progressWarningTitle: 'Vous n\'avez vu que {progress}% du manuel !',
    progressWarningDesc: 'Pour un séjour sans souci, nous recommandons de consulter toutes les sections. Cela vous aidera à connaître tous les services et à éviter les désagréments pendant votre voyage.',
    apartmentManual: 'Manuel de l\'appartement',
    houseManual: 'Manuel de la maison',
    hotelManual: 'Manuel de l\'hôtel',
    propertyManual: 'Manuel de la propriété',
    sectionsAvailable: 'sections disponibles',
    completed: 'terminé',
    suggestions: 'Suggestions',
    manualInPreparation: 'Manuel en préparation',
    manualInPreparationDesc: 'L\'hôte prépare le manuel de cette propriété.',
    viewed: 'Vu',
    available: 'Disponible',
    inPreparation: 'En préparation',
    instructions: 'instructions',
    zone: 'Zone',
    zoneCopied: 'URL de la zone copiée',
    digitalManualFooter: 'Manuel numérique créé avec ❤️ pour votre confort',
    suggestionsFooter: 'Avez-vous des suggestions ? Contactez votre hôte',
    suggestionBoxTitle: 'Boîte à suggestions',
    suggestionBoxDesc: 'Aidez {hostName} à améliorer ce manuel',
    yourSuggestion: 'Votre suggestion',
    suggestionPlaceholder: 'Quelles informations supplémentaires aimeriez-vous voir ? Y a-t-il quelque chose qui n\'est pas clair ? Partagez vos idées...',
    cancel: 'Annuler',
    send: 'Envoyer',
    takeMeThere: 'Emmenez-moi',
    swipe: 'Glissez'
  }
}

// Get translation function
const t = (key: string, language: string = 'es', replacements: Record<string, string> = {}) => {
  let text = translations[language as keyof typeof translations]?.[key as keyof typeof translations.es] || translations.es[key as keyof typeof translations.es] || key
  
  // Replace placeholders
  Object.keys(replacements).forEach(placeholder => {
    text = text.replace(`{${placeholder}}`, replacements[placeholder])
  })
  
  return text
}

// Get accommodation type-specific text
const getAccommodationText = (property: Property | null, language: string = 'es') => {
  if (!property) return t('aboutYourProperty', language)
  
  const type = property.type?.toLowerCase()
  if (type?.includes('apartamento') || type?.includes('apartment')) {
    return t('aboutYourApartment', language)
  } else if (type?.includes('casa') || type?.includes('house') || type?.includes('villa')) {
    return t('aboutYourHouse', language)
  } else if (type?.includes('hotel') || type?.includes('hostel')) {
    return t('aboutYourHotel', language)
  } else {
    return t('aboutYourAccommodation', language)
  }
}

// Get manual title based on property type
const getManualTitle = (property: Property | null, language: string = 'es') => {
  if (!property) return t('propertyManual', language)
  
  const type = property.type?.toLowerCase()
  if (type?.includes('apartamento') || type?.includes('apartment')) {
    return t('apartmentManual', language)
  } else if (type?.includes('casa') || type?.includes('house') || type?.includes('villa')) {
    return t('houseManual', language)
  } else if (type?.includes('hotel') || type?.includes('hostel')) {
    return t('hotelManual', language)
  } else {
    return t('propertyManual', language)
  }
}

// Helper function to check if zone is viewed
const isZoneViewed = (zoneId: string) => {
  return localStorage.getItem(`zone-${zoneId}-viewed`) === 'true'
}

// Helper function to calculate progress
const calculateProgress = (zones: Zone[]) => {
  const viewedZones = zones.filter(zone => isZoneViewed(zone.id)).length
  return zones.length > 0 ? Math.round((viewedZones / zones.length) * 100) : 0
}

export default function PropertyGuidePage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.propertyId as string
  
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSuggestionBox, setShowSuggestionBox] = useState(false)
  const [suggestion, setSuggestion] = useState('')
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false)
  const [showProgressWarning, setShowProgressWarning] = useState(false)
  const [language, setLanguage] = useState('es')
  const [carouselScrollPosition, setCarouselScrollPosition] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [showRatingsModal, setShowRatingsModal] = useState(false)
  const [ratings, setRatings] = useState<any[]>([])
  const [showCompletionReward, setShowCompletionReward] = useState(false)
  const [showPublicRatingModal, setShowPublicRatingModal] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const [userNameForRating, setUserNameForRating] = useState('')
  const [userEmailForRating, setUserEmailForRating] = useState('')
  const [publicEvaluations, setPublicEvaluations] = useState<any[]>([])
  const [evaluationsStats, setEvaluationsStats] = useState<any>(null)
  const [loadingEvaluations, setLoadingEvaluations] = useState(false)

  useEffect(() => {
    fetchPropertyData()
    // fetchPublicEvaluations will be called from fetchPropertyData if needed
  }, [propertyId])

  // Check progress and show warning or completion reward
  useEffect(() => {
    if (property && property.zones) {
      const progress = calculateProgress(property.zones)
      if (progress === 100) {
        // Check if user has already rated this property publicly
        const hasPublicRating = localStorage.getItem(`property-${propertyId}-public-rating`)
        if (!hasPublicRating) {
          setShowCompletionReward(true)
        }
      } else if (progress > 0 && progress < 100) {
        setShowProgressWarning(true)
      }
    }
  }, [property, propertyId])

  const fetchPropertyData = async () => {
    try {
      setLoading(true)
      
      // Try by slug first (for URLs generated with createPropertySlug)
      let response = await fetch(`/api/public/properties/by-slug/${propertyId}`)
      let result = await response.json()
      
      // If not found by slug, try by ID (for backward compatibility)
      if (!response.ok && response.status === 404) {
        console.log('Property not found by slug, trying by ID...')
        response = await fetch(`/api/public/properties/${propertyId}`)
        result = await response.json()
      }
      
      if (!response.ok) {
        throw new Error(result.error || 'Manual no encontrado')
      }
      
      setProperty(result.data)
      
      // Now that we have the property data, fetch evaluations using the actual property ID
      if (result.data?.id) {
        await fetchPublicEvaluationsWithId(result.data.id)
      }
    } catch (error) {
      console.error('Error fetching property:', error)
      setProperty(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchPublicEvaluationsWithId = async (actualPropertyId: string) => {
    try {
      setLoadingEvaluations(true)
      const response = await fetch(`/api/properties/${actualPropertyId}/public-evaluations`)
      
      if (response.ok) {
        const result = await response.json()
        setPublicEvaluations(result.evaluations || [])
        setEvaluationsStats(result.stats || null)
      }
    } catch (error) {
      console.error('Error fetching public evaluations:', error)
      setPublicEvaluations([])
      setEvaluationsStats(null)
    } finally {
      setLoadingEvaluations(false)
    }
  }

  const fetchPublicEvaluations = async () => {
    // If we already have property data, use its ID
    if (property?.id) {
      await fetchPublicEvaluationsWithId(property.id)
    } else if (propertyId.startsWith('cm')) {
      // Direct ID, use it
      await fetchPublicEvaluationsWithId(propertyId)
    }
    // If it's a slug and we don't have property data yet, this will be called after fetchPropertyData
  }

  const submitSuggestion = async () => {
    if (!suggestion.trim()) return

    setIsSubmittingSuggestion(true)
    try {
      await fetch('/api/tracking/suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          suggestion: suggestion.trim(),
          timestamp: new Date()
        })
      })
      
      setSuggestion('')
      setShowSuggestionBox(false)
      // Show success message or toast
    } catch (error) {
      console.error('Error submitting suggestion:', error)
    } finally {
      setIsSubmittingSuggestion(false)
    }
  }

  const handleZoneClick = (zoneId: string) => {
    router.push(`/guide/${propertyId}/${zoneId}`)
  }

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 276 // Width of card (260px) + gap (16px)
      const newPosition = direction === 'left' 
        ? Math.max(0, carouselScrollPosition - scrollAmount)
        : carouselScrollPosition + scrollAmount
      
      carouselRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      })
      setCarouselScrollPosition(newPosition)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Manual de ${getText(property?.name, language, 'Propiedad')}`,
          text: 'Manual digital del apartamento',
          url: url
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(url)
      alert('URL copiada al portapapeles')
    }
  }

  if (loading) {
    return <AnimatedLoadingSpinner text={t('loading', language)} type="properties" />
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('manualNotFound', language)}</h2>
          <p className="text-gray-600 mb-6">
            {t('manualNotFoundDesc', language)}
          </p>
          <Button onClick={() => router.back()} variant="outline">
            {t('back', language)}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Airbnb-style Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              onClick={() => router.back()}
              variant="ghost" 
              size="sm"
              className="hover:bg-gray-100 rounded-full p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="es">🇪🇸 ES</option>
                <option value="en">🇬🇧 EN</option>
                <option value="fr">🇫🇷 FR</option>
              </select>
              
              <Button 
                onClick={handleShare}
                variant="ghost" 
                size="sm"
                className="hover:bg-gray-100 rounded-full p-2"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Header - Airbnb Style */}
        <div className="mb-8">
          {/* Property Title and Rating */}
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              {getText(property.name, language, 'Propiedad')}
            </h1>
            <div className="flex items-center space-x-4 text-sm">
              {evaluationsStats && publicEvaluations.length > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 bg-violet-50 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-violet-600 fill-current" />
                    <span className="font-medium text-violet-700">
                      {evaluationsStats.averageRating ? evaluationsStats.averageRating.toFixed(1) : '0.0'}
                    </span>
                    <span className="text-violet-500">·</span>
                    <button 
                      onClick={() => setShowRatingsModal(true)}
                      className="text-violet-600 hover:text-violet-800 font-medium"
                    >
                      {publicEvaluations.length} {publicEvaluations.length === 1 ? 'evaluación pública' : 'evaluaciones públicas'}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Manual 100% completado
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{getText(property.city, language, '')}, {getText(property.state, language, '')}</span>
              </div>
            </div>
          </div>

          {/* Property Info Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Property Info */}
            <div className="lg:col-span-2">
              {/* Property Type and Details */}
              <div className="border-b border-gray-200 pb-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {getAccommodationText(property, language)}
                </h2>
                <div className="flex items-center space-x-4 text-gray-600">
                  <span>{property.maxGuests} {t('guests', language)}</span>
                  <span>·</span>
                  <span>{property.bedrooms} {t('rooms', language)}</span>
                  <span>·</span>
                  <span>{property.bathrooms} {t('bathrooms', language)}</span>
                </div>
              </div>

              {/* Description */}
              <div className="border-b border-gray-200 pb-6 mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {getText(property.description, language, t('accommodationWelcome', language))}
                </p>
              </div>

              {/* Location */}
              <div className="border-b border-gray-200 pb-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('location', language)}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{property.street}</div>
                      <div className="text-gray-600">{getText(property.city, language, '')}, {getText(property.state, language, '')}</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      const address = encodeURIComponent(`${property.street}, ${getText(property.city, language, '')}, ${getText(property.state, language, '')}`)
                      window.open(`https://maps.google.com/maps?q=${address}`, '_blank')
                    }}
                    variant="outline"
                    className="border-violet-200 text-violet-700 hover:bg-violet-50 ml-4"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {t('takeMeThere', language)}
                  </Button>
                </div>
              </div>
            </div>

            {/* Host Contact Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="p-6 border border-violet-100 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50">
                  {/* Host Info */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 ring-2 ring-violet-200">
                      {property.hostContactPhoto ? (
                        <img 
                          src={property.hostContactPhoto} 
                          alt={property.hostContactName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-violet-100 flex items-center justify-center">
                          <span className="text-violet-600 font-semibold text-xl">
                            {property.hostContactName.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {property.hostContactName}
                    </h3>
                    <p className="text-sm text-violet-600 font-medium">
                      {t('yourHost', language)}
                    </p>
                  </div>

                  {/* Host Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="font-semibold text-violet-700">100%</div>
                      <div className="text-gray-600">Tasa respuesta</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="font-semibold text-violet-700">&lt; 1 hora</div>
                      <div className="text-gray-600">Tiempo respuesta</div>
                    </div>
                  </div>
                  
                  {/* Contact Button */}
                  <Button 
                    onClick={() => {
                      const message = encodeURIComponent(`Hola ${property.hostContactName}, soy huésped de ${getText(property.name, language, 'la propiedad')} y necesito ayuda.`)
                      const phoneNumber = property.hostContactPhone.replace(/\s/g, '').replace('+', '')
                      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
                    }}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white mb-4"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {t('contactWhatsApp', language)}
                  </Button>

                  {/* Emergency Block */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 justify-center mb-2">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="w-3 h-3 text-red-600" />
                      </div>
                      <span className="text-sm font-medium text-red-700">
                        {t('emergencies247', language)}
                      </span>
                    </div>
                    <div className="text-center">
                      <a 
                        href={`tel:${property.hostContactPhone}`}
                        className="text-sm text-red-600 hover:text-red-700 font-medium block"
                      >
                        {property.hostContactPhone}
                      </a>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>


        {/* Progress Warning */}
        {showProgressWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-1">
                    {t('progressWarningTitle', language, { progress: calculateProgress(property.zones).toString() })}
                  </h3>
                  <p className="text-sm text-amber-800 mb-3">
                    {t('progressWarningDesc', language)}
                  </p>
                  <div className="w-full bg-amber-200 rounded-full h-2">
                    <motion.div
                      className="bg-amber-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateProgress(property.zones)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProgressWarning(false)}
                  className="text-amber-600 hover:text-amber-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Completion Reward Notification */}
        {showCompletionReward && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-1">
                    ¡Felicidades! Has completado el 100% del manual
                  </h3>
                  <p className="text-sm text-green-800 mb-3">
                    Ahora puedes evaluar públicamente esta propiedad. Tu valoración ayudará a futuros huéspedes a tomar mejores decisiones.
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        setShowCompletionReward(false)
                        setShowPublicRatingModal(true)
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm"
                      size="sm"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Evaluar Propiedad
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCompletionReward(false)}
                      className="text-green-600 hover:text-green-700"
                    >
                      Quizás más tarde
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCompletionReward(false)}
                  className="text-green-600 hover:text-green-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Manual Sections */}
        <div className="border-b border-gray-200 pb-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {getManualTitle(property, language)}
            </h3>
            <Button
              onClick={() => setShowSuggestionBox(true)}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-black"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {t('suggestions', language)}
            </Button>
          </div>
          
          {property.zones.length === 0 || property.zones.filter(zone => zone.stepsCount && zone.stepsCount > 0).length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📖</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('manualInPreparation', language)}
              </h3>
              <p className="text-gray-600">
                {t('manualInPreparationDesc', language)}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Horizontal Scroll - 2 Rows */}
              <div className="lg:hidden relative">
                <div 
                  ref={carouselRef}
                  className="overflow-x-auto scrollbar-hide pb-4"
                  onScroll={(e) => setCarouselScrollPosition(e.currentTarget.scrollLeft)}
                >
                  <div className="grid grid-rows-2 grid-flow-col gap-4 px-1" style={{ gridAutoColumns: '260px' }}>
                    {property.zones
                      .filter(zone => zone.stepsCount && zone.stepsCount > 0) // Only show zones with content
                      .sort((a, b) => a.order - b.order)
                      .map((zone, index) => (
                        <motion.div
                          key={zone.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <div 
                            className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200 h-32 flex flex-col justify-between"
                            onClick={() => handleZoneClick(zone.id)}
                          >
                            <div className="flex items-start space-x-3 flex-1">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                {zone.icon ? getZoneIcon(zone.icon, "w-5 h-5 text-gray-700") : getZoneIcon(getText(zone.name, language, '').toLowerCase(), "w-5 h-5 text-gray-700")}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate mb-1">
                                  {getText(zone.name, language, t('zone', language))}
                                </h4>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {getText(zone.description, language, '').substring(0, 60)}...
                                </p>
                              </div>
                            </div>
                            {isZoneViewed(zone.id) && (
                              <div className="flex justify-end">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  {t('viewed', language)}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
                
                {/* Carousel Controls */}
                <div className="flex justify-end mt-2 mr-2">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => scrollCarousel('left')}
                      className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={carouselScrollPosition === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => scrollCarousel('right')}
                      className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="text-xs ml-1 text-gray-400">{t('swipe', language)}</span>
                  </div>
                </div>
              </div>

              {/* Desktop Grid */}
              <div className="hidden lg:grid grid-cols-3 gap-4">
                {property.zones
                  .filter(zone => zone.stepsCount && zone.stepsCount > 0) // Only show zones with content
                  .sort((a, b) => a.order - b.order)
                  .map((zone, index) => (
                    <motion.div
                      key={zone.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div 
                        className="flex items-start space-x-4 p-5 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200"
                        onClick={() => handleZoneClick(zone.id)}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {zone.icon ? getZoneIcon(zone.icon, "w-5 h-5 text-gray-700") : getZoneIcon(getText(zone.name, language, '').toLowerCase(), "w-5 h-5 text-gray-700")}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900">
                              {getText(zone.name, language, t('zone', language))}
                            </h4>
                            {isZoneViewed(zone.id) && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {t('viewed', language)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {getText(zone.description, language, '')}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Public Evaluations Section - Show real evaluations */}
        {publicEvaluations.length > 0 && (
          <div className="border-b border-gray-200 pb-8 mb-8">
            <div className="flex items-center space-x-2 mb-6">
              <Star className="w-5 h-5 text-violet-600 fill-current" />
              <h3 className="text-xl font-semibold text-gray-900">
                Evaluaciones de huéspedes
              </h3>
              <span className="px-3 py-1 bg-violet-100 text-violet-700 text-sm font-medium rounded-full">
                {evaluationsStats?.averageRating ? evaluationsStats.averageRating.toFixed(1) : '0.0'} · {publicEvaluations.length} {publicEvaluations.length === 1 ? 'evaluación' : 'evaluaciones'}
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {publicEvaluations.slice(0, 4).map((evaluation) => (
                <div key={evaluation.id} className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 font-medium">
                      {evaluation.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{evaluation.userName}</span>
                      <span className="text-gray-500 text-sm">
                        · {new Date(evaluation.createdAt).toLocaleDateString('es-ES', { 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-3 h-3 ${
                            star <= evaluation.rating 
                              ? 'text-violet-600 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    {evaluation.comment && (
                      <p className="text-gray-700 text-sm">
                        "{evaluation.comment}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {publicEvaluations.length > 4 && (
              <Button 
                variant="outline" 
                className="mt-6 border-violet-200 text-violet-700 hover:bg-violet-50"
                onClick={() => setShowRatingsModal(true)}
              >
                Ver todas las evaluaciones ({publicEvaluations.length})
              </Button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-600 text-sm mb-2">
            {t('digitalManualFooter', language)}
          </p>
          <p className="text-gray-500 text-xs">
            {t('suggestionsFooter', language)}
          </p>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        onClick={() => {
          const message = encodeURIComponent(`Hola ${property.hostContactName}, soy huésped de ${getText(property.name, 'la propiedad')} y necesito ayuda.`)
          const phoneNumber = property.hostContactPhone.replace(/\s/g, '').replace('+', '')
          window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="w-6 h-6" />
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Contactar por WhatsApp
        </div>
      </motion.button>

      {/* Suggestion Modal */}
      {showSuggestionBox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSuggestionBox(false)
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
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('suggestionBoxTitle', language)}
              </h3>
              <p className="text-gray-600">
                {t('suggestionBoxDesc', language, { hostName: property.hostContactName })}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('yourSuggestion', language)}
              </label>
              <textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder={t('suggestionPlaceholder', language)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSuggestionBox(false)}
                className="flex-1"
                disabled={isSubmittingSuggestion}
              >
{t('cancel', language)}
              </Button>
              <Button
                onClick={submitSuggestion}
                disabled={!suggestion.trim() || isSubmittingSuggestion}
                className="flex-1 bg-violet-600 hover:bg-violet-700"
              >
                {isSubmittingSuggestion ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
{t('send', language)}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Ratings Modal */}
      {showRatingsModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRatingsModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Evaluaciones Públicas
              </h3>
              <button
                onClick={() => setShowRatingsModal(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Overall Rating */}
              {evaluationsStats && (
                <div className="flex items-center space-x-4 mb-6 p-4 bg-violet-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-violet-700">
                      {evaluationsStats.averageRating ? evaluationsStats.averageRating.toFixed(1) : '0.0'}
                    </div>
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-4 h-4 ${
                            star <= Math.round(evaluationsStats.averageRating || 0)
                              ? 'text-violet-600 fill-current'
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    <div className="text-sm text-violet-600">
                      {publicEvaluations.length} {publicEvaluations.length === 1 ? 'evaluación' : 'evaluaciones'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">Distribución de evaluaciones</h4>
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = evaluationsStats.ratingDistribution?.[rating] || 0
                      const percentage = publicEvaluations.length > 0 ? (count / publicEvaluations.length) * 100 : 0
                      return (
                        <div key={rating} className="flex items-center space-x-2 mb-1">
                          <span className="text-sm text-gray-600 w-3">{rating}</span>
                          <Star className="w-3 h-3 text-gray-400" />
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-violet-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-6">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Individual Reviews */}
              <div className="space-y-4">
                {loadingEvaluations ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">Cargando evaluaciones...</p>
                  </div>
                ) : publicEvaluations.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h4 className="font-medium text-gray-900 mb-2">No hay evaluaciones públicas aún</h4>
                    <p className="text-gray-600 text-sm">Sé el primero en dejar una evaluación pública</p>
                  </div>
                ) : (
                  publicEvaluations.map((evaluation) => (
                    <div key={evaluation.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-violet-600 font-medium text-sm">
                            {evaluation.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-medium text-gray-900">{evaluation.userName}</h5>
                            <span className="text-sm text-gray-500">
                              {new Date(evaluation.createdAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`w-3 h-3 ${
                                  star <= evaluation.rating 
                                    ? 'text-violet-600 fill-current' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                          {evaluation.comment && (
                            <p className="text-gray-700 text-sm leading-relaxed">
                              "{evaluation.comment}"
                            </p>
                          )}
                          <div className="mt-2 text-xs text-gray-500">
                            {evaluation.reviewType === 'zone' ? 'Evaluación de zona específica' : 'Evaluación general de la propiedad'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Public Rating Modal */}
      {showPublicRatingModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPublicRatingModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Evaluar Propiedad
              </h3>
              <button
                onClick={() => setShowPublicRatingModal(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  ¡Completaste todo el manual!
                </h4>
                <p className="text-gray-600 text-sm">
                  Tu evaluación será visible públicamente y ayudará a futuros huéspedes
                </p>
              </div>

              {/* Rating Stars */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ¿Cómo calificarías tu experiencia general?
                </label>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(rating)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star 
                        className={`w-8 h-8 transition-colors ${
                          rating <= selectedRating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300 hover:text-yellow-400'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                {selectedRating > 0 && (
                  <p className="text-center text-sm text-gray-600 mt-2">
                    Has seleccionado {selectedRating} estrella{selectedRating !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* User Info - Required for public reviews */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tu nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={userNameForRating}
                    onChange={(e) => setUserNameForRating(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tu correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={userEmailForRating}
                    onChange={(e) => setUserEmailForRating(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentario público (opcional)
                </label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Comparte tu experiencia para ayudar a otros huéspedes..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPublicRatingModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={selectedRating === 0 || isSubmittingRating || !userNameForRating.trim() || !userEmailForRating.trim()}
                  onClick={async () => {
                    if (selectedRating === 0 || !userNameForRating.trim() || !userEmailForRating.trim()) return
                    
                    setIsSubmittingRating(true)
                    try {
                      const response = await fetch('/api/evaluations/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          propertyId: property?.id || propertyId,
                          rating: selectedRating,
                          comment: ratingComment.trim() || null,
                          userName: userNameForRating.trim(),
                          userEmail: userEmailForRating.trim(),
                          reviewType: 'property',
                          isPublic: true // Public reviews requested by user
                        })
                      })
                      
                      const result = await response.json()
                      
                      if (response.ok && result.success) {
                        localStorage.setItem(`property-${propertyId}-public-rating`, 'true')
                        setShowPublicRatingModal(false)
                        setSelectedRating(0)
                        setRatingComment('')
                        setUserNameForRating('')
                        setUserEmailForRating('')
                        alert('¡Gracias por tu evaluación! El propietario la revisará antes de publicarla.')
                      } else {
                        throw new Error(result.error || 'Error al enviar la evaluación')
                      }
                    } catch (error) {
                      console.error('Error submitting rating:', error)
                      alert('Error al enviar la evaluación. Por favor, inténtalo de nuevo.')
                    } finally {
                      setIsSubmittingRating(false)
                    }
                  }}
                >
                  {isSubmittingRating ? (
                    <div className="flex items-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Enviando...
                    </div>
                  ) : (
                    'Publicar Evaluación'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Completion Reward Modal */}
      {showCompletionReward && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl max-w-md w-full p-6"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                ¡Felicidades! 🎉
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Has completado todo el manual de {getText(property?.name, language, 'la propiedad')}. 
                ¿Te gustaría ayudar a otros huéspedes compartiendo tu experiencia?
              </p>

              <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-violet-600 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-violet-800 mb-1">
                      Tu evaluación será pública (opcional)
                    </p>
                    <p className="text-xs text-violet-600">
                      Puedes incluir tu nombre para ayudar a futuros huéspedes a conocer mejor este alojamiento.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCompletionReward(false)
                    localStorage.setItem(`property-${propertyId}-public-rating`, 'true')
                  }}
                  className="flex-1"
                >
                  Ahora no
                </Button>
                <Button
                  onClick={() => {
                    setShowCompletionReward(false)
                    setShowPublicRatingModal(true)
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Evaluar
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}