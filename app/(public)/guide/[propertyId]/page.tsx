'use client'

import React, { useState, useEffect } from 'react'
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
  X
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '../../../../src/components/ui/Button'
import { Card } from '../../../../src/components/ui/Card'
import { ZoneIconDisplay } from '../../../../src/components/ui/IconSelector'
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
    superhost: 'Superanfitrión',
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
    send: 'Enviar'
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
    superhost: 'Superhost',
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
    send: 'Send'
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
    superhost: 'Super-hôte',
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
    send: 'Envoyer'
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

  useEffect(() => {
    fetchPropertyData()
  }, [propertyId])

  // Check progress and show warning if needed
  useEffect(() => {
    if (property && property.zones) {
      const progress = calculateProgress(property.zones)
      if (progress > 0 && progress < 100) {
        setShowProgressWarning(true)
      }
    }
  }, [property])

  const fetchPropertyData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/properties/${propertyId}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Manual no encontrado')
      }
      
      // Add mock stepsCount for zones that don't have steps yet
      const propertyWithSteps = {
        ...result.data,
        zones: result.data.zones?.map((zone: any) => ({
          ...zone,
          stepsCount: zone.stepsCount || 0
        })) || []
      }
      
      setProperty(propertyWithSteps)
    } catch (error) {
      console.error('Error fetching property:', error)
      setProperty(null)
    } finally {
      setLoading(false)
    }
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative">
        {/* Hero Image */}
        <div className="h-64 md:h-80 lg:h-96 relative overflow-hidden">
          {property.profileImage ? (
            <img 
              src={property.profileImage} 
              alt={getText(property.name, 'Propiedad')}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🏠</span>
                </div>
                <h1 className="text-2xl font-bold">Manual de la Propiedad</h1>
              </div>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          
          {/* Header Actions */}
          <div className="absolute top-4 left-4 right-4 flex justify-between">
            <Button 
              onClick={() => router.back()}
              variant="ghost" 
              size="sm"
              className="bg-white bg-opacity-90 text-gray-900 hover:bg-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
{t('back', language)}
            </Button>
            <Button 
              onClick={handleShare}
              variant="ghost" 
              size="sm"
              className="bg-white bg-opacity-90 text-gray-900 hover:bg-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
{t('share', language)}
            </Button>
          </div>
        </div>

        {/* Property Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
{getText(property.name, language, 'Propiedad')}
            </h1>
            <div className="flex items-center text-white text-opacity-90 mb-4">
              <MapPin className="w-5 h-5 mr-2" />
<span>{getText(property.city, language, '')}, {getText(property.state, language, '')}</span>
            </div>
            <div className="flex items-center space-x-6 text-white text-opacity-90">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
<span>{property.maxGuests} {t('guests', language)}</span>
              </div>
              <div className="flex items-center">
                <Bed className="w-4 h-4 mr-1" />
<span>{property.bedrooms} {t('rooms', language)}</span>
              </div>
              <div className="flex items-center">
                <Bath className="w-4 h-4 mr-1" />
<span>{property.bathrooms} {t('bathrooms', language)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Details Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {getAccommodationText(property, language)}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {getText(property.description, language, t('accommodationWelcome', language))}
              </p>
              
              {/* Property Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Users className="w-6 h-6 mx-auto mb-2 text-violet-600" />
                  <div className="text-sm font-medium text-gray-900">{property.maxGuests}</div>
                  <div className="text-xs text-gray-600">{t('guests', language)}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Bed className="w-6 h-6 mx-auto mb-2 text-violet-600" />
                  <div className="text-sm font-medium text-gray-900">{property.bedrooms}</div>
                  <div className="text-xs text-gray-600">{t('rooms', language)}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Bath className="w-6 h-6 mx-auto mb-2 text-violet-600" />
                  <div className="text-sm font-medium text-gray-900">{property.bathrooms}</div>
                  <div className="text-xs text-gray-600">{t('bathrooms', language)}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Home className="w-6 h-6 mx-auto mb-2 text-violet-600" />
                  <div className="text-sm font-medium text-gray-900">{property.type}</div>
                  <div className="text-xs text-gray-600">{t('type', language)}</div>
                </div>
              </div>
            </Card>

            {/* Address */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t('location', language)}
              </h3>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">{property.street}</div>
                  <div className="text-gray-600">{getText(property.city, language, '')}, {getText(property.state, language, '')}</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Host Card - Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
                  {property.hostContactPhoto ? (
                    <img 
                      src={property.hostContactPhoto} 
                      alt={property.hostContactName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-violet-100 flex items-center justify-center">
                      <span className="text-violet-600 font-semibold text-2xl">
                        {property.hostContactName.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {property.hostContactName}
                </h3>
                <p className="text-gray-600 text-sm mb-1">
                  Tu anfitrión
                </p>
                <div className="flex items-center justify-center text-yellow-500 mb-4">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-2 text-sm text-gray-600">Superanfitrión</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    const message = encodeURIComponent(`Hola ${property.hostContactName}, soy huésped de ${getText(property.name, 'la propiedad')} y necesito ayuda.`)
                    const phoneNumber = property.hostContactPhone.replace(/\s/g, '').replace('+', '')
                    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contactar por WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(`mailto:${property.hostContactEmail}`, '_blank')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar email
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(`tel:${property.hostContactPhone}`, '_blank')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Llamar
                </Button>
              </div>

              {/* Emergency */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center text-red-600 mb-2">
                  <Shield className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Emergencias 24/7</span>
                </div>
                <a 
                  href={`tel:${property.hostContactPhone}`}
                  className="text-red-600 font-medium hover:text-red-700 text-sm"
                >
                  {property.hostContactPhone}
                </a>
              </div>
            </Card>
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
                    ¡Has visto solo el {calculateProgress(property.zones)}% del manual!
                  </h3>
                  <p className="text-sm text-amber-800 mb-3">
                    Para tener una estancia sin dudas, te recomendamos revisar todas las secciones. 
                    Esto te ayudará a conocer todos los servicios y evitar inconvenientes durante tu viaje.
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

        {/* Manual Sections */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Manual del apartamento
              </h2>
              <div className="flex items-center mt-2 space-x-4">
                <div className="text-sm text-gray-600">
                  {property.zones.filter(z => z.status === 'ACTIVE').length} secciones disponibles
                </div>
                <div className="text-sm text-violet-600 font-medium">
                  {calculateProgress(property.zones)}% completado
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowSuggestionBox(true)}
              variant="outline"
              size="sm"
              className="border-violet-200 text-violet-700 hover:bg-violet-50"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Sugerencias
            </Button>
          </div>
          
          {property.zones.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📖</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Manual en preparación
              </h3>
              <p className="text-gray-600">
                El anfitrión está preparando el manual de esta propiedad.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {property.zones
                .sort((a, b) => a.order - b.order)
                .map((zone, index) => (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card 
                      className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group border-l-4 border-l-violet-500 hover:border-l-violet-600"
                      onClick={() => handleZoneClick(zone.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 text-white ${
                            zone.color || 'bg-gradient-to-br from-violet-500 to-purple-600'
                          }`}>
                            {getZoneIcon(zone.icon, "w-6 h-6")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {getText(zone.name, 'Zona')}
                              </h3>
                              {isZoneViewed(zone.id) ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Visto
                                </span>
                              ) : zone.status === 'ACTIVE' ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Disponible
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  En preparación
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {getText(zone.description, '')}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{zone.stepsCount || 0} instrucciones</span>
                              <span className="mx-2">•</span>
                              <span>Zona {index + 1}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              const url = `${window.location.origin}/guide/${propertyId}/${zone.id}`
                              navigator.clipboard.writeText(url)
                              alert('URL de la zona copiada')
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-violet-600 transition-colors" />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-600 text-sm mb-2">
            Manual digital creado con ❤️ para tu comodidad
          </p>
          <p className="text-gray-500 text-xs">
            ¿Tienes alguna sugerencia? Contacta con tu anfitrión
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
                Buzón de Sugerencias
              </h3>
              <p className="text-gray-600">
                Ayuda a {property.hostContactName} a mejorar este manual
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tu sugerencia
              </label>
              <textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="¿Qué información adicional te gustaría ver? ¿Hay algo que no está claro? Comparte tus ideas..."
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
                Cancelar
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
                    Enviar
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}