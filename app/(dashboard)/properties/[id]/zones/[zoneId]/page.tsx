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
      const response = await fetch(`/api/properties/${propertyId}/zones/${zoneId}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar la zona')
      }
      
      console.log('📊 Zone data received:', result.data)
      console.log('📊 Zone steps:', result.data.steps)
      console.log('📊 Steps count:', result.data.steps?.length || 0)
      
      setZone(result.data)
    } catch (error) {
      console.error('Error fetching zone:', error)
      alert('Error al cargar la zona')
      router.push(`/properties/${propertyId}`)
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
    console.log('🔥🔥🔥 handleSaveSteps CALLED!')
    console.log('🔥🔥🔥 Steps received:', steps)
    console.log('🔥🔥🔥 Property ID:', propertyId)
    console.log('🔥🔥🔥 Zone ID:', zoneId)
    
    try {
      console.log('💾 Formatting steps...')
      
      // Simple format for API
      const formattedSteps = steps.map((step, index) => ({
        type: step.type || 'text',
        content: step.content || { es: '', en: '', fr: '' },
        order: index
      }))
      
      console.log('💾 Formatted steps:', formattedSteps)
      console.log('💾 Making API call...')
      
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
      console.error('❌ Error in handleSaveSteps:', error)
      alert('Error al guardar los pasos: ' + (error instanceof Error ? error.message : 'Unknown'))
    }
  }

  const getInitialSteps = () => {
    if (!isEditingExisting || !editingStepId || !zone?.steps) {
      return []
    }

    const existingStep = zone.steps.find(s => s.id === editingStepId)
    if (!existingStep) return []

    return [{
      id: existingStep.id,
      type: existingStep.type.toLowerCase() as any,
      content: {
        es: existingStep.content || existingStep.title || '',
        en: '',
        fr: ''
      },
      media: existingStep.mediaUrl ? { url: existingStep.mediaUrl } : undefined,
      order: existingStep.order
    }]
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!zone) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Zona no encontrada</h2>
          <Link href={`/properties/${propertyId}`}>
            <Button variant="outline">Volver a la propiedad</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href={`/properties/${propertyId}`}>
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
                <h1 className="text-3xl font-bold text-gray-900">{zone.name}</h1>
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
            {/* Test button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                console.log('🧪 TEST: Direct save button clicked');
                const testSteps = [{
                  type: 'text',
                  content: { es: 'Test step ' + new Date().toISOString() },
                  order: 0
                }];
                console.log('🧪 TEST: Calling handleSaveSteps directly');
                await handleSaveSteps(testSteps);
              }}
            >
              🧪 Test Save
            </Button>
          </div>
        </div>

        {/* Zone Info Card */}
        <Card className="p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl flex-shrink-0 ${zone.color || 'bg-gray-100'}`}>
              {zone.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{zone.name}</h2>
              <p className="text-gray-600 mb-4">{zone.description}</p>
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
                                  {step.title}
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
                                    step.status === 'ACTIVE' ? 'text-green-600' : 
                                    step.status === 'DRAFT' ? 'text-yellow-600' : 'text-gray-600'
                                  }`}>
                                    {step.status === 'ACTIVE' ? (
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                    ) : (
                                      <AlertCircle className="w-4 h-4 mr-1" />
                                    )}
                                    <span>
                                      {step.status === 'ACTIVE' ? 'Activo' : 
                                       step.status === 'DRAFT' ? 'Borrador' : 'Archivado'}
                                    </span>
                                  </div>
                                </div>
                                {step.description && (
                                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                    {step.description}
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
      {showStepEditor && zone && (
        <StepEditor
          key={`step-editor-${editingStepId || 'new'}`}
          zoneTitle={typeof zone.name === 'string' ? zone.name : (zone.name as any)?.es || 'Zona'}
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