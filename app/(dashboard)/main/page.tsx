'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Building2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Avatar } from '../../../src/components/ui'
import { DashboardNavbar } from '../../../src/components/layout/DashboardNavbar'
import { DashboardFooter } from '../../../src/components/layout/DashboardFooter'
import { useAuth } from '../../../src/providers/AuthProvider'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface Property {
  id: string
  name: string
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

export default function DashboardPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [properties, setProperties] = useState<Property[]>([])
  const [propertySets, setPropertySets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showGuestReportsModal, setShowGuestReportsModal] = useState(false)
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0,
    activeManuals: 0,
    avgRating: 0
  })
  const router = useRouter()
  const { user } = useAuth()

  // Mock activity data
  const recentActivity = [
    { 
      id: '1', 
      type: 'view', 
      message: 'Un huésped vio "Manual de Cocina" en Villa Sunset', 
      time: 'hace 5 minutos',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
    },
    { 
      id: '2', 
      type: 'update', 
      message: 'Se ha cambiado video de zona Baño en Loft Moderno', 
      time: 'hace 2 horas',
      avatar: null
    },
    { 
      id: '3', 
      type: 'checkout', 
      message: 'Un huésped ha visto Check-out en Apartamento Centro', 
      time: 'hace 4 horas',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    },
    { 
      id: '4', 
      type: 'create', 
      message: 'Nueva zona "Terraza" creada en Villa Sunset', 
      time: 'hace 1 día',
      avatar: null
    },
    { 
      id: '5', 
      type: 'rating', 
      message: 'Nueva valoración 5⭐ en Apartamento Centro', 
      time: 'hace 2 días',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    }
  ]

  // Mock guest reports data
  const guestReports = [
    {
      id: '1',
      propertyName: 'Villa Sunset',
      issue: 'No funciona el aire acondicionado de la habitación principal',
      guestName: 'María García',
      reportTime: 'hace 30 minutos',
      priority: 'high',
      status: 'pending'
    },
    {
      id: '2', 
      propertyName: 'Loft Moderno',
      issue: 'Falta papel higiénico en el baño',
      guestName: 'Carlos López',
      reportTime: 'hace 2 horas',
      priority: 'medium',
      status: 'pending'
    },
    {
      id: '3',
      propertyName: 'Apartamento Centro', 
      issue: 'WiFi no funciona correctamente',
      guestName: 'Ana Martín',
      reportTime: 'hace 5 horas',
      priority: 'medium',
      status: 'pending'
    }
  ]

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
          avgRating: parseFloat(avgRating.toFixed(1))
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


  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardNavbar user={user || undefined} />
      
      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Home className="h-8 w-8 text-violet-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Propiedades</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : stats.totalProperties}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Visualizaciones</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : stats.totalViews}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Actividad Reciente card */}
            <Card>
              <CardContent className="p-6">
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="flex items-center w-full text-left"
                >
                  <Calendar className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Actividad Reciente</p>
                    <p className="text-2xl font-bold text-gray-900">{recentActivity.length}</p>
                  </div>
                </button>
              </CardContent>
            </Card>

            {/* Manuales Activos card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <PlayCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Manuales Activos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : stats.activeManuals}
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
              className="lg:col-span-2"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Mis Propiedades ({loading ? '...' : properties.length})
                </h2>
                <Button asChild variant="outline">
                  <Link href="/properties">
                    Ver todas
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
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
                  {properties.slice(0, 6).map((property) => (
                    <Card key={property.id} className="hover:shadow-lg transition-shadow">
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
                                onClick={() => handleEditProperty(property.id)}
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
                                      onSelect={() => handlePropertyAction('edit', property.id)}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Editar
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                      className="flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                                      onSelect={() => handlePropertyAction('share', property.id)}
                                    >
                                      <Share2 className="h-4 w-4 mr-2" />
                                      Compartir
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                      className="flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                                      onSelect={() => handlePropertyAction('public', property.id)}
                                    >
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Vista Pública
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
                                onClick={() => router.push(`/properties/${property.id}/zones`)}
                              >
                                Añadir Zonas
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Property Sets Section - Only show if user has property sets */}
            {propertySets.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="lg:col-span-2"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Mis Conjuntos de Propiedades ({propertySets.length})
                  </h2>
                  <Button asChild variant="outline">
                    <Link href="/properties?tab=sets">
                      Ver todos
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>

                <div className="space-y-4">
                  {propertySets.slice(0, 3).map((propertySet) => (
                    <Card key={propertySet.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex space-x-4">
                          {/* Property Set Image */}
                          <div className="flex-shrink-0">
                            {propertySet.profileImage ? (
                              <img 
                                src={propertySet.profileImage} 
                                alt={propertySet.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                                <Building2 className="w-8 h-8 text-white" />
                              </div>
                            )}
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
                                
                                <div className="flex items-center space-x-4 text-sm">
                                  <div className="flex items-center text-gray-600">
                                    <Home className="h-4 w-4 mr-1" />
                                    <span>{propertySet.propertiesCount} propiedades</span>
                                  </div>
                                  {propertySet.totalViews > 0 && (
                                    <div className="flex items-center text-gray-600">
                                      <Eye className="h-4 w-4 mr-1" />
                                      <span>{propertySet.totalViews} vistas</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/properties?tab=sets&manage=${propertySet.id}`)}
                              >
                                Gestionar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Right Column - Recent Activity (Desktop Only) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="hidden lg:block"
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-0 max-h-96 overflow-y-auto">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-start space-x-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex-shrink-0">
                          {activity.avatar ? (
                            <Avatar 
                              src={activity.avatar}
                              alt="User"
                              size="sm"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 leading-relaxed">
                            {activity.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions - Adjusted width to match properties section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <div className="lg:w-2/3">
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-3">
                    <Button asChild variant="outline" className="w-full justify-start h-12">
                      <Link href="/properties/new">
                        <Plus className="h-4 w-4 mr-3" />
                        Crear Nueva Propiedad
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start h-12">
                      <Link href="/analytics">
                        <TrendingUp className="h-4 w-4 mr-3" />
                        Ver Analíticas
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-12"
                      onClick={() => setShowGuestReportsModal(true)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-3" />
                      Reportes de Huéspedes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Mobile History Modal */}
          {showHistoryModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 md:hidden">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Historial de Actividad</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHistoryModal(false)}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                
                <div className="overflow-y-auto max-h-96">
                  <div className="space-y-0">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3 p-4 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex-shrink-0">
                          {activity.avatar ? (
                            <Avatar 
                              src={activity.avatar}
                              alt="User"
                              size="sm"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 leading-relaxed">
                            {activity.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Guest Reports Modal */}
          {showGuestReportsModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold flex items-center">
                      <AlertTriangle className="w-6 h-6 mr-2 text-orange-500" />
                      Reportes de Huéspedes
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowGuestReportsModal(false)}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                
                <div className="overflow-y-auto max-h-96 p-6">
                  {guestReports.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No hay reportes pendientes
                      </h4>
                      <p className="text-gray-600">
                        Todos los problemas han sido resueltos
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {guestReports.map((report) => (
                        <div
                          key={report.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-semibold text-gray-900">{report.propertyName}</h4>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  report.priority === 'high' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {report.priority === 'high' ? 'Urgente' : 'Medio'}
                                </span>
                              </div>
                              <p className="text-gray-700 mb-2">{report.issue}</p>
                              <div className="text-sm text-gray-500">
                                <span className="font-medium">Reportado por:</span> {report.guestName}
                                <span className="mx-2">•</span>
                                <span>{report.reportTime}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleSolveProblem(report.id)}
                            >
                              Solucionar Problema
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
      
      <DashboardFooter />
    </div>
  )
}