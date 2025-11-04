'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import { IconSelector } from './IconSelector'
import { PropertySetUpdateModal } from './PropertySetUpdateModal'
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
  const [showPropertySetModal, setShowPropertySetModal] = useState(false)

  // Property set state
  const [propertySetId, setPropertySetId] = useState<string | null>(null)
  const [propertyName, setPropertyName] = useState<string>('')
  const [propertySetProperties, setPropertySetProperties] = useState<Array<{ id: string; name: string }>>([])
  const [loadingPropertySet, setLoadingPropertySet] = useState(false)

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

  // Fetch property set information when modal opens
  useEffect(() => {
    if (isOpen && propertyId) {
      fetchPropertySetInfo()
    }
  }, [isOpen, propertyId])

  const fetchPropertySetInfo = async () => {
    try {
      setLoadingPropertySet(true)

      // Fetch property information
      const propertyResponse = await fetch(`/api/properties/${propertyId}`)
      if (!propertyResponse.ok) {
        console.error('Failed to fetch property info')
        return
      }

      const propertyData = await propertyResponse.json()
      if (!propertyData.success || !propertyData.data) {
        console.error('Invalid property data')
        return
      }

      const property = propertyData.data
      setPropertyName(property.name)

      // Check if property belongs to a property set
      if (property.propertySetId) {
        console.log('🔗 Property belongs to set:', property.propertySetId)
        setPropertySetId(property.propertySetId)

        // Fetch property set data
        const setResponse = await fetch(`/api/property-sets/${property.propertySetId}`)
        if (!setResponse.ok) {
          console.error('Failed to fetch property set info')
          return
        }

        const setData = await setResponse.json()
        if (setData.success && setData.data && setData.data.properties) {
          console.log('🔗 Property set has', setData.data.properties.length, 'properties')
          setPropertySetProperties(
            setData.data.properties.map((p: any) => ({
              id: p.id,
              name: p.name
            }))
          )
        }
      } else {
        console.log('🏠 Property is not in a set')
        setPropertySetId(null)
        setPropertySetProperties([])
      }
    } catch (error) {
      console.error('Error fetching property set info:', error)
    } finally {
      setLoadingPropertySet(false)
    }
  }

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

    console.log('🔍 SAVE DEBUG:', {
      propertySetId,
      propertySetPropertiesLength: propertySetProperties.length,
      propertySetProperties,
      shouldShowModal: propertySetId && propertySetProperties.length > 1
    })

    // If property is in a set and has more than 1 property, show the PropertySetUpdateModal
    if (propertySetId && propertySetProperties.length > 1) {
      console.log('🔗 Property is in a set, showing PropertySetUpdateModal')
      setShowPropertySetModal(true)
    } else {
      console.log('⚠️ Not showing modal. Reason:', {
        noPropertySetId: !propertySetId,
        notEnoughProperties: propertySetProperties.length <= 1
      })
      // Otherwise, save directly
      await performSave('single')
    }
  }

  const handlePropertySetConfirm = async (
    scope: 'single' | 'all' | 'selected',
    selectedPropertyIds?: string[]
  ) => {
    setShowPropertySetModal(false)
    await performSave(scope, selectedPropertyIds)
  }

  const performSave = async (
    scope: 'single' | 'all' | 'selected',
    selectedPropertyIds?: string[]
  ) => {
    if (!zone || !formData.name.trim()) return

    try {
      setSaving(true)

      console.log('💾 Saving zone with data:', {
        name: formData.name,
        icon: formData.icon,
        scope,
        selectedPropertyIds
      })

      const body: any = {
        name: formData.name,
        icon: formData.icon
      }

      // Add property set parameters based on scope
      if (scope === 'all') {
        body.applyToPropertySet = true
      } else if (scope === 'selected' && selectedPropertyIds) {
        body.selectedPropertyIds = selectedPropertyIds
      }

      const response = await fetch(`/api/properties/${propertyId}/zones/${zone.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Zone saved successfully', result.updatedCount ? `(${result.updatedCount} zones updated)` : '')
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
          className="bg-white rounded-xl w-full max-w-[95vw] sm:max-w-[95vw] sm:max-w-[90vw] sm:max-w-[90vw] sm:max-w-sm md:max-w-md md:max-w-lg md:max-w-xl md:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-3 sm:p-4 md:p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl font-bold text-gray-900">Editar Zona</h2>
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
          <div className="p-3 sm:p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:p-4 md:p-6">
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
                            <span className="text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl">{formData.icon}</span>
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
                            <span className="text-base sm:text-lg md:text-xl">{formData.icon}</span>
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
          <div className="bg-gray-50 px-3 sm:px-4 md:px-6 py-4 border-t flex items-center justify-end space-x-3">
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
            className="bg-white rounded-xl w-full max-w-[95vw] sm:max-w-[95vw] sm:max-w-[90vw] sm:max-w-[90vw] sm:max-w-sm md:max-w-md md:max-w-lg md:max-w-xl md:max-w-2xl max-h-[80vh] overflow-hidden"
          >
            <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
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

      {/* Property Set Update Modal */}
      <PropertySetUpdateModal
        isOpen={showPropertySetModal}
        onClose={() => setShowPropertySetModal(false)}
        onConfirm={handlePropertySetConfirm}
        currentPropertyId={propertyId}
        currentPropertyName={propertyName}
        propertySetProperties={propertySetProperties}
      />
    </AnimatePresence>
  )
}