'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Home, 
  Eye, 
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
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Avatar } from '../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardNavbar } from '../../../src/components/layout/DashboardNavbar'
import { DashboardFooter } from '../../../src/components/layout/DashboardFooter'
import { useAuth } from '../../../src/providers/AuthProvider'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { getZonesSlugUrl } from '../../../src/components/navigation/slug-link'

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
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [properties, setProperties] = useState<Property[]>([])
  const [propertySets, setPropertySets] = useState<PropertySet[]>([])
  const [loading, setLoading] = useState(true)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showGuestReportsModal, setShowGuestReportsModal] = useState(false)
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0,
    activeManuals: 0,
    avgRating: 0,
    zonesViewed: 0
  })
  const router = useRouter()
  const { user } = useAuth()

  // Real-time activity state
  const [recentActivity, setRecentActivity] = useState([
    { 
      id: '1', 
      type: 'completed', 
      message: 'Un huésped completó los pasos de WiFi de Villa Sunset', 
      time: 'hace 5 minutos',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
    },
    { 
      id: '2', 
      type: 'comment', 
      message: 'Nuevo comentario en Cocina: "Perfecto! Encontré todo lo que necesitaba para cocinar"', 
      time: 'hace 1 hora',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      property: 'Loft Moderno',
      zone: 'Cocina'
    },
    { 
      id: '3', 
      type: 'rating', 
      message: 'Un usuario ha evaluado con 5 estrellas la zona WiFi de Villa Sunset', 
      time: 'hace 2 horas',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
    },
    { 
      id: '4', 
      type: 'comment', 
      message: 'Nuevo comentario en Parking: "Muy útil la información, encontré el parking fácilmente"', 
      time: 'hace 3 horas',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      property: 'Villa Sunset',
      zone: 'Parking'
    },
    { 
      id: '5', 
      type: 'step', 
      message: 'Un huésped vio un paso en Check-in de Apartamento Centro', 
      time: 'hace 6 horas',
      avatar: null
    },
    {
      id: '6',
      type: 'comment',
      message: 'Nuevo comentario en Baño: "Gracias por las instrucciones de la ducha, muy claras!"',
      time: 'hace 1 día',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&fit=crop&crop=face',
      property: 'Apartamento Centro',
      zone: 'Baño'
    },
    {
      id: '7',
      type: 'report',
      message: 'Reporte técnico: "La vitrocerámica no funciona bien" en Apartamento Playa',
      time: 'hace 2 días',
      avatar: null
    }
  ])

  // Add new activity (simulates real-time updates)
  const addNewActivity = useCallback((activity: any) => {
    setRecentActivity(prev => [activity, ...prev.slice(0, 9)]) // Keep only last 10 activities
  }, [])

  // Fetch properties data
  const fetchPropertiesData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch properties
      const propertiesResponse = await fetch('/api/properties')
      const propertiesResult = await propertiesResponse.json()
      
      // Fetch property sets
      const propertySetsResponse = await fetch('/api/property-sets')
      const propertySetsResult = await propertySetsResponse.json()
      
      if (propertiesResponse.ok && propertiesResult.data) {
        setProperties(propertiesResult.data)
        
        // Calculate stats from properties only
        const allProperties = propertiesResult.data || []
        
        const totalViews = allProperties.reduce((sum: number, p: Property) => sum + (p.totalViews || 0), 0)
        const activeManuals = allProperties.reduce((sum: number, p: Property) => sum + (p.zonesCount || 0), 0)
        const avgRating = allProperties.length > 0 ? allProperties.reduce((sum: number, p: Property) => sum + (p.avgRating || 0), 0) / allProperties.length : 0
        
        setStats({
          totalProperties: allProperties.length,
          totalViews: totalViews,
          activeManuals: activeManuals,
          avgRating: parseFloat(avgRating.toFixed(1)),
          zonesViewed: 0 // TODO: Implement real data from API
        })
      }

      if (propertySetsResponse.ok && propertySetsResult.data) {
        setPropertySets(propertySetsResult.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPropertiesData()
  }, [fetchPropertiesData])

  // Simulate real-time activity updates
  useEffect(() => {
    const guestComments = [
      {
        message: 'Nuevo comentario en WiFi: "Conexión súper rápida, gracias por la contraseña!"',
        property: 'Villa Sunset',
        zone: 'WiFi'
      },
      {
        message: 'Nuevo comentario en Lavadora: "Instrucciones perfectas, ya tengo la ropa lavándose"',
        property: 'Loft Moderno',
        zone: 'Lavadora'
      },
      {
        message: 'Nuevo comentario en Check-in: "Todo súper fácil siguiendo las instrucciones"',
        property: 'Apartamento Centro',
        zone: 'Check-in'
      },
      {
        message: 'Nuevo comentario en Aire Acondicionado: "Genial! Ya tengo la temperatura perfecta"',
        property: 'Villa Sunset',
        zone: 'Aire Acondicionado'
      }
    ]

    const interval = setInterval(() => {
      const randomComment = guestComments[Math.floor(Math.random() * guestComments.length)]
      const newActivity = {
        id: Date.now().toString(),
        type: 'comment',
        message: randomComment.message,
        time: 'hace unos segundos',
        avatar: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1494790108755-2616b612b786' : '1507003211169-0a1dd7228f2d'}?w=40&h=40&fit=crop&crop=face`,
        property: randomComment.property,
        zone: randomComment.zone
      }
      addNewActivity(newActivity)
    }, 15000) // Add new comment every 15 seconds

    return () => clearInterval(interval)
  }, [addNewActivity])

  const handlePropertyAction = (action: string, propertyId: string) => {
    switch (action) {
      case 'edit':
        router.push(`/properties/new?edit=${propertyId}`)
        break
      case 'share':
        const shareUrl = `${window.location.origin}/guide/${propertyId}`
        navigator.clipboard.writeText(shareUrl)
        break
      case 'public':
        window.open(`/guide/${propertyId}`, '_blank')
        break
      default:
        break
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

  if (loading) {
    return React.createElement(AnimatedLoadingSpinner, {
      text: "Cargando tu panel...",
      type: "general"
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardNavbar user={user || undefined} />
      
      <main className="flex-1 pt-6 sm:pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Hola, {user?.name?.split(' ')[0] || 'Usuario'} 👋
                </h1>
                <p className="text-gray-600 mt-2">
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
                <div className="flex items-center">
                  <Home className="h-6 w-6 sm:h-8 sm:w-8 text-violet-600" />
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Propiedades</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {stats.totalProperties}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center">
                  <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Visualizaciones</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {stats.totalViews}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actividad Reciente card */}
            <Card>
              <CardContent className="p-3 sm:p-6">
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="flex items-center w-full text-left"
                >
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Actividad Reciente</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{recentActivity.length}</p>
                  </div>
                </button>
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
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Properties */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2 order-1"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  {/* Minimalist Property Icon - Black vectorial */}
                  <div className="w-8 h-8 flex items-center justify-center">
                    <svg 
                      viewBox="0 0 24 24" 
                      className="w-7 h-7 text-gray-900"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Mis Propiedades ({loading ? '...' : properties.length})
                  </h2>
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
                      Comienza creando tu primera propiedad para gestionar sus manuales
                    </p>
                    <Button asChild className="bg-violet-600 hover:bg-violet-700">
                      <Link href="/properties/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Crear Primera Propiedad
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {properties.filter(property => !property.propertySetId).slice(0, 6).map((property) => (
                    <Card key={property.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/properties/${property.id}`)}>
                      <CardContent className="p-6">
                        <div className="flex space-x-4">
                          {/* Property Image */}
                          <div className="flex-shrink-0">
                            <div className="text-center">
                              {property.profileImage ? (
                                <img 
                                  src={property.profileImage} 
                                  alt={property.name}
                                  className="w-20 h-20 rounded-full object-cover mx-auto"
                                />
                              ) : (
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center mx-auto">
                                  <Home className="w-8 h-8 text-white" />
                                </div>
                              )}
                              <div 
                                className="mt-2 text-center text-xs text-violet-600 underline cursor-pointer hover:text-violet-800"
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
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                                    {property.name}
                                  </h3>
                                  {property.propertySetId && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                      <Building2 className="w-3 h-3 mr-1" />
                                      En conjunto
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {property.city}, {property.state}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                  <span>{property.bedrooms} hab</span>
                                  <span>{property.bathrooms} baños</span>
                                  <span>{property.maxGuests} huéspedes</span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4 text-sm">
                                    <div className="flex items-center text-gray-600">
                                      <MapPin className="h-4 w-4 mr-1" />
                                      <span>{property.zonesCount} zonas</span>
                                    </div>
                                    {property.totalViews && (
                                      <div className="flex items-center text-gray-600">
                                        <Eye className="h-4 w-4 mr-1" />
                                        <span>{property.totalViews}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Switch para activar/desactivar */}
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">
                                      {property.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
                                    </span>
                                    <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
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
                                      onClick={() => handlePropertyAction('edit', property.id)}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Gestionar
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item 
                                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                                      onClick={() => handlePropertyAction('share', property.id)}
                                    >
                                      <Share2 className="mr-2 h-4 w-4" />
                                      Compartir
                                    </DropdownMenu.Item>
                                    {property.status === 'ACTIVE' && (
                                      <DropdownMenu.Item 
                                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                                        onClick={() => handlePropertyAction('public', property.id)}
                                      >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Vista pública
                                      </DropdownMenu.Item>
                                    )}
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
              {!loading && properties.length > 0 && (
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

            {/* Right Column - Activity - Order last on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="order-3 lg:order-2"
            >
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                    {activity.avatar ? (
                      <Avatar className="h-8 w-8">
                        <img src={activity.avatar} alt="User" className="rounded-full" />
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                        {activity.type === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {activity.type === 'rating' && <Star className="h-4 w-4 text-yellow-500" />}
                        {activity.type === 'step' && <Eye className="h-4 w-4 text-blue-500" />}
                        {activity.type === 'comment' && <MessageCircle className="h-4 w-4 text-purple-500" />}
                        {activity.type === 'report' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Property Sets Section - Only show if user has property sets */}
          {propertySets.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-12 order-2"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  {/* Minimalist Property Set Icon - Black vectorial */}
                  <div className="w-8 h-8 flex items-center justify-center">
                    <svg 
                      viewBox="0 0 24 24" 
                      className="w-7 h-7 text-gray-900"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Conjuntos de Propiedades ({loading ? '...' : propertySets.length})
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {propertySets.map((propertySet) => (
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
                              <span>{propertySet.avgRating.toFixed(1)}</span>
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
              <div className="mt-6 text-center">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={() => router.push('/properties/groups')}
                >
                  Ver todos los conjuntos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      
      <DashboardFooter />
    </div>
  )
}