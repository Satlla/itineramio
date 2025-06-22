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
  ArrowRight,
  Share2,
  Copy,
  CheckCircle,
  Home,
  Shield,
  Wifi,
  Car
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '../../../../src/components/ui/Button'
import { Card } from '../../../../src/components/ui/Card'
import { ZoneIconDisplay } from '../../../../src/components/ui/IconSelector'
import { AnimatedLoadingSpinner } from '../../../../src/components/ui/AnimatedLoadingSpinner'

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

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Manual de ${getText(property?.name, 'Propiedad')}`,
          text: 'Manual digital del apartamento',
          url: url
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(url)
      alert('URL copiada al portapapeles')
    }
  }

  if (loading) {
    return <AnimatedLoadingSpinner text="Cargando manual de la propiedad..." type="properties" />
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
              alt={getText(property.name, 'Propiedad')}
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
          
          {/* Header Actions */}
          <div className="absolute top-4 left-4 right-4 flex justify-between">
            <Button 
              onClick={() => router.back()}
              variant="ghost" 
              size="sm"
              className="bg-white bg-opacity-90 text-gray-900 hover:bg-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <Button 
              onClick={handleShare}
              variant="ghost" 
              size="sm"
              className="bg-white bg-opacity-90 text-gray-900 hover:bg-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          </div>
        </div>

        {/* Property Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {getText(property.name, 'Propiedad')}
            </h1>
            <div className="flex items-center text-white text-opacity-90 mb-4">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{getText(property.city, '')}, {getText(property.state, '')}</span>
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
        {/* Property Details Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Sobre tu alojamiento
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {getText(property.description, 'Bienvenido a este hermoso alojamiento. Esperamos que disfrutes tu estancia.')}
              </p>
              
              {/* Property Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Users className="w-6 h-6 mx-auto mb-2 text-violet-600" />
                  <div className="text-sm font-medium text-gray-900">{property.maxGuests}</div>
                  <div className="text-xs text-gray-600">Huéspedes</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Bed className="w-6 h-6 mx-auto mb-2 text-violet-600" />
                  <div className="text-sm font-medium text-gray-900">{property.bedrooms}</div>
                  <div className="text-xs text-gray-600">Habitaciones</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Bath className="w-6 h-6 mx-auto mb-2 text-violet-600" />
                  <div className="text-sm font-medium text-gray-900">{property.bathrooms}</div>
                  <div className="text-xs text-gray-600">Baños</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Home className="w-6 h-6 mx-auto mb-2 text-violet-600" />
                  <div className="text-sm font-medium text-gray-900">{property.type}</div>
                  <div className="text-xs text-gray-600">Tipo</div>
                </div>
              </div>
            </Card>

            {/* Address */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Ubicación
              </h3>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">{property.street}</div>
                  <div className="text-gray-600">{getText(property.city, '')}, {getText(property.state, '')}</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Host Card - Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
                  {property.hostContactPhoto ? (
                    <img 
                      src={property.hostContactPhoto} 
                      alt={property.hostContactName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-violet-100 flex items-center justify-center">
                      <span className="text-violet-600 font-semibold text-2xl">
                        {property.hostContactName.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {property.hostContactName}
                </h3>
                <p className="text-gray-600 text-sm mb-1">
                  Tu anfitrión
                </p>
                <div className="flex items-center justify-center text-yellow-500 mb-4">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-2 text-sm text-gray-600">Superanfitrión</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    const message = encodeURIComponent(`Hola ${property.hostContactName}, soy huésped de ${getText(property.name, 'la propiedad')} y necesito ayuda.`)
                    const phoneNumber = property.hostContactPhone.replace(/\s/g, '').replace('+', '')
                    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contactar por WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(`mailto:${property.hostContactEmail}`, '_blank')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar email
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(`tel:${property.hostContactPhone}`, '_blank')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Llamar
                </Button>
              </div>

              {/* Emergency */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center text-red-600 mb-2">
                  <Shield className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Emergencias 24/7</span>
                </div>
                <a 
                  href={`tel:${property.hostContactPhone}`}
                  className="text-red-600 font-medium hover:text-red-700 text-sm"
                >
                  {property.hostContactPhone}
                </a>
              </div>
            </Card>
          </div>
        </div>


        {/* Manual Sections */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Manual del apartamento
            </h2>
            <div className="text-sm text-gray-600">
              {property.zones.filter(z => z.status === 'ACTIVE').length} secciones disponibles
            </div>
          </div>
          
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
            <div className="space-y-4">
              {property.zones
                .sort((a, b) => a.order - b.order)
                .map((zone, index) => (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card 
                      className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group border-l-4 border-l-violet-500 hover:border-l-violet-600"
                      onClick={() => handleZoneClick(zone.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ZoneIconDisplay iconId={zone.icon} size="sm" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {getText(zone.name, 'Zona')}
                              </h3>
                              {zone.status === 'ACTIVE' ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Disponible
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  En preparación
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {getText(zone.description, '')}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{zone.stepsCount || 0} instrucciones</span>
                              <span className="mx-2">•</span>
                              <span>Zona {index + 1}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              const url = `${window.location.origin}/guide/${propertyId}/${zone.id}`
                              navigator.clipboard.writeText(url)
                              alert('URL de la zona copiada')
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-violet-600 transition-colors" />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-600 text-sm mb-2">
            Manual digital creado con ❤️ para tu comodidad
          </p>
          <p className="text-gray-500 text-xs">
            ¿Tienes alguna sugerencia? Contacta con tu anfitrión
          </p>
        </div>
      </div>
    </div>
  )
}