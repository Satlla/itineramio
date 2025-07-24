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
  Link as LinkIcon,
  Wifi,
  MapPin,
  Key,
  Car,
  Utensils,
  Bath,
  Bed,
  Home,
  Calendar,
  Clock,
  BarChart3,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Users,
  Info,
  ChevronRight,
  Lightbulb
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '../../../../../../src/components/ui/Button'
import { Card } from '../../../../../../src/components/ui/Card'
import { StepEditor } from '../../../../../../src/components/ui/StepEditor'
import { AnimatedLoadingSpinner } from '../../../../../../src/components/ui/AnimatedLoadingSpinner'
import { resolveProperty, resolveZone } from '../../../../../../src/lib/slug-resolver'
import { isCuid } from '../../../../../../src/lib/slug-utils'
import { getZoneIcon as getExtendedZoneIcon, getZoneIconByName } from '../../../../../../src/data/zoneIconsExtended'
import { ZoneSuggestionsModal } from '../../../../../../src/components/ui/ZoneSuggestionsModal'
import { EditZoneModal } from '../../../../../../src/components/ui/EditZoneModal'

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
  errorReportsCount?: number
  isPublished?: boolean
}

export default function ZoneDetailPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  const zoneId = params.zoneId as string
  
  const [zone, setZone] = useState<Zone | null>(null)
  const [loading, setLoading] = useState(true)
  const [draggedStep, setDraggedStep] = useState<string | null>(null)
  const [showStepEditor, setShowStepEditor] = useState(false)
  const [isEditingExisting, setIsEditingExisting] = useState(false)
  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false)
  const [showEditZoneModal, setShowEditZoneModal] = useState(false)

  useEffect(() => {
    console.log('🎯 ZoneDetailPage mounted with:', { propertyId, zoneId })
    fetchZoneData()
  }, [propertyId, zoneId])
  
  // Debug component lifecycle
  useEffect(() => {
    console.log('🎯 ZoneDetailPage render state:', {
      loading,
      zoneExists: !!zone,
      showStepEditor,
      stepsCount: zone?.steps?.length || 0
    })
  })

  const fetchZoneData = async () => {
    try {
      setLoading(true)
      console.log('🔄 FETCHING zone data for:', { propertyId, zoneId })
      
      let actualPropertyId = propertyId
      let actualZoneId = zoneId
      
      // Resolve property identifier if it's a slug
      if (!isCuid(propertyId)) {
        const resolvedProperty = await resolveProperty(propertyId)
        if (resolvedProperty) {
          actualPropertyId = resolvedProperty.id
        }
      }
      
      // Resolve zone identifier if it's a slug
      if (!isCuid(zoneId)) {
        const resolvedZone = await resolveZone(actualPropertyId, zoneId)
        if (resolvedZone) {
          actualZoneId = resolvedZone.id
        }
      }
      
      const response = await fetch(`/api/properties/${actualPropertyId}/zones/${actualZoneId}`)
      const result = await response.json()
      
      console.log('🔄 API Response:', { 
        status: response.status, 
        ok: response.ok, 
        result 
      })
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar la zona')
      }
      
      const zoneData = result.data || result
      const zoneName = typeof zoneData.name === 'string' ? zoneData.name : (zoneData.name as any)?.es || 'Zone'
      console.log('📊 Zone loaded:', zoneName, 'with', zoneData.steps?.length || 0, 'steps')
      
      if (zoneData.steps) {
        console.log('📊 Steps data:', zoneData.steps.map((s: any) => ({ 
          id: s.id, 
          type: s.type, 
          title: s.title, 
          content: s.content,
          order: s.order,
          isPublished: s.isPublished
        })))
        
        // Log each step content individually
        zoneData.steps.forEach((step: any, index: number) => {
          console.log(`📊 Step ${index + 1}:`, {
            id: step.id,
            type: step.type,
            titleES: step.title?.es,
            contentES: step.content?.es,
            order: step.order
          })
        })
      }
      
      setZone(zoneData)
    } catch (error) {
      console.error('❌ Error fetching zone:', error)
      // Don't navigate away, let user see the error
      alert(`Error al cargar la zona: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStep = () => {
    setIsEditingExisting(false)
    setEditingStepId('NEW_STEP_FOCUS') // Special ID to indicate we want to focus the new step
    setShowStepEditor(true)
  }

  const handleEditStep = (stepId: string) => {
    setIsEditingExisting(true)
    setEditingStepId(stepId)
    setShowStepEditor(true)
  }

  const handleDeleteStep = async (stepId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este paso?')) {
      try {
        const response = await fetch(`/api/properties/${propertyId}/zones/${zoneId}/steps/${stepId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          // Refresh zone data to get updated steps
          fetchZoneData()
        } else {
          alert('Error al eliminar el paso')
        }
      } catch (error) {
        console.error('Error deleting step:', error)
        alert('Error al eliminar el paso')
      }
    }
  }

  const handleEditZone = () => {
    setShowEditZoneModal(true)
  }

  const handleSaveSteps = async (steps: any[]) => {
    console.log('💾 handleSaveSteps called with:', steps)
    console.log('💾 Number of steps:', steps?.length)
    console.log('💾 propertyId:', propertyId)
    console.log('💾 zoneId:', zoneId)
    
    if (!steps || steps.length === 0) {
      console.error('💾 No steps to save!')
      return
    }
    
    try {
      // Format steps correctly for API
      const formattedSteps = steps.map((step, index) => {
        const formattedStep = {
          type: (step.type || 'text').toUpperCase(), // Ensure uppercase
          title: step.content || { es: '', en: '', fr: '' }, // Use content as title
          content: step.content || { es: '', en: '', fr: '' },
          order: index,
          // Include media data for images/videos
          mediaUrl: step.media?.url || null,
          linkUrl: step.type === 'link' ? step.media?.url : null
        }
        
        console.log(`💾 Step ${index + 1} formatted:`, formattedStep)
        return formattedStep
      })
      
      console.log('💾 Formatted steps for API:', formattedSteps)
      console.log('💾 API URL:', `/api/properties/${propertyId}/zones/${zoneId}/steps`)
      
      const response = await fetch(`/api/properties/${propertyId}/zones/${zoneId}/steps`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps: formattedSteps })
      })

      console.log('💾 Response status:', response.status)
      const result = await response.json()
      console.log('💾 Response data:', result)
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar')
      }
      
      console.log('✅ Steps saved:', result.message)
      setShowStepEditor(false)
      await fetchZoneData()
      
    } catch (error) {
      console.error('❌ Error saving steps:', error)
      alert('Error al guardar los pasos')
    }
  }

  const getInitialSteps = () => {
    console.log('🎬 getInitialSteps called:', { 
      hasZone: !!zone, 
      stepsCount: zone?.steps?.length || 0,
      isEditingExisting, 
      editingStepId 
    })
    
    // When editing a specific step, return ALL steps but focus on the one being edited
    if (isEditingExisting && editingStepId) {
      if (!zone?.steps) return []
      
      // Convert all existing steps to editor format, preserving ALL steps
      const allSteps = zone.steps
        .sort((a, b) => a.order - b.order)
        .map(step => ({
          id: step.id,
          type: step.type.toLowerCase() as any,
          content: typeof step.content === 'string' 
            ? { es: step.content, en: '', fr: '' }
            : {
                es: (step.content as any)?.es || '',
                en: (step.content as any)?.en || '',
                fr: (step.content as any)?.fr || ''
              },
          media: (step as any).mediaUrl ? { url: (step as any).mediaUrl } 
            : (step.content as any)?.mediaUrl ? { url: (step.content as any).mediaUrl }
            : undefined,
          order: step.order,
          isBeingEdited: step.id === editingStepId // Mark which step is being edited
        }))

      console.log('🎬 Editing mode: Returning all', allSteps.length, 'steps with editing flag')
      return allSteps
    }

    // When adding a new step, return ALL existing steps + a new empty step
    if (!zone?.steps) {
      // No existing steps, create first step
      return [{
        id: `new-step-${Date.now()}`,
        type: 'text' as any,
        content: { es: '', en: '', fr: '' },
        media: undefined,
        order: 0
      }]
    }

    // Convert all existing steps to editor format
    const allSteps = zone.steps
      .sort((a, b) => a.order - b.order)
      .map(step => ({
        id: step.id,
        type: step.type.toLowerCase() as any,
        content: typeof step.content === 'string' 
          ? { es: step.content, en: '', fr: '' }
          : {
              es: (step.content as any)?.es || '',
              en: (step.content as any)?.en || '',
              fr: (step.content as any)?.fr || ''
            },
        media: (step as any).mediaUrl ? { url: (step as any).mediaUrl } 
          : (step.content as any)?.mediaUrl ? { url: (step.content as any).mediaUrl }
          : undefined,
        order: step.order
      }))

    // Add a new empty step at the end
    const nextOrder = allSteps.length
    allSteps.push({
      id: `new-step-${Date.now()}`,
      type: 'text' as any,
      content: { es: '', en: '', fr: '' },
      media: undefined,
      order: nextOrder
    })

    console.log('🎬 Returning all steps + new:', allSteps.length, 'steps')
    return allSteps
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

  const getStepIcon = (type: Step['type']) => {
    switch (type) {
      case 'TEXT':
        return FileText
      case 'IMAGE':
        return ImageIcon
      case 'VIDEO':
        return Video
      case 'LINK':
        return LinkIcon
      default:
        return FileText
    }
  }

  // Helper function to get zone icon component based on emoji and name
  const getZoneIcon = (emoji: string, zoneName?: string) => {
    // Try emoji first with extended mapping
    const iconFromEmoji = getExtendedZoneIcon(emoji)
    if (iconFromEmoji !== Home) {
      return iconFromEmoji
    }
    
    // If no emoji match and we have a name, try to match by name
    if (zoneName) {
      return getZoneIconByName(zoneName)
    }
    
    return Home
  }

  const getStepTypeLabel = (type: Step['type']) => {
    switch (type) {
      case 'TEXT':
        return 'Texto'
      case 'IMAGE':
        return 'Imagen'
      case 'VIDEO':
        return 'Video'
      case 'LINK':
        return 'Enlace'
      default:
        return 'Texto'
    }
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
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Link href={`/properties/${propertyId}/zones`}>
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${zone.color || 'bg-gray-100'}`}>
              {(() => {
                const IconComponent = getZoneIcon(zone.icon, getZoneText(zone.name, ''))
                return IconComponent ? (
                  <IconComponent className="w-5 h-5 text-gray-700" />
                ) : (
                  <span className="text-lg">{zone.icon}</span>
                )
              })()}
            </div>
            <h1 className="text-lg font-semibold text-gray-900">
              {getZoneText(zone.name, 'Zona')}
            </h1>
          </div>
          <Button variant="ghost" size="sm" className="p-2" onClick={handleEditZone}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Desktop Header - Airbnb Style */}
      <div className="hidden lg:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Navigation */}
          <div className="mb-6">
            <Link href={`/properties/${propertyId}/zones`}>
              <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a zonas
              </Button>
            </Link>
          </div>

          {/* Zone Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {/* Zone Icon */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${zone.color || 'bg-gray-100'} shadow-sm`}>
                {(() => {
                  const IconComponent = getZoneIcon(zone.icon, getZoneText(zone.name, ''))
                  return IconComponent ? (
                    <IconComponent className="w-8 h-8 text-gray-700" />
                  ) : (
                    <span className="text-3xl">{zone.icon}</span>
                  )
                })()}
              </div>
              
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-semibold text-gray-900">
                    {getZoneText(zone.name, 'Zona')}
                  </h1>
                  {/* Status Badge */}
                  <div className="flex items-center space-x-2">
                    {zone.isPublished ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <ToggleRight className="w-4 h-4 mr-1" />
                        Activa
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        <ToggleLeft className="w-4 h-4 mr-1" />
                        Inactiva
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 text-lg mb-4">
                  {getZoneText(zone.description, '')}
                </p>

                {/* Stats */}
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center text-gray-600">
                    <FileText className="w-4 h-4 mr-1.5" />
                    <span className="font-medium">{zone.steps?.length || 0}</span>
                    <span className="ml-1">pasos</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    <span>Actualizado {new Date(zone.updatedAt).toLocaleDateString('es-ES', { 
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}</span>
                  </div>
                  
                  {zone.errorReportsCount !== undefined && (
                    <div className="flex items-center text-gray-600">
                      <AlertTriangle className="w-4 h-4 mr-1.5" />
                      <span className="font-medium">{zone.errorReportsCount}</span>
                      <span className="ml-1">errores reportados</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={handleEditZone}
                className="border-gray-300 hover:bg-gray-50"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Editar Zona
              </Button>
              <Button 
                onClick={handleAddStep}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Paso
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden">
        {/* Zone Info Section */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="text-center mb-4">
            <div className={`w-16 h-16 rounded-xl mx-auto mb-3 flex items-center justify-center ${zone.color || 'bg-gray-100'}`}>
              {(() => {
                const IconComponent = getZoneIcon(zone.icon, getZoneText(zone.name, ''))
                return IconComponent ? (
                  <IconComponent className="w-8 h-8 text-gray-700" />
                ) : (
                  <span className="text-3xl">{zone.icon}</span>
                )
              })()}
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
          
        </div>

        {/* Steps Timeline - Mobile Itinerary Design */}
        <div className="px-4 pb-6">
          
          {!zone.steps || zone.steps.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Play className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay pasos aún
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Crea el primer paso para guiar a tus huéspedes
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={handleAddStep} className="bg-violet-600 hover:bg-violet-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Paso
                </Button>
                <Button
                  onClick={() => setShowSuggestionsModal(true)}
                  variant="outline"
                  className="relative group"
                  title="Ver sugerencias para esta zona"
                >
                  <Lightbulb className="w-4 h-4 text-amber-500 group-hover:text-amber-600" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-8 bottom-16 w-0.5 bg-gray-200"></div>
              
              <div className="space-y-6">
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
                        className="relative flex items-start space-x-4"
                      >
                        {/* Timeline Step Circle */}
                        <div className="relative z-10 flex-shrink-0">
                          <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                        </div>
                        
                        {/* Step Card */}
                        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                          {/* Step Header */}
                          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold text-gray-900">
                                  Paso {index + 1}
                                </span>
                                <div className="flex items-center space-x-1">
                                  <StepIcon className="w-4 h-4 text-gray-500" />
                                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                                    {getStepTypeLabel(step.type)}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Status & Actions */}
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  (step as any).isPublished 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {(step as any).isPublished ? 'Activo' : 'Borrador'}
                                </span>
                                
                                <div className="flex space-x-1">
                                  <Button
                                    onClick={() => handleEditStep(step.id)}
                                    size="sm"
                                    variant="ghost"
                                    className="w-7 h-7 p-0 hover:bg-violet-50 hover:text-violet-600"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteStep(step.id)}
                                    size="sm"
                                    variant="ghost"
                                    className="w-7 h-7 p-0 hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Step Title */}
                            <h3 className="text-sm font-semibold text-gray-900 mt-2">
                              {getStepText(step, 'title') || `Instrucción ${index + 1}`}
                            </h3>
                          </div>
                          
                          {/* Step Content */}
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
              
              {/* Add Step Button at the end of timeline */}
              <div className="relative flex items-start space-x-4 mt-6">
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white">
                    <Plus className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <Button 
                    onClick={handleAddStep}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-3 font-medium shadow-sm"
                  >
                    Añadir Paso
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Quick Actions */}
          <div className="px-4 pb-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <Button 
                  onClick={handleAddStep}
                  variant="outline" 
                  className="w-full justify-start h-12 text-left"
                >
                  <Plus className="w-5 h-5 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Nuevo Paso</div>
                    <div className="text-xs text-gray-500">Añadir instrucción</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 text-left"
                  onClick={() => alert('Funcionalidad próximamente')}
                >
                  <Eye className="w-5 h-5 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Vista Previa</div>
                    <div className="text-xs text-gray-500">Ver como huésped</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 text-left"
                  onClick={handleEditZone}
                >
                  <Settings className="w-5 h-5 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Configurar Zona</div>
                    <div className="text-xs text-gray-500">Editar información</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Content */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Steps Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Pasos ({zone.steps?.length || 0})
            </h2>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Vista Previa
            </Button>
          </div>
          
          {!zone.steps || zone.steps.length === 0 ? (
            <Card className="p-12 text-center">
              <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay pasos aún
              </h3>
              <p className="text-gray-600 mb-6">
                Crea pasos con instrucciones para guiar a tus huéspedes
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={handleAddStep}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Paso
                </Button>
                <Button
                  onClick={() => setShowSuggestionsModal(true)}
                  variant="outline"
                  className="relative group"
                  title="Ver sugerencias para esta zona"
                >
                  <Lightbulb className="w-4 h-4 text-amber-500 group-hover:text-amber-600" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {zone.steps
                .sort((a, b) => a.order - b.order)
                .map((step, index) => {
                  const StepIcon = getStepIcon(step.type)
                  
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="p-6 hover:shadow-lg transition-all duration-200 border border-gray-200 bg-white">
                        <div className="flex items-start space-x-4">
                          {/* Drag Handle */}
                          <div className="flex-shrink-0 cursor-move text-gray-400 hover:text-gray-600">
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Step Number */}
                          <div className="flex-shrink-0 w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-sm">
                            {index + 1}
                          </div>

                          {/* Step Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className="flex items-center text-sm text-gray-500">
                                    <StepIcon className="w-4 h-4 mr-1.5" />
                                    <span className="font-medium">{getStepTypeLabel(step.type)}</span>
                                  </div>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    (step as any).isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {(step as any).isPublished ? 'Publicado' : 'Borrador'}
                                  </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  {getStepText(step, 'title') || `Paso ${index + 1}`}
                                </h3>
                                {getStepText(step, 'content') && (
                                  <div className="text-gray-600 text-sm leading-relaxed mb-3 whitespace-pre-wrap break-words">
                                    {getStepText(step, 'content')}
                                  </div>
                                )}
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  {step.estimatedTime && (
                                    <div className="flex items-center">
                                      <Clock className="w-3.5 h-3.5 mr-1" />
                                      <span>{step.estimatedTime} min</span>
                                    </div>
                                  )}
                                  <div className="flex items-center">
                                    <Calendar className="w-3.5 h-3.5 mr-1" />
                                    <span>Actualizado {new Date(step.updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-2 ml-4">
                                <Button
                                  onClick={() => handleEditStep(step.id)}
                                  size="sm"
                                  variant="outline"
                                  className="text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                                >
                                  <Edit2 className="w-4 h-4 mr-1.5" />
                                  Editar
                                </Button>
                                <Button
                                  onClick={() => handleDeleteStep(step.id)}
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              
              {/* Add New Step Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: (zone.steps?.length || 0) * 0.05 }}
              >
                <Card 
                  className="p-8 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
                  onClick={handleAddStep}
                >
                  <div className="flex items-center justify-center space-x-4 text-gray-500 group-hover:text-gray-700">
                    <div className="w-12 h-12 bg-gray-100 group-hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                      <Plus className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-lg mb-1">Añadir nuevo paso</div>
                      <div className="text-sm text-gray-400">Crear instrucciones adicionales</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleAddStep}
              variant="outline" 
              className="justify-start h-12"
            >
              <Plus className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Nuevo Paso</div>
                <div className="text-xs text-gray-500">Añadir instrucción</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-12"
              onClick={() => alert('Funcionalidad próximamente')}
            >
              <Eye className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Vista Previa</div>
                <div className="text-xs text-gray-500">Ver como huésped</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-12"
              onClick={handleEditZone}
            >
              <Settings className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Configurar Zona</div>
                <div className="text-xs text-gray-500">Editar información</div>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* StepEditor Modal */}
      {(() => {
        console.log('🟣 PAGE: showStepEditor:', showStepEditor, 'zone exists:', !!zone)
        return showStepEditor && zone
      })() && (
        <StepEditor
          key={`step-editor-${editingStepId || 'new'}`}
          zoneTitle={getZoneText(zone.name, 'Zona')}
          initialSteps={getInitialSteps()}
          onSave={handleSaveSteps}
          onCancel={() => {
            console.log('🎯 PAGE: onCancel called');
            setShowStepEditor(false);
          }}
          maxVideos={5}
          currentVideoCount={zone.steps?.filter(s => s.type === 'VIDEO').length || 0}
          editingStepId={editingStepId}
          propertyId={propertyId}
          zoneId={zoneId}
        />
      )}

      {/* Zone Suggestions Modal */}
      {zone && (
        <ZoneSuggestionsModal
          isOpen={showSuggestionsModal}
          onClose={() => setShowSuggestionsModal(false)}
          zoneName={getZoneText(zone.name, '')}
        />
      )}

      {/* Edit Zone Modal */}
      <EditZoneModal
        isOpen={showEditZoneModal}
        onClose={() => setShowEditZoneModal(false)}
        zone={zone}
        propertyId={propertyId}
        onSuccess={fetchZoneData}
      />
    </div>
  )
}