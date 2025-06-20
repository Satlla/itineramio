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
import { Button } from '../../../../../../src/components/ui/Button'
import { Card } from '../../../../../../src/components/ui/Card'
import { StepEditor } from '../../../../../../src/components/ui/StepEditor'
import { LoadingSpinner } from '../../../../../../src/components/ui/LoadingSpinner'
import { resolveProperty, resolveZone } from '../../../../../../src/lib/slug-resolver'
import { isCuid } from '../../../../../../src/lib/slug-utils'

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
      console.log('📊 Zone loaded:', zoneData.name, 'with', zoneData.steps?.length || 0, 'steps')
      console.log('📊 RAW zone data:', zoneData)
      
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
      
      console.log('📊 About to call setZone with:', zoneData)
      setZone(zoneData)
      console.log('📊 setZone called')
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
    setEditingStepId(null)
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
    router.push(`/properties/${propertyId}/zones/${zoneId}/edit`)
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
          order: index
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
    
    // When editing a specific step, return only that step
    if (isEditingExisting && editingStepId) {
      if (!zone?.steps) return []
      
      const existingStep = zone.steps.find(s => s.id === editingStepId)
      if (!existingStep) return []

      return [{
        id: existingStep.id,
        type: existingStep.type.toLowerCase() as any,
        content: typeof existingStep.content === 'string' 
          ? { es: existingStep.content, en: '', fr: '' }
          : {
              es: (existingStep.content as any)?.es || '',
              en: (existingStep.content as any)?.en || '',
              fr: (existingStep.content as any)?.fr || ''
            },
        media: (existingStep as any).mediaUrl ? { url: (existingStep as any).mediaUrl } : undefined,
        order: existingStep.order
      }]
    }

    // When adding a new step, return ALL existing steps + a new empty step
    if (!zone?.steps) {
      // No existing steps, create first step
      return [{
        id: `new-step-${Date.now()}`,
        type: 'text' as any,
        content: { es: '', en: '', fr: '' },
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
        media: (step as any).mediaUrl ? { url: (step as any).mediaUrl } : undefined,
        order: step.order
      }))

    // Add a new empty step at the end
    const nextOrder = allSteps.length
    allSteps.push({
      id: `new-step-${Date.now()}`,
      type: 'text' as any,
      content: { es: '', en: '', fr: '' },
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
    return <LoadingSpinner text="Cargando zona..." />
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
            <Link href={`/properties/${propertyId}/zones`}>
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
            <Button variant="outline" size="sm" onClick={handleEditZone}>
              <Settings className="w-4 h-4 mr-2" />
              Editar Zona
            </Button>
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
          
          {/* Add Step Button */}
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
                      {/* Step Container */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Step Header with Timeline */}
                        <div className="flex items-center p-4 bg-gray-50 border-b border-gray-200">
                          {/* Timeline Section */}
                          <div className="flex items-center mr-4">
                            {/* Timeline Dot */}
                            <div className="relative">
                              <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center shadow-sm">
                                <span className="text-white font-semibold text-xs">{index + 1}</span>
                              </div>
                              {/* Vertical line */}
                              {!isLast && (
                                <div className="absolute top-8 left-1/2 w-0.5 h-4 bg-gray-300 -translate-x-0.5"></div>
                              )}
                            </div>
                            {/* Horizontal line */}
                            <div className="w-4 h-0.5 bg-gray-300 ml-2"></div>
                          </div>
                          
                          {/* Step Info */}
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
                          
                          {/* Actions */}
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
          )}
        </div>
      </div>

      {/* Desktop Content */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Zone Info Card */}
        <Card className="p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl flex-shrink-0 ${zone.color || 'bg-gray-100'}`}>
              {zone.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {getZoneText(zone.name, 'Zona')}
              </h2>
              <p className="text-gray-600 mb-4">
                {getZoneText(zone.description, '')}
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="font-medium">{zone.steps?.length || 0}</span>
                  <span className="ml-1">pasos</span>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    zone.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : zone.status === 'DRAFT'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {zone.status === 'ACTIVE' ? 'Activo' : zone.status === 'DRAFT' ? 'Borrador' : 'Archivado'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

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
              <Button onClick={handleAddStep}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Paso
              </Button>
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
                      <Card className="p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center space-x-4">
                          {/* Drag Handle */}
                          <div className="flex-shrink-0 cursor-move text-gray-400 hover:text-gray-600">
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Step Number */}
                          <div className="flex-shrink-0 w-8 h-8 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>

                          {/* Step Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                  {getStepText(step, 'title') || 
                                   getStepText(step, 'content').substring(0, 50) || 
                                   `Paso ${index + 1}`}
                                </h3>
                                <div className="flex items-center space-x-3 mt-1">
                                  <div className="flex items-center text-sm text-gray-500">
                                    <StepIcon className="w-4 h-4 mr-1" />
                                    <span>{getStepTypeLabel(step.type)}</span>
                                  </div>
                                  {step.estimatedTime && (
                                    <div className="text-sm text-gray-500">
                                      {step.estimatedTime} min
                                    </div>
                                  )}
                                  <div className={`flex items-center text-sm ${
                                    (step as any).isPublished ? 'text-green-600' : 'text-yellow-600'
                                  }`}>
                                    {(step as any).isPublished ? (
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                    ) : (
                                      <AlertCircle className="w-4 h-4 mr-1" />
                                    )}
                                    <span>
                                      {(step as any).isPublished ? 'Publicado' : 'Borrador'}
                                    </span>
                                  </div>
                                </div>
                                {(getStepText(step, 'description') || getStepText(step, 'content')) && (
                                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                    {getStepText(step, 'description') || getStepText(step, 'content')}
                                  </p>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-2 ml-4">
                                <Button
                                  onClick={() => handleEditStep(step.id)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-violet-50 hover:text-violet-600"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteStep(step.id)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
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
                  className="p-4 border-2 border-dashed border-gray-300 hover:border-violet-400 hover:bg-violet-50 transition-all duration-200 cursor-pointer"
                  onClick={handleAddStep}
                >
                  <div className="flex items-center justify-center space-x-3 text-gray-600 hover:text-violet-600">
                    <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                      <Plus className="w-4 h-4 text-violet-600" />
                    </div>
                    <span className="font-medium">Añadir nuevo paso</span>
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
        />
      )}
    </div>
  )
}