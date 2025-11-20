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
  Sparkles,
  PlayCircle
} from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import { Input } from './Input'
import { Badge } from './Badge'
import { VideoUploadSimple } from './VideoUploadSimple'
import { ImageUpload } from './ImageUpload'

export interface Step {
  id: string
  type: 'text' | 'image' | 'video' | 'youtube' | 'link'
  title?: {
    es: string
    en?: string
    fr?: string
  }
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
  editingStepId?: string | null
  propertyId?: string
  zoneId?: string
}

export function MobileStepEditor({
  zoneTitle,
  initialSteps = [],
  onSave,
  onCancel,
  maxVideos = 5,
  currentVideoCount = 0,
  editingStepId = null,
  propertyId,
  zoneId
}: MobileStepEditorProps) {
  console.log('📱 MobileStepEditor mounted with:', { zoneTitle, initialSteps });
  
  // Debug mount/unmount
  useEffect(() => {
    console.log('📱 MobileStepEditor mounted');
    return () => {
      console.log('📱 MobileStepEditor unmounting');
    };
  }, []);
  
  const [steps, setSteps] = useState<Step[]>(
    initialSteps.length > 0 ? initialSteps : [createNewStep(0)]
  )
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [activeLanguage, setActiveLanguage] = useState<'es' | 'en' | 'fr'>('es')
  
  // Find the index of the step being edited, or default to null
  const getInitialSelectedStep = () => {
    if (editingStepId && initialSteps.length > 0) {
      // Special case: if adding new step, focus on the last step (the new one)
      if (editingStepId === 'NEW_STEP_FOCUS') {
        console.log('📱 MobileStepEditor: Focusing on new step at index:', initialSteps.length - 1)
        return initialSteps.length - 1
      }
      
      const stepIndex = initialSteps.findIndex(step => step.id === editingStepId)
      console.log('📱 MobileStepEditor: Looking for step with ID:', editingStepId)
      console.log('📱 MobileStepEditor: Steps IDs:', initialSteps.map(s => s.id))
      console.log('📱 MobileStepEditor: Found at index:', stepIndex)
      return stepIndex >= 0 ? stepIndex : null
    }
    return null
  }
  
  const [selectedStep, setSelectedStep] = useState<number | null>(getInitialSelectedStep())
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const addNewStep = () => {
    const newStep = createNewStep(steps.length)
    setSteps([...steps, newStep])
  }

  const removeStep = (stepIndex: number) => {
    if (steps.length <= 1) return
    const newSteps = steps.filter((_, index) => index !== stepIndex)
    setSteps(newSteps)
  }

  const updateStep = (stepIndex: number, updates: Partial<Step>) => {
    setSteps(steps.map((step, index) => 
      index === stepIndex ? { ...step, ...updates } : step
    ))
  }

  const updateStepContent = (stepIndex: number, language: 'es' | 'en' | 'fr', content: string) => {
    console.log(`📝 Updating step ${stepIndex} content for ${language}:`, content.substring(0, 50))
    setSteps(steps.map((step, index) => 
      index === stepIndex 
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
  
  const updateStepTitle = (stepIndex: number, language: 'es' | 'en' | 'fr', title: string) => {
    console.log(`📝 Updating step ${stepIndex} title for ${language}:`, title)
    setSteps(steps.map((step, index) => 
      index === stepIndex 
        ? { 
            ...step, 
            title: { 
              ...step.title || { es: '', en: '', fr: '' }, 
              [language]: title 
            } 
          } 
        : step
    ))
  }

  const handleMediaSelect = (type: 'image' | 'video' | 'text' | 'youtube' | 'link') => {
    if (selectedStep !== null) {
      console.log('📱 Media type selected:', type)
      updateStep(selectedStep, { type })
      setShowMediaModal(false)
      
      // Note: Image and video uploads are now handled by their respective components
      // No need to trigger file input manually
    }
  }

  const openMediaModal = (stepIndex: number) => {
    setSelectedStep(stepIndex)
    setShowMediaModal(true)
  }

  const languages = [
    { code: 'es', label: 'ES', flag: '🇪🇸' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'fr', label: 'FR', flag: '🇫🇷' }
  ]

  const getVideoCount = () => {
    return steps.filter(step => step.type === 'video').length + currentVideoCount
  }

  const getStepIcon = (type: Step['type']) => {
    switch (type) {
      case 'text':
        return <FileText className="w-4 h-4" />
      case 'image':
        return <ImageIcon className="w-4 h-4" />
      case 'video':
        return <PlayCircle className="w-4 h-4" />
      case 'youtube':
        return <Youtube className="w-4 h-4" />
      case 'link':
        return <Globe className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getStepTypeLabel = (type: Step['type']) => {
    switch (type) {
      case 'text':
        return 'Texto'
      case 'image':
        return 'Imagen'
      case 'video':
        return 'Video'
      case 'youtube':
        return 'YouTube'
      case 'link':
        return 'Enlace'
      default:
        return 'Contenido'
    }
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
              Añadir Contenido
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleMediaSelect('text')}
                className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-2xl border-2 border-blue-200 active:scale-95 transition-transform"
              >
                <FileText className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Texto</span>
              </button>
              
              <button
                onClick={() => handleMediaSelect('image')}
                className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-2xl border-2 border-green-200 active:scale-95 transition-transform"
              >
                <ImageIcon className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Imagen</span>
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
                <PlayCircle className="w-8 h-8 text-red-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Video</span>
                {getVideoCount() >= maxVideos && (
                  <span className="text-xs text-red-600 mt-1">Límite alcanzado</span>
                )}
              </button>
              
              <button
                onClick={() => handleMediaSelect('youtube')}
                className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-2xl border-2 border-red-200 active:scale-95 transition-transform"
              >
                <Youtube className="w-8 h-8 text-red-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">YouTube</span>
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

  // Add a test to ensure component is interactive
  useEffect(() => {
    // Test that JavaScript is running
    console.log('📱 MobileStepEditor is interactive');
    console.log('📱 Initial steps state:', steps);
    console.log('📱 onSave type:', typeof onSave);
    console.log('📱 onCancel type:', typeof onCancel);
    
    // Test click handler attachment
    const testButton = document.querySelector('[data-test-id="finalizar-top"]');
    if (testButton) {
      console.log('📱 Found test button:', testButton);
    }
  }, [steps, onSave, onCancel]);
  
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header - Fixed */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              console.log('❌ Cancel button clicked')
              onCancel()
            }} 
            className="p-2 -ml-2"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <h1 className="font-semibold text-gray-900">{zoneTitle}</h1>
            <p className="text-xs text-gray-600 mt-0.5">
              Pasos del itinerario
            </p>
          </div>
          
          <button
            type="button"
            data-test-id="finalizar-top"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                console.log('🎯 MobileStepEditor: Finalizar clicked (TOP)');
                console.log('🎯 Event:', e);
                console.log('🎯 Event type:', e.type);
                console.log('🎯 Current target:', e.currentTarget);
                console.log('🎯 Steps to save:', steps);
                console.log('🎯 Steps count:', steps.length);
                console.log('🎯 Steps content:', steps.map(s => ({ type: s.type, content: s.content })));
                
                // Send all steps to the parent component
                console.log('🎯 Total steps:', steps.length);
                console.log('🎯 onSave function exists:', typeof onSave === 'function');
                console.log('🎯 Steps to save:', JSON.stringify(steps, null, 2));
                
                if (steps.length > 0 && typeof onSave === 'function') {
                  console.log('🎯 Calling onSave with all steps...');
                  onSave(steps);
                  console.log('🎯 onSave called successfully');
                } else if (steps.length === 0) {
                  console.log('⚠️ No steps to save');
                } else {
                  console.log('⚠️ onSave is not a function');
                }
              } catch (error) {
                console.error('❌ Error in Finalizar click:', error);
                console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
              }
            }}
            style={{ backgroundColor: '#484848' }}
            className="px-4 py-2 text-sm rounded-lg text-white hover:bg-gray-700 disabled:opacity-50"
            disabled={steps.every(step => !step.content.es?.trim())}
          >
            Finalizar
          </button>
        </div>
      </div>

      {/* Language Selector */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="text-center mb-2">
          <p className="text-xs text-gray-600">Editar en múltiples idiomas</p>
        </div>
        <div className="flex justify-center">
          <div className="flex bg-white rounded-full p-1 shadow-sm border">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setActiveLanguage(lang.code as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeLanguage === lang.code
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="max-w-md mx-auto">
          {/* Steps Timeline */}
          <div className="space-y-0">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Timeline Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-5 top-12 w-0.5 h-16 border-l-2 border-dashed" style={{ borderColor: '#f1f1f1' }} />
                )}
                
                {/* Step Container */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 shadow-sm">
                  {/* Step Header */}
                  <div className="flex items-center gap-3 mb-3">
                    {/* Step Number Badge */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#484848' }}>
                        <span className="text-white font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div className="text-center mt-1">
                        <span className="text-xs font-medium text-gray-800">Paso</span>
                      </div>
                    </div>
                    
                    {/* Step Type with Icon */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-gray-600">
                          {getStepIcon(step.type)}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {getStepTypeLabel(step.type)}
                        </span>
                      </div>
                    </div>

                    {/* Delete Step Button */}
                    {steps.length > 1 && (
                      <button
                        onClick={() => removeStep(index)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Content Type Selector */}
                  <div className="mb-4">
                    <button
                      onClick={() => openMediaModal(index)}
                      className="w-full py-3 px-4 border border-gray-300 rounded-xl text-left text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Añadir Contenido
                    </button>
                  </div>

                  {/* Title Input - For all step types */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Título (opcional)</label>
                    <input
                      type="text"
                      value={step.title?.[activeLanguage] || ''}
                      onChange={(e) => updateStepTitle(index, activeLanguage, e.target.value)}
                      placeholder="Título del paso..."
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Content Input Based on Type */}
                  {step.type === 'text' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                      <textarea
                        value={step.content[activeLanguage] || ''}
                        onChange={(e) => updateStepContent(index, activeLanguage, e.target.value)}
                        placeholder="Escribe las instrucciones para este paso..."
                        className="w-full min-h-[200px] h-48 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-y text-sm leading-relaxed"
                        rows={4}
                      />
                    </div>
                  )}

                  {step.type === 'image' && (
                    <div className="space-y-3">
                      <ImageUpload
                        value={step.media?.url}
                        onChange={(url) => {
                          console.log('🖼️ MobileStepEditor ImageUpload onChange:', { url })
                          
                          if (url) {
                            console.log('📸 Setting image data in step:', {
                              url,
                              title: 'Uploaded image'
                            })
                            updateStep(index, {
                              media: {
                                url: url,
                                title: 'Uploaded image'
                              }
                            })
                          } else {
                            console.log('🗑️ Clearing image from step')
                            updateStep(index, { media: undefined })
                          }
                        }}
                        className="mb-3"
                      />
                      
                      <textarea
                        value={step.content[activeLanguage] || ''}
                        onChange={(e) => updateStepContent(index, activeLanguage, e.target.value)}
                        placeholder="Descripción de la imagen (opcional)"
                        className="w-full min-h-[120px] h-32 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-y text-sm leading-relaxed"
                        rows={4}
                      />
                    </div>
                  )} 

                  {step.type === 'video' && (
                    <div className="space-y-3">
                      <VideoUploadSimple
                        value={step.media?.url}
                        onChange={(url, metadata) => {
                          console.log('🎬 MobileStepEditor VideoUploadSimple onChange:', { url, metadata })
                          
                          if (url) {
                            console.log('📹 Setting video data in step:', {
                              url,
                              thumbnail: metadata?.thumbnail,
                              title: 'Uploaded video'
                            })
                            updateStep(index, {
                              media: {
                                url: url,
                                thumbnail: metadata?.thumbnail || '',
                                title: 'Uploaded video'
                              }
                            })
                          } else {
                            console.log('🗑️ Clearing video from step')
                            updateStep(index, { media: undefined })
                          }
                        }}
                        placeholder="Subir video (máx. 60 segundos)"
                        maxSize={100}
                        maxDuration={60}
                        saveToLibrary={true}
                        className="mb-3"
                      />
                      
                      <textarea
                        value={step.content[activeLanguage] || ''}
                        onChange={(e) => updateStepContent(index, activeLanguage, e.target.value)}
                        placeholder="Descripción del video (opcional)"
                        className="w-full min-h-[120px] h-32 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-y text-sm leading-relaxed"
                        rows={4}
                      />
                    </div>
                  )}

                  {(step.type === 'youtube' || step.type === 'link') && (
                    <div className="space-y-3">
                      <Input
                        value={step.media?.url || ''}
                        onChange={(e) => updateStep(index, { 
                          media: { ...step.media, url: e.target.value } 
                        })}
                        placeholder={step.type === 'youtube' ? 'URL de YouTube' : 'URL del enlace'}
                        className="text-sm"
                      />
                      
                      <Input
                        value={step.content[activeLanguage] || ''}
                        onChange={(e) => updateStepContent(index, activeLanguage, e.target.value)}
                        placeholder="Descripción (opcional)"
                        className="text-sm"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Fixed with 3 buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 safe-area-bottom">
        <div className="max-w-md mx-auto flex gap-2">
          {/* Atrás Button - Icon only */}
          <button
            onClick={() => {
              console.log('🔙 Cancel button clicked');
              onCancel();
            }}
            className="w-12 h-12 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Añadir Paso Button */}
          <button
            onClick={addNewStep}
            className="flex-1 px-3 py-2.5 border-2 border-violet-500 bg-violet-50 rounded-lg text-violet-700 hover:bg-violet-100 flex items-center justify-center gap-1.5 text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir paso</span>
          </button>

          {/* Finalizar Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                console.log('🎯 MobileStepEditor BOTTOM: Finalizar clicked');
                console.log('🎯 Steps to save:', steps);

                if (steps.length > 0 && typeof onSave === 'function') {
                  console.log('🎯 Calling onSave with all steps...');
                  onSave(steps);
                  console.log('🎯 onSave called successfully');
                } else if (steps.length === 0) {
                  console.log('⚠️ No steps to save');
                } else {
                  console.log('⚠️ onSave is not a function');
                }
              } catch (error) {
                console.error('❌ Error in Finalizar BOTTOM click:', error);
              }
            }}
            style={{ backgroundColor: '#484848' }}
            className="flex-1 px-3 py-2.5 rounded-lg text-white hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center gap-1.5 text-sm font-semibold"
            disabled={steps.every(step => !step.content.es?.trim())}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Finalizar</span>
          </button>
        </div>
      </div>

      {/* Media Selection Modal */}
      <MediaSelectionModal />

      {/* File inputs are now handled by VideoUpload and ImageUpload components */}
    </div>
  )
}