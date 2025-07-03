'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Home, 
  MapPin, 
  Eye, 
  Star, 
  Edit2, 
  Trash2, 
  Share2,
  Bell,
  AlertCircle,
  Users,
  Copy,
  Check,
  X,
  MoreHorizontal,
  Building2,
  Languages,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  TrendingUp,
  Calendar,
  Clock,
  Timer,
  MessageCircle,
  Search
} from 'lucide-react'
import { Button } from '../../../src/components/ui/Button'
import { Card, CardContent } from '../../../src/components/ui/Card'
import { Input } from '../../../src/components/ui/Input'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { createPropertySlug } from '../../../src/lib/slugs'
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner'
import { AnimatedLoadingSpinner } from '../../../src/components/ui/AnimatedLoadingSpinner'
import { InlineLoadingSpinner } from '../../../src/components/ui/InlineLoadingSpinner'
import { useNotifications } from '../../../src/hooks/useNotifications'
import { useTranslation } from 'react-i18next'

interface Property {
  id: string
  name: string | { es: string; en?: string; fr?: string }
  description: string | { es: string; en?: string; fr?: string }
  type: 'APARTMENT' | 'HOUSE' | 'ROOM' | 'VILLA'
  city: string | { es: string; en?: string; fr?: string }
  state: string | { es: string; en?: string; fr?: string }
  bedrooms: number
  bathrooms: number
  maxGuests: number
  zonesCount: number
  totalViews: number
  avgRating?: number
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  createdAt: string
  isPublished: boolean
  profileImage?: string
  hostContactName?: string
  hostContactPhoto?: string
  errorReports?: number
  notifications?: number
  propertySetId?: string | null
  propertySet?: {
    id: string
    name: string
  } | null
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

interface PropertySet {
  id: string
  name: string
  description: string
  type: 'HOTEL' | 'BUILDING' | 'COMPLEX' | 'RESORT' | 'HOSTEL' | 'APARTHOTEL'
  profileImage?: string
  city: string
  state: string
  propertiesCount: number
  totalViews: number
  avgRating: number
  totalZones?: number
  status: string
  createdAt: string
}

const propertyTypeLabels = {
  APARTMENT: 'Apartamento',
  HOUSE: 'Casa',
  ROOM: 'Habitación',
  VILLA: 'Villa'
}

const statusLabels = {
  ACTIVE: 'Activo',
  DRAFT: 'Borrador',
  ARCHIVED: 'Archivado'
}

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  DRAFT: 'bg-yellow-100 text-yellow-800',
  ARCHIVED: 'bg-gray-100 text-gray-800'
}

interface Recommendation {
  id: string
  type: 'language' | 'zone' | 'content' | 'optimization' | 'congratulations' | 'guide' | 'integration'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  actionText: string
  actionUrl?: string
  propertyName?: string
  icon: React.ReactNode
  hasModal?: boolean
  modalContent?: {
    title: string
    content: React.ReactNode
  }
}

// Generate smart daily recommendations - Itineramio usage guide
const generateRecommendations = (properties: Property[]): Recommendation[] => {
  const allRecommendations: Recommendation[] = [
    {
      id: 'airbnb-booking-integration',
      type: 'integration',
      priority: 'high',
      title: 'Integrar manual en Airbnb/Booking',
      description: 'Aprende a incluir automáticamente tu manual en los mensajes de bienvenida de Airbnb y Booking.',
      actionText: 'Ver guía completa',
      hasModal: true,
      icon: <Share2 className="w-5 h-5 text-blue-600" />,
      modalContent: {
        title: 'Integración con Airbnb y Booking.com',
        content: (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📱 Airbnb - Mensaje automático</h4>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p className="mb-2"><strong>Plantilla sugerida:</strong></p>
                <p className="italic text-gray-700">
                  "¡Hola! 👋 Te doy la bienvenida a [NOMBRE_PROPIEDAD]. <br/>
                  Para que tu estancia sea perfecta, he creado un manual digital con toda la información que necesitas: <br/>
                  🔗 [TU_ENLACE_ITINERAMIO] <br/>
                  Incluye WiFi, check-in, recomendaciones locales y mucho más. ¡Que disfrutes!"
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🏨 Booking.com - Mensaje automático</h4>
              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <p className="mb-2"><strong>En el apartado "Instrucciones especiales":</strong></p>
                <p className="italic text-gray-700">
                  "Manual digital del apartamento: [TU_ENLACE_ITINERAMIO] - Toda la información sobre WiFi, check-in, parking, y recomendaciones locales en un solo lugar."
                </p>
              </div>
            </div>
            <div className="bg-violet-50 p-3 rounded-lg">
              <p className="text-sm text-violet-700">
                💡 <strong>Consejo:</strong> Personaliza el mensaje incluyendo 2-3 características únicas de tu propiedad para generar más confianza.
              </p>
            </div>
          </div>
        )
      }
    },
    {
      id: 'zone-specific-sharing',
      type: 'guide',
      priority: 'high',
      title: 'Compartir zonas específicas',
      description: 'Cómo enviar URLs directas a zonas específicas cuando un huésped pregunta sobre parking, WiFi, etc.',
      actionText: 'Ver técnica',
      hasModal: true,
      icon: <MapPin className="w-5 h-5 text-green-600" />,
      modalContent: {
        title: 'Compartir zonas específicas por WhatsApp',
        content: (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">💬 Ejemplo práctico</h4>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Huésped pregunta:</strong> "¿Dónde puedo aparcar?"
              </p>
              <p className="text-sm text-gray-700">
                <strong>Tu respuesta:</strong> "¡Hola! Aquí tienes toda la info del parking: [ENLACE_ZONA_PARKING] 🚗"
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🔗 Cómo obtener el enlace</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Ve a la zona específica (ej. Parking)</li>
                <li>Copia la URL del navegador</li>
                <li>Guárdala en notas para usar rápidamente</li>
                <li>Envía solo esa zona al huésped</li>
              </ol>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Beneficio:</strong> El huésped ve directamente lo que necesita sin perderse en el manual completo.
              </p>
            </div>
          </div>
        )
      }
    },
    {
      id: 'pre-arrival-communication',
      type: 'guide',
      priority: 'medium',
      title: 'Comunicación pre-llegada',
      description: 'Estrategia para enviar información clave días antes de la llegada: aeropuerto, parking, alquiler.',
      actionText: 'Ver estrategia',
      hasModal: true,
      icon: <Calendar className="w-5 h-5 text-purple-600" />,
      modalContent: {
        title: 'Guía de comunicación pre-llegada',
        content: (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📅 Timeline recomendado</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-medium">7 días antes</span>
                  <div className="text-sm">
                    <p className="font-medium">Información de viaje</p>
                    <p className="text-gray-600">Cómo llegar desde aeropuerto, estaciones de tren, parking público</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-medium">3 días antes</span>
                  <div className="text-sm">
                    <p className="font-medium">Servicios locales</p>
                    <p className="text-gray-600">Alquiler de coches/motos, supermercados, farmacias</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="bg-violet-100 text-violet-600 px-2 py-1 rounded text-xs font-medium">1 día antes</span>
                  <div className="text-sm">
                    <p className="font-medium">Check-in y manual completo</p>
                    <p className="text-gray-600">Instrucciones detalladas + enlace al manual de Itineramio</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-violet-50 p-3 rounded-lg">
              <p className="text-sm text-violet-700">
                <strong>💡 Pro tip:</strong> Usa las zonas específicas de tu manual para cada mensaje (parking, transporte, recomendaciones locales).
              </p>
            </div>
          </div>
        )
      }
    },
    {
      id: 'local-recommendations',
      type: 'content',
      priority: 'medium',
      title: 'Crear zona de recomendaciones locales',
      description: 'Añade valor con restaurantes, actividades y secretos locales que solo tú conoces.',
      actionText: 'Crear zona',
      actionUrl: properties.length > 0 ? `/properties/${properties[0].id}/zones` : '/properties/new',
      icon: <Star className="w-5 h-5 text-orange-600" />
    },
    {
      id: 'qr-placement',
      type: 'optimization',
      priority: 'medium',
      title: 'Ubicación estratégica del código QR',
      description: 'Dónde colocar tu código QR para máxima visibilidad: recibidor, nevera, mesita de noche.',
      actionText: 'Ver ubicaciones',
      hasModal: true,
      icon: <Eye className="w-5 h-5 text-indigo-600" />,
      modalContent: {
        title: 'Ubicaciones estratégicas para el código QR',
        content: (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📍 Lugares más efectivos</h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <span className="text-xl">🚪</span>
                  <div>
                    <p className="font-medium text-sm">Recibidor/Entrada</p>
                    <p className="text-xs text-gray-600">Primer punto de contacto del huésped</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <span className="text-xl">❄️</span>
                  <div>
                    <p className="font-medium text-sm">Nevera</p>
                    <p className="text-xs text-gray-600">Lo ven cuando buscan agua/comida</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <span className="text-xl">🛏️</span>
                  <div>
                    <p className="font-medium text-sm">Mesita de noche</p>
                    <p className="text-xs text-gray-600">Visible cuando se acuestan/levantan</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>✅ Recomendación:</strong> Coloca 2-3 códigos QR en lugares estratégicos para asegurar que lo vean.
              </p>
            </div>
          </div>
        )
      }
    },
    {
      id: 'guest-feedback-optimization',
      type: 'optimization',
      priority: 'low',
      title: 'Optimizar según feedback de huéspedes',
      description: 'Analiza preguntas frecuentes de huéspedes para mejorar y expandir tus zonas del manual.',
      actionText: 'Ver análisis',
      hasModal: true,
      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
      modalContent: {
        title: 'Optimización basada en feedback',
        content: (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🔍 Señales de optimización</h4>
              <div className="space-y-2">
                <div className="flex items-start space-x-2 text-sm">
                  <span className="text-red-500">❌</span>
                  <p><strong>Preguntas repetitivas:</strong> Si te preguntan lo mismo, añádelo al manual</p>
                </div>
                <div className="flex items-start space-x-2 text-sm">
                  <span className="text-orange-500">📊</span>
                  <p><strong>Zonas con pocas visitas:</strong> Revisa si están bien explicadas</p>
                </div>
                <div className="flex items-start space-x-2 text-sm">
                  <span className="text-green-500">✅</span>
                  <p><strong>Comentarios positivos:</strong> Destaca esas secciones más</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Método:</strong> Cada mes, revisa las consultas recibidas y actualiza tu manual en consecuencia.
              </p>
            </div>
          </div>
        )
      }
    },
    {
      id: 'multilingual-strategy',
      type: 'language',
      priority: 'low',
      title: 'Estrategia multiidioma',
      description: 'Prioriza idiomas según tu ubicación: inglés (turistas), francés (proximidad), alemán (turismo).',
      actionText: 'Ver estrategia',
      actionUrl: properties.length > 0 ? `/properties/${properties[0].id}/zones` : '/properties/new',
      icon: <Languages className="w-5 h-5 text-green-600" />
    }
  ]

  // Return 5 random recommendations daily
  const dailyRecommendations = allRecommendations
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
  
  return dailyRecommendations
}

/**
 * ITINERAMIO TIME SAVING ALGORITHM v1.0
 * =====================================
 * 
 * This algorithm calculates the time saved by property owners using digital manuals
 * instead of answering repetitive guest questions manually.
 * 
 * ZONE CLASSIFICATION SYSTEM:
 * ---------------------------
 * HIGH_IMPACT: Critical zones that prevent emergency calls (5-15 min saves)
 * FREQUENT: Very common questions that occur daily (2-8 min saves)  
 * MODERATE: Regular questions that happen weekly (3-6 min saves)
 * LOW: Occasional questions but still valuable (1-3 min saves)
 * 
 * TIME CALCULATION FACTORS:
 * -------------------------
 * - Zone complexity (simple info vs detailed explanations)
 * - Time of query (night/weekend emergencies = higher impact)
 * - Guest demographics (international guests need more explanation)
 * - Seasonal patterns (summer = more airport/transport questions)
 * - Property type (apartment vs villa affects complexity)
 * 
 * FORMULA: Base Time × Complexity Multiplier × Frequency Factor × Views Impact
 */

interface ZoneTimeSavings {
  zoneType: string
  baseMinutesPerQuery: number
  complexityMultiplier: number
  frequencyScore: number
  description: string
  impact: 'HIGH_IMPACT' | 'FREQUENT' | 'MODERATE' | 'LOW'
}

const ZONE_SAVINGS_DATABASE: ZoneTimeSavings[] = [
  // HIGH IMPACT - Emergency Prevention (5-15 min)
  {
    zoneType: 'check-in',
    baseMinutesPerQuery: 12,
    complexityMultiplier: 1.5,
    frequencyScore: 0.95, // 95% of guests need this
    description: 'Códigos de entrada, instrucciones de llegada',
    impact: 'HIGH_IMPACT'
  },
  {
    zoneType: 'parking',
    baseMinutesPerQuery: 8,
    complexityMultiplier: 1.3,
    frequencyScore: 0.75,
    description: 'Ubicación, códigos, restricciones de horario',
    impact: 'HIGH_IMPACT'
  },
  {
    zoneType: 'heating',
    baseMinutesPerQuery: 10,
    complexityMultiplier: 1.4,
    frequencyScore: 0.60,
    description: 'Calefacción, aire acondicionado, termostato',
    impact: 'HIGH_IMPACT'
  },
  
  // FREQUENT - Daily Common Questions (2-8 min)
  {
    zoneType: 'wifi',
    baseMinutesPerQuery: 3,
    complexityMultiplier: 1.0,
    frequencyScore: 0.98, // 98% of guests ask this
    description: 'Contraseña WiFi, problemas de conexión',
    impact: 'FREQUENT'
  },
  {
    zoneType: 'kitchen',
    baseMinutesPerQuery: 6,
    complexityMultiplier: 1.2,
    frequencyScore: 0.80,
    description: 'Electrodomésticos, vitrocerámica, microondas',
    impact: 'FREQUENT'
  },
  {
    zoneType: 'bathroom',
    baseMinutesPerQuery: 4,
    complexityMultiplier: 1.1,
    frequencyScore: 0.70,
    description: 'Ducha, productos, toallas adicionales',
    impact: 'FREQUENT'
  },
  
  // MODERATE - Weekly Questions (3-6 min)
  {
    zoneType: 'transport',
    baseMinutesPerQuery: 8,
    complexityMultiplier: 1.3,
    frequencyScore: 0.50,
    description: 'Transporte público, rutas al aeropuerto',
    impact: 'MODERATE'
  },
  {
    zoneType: 'local-recommendations',
    baseMinutesPerQuery: 5,
    complexityMultiplier: 1.1,
    frequencyScore: 0.65,
    description: 'Restaurantes, actividades, supermercados',
    impact: 'MODERATE'
  },
  {
    zoneType: 'check-out',
    baseMinutesPerQuery: 4,
    complexityMultiplier: 1.0,
    frequencyScore: 0.85,
    description: 'Horarios, llaves, proceso de salida',
    impact: 'MODERATE'
  },
  
  // LOW - Occasional but Valuable (1-3 min)
  {
    zoneType: 'entertainment',
    baseMinutesPerQuery: 3,
    complexityMultiplier: 1.0,
    frequencyScore: 0.40,
    description: 'TV, Netflix, música, entretenimiento',
    impact: 'LOW'
  },
  {
    zoneType: 'emergency',
    baseMinutesPerQuery: 15,
    complexityMultiplier: 2.0,
    frequencyScore: 0.05, // Rare but critical
    description: 'Contactos de emergencia, hospitales, policía',
    impact: 'HIGH_IMPACT'
  }
]

/**
 * Calculate time saved by a property based on its zones and views
 */
const calculateTimeSavedByProperty = (property: Property): {
  monthlyTimeSaved: number
  totalQueries: number
  estimatedYearlyValue: number
} => {
  // Base calculations per property
  const baseQueriesPerBooking = 4.2 // Average queries per guest stay
  const avgBookingsPerMonth = Math.max(1, Math.floor(property.totalViews / 3)) // Estimate bookings from views
  const avgHostTimeValue = 25 // €25/hour average host time value
  
  // Calculate time saved per zone
  let totalTimeSavedMinutes = 0
  let totalQueries = 0
  
  // Simulate zones based on property data (in real implementation, this would come from actual zones)
  const simulatedZones = [
    'wifi', 'check-in', 'kitchen', 'bathroom', 
    ...(property.zonesCount > 4 ? ['parking', 'local-recommendations'] : []),
    ...(property.zonesCount > 6 ? ['transport', 'check-out'] : []),
    ...(property.zonesCount > 8 ? ['heating', 'entertainment'] : [])
  ].slice(0, property.zonesCount)
  
  simulatedZones.forEach(zoneType => {
    const zoneData = ZONE_SAVINGS_DATABASE.find(z => z.zoneType === zoneType)
    if (zoneData) {
      const queriesPerMonth = avgBookingsPerMonth * zoneData.frequencyScore
      const timePerQuery = zoneData.baseMinutesPerQuery * zoneData.complexityMultiplier
      const timeSaved = queriesPerMonth * timePerQuery
      
      totalTimeSavedMinutes += timeSaved
      totalQueries += queriesPerMonth
    }
  })
  
  const monthlyTimeSaved = Math.round(totalTimeSavedMinutes)
  const estimatedYearlyValue = Math.round((monthlyTimeSaved * 12 / 60) * avgHostTimeValue)
  
  return {
    monthlyTimeSaved,
    totalQueries: Math.round(totalQueries),
    estimatedYearlyValue
  }
}

/**
 * Calculate aggregate stats for all properties
 */
const calculateAggregateStats = (properties: Property[]) => {
  const activeProperties = properties.filter(p => p.status === 'ACTIVE')
  
  let totalTimeSaved = 0
  let totalQueries = 0
  let totalYearlyValue = 0
  
  activeProperties.forEach(property => {
    const savings = calculateTimeSavedByProperty(property)
    totalTimeSaved += savings.monthlyTimeSaved
    totalQueries += savings.totalQueries
    totalYearlyValue += savings.estimatedYearlyValue
  })
  
  return {
    totalProperties: activeProperties.length,
    monthlyTimeSaved: totalTimeSaved,
    totalQueries: Math.round(totalQueries),
    estimatedYearlyValue: totalYearlyValue,
    averageTimeSavedPerProperty: activeProperties.length > 0 ? Math.round(totalTimeSaved / activeProperties.length) : 0
  }
}

function PropertiesPageContent() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { generateZoneWarnings } = useNotifications()
  const [properties, setProperties] = useState<Property[]>([])
  const [propertySets, setPropertySets] = useState<PropertySet[]>([])
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareProperty, setShareProperty] = useState<Property | null>(null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'properties' | 'sets'>('properties')
  const [recommendationModalOpen, setRecommendationModalOpen] = useState(false)
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Handle URL parameters on mount
  useEffect(() => {
    const tab = searchParams.get('tab')
    const manageSetId = searchParams.get('manage')
    
    if (tab === 'sets') {
      setActiveTab('sets')
    }
    
    if (manageSetId) {
      // If there's a manage parameter, switch to sets tab and select the property set
      setActiveTab('sets')
      // We'll select the property set after it's loaded
    }
  }, [searchParams])

  // Fetch properties and property sets from API - memoized to prevent duplicate calls
  useEffect(() => {
    let mounted = true
    
    const loadData = async () => {
      if (!mounted) return
      
      // Run both fetches in parallel for better performance
      await Promise.allSettled([
        fetchProperties(),
        fetchPropertySets()
      ])
    }
    
    loadData()
    
    return () => {
      mounted = false
    }
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching properties...')
      
      // Use pagination to load properties faster - increase limit for better UX
      const response = await fetch('/api/properties?limit=50&page=1')
      console.log('Response status:', response.status)
      
      const result = await response.json()
      console.log('Response data:', result)
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar propiedades')
      }
      
      if (result.success && result.data) {
        console.log('Setting properties:', result.data.length, 'properties found')
        setProperties(result.data)
        
        // Generate notifications asynchronously without blocking UI - only for first batch
        generatePropertyNotificationsAsync(result.data.slice(0, 10)) // Only process first 10 for notifications to avoid overload
      } else {
        throw new Error('Respuesta del API inválida')
      }
    } catch (err) {
      console.error('Error fetching properties:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const fetchPropertySets = async () => {
    try {
      const response = await fetch('/api/property-sets')
      const result = await response.json()
      
      if (response.ok && result.data) {
        setPropertySets(result.data)
      }
    } catch (err) {
      console.error('Error fetching property sets:', err)
    }
  }

  const generatePropertyNotificationsAsync = (properties: Property[]) => {
    // Run notifications generation in background without blocking UI
    setTimeout(async () => {
      console.log('🔔 Starting background notification generation for', properties.length, 'properties')
      
      // Process properties in smaller batches to avoid overwhelming the API
      const batchSize = 3
      for (let i = 0; i < properties.length; i += batchSize) {
        const batch = properties.slice(i, i + batchSize)
        
        // Process batch concurrently
        const batchPromises = batch.map(async (property) => {
          try {
            const zonesResponse = await fetch(`/api/properties/${property.id}/zones`)
            const zonesResult = await zonesResponse.json()
            
            if (zonesResponse.ok && zonesResult.success && zonesResult.data) {
              const zones = zonesResult.data
              const propertyName = typeof property.name === 'string' 
                ? property.name 
                : property.name.es || property.name.en || 'Propiedad'
              
              console.log(`🔔 Generating warnings for property: ${propertyName} (${zones.length} zones)`)
              generateZoneWarnings(property.id, zones, propertyName)
            }
          } catch (error) {
            console.error(`Error generating notifications for property ${property.id}:`, error)
          }
        })
        
        // Wait for current batch to complete before processing next batch
        await Promise.allSettled(batchPromises)
        
        // Small delay between batches to avoid overwhelming the server
        if (i + batchSize < properties.length) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      
      console.log('🔔 Background notification generation completed')
    }, 100) // Start after very short delay to let UI render first
  }

  // Redirect legacy manage parameter to new URL structure
  useEffect(() => {
    const manageSetId = searchParams.get('manage')
    
    if (manageSetId) {
      // Redirect to the new URL structure
      router.push(`/properties/groups/${manageSetId}`)
    }
  }, [searchParams, router])

  const handleEditProperty = (propertyId: string) => {
    router.push(`/properties/new?edit=${propertyId}`)
  }

  const handleDeleteProperty = async (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId)
    if (!property) return

    const propertyName = typeof property.name === 'string' ? property.name : property.name?.es || 'esta propiedad'
    
    if (confirm(`¿Estás seguro de que quieres eliminar "${propertyName}"? Esta acción no se puede deshacer.`)) {
      try {
        const response = await fetch(`/api/properties/${propertyId}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          throw new Error('Error al eliminar la propiedad')
        }

        // Actualizar la lista local
        setProperties(prev => prev.filter(p => p.id !== propertyId))

      } catch (error) {
        console.error('Error deleting property:', error)
        alert('Error al eliminar la propiedad. Por favor, inténtalo de nuevo.')
      }
    }
  }

  const handleToggleProperty = async (propertyId: string) => {
    try {
      // Actualizar localmente primero para feedback inmediato
      setProperties(prev => prev.map(p => 
        p.id === propertyId 
          ? { ...p, status: p.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE' }
          : p
      ))

      // Llamada a la API para actualizar en el servidor
      const response = await fetch(`/api/properties/${propertyId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el estado de la propiedad')
      }

      const result = await response.json()
      console.log(result.message)
      
    } catch (error) {
      console.error('Error toggling property:', error)
      // Revertir el cambio en caso de error
      setProperties(prev => prev.map(p => 
        p.id === propertyId 
          ? { ...p, status: p.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE' }
          : p
      ))
    }
  }


  const handleViewManual = (propertyId: string) => {
    // Open in new tab
    window.open(`/guide/${propertyId}`, '_blank')
  }

  const handleShareProperty = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId)
    if (property) {
      setShareProperty(property)
      setShareModalOpen(true)
      setCopied(false)
    }
  }

  const handleRecommendationAction = (recommendation: Recommendation) => {
    if (recommendation.hasModal) {
      setSelectedRecommendation(recommendation)
      setRecommendationModalOpen(true)
    } else if (recommendation.actionUrl) {
      router.push(recommendation.actionUrl)
    }
  }

  const scrollToRecommendations = () => {
    const element = document.getElementById('mobile-recommendations')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const getShareUrl = (property: Property) => {
    const slug = createPropertySlug(property)
    return `${window.location.origin}/guide/${slug}`
  }

  const getFriendlyUrl = (property: Property) => {
    return `/properties/${property.id}/zones`
  }

  const handlePropertyClick = (property: Property) => {
    const friendlyUrl = getFriendlyUrl(property)
    router.push(friendlyUrl)
  }

  const copyToClipboard = async () => {
    if (shareProperty) {
      try {
        await navigator.clipboard.writeText(getShareUrl(shareProperty))
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy text: ', err)
      }
    }
  }

  const closeShareModal = () => {
    setShareModalOpen(false)
    setShareProperty(null)
    setCopied(false)
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
              <div className="w-full sm:w-auto">
                <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded-lg w-80 animate-pulse"></div>
              </div>
              <div className="flex space-x-3">
                <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>  
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Properties Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4 animate-pulse"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
            <div className="w-full sm:w-auto">
              <h1 className="text-3xl font-bold text-gray-900">{t('properties.title')}</h1>
              <p className="text-gray-600 mt-1">
                {t('properties.manageDescription')}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <Link href="/properties/new" className="w-full sm:w-auto">
                <Button className="bg-violet-600 hover:bg-violet-700 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('properties.newProperty')}
                </Button>
              </Link>
              <Link href="/property-sets/new" className="w-full sm:w-auto">
                <Button variant="outline" className="border-violet-600 text-violet-600 hover:bg-violet-50 w-full sm:w-auto">
                  <Building2 className="w-4 h-4 mr-2" />
                  {t('properties.createSet')}
                </Button>
              </Link>
            </div>
          </div>

        </div>

        {/* Search Bar - Only show when more than 5 properties */}
        {activeTab === 'properties' && properties.filter(property => !property.propertySetId).length > 5 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Input
                type="text"
                placeholder={t('properties.searchPlaceholder') || 'Buscar propiedades...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>
        )}

        {/* Time Savings Stats Cards */}
        {(() => {
          const currentProperties = activeTab === 'properties' 
            ? properties.filter(property => !property.propertySetId)
            : properties // For property sets, use all properties for now
          
          const stats = calculateAggregateStats(currentProperties)
          
          return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
              <Card className="p-3 sm:p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-violet-100 rounded-lg">
                    <Home className="w-6 h-6 text-violet-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {activeTab === 'properties' ? t('properties.totalProperties') : t('properties.totalSets')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {activeTab === 'properties' 
                        ? stats.totalProperties
                        : propertySets.length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 sm:p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Timer className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('dashboard.timeSaved')}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.monthlyTimeSaved}
                    </p>
                    <p className="text-xs text-gray-500">{t('properties.minMonth')}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 sm:p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('properties.queriesAvoided')}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalQueries}
                    </p>
                    <p className="text-xs text-gray-500">{t('properties.queriesMonth')}</p>
                  </div>
                </div>
              </Card>
            </div>
          )
        })()}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('properties')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'properties'
                  ? 'border-violet-500 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('properties.individualProperties')}
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                {properties.filter(property => !property.propertySetId).length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('sets')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'sets'
                  ? 'border-violet-500 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('properties.propertySets')}
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                {propertySets.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Mobile Recommendations Banner - Only show on mobile */}
        <div className="lg:hidden mb-6">
          <Card 
            className="p-4 cursor-pointer hover:shadow-md transition-shadow border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50"
            onClick={scrollToRecommendations}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{t('properties.dailyRecommendations')}</h3>
                  <p className="text-xs text-gray-600">{t('properties.optimizationTips')}</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs px-3 py-2 border-violet-200 text-violet-600 hover:bg-violet-50"
              >
                {t('properties.viewTips')}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Loading, Error, and Content */}
        {loading ? (
          <Card className="p-12 text-center">
            <InlineLoadingSpinner 
              text={activeTab === 'properties' ? t('properties.loadingProperties') : t('properties.loadingSets')} 
              type={activeTab === 'properties' ? 'properties' : 'properties'}
            />
          </Card>
        ) : error ? (
          <Card className="p-12 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">!</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('properties.errorLoading')} {activeTab === 'properties' ? t('properties.properties') : t('properties.sets')}
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={activeTab === 'properties' ? fetchProperties : fetchPropertySets} variant="outline">
              {t('properties.retry')}
            </Button>
          </Card>
        ) : activeTab === 'properties' ? (
          (() => {
            const individualProperties = properties.filter(property => !property.propertySetId)
            console.log('🏠 Total properties:', properties.length)
            console.log('🏠 Individual properties:', individualProperties.length)
            console.log('🏠 Properties with sets:', properties.filter(p => p.propertySetId).map(p => ({ name: getText(p.name), setId: p.propertySetId, setName: p.propertySet?.name })))
            return individualProperties.length === 0
          })() ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Empty State - Takes 3 columns on desktop */}
              <div className="lg:col-span-3">
                <Card className="p-12 text-center">
                  <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('properties.noIndividualProperties')}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {t('properties.createIndividualOrSets')}
                  </p>
                  <Link href="/properties/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      {t('properties.createFirstProperty')}
                    </Button>
                  </Link>
                </Card>
              </div>

              {/* Getting Started Panel - Only visible on desktop */}
              <div className="hidden lg:block lg:col-span-2">
                <div className="sticky top-8">
                  <Card className="p-6">
                    <div className="flex items-center mb-4">
                      <Lightbulb className="w-5 h-5 text-violet-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">{t('properties.firstSteps')}</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 rounded-lg border border-blue-200 bg-blue-50"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <Home className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">
                              {t('properties.createFirstProperty')}
                            </h4>
                            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                              {t('properties.createFirstDescription')}
                            </p>
                            <Link href="/properties/new">
                              <Button 
                                size="sm" 
                                className="text-xs h-8 px-3 bg-blue-600 hover:bg-blue-700"
                              >
                                {t('properties.createProperty')}
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 rounded-lg border border-purple-200 bg-purple-50"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <Building2 className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">
                              {t('properties.multipleProperties')}
                            </h4>
                            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                              {t('properties.multiplePropertiesDescription')}
                            </p>
                            <Link href="/property-sets/new">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-xs h-8 px-3"
                              >
                                {t('properties.createSet')}
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Properties List - Takes 3 columns on desktop */}
              <div className="lg:col-span-3 space-y-4">
                {(() => {
                  const filteredProperties = properties
                    .filter(property => !property.propertySetId)
                    .filter(property => {
                      if (!searchQuery) return true
                      const query = searchQuery.toLowerCase()
                      const propertyName = getText(property.name, '').toLowerCase()
                      const propertyCity = getText(property.city, '').toLowerCase()
                      const propertyState = getText(property.state, '').toLowerCase()
                      return propertyName.includes(query) || propertyCity.includes(query) || propertyState.includes(query)
                    })
                  
                  if (searchQuery && filteredProperties.length === 0) {
                    return (
                      <Card className="p-8 text-center">
                        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No se encontraron propiedades
                        </h3>
                        <p className="text-gray-600">
                          No hay propiedades que coincidan con "{searchQuery}"
                        </p>
                      </Card>
                    )
                  }
                  
                  return filteredProperties.map((property) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex space-x-4">
                      {/* Property Image */}
                      <div className="flex-shrink-0">
                        <div className="text-center">
                          {property.profileImage ? (
                            <img 
                              src={property.profileImage} 
                              alt={getText(property.name, 'Propiedad')}
                              className="w-20 h-20 rounded-full object-cover mx-auto"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center mx-auto">
                              <Home className="w-8 h-8 text-white" />
                            </div>
                          )}
                          <div 
                            className="mt-2 text-center text-xs text-violet-600 underline cursor-pointer hover:text-violet-800"
                            onClick={() => handleEditProperty(property.id)}
                          >
                            {t('properties.edit')}
                          </div>
                        </div>
                      </div>

                      {/* Property Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg text-gray-900 truncate">
                                {getText(property.name, 'Propiedad')}
                              </h3>
                              {property.propertySetId && property.propertySet && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                  <Building2 className="w-3 h-3 mr-1" />
                                  {t('properties.belongsTo')} {property.propertySet.name}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {getText(property.city, '')}, {getText(property.state, '')}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                              <span>{property.bedrooms} {t('properties.bedroomsShort')}</span>
                              <span>{property.bathrooms} {t('properties.bathroomsShort')}</span>
                              <span>{property.maxGuests} {t('properties.guestsShort')}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center text-gray-600">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  <span>{property.zonesCount} {t('properties.zones')}</span>
                                </div>
                                {property.totalViews && (
                                  <div className="flex items-center text-gray-600">
                                    <Eye className="h-4 w-4 mr-1" />
                                    <span>{property.totalViews}</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Status and Publication Toggle */}
                              <div className="flex flex-col items-end space-y-2">
                                {/* Publication Status Indicator */}
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    property.isPublished 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {property.isPublished ? t('properties.published') : t('properties.notPublished')}
                                  </span>
                                </div>
                                
                                {/* Switch para activar/desactivar */}
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-600">
                                    {property.status === 'ACTIVE' ? t('properties.active') : t('properties.inactive')}
                                  </span>
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={property.status === 'ACTIVE'}
                                      onChange={() => handleToggleProperty(property.id)}
                                      className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content className="w-48 bg-white rounded-md border shadow-lg p-1 z-50">
                                <DropdownMenu.Item
                                  className="flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                                  onSelect={() => handleEditProperty(property.id)}
                                >
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  {t('properties.edit')}
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  className="flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                                  onSelect={() => handleShareProperty(property.id)}
                                >
                                  <Share2 className="h-4 w-4 mr-2" />
                                  {t('properties.share')}
                                </DropdownMenu.Item>
                                {property.status === 'ACTIVE' && (
                                  <DropdownMenu.Item
                                    className="flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                                    onSelect={() => handleViewManual(property.id)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    {t('properties.publicView')}
                                  </DropdownMenu.Item>
                                )}
                                <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                                <DropdownMenu.Item
                                  className="flex items-center px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                  onSelect={() => handleDeleteProperty(property.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {t('properties.delete')}
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => router.push(getFriendlyUrl(property))}
                          >
                            {t('properties.manage')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
                ))
                })()}
              </div>

              {/* Recommendations Panel - Only visible on desktop */}
              <div className="hidden lg:block lg:col-span-2">
                <div className="sticky top-8">
                  <Card className="p-6">
                    <div className="flex items-center mb-4">
                      <Lightbulb className="w-5 h-5 text-violet-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">{t('properties.recommendations')}</h3>
                    </div>
                    
                    {(() => {
                      const recommendations = generateRecommendations(properties.filter(property => !property.propertySetId))
                      
                      return (
                        <div className="space-y-4">
                          {recommendations.map((recommendation) => (
                            <motion.div
                              key={recommendation.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`p-4 rounded-lg border ${
                                recommendation.priority === 'high' 
                                  ? 'border-orange-200 bg-orange-50' 
                                  : recommendation.priority === 'medium'
                                  ? 'border-blue-200 bg-blue-50'
                                  : 'border-violet-200 bg-violet-50'
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-0.5">
                                  {recommendation.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                    {recommendation.title}
                                  </h4>
                                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                                    {recommendation.description}
                                  </p>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-xs h-8 px-3"
                                    onClick={() => handleRecommendationAction(recommendation)}
                                  >
                                    {recommendation.actionText}
                                    <ArrowRight className="w-3 h-3 ml-1" />
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )
                    })()}
                  </Card>
                </div>
              </div>
            </div>
          )
        ) : (
          // Property Sets List View
          propertySets.length === 0 ? (
            <Card className="p-12 text-center">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('properties.noPropertySets')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('properties.createSetDescription')}
              </p>
              <Link href="/property-sets/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('properties.createFirstSet')}
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {propertySets.map((propertySet) => (
                <motion.div
                  key={propertySet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex space-x-4">
                        {/* Property Set Image */}
                        <div className="flex-shrink-0">
                          <div className="text-center">
                            {propertySet.profileImage ? (
                              <img 
                                src={propertySet.profileImage} 
                                alt={propertySet.name}
                                className="w-20 h-20 rounded-lg object-cover mx-auto"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center mx-auto">
                                <Building2 className="w-10 h-10 text-white" />
                              </div>
                            )}
                            <div 
                              className="mt-2 text-center text-xs text-violet-600 underline cursor-pointer hover:text-violet-800"
                              onClick={() => router.push(`/property-sets/new?edit=${propertySet.id}`)}
                            >
                              {t('properties.edit')}
                            </div>
                          </div>
                        </div>

                        {/* Property Set Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">
                                {propertySet.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {propertySet.city}, {propertySet.state}
                              </p>
                              <p className="text-sm text-gray-500 mb-3">
                                {propertySet.type === 'HOTEL' && t('properties.hotel')}
                                {propertySet.type === 'BUILDING' && t('properties.building')}
                                {propertySet.type === 'COMPLEX' && t('properties.complex')}
                                {propertySet.type === 'RESORT' && t('properties.resort')}
                                {propertySet.type === 'HOSTEL' && t('properties.hostel')}
                                {propertySet.type === 'APARTHOTEL' && t('properties.aparthotel')}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm">
                                  <div className="flex items-center text-gray-600">
                                    <Home className="h-4 w-4 mr-1" />
                                    <span>{propertySet.propertiesCount} {t('properties.properties')}</span>
                                  </div>
                                  {propertySet.totalViews > 0 && (
                                    <div className="flex items-center text-gray-600">
                                      <Eye className="h-4 w-4 mr-1" />
                                      <span>{propertySet.totalViews} {t('properties.views')}</span>
                                    </div>
                                  )}
                                  {propertySet.avgRating > 0 && (
                                    <div className="flex items-center text-gray-600">
                                      <Star className="h-4 w-4 mr-1" />
                                      <span>{propertySet.avgRating.toFixed(1)}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  propertySet.status === 'DRAFT' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {propertySet.status === 'DRAFT' ? t('properties.draft') : t('properties.active')}
                                </span>
                              </div>
                            </div>
                            
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Portal>
                                <DropdownMenu.Content className="w-48 bg-white rounded-md border shadow-lg p-1 z-50">
                                  <DropdownMenu.Item
                                    className="flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                                    onSelect={() => router.push(`/property-sets/new?edit=${propertySet.id}`)}
                                  >
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    {t('properties.edit')}
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Item
                                    className="flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                                    onSelect={() => router.push(`/properties/groups/${propertySet.id}`)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    {t('properties.viewProperties')}
                                  </DropdownMenu.Item>
                                </DropdownMenu.Content>
                              </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-2">
                              {propertySet.description}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => router.push(`/properties/groups/${propertySet.id}`)}
                            >
                              {t('properties.manageSet')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )
        )}

        {/* Share Modal */}
        {shareModalOpen && shareProperty && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeShareModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">{t('properties.shareLink')}</h3>
                <button
                  onClick={closeShareModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Property Info */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    {shareProperty.profileImage ? (
                      <img 
                        src={shareProperty.profileImage} 
                        alt={getText(shareProperty.name, 'Propiedad')}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                        <Home className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-gray-900 truncate">
                      {getText(shareProperty.name, 'Propiedad')}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {getText(shareProperty.city, '')}, {getText(shareProperty.state, '')}
                    </p>
                  </div>
                </div>

                {/* URL Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('properties.manualLink')}
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <input
                      type="text"
                      value={getShareUrl(shareProperty)}
                      readOnly
                      className="flex-1 px-4 py-3 bg-gray-50 text-sm text-gray-700 focus:outline-none"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-3 bg-violet-600 text-white hover:bg-violet-700 transition-colors flex items-center space-x-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-medium">{t('properties.copied')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="text-sm font-medium">{t('properties.copy')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Info Message */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>💡 {t('properties.tip')}:</strong> {t('properties.shareDescription')}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
                <div className="flex justify-end space-x-3">
                  <Button
                    onClick={closeShareModal}
                    variant="outline"
                  >
                    {t('properties.close')}
                  </Button>
                  <Button
                    onClick={() => {
                      handleViewManual(shareProperty.id)
                      closeShareModal()
                    }}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {t('properties.viewManual')}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Mobile Recommendations Section - Only visible on mobile */}
        <div id="mobile-recommendations" className="lg:hidden mt-16 border-t border-gray-200 pt-8">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <Lightbulb className="w-5 h-5 text-violet-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Recomendaciones diarias</h3>
            </div>
            <p className="text-sm text-gray-600">
              Consejos diarios para aprovechar al máximo Itineramio y mejorar la experiencia de tus huéspedes
            </p>
          </div>
          
          {(() => {
            const recommendations = generateRecommendations(properties.filter(property => !property.propertySetId))
            
            return (
              <div className="space-y-4">
                {recommendations.map((recommendation, index) => (
                  <motion.div
                    key={recommendation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-4">
                      <div className={`p-4 rounded-lg border ${
                        recommendation.priority === 'high' 
                          ? 'border-orange-200 bg-orange-50' 
                          : recommendation.priority === 'medium'
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-violet-200 bg-violet-50'
                      }`}>
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {recommendation.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">
                              {recommendation.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                              {recommendation.description}
                            </p>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-xs h-8 px-3 w-full"
                              onClick={() => handleRecommendationAction(recommendation)}
                            >
                              {recommendation.actionText}
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )
          })()}
        </div>

        {/* Recommendation Modal */}
        {recommendationModalOpen && selectedRecommendation && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setRecommendationModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedRecommendation.modalContent?.title}
                </h3>
                <button
                  onClick={() => setRecommendationModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {selectedRecommendation.modalContent?.content}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
                <div className="flex justify-end space-x-3">
                  <Button
                    onClick={() => setRecommendationModalOpen(false)}
                    variant="outline"
                  >
                    Cerrar
                  </Button>
                  {selectedRecommendation.actionUrl && (
                    <Button
                      onClick={() => {
                        router.push(selectedRecommendation.actionUrl!)
                        setRecommendationModalOpen(false)
                      }}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      Ir a la sección
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full"></div>
      </div>
    }>
      <PropertiesPageContent />
    </Suspense>
  )
}