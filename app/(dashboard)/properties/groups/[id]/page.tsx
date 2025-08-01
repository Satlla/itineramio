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
  UserX,
  Search
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
  
  // Duplicate property modal states
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false)
  const [propertyToDuplicate, setPropertyToDuplicate] = useState<Property | null>(null)
  const [duplicateCount, setDuplicateCount] = useState(1)
  const [shareMedia, setShareMedia] = useState(true)
  const [copyCompleteProperty, setCopyCompleteProperty] = useState(true)
  const [selectedZones, setSelectedZones] = useState<string[]>([])
  const [assignToSet, setAssignToSet] = useState(false)
  const [selectedPropertySet, setSelectedPropertySet] = useState<string>('')
  const [autoPublish, setAutoPublish] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  
  // Add property modal states
  const [addPropertyModalOpen, setAddPropertyModalOpen] = useState(false)
  const [availableProperties, setAvailableProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [loadingProperties, setLoadingProperties] = useState(false)
  const [showPropertySelection, setShowPropertySelection] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Remove property modal states
  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [propertyToRemove, setPropertyToRemove] = useState<Property | null>(null)
  const [removeAction, setRemoveAction] = useState<'remove' | 'delete' | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isRemoving, setIsRemoving] = useState(false)

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

  const handleDuplicateProperty = async (property: Property) => {
    setPropertyToDuplicate(property)
    setDuplicateModalOpen(true)
    setDuplicateCount(1)
    setShareMedia(true)
    setCopyCompleteProperty(true)
    setSelectedZones([])
    setAssignToSet(true) // Auto-assign to current set
    setSelectedPropertySet(propertySetId) // Set current property set
    setAutoPublish(false)
  }

  const closeDuplicateModal = () => {
    setDuplicateModalOpen(false)
    setPropertyToDuplicate(null)
    setDuplicateCount(1)
    setShareMedia(true)
    setCopyCompleteProperty(true)
    setSelectedZones([])
    setAssignToSet(false)
    setSelectedPropertySet('')
    setAutoPublish(false)
    setIsDuplicating(false)
  }

  const handleDuplicateSubmit = async () => {
    if (!propertyToDuplicate || duplicateCount < 1) return

    setIsDuplicating(true)
    try {
      const response = await fetch('/api/properties/duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: propertyToDuplicate.id,
          count: duplicateCount,
          shareMedia,
          copyCompleteProperty,
          selectedZones: copyCompleteProperty ? [] : selectedZones,
          assignToSet,
          propertySetId: assignToSet ? selectedPropertySet : null,
          autoPublish
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        // Refresh the data
        await fetchPropertySetData()
        
        closeDuplicateModal()
        
        // Show success message
        alert(`¡${duplicateCount} ${duplicateCount === 1 ? 'propiedad creada' : 'propiedades creadas'} exitosamente!`)
        
      } else {
        throw new Error(result.error || 'Error al duplicar propiedad')
      }
      
    } catch (error) {
      console.error('Error duplicating property:', error)
      alert(`Error al duplicar la propiedad: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      setIsDuplicating(false)
    }
  }

  const getText = (obj: any, fallback: string): string => {
    if (typeof obj === 'string') return obj
    if (obj && typeof obj === 'object') {
      return obj.es || obj.en || obj.fr || fallback
    }
    return fallback
  }

  const handleOpenAddPropertyModal = () => {
    setAddPropertyModalOpen(true)
    setShowPropertySelection(false)
    setSelectedProperties([])
  }

  const handleShowExistingProperties = async () => {
    setShowPropertySelection(true)
    setLoadingProperties(true)
    setSearchTerm('')
    
    try {
      // Fetch ALL user properties (remove filter to get all properties)
      const response = await fetch('/api/properties?limit=100')
      const result = await response.json()
      
      if (response.ok && result.data) {
        // Filter out properties that are already in this set
        const currentSetPropertyIds = propertySet?.properties.map(p => p.id) || []
        const availableProps = result.data.filter((prop: Property) => 
          !currentSetPropertyIds.includes(prop.id)
        )
        setAvailableProperties(availableProps)
        setFilteredProperties(availableProps)
      }
    } catch (error) {
      console.error('Error fetching available properties:', error)
    } finally {
      setLoadingProperties(false)
    }
  }

  const handleAddExistingProperties = async () => {
    if (selectedProperties.length === 0) return
    
    try {
      // Add selected properties to the current set
      for (const propertyId of selectedProperties) {
        await fetch(`/api/properties/${propertyId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            propertySetId: propertySetId
          })
        })
      }
      
      // Refresh the property set data
      await fetchPropertySetData()
      
      // Close modal and reset
      setAddPropertyModalOpen(false)
      setSelectedProperties([])
      setShowPropertySelection(false)
      
      alert(`${selectedProperties.length} ${selectedProperties.length === 1 ? 'propiedad añadida' : 'propiedades añadidas'} al conjunto`)
    } catch (error) {
      console.error('Error adding properties to set:', error)
      alert('Error al añadir propiedades al conjunto')
    }
  }

  const togglePropertySelection = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    )
  }

  const handleSearchChange = (searchValue: string) => {
    setSearchTerm(searchValue)
    
    if (!searchValue.trim()) {
      setFilteredProperties(availableProperties)
    } else {
      const filtered = availableProperties.filter(property => 
        getText(property.name, 'Propiedad').toLowerCase().includes(searchValue.toLowerCase()) ||
        property.city.toLowerCase().includes(searchValue.toLowerCase()) ||
        property.state.toLowerCase().includes(searchValue.toLowerCase()) ||
        property.type.toLowerCase().includes(searchValue.toLowerCase())
      )
      setFilteredProperties(filtered)
    }
  }

  const handleOpenRemoveModal = (propertyId: string) => {
    const property = propertySet?.properties.find(p => p.id === propertyId)
    if (property) {
      setPropertyToRemove(property)
      setRemoveModalOpen(true)
      setRemoveAction(null)
      setDeleteConfirmText('')
    }
  }

  const closeRemoveModal = () => {
    setRemoveModalOpen(false)
    setPropertyToRemove(null)
    setRemoveAction(null)
    setDeleteConfirmText('')
    setIsRemoving(false)
  }

  const handleRemoveConfirm = async () => {
    if (!propertyToRemove || !removeAction) return

    setIsRemoving(true)
    try {
      if (removeAction === 'remove') {
        // Just remove from set, property stays in user's properties
        const response = await fetch(`/api/properties/${propertyToRemove.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ propertySetId: null })
        })
        if (response.ok) {
          alert('Propiedad removida del conjunto. Ahora aparece en "Mis propiedades"')
          await fetchPropertySetData()
          closeRemoveModal()
        } else {
          alert('Error al remover la propiedad del conjunto')
        }
      } else if (removeAction === 'delete') {
        // Delete property completely
        const response = await fetch(`/api/properties/${propertyToRemove.id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          alert('Propiedad eliminada permanentemente')
          await fetchPropertySetData()
          closeRemoveModal()
        } else {
          alert('Error al eliminar la propiedad')
        }
      }
    } catch (error) {
      console.error('Error in remove action:', error)
      alert('Error al procesar la acción')
    } finally {
      setIsRemoving(false)
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
        const property = propertySet?.properties.find(p => p.id === propertyId)
        if (property) {
          handleDuplicateProperty(property)
        }
        break
      case 'evaluations':
        router.push(`/properties/${propertyId}/evaluations`)
        break
      case 'share':
        // First ensure the property is published
        const shareProperty = propertySet?.properties.find(p => p.id === propertyId)
        if (shareProperty && shareProperty.status !== 'ACTIVE') {
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
        const publicProperty = propertySet?.properties.find(p => p.id === propertyId)
        if (publicProperty && publicProperty.status !== 'ACTIVE') {
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
        handleOpenRemoveModal(propertyId)
        break
      case 'delete':
        handleOpenRemoveModal(propertyId)
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
              <Button 
                onClick={handleOpenAddPropertyModal}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir Propiedad
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
                        onClick={() => handlePropertyAction('manage', property.id)}
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

      {/* Add Property Modal */}
      {addPropertyModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setAddPropertyModalOpen(false)
            setSelectedProperties([])
            setShowPropertySelection(false)
            setSearchTerm('')
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Añadir Propiedades al Conjunto
                </h2>
                <p className="text-gray-600">
                  Elige cómo quieres añadir propiedades a {propertySet?.name}
                </p>
              </div>

              {/* Options */}
              {!showPropertySelection && (
                <div className="space-y-4">
                  {/* Add existing properties option */}
                  <Card 
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-violet-500"
                    onClick={handleShowExistingProperties}
                  >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-violet-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          Añadir propiedades existentes
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Selecciona propiedades individuales que ya tienes creadas para añadirlas a este conjunto
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Create new property option */}
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-violet-500"
                  onClick={() => {
                    router.push(`/properties/new?propertySetId=${propertySetId}`)
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                          <Plus className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          Crear nueva propiedad
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Crea una nueva propiedad desde cero y añádela directamente a este conjunto
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </div>
              )}

              {/* Property Selection (shown when selecting existing) */}
              {showPropertySelection && loadingProperties ? (
                <div className="mt-6 text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando propiedades disponibles...</p>
                </div>
              ) : showPropertySelection && availableProperties.length > 0 ? (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Propiedades disponibles ({filteredProperties.length})
                    </h3>
                  </div>
                  
                  {/* Search bar */}
                  <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar por nombre, ciudad, tipo..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {filteredProperties.map((property) => (
                      <label
                        key={property.id}
                        className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedProperties.includes(property.id)}
                          onChange={() => togglePropertySelection(property.id)}
                          className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {getText(property.name, 'Propiedad')}
                          </div>
                          <div className="text-sm text-gray-600">
                            {property.city}, {property.state} • {property.bedrooms} hab • {property.zonesCount} zonas
                            {property.propertySetId && (
                              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                En conjunto
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPropertySelection(false)
                        setSelectedProperties([])
                        setSearchTerm('')
                      }}
                    >
                      Volver
                    </Button>
                    <Button
                      onClick={handleAddExistingProperties}
                      className="bg-violet-600 hover:bg-violet-700"
                      disabled={selectedProperties.length === 0}
                    >
                      Añadir {selectedProperties.length > 0 && `(${selectedProperties.length})`} al conjunto
                    </Button>
                  </div>
                </div>
              ) : showPropertySelection ? (
                <div className="mt-6 text-center py-8">
                  <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  {searchTerm ? (
                    <>
                      <p className="text-gray-600">No se encontraron propiedades</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Intenta con otros términos de búsqueda
                      </p>
                      <Button
                        variant="ghost"
                        onClick={() => handleSearchChange('')}
                        className="mt-3 text-violet-600"
                      >
                        Limpiar búsqueda
                      </Button>
                    </>
                  ) : availableProperties.length === 0 ? (
                    <>
                      <p className="text-gray-600">No hay propiedades disponibles para añadir</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Todas tus propiedades ya están en este conjunto
                      </p>
                    </>
                  ) : null}
                </div>
              ) : null}

              {/* Close button */}
              {!showPropertySelection && (
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setAddPropertyModalOpen(false)
                      setSelectedProperties([])
                      setShowPropertySelection(false)
                      setSearchTerm('')
                    }}
                    className="text-gray-600"
                  >
                    Cerrar
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Duplicate Property Modal */}
      {duplicateModalOpen && propertyToDuplicate && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeDuplicateModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  {propertyToDuplicate.profileImage ? (
                    <img 
                      src={propertyToDuplicate.profileImage} 
                      alt={getText(propertyToDuplicate.name, 'Propiedad')}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                      <Home className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Duplicar Propiedad
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {getText(propertyToDuplicate.name, 'Propiedad')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Number of duplicates */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Cuántas propiedades quieres crear?
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={duplicateCount}
                    onChange={(e) => setDuplicateCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Se crearán como: {getText(propertyToDuplicate.name, 'Propiedad')} 2, {getText(propertyToDuplicate.name, 'Propiedad')} 3, etc.
                  </p>
                </div>

                {/* Share Media */}
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareMedia}
                      onChange={(e) => setShareMedia(e.target.checked)}
                      className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Compartir medios (imágenes y videos)</span>
                      <p className="text-xs text-gray-500">Las nuevas propiedades usarán las mismas imágenes y videos</p>
                    </div>
                  </label>
                </div>

                {/* Copy Complete Property vs Select Zones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    ¿Qué contenido quieres duplicar?
                  </label>
                  
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={copyCompleteProperty}
                        onChange={() => setCopyCompleteProperty(true)}
                        className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 mt-0.5"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Toda la propiedad</span>
                        <p className="text-xs text-gray-500">Incluir todas las zonas y pasos</p>
                      </div>
                    </label>
                    
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={!copyCompleteProperty}
                        onChange={() => setCopyCompleteProperty(false)}
                        className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 mt-0.5"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Solo zonas específicas</span>
                        <p className="text-xs text-gray-500">Elegir qué zonas duplicar</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Auto Publish */}
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoPublish}
                      onChange={(e) => setAutoPublish(e.target.checked)}
                      className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Publicar automáticamente</span>
                      <p className="text-xs text-gray-500">Las propiedades estarán disponibles públicamente de inmediato</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={closeDuplicateModal}
                  disabled={isDuplicating}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDuplicateSubmit}
                  className="bg-violet-600 hover:bg-violet-700"
                  disabled={isDuplicating || duplicateCount < 1}
                >
                  {isDuplicating ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Duplicando...
                    </>
                  ) : (
                    `Crear ${duplicateCount} ${duplicateCount === 1 ? 'propiedad' : 'propiedades'}`
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Remove Property Modal */}
      {removeModalOpen && propertyToRemove && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeRemoveModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ¿Qué quieres hacer con esta propiedad?
                </h2>
                <div className="flex items-center space-x-3 mb-4">
                  {propertyToRemove.profileImage ? (
                    <img 
                      src={propertyToRemove.profileImage} 
                      alt={propertyToRemove.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                      <Home className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{propertyToRemove.name}</p>
                    <p className="text-sm text-gray-600">{propertyToRemove.city}, {propertyToRemove.state}</p>
                  </div>
                </div>
              </div>

              {/* Options */}
              {!removeAction && (
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => setRemoveAction('remove')}
                    className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <UserX className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Quitar del conjunto</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          La propiedad se quitará de este conjunto pero permanecerá en "Mis propiedades"
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setRemoveAction('delete')}
                    className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <Trash2 className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Eliminar permanentemente</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          La propiedad se eliminará completamente. Esta acción es irreversible.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Remove confirmation */}
              {removeAction === 'remove' && (
                <div className="mb-6">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <UserX className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-900">Quitar del conjunto</h4>
                        <p className="text-sm text-orange-700 mt-1">
                          La propiedad "{propertyToRemove.name}" se quitará de este conjunto y volverá a aparecer en "Mis propiedades".
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete confirmation */}
              {removeAction === 'delete' && (
                <div className="mb-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <Trash2 className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-900">⚠️ Eliminación permanente</h4>
                        <p className="text-sm text-red-700 mt-1">
                          Se eliminará toda la propiedad, incluyendo todas sus zonas, pasos, imágenes y datos. 
                          <strong className="block mt-1">Esta acción es irreversible.</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Para confirmar, escribe <strong>ELIMINAR</strong> en mayúsculas:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="ELIMINAR"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={closeRemoveModal}
                  disabled={isRemoving}
                >
                  Cancelar
                </Button>
                
                {removeAction === 'remove' && (
                  <Button
                    onClick={handleRemoveConfirm}
                    className="bg-orange-600 hover:bg-orange-700"
                    disabled={isRemoving}
                  >
                    {isRemoving ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Quitando...
                      </>
                    ) : (
                      'Quitar del conjunto'
                    )}
                  </Button>
                )}
                
                {removeAction === 'delete' && (
                  <Button
                    onClick={handleRemoveConfirm}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isRemoving || deleteConfirmText !== 'ELIMINAR'}
                  >
                    {isRemoving ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Eliminando...
                      </>
                    ) : (
                      'Eliminar permanentemente'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}