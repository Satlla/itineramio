'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Bell,
  AlertTriangle,
  Info,
  Settings,
  Key,
  Moon,
  Sun
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '../../../../src/components/ui/Button'
import { Card } from '../../../../src/components/ui/Card'
import { ZoneIconDisplay } from '../../../../src/components/ui/IconSelector'
import { AnimatedLoadingSpinner } from '../../../../src/components/ui/AnimatedLoadingSpinner'
import { getZoneIconByName } from '../../../../src/data/zoneIconsExtended'
import { ShareLanguageModal } from '../../../../src/components/ui/ShareLanguageModal'

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
  status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  isPublished?: boolean
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

interface MultiLangText {
  es: string
  en: string
  fr: string
}

interface Announcement {
  id: string
  title: MultiLangText
  message: MultiLangText
  category: string
  priority: string
  isActive: boolean
  startDate?: string
  endDate?: string
  createdAt: string
}

// Zone icon mapping using centralized system - BLACK STYLE FOR PUBLIC VIEW
const getZoneIcon = (iconName: string, className: string = "w-6 h-6") => {
  if (!iconName) {
    return <Home className={`${className} text-gray-700`} />
  }
  
  // Use the improved icon mapping system from extended icons
  const IconComponent = getZoneIconByName(iconName)
  // Force black/gray color for all icons in public view
  const blackClassName = className.replace(/text-\w+-\d+/, 'text-gray-700')
  return <IconComponent className={blackClassName} />
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

// Helper function to get translated property field
const getPropertyText = (
  baseValue: string,
  translations: any,
  language: string = 'es',
  fallback: string = ''
) => {
  // If language is Spanish or no translations, return base value
  if (language === 'es' || !translations) {
    return baseValue || fallback
  }
  // Try to get translation for requested language
  if (translations && translations[language]) {
    return translations[language]
  }
  // Fallback to base value (Spanish)
  return baseValue || fallback
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
    swipe: 'Desliza',
    propertyNotActive: 'Manual no disponible',
    propertyNotActiveDesc: 'El propietario está preparando el manual digital de esta propiedad. Por favor, contacta directamente con el anfitrión para obtener las instrucciones necesarias.',
    callHost: 'Llamar al anfitrión',
    emailHost: 'Enviar email',
    verifiedHost: '{hostName} es un anfitrión verificado',
    verifiedHostDesc: 'Los anfitriones verificados tienen un historial de excelentes evaluaciones.',
    selfCheckIn: 'Check-in autónomo',
    selfCheckInDesc: 'Realiza el check-in fácilmente usando las instrucciones del manual.'
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
    swipe: 'Swipe',
    propertyNotActive: 'Manual not available',
    propertyNotActiveDesc: 'The owner is preparing the digital manual for this property. Please contact the host directly for the necessary instructions.',
    callHost: 'Call host',
    emailHost: 'Send email',
    verifiedHost: '{hostName} is a verified host',
    verifiedHostDesc: 'Verified hosts have a track record of excellent reviews.',
    selfCheckIn: 'Self check-in',
    selfCheckInDesc: 'Check in easily using the manual instructions.'
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
    swipe: 'Glissez',
    propertyNotActive: 'Manuel non disponible',
    propertyNotActiveDesc: 'Le propriétaire prépare le manuel numérique de cette propriété. Veuillez contacter directement l\'hôte pour obtenir les instructions nécessaires.',
    callHost: 'Appeler l\'hôte',
    emailHost: 'Envoyer un email',
    verifiedHost: '{hostName} est un hôte vérifié',
    verifiedHostDesc: 'Les hôtes vérifiés ont un historique d\'excellentes évaluations.',
    selfCheckIn: 'Enregistrement autonome',
    selfCheckInDesc: 'Effectuez facilement l\'enregistrement en utilisant les instructions du manuel.'
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
  // Only count zones that have steps
  const zonesWithSteps = zones.filter(zone => zone.stepsCount && zone.stepsCount > 0)
  const viewedZones = zonesWithSteps.filter(zone => isZoneViewed(zone.id)).length
  return zonesWithSteps.length > 0 ? Math.round((viewedZones / zonesWithSteps.length) * 100) : 0
}

// Helper functions for announcements
const getAnnouncementIcon = (category: string) => {
  switch (category) {
    case 'parking': return Car
    case 'cleaning': return Users
    case 'construction': return Settings
    case 'check-in': return Key
    case 'amenities': return Wifi
    default: return Info
  }
}

const getAnnouncementColor = (priority: string) => {
  switch (priority) {
    case 'URGENT': return 'red'
    case 'HIGH': return 'orange'
    case 'NORMAL': return 'blue'
    case 'LOW': return 'gray'
    default: return 'blue'
  }
}

const getPriorityText = (priority: string, language: string) => {
  const priorities = {
    es: { URGENT: 'Urgente', HIGH: 'Alta', NORMAL: 'Normal', LOW: 'Baja' },
    en: { URGENT: 'Urgent', HIGH: 'High', NORMAL: 'Normal', LOW: 'Low' },
    fr: { URGENT: 'Urgent', HIGH: 'Haute', NORMAL: 'Normal', LOW: 'Basse' }
  }
  return priorities[language as keyof typeof priorities]?.[priority as keyof typeof priorities.es] || priority
}

// Helper function to get priority color classes
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'URGENT':
      return 'bg-red-50 border-red-400'
    case 'HIGH':
      return 'bg-orange-50 border-orange-400'
    case 'NORMAL':
      return 'bg-blue-50 border-blue-400'
    case 'LOW':
      return 'bg-gray-50 border-gray-400'
    default:
      return 'bg-gray-50 border-gray-400'
  }
}

// Analytics tracking for real statistics
const trackPropertyView = async (propertyId: string) => {
  try {
    await fetch(`/api/properties/${propertyId}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referrer: document.referrer || null,
        language: navigator.language || 'es',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        screenWidth: window.screen?.width || null,
        screenHeight: window.screen?.height || null
      })
    })
  } catch (error) {
    console.error('Error tracking property view:', error)
  }
}

const trackWhatsAppClick = async (propertyId: string) => {
  console.log('📱 Tracking WhatsApp click for property:', propertyId)
  try {
    const response = await fetch('/api/analytics/track-interaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId,
        interactionType: 'whatsapp_click'
      })
    })
    const data = await response.json()
    console.log('📱 WhatsApp click tracked:', data)
  } catch (error) {
    console.error('❌ Error tracking WhatsApp click:', error)
  }
}

const trackEmailClick = async (propertyId: string) => {
  console.log('📧 Tracking Email click for property:', propertyId)
  try {
    const response = await fetch('/api/analytics/track-interaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId,
        interactionType: 'email_click'
      })
    })
    const data = await response.json()
    console.log('📧 Email click tracked:', data)
  } catch (error) {
    console.error('❌ Error tracking Email click:', error)
  }
}

const trackCallClick = async (propertyId: string) => {
  console.log('📞 Tracking Call click for property:', propertyId)
  try {
    const response = await fetch('/api/analytics/track-interaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId,
        interactionType: 'call_click'
      })
    })
    const data = await response.json()
    console.log('📞 Call click tracked:', data)
  } catch (error) {
    console.error('❌ Error tracking Call click:', error)
  }
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
  const [darkMode, setDarkMode] = useState(false)
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
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false)
  const [showAnnouncementsInline, setShowAnnouncementsInline] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showScrollArrow, setShowScrollArrow] = useState(true)

  // Detectar scroll para ocultar la flecha cuando llegue a las zonas
  useEffect(() => {
    const handleScroll = () => {
      const zonasElement = document.getElementById('zonas')
      if (zonasElement) {
        const rect = zonasElement.getBoundingClientRect()
        // Si las zonas están en el viewport o arriba, ocultar la flecha
        if (rect.top <= window.innerHeight) {
          setShowScrollArrow(false)
        } else {
          setShowScrollArrow(true)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial position

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    fetchPropertyData()
    fetchAnnouncements()
    // fetchPublicEvaluations will be called from fetchPropertyData if needed
    // trackPropertyView is now called inside fetchPropertyData with the real ID

    // Get language from URL params
    const urlParams = new URLSearchParams(window.location.search)
    const langParam = urlParams.get('lang')
    if (langParam && ['es', 'en', 'fr'].includes(langParam)) {
      setLanguage(langParam)
    } else {
      // Try to get from localStorage as fallback
      const savedLang = localStorage.getItem('itineramio-language')
      if (savedLang && ['es', 'en', 'fr'].includes(savedLang)) {
        setLanguage(savedLang)
      }
    }

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('itineramio-darkmode')
    if (savedDarkMode === 'true') {
      setDarkMode(true)
    }
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
      
      // If by-slug endpoint fails with 500, try safe by-slug endpoint
      if (!response.ok && response.status === 500) {
        console.log('By-slug endpoint failed, trying safe by-slug endpoint...')
        response = await fetch(`/api/public/properties/by-slug/${propertyId}/safe`)
        result = await response.json()
      }
      
      // If main ID endpoint fails, try safe endpoint
      if (!response.ok && response.status === 500) {
        console.log('Main property endpoint failed, trying safe endpoint...')
        response = await fetch(`/api/public/properties/${propertyId}/safe`)
        result = await response.json()
      }
      
      if (!response.ok) {
        throw new Error(result.error || 'Manual no encontrado')
      }

      setProperty(result.data)

      // Track property view with the REAL property ID (not slug)
      if (result.data?.id) {
        trackPropertyView(result.data.id)
        // Now that we have the property data, fetch evaluations using the actual property ID
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
      const response = await fetch(`/api/public/properties/${actualPropertyId}/evaluations`)
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setPublicEvaluations(result.data.evaluations || [])
          setEvaluationsStats(result.data.stats || null)
        }
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

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`/api/public/announcements/${propertyId}`)
      if (response.ok) {
        const data = await response.json()
        const activeAnnouncements = data.data || []

        // Parse JSONB fields if they come as strings from database
        const parsedAnnouncements = activeAnnouncements.map((ann: any) => ({
          ...ann,
          title: typeof ann.title === 'string' ? JSON.parse(ann.title) : ann.title,
          message: typeof ann.message === 'string' ? JSON.parse(ann.message) : ann.message
        }))

        setAnnouncements(parsedAnnouncements)

        // Check if inline announcements were dismissed
        const dismissedInline = localStorage.getItem(`announcements-inline-dismissed-${propertyId}`)
        if (dismissedInline === 'true') {
          setShowAnnouncementsInline(false)
        }

        // Show modal if there are active announcements and user hasn't dismissed them
        if (parsedAnnouncements.length > 0) {
          const dismissedAnnouncements = localStorage.getItem(`announcements-dismissed-${propertyId}`)
          if (!dismissedAnnouncements) {
            setShowAnnouncementsModal(true)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
      setAnnouncements([])
    }
  }

  const handleAcceptAnnouncements = () => {
    setShowAnnouncementsModal(false)
  }

  const handleDismissAnnouncements = () => {
    // Set a cookie/localStorage flag to not show announcements again for this property
    localStorage.setItem(`announcements-dismissed-${propertyId}`, 'true')
    setShowAnnouncementsModal(false)
  }

  const handleCloseInlineAnnouncements = () => {
    localStorage.setItem(`announcements-inline-dismissed-${propertyId}`, 'true')
    setShowAnnouncementsInline(false)
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
    const url = `/guide/${propertyId}/${zoneId}?lang=${language}`
    router.push(url)
  }

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 280 // Width of card + gap
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

  const scrollToZones = () => {
    const zonasElement = document.getElementById('zonas')
    if (zonasElement) {
      zonasElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleShare = async () => {
    setShowShareModal(true)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Show success feedback
      const button = document.querySelector('[data-share-button]') as HTMLElement
      if (button) {
        const originalContent = button.innerHTML
        button.innerHTML = '<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
        button.style.color = '#059669'
        setTimeout(() => {
          button.innerHTML = originalContent
          button.style.color = ''
        }, 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('No se pudo copiar el enlace')
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

  // Verificar si la propiedad está activa
  if (property.status !== 'ACTIVE' || !property.isPublished) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('propertyNotActive', language) || 'Manual no disponible'}
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {t('propertyNotActiveDesc', language) || 'El propietario está preparando el manual digital de esta propiedad. Por favor, contacta directamente con el anfitrión para obtener las instrucciones necesarias.'}
          </p>
          <div className="space-y-4">
            {property.hostContactPhone && (
              <a
                href={`tel:${property.hostContactPhone}`}
                onClick={() => trackCallClick(property.id)}
                className="flex items-center justify-center w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Phone className="w-5 h-5 mr-2" />
                {t('callHost', language) || 'Llamar al anfitrión'}
              </a>
            )}
            {property.hostContactEmail && (
              <a
                href={`mailto:${property.hostContactEmail}`}
                onClick={() => trackEmailClick(property.id)}
                className="flex items-center justify-center w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Mail className="w-5 h-5 mr-2" />
                {t('emailHost', language) || 'Enviar email'}
              </a>
            )}
            <Button 
              onClick={() => router.back()} 
              variant="outline"
              className="w-full"
            >
              {t('back', language) || 'Volver'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Airbnb-style Minimal Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-sm border-b transition-colors duration-300 ${
        darkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-100'
      }`}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={() => router.back()}
              className={`p-2 -ml-2 rounded-full transition-colors ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-[#222222]'}`} />
            </button>

            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value
                  setLanguage(newLang)
                  const url = new URL(window.location.href)
                  url.searchParams.set('lang', newLang)
                  window.history.replaceState({}, '', url.toString())
                  localStorage.setItem('itineramio-language', newLang)
                }}
                className={`px-3 py-1.5 text-sm font-medium bg-transparent border-none focus:ring-0 cursor-pointer rounded-lg transition-colors ${
                  darkMode ? 'text-white hover:bg-gray-700' : 'text-[#222222] hover:bg-gray-100'
                }`}
              >
                <option value="es">🇪🇸</option>
                <option value="en">🇬🇧</option>
                <option value="fr">🇫🇷</option>
              </select>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => {
                  const newDarkMode = !darkMode
                  setDarkMode(newDarkMode)
                  localStorage.setItem('itineramio-darkmode', String(newDarkMode))
                }}
                className={`p-2 rounded-full transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-[#222222]'
                }`}
                title={darkMode ? 'Modo claro' : 'Modo oscuro'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button
                onClick={handleShare}
                className={`p-2 rounded-full transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-[#222222]'
                }`}
                data-share-button
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Airbnb Style */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-8">
        {/* Property Header */}
        <div className="mb-10">
          {/* Title */}
          <h1 className={`text-[26px] sm:text-[32px] font-semibold mb-2 transition-colors ${
            darkMode ? 'text-white' : 'text-[#222222]'
          }`}>
            {getPropertyText(property.name, property.nameTranslations, language, 'Propiedad')}
          </h1>

          {/* Meta info row */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {evaluationsStats && publicEvaluations.length > 0 && (
              <>
                <button
                  onClick={() => setShowRatingsModal(true)}
                  className="flex items-center gap-1 hover:underline"
                >
                  <Star className="w-4 h-4 text-[#222222] fill-current" />
                  <span className="font-medium text-[#222222]">
                    {evaluationsStats.averageRating ? Number(evaluationsStats.averageRating).toFixed(2) : '0.00'}
                  </span>
                </button>
                <span className="text-[#717171]">·</span>
                <button
                  onClick={() => setShowRatingsModal(true)}
                  className="text-[#222222] underline font-medium"
                >
                  {publicEvaluations.length} {publicEvaluations.length === 1 ? 'evaluación' : 'evaluaciones'}
                </button>
                <span className="text-[#717171]">·</span>
              </>
            )}
            <span className={darkMode ? 'text-gray-400' : 'text-[#717171]'}>
              {getText(property.city, language, '')}, {getText(property.state, language, '')}
            </span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Property Info Row - Airbnb style */}
            <div className={`flex items-center justify-between py-6 border-b transition-colors ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200">
                  {property.profileImage ? (
                    <img
                      src={property.profileImage}
                      alt={getPropertyText(property.name, property.nameTranslations, language, 'Propiedad')}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <Home className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className={`text-base font-medium ${darkMode ? 'text-white' : 'text-[#222222]'}`}>
                    {getAccommodationText(property, language)}
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-[#717171]'}`}>
                    {property.maxGuests} {t('guests', language)} · {property.bedrooms} {t('rooms', language)} · {property.bathrooms} {t('bathrooms', language)}
                  </p>
                </div>
              </div>
            </div>

            {/* Highlights Row */}
            <div className={`py-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Shield className={`w-6 h-6 flex-shrink-0 mt-0.5 ${darkMode ? 'text-white' : 'text-[#222222]'}`} />
                  <div>
                    <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-[#222222]'}`}>{t('verifiedHost', language, { hostName: property.hostContactName || '' })}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-[#717171]'}`}>{t('verifiedHostDesc', language)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Key className={`w-6 h-6 flex-shrink-0 mt-0.5 ${darkMode ? 'text-white' : 'text-[#222222]'}`} />
                  <div>
                    <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-[#222222]'}`}>{t('selfCheckIn', language)}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-[#717171]'}`}>{t('selfCheckInDesc', language)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description - Hidden on mobile to reduce scroll */}
            <div className={`hidden md:block py-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-[#484848]'}`}>
                {getPropertyText(property.description, property.descriptionTranslations, language, t('accommodationWelcome', language))}
              </p>
            </div>

            {/* Location */}
            <div className={`py-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-[22px] font-semibold mb-4 ${darkMode ? 'text-white' : 'text-[#222222]'}`}>
                {t('location', language)}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className={`w-5 h-5 flex-shrink-0 ${darkMode ? 'text-gray-400' : 'text-[#717171]'}`} />
                  <div>
                    <p className={darkMode ? 'text-white' : 'text-[#222222]'}>{property.street}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-[#717171]'}`}>{getText(property.city, language, '')}, {getText(property.state, language, '')}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    try {
                      const street = property.street?.trim()
                      const city = getText(property.city, language, '')?.trim()
                      const state = getText(property.state, language, '')?.trim()
                      if (!street || !city || !state) {
                        alert('Lo sentimos, no hay información de ubicación disponible.')
                        return
                      }
                      const address = `${street}, ${city}, ${state}`
                      const mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}`
                      window.open(mapsUrl, '_blank', 'noopener,noreferrer')
                    } catch (error) {
                      console.error('Error opening maps:', error)
                    }
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors w-full sm:w-auto ${
                    darkMode
                      ? 'text-white border border-gray-600 hover:bg-gray-800'
                      : 'text-[#222222] border border-[#222222] hover:bg-gray-50'
                  }`}
                >
                  {t('takeMeThere', language)}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Host Contact Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className={`rounded-xl border shadow-lg p-6 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                {/* Host Photo & Name */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 ring-2 ring-gray-100">
                    {property.hostContactPhoto ? (
                      <img
                        src={property.hostContactPhoto}
                        alt={property.hostContactName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#222222] flex items-center justify-center">
                        <span className="text-white font-medium text-2xl">
                          {property.hostContactName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-[#222222]'}`}>
                    {property.hostContactName}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-[#717171]'}`}>{t('yourHost', language)}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className={`text-center p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-[#222222]'}`}>100%</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-[#717171]'}`}>Tasa respuesta</p>
                  </div>
                  <div className={`text-center p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-[#222222]'}`}>&lt; 1h</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-[#717171]'}`}>Responde en</p>
                  </div>
                </div>

                {/* Contact Button - Airbnb pink/rose style */}
                <button
                  onClick={() => {
                    trackWhatsAppClick(propertyId)
                    const message = encodeURIComponent(`Hola ${property.hostContactName}, soy huésped de ${getPropertyText(property.name, property.nameTranslations, language, 'la propiedad')} y necesito ayuda.`)
                    const phoneNumber = property.hostContactPhone.replace(/\s/g, '').replace('+', '')
                    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
                  }}
                  className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-all"
                >
                  <span className="flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    {t('contactWhatsApp', language)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* Progress Warning - Airbnb Style with colored progress bar */}
        {showProgressWarning && (() => {
          const progress = calculateProgress(property.zones)
          const isGood = progress >= 50
          return (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="my-8"
            >
              <div className={`p-5 rounded-2xl ${
                darkMode ? 'bg-gray-800/80' : 'bg-[#F7F7F7]'
              }`}>
                <div className="flex items-start gap-4">
                  {/* Progress circle indicator */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isGood
                      ? darkMode ? 'bg-green-900/30' : 'bg-green-50'
                      : darkMode ? 'bg-red-900/30' : 'bg-red-50'
                  }`}>
                    <span className={`text-lg font-semibold ${
                      isGood
                        ? darkMode ? 'text-green-400' : 'text-green-600'
                        : darkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {progress}%
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`font-semibold text-base mb-1 ${darkMode ? 'text-white' : 'text-[#222222]'}`}>
                          {language === 'es' ? 'Tu progreso en el manual' : language === 'en' ? 'Your manual progress' : 'Votre progression'}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-[#717171]'}`}>
                          {language === 'es'
                            ? 'Revisa todas las secciones para una estancia perfecta'
                            : language === 'en'
                              ? 'Review all sections for a perfect stay'
                              : 'Consultez toutes les sections pour un séjour parfait'}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowProgressWarning(false)}
                        className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${
                          darkMode ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-200 text-gray-400'
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress bar */}
                    <div className={`w-full rounded-full h-2 mt-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <motion.div
                        className={`h-2 rounded-full ${isGood ? 'bg-green-500' : 'bg-red-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })()}

        {/* Completion Reward Notification - Airbnb Style */}
        {showCompletionReward && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className={`p-4 rounded-xl border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  darkMode ? 'bg-green-900/50' : 'bg-green-50'
                }`}>
                  <CheckCircle className="w-4 h-4 text-[#008A05]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-white' : 'text-[#222222]'}`}>
                    {language === 'es' ? '¡Has completado el manual!' : language === 'en' ? 'You completed the manual!' : 'Vous avez terminé le manuel !'}
                  </h3>
                  <p className={`text-xs mb-3 ${darkMode ? 'text-gray-400' : 'text-[#717171]'}`}>
                    {language === 'es' ? '¿Te gustaría evaluar esta propiedad?' : language === 'en' ? 'Would you like to rate this property?' : 'Souhaitez-vous évaluer cette propriété ?'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowCompletionReward(false)
                        setShowPublicRatingModal(true)
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-[#222222] rounded-lg hover:bg-black transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Star className="w-3 h-3" />
                        {language === 'es' ? 'Evaluar' : language === 'en' ? 'Rate' : 'Évaluer'}
                      </span>
                    </button>
                    <button
                      onClick={() => setShowCompletionReward(false)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        darkMode ? 'text-gray-400 hover:text-white' : 'text-[#717171] hover:text-[#222222]'
                      }`}
                    >
                      {language === 'es' ? 'Ahora no' : language === 'en' ? 'Not now' : 'Pas maintenant'}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowCompletionReward(false)}
                  className={`p-1 rounded-full transition-colors flex-shrink-0 ${
                    darkMode ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-100 text-gray-400'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Manual Sections - Airbnb Style */}
        <div id="zonas" className={`py-8 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-[22px] font-semibold ${darkMode ? 'text-white' : 'text-[#222222]'}`}>
              {getManualTitle(property, language)}
            </h2>
            <button
              onClick={() => setShowSuggestionBox(true)}
              className={`flex items-center gap-2 text-sm hover:underline ${darkMode ? 'text-gray-300' : 'text-[#222222]'}`}
            >
              <Lightbulb className="w-4 h-4" />
              {t('suggestions', language)}
            </button>
          </div>

          {property.zones.filter(zone => zone.stepsCount && zone.stepsCount > 0).length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📖</span>
              </div>
              <h3 className="text-lg font-medium text-[#222222] mb-2">
                {t('manualInPreparation', language)}
              </h3>
              <p className="text-[#717171]">
                {t('manualInPreparationDesc', language)}
              </p>
            </div>
          ) : (
            <>
              {/* Zones Grid - Airbnb style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {property.zones
                  .filter(zone => zone.stepsCount && zone.stepsCount > 0)
                  .sort((a, b) => a.order - b.order)
                  .map((zone, index) => (
                    <motion.div
                      key={zone.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <button
                        className={`w-full text-left rounded-xl p-4 cursor-pointer transition-all duration-200 group ${
                          darkMode
                            ? 'bg-gray-800 border border-gray-700 hover:border-gray-500 hover:shadow-lg'
                            : 'bg-white border border-gray-200 hover:border-[#222222] hover:shadow-md'
                        }`}
                        onClick={() => handleZoneClick(zone.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                            darkMode ? 'bg-gray-700 group-hover:bg-gray-600' : 'bg-gray-50 group-hover:bg-gray-100'
                          }`}>
                            {zone.icon ? getZoneIcon(zone.icon, `w-6 h-6 ${darkMode ? 'text-white' : 'text-[#222222]'}`) : getZoneIcon(getText(zone.name, language, '').toLowerCase(), `w-6 h-6 ${darkMode ? 'text-white' : 'text-[#222222]'}`)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium truncate ${darkMode ? 'text-white' : 'text-[#222222]'}`}>
                              {getText(zone.name, language, t('zone', language))}
                            </h4>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-[#717171]'}`}>
                              {zone.stepsCount} {zone.stepsCount === 1 ? 'instrucción' : 'instrucciones'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isZoneViewed(zone.id) && (
                              <CheckCircle className="w-5 h-5 text-[#008A05]" />
                            )}
                            <ChevronRight className={`w-5 h-5 transition-colors ${
                              darkMode ? 'text-gray-500 group-hover:text-white' : 'text-[#717171] group-hover:text-[#222222]'
                            }`} />
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Host Announcements - Airbnb Style */}
        {announcements.length > 0 && showAnnouncementsInline && (
          <div className="my-8">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-[#222222]'}`}>
                {language === 'es' ? 'Avisos del anfitrión' : language === 'en' ? 'Host announcements' : 'Annonces de l\'hôte'}
              </h3>
              <button
                onClick={handleCloseInlineAnnouncements}
                className={`text-sm underline ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-[#717171] hover:text-[#222222]'}`}
              >
                {language === 'es' ? 'Ocultar' : language === 'en' ? 'Hide' : 'Masquer'}
              </button>
            </div>

            {/* Announcements list */}
            <div className="space-y-3">
              {announcements
                .sort((a, b) => {
                  const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'NORMAL': 2, 'LOW': 1 }
                  const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1
                  const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1
                  if (aPriority !== bPriority) return bPriority - aPriority
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                })
                .map((announcement) => {
                  const isUrgent = announcement.priority === 'URGENT' || announcement.priority === 'HIGH'

                  return (
                    <div
                      key={announcement.id}
                      className={`p-4 rounded-xl border-l-4 ${
                        isUrgent
                          ? darkMode
                            ? 'bg-red-900/20 border-l-red-500'
                            : 'bg-red-50 border-l-red-500'
                          : darkMode
                            ? 'bg-gray-800/50 border-l-[#222222]'
                            : 'bg-[#F7F7F7] border-l-[#222222]'
                      }`}
                    >
                      <h4 className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-[#222222]'}`}>
                        {announcement.title[language as 'es' | 'en' | 'fr'] || announcement.title.es}
                      </h4>
                      <p className={`text-sm mt-1 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-[#717171]'}`}>
                        {announcement.message[language as 'es' | 'en' | 'fr'] || announcement.message.es}
                      </p>
                    </div>
                  )
                })
              }
            </div>
          </div>
        )}

        {/* Guest Reviews Section - Solo mostrar si hay evaluaciones reales */}
        {/* TODO: Implementar carga de evaluaciones reales desde la base de datos */}

        {/* Footer - Minimal Airbnb style */}
        <div className="text-center py-12 border-t border-gray-200">
          <p className="text-[#717171] text-sm">
            {t('digitalManualFooter', language)}
          </p>
        </div>
      </div>

      {/* Floating WhatsApp Button - Cleaner style */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        onClick={() => {
          trackWhatsAppClick(propertyId)
          const message = encodeURIComponent(`Hola ${property.hostContactName}, soy huésped de ${getPropertyText(property.name, property.nameTranslations, language, 'la propiedad')} y necesito ayuda.`)
          const phoneNumber = property.hostContactPhone.replace(/\s/g, '').replace('+', '')
          window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
        whileHover={{ scale: 1.05 }}
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
                Valoraciones Públicas
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
                      {evaluationsStats.averageRating ? Number(evaluationsStats.averageRating).toFixed(1) : '0.0'}
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
                        <div key={rating} className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-0.5 min-w-[88px]">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star}
                                className={`w-4 h-4 ${star <= rating ? 'text-violet-600 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-violet-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-700 min-w-[65px] text-right font-medium">
                            {count} {count === 1 ? '' : ''}
                          </span>
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

      {/* Announcements Modal - Airbnb Style */}
      <AnimatePresence>
        {showAnnouncementsModal && announcements.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleAcceptAnnouncements()
              }
            }}
          >
            <motion.div
              initial={{ y: '100%', opacity: 1 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 1 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Airbnb style with X button and language selector */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleAcceptAnnouncements}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-[#222222]" />
                  </button>
                  <h2 className="text-base font-semibold text-[#222222]">
                    {language === 'es' ? 'Avisos del anfitrión' : language === 'en' ? 'Host announcements' : 'Annonces de l\'hôte'}
                  </h2>
                  {/* Language selector */}
                  <select
                    value={language}
                    onChange={(e) => {
                      const newLang = e.target.value
                      setLanguage(newLang)
                      const url = new URL(window.location.href)
                      url.searchParams.set('lang', newLang)
                      window.history.replaceState({}, '', url.toString())
                      localStorage.setItem('itineramio-language', newLang)
                    }}
                    className="text-sm bg-transparent border-none text-[#222222] font-medium cursor-pointer focus:outline-none focus:ring-0 pr-0"
                  >
                    <option value="es">🇪🇸</option>
                    <option value="en">🇬🇧</option>
                    <option value="fr">🇫🇷</option>
                  </select>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(85vh-140px)] px-6 py-4">
                {/* Intro text */}
                <p className="text-[#717171] text-sm mb-6">
                  {language === 'es'
                    ? 'Información importante para tu estancia'
                    : language === 'en'
                      ? 'Important information for your stay'
                      : 'Informations importantes pour votre séjour'}
                </p>

                {/* Announcements list */}
                <div className="space-y-4">
                  {announcements
                    .sort((a, b) => {
                      const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'NORMAL': 2, 'LOW': 1 }
                      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1
                      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1
                      if (aPriority !== bPriority) return bPriority - aPriority
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    })
                    .map((announcement) => {
                      const isUrgent = announcement.priority === 'URGENT' || announcement.priority === 'HIGH'

                      return (
                        <div
                          key={announcement.id}
                          className={`p-4 rounded-xl ${
                            isUrgent ? 'bg-red-50 border border-red-100' : 'bg-[#F7F7F7]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {isUrgent && (
                              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs font-bold">!</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-semibold text-[15px] mb-1 ${isUrgent ? 'text-red-900' : 'text-[#222222]'}`}>
                                {announcement.title[language as 'es' | 'en' | 'fr'] || announcement.title.es}
                              </h4>
                              <p className={`text-sm leading-relaxed ${isUrgent ? 'text-red-800' : 'text-[#717171]'}`}>
                                {announcement.message[language as 'es' | 'en' | 'fr'] || announcement.message.es}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Footer - Sticky buttons */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
                <div className="flex gap-3">
                  <button
                    onClick={handleDismissAnnouncements}
                    className="flex-1 py-3 px-4 text-sm font-semibold text-[#222222] bg-white border border-[#222222] rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {language === 'es' ? 'No mostrar más' : language === 'en' ? 'Don\'t show again' : 'Ne plus afficher'}
                  </button>
                  <button
                    onClick={handleAcceptAnnouncements}
                    className="flex-1 py-3 px-4 text-sm font-semibold text-white bg-[#222222] rounded-lg hover:bg-black transition-colors"
                  >
                    {language === 'es' ? 'Entendido' : language === 'en' ? 'Got it' : 'Compris'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating scroll arrow - Mobile only */}
      <AnimatePresence>
        {showScrollArrow && (
          <motion.button
            onClick={scrollToZones}
            className="lg:hidden fixed right-6 bottom-24 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg flex items-center justify-center"
            style={{
              boxShadow: '0 0 20px rgba(250, 204, 21, 0.6), 0 0 40px rgba(250, 204, 21, 0.3)'
            }}
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -10, 0]
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              y: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              },
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.95 }}
            aria-label="Ir a zonas"
          >
            <ChevronRight className="w-6 h-6 rotate-90" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Share Language Modal */}
      <ShareLanguageModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={(selectedLanguage) => {
          const url = `${window.location.origin}/guide/${propertyId}?lang=${selectedLanguage}`
          copyToClipboard(url)
        }}
        title={language === 'es' ? 'Compartir Manual' : language === 'en' ? 'Share Manual' : 'Partager le Manuel'}
        description={language === 'es' ? 'Selecciona el idioma en el que quieres compartir' : language === 'en' ? 'Select the language you want to share in' : 'Sélectionnez la langue dans laquelle vous souhaitez partager'}
        type="manual"
        currentUrl={`${window.location.origin}/guide/${propertyId}`}
      />
    </div>
  )
}