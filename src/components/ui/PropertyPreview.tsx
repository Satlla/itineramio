'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  MapPin, 
  Home, 
  Users, 
  Bed, 
  Bath, 
  Square,
  Phone,
  Mail,
  MessageCircle,
  Star,
  Shield
} from 'lucide-react'
import { Button } from './Button'

interface PropertyPreviewProps {
  isOpen: boolean
  onClose: () => void
  propertyData: {
    name?: string
    description?: string
    type?: string
    street?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
    bedrooms?: number
    bathrooms?: number
    maxGuests?: number
    squareMeters?: number
    profileImage?: string
    hostContactName?: string
    hostContactPhone?: string
    hostContactEmail?: string
    hostContactPhoto?: string
  }
}

const propertyTypeLabels = {
  APARTMENT: 'Apartamento',
  HOUSE: 'Casa',
  ROOM: 'Habitación',
  VILLA: 'Villa'
}

export function PropertyPreview({ isOpen, onClose, propertyData }: PropertyPreviewProps) {
  const {
    name = 'Sin nombre',
    description = 'Sin descripción',
    type = 'APARTMENT',
    street = '',
    city = '',
    state = '',
    country = '',
    postalCode = '',
    bedrooms = 0,
    bathrooms = 0,
    maxGuests = 0,
    squareMeters,
    profileImage,
    hostContactName = 'Anfitrión',
    hostContactPhone = '',
    hostContactEmail = '',
    hostContactPhoto
  } = propertyData

  const fullAddress = [street, city, state, country, postalCode].filter(Boolean).join(', ')

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 pr-10">
                  Vista Previa de la Propiedad
                </h2>
                <p className="text-gray-600 mt-1">
                  Así es como verán tu propiedad los huéspedes
                </p>
                
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Property Card Preview */}
              <div className="p-6">
                <div className="bg-gray-50 rounded-xl p-6 max-w-2xl mx-auto">
                  {/* Property Image */}
                  <div className="h-64 rounded-xl overflow-hidden mb-6 relative">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                        <Home className="w-16 h-16 text-white opacity-80" />
                      </div>
                    )}
                    
                    {/* Property Type Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-900">
                        {propertyTypeLabels[type as keyof typeof propertyTypeLabels]}
                      </span>
                    </div>
                    
                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-gray-900">4.9</span>
                      </div>
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="space-y-4">
                    {/* Title and Location */}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {name}
                      </h3>
                      {fullAddress && (
                        <div className="flex items-center text-gray-600 mb-3">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">{fullAddress}</span>
                        </div>
                      )}
                    </div>

                    {/* Property Details */}
                    <div className="flex items-center space-x-6 py-3 border-y border-gray-200">
                      <div className="flex items-center space-x-2">
                        <Bed className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {bedrooms} {bedrooms === 1 ? 'habitación' : 'habitaciones'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Bath className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {bathrooms} {bathrooms === 1 ? 'baño' : 'baños'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {maxGuests} {maxGuests === 1 ? 'huésped' : 'huéspedes'}
                        </span>
                      </div>
                      {squareMeters && (
                        <div className="flex items-center space-x-2">
                          <Square className="w-5 h-5 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {squareMeters} m²
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Descripción</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {description}
                      </p>
                    </div>

                    {/* Host Info */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Tu Anfitrión</h4>
                      <div className="flex items-center space-x-4">
                        {/* Host Photo */}
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                          {hostContactPhoto ? (
                            <img 
                              src={hostContactPhoto} 
                              alt={hostContactName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {hostContactName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Host Details */}
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{hostContactName}</h5>
                          <div className="flex items-center space-x-2 mt-1">
                            <Shield className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-gray-500">Anfitrión verificado</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Contact Actions */}
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center justify-center"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex items-center justify-center bg-green-600 hover:bg-green-700"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          WhatsApp
                        </Button>
                      </div>
                    </div>

                    {/* Manual Access */}
                    <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
                      <h4 className="font-semibold text-violet-900 mb-2">Manual Digital</h4>
                      <p className="text-violet-700 text-sm mb-3">
                        Escanea el código QR para acceder al manual de la propiedad con todas las instrucciones.
                      </p>
                      <div className="flex items-center justify-center h-32 bg-white rounded-lg border-2 border-dashed border-violet-300">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-violet-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <span className="text-2xl">📱</span>
                          </div>
                          <p className="text-sm text-violet-600 font-medium">Código QR</p>
                          <p className="text-xs text-violet-500">Se generará después de crear la propiedad</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Esta es una vista previa de cómo se verá tu propiedad
                  </p>
                  <Button onClick={onClose}>
                    Cerrar Vista Previa
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}