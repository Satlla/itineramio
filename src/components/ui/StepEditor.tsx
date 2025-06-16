'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Link as LinkIcon,
  Youtube,
  Globe,
  ChevronDown,
  ChevronUp,
  Upload,
  Play,
  ExternalLink,
  Check,
  AlertCircle,
  ChevronRight,
  CheckCircle
} from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import { Input } from './Input'
import { Badge } from './Badge'

export interface Step {
  id: string
  type: 'text' | 'image' | 'video' | 'youtube' | 'link'
  content: {
    es: string
    en?: string
    fr?: string
  }
  media?: {
    url: string
    thumbnail?: string
    title?: string
  }
  order: number
}

interface StepEditorProps {
  zoneTitle: string
  initialSteps?: Step[]
  onSave: (steps: Step[]) => void
  onCancel: () => void
  maxVideos?: number
  currentVideoCount?: number
}

export function StepEditor({
  zoneTitle,
  initialSteps = [],
  onSave,
  onCancel,
  maxVideos = 5,
  currentVideoCount = 0
}: StepEditorProps) {
  const [steps, setSteps] = useState<Step[]>(
    initialSteps.length > 0 ? initialSteps : [createNewStep(0)]
  )
  const [activeStep, setActiveStep] = useState(0)
  const [activeLanguage, setActiveLanguage] = useState<'es' | 'en' | 'fr'>('es')
  const [draggedStep, setDraggedStep] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function createNewStep(order: number): Step {
    return {
      id: `step-${Date.now()}-${Math.random()}`,
      type: 'text',
      content: { es: '' },
      order
    }
  }

  const addStep = () => {
    const newStep = createNewStep(steps.length)
    setSteps([...steps, newStep])
    setActiveStep(steps.length)
  }

  const removeStep = (stepId: string) => {
    const newSteps = steps.filter(step => step.id !== stepId)
    setSteps(newSteps.map((step, index) => ({ ...step, order: index })))
    setActiveStep(Math.max(0, activeStep - 1))
  }

  const updateStep = (stepId: string, updates: Partial<Step>) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ))
  }

  const updateStepContent = (stepId: string, language: 'es' | 'en' | 'fr', content: string) => {
    setSteps(steps.map(step => 
      step.id === stepId 
        ? { 
            ...step, 
            content: { 
              ...step.content, 
              [language]: content 
            } 
          } 
        : step
    ))
  }

  const handleFileUpload = async (stepId: string, file: File) => {
    // Mock file upload - in real app, upload to your server
    const mockUrl = URL.createObjectURL(file)
    
    updateStep(stepId, {
      type: file.type.startsWith('video/') ? 'video' : 'image',
      media: {
        url: mockUrl,
        thumbnail: file.type.startsWith('video/') ? mockUrl : undefined,
        title: file.name
      }
    })
  }

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const handleYouTubeLink = (stepId: string, url: string) => {
    const videoId = extractYouTubeId(url)
    if (videoId) {
      updateStep(stepId, {
        type: 'youtube',
        media: {
          url: url,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          title: 'Video de YouTube'
        }
      })
    }
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="w-4 h-4" />
      case 'image': return <ImageIcon className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'youtube': return <Youtube className="w-4 h-4" />
      case 'link': return <LinkIcon className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-500'
      case 'image': return 'bg-green-500'
      case 'video': return 'bg-red-500'
      case 'youtube': return 'bg-red-600'
      case 'link': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const languages = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' }
  ]

  const getVideoCount = () => {
    return steps.filter(step => step.type === 'video').length + currentVideoCount
  }

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{zoneTitle}</h1>
            <p className="text-gray-600 text-sm mt-1">
              Crea las instrucciones paso a paso para esta zona
            </p>
          </div>
          <div className="flex items-center gap-3">
            {getVideoCount() > 0 && (
              <Badge variant={getVideoCount() >= maxVideos ? 'destructive' : 'default'}>
                Videos: {getVideoCount()}/{maxVideos}
              </Badge>
            )}
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              onClick={() => onSave(steps)}
              className="bg-gray-900 hover:bg-gray-800 text-white"
              disabled={steps.every(step => !step.content.es.trim())}
            >
              <span className="hidden sm:inline">Guardar Instrucciones</span>
              <span className="sm:hidden">Guardar</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
          {/* Timeline Sidebar - Mobile: Horizontal scrollable, Desktop: Vertical */}
          <div className="col-span-1 lg:col-span-3 order-2 lg:order-1">
            <Card className={`${isMobile ? 'p-3' : 'p-6'} ${isMobile ? '' : 'lg:sticky lg:top-6'}`}>
              {!isMobile && (
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-600 rounded-full" />
                  Itinerario de pasos
                </h3>
              )}
              
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <motion.button
                    key={step.id}
                    onClick={() => setActiveStep(index)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      activeStep === index
                        ? 'bg-violet-50 border-2 border-violet-200 shadow-sm'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Step number with connecting line */}
                      <div className="relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white ${
                          activeStep === index ? 'bg-violet-600' : getStepTypeColor(step.type)
                        }`}>
                          {index + 1}
                        </div>
                        
                        {/* Connecting line */}
                        {index < steps.length - 1 && (
                          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gray-300" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getStepIcon(step.type)}
                          <span className="text-xs font-medium text-gray-600 uppercase">
                            {step.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 truncate">
                          {step.content.es || `Paso ${index + 1}`}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
                
                {/* End cap */}
                <div className="flex items-center justify-center pt-4">
                  <div className="w-4 h-4 bg-gray-300 rounded-full" />
                </div>
              </div>

              <Button
                onClick={addStep}
                variant="outline"
                className="w-full mt-4 border-dashed border-gray-300 text-gray-600 hover:border-violet-300 hover:text-violet-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir paso
              </Button>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-1 lg:col-span-9 order-1 lg:order-2">
            <AnimatePresence mode="wait">
              {steps[activeStep] && (
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-8">
                    {/* Step Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getStepTypeColor(steps[activeStep].type)}`}>
                            {activeStep + 1}
                          </div>
                          Paso {activeStep + 1}
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                          Personaliza el contenido de este paso
                        </p>
                      </div>
                      
                      {steps.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeStep(steps[activeStep].id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Step Type Selector */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Tipo de contenido
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { type: 'text', label: 'Texto', icon: FileText, color: 'blue' },
                          { type: 'image', label: 'Imagen', icon: ImageIcon, color: 'green' },
                          { type: 'video', label: 'Video', icon: Video, color: 'red', disabled: getVideoCount() >= maxVideos && steps[activeStep].type !== 'video' },
                          { type: 'youtube', label: 'YouTube', icon: Youtube, color: 'red' },
                          { type: 'link', label: 'Enlace', icon: LinkIcon, color: 'purple' }
                        ].map(({ type, label, icon: Icon, color, disabled }) => (
                          <button
                            key={type}
                            onClick={() => updateStep(steps[activeStep].id, { type: type as any })}
                            disabled={disabled}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              steps[activeStep].type === type
                                ? color === 'blue' ? 'border-blue-500 bg-blue-50'
                                : color === 'green' ? 'border-green-500 bg-green-50'
                                : color === 'red' ? 'border-red-500 bg-red-50'
                                : color === 'purple' ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-500 bg-gray-50'
                                : disabled
                                ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <Icon className={`w-5 h-5 mx-auto mb-2 ${
                              steps[activeStep].type === type 
                                ? color === 'blue' ? 'text-blue-600'
                                : color === 'green' ? 'text-green-600'
                                : color === 'red' ? 'text-red-600'
                                : color === 'purple' ? 'text-purple-600'
                                : 'text-gray-600'
                                : 'text-gray-600'
                            }`} />
                            <div className="text-xs font-medium">{label}</div>
                            {disabled && type === 'video' && (
                              <div className="text-xs text-red-600 mt-1">Límite alcanzado</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Language Tabs */}
                    <div className="mb-6">
                      <div className="flex items-center gap-4 mb-4">
                        <label className="text-sm font-medium text-gray-700">
                          Idiomas
                        </label>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                          {languages.map(lang => (
                            <button
                              key={lang.code}
                              onClick={() => setActiveLanguage(lang.code as any)}
                              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                activeLanguage === lang.code
                                  ? 'bg-white text-gray-900 shadow-sm'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              <span className="mr-2">{lang.flag}</span>
                              {lang.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {activeLanguage !== 'es' && !steps[activeStep].content[activeLanguage] && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span className="text-sm text-amber-800">
                              Traducción opcional - Se mostrará el español si no se proporciona
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content Editor */}
                    <div className="space-y-6">
                      {steps[activeStep].type === 'text' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contenido del paso
                          </label>
                          <textarea
                            value={steps[activeStep].content[activeLanguage] || ''}
                            onChange={(e) => updateStepContent(steps[activeStep].id, activeLanguage, e.target.value)}
                            placeholder={`Escribe las instrucciones en ${languages.find(l => l.code === activeLanguage)?.label}...`}
                            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                          />
                        </div>
                      )}

                      {(steps[activeStep].type === 'image' || steps[activeStep].type === 'video') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subir {steps[activeStep].type === 'image' ? 'imagen' : 'video'}
                          </label>
                          
                          {!steps[activeStep].media?.url ? (
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-violet-400 transition-colors cursor-pointer"
                            >
                              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600 mb-2">
                                Arrastra y suelta o haz clic para subir
                              </p>
                              <p className="text-xs text-gray-500">
                                {steps[activeStep].type === 'video' 
                                  ? 'MP4, máximo 30 segundos' 
                                  : 'PNG, JPG hasta 10MB'
                                }
                              </p>
                            </div>
                          ) : (
                            <div className="bg-gray-100 rounded-lg p-4">
                              {steps[activeStep].type === 'image' ? (
                                <img
                                  src={steps[activeStep].media?.url}
                                  alt="Preview"
                                  className="max-h-64 mx-auto rounded-lg"
                                />
                              ) : (
                                <div className="bg-black rounded-lg aspect-video max-w-md mx-auto flex items-center justify-center">
                                  <Play className="w-16 h-16 text-white opacity-75" />
                                </div>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-3"
                              >
                                Cambiar archivo
                              </Button>
                            </div>
                          )}

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept={steps[activeStep].type === 'image' ? 'image/*' : 'video/*'}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleFileUpload(steps[activeStep].id, file)
                            }}
                            className="hidden"
                          />

                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Descripción (opcional)
                            </label>
                            <Input
                              value={steps[activeStep].content[activeLanguage] || ''}
                              onChange={(e) => updateStepContent(steps[activeStep].id, activeLanguage, e.target.value)}
                              placeholder="Descripción de la imagen/video"
                            />
                          </div>
                        </div>
                      )}

                      {steps[activeStep].type === 'youtube' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              URL de YouTube
                            </label>
                            <Input
                              placeholder="https://www.youtube.com/watch?v=..."
                              onChange={(e) => handleYouTubeLink(steps[activeStep].id, e.target.value)}
                            />
                          </div>

                          {steps[activeStep].media?.url && (
                            <div className="bg-gray-100 rounded-lg p-4">
                              <div className="aspect-video bg-black rounded-lg mb-3 overflow-hidden">
                                <img
                                  src={steps[activeStep].media.thumbnail}
                                  alt="YouTube thumbnail"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Youtube className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-medium">Video de YouTube detectado</span>
                                <ExternalLink className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Descripción
                            </label>
                            <Input
                              value={steps[activeStep].content[activeLanguage] || ''}
                              onChange={(e) => updateStepContent(steps[activeStep].id, activeLanguage, e.target.value)}
                              placeholder="Descripción del video"
                            />
                          </div>
                        </div>
                      )}

                      {steps[activeStep].type === 'link' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              URL del enlace
                            </label>
                            <Input
                              placeholder="https://ejemplo.com"
                              onChange={(e) => updateStep(steps[activeStep].id, {
                                media: { url: e.target.value }
                              })}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Texto del enlace
                            </label>
                            <Input
                              value={steps[activeStep].content[activeLanguage] || ''}
                              onChange={(e) => updateStepContent(steps[activeStep].id, activeLanguage, e.target.value)}
                              placeholder="Manual de la vitrocerámica"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                        disabled={activeStep === 0}
                        size={isMobile ? 'sm' : 'default'}
                      >
                        <span className="hidden sm:inline">Paso anterior</span>
                        <span className="sm:hidden">Anterior</span>
                      </Button>
                      
                      <span className="text-xs sm:text-sm text-gray-500">
                        Paso {activeStep + 1} de {steps.length}
                      </span>
                      
                      <div className="flex gap-2">
                        {activeStep === steps.length - 1 && steps.length > 0 && (
                          <Button
                            onClick={() => onSave(steps)}
                            variant="outline"
                            size={isMobile ? 'sm' : 'default'}
                            className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Finalizar</span>
                            <span className="sm:hidden">Fin</span>
                          </Button>
                        )}
                        <Button
                          onClick={() => {
                            if (activeStep === steps.length - 1) {
                              addStep()
                            } else {
                              setActiveStep(activeStep + 1)
                            }
                          }}
                          className="bg-violet-600 hover:bg-violet-700 text-white"
                          size={isMobile ? 'sm' : 'default'}
                        >
                          {activeStep === steps.length - 1 ? (
                            <><Plus className="w-4 h-4 mr-1" />Añadir</>
                          ) : (
                            <>Siguiente<ChevronRight className="w-4 h-4 ml-1" /></>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}