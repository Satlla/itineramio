'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, QrCode, MoreVertical, MapPin, Copy, Share2, ExternalLink, Eye, X, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { IconSelector, ZoneIconDisplay, useZoneIcon } from '@/components/ui/IconSelector'
import { Input } from '@/components/ui/Input'
import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay'
import { ZoneTemplateSelector } from '@/components/ui/ZoneTemplateSelectorNew'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { zoneTemplates, zoneCategories, ZoneTemplate } from '@/data/zoneTemplates'
import { ZoneIcon } from '@/data/zoneIconsNew'
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

// Remove mock data - now using real API data

export default function PropertyZonesPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('')
  const router = useRouter()
  const [zones, setZones] = useState<Zone[]>([])
  const [propertyName, setPropertyName] = useState<string>('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingZone, setEditingZone] = useState<Zone | null>(null)
  const [showIconSelector, setShowIconSelector] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedZoneForQR, setSelectedZoneForQR] = useState<Zone | null>(null)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showInspirationModal, setShowInspirationModal] = useState(false)
  const [selectedInspirationZone, setSelectedInspirationZone] = useState<ZoneTemplate | null>(null)
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconId: ''
  })

  // Unwrap params Promise
  useEffect(() => {
    params.then(({ id: paramId }) => {
      setId(paramId)
    })
  }, [params])

  // Get zone-specific help text
  const getZoneHelpText = (zoneName: string): string => {
    const helpTexts: Record<string, string> = {
      'check-in': 'Indica a tus huéspedes cómo entrar a tu alojamiento, código de seguridad, pasos para entrar, códigos...',
      'check-out': 'Da instrucciones concretas de cómo abandonar el alojamiento. ¿Dónde dejan las llaves? ¿Tienen que avisarte?',
      'wifi': 'Comparte la contraseña del WiFi y explica cómo conectarse. Incluye el nombre de la red.',
      'parking': 'Explica dónde pueden aparcar, si necesitan código de acceso, horarios permitidos...',
      'cocina': 'Detalla cómo usar los electrodomésticos principales: horno, vitrocerámica, lavavajillas...',
      'lavadora': 'Instrucciones paso a paso para usar la lavadora. ¿Dónde está el detergente?',
      'aire acondicionado': 'Cómo encender/apagar, ajustar temperatura, usar el mando a distancia...',
      'calefacción': 'Explica el sistema de calefacción: termostato, radiadores, horarios...',
      'basura y reciclaje': '¿Dónde están los contenedores? ¿Qué días pasa la basura? ¿Cómo reciclar?',
      'normas de la casa': 'Horarios de silencio, política de mascotas, número máximo de huéspedes...'
    }
    
    return helpTexts[zoneName.toLowerCase()] || 'Añade instrucciones detalladas para ayudar a tus huéspedes.'
  }

  // Get zones that the user doesn't have and existing zones
  const getMissingZones = () => {
    const existingZoneNames = zones.map(z => z.name.toLowerCase())
    
    // Get top zones by popularity from essential category
    return zoneTemplates
      .filter(template => template.category === 'essential' || template.category === 'amenities')
      .filter(template => !existingZoneNames.includes(template.name.toLowerCase()))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 8)
  }

  // Check if user has any zone that matches the template
  const findExistingZone = (templateName: string): Zone | undefined => {
    return zones.find(z => z.name.toLowerCase() === templateName.toLowerCase())
  }

  // Fetch property name and zones
  useEffect(() => {
    if (!id) return
    
    const fetchData = async () => {
      try {
        // Fetch property info
        const propResponse = await fetch(`/api/properties/${id}`)
        const propResult = await propResponse.json()
        if (propResult.success && propResult.data) {
          setPropertyName(propResult.data.name)
        }

        // Fetch zones
        const zonesResponse = await fetch(`/api/properties/${id}/zones`)
        const zonesResult = await zonesResponse.json()
        if (zonesResult.success && zonesResult.data) {
          // Transform API data to match Zone interface
          const transformedZones: Zone[] = zonesResult.data.map((zone: any) => {
            // Handle name - API stores as Json object {es: "name"} or string
            let zoneName = ''
            if (typeof zone.name === 'string') {
              zoneName = zone.name
            } else if (zone.name && typeof zone.name === 'object') {
              zoneName = zone.name.es || zone.name.en || Object.values(zone.name)[0] || ''
            }

            // Handle description - API stores as Json object {es: "description"} or string  
            let zoneDescription = ''
            if (typeof zone.description === 'string') {
              zoneDescription = zone.description
            } else if (zone.description && typeof zone.description === 'object') {
              zoneDescription = zone.description.es || zone.description.en || Object.values(zone.description)[0] || ''
            }

            return {
              id: zone.id,
              name: zoneName,
              description: zoneDescription,
              iconId: zone.icon, // API uses 'icon' field, UI expects 'iconId'
              order: zone.order || 0,
              stepsCount: zone.steps?.length || 0,
              qrUrl: `https://itineramio.com/guide/${id}/${zone.id}`,
              lastUpdated: zone.updatedAt ? new Date(zone.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            }
          })
          setZones(transformedZones)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [id])

  const handleCreateZone = async () => {
    if (!formData.name || !formData.iconId) return

    try {
      const response = await fetch(`/api/properties/${id}/zones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || 'Nueva zona personalizada',
          icon: formData.iconId,
          color: 'bg-gray-100',
          status: 'ACTIVE'
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        const newZone: Zone = {
          id: result.data.id,
          name: formData.name,
          description: formData.description,
          iconId: formData.iconId,
          order: result.data.order,
          stepsCount: 0,
          qrUrl: `https://itineramio.com/guide/${id}/${result.data.id}`,
          lastUpdated: new Date().toISOString().split('T')[0]
        }

        setZones([...zones, newZone])
        setFormData({ name: '', description: '', iconId: '' })
        setShowCreateForm(false)
        setShowIconSelector(false)
      } else {
        console.error('Error creating zone:', result.error)
        alert(result.error || 'Error al crear la zona')
      }
    } catch (error) {
      console.error('Error creating zone:', error)
      alert('Error al crear la zona')
    }
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

  const handleUpdateZone = async () => {
    if (!editingZone || !formData.name || !formData.iconId) return

    try {
      const response = await fetch(`/api/properties/${id}/zones/${editingZone.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || '',
          icon: formData.iconId,
          color: 'bg-gray-100',
          status: 'ACTIVE'
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
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
      } else {
        console.error('Error updating zone:', result.error)
        alert(result.error || 'Error al actualizar la zona')
      }
    } catch (error) {
      console.error('Error updating zone:', error)
      alert('Error al actualizar la zona')
    }
  }

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta zona? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/properties/${id}/zones/${zoneId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setZones(zones.filter(zone => zone.id !== zoneId))
      } else {
        console.error('Error deleting zone:', result.error)
        alert(result.error || 'Error al eliminar la zona')
      }
    } catch (error) {
      console.error('Error deleting zone:', error)
      alert('Error al eliminar la zona')
    }
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
          qrUrl: `https://itineramio.com/z/${Math.random().toString(36).substr(2, 6)}`,
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
    try {
      const response = await fetch(`/api/properties/${id}/zones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: zoneTemplate.name,
          description: zoneTemplate.description || 'Descripción de la zona',
          icon: zoneTemplate.icon,
          color: 'bg-gray-100',
          status: 'ACTIVE'
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Update local state with the new zone
        const newZone: Zone = {
          id: result.data.id,
          name: zoneTemplate.name,
          description: zoneTemplate.description || '',
          iconId: zoneTemplate.icon,
          order: result.data.order,
          stepsCount: 0,
          qrUrl: `https://itineramio.com/guide/${id}/${result.data.id}`,
          lastUpdated: new Date().toISOString().split('T')[0]
        }

        setZones([...zones, newZone])
        setShowInspirationModal(false)
        setSelectedInspirationZone(null)
      } else {
        console.error('Error creating zone:', result.error)
        alert(result.error || 'Error al crear la zona')
      }
    } catch (error) {
      console.error('Error creating zone:', error)
      alert('Error al crear la zona')
    }
  }

  const handleOpenMultiSelect = () => {
    setShowTemplateSelector(true)
  }


  const handleSelectMultipleZones = async (zoneIds: string[]) => {
    try {
      // Create zones from templates via API
      const createdZones: Zone[] = []
      
      for (const templateId of zoneIds) {
        const template = zoneTemplates.find(t => t.id === templateId)
        if (!template) continue
        
        const response = await fetch(`/api/properties/${id}/zones`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: template.name,
            description: template.description,
            icon: template.icon,
            color: 'bg-gray-100',
            status: 'ACTIVE'
          })
        })

        const result = await response.json()

        if (response.ok && result.success) {
          const newZone: Zone = {
            id: result.data.id,
            name: template.name,
            description: template.description,
            iconId: template.icon,
            order: result.data.order,
            stepsCount: 0,
            qrUrl: `https://itineramio.com/guide/${id}/${result.data.id}`,
            lastUpdated: new Date().toISOString().split('T')[0]
          }
          createdZones.push(newZone)
        } else {
          console.error('Error creating zone:', result.error)
        }
      }

      // Update local state with created zones
      setZones([...zones, ...createdZones])
      setShowTemplateSelector(false)
    } catch (error) {
      console.error('Error creating multiple zones:', error)
      alert('Error al crear las zonas')
    }
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
        <div className="hidden lg:flex space-x-3">
          <Button
            onClick={handleOpenMultiSelect}
            className="bg-violet-600 hover:bg-violet-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Añadir Zonas
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
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Section - Zones (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Mobile header for zones */}
          <div className="lg:hidden mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Tus zonas en {propertyName || 'la propiedad'}
            </h2>
          </div>
          <AnimatePresence>
            {zones.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-600 mb-4">
                  No tienes zonas creadas aún
                </p>
                <Button
                  onClick={handleOpenMultiSelect}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir tu primera zona
                </Button>
              </Card>
            ) : (
              zones.map((zone) => (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer hover:border-violet-300"
                  onClick={() => router.push(`/properties/${id}/zones/${zone.id}/steps`)}
                >
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
                      <div className="flex items-center ml-4" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
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
            ))
            )}
          </AnimatePresence>
        </div>

        {/* Right Section - Inspiration Block (1/3 width on desktop, full on mobile) */}
        <div className="col-span-full lg:col-span-1 order-first lg:order-last">
          <Card className="lg:sticky lg:top-6">
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
            <CardContent className="p-4">
              {(() => {
                // Get all essential zones (max 5)
                const essentialZones = zoneTemplates
                  .filter(template => template.category === 'essential')
                  .sort((a, b) => b.popularity - a.popularity)
                  .slice(0, 5)

                const allExist = essentialZones.every(zone => 
                  findExistingZone(zone.name) !== undefined
                )

                if (allExist) {
                  return (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        ¡Enhorabuena! 🎉
                      </p>
                      <p className="text-xs text-gray-600">
                        Tu manual tiene muy buena pinta. Has añadido todas las zonas esenciales.
                      </p>
                    </div>
                  )
                }

                return (
                  <div className="space-y-4">
                    {essentialZones.map((zone) => {
                      const existingZone = findExistingZone(zone.name)
                      const isExisting = existingZone !== undefined

                      return (
                        <div key={zone.id} className="space-y-2">
                          <div 
                            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                              isExisting 
                                ? 'bg-green-50 hover:bg-green-100 cursor-pointer' 
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                            onClick={() => {
                              if (isExisting && existingZone) {
                                router.push(`/properties/${id}/zones/${existingZone.id}/steps`)
                              }
                            }}
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              <ZoneIcon 
                                iconId={zone.icon} 
                                className={`w-5 h-5 ${isExisting ? 'text-green-600' : 'text-gray-600'}`} 
                              />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${isExisting ? 'text-green-900' : 'text-gray-900'}`}>
                                  {zone.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {isExisting ? '✓ Ya añadida' : 'Recomendada'}
                                </p>
                              </div>
                            </div>
                            {!isExisting && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-green-50"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUseTemplate(zone)
                                }}
                                title="Añadir zona"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 px-3">
                            {getZoneHelpText(zone.name)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
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
            onClose={() => setShowTemplateSelector(false)}
            onSelectZones={handleSelectMultipleZones}
            onCreateCustomZone={() => setShowCreateForm(true)}
            existingZoneIds={zones.map(z => z.name.toLowerCase())}
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
                    <ZoneIcon iconId={selectedInspirationZone.icon} className="w-8 h-8 text-gray-600" />
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
                  
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-4">Esta zona es {selectedInspirationZone.popularity}% popular entre los hosts</p>
                    <div className="text-left bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium mb-2">Ejemplo de contenido:</h5>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Instrucciones paso a paso con imágenes</li>
                        <li>• Enlaces a manuales o videos</li>
                        <li>• Consejos y recomendaciones útiles</li>
                        <li>• Información de contacto relevante</li>
                      </ul>
                    </div>
                  </div>
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

      {/* Floating button for mobile */}
      <div className="lg:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <Button
          onClick={handleOpenMultiSelect}
          className="bg-violet-600 hover:bg-violet-700 shadow-lg rounded-full px-6 py-3"
        >
          <Plus className="w-5 h-5 mr-2" />
          Añadir Zonas
        </Button>
      </div>

    </div>
  )
}