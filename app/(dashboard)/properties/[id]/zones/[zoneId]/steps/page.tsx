'use client'

import React, { useState } from 'react'
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
  Link
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ZoneIconDisplay, useZoneIcon } from '@/components/ui/IconSelector'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

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

// Mock data - esto será reemplazado por datos reales del API
const mockZone: Zone = {
  id: '1',
  name: { es: 'Lavadora', en: 'Washing Machine' },
  description: { es: 'Instrucciones para usar la lavadora', en: 'Instructions for using the washing machine' },
  iconId: 'washing',
  qrCode: 'abc123',
  stepsCount: 4
}

const mockSteps: Step[] = [
  {
    id: '1',
    type: StepType.TEXT,
    title: { es: 'Preparación', en: 'Preparation' },
    content: {
      es: 'Asegúrate de que la ropa esté separada por colores y tipos de tejido.',
      en: 'Make sure clothes are separated by colors and fabric types.'
    },
    order: 1,
    isPublished: true
  },
  {
    id: '2',
    type: StepType.IMAGE,
    title: { es: 'Panel de Control', en: 'Control Panel' },
    content: {
      imageUrl: '/api/placeholder/400/300',
      description: {
        es: 'Localiza el panel de control en la parte frontal de la lavadora',
        en: 'Locate the control panel on the front of the washing machine'
      }
    },
    order: 2,
    isPublished: true
  },
  {
    id: '3',
    type: StepType.VIDEO,
    title: { es: 'Seleccionar Programa', en: 'Select Program' },
    content: {
      videoUrl: '/api/placeholder/video',
      thumbnail: '/api/placeholder/400/300',
      duration: 30,
      description: {
        es: 'Selecciona el programa adecuado según el tipo de ropa',
        en: 'Select the appropriate program according to the type of clothes'
      }
    },
    order: 3,
    isPublished: true
  },
  {
    id: '4',
    type: StepType.TEXT,
    title: { es: 'Iniciar Lavado', en: 'Start Washing' },
    content: {
      es: 'Presiona el botón de inicio y espera a que termine el ciclo.',
      en: 'Press the start button and wait for the cycle to finish.'
    },
    order: 4,
    isPublished: false
  }
]

export default function ZoneStepsPage({ 
  params 
}: { 
  params: { id: string; zoneId: string } 
}) {
  const router = useRouter()
  const [steps, setSteps] = useState<Step[]>(mockSteps)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingStep, setEditingStep] = useState<Step | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<'es' | 'en'>('es')
  const [newStepType, setNewStepType] = useState<StepType>(StepType.TEXT)

  const [formData, setFormData] = useState({
    title: { es: '', en: '' },
    content: {}
  })

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
      order: steps.length + 1,
      isPublished: false
    }

    setSteps([...steps, newStep])
    resetForm()
  }

  const handleEditStep = (step: Step) => {
    setEditingStep(step)
    setFormData({
      title: step.title,
      content: step.content
    })
    setNewStepType(step.type)
    setShowCreateForm(true)
  }

  const handleUpdateStep = () => {
    if (!editingStep || !formData.title.es) return

    setSteps(steps.map(step => 
      step.id === editingStep.id 
        ? {
            ...step,
            title: formData.title,
            content: formData.content,
            type: newStepType
          }
        : step
    ))

    resetForm()
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
    setFormData({ title: { es: '', en: '' }, content: {} })
    setEditingStep(null)
    setShowCreateForm(false)
    setNewStepType(StepType.TEXT)
  }

  const renderStepContent = (step: Step) => {
    switch (step.type) {
      case StepType.TEXT:
        return (
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700">{step.content[selectedLanguage] || step.content.es}</p>
          </div>
        )
      
      case StepType.IMAGE:
        return (
          <div className="space-y-3">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={step.content.imageUrl} 
                alt={step.title[selectedLanguage]}
                className="w-full h-full object-cover"
              />
            </div>
            {step.content.description && (
              <p className="text-sm text-gray-600">
                {step.content.description[selectedLanguage] || step.content.description.es}
              </p>
            )}
          </div>
        )
      
      case StepType.VIDEO:
        return (
          <div className="space-y-3">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
              <img 
                src={step.content.thumbnail} 
                alt={step.title[selectedLanguage]}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                  <Video className="w-8 h-8 text-gray-700" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {step.content.duration}s
              </div>
            </div>
            {step.content.description && (
              <p className="text-sm text-gray-600">
                {step.content.description[selectedLanguage] || step.content.description.es}
              </p>
            )}
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
                Descripción (Español)
              </label>
              <Input
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
                placeholder="Descripción de la imagen..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (Inglés)
              </label>
              <Input
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
                placeholder="Image description..."
              />
            </div>
          </div>
        )

      case StepType.VIDEO:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Video className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <div className="text-sm text-gray-600">
                  <button className="font-medium text-violet-600 hover:text-violet-500">
                    Subir video
                  </button>
                  {' o introduce URL'}
                </div>
                <p className="text-xs text-gray-500 mt-1">MP4, WebM hasta 50MB (máx. 30s)</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL del video (opcional)
              </label>
              <Input
                value={(formData.content as any).videoUrl || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  content: { ...formData.content, videoUrl: e.target.value }
                })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (Español)
              </label>
              <Input
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
                placeholder="Descripción del video..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (Inglés)
              </label>
              <Input
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
                placeholder="Video description..."
              />
            </div>
          </div>
        )
    }
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
          <ZoneIconDisplay iconId={mockZone.iconId} size="sm" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {mockZone.name[selectedLanguage]}
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
            >
              <Eye className="w-4 h-4 mr-2" />
              Vista Previa
            </Button>
          </div>

          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-violet-600 hover:bg-violet-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Step
          </Button>
        </div>
      </div>

      {/* Steps List */}
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
                          <CardTitle className="text-lg">
                            {step.title[selectedLanguage] || step.title.es}
                          </CardTitle>
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
                  disabled={!formData.title.es}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingStep ? 'Actualizar' : 'Crear Step'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}