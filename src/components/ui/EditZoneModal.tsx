'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import { IconSelector } from './IconSelector'
import { getZoneIcon as getExtendedZoneIcon, getZoneIconByName } from '../../data/zoneIconsExtended'
import { Home } from 'lucide-react'

interface Zone {
  id: string
  name: string | { es: string; en: string; fr: string }
  icon: string
  color?: string
}

interface EditZoneModalProps {
  isOpen: boolean
  onClose: () => void
  zone: Zone | null
  propertyId: string
  onSuccess?: () => void
}

export function EditZoneModal({ isOpen, onClose, zone, propertyId, onSuccess }: EditZoneModalProps) {
  const [saving, setSaving] = useState(false)
  const [showIconSelector, setShowIconSelector] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    icon: ''
  })

  useEffect(() => {
    if (zone) {
      console.log('🔧 Initializing modal with zone:', { name: getZoneText(zone.name), icon: zone.icon })
      setFormData({
        name: getZoneText(zone.name),
        icon: zone.icon || ''
      })
    }
  }, [zone])

  // Helper function to get zone text
  const getZoneText = (value: any, fallback: string = '') => {
    if (typeof value === 'string') {
      return value
    }
    if (value && typeof value === 'object') {
      return value.es || value.en || value.fr || fallback
    }
    return fallback
  }

  // Helper function to get zone icon component
  const getZoneIcon = (emoji: string, zoneName?: string) => {
    const iconFromEmoji = getExtendedZoneIcon(emoji)
    if (iconFromEmoji !== Home) {
      return iconFromEmoji
    }
    
    if (zoneName) {
      return getZoneIconByName(zoneName)
    }
    
    return Home
  }

  const handleSave = async () => {
    if (!zone || !formData.name.trim()) return
    
    try {
      setSaving(true)
      
      console.log('💾 Saving zone with data:', { name: formData.name, icon: formData.icon })
      
      const response = await fetch(`/api/properties/${propertyId}/zones/${zone.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          icon: formData.icon
        })
      })

      if (response.ok) {
        console.log('✅ Zone saved successfully')
        onSuccess?.()
        onClose()
      } else {
        console.error('❌ Error response:', response.status)
        alert('Error al guardar los cambios')
      }
    } catch (error) {
      console.error('Error saving zone:', error)
      alert('Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  const handleIconSelect = (iconId: string) => {
    console.log('🎨 Icon selected:', iconId)
    setFormData(prev => ({ ...prev, icon: iconId }))
    setShowIconSelector(false)
  }

  if (!isOpen || !zone) return null

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
          className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Editar Zona</h2>
                <p className="text-gray-600 mt-1">Modifica el nombre e icono de la zona</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Zone Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la zona *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej. Check In, WiFi, Parking..."
                    className="w-full"
                    autoFocus
                  />
                </div>

                {/* Zone Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icono de la zona
                  </label>
                  <div className="flex items-center space-x-4">
                    <div 
                      className={`w-16 h-16 rounded-xl flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-violet-400 transition-colors ${zone.color || 'bg-gray-100'}`}
                      onClick={() => setShowIconSelector(true)}
                    >
                      {formData.icon ? (
                        (() => {
                          const IconComponent = getZoneIcon(formData.icon, formData.name)
                          return IconComponent ? (
                            <IconComponent className="w-8 h-8 text-gray-700" />
                          ) : (
                            <span className="text-2xl">{formData.icon}</span>
                          )
                        })()
                      ) : (
                        <span className="text-gray-400 text-sm">+</span>
                      )}
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowIconSelector(true)}
                      >
                        Seleccionar Icono
                      </Button>
                      <p className="text-sm text-gray-500 mt-1">
                        Haz clic para elegir un icono
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Vista Previa</h3>
                  <div className="text-center">
                    <div className={`w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center ${zone.color || 'bg-gray-100'}`}>
                      {formData.icon ? (
                        (() => {
                          const IconComponent = getZoneIcon(formData.icon, formData.name)
                          return IconComponent ? (
                            <IconComponent className="w-7 h-7 text-gray-700" />
                          ) : (
                            <span className="text-xl">{formData.icon}</span>
                          )
                        })()
                      ) : (
                        <span className="text-gray-400">?</span>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      {formData.name || 'Nombre de la zona'}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving || !formData.name.trim()}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Icon Selector Modal */}
      {showIconSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Seleccionar Icono</h3>
                <button
                  onClick={() => setShowIconSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              <IconSelector
                selectedIconId={formData.icon}
                onSelect={handleIconSelect}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}