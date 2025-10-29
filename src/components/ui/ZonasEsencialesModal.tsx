'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import { Home, Wifi, LogOut, Phone, X, Sparkles, Trash2, Key, MapPin, List, Car, Thermometer, Bus, Star } from 'lucide-react'

interface ZonasEsencialesModalProps {
  isOpen: boolean
  onClose: () => void
  onKeepZones: () => void
  userName: string
  isLoading?: boolean
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  key: Key,
  wifi: Wifi,
  exit: LogOut,
  'map-pin': MapPin,
  list: List,
  car: Car,
  thermometer: Thermometer,
  phone: Phone,
  bus: Bus,
  star: Star,
  trash: Trash2
}

const zonesInfo = [
  { name: 'Check In', icon: 'key', description: 'Proceso de entrada' },
  { name: 'WiFi', icon: 'wifi', description: 'Conexión a internet' },
  { name: 'Check Out', icon: 'exit', description: 'Proceso de salida' },
  { name: 'Cómo Llegar', icon: 'map-pin', description: 'Direcciones y ubicación' },
  { name: 'Normas de la Casa', icon: 'list', description: 'Reglas y políticas' },
  { name: 'Parking', icon: 'car', description: 'Información de aparcamiento' },
  { name: 'Climatización', icon: 'thermometer', description: 'Aire y calefacción' },
  { name: 'Emergencias', icon: 'phone', description: 'Teléfonos importantes' },
  { name: 'Transporte', icon: 'bus', description: 'Metro y autobuses' },
  { name: 'Recomendaciones', icon: 'star', description: 'Lugares de interés' },
  { name: 'Basura', icon: 'trash', description: 'Reciclaje y residuos' }
]

export function ZonasEsencialesModal({
  isOpen,
  onClose,
  onKeepZones,
  userName,
  isLoading = false
}: ZonasEsencialesModalProps) {
  // Debug logging for mobile
  React.useEffect(() => {
    if (isOpen) {
      console.log('🎭 ZonasEsencialesModal mounted and visible', {
        isOpen,
        userName,
        isLoading,
        viewport: typeof window !== 'undefined' ? {
          width: window.innerWidth,
          height: window.innerHeight,
          userAgent: window.navigator.userAgent
        } : null
      })
    }
  }, [isOpen, userName, isLoading])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
        style={{ 
          // Asegurar que el modal esté visible en todos los dispositivos
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999 
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-6xl lg:max-w-5xl max-h-[95vh] overflow-y-auto my-4"
          style={{
            // Asegurar que el modal funcione en móvil
            minHeight: '300px',
            maxWidth: 'calc(100vw - 2rem)',
            maxHeight: 'calc(100vh - 2rem)',
            margin: '1rem auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-violet-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Hola {userName}! 👋
            </h2>
            <p className="text-gray-600 text-lg">
              Estamos creando tu <strong>manual digital inteligente</strong> con las zonas esenciales que todo huésped necesita
            </p>
          </div>

          {/* Zones Created - Responsive Grid */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">
              🚀 Zonas esenciales que estamos creando:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {zonesInfo.map((zone) => {
                const IconComponent = iconMap[zone.icon]
                return (
                  <div key={zone.name} className="flex items-center space-x-3 p-2 bg-white rounded-lg">
                    <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-4 h-4 text-violet-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-gray-900 truncate">{zone.name}</div>
                      <div className="text-xs text-gray-500 truncate">{zone.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Features Information */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">
              ¿Qué puedes hacer en cada zona?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Content Types */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">📝 Tipos de Contenido</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• <strong>Texto</strong> con instrucciones paso a paso</li>
                  <li>• <strong>Fotos</strong> para mostrar ubicaciones y dispositivos</li>
                  <li>• <strong>Videos</strong> con explicaciones detalladas</li>
                  <li>• <strong>Enlaces externos</strong> a recursos útiles</li>
                </ul>
              </div>
              
              {/* Sharing Options */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">🚀 Funcionalidades</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Códigos QR</strong> únicos para cada zona</li>
                  <li>• <strong>Enlaces públicos</strong> para compartir</li>
                  <li>• <strong>Vista móvil</strong> optimizada para huéspedes</li>
                  <li>• <strong>Traducciones</strong> automáticas disponibles</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Start Info */}
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-violet-800 mb-2">🎯 Pasos siguientes:</h4>
            <div className="text-sm text-violet-700 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-violet-200 text-violet-800 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Completa cada zona con información específica</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-violet-200 text-violet-800 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Activa tu manual cuando esté listo</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-violet-200 text-violet-800 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Comparte con tus huéspedes</span>
              </div>
            </div>
          </div>

          {/* Actions - Single Button */}
          <div className="flex justify-center">
            <Button
              onClick={onKeepZones}
              disabled={isLoading}
              className="w-full max-w-md bg-violet-600 hover:bg-violet-700 h-12 text-lg font-semibold"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creando zonas esenciales...
                </>
              ) : (
                <>✨ ¡Perfecto! Empezar con mi manual</>
              )}
            </Button>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}