'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Plus, 
  Home, 
  MapPin, 
  Bed, 
  Bath, 
  Users,
  Square,
  Edit2,
  MoreVertical,
  Trash2,
  Eye,
  Copy,
  ChevronRight,
  Settings,
  Package
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

interface Zone {
  id: string
  name: string
  icon: string
  color?: string
  order: number
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  stepsCount?: number
  viewCount?: number
  avgRating?: number
  lastUpdated?: string
}

interface Property {
  id: string
  name: string
  description: string
  type: string
  street: string
  city: string
  state: string
  country: string
  postalCode: string
  bedrooms: number
  bathrooms: number
  maxGuests: number
  squareMeters?: number
  profileImage?: string
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  zones?: Zone[]
}

// Predefined zone types with icons
const zoneTypes = [
  { id: 'entrance', name: 'Entrada', icon: '🚪', color: 'bg-blue-100' },
  { id: 'living_room', name: 'Salón', icon: '🛋️', color: 'bg-green-100' },
  { id: 'kitchen', name: 'Cocina', icon: '🍳', color: 'bg-yellow-100' },
  { id: 'bedroom', name: 'Dormitorio', icon: '🛏️', color: 'bg-purple-100' },
  { id: 'bathroom', name: 'Baño', icon: '🚿', color: 'bg-blue-100' },
  { id: 'garden', name: 'Jardín', icon: '🌳', color: 'bg-green-100' },
  { id: 'garage', name: 'Garaje', icon: '🚗', color: 'bg-gray-100' },
  { id: 'pool', name: 'Piscina', icon: '🏊', color: 'bg-cyan-100' },
  { id: 'wifi', name: 'WiFi', icon: '📶', color: 'bg-violet-100' },
  { id: 'appliances', name: 'Electrodomésticos', icon: '🔌', color: 'bg-orange-100' },
  { id: 'security', name: 'Seguridad', icon: '🔒', color: 'bg-red-100' },
  { id: 'rules', name: 'Normas', icon: '📋', color: 'bg-pink-100' },
]

export default function PropertyEditPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  
  const [property, setProperty] = useState<Property | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)

  useEffect(() => {
    fetchPropertyData()
  }, [propertyId])

  const fetchPropertyData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/properties/${propertyId}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar la propiedad')
      }
      
      setProperty(result.data)
      setZones(result.data.zones || [])
    } catch (error) {
      console.error('Error fetching property:', error)
      alert('Error al cargar la propiedad')
      router.push('/properties')
    } finally {
      setLoading(false)
    }
  }

  const handleAddZone = () => {
    router.push(`/properties/${propertyId}/zones/new`)
  }

  const handleEditZone = (zoneId: string) => {
    router.push(`/properties/${propertyId}/zones/${zoneId}`)
  }

  const handleDeleteZone = async (zoneId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta zona?')) {
      try {
        const response = await fetch(`/api/properties/${propertyId}/zones/${zoneId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setZones(zones.filter(z => z.id !== zoneId))
        } else {
          alert('Error al eliminar la zona')
        }
      } catch (error) {
        console.error('Error deleting zone:', error)
        alert('Error al eliminar la zona')
      }
    }
  }

  const handleDuplicateZone = async (zoneId: string) => {
    // TODO: Implement zone duplication
    alert('Funcionalidad próximamente')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Propiedad no encontrada</h2>
          <Link href="/properties">
            <Button variant="outline">Volver a propiedades</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/properties">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
              <p className="text-gray-600 mt-1">
                Gestiona las zonas y pasos de tu propiedad
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
            <Button onClick={handleAddZone}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Zona
            </Button>
          </div>
        </div>

        {/* Property Info Card */}
        <Card className="p-6 mb-8">
          <div className="flex items-start space-x-6">
            {/* Property Image */}
            <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
              {property.profileImage ? (
                <img 
                  src={property.profileImage} 
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                  <Home className="w-12 h-12 text-white" />
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ubicación</p>
                <p className="font-medium text-gray-900 flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                  {property.city}, {property.state}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Capacidad</p>
                <div className="flex items-center space-x-3 text-gray-900">
                  <span className="flex items-center">
                    <Bed className="w-4 h-4 mr-1 text-gray-400" />
                    {property.bedrooms}
                  </span>
                  <span className="flex items-center">
                    <Bath className="w-4 h-4 mr-1 text-gray-400" />
                    {property.bathrooms}
                  </span>
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1 text-gray-400" />
                    {property.maxGuests}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Tamaño</p>
                <p className="font-medium text-gray-900 flex items-center">
                  <Square className="w-4 h-4 mr-1 text-gray-400" />
                  {property.squareMeters || 'N/A'} m²
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Estado</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  property.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : property.status === 'DRAFT'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {property.status === 'ACTIVE' ? 'Activo' : property.status === 'DRAFT' ? 'Borrador' : 'Archivado'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Zones Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Zonas de la Propiedad ({zones.length})
          </h2>
          
          {zones.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay zonas aún
              </h3>
              <p className="text-gray-600 mb-6">
                Crea zonas para organizar el manual de tu propiedad
              </p>
              <Button onClick={handleAddZone}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Zona
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zones.map((zone) => (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                          zone.color || 'bg-gray-100'
                        }`}>
                          {zone.icon || '📁'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                          <p className="text-sm text-gray-600">
                            {zone.stepsCount || 0} pasos
                          </p>
                        </div>
                      </div>
                      
                      {/* Actions Menu */}
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                        
                        {selectedZone === zone.id && (
                          <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 min-w-40">
                            <button
                              onClick={() => handleEditZone(zone.id)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Editar
                            </button>
                            <button
                              onClick={() => handleDuplicateZone(zone.id)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicar
                            </button>
                            <button
                              onClick={() => handleDeleteZone(zone.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Zone Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {zone.viewCount || 0} vistas
                      </span>
                      <span className="flex items-center">
                        ⭐ {zone.avgRating || 'N/A'}
                      </span>
                    </div>

                    {/* Edit Button */}
                    <Button 
                      onClick={() => handleEditZone(zone.id)}
                      className="w-full"
                      size="sm"
                    >
                      Gestionar Pasos
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Card>
                </motion.div>
              ))}
              
              {/* Add New Zone Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: zones.length * 0.1 }}
              >
                <Card 
                  className="p-4 border-2 border-dashed border-gray-300 hover:border-violet-400 hover:bg-violet-50 transition-all duration-200 cursor-pointer min-h-[200px] flex items-center justify-center"
                  onClick={handleAddZone}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Plus className="w-6 h-6 text-violet-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Nueva Zona</p>
                    <p className="text-xs text-gray-500 mt-1">Añadir nueva zona</p>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </div>

        {/* Quick Zone Templates */}
        {zones.length === 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Plantillas Rápidas de Zonas
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {zoneTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    // TODO: Create zone with template
                    router.push(`/properties/${propertyId}/zones/new?template=${type.id}`)
                  }}
                  className="p-3 border border-gray-200 rounded-lg hover:border-violet-400 hover:bg-violet-50 transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mx-auto mb-2 ${type.color}`}>
                    {type.icon}
                  </div>
                  <p className="text-xs text-gray-700">{type.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}