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
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto scroll to active step in mobile
  useEffect(() => {
    if (isMobile && activeStep >= 0) {
      const stepElement = document.getElementById(`step-${activeStep}`)
      if (stepElement) {
        stepElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }
    }
  }, [activeStep, isMobile])

  // Mobile Step Editor Component
  const MobileStepEditor = ({ 
    step, 
    stepIndex, 
    updateStep, 
    updateStepContent, 
    handleFileUpload, 
    handleYouTubeLink, 
    getVideoCount, 
    maxVideos, 
    languages, 
    activeLanguage, 
    setActiveLanguage, 
    fileInputRef 
  }: any) => (
    <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
      {/* Step Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de contenido</label>
        <div className="grid grid-cols-5 gap-1">
          {[
            { type: 'text', label: 'Texto', icon: FileText, color: 'blue' },
            { type: 'image', label: 'Imagen', icon: ImageIcon, color: 'green' },
            { type: 'video', label: 'Video', icon: Video, color: 'red', disabled: getVideoCount() >= maxVideos && step.type !== 'video' },
            { type: 'youtube', label: 'YouTube', icon: Youtube, color: 'red' },
            { type: 'link', label: 'Enlace', icon: LinkIcon, color: 'purple' }
          ].map(({ type, label, icon: Icon, color, disabled }) => (
            <button
              key={type}
              onClick={() => updateStep(step.id, { type: type as any })}
              disabled={disabled}
              className={`p-2 rounded-lg border-2 transition-all text-xs ${
                step.type === type
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
              <Icon className={`w-3 h-3 mx-auto mb-1 ${
                step.type === type 
                  ? color === 'blue' ? 'text-blue-600'
                  : color === 'green' ? 'text-green-600'
                  : color === 'red' ? 'text-red-600'
                  : color === 'purple' ? 'text-purple-600'
                  : 'text-gray-600'
                  : 'text-gray-600'
              }`} />
              <div className="font-medium">{label}</div>
              {disabled && type === 'video' && (
                <div className="text-xs text-red-600 mt-1">Límite</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Language Tabs */}
      <div>
        <div className="flex bg-gray-100 rounded-lg p-1 mb-3">
          {languages.map((lang: any) => (
            <button
              key={lang.code}
              onClick={() => setActiveLanguage(lang.code as any)}
              className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeLanguage === lang.code
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-1">{lang.flag}</span>
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Editor */}
      {step.type === 'text' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contenido</label>
          <textarea
            value={step.content[activeLanguage] || ''}
            onChange={(e) => updateStepContent(step.id, activeLanguage, e.target.value)}
            placeholder={`Escribe las instrucciones...`}
            className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-sm"
          />
        </div>
      )}

      {(step.type === 'image' || step.type === 'video') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {step.type === 'image' ? 'Imagen' : 'Video'}
          </label>
          {!step.media?.url ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-violet-400 transition-colors cursor-pointer"
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm mb-1">Toca para subir</p>
              <p className="text-xs text-gray-500">
                {step.type === 'video' ? 'MP4, máx 30 seg' : 'PNG, JPG hasta 10MB'}
              </p>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-3">
              {step.type === 'image' ? (
                <img src={step.media?.url} alt="Preview" className="max-h-32 mx-auto rounded-lg" />
              ) : (
                <div className="bg-black rounded-lg aspect-video max-w-48 mx-auto flex items-center justify-center">
                  <Play className="w-8 h-8 text-white opacity-75" />
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 w-full"
              >
                Cambiar archivo
              </Button>
            </div>
          )}
          <Input
            value={step.content[activeLanguage] || ''}
            onChange={(e) => updateStepContent(step.id, activeLanguage, e.target.value)}
            placeholder="Descripción (opcional)"
            className="mt-2"
          />
        </div>
      )}

      {step.type === 'youtube' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL de YouTube</label>
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              onChange={(e) => handleYouTubeLink(step.id, e.target.value)}
            />
          </div>
          {step.media?.url && (
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="aspect-video bg-black rounded-lg mb-2 overflow-hidden">
                <img src={step.media.thumbnail} alt="YouTube thumbnail" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium">Video de YouTube detectado</span>
              </div>
            </div>
          )}
          <Input
            value={step.content[activeLanguage] || ''}
            onChange={(e) => updateStepContent(step.id, activeLanguage, e.target.value)}
            placeholder="Descripción del video"
          />
        </div>
      )}

      {step.type === 'link' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL del enlace</label>
            <Input
              placeholder="https://ejemplo.com"
              onChange={(e) => updateStep(step.id, { media: { url: e.target.value } })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Texto del enlace</label>
            <Input
              value={step.content[activeLanguage] || ''}
              onChange={(e) => updateStepContent(step.id, activeLanguage, e.target.value)}
              placeholder="Manual de la vitrocerámica"
            />
          </div>
        </div>
      )}
    </div>
  )

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

      {/* Mobile Layout: Vertical Timeline */}
      {isMobile ? (
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Steps Timeline */}
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
            
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                id={`step-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative mb-6 ${
                  activeStep === index ? 'bg-violet-50 rounded-lg p-4 border-2 border-violet-200' : ''
                }`}
              >
                {/* Step number */}
                <div className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
                  activeStep === index ? 'bg-violet-600' : getStepTypeColor(step.type)
                }`}>
                  {index + 1}
                </div>
                
                {/* Step Content */}
                <div className="ml-16">
                  <div className="flex items-center gap-2 mb-2">
                    {getStepIcon(step.type)}
                    <span className="text-xs font-medium text-gray-600 uppercase">{step.type}</span>
                    {steps.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStep(step.id)}
                        className="ml-auto text-red-600 hover:bg-red-50 w-6 h-6 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  
                  {activeStep === index ? (
                    <MobileStepEditor 
                      step={step}
                      stepIndex={index}
                      updateStep={updateStep}
                      updateStepContent={updateStepContent}
                      handleFileUpload={handleFileUpload}
                      handleYouTubeLink={handleYouTubeLink}
                      getVideoCount={getVideoCount}
                      maxVideos={maxVideos}
                      languages={languages}
                      activeLanguage={activeLanguage}
                      setActiveLanguage={setActiveLanguage}
                      fileInputRef={fileInputRef}
                    />
                  ) : (
                    <div 
                      onClick={() => setActiveStep(index)}
                      className="cursor-pointer bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300"
                    >
                      <p className="text-sm text-gray-900">
                        {step.content.es || `Configura el paso ${index + 1}`}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {/* End cap */}
            <div className="relative">
              <div className="absolute left-0 w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
          
          {/* Add Step Button */}
          <div className="ml-16">
            <Button
              onClick={addStep}
              variant="outline"
              className="border-dashed border-gray-300 text-gray-600 hover:border-violet-300 hover:text-violet-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir paso
            </Button>
            
            {/* Finish Button */}
            {steps.length > 0 && (
              <Button
                onClick={() => onSave(steps)}
                className="ml-3 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Finalizar
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Desktop Layout: Main content + iPhone Preview */
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="col-span-1 lg:col-span-8">
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
                          onClick={addStep}
                          variant="outline"
                          className="border-dashed border-gray-300 text-gray-600 hover:border-violet-300 hover:text-violet-600"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Añadir paso
                        </Button>
                        
                        <span className="text-sm text-gray-500">
                          Paso {activeStep + 1} de {steps.length}
                        </span>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                            disabled={activeStep === 0}
                          >
                            Anterior
                          </Button>
                          
                          {activeStep === steps.length - 1 ? (
                            <Button
                              onClick={() => onSave(steps)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Finalizar
                            </Button>
                          ) : (
                            <Button
                              onClick={() => setActiveStep(activeStep + 1)}
                              className="bg-violet-600 hover:bg-violet-700 text-white"
                            >
                              Siguiente
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* iPhone 16 Pro Preview */}
            <div className="col-span-1 lg:col-span-4">
              <div className="sticky top-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Vista previa del huésped</h3>
                  <p className="text-sm text-gray-600">Cómo verá el manual en su móvil</p>
                </div>
                
                {/* iPhone 16 Pro Mockup */}
                <div className="mx-auto relative" style={{ width: '280px', height: '600px' }}>
                  {/* iPhone Frame */}
                  <div className="absolute inset-0 bg-black rounded-[3rem] p-2">
                    <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                      {/* Dynamic Island */}
                      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10"></div>
                      
                      {/* Screen Content */}
                      <div className="pt-12 pb-8 px-4 h-full overflow-y-auto">
                        {/* Zone Header */}
                        <div className="text-center mb-6">
                          <h2 className="text-lg font-bold text-gray-900 mb-1">{zoneTitle}</h2>
                          <p className="text-xs text-gray-600">Manual de instrucciones</p>
                        </div>

                        {/* Steps Preview */}
                        <div className="space-y-4">
                          {steps.map((step, index) => (
                            <div key={step.id} className={`bg-gray-50 rounded-lg p-3 ${index === activeStep ? 'ring-2 ring-violet-500' : ''}`}>
                              <div className="flex items-start gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${getStepTypeColor(step.type)}`}>
                                  {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1 mb-1">
                                    {getStepIcon(step.type)}
                                    <span className="text-xs text-gray-500 uppercase font-medium">{step.type}</span>
                                  </div>
                                  <p className="text-xs text-gray-900 leading-relaxed">
                                    {step.content.es || `Paso ${index + 1} - Añade contenido`}
                                  </p>
                                  
                                  {/* Media Preview */}
                                  {step.media?.url && (
                                    <div className="mt-2">
                                      {step.type === 'image' && (
                                        <div className="bg-gray-200 rounded aspect-video w-full flex items-center justify-center">
                                          <ImageIcon className="w-4 h-4 text-gray-500" />
                                        </div>
                                      )}
                                      {(step.type === 'video' || step.type === 'youtube') && (
                                        <div className="bg-black rounded aspect-video w-full flex items-center justify-center">
                                          <Play className="w-4 h-4 text-white" />
                                        </div>
                                      )}
                                      {step.type === 'link' && (
                                        <div className="bg-blue-50 border border-blue-200 rounded p-2 flex items-center gap-2">
                                          <LinkIcon className="w-3 h-3 text-blue-600" />
                                          <span className="text-xs text-blue-700 truncate">Enlace externo</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {steps.length === 0 && (
                            <div className="text-center py-8">
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Plus className="w-6 h-6 text-gray-400" />
                              </div>
                              <p className="text-xs text-gray-500">Añade el primer paso para empezar</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}