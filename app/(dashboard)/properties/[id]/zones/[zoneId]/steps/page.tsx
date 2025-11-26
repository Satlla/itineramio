'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { 
  Plus, 
  Type, 
  Image, 
  Video, 
  GripVertical, 
  Edit, 
  Trash2, 
  Save,
  X,
  ArrowLeft,
  Eye,
  Upload,
  Link,
  Loader2
} from 'lucide-react'
import { Button } from '../../../../../../../src/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../../src/components/ui/Card'
import { Input } from '../../../../../../../src/components/ui/Input'
import { ZoneIconDisplay, useZoneIcon } from '../../../../../../../src/components/ui/IconSelector'
import { VideoUpload } from '../../../../../../../src/components/ui/VideoUpload'
import { cn } from '../../../../../../../src/lib/utils'
import { useRouter } from 'next/navigation'
import { AnimatedLoadingSpinner } from '../../../../../../../src/components/ui/AnimatedLoadingSpinner'

enum StepType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

interface Step {
  id: string
  type: StepType
  title: { es: string; en: string }
  content: any // Flexible content based on type
  media?: {
    url: string
    thumbnail?: string
    title?: string
  }
  order: number
  isPublished: boolean
}

interface Zone {
  id: string
  name: { es: string; en: string }
  description?: { es: string; en: string }
  iconId: string
  qrCode: string
  stepsCount: number
}

// Helper function to get multilingual text safely
const getMultilingualText = (value: any, selectedLanguage: 'es' | 'en' = 'es', fallback: string = '') => {
  if (typeof value === 'string') {
    return value
  }
  if (value && typeof value === 'object') {
    return value[selectedLanguage] || value.es || value.en || value.fr || fallback
  }
  return fallback
}

// API integration functions
const fetchZoneData = async (propertyId: string, zoneId: string) => {
  try {
    const response = await fetch(`/api/properties/${propertyId}/zones/${zoneId}`)
    const result = await response.json()
    
    if (result.success) {
      return {
        id: result.data.id,
        name: result.data.name || { es: 'Zona', en: 'Zone' },
        description: result.data.description || { es: '', en: '' },
        iconId: result.data.icon || 'home',
        qrCode: result.data.accessCode || '',
        stepsCount: 0
      }
    }
    throw new Error(result.error || 'Error fetching zone')
  } catch (error) {
    console.error('Error fetching zone:', error)
    return null
  }
}

const fetchStepsData = async (propertyId: string, zoneId: string) => {
  try {
    const response = await fetch(`/api/properties/${propertyId}/zones/${zoneId}/steps/safe`)
    const result = await response.json()
    
    if (result.success) {
      console.log('🔍 Raw steps from API:', result.data)
      return result.data.map((step: any, index: number) => {
        console.log(`📝 Processing step ${index}:`, step)
        // Extract media information from content if it exists
        let media = undefined
        let cleanContent = step.content || { es: '', en: '' }
        
        if (step.content && typeof step.content === 'object' && step.content.mediaUrl) {
          media = {
            url: step.content.mediaUrl,
            thumbnail: step.content.thumbnail,
            title: step.content.title || 'Media'
          }
          
          // Remove media fields from content to keep it clean
          const { mediaUrl, thumbnail, title, ...restContent } = step.content
          cleanContent = restContent
        }
        
        return {
          id: step.id,
          type: step.type?.toUpperCase() || 'TEXT',
          title: step.title || { es: `Paso ${index + 1}`, en: `Step ${index + 1}` },
          content: cleanContent,
          media: media,
          order: step.order || index + 1,
          isPublished: step.status === 'ACTIVE'
        }
      })
    }
    return []
  } catch (error) {
    console.error('Error fetching steps:', error)
    return []
  }
}

const saveStepsData = async (propertyId: string, zoneId: string, steps: Step[]) => {
  try {
    console.log('🚀 Starting saveStepsData with steps:', steps.length)
    
    const stepsForAPI = steps.map((step, index) => {
      console.log(`📝 Processing step ${index + 1}:`, {
        id: step.id,
        type: step.type,
        hasMedia: !!step.media,
        mediaUrl: step.media?.url,
        contentMediaUrl: step.content?.mediaUrl,
        title: step.title
      })
      
      // Prepare content object that includes media URLs
      let contentData = step.content || {}
      
      // If step has media (video/image), include mediaUrl in content
      if (step.media?.url) {
        console.log(`🎬 Step ${index + 1} has media, adding to content:`, {
          url: step.media.url,
          thumbnail: step.media.thumbnail
        })
        contentData = {
          ...contentData,
          mediaUrl: step.media.url,
          thumbnail: step.media.thumbnail
          // Removed title to prevent overwriting description
        }
      } else if (step.content?.mediaUrl) {
        console.log(`📹 Step ${index + 1} has content.mediaUrl, preserving:`, step.content.mediaUrl)
        // Ensure mediaUrl from content is preserved
        contentData = {
          ...contentData,
          mediaUrl: step.content.mediaUrl
        }
      } else {
        console.log(`❌ Step ${index + 1} has no media URL`)
      }
      
      const apiStep = {
        type: step.type?.toLowerCase() || 'text',
        title: step.title,
        content: contentData,
        order: index + 1,
        status: step.isPublished ? 'ACTIVE' : 'DRAFT'
      }
      
      console.log(`✅ Step ${index + 1} prepared for API:`, apiStep)
      return apiStep
    })
    
    console.log('💾 Final steps payload for API:', JSON.stringify(stepsForAPI, null, 2))

    const response = await fetch(`/api/properties/${propertyId}/zones/${zoneId}/steps/safe`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ steps: stepsForAPI })
    })

    const result = await response.json()
    return result.success
  } catch (error) {
    console.error('Error saving steps:', error)
    return false
  }
}

export default function ZoneStepsPage({ 
  params 
}: { 
  params: Promise<{ id: string; zoneId: string }> 
}) {
  const router = useRouter()
  const [propertyId, setPropertyId] = useState<string>('')
  const [zoneId, setZoneId] = useState<string>('')
  const [zone, setZone] = useState<Zone | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingStep, setEditingStep] = useState<Step | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<'es' | 'en'>('es')
  const [newStepType, setNewStepType] = useState<StepType>(StepType.TEXT)

  // Unwrap params and load data
  useEffect(() => {
    params.then(({ id, zoneId: zId }) => {
      setPropertyId(id)
      setZoneId(zId)
      loadZoneAndSteps(id, zId)
    })
  }, [params])

  const loadZoneAndSteps = async (propId: string, zId: string) => {
    setLoading(true)
    try {
      const [zoneData, stepsData] = await Promise.all([
        fetchZoneData(propId, zId),
        fetchStepsData(propId, zId)
      ])
      
      if (zoneData) {
        setZone(zoneData)
      }
      console.log('📥 Loaded steps from API:', stepsData)
      setSteps(stepsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSteps = async () => {
    if (!propertyId || !zoneId) return
    
    setSaving(true)
    try {
      const success = await saveStepsData(propertyId, zoneId, steps)
      if (success) {
        // Show success message or update UI
        console.log('Steps saved successfully')
      } else {
        alert('Error al guardar los pasos')
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error al guardar los pasos')
    } finally {
      setSaving(false)
    }
  }

  const [formData, setFormData] = useState({
    title: { es: '', en: '' },
    content: {},
    media: undefined as { url: string; thumbnail?: string; title?: string } | undefined
  })

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-violet-600" />
          <p className="text-gray-600">Cargando zona y pasos...</p>
        </div>
      </div>
    )
  }

  const stepTypes = [
    {
      type: StepType.TEXT,
      name: 'Texto',
      description: 'Instrucciones de texto',
      icon: Type,
      color: 'from-blue-500 to-blue-600'
    },
    {
      type: StepType.IMAGE,
      name: 'Imagen',
      description: 'Foto explicativa',
      icon: Image,
      color: 'from-green-500 to-green-600'
    },
    {
      type: StepType.VIDEO,
      name: 'Video',
      description: 'Video instructivo',
      icon: Video,
      color: 'from-purple-500 to-purple-600'
    }
  ]

  const handleCreateStep = () => {
    if (!formData.title.es) return

    const newStep: Step = {
      id: Date.now().toString(),
      type: newStepType,
      title: formData.title,
      content: formData.content,
      media: formData.media,
      order: steps.length + 1,
      isPublished: false
    }

    console.log('🆕 Creating new step:', { 
      step: newStep, 
      hasMedia: !!formData.media,
      mediaUrl: formData.media?.url,
      contentMediaUrl: (formData.content as any)?.mediaUrl
    })
    setSteps([...steps, newStep])
    resetForm()
  }

  const handleEditStep = (step: Step) => {
    console.log('✏️ Editing step:', step)
    setEditingStep(step)
    
    // Ensure we have the complete step data including media
    const formDataToSet = {
      title: step.title,
      content: step.content || {},
      media: step.media
    }
    
    console.log('📝 Setting form data for editing:', formDataToSet)
    setFormData(formDataToSet)
    setNewStepType(step.type)
    setShowCreateForm(true)
  }

  const handleUpdateStep = async () => {
    if (!editingStep || !formData.title.es || !propertyId || !zoneId) return

    setSaving(true)
    try {
      // Update the step in local state first
      const updatedSteps = steps.map(step => 
        step.id === editingStep.id 
          ? {
              ...step,
              title: formData.title,
              content: formData.content,
              media: formData.media,
              type: newStepType
            }
          : step
      )
      
      setSteps(updatedSteps)

      console.log('📝 Updating step:', { 
        stepId: editingStep.id, 
        hasMedia: !!formData.media,
        mediaUrl: formData.media?.url,
        contentMediaUrl: (formData.content as any)?.mediaUrl
      })

      // Save automatically to database
      const success = await saveStepsData(propertyId, zoneId, updatedSteps)
      
      if (success) {
        console.log('✅ Step updated and saved successfully')
        resetForm()
      } else {
        alert('Error al guardar el paso. Los cambios se han guardado localmente.')
      }
    } catch (error) {
      console.error('Error updating step:', error)
      alert('Error al guardar el paso. Los cambios se han guardado localmente.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId))
  }

  const handleReorder = (newOrder: Step[]) => {
    const reorderedSteps = newOrder.map((step, index) => ({
      ...step,
      order: index + 1
    }))
    setSteps(reorderedSteps)
  }

  const togglePublished = (stepId: string) => {
    setSteps(steps.map(step =>
      step.id === stepId 
        ? { ...step, isPublished: !step.isPublished }
        : step
    ))
  }

  const resetForm = () => {
    setFormData({ title: { es: '', en: '' }, content: {}, media: undefined })
    setEditingStep(null)
    setShowCreateForm(false)
    setNewStepType(StepType.TEXT)
  }

  const renderStepContent = (step: Step) => {
    switch (step.type) {
      case StepType.TEXT:
        return (
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700">{getMultilingualText(step.content, selectedLanguage, '')}</p>
          </div>
        )
      
      case StepType.IMAGE:
        return (
          <div className="space-y-3">
            {step.content.description && (
              <p className="text-sm text-gray-700 font-medium">
                {getMultilingualText(step.content.description, selectedLanguage, '')}
              </p>
            )}
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={step.content.imageUrl} 
                alt={getMultilingualText(step.title, selectedLanguage, 'Imagen')}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )
      
      case StepType.VIDEO:
        return (
          <div className="space-y-3">
            {step.content.description && (
              <p className="text-sm text-gray-700 font-medium">
                {getMultilingualText(step.content.description, selectedLanguage, '')}
              </p>
            )}
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
              {/* Try to get thumbnail from media first, then from content */}
              <img 
                src={step.media?.thumbnail || step.content.thumbnail || '/placeholder-video.jpg'} 
                alt={getMultilingualText(step.title, selectedLanguage, 'Video')}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                  <Video className="w-8 h-8 text-gray-700" />
                </div>
              </div>
              {/* Show video URL for debugging */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {step.media?.url ? '✅ Video URL' : step.content.mediaUrl ? '⚠️ Content URL' : '❌ No URL'}
              </div>
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {step.content.duration || 'N/A'}s
              </div>
            </div>
            {/* Debug info */}
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <p>🔍 Debug: Media URL = {step.media?.url || 'none'}</p>
              <p>🔍 Debug: Content URL = {step.content.mediaUrl || 'none'}</p>
            </div>
          </div>
        )
    }
  }

  const renderStepForm = () => {
    switch (newStepType) {
      case StepType.TEXT:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenido (Español)
              </label>
              <textarea
                value={(formData.content as any).es || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  content: { ...formData.content, es: e.target.value }
                })}
                placeholder="Escribe las instrucciones en español..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenido (Inglés)
              </label>
              <textarea
                value={(formData.content as any).en || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  content: { ...formData.content, en: e.target.value }
                })}
                placeholder="Write the instructions in English..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        )

      case StepType.IMAGE:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título de la imagen (opcional)
              </label>
              <input
                type="text"
                value={formData.title?.es || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  title: {
                    ...formData.title,
                    es: e.target.value
                  }
                })}
                placeholder="Ej: Entrada principal del edificio"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <div className="text-sm text-gray-600">
                  <button className="font-medium text-violet-600 hover:text-violet-500">
                    Subir archivo
                  </button>
                  {' o arrastra y suelta'}
                </div>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG hasta 10MB</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pie de foto (Español)
              </label>
              <textarea
                value={(formData.content as any).description?.es || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  content: {
                    ...formData.content,
                    description: {
                      ...(formData.content as any).description,
                      es: e.target.value
                    }
                  }
                })}
                placeholder="Texto que aparecerá arriba de la imagen..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-y min-h-[120px] sm:min-h-[140px]"
                rows={5}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pie de foto (Inglés)
              </label>
              <textarea
                value={(formData.content as any).description?.en || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  content: {
                    ...formData.content,
                    description: {
                      ...(formData.content as any).description,
                      en: e.target.value
                    }
                  }
                })}
                placeholder="Text that will appear above the image..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-y min-h-[120px] sm:min-h-[140px]"
                rows={5}
              />
            </div>
          </div>
        )

      case StepType.VIDEO:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título del video (opcional)
              </label>
              <input
                type="text"
                value={formData.title?.es || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  title: {
                    ...formData.title,
                    es: e.target.value
                  }
                })}
                placeholder="Ej: Cómo usar la llave digital"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video
              </label>
              <VideoUpload
                value={editingStep?.media?.url || editingStep?.content?.mediaUrl || ''}
                onChange={(videoUrl, metadata) => {
                  console.log('🎬 VideoUpload onChange called:', { videoUrl, metadata })
                  
                  if (videoUrl && metadata) {
                    const newFormData = {
                      ...formData,
                      content: {
                        ...formData.content,
                        mediaUrl: videoUrl,
                        thumbnail: metadata.thumbnail,
                        duration: metadata.duration
                      },
                      media: {
                        url: videoUrl,
                        thumbnail: metadata.thumbnail,
                        title: 'Video subido'
                      }
                    }
                    console.log('📝 Setting form data with video and media:', newFormData)
                    setFormData(newFormData)
                  } else {
                    // Clear media
                    const newFormData = {
                      ...formData,
                      content: {
                        ...formData.content,
                        mediaUrl: undefined,
                        thumbnail: undefined,
                        duration: undefined
                      },
                      media: undefined
                    }
                    console.log('🗑️ Clearing video from form data:', newFormData)
                    setFormData(newFormData)
                  }
                }}
                placeholder="Subir video VERTICAL (máx. 30 segundos)"
                maxSize={50}
                maxDuration={30}
                saveToLibrary={true}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pie de video (Español)
              </label>
              <textarea
                value={(formData.content as any).description?.es || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  content: {
                    ...formData.content,
                    description: {
                      ...(formData.content as any).description,
                      es: e.target.value
                    }
                  }
                })}
                placeholder="Texto que aparecerá arriba del video..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-y min-h-[120px] sm:min-h-[140px]"
                rows={5}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pie de video (Inglés)
              </label>
              <textarea
                value={(formData.content as any).description?.en || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  content: {
                    ...formData.content,
                    description: {
                      ...(formData.content as any).description,
                      en: e.target.value
                    }
                  }
                })}
                placeholder="Text that will appear above the video..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-y min-h-[120px] sm:min-h-[140px]"
                rows={5}
              />
            </div>
          </div>
        )
    }
  }

  if (loading) {
    return <AnimatedLoadingSpinner text="Cargando pasos de la zona..." type="zones" />
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <ZoneIconDisplay iconId={zone?.iconId || 'home'} size="sm" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {getMultilingualText(zone?.name, selectedLanguage, 'Zona')}
            </h1>
            <p className="text-gray-600">
              Editor de steps • {steps.length} pasos configurados
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedLanguage('es')}
                className={cn(
                  "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                  selectedLanguage === 'es'
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                🇪🇸 Español
              </button>
              <button
                onClick={() => setSelectedLanguage('en')}
                className={cn(
                  "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                  selectedLanguage === 'en'
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                🇬🇧 English
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={handleSaveSteps}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                // Open public zone page in new tab
                const publicUrl = `/guide/${propertyId}/${zoneId}`
                window.open(publicUrl, '_blank')
              }}
              className="flex items-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              Vista Previa
            </Button>
            
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Step
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Layout: Two Columns */}
      <div className="hidden lg:block">
        {/* Debug indicator - remove after testing */}
        <div className="mb-4 bg-blue-100 border border-blue-300 text-blue-800 px-4 py-2 rounded text-sm">
          🖥️ Desktop Timeline View ({steps.length} pasos)
        </div>
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Left Column - Steps (2/3 width) */}
        <div className="lg:col-span-2">
          {steps.length > 0 ? (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-300"></div>
              
              <Reorder.Group
                axis="y"
                values={steps}
                onReorder={handleReorder}
                className="space-y-6"
              >
                {steps.map((step, index) => (
                  <Reorder.Item
                    key={step.id}
                    value={step}
                    className="relative"
                  >
                    {/* Step Number Outside */}
                    <div className="absolute left-0 top-6">
                      <div className="w-12 h-12 bg-white border-4 border-gray-900 rounded-full flex items-center justify-center text-xl font-black text-gray-900 shadow-xl relative z-10">
                        {index + 1}
                      </div>
                    </div>
                    
                    {/* Step Content */}
                    <div className="ml-20">
                      <Card className="hover:shadow-md transition-shadow border-gray-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                              
                              <div className="flex items-center space-x-2">
                                {(() => {
                                  const stepType = stepTypes.find(t => t.type === step.type)
                                  const IconComponent = stepType?.icon || Type
                                  return (
                                    <div className={cn(
                                      "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r",
                                      stepType?.color || "from-gray-500 to-gray-600"
                                    )}>
                                      <IconComponent className="w-4 h-4 text-white" />
                                    </div>
                                  )
                                })()} 
                                
                                <div>
                                  {step.type === StepType.TEXT && (
                                    <CardTitle className="text-lg text-gray-900">
                                      {getMultilingualText(step.title, selectedLanguage, 'Paso')}
                                    </CardTitle>
                                  )}
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className={cn(
                                      "text-xs px-2 py-1 rounded-full",
                                      step.isPublished 
                                        ? "bg-green-100 text-green-800" 
                                        : "bg-yellow-100 text-yellow-800"
                                    )}>
                                      {step.isPublished ? 'Publicado' : 'Borrador'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {stepTypes.find(t => t.type === step.type)?.name}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => togglePublished(step.id)}
                                className={cn(
                                  "text-xs",
                                  step.isPublished 
                                    ? "text-yellow-600 hover:text-yellow-700" 
                                    : "text-green-600 hover:text-green-700"
                                )}
                              >
                                {step.isPublished ? 'Ocultar' : 'Publicar'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditStep(step)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteStep(step.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          {renderStepContent(step)}
                        </CardContent>
                      </Card>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
              
              {/* Add New Step Button */}
              <div className="relative mt-6">
                <div className="absolute left-0 top-6">
                  <div className="w-12 h-12 bg-white border-4 border-dashed border-gray-400 rounded-full flex items-center justify-center text-lg font-bold text-gray-400">
                    <Plus className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="ml-20">
                  <Card 
                    className="border-2 border-dashed border-gray-300 hover:border-violet-400 transition-colors cursor-pointer"
                    onClick={() => setShowCreateForm(true)}
                  >
                    <CardContent className="p-8 text-center">
                      <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 font-medium">Añadir nuevo paso</p>
                      <p className="text-gray-500 text-sm">Haz clic para crear un nuevo paso</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <Card className="text-center py-12 border-2 border-dashed border-gray-300">
              <CardContent>
                <div className="text-gray-400 text-lg mb-2">No hay steps configurados</div>
                <div className="text-gray-500 text-sm mb-6">
                  Crea tu primer step para comenzar a guiar a tus huéspedes
                </div>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Crear Primer Step
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Right Column - Tips & Info (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Best Practices Card */}
            <Card className="border-violet-200 bg-violet-50">
              <CardHeader>
                <CardTitle className="text-lg text-violet-900 flex items-center">
                  <div className="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-sm">💡</span>
                  </div>
                  Mejores Prácticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-violet-800">
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-violet-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Añade tantos pasos como necesites para ser claro</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-violet-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Los manuales que tienen imágenes son más fáciles de entender</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-violet-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Revisa que los pasos estén en los tres idiomas</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-violet-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Usa videos cortos para procesos complejos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Statistics Card */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 flex items-center">
                  <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-sm">📊</span>
                  </div>
                  Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Total pasos</span>
                    <span className="text-gray-900 font-semibold">{steps.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Publicados</span>
                    <span className="text-green-600 font-semibold">{steps.filter(s => s.isPublished).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Borradores</span>
                    <span className="text-yellow-600 font-semibold">{steps.filter(s => !s.isPublished).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Con imágenes</span>
                    <span className="text-blue-600 font-semibold">{steps.filter(s => s.type === StepType.IMAGE).length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Actions Card */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 flex items-center">
                  <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-sm">⚡</span>
                  </div>
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setShowCreateForm(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo paso
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => {
                      setSteps(steps.map(s => ({ ...s, isPublished: true })))
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Publicar todos
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={handleSaveSteps}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
      
      {/* Mobile Layout - Original Design */}
      <div className="lg:hidden">
        {steps.length > 0 ? (
          <Reorder.Group
            axis="y"
            values={steps}
            onReorder={handleReorder}
            className="space-y-4"
          >
            {steps.map((step, index) => (
              <Reorder.Item
                key={step.id}
                value={step}
                className="bg-white"
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                            {index + 1}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {(() => {
                            const stepType = stepTypes.find(t => t.type === step.type)
                            const IconComponent = stepType?.icon || Type
                            return (
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r",
                                stepType?.color || "from-gray-500 to-gray-600"
                              )}>
                                <IconComponent className="w-4 h-4 text-white" />
                              </div>
                            )
                          })()} 
                          
                          <div>
                            {step.type === StepType.TEXT && (
                              <CardTitle className="text-lg">
                                {getMultilingualText(step.title, selectedLanguage, 'Paso')}
                              </CardTitle>
                            )}
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={cn(
                                "text-xs px-2 py-1 rounded-full",
                                step.isPublished 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              )}>
                                {step.isPublished ? 'Publicado' : 'Borrador'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {stepTypes.find(t => t.type === step.type)?.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePublished(step.id)}
                          className={cn(
                            "text-xs",
                            step.isPublished 
                              ? "text-yellow-600 hover:text-yellow-700" 
                              : "text-green-600 hover:text-green-700"
                          )}
                        >
                          {step.isPublished ? 'Ocultar' : 'Publicar'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStep(step)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStep(step.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {renderStepContent(step)}
                  </CardContent>
                </Card>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 text-lg mb-2">No hay steps configurados</div>
              <div className="text-gray-500 text-sm mb-6">
                Crea tu primer step para comenzar a guiar a tus huéspedes
              </div>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Crear Primer Step
              </Button>
            </CardContent>
          </Card>
        )}
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
              className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">
                  {editingStep ? 'Editar Step' : 'Nuevo Step'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Step Type Selection */}
                {!editingStep && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Tipo de Step
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {stepTypes.map((type) => (
                        <button
                          key={type.type}
                          onClick={() => setNewStepType(type.type)}
                          className={cn(
                            "p-4 border-2 rounded-lg text-center transition-all",
                            newStepType === type.type
                              ? "border-violet-500 bg-violet-50"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <div className={cn(
                            "w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-r flex items-center justify-center",
                            type.color
                          )}>
                            <type.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="font-medium text-gray-900">{type.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título (Español)
                  </label>
                  <Input
                    value={formData.title.es}
                    onChange={(e) => setFormData({
                      ...formData,
                      title: { ...formData.title, es: e.target.value }
                    })}
                    placeholder="Título del step en español..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título (Inglés)
                  </label>
                  <Input
                    value={formData.title.en}
                    onChange={(e) => setFormData({
                      ...formData,
                      title: { ...formData.title, en: e.target.value }
                    })}
                    placeholder="Step title in English..."
                  />
                </div>

                {/* Content based on type */}
                {renderStepForm()}
              </div>

              <div className="flex space-x-3 mt-8">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={editingStep ? handleUpdateStep : handleCreateStep}
                  disabled={!formData.title.es || saving}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingStep ? 'Guardar' : 'Crear Step'}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}