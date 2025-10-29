'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Home,
  Eye,
  Lightbulb,
  Calendar,
  TrendingUp,
  Users,
  PlayCircle,
  MapPin,
  Star,
  ArrowRight,
  MoreHorizontal,
  Edit,
  Share2,
  Trash2,
  Copy,
  ExternalLink,
  AlertTriangle,
  X,
  Building2,
  CheckCircle,
  MessageCircle,
  Timer,
  Hash
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { UnifiedWelcomeModal } from '../../../src/components/ui/UnifiedWelcomeModal'
import FirstPropertyOnboarding from '../../../src/components/ui/FirstPropertyOnboarding'
import FirstPropertyNotification from '../../../src/components/ui/FirstPropertyNotification'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Avatar } from '../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardNavbar } from '../../../src/components/layout/DashboardNavbar'
import { DashboardFooter } from '../../../src/components/layout/DashboardFooter'
import { useAuth } from '../../../src/providers/AuthProvider'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { getZonesSlugUrl } from '../../../src/components/navigation/slug-link'
import { useTranslation } from 'react-i18next'
import { useOnboarding } from '../../../src/contexts/OnboardingContext'
import { Spotlight } from '../../../src/components/ui/Spotlight'

interface Property {
  id: string
  name: string
  slug?: string | null
  description?: string
  type: string
  city: string
  state: string
  bedrooms: number
  bathrooms: number
  maxGuests: number
  zonesCount: number
  totalViews?: number
  avgRating?: number
  status: string
  profileImage?: string
  propertyCode?: string
  propertySetId?: string | null
  createdAt: string
  updatedAt: string
}

interface PropertySet {
  id: string
  name: string
  description?: string
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

export default function DashboardPage(): JSX.Element {
  const { t } = useTranslation('common')
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [properties, setProperties] = useState<Property[]>([])
  const [propertySets, setPropertySets] = useState<PropertySet[]>([])
  const [loading, setLoading] = useState(true)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showGuestReportsModal, setShowGuestReportsModal] = useState(false)
  const [showUnifiedWelcome, setShowUnifiedWelcome] = useState(() => {
    // Check if user has already seen the unified welcome modal
    if (typeof window !== 'undefined') {
      const hasSeenBefore = localStorage.getItem('hasSeenUnifiedWelcome') === 'true'
      console.log('🔍 Initial state check - hasSeenUnifiedWelcome:', hasSeenBefore)
      return !hasSeenBefore
    }
    return false
  })
  const [showFirstPropertyNotification, setShowFirstPropertyNotification] = useState(false)
  const [showFirstPropertyOnboarding, setShowFirstPropertyOnboarding] = useState(false)
  const [trialStatus, setTrialStatus] = useState<any>(null)
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null)
  const hasCheckedWelcomeModal = useRef(false)
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0,
    activeManuals: 0,
    avgRating: 0,
    zonesViewed: 0,
    timeSavedMinutes: 0,
    monthlyViews: 0
  })
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { startOnboarding, showSpotlight, spotlightTarget, setSpotlight } = useOnboarding()

  // Real-time activity state - solo datos reales
  const [recentActivity, setRecentActivity] = useState<any[]>([])


  // Fetch recent activity
  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/dashboard/recent-activity', {
        credentials: 'include'
      })
      const result = await response.json()

      if (response.ok && result.success) {
        // Just use the real evaluations from API
        setRecentActivity(result.activity.slice(0, 5)) // Reducir a 5 elementos
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error)
    }
  }

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Hacer todas las llamadas en paralelo para optimizar carga
      const [analyticsResponse, propertySetsResponse] = await Promise.all([
        fetch('/api/analytics/dashboard', { credentials: 'include' }),
        fetch('/api/property-sets', { credentials: 'include' })
      ])
      
      const [analyticsResult, propertySetsResult] = await Promise.all([
        analyticsResponse.json(),
        propertySetsResponse.json()
      ])
      
      // Procesar analytics data
      if (analyticsResponse.ok && analyticsResult.success && analyticsResult.data) {
        const { stats, allProperties, trialStatus: trialData, hasActiveSubscription: hasSubscription } = analyticsResult.data
        setProperties(allProperties || [])
        setStats({
          totalProperties: stats.totalProperties || 0,
          totalViews: stats.totalViews || 0,
          activeManuals: stats.activeManuals || 0,
          avgRating: stats.avgRating || 0,
          zonesViewed: stats.zonesViewed || 0,
          timeSavedMinutes: stats.timeSavedMinutes || 0,
          monthlyViews: stats.monthlyViews || 0
        })

        // Set trial status
        if (trialData) {
          setTrialStatus({
            isActive: trialData.isActive,
            startedAt: trialData.startedAt ? new Date(trialData.startedAt) : null,
            endsAt: trialData.endsAt ? new Date(trialData.endsAt) : null,
            daysRemaining: trialData.daysRemaining,
            hasExpired: trialData.hasExpired
          })
        }
        setHasActiveSubscription(hasSubscription || false)
      } else {
        // Fallback - obtener todas las propiedades
        const propertiesResponse = await fetch('/api/properties', {
          credentials: 'include'
        })
        const propertiesResult = await propertiesResponse.json()
        
        if (propertiesResponse.ok && propertiesResult.data) {
          setProperties(propertiesResult.data)
          setStats({
            totalProperties: propertiesResult.data.length,
            totalViews: propertiesResult.data.reduce((sum: number, p: any) => sum + (p.totalViews || 0), 0),
            activeManuals: propertiesResult.data.filter((p: any) => p.status === 'ACTIVE').length,
            avgRating: 0,
            zonesViewed: propertiesResult.data.reduce((sum: number, p: any) => sum + (p.zonesCount || 0), 0),
            timeSavedMinutes: 0,
            monthlyViews: 0
          })
        }
      }
      
      // Procesar property sets
      if (propertySetsResponse.ok && propertySetsResult.data) {
        setPropertySets(propertySetsResult.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Cargar datos con el nuevo endpoint optimizado
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        
        const response = await fetch('/api/dashboard/data', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setProperties(result.data.properties || [])
            setPropertySets(result.data.propertySets || [])
            setStats(prev => ({
              ...prev,
              ...result.data.stats
            }))
            setRecentActivity(result.data.recentActivity || [])

            // Set trial status and subscription status
            if (result.data.trialStatus) {
              setTrialStatus({
                isActive: result.data.trialStatus.isActive,
                startedAt: result.data.trialStatus.startedAt ? new Date(result.data.trialStatus.startedAt) : null,
                endsAt: result.data.trialStatus.endsAt ? new Date(result.data.trialStatus.endsAt) : null,
                daysRemaining: result.data.trialStatus.daysRemaining,
                hasExpired: result.data.trialStatus.hasExpired
              })
            }
            setHasActiveSubscription(result.data.hasActiveSubscription || false)
          }
        } else {
          // Fallback a método anterior si falla
          await Promise.all([
            fetchAnalyticsData(),
            fetchRecentActivity()
          ])
        }
      } catch (error) {
        console.error('Error loading dashboard:', error)
        // Fallback a método anterior si falla
        await Promise.all([
          fetchAnalyticsData(),
          fetchRecentActivity()
        ])
      } finally {
        setLoading(false)
      }
    }
    
    loadDashboardData()
  }, [])

  // Check for welcome parameter to show unified welcome modal (ONLY ONCE EVER)
  useEffect(() => {
    // ABSOLUTE GUARD: NEVER show if already seen - check localStorage FIRST
    if (typeof window !== 'undefined' && localStorage.getItem('hasSeenUnifiedWelcome') === 'true') {
      console.log('🚫 Unified welcome modal already seen, not showing')
      setShowUnifiedWelcome(false)
      return
    }

    // Only check once per component lifetime
    if (hasCheckedWelcomeModal.current) {
      console.log('🚫 Already checked unified welcome modal in this session')
      return
    }
    hasCheckedWelcomeModal.current = true

    // Only show if welcome=true AND user is loaded AND NOT SEEN BEFORE
    const welcome = searchParams.get('welcome')
    console.log('🔍 Welcome param:', welcome, 'User:', !!user?.name)

    if (welcome === 'true' && user?.name) {
      // Double check localStorage one more time
      if (localStorage.getItem('hasSeenUnifiedWelcome') === 'true') {
        console.log('🚫 Double-check: already seen, not showing')
        setShowUnifiedWelcome(false)
        return
      }

      console.log('✅ Showing unified welcome modal for first time')
      setShowUnifiedWelcome(true)

      // Clean up URL immediately
      const url = new URL(window.location.href)
      url.searchParams.delete('welcome')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams, user])

  // Check if should show first property notification/onboarding
  useEffect(() => {
    // Solo mostrar si no está cargando y no hay propiedades
    if (!loading && properties.length === 0) {
      const hasSeenFirstPropertyOnboarding = localStorage.getItem('hasSeenFirstPropertyOnboarding')

      if (!hasSeenFirstPropertyOnboarding) {
        // Mostrar notificación después de 2 segundos
        const timer = setTimeout(() => {
          setShowFirstPropertyNotification(true)
        }, 2000)
        return () => clearTimeout(timer)
      }
    }
  }, [loading, properties])

  // Handlers for first property onboarding
  const handleStartFirstPropertyTour = () => {
    setShowFirstPropertyNotification(false)
    // Show spotlight on the "Add Property" button
    setSpotlight(true, 'add-property-button')
    // Give users 2 seconds to see the spotlight before redirecting
    setTimeout(() => {
      startOnboarding()
    }, 2000)
  }

  const handleCompleteFirstPropertyOnboarding = () => {
    localStorage.setItem('hasSeenFirstPropertyOnboarding', 'true')
    setShowFirstPropertyOnboarding(false)
    // Redirigir a crear propiedad
    router.push('/properties/new?onboarding=true')
  }

  const handleCloseFirstPropertyNotification = () => {
    // Marcar como visto para que no vuelva a aparecer
    localStorage.setItem('hasSeenFirstPropertyOnboarding', 'true')
    setShowFirstPropertyNotification(false)
  }

  // Refresh recent activity periodically to get new real data
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRecentActivity()
    }, 60000) // Refresh every 60 seconds instead of 30

    return () => clearInterval(interval)
  }, [])

  const handlePropertyAction = (action: string, propertyIdOrObject: string | any) => {
    const propertyId = typeof propertyIdOrObject === 'string' ? propertyIdOrObject : propertyIdOrObject.id
    
    switch (action) {
      case 'edit':
        router.push(`/properties/new?edit=${propertyId}`)
        break
      case 'share':
        const shareUrl = `${window.location.origin}/guide/${propertyId}`
        navigator.clipboard.writeText(shareUrl).then(() => {
          // Show success notification
          const notification = document.createElement('div')
          notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
          notification.textContent = 'Enlace copiado'
          document.body.appendChild(notification)
          setTimeout(() => {
            document.body.removeChild(notification)
          }, 3000)
        }).catch(() => {
          // Fallback for older browsers
          const textArea = document.createElement('textarea')
          textArea.value = shareUrl
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          
          const notification = document.createElement('div')
          notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
          notification.textContent = 'Enlace copiado'
          document.body.appendChild(notification)
          setTimeout(() => {
            document.body.removeChild(notification)
          }, 3000)
        })
        break
      case 'public':
        window.open(`/guide/${propertyId}`, '_blank')
        break
      case 'duplicate':
        // Redirect to properties page with duplicate action
        router.push(`/properties?duplicate=${propertyId}`)
        break
      case 'delete':
        handleDeleteProperty(propertyId)
        break
      default:
        break
    }
  }

  const handleDeleteProperty = async (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId)
    if (!property) return

    if (confirm(`¿Estás seguro de que quieres eliminar la propiedad "${property.name}"? Esta acción no se puede deshacer.`)) {
      try {
        const response = await fetch(`/api/properties/${propertyId}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          throw new Error('Error al eliminar la propiedad')
        }

        // Actualizar la lista local
        setProperties(prev => prev.filter(p => p.id !== propertyId))
        
        // Actualizar stats
        setStats(prev => ({
          ...prev,
          totalProperties: prev.totalProperties - 1
        }))

      } catch (error) {
        console.error('Error deleting property:', error)
        alert('Error al eliminar la propiedad. Por favor, inténtalo de nuevo.')
      }
    }
  }

  const handleEditProperty = (propertyId: string) => {
    router.push(`/properties/new?edit=${propertyId}`)
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

  const handleSolveProblem = (reportId: string) => {
    // Aquí implementarías la lógica para marcar el problema como resuelto
    console.log(`Resolviendo problema con ID: ${reportId}`)
    // Por ahora solo cerramos el modal
    setShowGuestReportsModal(false)
  }

  const handlePropertySetAction = (action: string, propertySetId: string) => {
    switch (action) {
      case 'edit':
        router.push(`/properties/groups/new?edit=${propertySetId}`)
        break
      case 'manage':
        router.push(`/properties/groups/${propertySetId}`)
        break
      case 'share':
        // Compartir conjunto - podrías implementar esto más tarde
        console.log(`Compartir conjunto ${propertySetId}`)
        break
      default:
        break
    }
  }

  if (loading) {
    return React.createElement(AnimatedLoadingSpinner, {
      text: "Cargando tu panel...",
      type: "general"
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardNavbar user={user || undefined} />
      
      <main className="flex-1 pt-20 sm:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Hola, {user?.name?.split(' ')[0] || 'Usuario'} 👋
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                  Aquí tienes un resumen de tus propiedades y manuales
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
          >
            <Card>
              <CardContent className="p-3 sm:p-6">
                <button
                  onClick={() => router.push('/properties')}
                  className="flex items-center w-full text-left"
                >
                  <Home className="h-6 w-6 sm:h-8 sm:w-8 text-violet-600" />
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Mis Propiedades</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {stats.totalProperties}
                    </p>
                  </div>
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-6">
                <button
                  onClick={() => router.push('/analytics')}
                  className="flex items-center w-full text-left"
                >
                  <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Visualizaciones totales</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {stats.totalViews}
                    </p>
                  </div>
                </button>
              </CardContent>
            </Card>

            {/* Minutos Ahorrados card */}
            <Card>
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center">
                  <Timer className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Minutos ahorrados</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {stats.timeSavedMinutes || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Zonas Vistas card */}
            <Card>
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center">
                  <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Zonas Vistas</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {stats.zonesViewed || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content - Two Column Layout for Desktop */}
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Left Column - Properties and Property Sets */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="order-1"
              >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* Minimalist Property Icon - Black vectorial */}
                  <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-5 h-5 sm:w-7 sm:h-7 text-gray-900"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
                    </svg>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Mis Propiedades ({loading ? '...' : properties.length})
                  </h2>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Floating Lightbulb - OUTSIDE button, on the left - CLICKEABLE */}
                  {properties.length === 0 && !localStorage.getItem('hasSeenFirstPropertyOnboarding') && (
                    <motion.div
                      animate={{
                        y: [0, -8, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="flex-shrink-0 cursor-pointer"
                      onClick={handleStartFirstPropertyTour}
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-yellow-400 rounded-full blur-lg opacity-60 animate-pulse" />
                        <Lightbulb className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400 relative hover:scale-110 transition-transform" fill="currentColor" />
                      </div>
                    </motion.div>
                  )}
                  <Button
                    id="add-property-button"
                    asChild
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-700 w-full sm:w-auto"
                    data-onboarding="create-property-button"
                  >
                    <Link href="/properties/new" className="flex items-center justify-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Añadir propiedad
                    </Link>
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex space-x-4">
                          <div className="bg-gray-200 h-20 w-20 rounded-full"></div>
                          <div className="flex-1">
                            <div className="bg-gray-200 h-4 w-3/4 mb-2 rounded"></div>
                            <div className="bg-gray-200 h-3 w-1/2 mb-2 rounded"></div>
                            <div className="bg-gray-200 h-3 w-2/3 mb-3 rounded"></div>
                            <div className="flex justify-between items-center">
                              <div className="bg-gray-200 h-3 w-1/3 rounded"></div>
                              <div className="bg-gray-200 h-6 w-11 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No tienes propiedades aún
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Crea tu primera propiedad
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      {/* Floating Lightbulb - OUTSIDE button, on the left - CLICKEABLE */}
                      <motion.div
                        animate={{
                          y: [0, -8, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="flex-shrink-0 cursor-pointer"
                        onClick={handleStartFirstPropertyTour}
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-yellow-400 rounded-full blur-lg opacity-60 animate-pulse" />
                          <Lightbulb className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400 relative hover:scale-110 transition-transform" fill="currentColor" />
                        </div>
                      </motion.div>
                      <Button
                        asChild
                        className="bg-violet-600 hover:bg-violet-700"
                        data-onboarding="create-property-button"
                      >
                        <Link href="/properties/new" className="inline-flex items-center">
                          <Plus className="w-4 h-4 mr-2" />
                          Crea tu primera propiedad
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {properties.slice(0, 3).map((property) => (
                    <Card key={property.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/properties/${property.id}`)}>
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex space-x-3 sm:space-x-4">
                          {/* Property Image */}
                          <div className="flex-shrink-0">
                            <div className="text-center">
                              {property.profileImage ? (
                                <img
                                  src={property.profileImage}
                                  alt={property.name}
                                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mx-auto"
                                />
                              ) : (
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center mx-auto">
                                  <Home className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                              )}
                              <div
                                className="mt-1.5 sm:mt-2 text-center text-[10px] sm:text-xs text-violet-600 underline cursor-pointer hover:text-violet-800"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditProperty(property.id)
                                }}
                              >
                                Editar
                              </div>
                            </div>
                          </div>

                          {/* Property Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                                    {property.name}
                                  </h3>
                                  {property.propertyCode && (
                                    <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-blue-100 text-blue-800">
                                      <Hash className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                                      {property.propertyCode}
                                    </span>
                                  )}
                                  {property.propertySetId && (
                                    <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-indigo-100 text-indigo-800">
                                      <Building2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                                      En conjunto
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">
                                  {property.city}, {property.state}
                                </p>
                                <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                                  <span>{property.bedrooms} hab</span>
                                  <span>{property.bathrooms} baños</span>
                                  <span className="hidden xs:inline">{property.maxGuests} huéspedes</span>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
                                    <div className="flex items-center text-gray-600">
                                      <MapPin className="h-3 h-3 sm:h-4 sm:w-4 mr-1" />
                                      <span>{property.zonesCount} zonas</span>
                                    </div>
                                    {property.totalViews && (
                                      <div className="flex items-center text-gray-600">
                                        <Eye className="h-3 h-3 sm:h-4 sm:w-4 mr-1" />
                                        <span>{property.totalViews}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Switch para activar/desactivar */}
                                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                                    <span className="text-xs sm:text-sm text-gray-600 hidden xs:inline">
                                      {property.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
                                    </span>
                                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                      <input
                                        type="checkbox"
                                        checked={property.status === 'ACTIVE'}
                                        onChange={() => handleToggleProperty(property.id)}
                                        className="sr-only peer"
                                      />
                                      <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                                    </label>
                                  </div>
                                </div>
                              </div>

                              <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                  <DropdownMenu.Content className="w-56 bg-white rounded-md shadow-lg border border-gray-200 p-1">
                                    <DropdownMenu.Item 
                                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handlePropertyAction('edit', property.id)
                                      }}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item 
                                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        router.push(`/properties/${property.id}/zones`)
                                      }}
                                    >
                                      <Building2 className="mr-2 h-4 w-4" />
                                      Gestionar propiedad
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item 
                                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handlePropertyAction('duplicate', property)
                                      }}
                                    >
                                      <Copy className="mr-2 h-4 w-4" />
                                      Duplicar
                                    </DropdownMenu.Item>
                                    {property.status === 'ACTIVE' && (
                                      <DropdownMenu.Item 
                                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handlePropertyAction('public', property.id)
                                        }}
                                      >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Vista pública
                                      </DropdownMenu.Item>
                                    )}
                                    <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                                    <DropdownMenu.Item 
                                      className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handlePropertyAction('delete', property.id)
                                      }}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Eliminar
                                    </DropdownMenu.Item>
                                  </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                              </DropdownMenu.Root>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* Ver todas button below properties */}
              {!loading && properties.length > 3 && (
                <div className="mt-6 text-center">
                  <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link href="/properties">
                      Ver todas las propiedades
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              )}
              </motion.div>

              {/* Property Sets Section - Only show if user has property sets */}
              {propertySets.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="mt-6 order-2"
                >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {/* Minimalist Property Set Icon - Black vectorial */}
                    <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5 sm:w-7 sm:h-7 text-gray-900"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                      </svg>
                    </div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                      Conjuntos de Propiedades ({loading ? '...' : propertySets.length})
                    </h2>
                  </div>
                </div>
                
                {/* Explanatory text */}
                <div className="mb-4 sm:mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-medium text-blue-800 mb-1">
                        ¿Qué son los Conjuntos de Propiedades?
                      </h3>
                      <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">
                        Los conjuntos agrupan propiedades que pertenecen a un mismo edificio, hotel, complejo o resort. Ideal para gestionar múltiples apartamentos en un mismo lugar con información compartida.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {propertySets.slice(0, 3).map((propertySet) => (
                    <Card key={propertySet.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col h-full">
                          {/* Property Set Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              {propertySet.profileImage ? (
                                <img 
                                  src={propertySet.profileImage} 
                                  alt={propertySet.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center">
                                  <Building2 className="w-6 h-6 text-white" />
                                </div>
                              )}
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">
                                  {propertySet.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {propertySet.city}, {propertySet.state}
                                </p>
                              </div>
                            </div>

                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Portal>
                                <DropdownMenu.Content className="w-56 bg-white rounded-md shadow-lg border border-gray-200 p-1">
                                  <DropdownMenu.Item 
                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                                    onClick={() => handlePropertySetAction('edit', propertySet.id)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Item 
                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                                    onClick={() => handlePropertySetAction('manage', propertySet.id)}
                                  >
                                    <Building2 className="mr-2 h-4 w-4" />
                                    Gestionar
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Item 
                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                                    onClick={() => handlePropertySetAction('share', propertySet.id)}
                                  >
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Compartir
                                  </DropdownMenu.Item>
                                </DropdownMenu.Content>
                              </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-3 mb-4 flex-grow">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">{propertySet.propertiesCount || 0}</div>
                              <div className="text-xs text-gray-600">Propiedades</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">{propertySet.totalZones || 0}</div>
                              <div className="text-xs text-gray-600">Zonas</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">{propertySet.totalViews || 0}</div>
                              <div className="text-xs text-gray-600">Vistas</div>
                            </div>
                          </div>

                          {/* Type Badge */}
                          <div className="flex items-center justify-between mb-4">
                            <Badge variant="secondary" className="text-xs">
                              {propertySet.type === 'HOTEL' && 'Hotel'}
                              {propertySet.type === 'BUILDING' && 'Edificio'}
                              {propertySet.type === 'COMPLEX' && 'Complejo'}
                              {propertySet.type === 'RESORT' && 'Resort'}
                              {propertySet.type === 'HOSTEL' && 'Hostel'}
                              {propertySet.type === 'APARTHOTEL' && 'Aparthotel'}
                            </Badge>
                            {propertySet.avgRating > 0 && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                <span>{Number(propertySet.avgRating).toFixed(1)}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => router.push(`/properties/groups/${propertySet.id}`)}
                          >
                            Gestionar
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Ver todos button below property sets */}
                {propertySets.length > 3 && (
                  <div className="mt-6 text-center">
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto"
                      onClick={() => router.push('/properties/groups')}
                    >
                      Ver todos los conjuntos ({propertySets.length})
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
                </motion.div>
              )}
            </div>

            {/* Right Column - Activity - Order last on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-1 order-4 lg:order-2 mt-6 lg:mt-0"
            >
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Actividad Reciente</h2>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                    <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No hay actividad reciente</p>
                  </div>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-2 sm:space-x-3 p-2.5 sm:p-3 bg-white rounded-lg border border-gray-200">
                      {activity.avatar ? (
                        <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                          <img src={activity.avatar} alt="User" className="rounded-full" />
                        </Avatar>
                      ) : (
                        <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          {activity.type === 'completed' && <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />}
                          {activity.type === 'evaluation' && <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />}
                          {activity.type === 'rating' && <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />}
                          {activity.type === 'step' && <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />}
                          {activity.type === 'comment' && <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />}
                          {activity.type === 'report' && <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-900 leading-snug">{activity.message}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Unified Welcome Modal */}
      <UnifiedWelcomeModal
        isOpen={showUnifiedWelcome}
        onClose={() => {
          console.log('🚪 UnifiedWelcomeModal onClose called')
          // ALWAYS save to localStorage when closing, no matter how it was closed
          if (typeof window !== 'undefined') {
            localStorage.setItem('hasSeenUnifiedWelcome', 'true')
            localStorage.setItem('hasSeenWelcomeModal', 'true')
            localStorage.setItem('hasCompletedOnboarding', 'true')
          }
          setShowUnifiedWelcome(false)
        }}
        userName={user?.name?.split(' ')[0] || ''}
        trialDaysRemaining={trialStatus?.daysRemaining}
      />

      {/* First Property Notification */}
      <FirstPropertyNotification
        isOpen={showFirstPropertyNotification}
        onClose={handleCloseFirstPropertyNotification}
        onStartTour={handleStartFirstPropertyTour}
      />

      {/* First Property Onboarding */}
      <FirstPropertyOnboarding
        isOpen={showFirstPropertyOnboarding}
        onClose={() => setShowFirstPropertyOnboarding(false)}
        onComplete={handleCompleteFirstPropertyOnboarding}
      />

      {/* Spotlight para resaltar elementos durante onboarding */}
      {spotlightTarget && (
        <Spotlight
          isActive={showSpotlight}
          targetId={spotlightTarget}
        />
      )}

      <DashboardFooter />
    </div>
  )
}