'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  ArrowRight,
  Building2, 
  Plus, 
  Home, 
  Eye, 
  Star,
  MapPin,
  Users,
  Bed,
  Bath,
  MoreHorizontal,
  Edit,
  ExternalLink,
  Share2,
  Settings,
  Copy,
  Trash2,
  BarChart3,
  UserX
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '../../../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardNavbar } from '../../../../../src/components/layout/DashboardNavbar'
import { DashboardFooter } from '../../../../../src/components/layout/DashboardFooter'
import { useAuth } from '../../../../../src/providers/AuthProvider'
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
  createdAt: string
}

interface PropertySet {
  id: string
  name: string
  description?: string
  type: 'HOTEL' | 'BUILDING' | 'COMPLEX' | 'RESORT' | 'HOSTEL' | 'APARTHOTEL'
  profileImage?: string
  city: string
  state: string
  street: string
  propertiesCount: number
  totalViews: number
  avgRating: number
  totalZones?: number
  status: string
  createdAt: string
  properties: Property[]
}

export default function PropertySetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const propertySetId = params.id as string
  
  const [propertySet, setPropertySet] = useState<PropertySet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPropertySetData()
  }, [propertySetId])

  const fetchPropertySetData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/property-sets/${propertySetId}`)
      const result = await response.json()
      
      if (response.ok && result.data) {
        setPropertySet(result.data)
      } else {
        console.error('Property set not found')
        router.push('/main')
      }
    } catch (error) {
      console.error('Error fetching property set:', error)
      router.push('/main')
    } finally {
      setLoading(false)
    }
  }

  const handlePropertyAction = async (action: string, propertyId: string) => {
    switch (action) {
      case 'edit':
        router.push(`/properties/new?edit=${propertyId}`)
        break
      case 'manage':
        router.push(`/properties/${propertyId}/zones`)
        break
      case 'duplicate':
        try {
          const response = await fetch('/api/properties/duplicate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              propertyId,
              count: 1,
              shareMedia: true,
              copyCompleteProperty: true,
              autoPublish: false
            })
          })
          const result = await response.json()
          if (response.ok) {
            // Show success notification
            alert('Propiedad duplicada correctamente')
            // Refresh the data to show the new property
            fetchPropertySetData()
          } else {
            alert(result.error || 'Error al duplicar la propiedad')
          }
        } catch (error) {
          console.error('Error duplicating property:', error)
          alert('Error al duplicar la propiedad')
        }
        break
      case 'evaluations':
        router.push(`/properties/${propertyId}/evaluations`)
        break
      case 'share':
        // First ensure the property is published
        const property = propertySet?.properties.find(p => p.id === propertyId)
        if (property && property.status !== 'ACTIVE') {
          try {
            await fetch(`/api/properties/${propertyId}/publish`, {
              method: 'POST'
            })
          } catch (error) {
            console.error('Error publishing property:', error)
          }
        }
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
          alert('Enlace copiado al portapapeles')
        })
        break
      case 'public':
        // First ensure the property is published
        const prop = propertySet?.properties.find(p => p.id === propertyId)
        if (prop && prop.status !== 'ACTIVE') {
          try {
            await fetch(`/api/properties/${propertyId}/publish`, {
              method: 'POST'
            })
          } catch (error) {
            console.error('Error publishing property:', error)
          }
        }
        window.open(`/guide/${propertyId}`, '_blank')
        break
      case 'removeFromSet':
        if (confirm('¿Estás seguro de que quieres quitar esta propiedad del conjunto? La propiedad volverá a aparecer en tu lista de propiedades individuales.')) {
          try {
            const response = await fetch(`/api/properties/${propertyId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ propertySetId: null })
            })
            if (response.ok) {
              // Show success notification
              alert('Propiedad removida del conjunto')
              // Refresh the data
              fetchPropertySetData()
            } else {
              alert('Error al remover la propiedad del conjunto')
            }
          } catch (error) {
            console.error('Error removing property from set:', error)
            alert('Error al remover la propiedad del conjunto')
          }
        }
        break
      case 'delete':
        if (confirm('¿Estás seguro de que quieres eliminar esta propiedad? Esta acción no se puede deshacer.')) {
          try {
            const response = await fetch(`/api/properties/${propertyId}`, {
              method: 'DELETE'
            })
            if (response.ok) {
              // Show success notification
              alert('Propiedad eliminada correctamente')
              // Refresh the data
              fetchPropertySetData()
            } else {
              alert('Error al eliminar la propiedad')
            }
          } catch (error) {
            console.error('Error deleting property:', error)
            alert('Error al eliminar la propiedad')
          }
        }
        break
      default:
        break
    }
  }

  if (loading) {
    return <AnimatedLoadingSpinner text="Cargando conjunto..." type="general" />
  }

  if (!propertySet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Conjunto no encontrado</h2>
          <p className="text-gray-600 mb-4">El conjunto que buscas no existe o no tienes acceso.</p>
          <Button onClick={() => router.push('/main')}>
            Volver al dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardNavbar user={user || undefined} />
      
      <main className="flex-1 pt-6 sm:pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Back Button & Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                onClick={() => router.push('/properties/groups')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </div>

            {/* Property Set Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {propertySet.profileImage ? (
                  <img 
                    src={propertySet.profileImage} 
                    alt={propertySet.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {propertySet.name}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {propertySet.city}, {propertySet.state}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {propertySet.type === 'HOTEL' && 'Hotel'}
                    {propertySet.type === 'BUILDING' && 'Edificio'}
                    {propertySet.type === 'COMPLEX' && 'Complejo'}
                    {propertySet.type === 'RESORT' && 'Resort'}
                    {propertySet.type === 'HOSTEL' && 'Hostel'}
                    {propertySet.type === 'APARTHOTEL' && 'Aparthotel'}
                  </Badge>
                </div>
              </div>
              
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            </div>

            {propertySet.description && (
              <p className="text-gray-700 mt-4 text-lg">
                {propertySet.description}
              </p>
            )}
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Home className="h-8 w-8 text-violet-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Propiedades</p>
                    <p className="text-2xl font-bold text-gray-900">{propertySet.propertiesCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <MapPin className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Zonas totales</p>
                    <p className="text-2xl font-bold text-gray-900">{propertySet.totalZones || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Visualizaciones</p>
                    <p className="text-2xl font-bold text-gray-900">{propertySet.totalViews}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Valoración</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {propertySet.avgRating > 0 ? propertySet.avgRating.toFixed(1) : '--'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Properties List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Propiedades ({propertySet.properties?.length || 0})
              </h2>
              <Button asChild className="bg-violet-600 hover:bg-violet-700">
                <Link href="/properties/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Propiedad
                </Link>
              </Button>
            </div>

            {propertySet.properties && propertySet.properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {propertySet.properties.map((property) => (
                  <Card key={property.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {property.profileImage ? (
                            <img 
                              src={property.profileImage} 
                              alt={property.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                              <Home className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">
                              {property.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {property.city}, {property.state}
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
                                onClick={() => handlePropertyAction('edit', property.id)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenu.Item>
                              <DropdownMenu.Item 
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                                onClick={() => handlePropertyAction('manage', property.id)}
                              >
                                <Building2 className="mr-2 h-4 w-4" />
                                Gestionar propiedad
                              </DropdownMenu.Item>
                              <DropdownMenu.Item 
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                                onClick={() => handlePropertyAction('duplicate', property.id)}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicar
                              </DropdownMenu.Item>
                              <DropdownMenu.Item 
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                                onClick={() => handlePropertyAction('evaluations', property.id)}
                              >
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Evaluaciones
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
                              <DropdownMenu.Item 
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                                onClick={() => handlePropertyAction('share', property.id)}
                              >
                                <Share2 className="mr-2 h-4 w-4" />
                                Compartir
                              </DropdownMenu.Item>
                              <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                              <DropdownMenu.Item 
                                className="flex items-center px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded cursor-pointer"
                                onClick={() => handlePropertyAction('removeFromSet', property.id)}
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Quitar del conjunto
                              </DropdownMenu.Item>
                              <DropdownMenu.Item 
                                className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                onClick={() => handlePropertyAction('delete', property.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{property.bedrooms} hab</span>
                          <span>{property.bathrooms} baños</span>
                          <span>{property.maxGuests} huéspedes</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{property.zonesCount} zonas</span>
                          </div>
                          {property.totalViews !== undefined && (
                            <div className="flex items-center text-gray-600">
                              <Eye className="h-4 w-4 mr-1" />
                              <span>{property.totalViews}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <Badge 
                          variant={property.status === 'ACTIVE' ? 'default' : 'secondary'}
                          className={property.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {property.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
                        </Badge>
                        
                        {property.avgRating !== undefined && property.avgRating > 0 && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span>{property.avgRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Gestionar Button */}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handlePropertyAction('edit', property.id)}
                      >
                        Gestionar
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay propiedades en este conjunto
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Comienza añadiendo propiedades a este conjunto
                  </p>
                  <Button asChild className="bg-violet-600 hover:bg-violet-700">
                    <Link href="/properties/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Añadir Primera Propiedad
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </main>
      
      <DashboardFooter />
    </div>
  )
}