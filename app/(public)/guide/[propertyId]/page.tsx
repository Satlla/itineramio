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
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '../../../../src/components/ui/Button'
import { Card } from '../../../../src/components/ui/Card'

interface Property {
  id: string
  name: string
  description: string
  type: string
  city: string
  state: string
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
  name: string
  description: string
  icon: string
  color?: string
  order: number
  stepsCount?: number
  status: string
}

export default function PropertyGuidePage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.propertyId as string
  
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPropertyData()
  }, [propertyId])

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

  const handleZoneClick = (zoneId: string) => {
    router.push(`/guide/${propertyId}/${zoneId}`)
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
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Manual no encontrado</h2>
          <p className="text-gray-600 mb-6">
            No pudimos encontrar el manual de esta propiedad. Es posible que el enlace sea incorrecto.
          </p>
          <Button onClick={() => router.back()} variant="outline">
            Volver
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
              alt={property.name}
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
          
          {/* Back Button */}
          <div className="absolute top-4 left-4">
            <Button 
              onClick={() => router.back()}
              variant="ghost" 
              size="sm"
              className="bg-white bg-opacity-90 text-gray-900 hover:bg-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>

        {/* Property Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {property.name}
            </h1>
            <div className="flex items-center text-white text-opacity-90 mb-4">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{property.city}, {property.state}</span>
            </div>
            <div className="flex items-center space-x-6 text-white text-opacity-90">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{property.maxGuests} huéspedes</span>
              </div>
              <div className="flex items-center">
                <Bed className="w-4 h-4 mr-1" />
                <span>{property.bedrooms} habitaciones</span>
              </div>
              <div className="flex items-center">
                <Bath className="w-4 h-4 mr-1" />
                <span>{property.bathrooms} baños</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <Card className="p-6 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Bienvenido a tu alojamiento!
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {property.description}
            </p>
          </div>
        </Card>

        {/* Host Contact */}
        <Card className="p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
              {property.hostContactPhoto ? (
                <img 
                  src={property.hostContactPhoto} 
                  alt={property.hostContactName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-violet-100 flex items-center justify-center">
                  <span className="text-violet-600 font-semibold text-lg">
                    {property.hostContactName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Tu anfitrión: {property.hostContactName}
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                ¿Necesitas ayuda? No dudes en contactarme
              </p>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const message = encodeURIComponent(`Hola ${property.hostContactName}, soy huésped de ${property.name} y necesito ayuda.`)
                    const phoneNumber = property.hostContactPhone.replace(/\s/g, '').replace('+', '')
                    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
                  }}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Zones Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Manual por zonas
          </h2>
          
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {property.zones
                .sort((a, b) => a.order - b.order)
                .map((zone, index) => (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card 
                      className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                      onClick={() => handleZoneClick(zone.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                          zone.color || 'bg-gray-100'
                        }`}>
                          {zone.icon || '📁'}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 transition-colors" />
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {zone.name}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {zone.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{zone.stepsCount} pasos</span>
                        </div>
                        <div className="flex items-center">
                          {zone.status === 'ACTIVE' ? (
                            <span className="text-green-600 font-medium flex items-center">
                              ✓ Disponible
                            </span>
                          ) : (
                            <span className="text-gray-400">
                              En preparación
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
            </div>
          )}
        </div>

        {/* Emergency Contact */}
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Contacto de emergencia
              </h3>
              <p className="text-red-800 text-sm mb-3">
                Para urgencias fuera del horario normal de atención
              </p>
              <div className="flex items-center space-x-3">
                <a 
                  href={`tel:${property.hostContactPhone}`}
                  className="text-red-700 font-medium hover:text-red-800"
                >
                  {property.hostContactPhone}
                </a>
                <span className="text-red-600">•</span>
                <span className="text-red-700 text-sm">24/7 disponible</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}