'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import { Home, Wifi, LogOut, Phone, X, Sparkles, Trash2 } from 'lucide-react'

interface ZonasEsencialesModalProps {
  isOpen: boolean
  onClose: () => void
  onKeepZones: () => void
  onDeleteZones: () => void
  userName: string
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  key: Home,
  wifi: Wifi,
  logout: LogOut,
  phone: Phone
}

const zonesInfo = [
  { name: 'Check In', icon: 'key', description: 'Acceso y entrada' },
  { name: 'WiFi', icon: 'wifi', description: 'Conexión a internet' },
  { name: 'Check Out', icon: 'logout', description: 'Proceso de salida' },
  { name: 'Contacto', icon: 'phone', description: 'Información de contacto' }
]

export function ZonasEsencialesModal({
  isOpen,
  onClose,
  onKeepZones,
  onDeleteZones,
  userName
}: ZonasEsencialesModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl p-6 max-w-md w-full"
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
              Hemos creado <strong>4 zonas esenciales</strong> que todos los apartamentos necesitan
            </p>
          </div>

          {/* Zones Created */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 text-center">
              Zonas creadas para ti:
            </h3>
            <div className="space-y-3">
              {zonesInfo.map((zone) => {
                const IconComponent = iconMap[zone.icon]
                return (
                  <div key={zone.name} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-violet-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{zone.name}</div>
                      <div className="text-xs text-gray-500">{zone.description}</div>
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

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={onKeepZones}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              ✨ Perfecto, las completo yo
            </Button>
            
            <Button
              onClick={onDeleteZones}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Prefiero empezar de cero
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