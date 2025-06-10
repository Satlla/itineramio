'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, QrCode, MoreVertical, MapPin, Copy, Share2, ExternalLink, Eye, X, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { IconSelector, ZoneIconDisplay, useZoneIcon } from '@/components/ui/IconSelector'
import { Input } from '@/components/ui/Input'
import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay'
import { ZoneTemplateSelector } from '@/components/ui/ZoneTemplateSelector'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { ZONE_CATEGORIES, ZoneTemplate } from '../../../../../lib/zoneCategories'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface Zone {
  id: string
  name: string
  description?: string
  iconId: string
  order: number
  stepsCount: number
  qrUrl: string
  lastUpdated: string
}

// Mock data - esto será reemplazado por datos reales del API
const mockZones: Zone[] = [
  {
    id: '1',
    name: 'Entrada Principal',
    description: 'Puerta de acceso y códigos de entrada',
    iconId: 'door',
    order: 1,
    stepsCount: 3,
    qrUrl: 'https://manualphi.com/z/abc123',
    lastUpdated: '2024-01-15'
  },
  {
    id: '2',
    name: 'Cocina',
    description: 'Electrodomésticos y utensilios de cocina',
    iconId: 'kitchen-main',
    order: 2,
    stepsCount: 5,
    qrUrl: 'https://manualphi.com/z/def456',
    lastUpdated: '2024-01-14'
  },
  {
    id: '3',
    name: 'Lavadora',
    description: 'Instrucciones de uso de la lavadora',
    iconId: 'washing',
    order: 3,
    stepsCount: 4,
    qrUrl: 'https://manualphi.com/z/ghi789',
    lastUpdated: '2024-01-13'
  },
  {
    id: '4',
    name: 'Aire Acondicionado',
    description: 'Control de temperatura y climatización',
    iconId: 'wind',
    order: 4,
    stepsCount: 6,
    qrUrl: 'https://manualphi.com/z/jkl012',
    lastUpdated: '2024-01-12'
  }
]

export default async function PropertyZonesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const router = useRouter()
  const [zones, setZones] = useState<Zone[]>(mockZones)
  const [propertyName, setPropertyName] = useState<string>('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingZone, setEditingZone] = useState<Zone | null>(null)
  const [showIconSelector, setShowIconSelector] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedZoneForQR, setSelectedZoneForQR] = useState<Zone | null>(null)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showInspirationModal, setShowInspirationModal] = useState(false)
  const [selectedInspirationZone, setSelectedInspirationZone] = useState<ZoneTemplate | null>(null)
  const [showMultiSelectModal, setShowMultiSelectModal] = useState(false)
  const [selectedZones, setSelectedZones] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconId: ''
  })

  // Essential and recommended zones
  const essentialZones = ['wifi', 'checkin', 'checkout', 'parking']
  const recommendedZones = ['kitchen', 'bathroom', 'bedroom', 'ac']
  
  // Get zones that the user doesn't have
  const getMissingZones = () => {
    const existingZoneNames = zones.map(z => z.name.toLowerCase())
    const allRecommendedZones = [...essentialZones, ...recommendedZones]
    
    return allRecommendedZones
      .map(zoneId => {
        for (const category of ZONE_CATEGORIES) {
          const zone = category.zones.find(z => z.id === zoneId)
          if (zone) return zone
        }
        return null
      })
      .filter(zone => zone && !existingZoneNames.includes(zone.name.toLowerCase()))
      .filter(Boolean) as ZoneTemplate[]
  }

  // Fetch property name
  useEffect(() => {
    const fetchPropertyName = async () => {
      try {
        const response = await fetch(`/api/properties/${id}`)
        const result = await response.json()
        if (result.success && result.data) {
          setPropertyName(result.data.name)
        }
      } catch (error) {
        console.error('Error fetching property:', error)
      }
    }

    fetchPropertyName()
  }, [id])

  const handleCreateZone = () => {
    if (!formData.name || !formData.iconId) return

    const newZone: Zone = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      iconId: formData.iconId,
      order: zones.length + 1,
      stepsCount: 0,
      qrUrl: `https://manualphi.com/z/${Math.random().toString(36).substr(2, 6)}`,
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    setZones([...zones, newZone])
    setFormData({ name: '', description: '', iconId: '' })
    setShowCreateForm(false)
    setShowIconSelector(false)
  }

  const handleEditZone = (zone: Zone) => {
    setEditingZone(zone)
    setFormData({
      name: zone.name,
      description: zone.description || '',
      iconId: zone.iconId
    })
    setShowCreateForm(true)
  }

  const handleUpdateZone = () => {
    if (!editingZone || !formData.name || !formData.iconId) return

    setZones(zones.map(zone => 
      zone.id === editingZone.id 
        ? {
            ...zone,
            name: formData.name,
            description: formData.description,
            iconId: formData.iconId,
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        : zone
    ))

    setEditingZone(null)
    setFormData({ name: '', description: '', iconId: '' })
    setShowCreateForm(false)
    setShowIconSelector(false)
  }

  const handleDeleteZone = (zoneId: string) => {
    setZones(zones.filter(zone => zone.id !== zoneId))
  }

  const handleShowQR = (zone: Zone) => {
    setSelectedZoneForQR(zone)
    setShowQRModal(true)
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', iconId: '' })
    setEditingZone(null)
    setShowCreateForm(false)
    setShowIconSelector(false)
  }

  const handleApplyTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          propertyId: id
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Refresh zones data
        // In a real app, you would fetch zones from the API
        // For now, we'll simulate adding a new zone
        const newZone: Zone = {
          id: result.data.zoneId,
          name: 'Nueva Zona desde Plantilla',
          description: 'Zona creada desde plantilla',
          iconId: 'template',
          order: zones.length + 1,
          stepsCount: 5, // This would come from the API
          qrUrl: `https://manualphi.com/z/${Math.random().toString(36).substr(2, 6)}`,
          lastUpdated: new Date().toISOString().split('T')[0]
        }
        
        setZones([...zones, newZone])
        setShowTemplateSelector(false)
        
        // Navigate to the new zone
        router.push(`/properties/${id}/zones/${result.data.zoneId}/steps`)
      } else {
        console.error('Error applying template:', result.error)
      }
    } catch (error) {
      console.error('Error applying template:', error)
    }
  }

  const handleViewInspirationExample = (zone: ZoneTemplate) => {
    setSelectedInspirationZone(zone)
    setShowInspirationModal(true)
  }

  const handleUseTemplate = async (zoneTemplate: ZoneTemplate) => {
    // Create zone with template data
    const newZone: Zone = {
      id: Date.now().toString(),
      name: zoneTemplate.name,
      description: zoneTemplate.description,
      iconId: zoneTemplate.iconId,
      order: zones.length + 1,
      stepsCount: zoneTemplate.elements?.reduce((acc, el) => acc + el.steps.length, 0) || 3,
      qrUrl: `https://manualphi.com/z/${Math.random().toString(36).substr(2, 6)}`,
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    setZones([...zones, newZone])
    setShowInspirationModal(false)
    setSelectedInspirationZone(null)
  }

  const handleOpenMultiSelect = () => {
    setShowMultiSelectModal(true)
    setSelectedZones([])
  }

  const toggleZoneSelection = (zoneId: string) => {
    setSelectedZones(prev => 
      prev.includes(zoneId) 
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    )
  }

  const handleCreateMultipleZones = () => {
    const newZones = selectedZones.map(zoneId => {
      const zoneTemplate = ZONE_CATEGORIES
        .flatMap(cat => cat.zones)
        .find(z => z.id === zoneId)
      
      if (zoneTemplate) {
        return {
          id: `${Date.now()}-${zoneId}`,
          name: zoneTemplate.name,
          description: zoneTemplate.description,
          iconId: zoneTemplate.iconId,
          order: zones.length + selectedZones.indexOf(zoneId) + 1,
          stepsCount: zoneTemplate.elements?.reduce((acc, el) => acc + el.steps.length, 0) || 3,
          qrUrl: `https://manualphi.com/z/${Math.random().toString(36).substr(2, 6)}`,
          lastUpdated: new Date().toISOString().split('T')[0]
        }
      }
      return null
    }).filter(Boolean) as Zone[]

    setZones([...zones, ...newZones])
    setShowMultiSelectModal(false)
    setSelectedZones([])
  }

  const handleCopyURL = async (zone: Zone) => {
    const url = `${window.location.origin}/guide/${id}/${zone.id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const handleDeleteProperty = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar esta propiedad? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`/api/properties/${id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          router.push('/properties')
        } else {
          alert('Error al eliminar la propiedad')
        }
      } catch (error) {
        console.error('Error deleting property:', error)
        alert('Error al eliminar la propiedad')
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Zonas de {propertyName || 'la Propiedad'}
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona las diferentes zonas y sus códigos QR para facilitar la experiencia de tus huéspedes
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleDeleteProperty}
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Eliminar Propiedad
          </Button>
          <Button
            onClick={handleOpenMultiSelect}
            className="bg-violet-600 hover:bg-violet-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Añadir Zonas
          </Button>
          <Button
            onClick={() => setShowCreateForm(true)}
            variant="outline"
            className="border-violet-200 text-violet-700 hover:bg-violet-50"
          >
            <Plus className="w-5 h-5 mr-2" />
            Crear desde cero
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-violet-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Zonas</p>
                <p className="text-2xl font-bold text-gray-900">{zones.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <QrCode className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">QR Codes</p>
                <p className="text-2xl font-bold text-gray-900">{zones.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Edit className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Steps</p>
                <p className="text-2xl font-bold text-gray-900">
                  {zones.reduce((acc, zone) => acc + zone.stepsCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-orange-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Última Act.</p>
                <p className="text-lg font-semibold text-gray-900">Hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Layout */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Left Section - Zones (3/4 width) */}
        <div className="lg:col-span-3 space-y-4">
          <AnimatePresence>
            {zones.map((zone) => (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      {/* Left Section - Zone Info (Compact) */}
                      <div className="flex items-center space-x-4 flex-1">
                        <ZoneIconDisplay iconId={zone.iconId} size="md" />
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{zone.name}</h3>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Edit className="w-3 h-3 mr-1 text-gray-400" />
                              <span className="font-medium">{zone.stepsCount}</span>
                              <span className="ml-1">steps</span>
                            </div>
                            
                            <div className="flex items-center">
                              <span className="text-gray-500">Actualizado:</span>
                              <span className="ml-1 font-medium">{zone.lastUpdated}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Menu */}
                      <div className="flex items-center ml-4">
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content className="w-48 bg-white rounded-md border shadow-lg p-1 z-50">
                              <DropdownMenu.Item
                                className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                                onSelect={() => handleEditZone(zone)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar Zona
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                                onSelect={() => router.push(`/properties/${id}/zones/${zone.id}/steps`)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar Instrucciones
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                                onSelect={() => handleCopyURL(zone)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copiar URL
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                                onSelect={() => handleShowQR(zone)}
                              >
                                <QrCode className="h-4 w-4 mr-2" />
                                Ver Código QR
                              </DropdownMenu.Item>
                              <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
                              <DropdownMenu.Item
                                className="flex items-center px-3 py-2 text-sm hover:bg-red-100 text-red-600 rounded cursor-pointer"
                                onSelect={() => handleDeleteZone(zone.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Right Section - Inspiration Block (1/4 width) */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <div className="w-6 h-6 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs">💡</span>
                </div>
                Inspiración
              </CardTitle>
              <p className="text-sm text-gray-600">
                Zonas recomendadas que podrías añadir
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0 max-h-96 overflow-y-auto">
                {getMissingZones().slice(0, 6).map((zone) => (
                  <div
                    key={zone.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <ZoneIconDisplay iconId={zone.iconId} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {zone.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {essentialZones.includes(zone.id) ? 'Imprescindible' : 'Recomendada'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-violet-50"
                        onClick={() => handleViewInspirationExample(zone)}
                        title="Ver ejemplo"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-green-50"
                        onClick={() => handleUseTemplate(zone)}
                        title="Usar plantilla"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {getMissingZones().length > 6 && (
                <div className="p-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={handleOpenMultiSelect}
                  >
                    Ver todas ({getMissingZones().length})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold mb-4">
                {editingZone ? 'Editar Zona' : 'Nueva Zona'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la zona
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Cocina, Baño, Entrada..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción (opcional)
                  </label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Breve descripción de la zona"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icono
                  </label>
                  <div className="flex items-center space-x-3">
                    <ZoneIconDisplay iconId={formData.iconId} size="md" />
                    <Button
                      variant="outline"
                      onClick={() => setShowIconSelector(true)}
                      className="flex-1"
                    >
                      {formData.iconId ? 'Cambiar Icono' : 'Seleccionar Icono'}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={editingZone ? handleUpdateZone : handleCreateZone}
                  disabled={!formData.name || !formData.iconId}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  {editingZone ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon Selector Modal */}
      <AnimatePresence>
        {showIconSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <IconSelector
                selectedIconId={formData.iconId}
                onSelect={(iconId) => {
                  setFormData({ ...formData, iconId })
                  setShowIconSelector(false)
                }}
                onClose={() => setShowIconSelector(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && selectedZoneForQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg w-full max-w-md"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">QR Code - {selectedZoneForQR.name}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowQRModal(false)
                      setSelectedZoneForQR(null)
                    }}
                  >
                    ✕
                  </Button>
                </div>
              </div>
              
              <div className="p-4">
                <QRCodeDisplay
                  propertyId={id}
                  zoneId={selectedZoneForQR.id}
                  zoneName={selectedZoneForQR.name}
                  size="lg"
                  showTitle={false}
                />
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    Los huéspedes pueden escanear este código QR para acceder a las instrucciones de esta zona.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Selector Modal */}
      <AnimatePresence>
        {showTemplateSelector && (
          <ZoneTemplateSelector
            propertyId={id}
            onSelect={handleApplyTemplate}
            onClose={() => setShowTemplateSelector(false)}
            onCreateFromScratch={() => {
              setShowTemplateSelector(false)
              setShowCreateForm(true)
            }}
          />
        )}
      </AnimatePresence>

      {/* Inspiration Modal */}
      <AnimatePresence>
        {showInspirationModal && selectedInspirationZone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ZoneIconDisplay iconId={selectedInspirationZone.iconId} size="md" />
                    <div>
                      <h3 className="text-xl font-semibold">{selectedInspirationZone.name}</h3>
                      <p className="text-gray-600">{selectedInspirationZone.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowInspirationModal(false)
                      setSelectedInspirationZone(null)
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-96">
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">📚 Ejemplo de otros usuarios</h4>
                    <p className="text-sm text-blue-800">
                      Así han configurado otros hosts la zona "{selectedInspirationZone.name}":
                    </p>
                  </div>
                  
                  {selectedInspirationZone.elements?.slice(0, 2).map((element, index) => (
                    <div key={element.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <ZoneIconDisplay iconId={element.iconId} size="sm" />
                        <h5 className="font-medium">{element.name}</h5>
                      </div>
                      <div className="space-y-2">
                        {element.steps.slice(0, 3).map((step, stepIndex) => (
                          <div key={stepIndex} className="text-sm">
                            <span className="font-medium text-gray-900">{stepIndex + 1}. {step.title}</span>
                            {step.description && (
                              <p className="text-gray-600 ml-4">{step.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <p>Plantilla básica disponible para esta zona</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowInspirationModal(false)
                      setSelectedInspirationZone(null)
                    }}
                  >
                    Cerrar
                  </Button>
                  <Button
                    onClick={() => handleUseTemplate(selectedInspirationZone)}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Utilizar Plantilla
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multi-Select Modal */}
      <AnimatePresence>
        {showMultiSelectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Añadir Zonas Múltiples</h3>
                    <p className="text-gray-600">Selecciona las zonas que quieres añadir a tu propiedad</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMultiSelectModal(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-96">
                <div className="space-y-6">
                  {/* Essential Zones */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Imprescindibles
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {getMissingZones().filter(zone => essentialZones.includes(zone.id)).map((zone) => (
                        <div
                          key={zone.id}
                          className={cn(
                            "flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-colors",
                            selectedZones.includes(zone.id)
                              ? "border-violet-500 bg-violet-50"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                          onClick={() => toggleZoneSelection(zone.id)}
                        >
                          <div className="flex items-center space-x-2 flex-1">
                            <ZoneIconDisplay iconId={zone.iconId} size="sm" />
                            <div>
                              <p className="font-medium text-sm">{zone.name}</p>
                              <p className="text-xs text-gray-600">{zone.description}</p>
                            </div>
                          </div>
                          {selectedZones.includes(zone.id) && (
                            <CheckCircle className="w-5 h-5 text-violet-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Zones */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      Recomendadas
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {getMissingZones().filter(zone => recommendedZones.includes(zone.id)).map((zone) => (
                        <div
                          key={zone.id}
                          className={cn(
                            "flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-colors",
                            selectedZones.includes(zone.id)
                              ? "border-violet-500 bg-violet-50"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                          onClick={() => toggleZoneSelection(zone.id)}
                        >
                          <div className="flex items-center space-x-2 flex-1">
                            <ZoneIconDisplay iconId={zone.iconId} size="sm" />
                            <div>
                              <p className="font-medium text-sm">{zone.name}</p>
                              <p className="text-xs text-gray-600">{zone.description}</p>
                            </div>
                          </div>
                          {selectedZones.includes(zone.id) && (
                            <CheckCircle className="w-5 h-5 text-violet-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {selectedZones.length} zona{selectedZones.length !== 1 ? 's' : ''} seleccionada{selectedZones.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowMultiSelectModal(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCreateMultipleZones}
                      disabled={selectedZones.length === 0}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Añadir {selectedZones.length} Zona{selectedZones.length !== 1 ? 's' : ''}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}