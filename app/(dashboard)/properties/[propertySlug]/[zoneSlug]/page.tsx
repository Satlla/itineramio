'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Plus, 
  Edit2, 
  Trash2, 
  GripVertical,
  Eye,
  Settings,
  CheckCircle,
  AlertCircle,
  Play,
  Image as ImageIcon,
  FileText,
  Video,
  Link as LinkIcon
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '../../../../../src/components/ui/Button'
import { Card } from '../../../../../src/components/ui/Card'
import { StepEditor } from '../../../../../src/components/ui/StepEditor'
import { findPropertyBySlug, findZoneBySlug, createPropertySlug, createZoneSlug } from '../../../../../src/lib/slugs'

interface Step {
  id: string
  title: string
  description?: string
  order: number
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK'
  content?: string
  mediaUrl?: string
  linkUrl?: string
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  isCompleted?: boolean
  estimatedTime?: number
  createdAt: string
  updatedAt: string
}

interface Zone {
  id: string
  name: string
  description: string
  icon: string
  color: string
  order: number
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  propertyId: string
  steps: Step[]
  createdAt: string
  updatedAt: string
}

interface Property {
  id: string
  name: string
  city?: string
  zones?: Zone[]
}

export default function ZoneDetailPageWithSlug() {
  const router = useRouter()
  const params = useParams()
  const propertySlug = params.propertySlug as string
  const zoneSlug = params.zoneSlug as string
  
  const [property, setProperty] = useState<Property | null>(null)
  const [zone, setZone] = useState<Zone | null>(null)
  const [loading, setLoading] = useState(true)
  const [showStepEditor, setShowStepEditor] = useState(false)
  const [isEditingExisting, setIsEditingExisting] = useState(false)
  const [editingStepId, setEditingStepId] = useState<string | null>(null)

  useEffect(() => {
    console.log('🎯 ZoneDetailPageWithSlug mounted with:', { propertySlug, zoneSlug })
    fetchData()
  }, [propertySlug, zoneSlug])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // First fetch all properties to find the one with this slug
      const propertiesResponse = await fetch('/api/properties')
      const propertiesResult = await propertiesResponse.json()
      
      if (!propertiesResult.success) {
        throw new Error('Failed to fetch properties')
      }
      
      // Find property by slug
      const foundProperty = findPropertyBySlug(propertySlug, propertiesResult.data)
      if (!foundProperty) {
        throw new Error('Property not found')
      }
      
      setProperty(foundProperty)
      
      // Now fetch zones for this property
      const zonesResponse = await fetch(`/api/properties/${foundProperty.id}/zones`)
      const zonesResult = await zonesResponse.json()
      
      if (!zonesResult.success) {
        throw new Error('Failed to fetch zones')
      }
      
      // Find zone by slug
      const foundZone = findZoneBySlug(zoneSlug, zonesResult.data)
      if (!foundZone) {
        throw new Error('Zone not found')
      }
      
      // Fetch detailed zone data
      const zoneResponse = await fetch(`/api/properties/${foundProperty.id}/zones/${foundZone.id}`)
      const zoneResult = await zoneResponse.json()
      
      if (!zoneResponse.ok) {
        throw new Error(zoneResult.error || 'Error loading zone')
      }
      
      const zoneData = zoneResult.data || zoneResult
      console.log('📊 Zone loaded:', zoneData.name, 'with', zoneData.steps?.length || 0, 'steps')
      
      setZone(zoneData)
    } catch (error) {
      console.error('❌ Error fetching data:', error)
      alert(`Error: ${error}`)
      // Redirect to properties if something fails
      router.push('/properties')
    } finally {
      setLoading(false)
    }
  }

  const handleAddStep = () => {
    setIsEditingExisting(false)
    setEditingStepId(null)
    setShowStepEditor(true)
  }

  const handleEditStep = (stepId: string) => {
    setIsEditingExisting(true)
    setEditingStepId(stepId)
    setShowStepEditor(true)
  }

  const handleDeleteStep = async (stepId: string) => {
    if (!property || !zone) return
    
    if (confirm('¿Estás seguro de que quieres eliminar este paso?')) {
      try {
        const response = await fetch(`/api/properties/${property.id}/zones/${zone.id}/steps/${stepId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          fetchData() // Refresh data
        } else {
          alert('Error al eliminar el paso')
        }
      } catch (error) {
        console.error('Error deleting step:', error)
        alert('Error al eliminar el paso')
      }
    }
  }

  const handleSaveSteps = async (steps: any[]) => {
    if (!property || !zone || !steps || steps.length === 0) return
    
    try {
      const formattedSteps = steps.map((step, index) => ({
        type: (step.type || 'text').toUpperCase(),
        title: step.content || { es: '', en: '', fr: '' },
        content: step.content || { es: '', en: '', fr: '' },
        order: index
      }))
      
      const response = await fetch(`/api/properties/${property.id}/zones/${zone.id}/steps`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps: formattedSteps })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar')
      }
      
      console.log('✅ Steps saved:', result.message)
      setShowStepEditor(false)
      await fetchData()
      
    } catch (error) {
      console.error('❌ Error saving steps:', error)
      alert('Error al guardar los pasos')
    }
  }

  // Helper function to get zone text (for name, description, etc.)
  const getZoneText = (value: any, fallback: string = '') => {
    if (typeof value === 'string') {
      return value
    }
    if (value && typeof value === 'object') {
      return value.es || value.en || value.fr || fallback
    }
    return fallback
  }

  // Helper function to get step content text
  const getStepText = (step: any, field: 'title' | 'content' | 'description' = 'content') => {
    const data = step[field]
    if (typeof data === 'string') {
      return data
    }
    if (data && typeof data === 'object') {
      return data.es || data.en || data.fr || ''
    }
    return ''
  }

  const getStepIcon = (type: Step['type']) => {
    switch (type) {
      case 'TEXT': return FileText
      case 'IMAGE': return ImageIcon
      case 'VIDEO': return Video
      case 'LINK': return LinkIcon
      default: return FileText
    }
  }

  const getStepTypeLabel = (type: Step['type']) => {
    switch (type) {
      case 'TEXT': return 'Texto'
      case 'IMAGE': return 'Imagen'
      case 'VIDEO': return 'Video'
      case 'LINK': return 'Enlace'
      default: return 'Texto'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!property || !zone) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Zona no encontrada</h2>
          <Link href="/properties">
            <Button variant="outline">Volver a propiedades</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Create friendly back URL
  const propertyFriendlyUrl = `/properties/${propertySlug}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Link href={propertyFriendlyUrl}>
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${zone.color || 'bg-gray-100'}`}>
              {zone.icon}
            </div>
            <h1 className="text-lg font-semibold text-gray-900">
              {getZoneText(zone.name, 'Zona')}
            </h1>
          </div>
          <Button variant="ghost" size="sm" className="p-2">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href={propertyFriendlyUrl}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${zone.color || 'bg-gray-100'}`}>
                {zone.icon}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {getZoneText(zone.name, 'Zona')}
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestiona los pasos de esta zona
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button onClick={handleAddStep}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Paso
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden">
        {/* Zone Info Section */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="text-center mb-4">
            <div className={`w-16 h-16 rounded-xl mx-auto mb-3 flex items-center justify-center text-3xl ${zone.color || 'bg-gray-100'}`}>
              {zone.icon}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {getZoneText(zone.name, 'Zona')}
            </h2>
            <p className="text-gray-600 text-sm mb-3">
              {getZoneText(zone.description, 'Gestiona los pasos de esta zona')}
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
              <span className="font-medium">{zone.steps?.length || 0} pasos</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                zone.status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {zone.status === 'ACTIVE' ? 'Activo' : 'Borrador'}
              </span>
            </div>
          </div>
          
          <Button 
            onClick={handleAddStep}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Paso
          </Button>
        </div>

        {/* Steps Timeline */}
        <div className="px-4 pb-4">
          {!zone.steps || zone.steps.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Play className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay pasos aún
              </h3>
              <p className="text-gray-600 text-sm">
                Crea el primer paso para guiar a tus huéspedes
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {zone.steps
                .sort((a, b) => a.order - b.order)
                .map((step, index) => {
                  const StepIcon = getStepIcon(step.type)
                  const isLast = index === zone.steps.length - 1
                  
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="relative"
                    >
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="flex items-center p-4 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center mr-4">
                            <div className="relative">
                              <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center shadow-sm">
                                <span className="text-white font-semibold text-xs">{index + 1}</span>
                              </div>
                              {!isLast && (
                                <div className="absolute top-8 left-1/2 w-0.5 h-4 bg-gray-300 -translate-x-0.5"></div>
                              )}
                            </div>
                            <div className="w-4 h-0.5 bg-gray-300 ml-2"></div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <StepIcon className="w-4 h-4 text-gray-600" />
                              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                {getStepTypeLabel(step.type)}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                (step as any).isPublished 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {(step as any).isPublished ? 'Publicado' : 'Borrador'}
                              </span>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900">
                              {getStepText(step, 'title') || `Paso ${index + 1}`}
                            </h3>
                          </div>
                          
                          <div className="flex space-x-1">
                            <Button
                              onClick={() => handleEditStep(step.id)}
                              size="sm"
                              variant="ghost"
                              className="w-8 h-8 p-0 hover:bg-white hover:shadow-sm"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-gray-600" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteStep(step.id)}
                              size="sm"
                              variant="ghost"
                              className="w-8 h-8 p-0 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        
                        {getStepText(step, 'content') && (
                          <div className="p-4">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {getStepText(step, 'content')}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Content - Simplified for brevity, would be similar to mobile but with desktop styling */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-8">
          <p className="text-gray-600">Versión de escritorio disponible - similar a la versión móvil</p>
        </div>
      </div>

      {/* StepEditor Modal */}
      {showStepEditor && zone && property && (
        <StepEditor
          key={`step-editor-${editingStepId || 'new'}`}
          zoneTitle={getZoneText(zone.name, 'Zona')}
          initialSteps={[]} // Simplified for now
          onSave={handleSaveSteps}
          onCancel={() => setShowStepEditor(false)}
          maxVideos={5}
          currentVideoCount={zone.steps?.filter(s => s.type === 'VIDEO').length || 0}
        />
      )}
    </div>
  )
}