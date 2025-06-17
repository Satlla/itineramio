'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Link as LinkIcon,
  Youtube,
  Upload,
  Camera,
  Film,
  Type,
  Globe,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  X,
  Sparkles
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

interface MobileStepEditorProps {
  zoneTitle: string
  initialSteps?: Step[]
  onSave: (steps: Step[]) => void
  onCancel: () => void
  maxVideos?: number
  currentVideoCount?: number
}

export function MobileStepEditor({
  zoneTitle,
  initialSteps = [],
  onSave,
  onCancel,
  maxVideos = 5,
  currentVideoCount = 0
}: MobileStepEditorProps) {
  const [steps, setSteps] = useState<Step[]>(
    initialSteps.length > 0 ? initialSteps : [createNewStep(0)]
  )
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [activeLanguage, setActiveLanguage] = useState<'es' | 'en' | 'fr'>('es')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  function createNewStep(order: number): Step {
    return {
      id: `step-${Date.now()}-${Math.random()}`,
      type: 'text',
      content: { es: '' },
      order
    }
  }

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showMediaModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showMediaModal])

  const currentStep = steps[currentStepIndex]

  const addNewStep = () => {
    const newStep = createNewStep(steps.length)
    setSteps([...steps, newStep])
    
    // Animate to new step
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentStepIndex(steps.length)
      setIsTransitioning(false)
    }, 300)
  }

  const removeCurrentStep = () => {
    if (steps.length <= 1) return
    
    const newSteps = steps.filter((_, index) => index !== currentStepIndex)
    setSteps(newSteps)
    
    // Adjust current index
    if (currentStepIndex >= newSteps.length) {
      setCurrentStepIndex(newSteps.length - 1)
    }
  }

  const updateCurrentStep = (updates: Partial<Step>) => {
    setSteps(steps.map((step, index) => 
      index === currentStepIndex ? { ...step, ...updates } : step
    ))
  }

  const updateStepContent = (language: 'es' | 'en' | 'fr', content: string) => {
    setSteps(steps.map((step, index) => 
      index === currentStepIndex 
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

  const handleMediaSelect = (type: 'image' | 'video' | 'text' | 'youtube' | 'link') => {
    updateCurrentStep({ type })
    setShowMediaModal(false)
    
    if (type === 'image' || type === 'video') {
      // Auto open file picker
      setTimeout(() => {
        fileInputRef.current?.click()
      }, 300)
    }
  }

  const goToStep = (index: number) => {
    if (index < 0 || index >= steps.length) return
    
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentStepIndex(index)
      setIsTransitioning(false)
    }, 150)
  }

  const languages = [
    { code: 'es', label: 'ES', flag: '🇪🇸' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'fr', label: 'FR', flag: '🇫🇷' }
  ]

  const getVideoCount = () => {
    return steps.filter(step => step.type === 'video').length + currentVideoCount
  }

  const MediaSelectionModal = () => (
    <AnimatePresence>
      {showMediaModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-end"
          onClick={() => setShowMediaModal(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full bg-white rounded-t-3xl p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
            
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Añadir contenido
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleMediaSelect('text')}
                className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-2xl border-2 border-blue-200 active:scale-95 transition-transform"
              >
                <Type className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Texto</span>
              </button>
              
              <button
                onClick={() => handleMediaSelect('image')}
                className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-2xl border-2 border-green-200 active:scale-95 transition-transform"
              >
                <Camera className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Foto</span>
              </button>
              
              <button
                onClick={() => handleMediaSelect('video')}
                disabled={getVideoCount() >= maxVideos}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 active:scale-95 transition-transform ${
                  getVideoCount() >= maxVideos 
                    ? 'bg-gray-50 border-gray-200 opacity-50' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <Film className="w-8 h-8 text-red-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Video</span>
                {getVideoCount() >= maxVideos && (
                  <span className="text-xs text-red-600 mt-1">Límite alcanzado</span>
                )}
              </button>
              
              <button
                onClick={() => handleMediaSelect('link')}
                className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-2xl border-2 border-purple-200 active:scale-95 transition-transform"
              >
                <Globe className="w-8 h-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Enlace</span>
              </button>
            </div>
            
            <button
              onClick={() => setShowMediaModal(false)}
              className="w-full mt-4 p-3 text-gray-600 font-medium"
            >
              Cancelar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header - Fixed */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={onCancel} className="p-2 -ml-2">
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <h1 className="font-semibold text-gray-900">{zoneTitle}</h1>
            <p className="text-xs text-gray-600 mt-0.5">
              Paso {currentStepIndex + 1} de {steps.length}
            </p>
          </div>
          
          <Button
            onClick={() => onSave(steps)}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={steps.every(step => !step.content.es?.trim())}
          >
            Hecho
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="px-4 py-3 bg-gray-50">
        <div className="flex items-center justify-center gap-1.5">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => goToStep(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentStepIndex 
                  ? 'w-8 bg-violet-600' 
                  : index < currentStepIndex
                  ? 'w-1.5 bg-violet-400'
                  : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto"
      >
        <AnimatePresence mode="wait">
          {!isTransitioning && (
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-4 pb-20"
            >
              {/* Language Selector */}
              <div className="flex justify-center mb-6">
                <div className="flex bg-gray-100 rounded-full p-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setActiveLanguage(lang.code as any)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        activeLanguage === lang.code
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600'
                      }`}
                    >
                      {lang.flag} {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Area */}
              <div className="space-y-6">
                {/* Current content type indicator */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  {currentStep.type === 'text' && <Type className="w-4 h-4" />}
                  {currentStep.type === 'image' && <Camera className="w-4 h-4" />}
                  {currentStep.type === 'video' && <Film className="w-4 h-4" />}
                  {currentStep.type === 'link' && <Globe className="w-4 h-4" />}
                  <span className="font-medium capitalize">{currentStep.type}</span>
                </div>

                {/* Text Input */}
                {currentStep.type === 'text' && (
                  <textarea
                    value={currentStep.content[activeLanguage] || ''}
                    onChange={(e) => updateStepContent(activeLanguage, e.target.value)}
                    placeholder="Escribe las instrucciones para este paso..."
                    className="w-full h-40 p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-base"
                    autoFocus
                  />
                )}

                {/* Image/Video Display */}
                {(currentStep.type === 'image' || currentStep.type === 'video') && (
                  <div className="space-y-4">
                    {!currentStep.media?.url ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center"
                      >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">
                          Toca para subir {currentStep.type === 'image' ? 'foto' : 'video'}
                        </p>
                      </div>
                    ) : (
                      <div className="relative rounded-2xl overflow-hidden bg-gray-100">
                        {currentStep.type === 'image' ? (
                          <img 
                            src={currentStep.media.url} 
                            alt="Contenido" 
                            className="w-full"
                          />
                        ) : (
                          <div className="aspect-video bg-black flex items-center justify-center">
                            <Film className="w-12 h-12 text-white opacity-50" />
                          </div>
                        )}
                        <button
                          onClick={() => updateCurrentStep({ media: undefined })}
                          className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    <Input
                      value={currentStep.content[activeLanguage] || ''}
                      onChange={(e) => updateStepContent(activeLanguage, e.target.value)}
                      placeholder="Añade una descripción (opcional)"
                      className="text-base"
                    />
                  </div>
                )}

                {/* Add Media Button - Always visible */}
                <button
                  onClick={() => setShowMediaModal(true)}
                  className="mx-auto flex items-center gap-2 text-violet-600 font-medium py-3 px-6 rounded-full hover:bg-violet-50 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Añade Fotos/video
                </button>

                {/* Delete Step */}
                {steps.length > 1 && (
                  <button
                    onClick={removeCurrentStep}
                    className="mx-auto flex items-center gap-2 text-red-600 text-sm py-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar este paso
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3">
        {currentStepIndex > 0 && (
          <Button
            variant="outline"
            onClick={() => goToStep(currentStepIndex - 1)}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>
        )}
        
        {currentStepIndex < steps.length - 1 ? (
          <Button
            onClick={() => goToStep(currentStepIndex + 1)}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={addNewStep}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Añadir paso
          </Button>
        )}
      </div>

      {/* Media Selection Modal */}
      <MediaSelectionModal />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={currentStep?.type === 'video' ? 'video/*' : 'image/*'}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            const mockUrl = URL.createObjectURL(file)
            updateCurrentStep({
              media: {
                url: mockUrl,
                thumbnail: file.type.startsWith('video/') ? mockUrl : undefined,
                title: file.name
              }
            })
          }
        }}
        className="hidden"
      />
    </div>
  )
}