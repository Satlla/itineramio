'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '../../../../../../../src/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../../src/components/ui/Card'
import { Input } from '../../../../../../../src/components/ui/Input'
import { IconSelector, ZoneIconDisplay } from '../../../../../../../src/components/ui/IconSelector'
import { AnimatedLoadingSpinner } from '../../../../../../../src/components/ui/AnimatedLoadingSpinner'
import { resolveProperty, resolveZone } from '../../../../../../../src/lib/slug-resolver'
import { getZoneIcon as getExtendedZoneIcon, getZoneIconByName } from '../../../../../../../src/data/zoneIconsExtended'
import { Home } from 'lucide-react'

interface Zone {
  id: string
  name: string | { es: string; en: string; fr: string }
  description: string | { es: string; en: string; fr: string }
  icon: string
  color: string
  order: number
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  propertyId: string
  createdAt: string
  updatedAt: string
}

export default function EditZonePage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  const zoneId = params.zoneId as string
  
  const [zone, setZone] = useState<Zone | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showIconSelector, setShowIconSelector] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: 'bg-gray-100',
    status: 'ACTIVE' as Zone['status']
  })

  useEffect(() => {
    fetchZoneData()
  }, [propertyId, zoneId])

  const fetchZoneData = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching zone data for:', { propertyId, zoneId })
      
      // Use the slug resolver to get the zone
      const resolvedZone = await resolveZone(propertyId, zoneId)
      
      if (resolvedZone) {
        setZone(resolvedZone)
        setFormData({
          name: getZoneText(resolvedZone.name),
          description: getZoneText(resolvedZone.description),
          icon: resolvedZone.icon || '',
          color: resolvedZone.color || 'bg-gray-100',
          status: resolvedZone.status || 'ACTIVE'
        })
      } else {
        console.error('Zone not found')
      }
    } catch (error) {
      console.error('Error fetching zone:', error)
    } finally {
      setLoading(false)
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
    
    try {
      setSaving(true)
      
      const response = await fetch(`/api/properties/${propertyId}/zones/${zoneId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          color: formData.color,
          status: formData.status
        })
      })

      if (response.ok) {
        router.push(`/properties/${propertyId}/zones/${zoneId}`)
      } else {
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
    setFormData(prev => ({ ...prev, icon: iconId }))
    setShowIconSelector(false)
  }

  if (loading) {
    return <AnimatedLoadingSpinner text="Cargando zona..." type="zones" />
  }

  if (!zone) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Zona no encontrada</h2>
          <Link href={`/properties/${propertyId}/zones`}>
            <Button variant="outline">Volver a zonas</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/properties/${propertyId}/zones/${zoneId}`}>
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Editar Zona</h1>
                <p className="text-gray-600">Modifica la información de la zona</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link href={`/properties/${propertyId}/zones/${zoneId}`}>
                <Button variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </Link>
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
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
                  />
                </div>

                {/* Zone Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Breve descripción de qué incluye esta zona..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none h-20"
                  />
                </div>

                {/* Zone Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icono de la zona
                  </label>
                  <div className="flex items-center space-x-4">
                    <div 
                      className={`w-16 h-16 rounded-xl flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-violet-400 transition-colors ${formData.color}`}
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

                {/* Zone Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado de la zona
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Zone['status'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="ACTIVE">Activa</option>
                    <option value="DRAFT">Borrador</option>
                    <option value="ARCHIVED">Archivada</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center ${formData.color}`}>
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
                      <span className="text-gray-400">?</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {formData.name || 'Nombre de la zona'}
                  </h3>
                  {formData.description && (
                    <p className="text-sm text-gray-600">
                      {formData.description}
                    </p>
                  )}
                  <div className="mt-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      formData.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800'
                        : formData.status === 'DRAFT'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {formData.status === 'ACTIVE' ? 'Activa' : formData.status === 'DRAFT' ? 'Borrador' : 'Archivada'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Icon Selector Modal */}
      {showIconSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                selectedIcon={formData.icon}
                onIconSelect={handleIconSelect}
                showPreview={false}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}