'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import { Home, Wifi, LogOut, Phone, X, Sparkles, Trash2, Key, MapPin, List, Car, Thermometer, Bus, Star } from 'lucide-react'

interface ZonasEsencialesModalProps {
  isOpen: boolean
  onClose: () => void
  onKeepZones: () => void
  onDeleteZones: () => void
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
  onDeleteZones,
  userName,
  isLoading = false
}: ZonasEsencialesModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl p-6 w-full max-w-6xl lg:max-w-5xl max-h-[95vh] overflow-y-auto my-4"
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
            <p className="text-gray-600">
              Te sugerimos utilizar nuestra <strong>plantilla de zonas esenciales</strong> para completar tu manual digital
            </p>
          </div>

          {/* Zones Created - Responsive Grid */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">
              Zonas que se crearán para ti:
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

          {/* Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>💡 Estas zonas están vacías</strong> - solo tienes que completarlas con la información específica de tu apartamento.
            </p>
          </div>

          {/* Actions - Responsive Layout */}
          <div className="flex flex-col md:flex-row gap-3">
            <Button
              onClick={onKeepZones}
              disabled={isLoading}
              className="flex-1 bg-violet-600 hover:bg-violet-700 h-12"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creando tu manual...
                </>
              ) : (
                <>✨ ¡Sí! Crear mi manual con plantilla</>
              )}
            </Button>
            
            <Button
              onClick={onDeleteZones}
              disabled={isLoading}
              variant="outline"
              className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 h-12"
            >
              No gracias, prefiero crear todo yo
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