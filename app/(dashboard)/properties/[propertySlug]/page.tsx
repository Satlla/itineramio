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
import { Button } from '../../../../src/components/ui/Button'
import { Card } from '../../../../src/components/ui/Card'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { findPropertyBySlug, createZoneSlug, createPropertySlug } from '../../../../src/lib/slugs'

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

// Helper function to get text from multilingual objects
const getPropertyText = (value: any, fallback: string = '') => {
  if (typeof value === 'string') {
    return value
  }
  if (value && typeof value === 'object') {
    return value.es || value.en || value.fr || fallback
  }
  return fallback
}

export default function PropertyPageWithSlug() {
  const router = useRouter()
  const params = useParams()
  const propertySlug = params.propertySlug as string
  
  const [property, setProperty] = useState<Property | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPropertyData()
  }, [propertySlug])

  const fetchPropertyData = async () => {
    try {
      setLoading(true)
      
      // Fetch all properties to find the one with this slug
      const propertiesResponse = await fetch('/api/properties')
      const propertiesResult = await propertiesResponse.json()
      
      if (!propertiesResult.success) {
        throw new Error('Failed to fetch properties')
      }
      
      // Find property by slug
      const foundProperty = findPropertyBySlug(propertySlug, propertiesResult.data)
      if (!foundProperty) {
        throw new Error('Property not found')
      }
      
      // Fetch detailed property data
      const response = await fetch(`/api/properties/${foundProperty.id}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error loading property')
      }
      
      setProperty(result.data)
      
      // Transform zones to ensure names are strings
      const transformedZones = (result.data.zones || []).map((zone: any) => ({
        ...zone,
        name: getPropertyText(zone.name),
        description: getPropertyText(zone.description)
      }))
      setZones(transformedZones)
    } catch (error) {
      console.error('Error fetching property:', error)
      alert('Error al cargar la propiedad')
      router.push('/properties')
    } finally {
      setLoading(false)
    }
  }

  const handleAddZone = () => {
    if (!property) return
    router.push(`/properties/${property.id}/zones/new`)
  }

  const handleZoneClick = (zone: Zone) => {
    const zoneSlug = createZoneSlug(zone)
    router.push(`/properties/${propertySlug}/${zoneSlug}`)
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
              <h1 className="text-3xl font-bold text-gray-900">{getPropertyText(property.name)}</h1>
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
                  alt={getPropertyText(property.name)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                  <Home className="w-12 h-12 text-white" />
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Location */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Ubicación</p>
                <p className="font-medium text-gray-900 flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                  {getPropertyText(property.city)}, {getPropertyText(property.state)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Capacidad</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-900">
                    <Bed className="w-4 h-4 mr-1 text-gray-400" />
                    {property.bedrooms}
                  </div>
                  <div className="flex items-center text-gray-900">
                    <Bath className="w-4 h-4 mr-1 text-gray-400" />
                    {property.bathrooms}
                  </div>
                  <div className="flex items-center text-gray-900">
                    <Users className="w-4 h-4 mr-1 text-gray-400" />
                    {property.maxGuests}
                  </div>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Zonas ({zones.length})
            </h2>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Vista Previa
            </Button>
          </div>
          
          {zones.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay zonas aún
              </h3>
              <p className="text-gray-600 mb-6">
                Crea zonas para organizar las instrucciones de tu propiedad
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
                  <Card 
                    className="p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    onClick={() => handleZoneClick(zone)}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Zone Icon */}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 ${
                        zone.color || 'bg-gray-100'
                      }`}>
                        {zone.icon || '📁'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{getPropertyText(zone.name)}</h3>
                        <p className="text-sm text-gray-600">
                          {zone.stepsCount || 0} pasos
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleAddZone}
              variant="outline" 
              className="justify-start h-12"
            >
              <Plus className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Nueva Zona</div>
                <div className="text-xs text-gray-500">Organizar instrucciones</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-12"
              onClick={() => alert('Funcionalidad próximamente')}
            >
              <Eye className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Vista Previa</div>
                <div className="text-xs text-gray-500">Ver como huésped</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-12"
              onClick={() => alert('Funcionalidad próximamente')}
            >
              <Settings className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Configurar</div>
                <div className="text-xs text-gray-500">Editar información</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}