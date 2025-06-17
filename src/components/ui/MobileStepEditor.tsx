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
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
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

  const handleMediaSelect = (type: 'image' | 'video' | 'text' | 'youtube' | 'link') => {
    if (selectedStep !== null) {
      updateStep(selectedStep, { type })
      setShowMediaModal(false)
      
      if (type === 'image' || type === 'video') {
        setTimeout(() => {
          fileInputRef.current?.click()
        }, 300)
      }
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
                
                // Filtrar solo los pasos con contenido
                const stepsWithContent = steps.filter(step => 
                  step.content.es?.trim() || step.content.en?.trim() || step.content.fr?.trim()
                );
                
                console.log('🎯 Steps with content:', stepsWithContent.length);
                console.log('🎯 onSave function exists:', typeof onSave === 'function');
                
                if (stepsWithContent.length > 0 && typeof onSave === 'function') {
                  console.log('🎯 Calling onSave...');
                  onSave(stepsWithContent);
                  console.log('🎯 onSave called successfully');
                } else {
                  console.log('⚠️ No steps with content to save or onSave is not a function');
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
        {/* Test button to verify JS is working */}
        <button 
          type="button"
          onClick={() => {
            console.log('🔴 TEST BUTTON CLICKED!');
            alert('JavaScript is working!');
          }}
          className="mb-2 w-full bg-red-500 text-white py-2 rounded"
        >
          Test JS (Click me)
        </button>
        <div className="flex justify-center">
          <div className="flex bg-white rounded-full p-1 shadow-sm">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setActiveLanguage(lang.code as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeLanguage === lang.code
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
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

                  {/* Content Input Based on Type */}
                  {step.type === 'text' && (
                    <textarea
                      value={step.content[activeLanguage] || ''}
                      onChange={(e) => updateStepContent(index, activeLanguage, e.target.value)}
                      placeholder="Escribe las instrucciones para este paso..."
                      className="w-full h-32 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none text-sm"
                      rows={4}
                    />
                  )}

                  {step.type === 'image' && (
                    <div className="space-y-3">
                      {!step.media?.url ? (
                        <button
                          onClick={() => {
                            setSelectedStep(index)
                            fileInputRef.current?.click()
                          }}
                          className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 transition-colors"
                        >
                          <ImageIcon className="w-8 h-8 mb-2" />
                          <span className="text-sm">Seleccionar imagen</span>
                        </button>
                      ) : (
                        <div className="relative rounded-xl overflow-hidden">
                          <img 
                            src={step.media.url} 
                            alt="Contenido" 
                            className="w-full h-48 object-cover"
                          />
                          <button
                            onClick={() => updateStep(index, { media: undefined })}
                            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      <Input
                        value={step.content[activeLanguage] || ''}
                        onChange={(e) => updateStepContent(index, activeLanguage, e.target.value)}
                        placeholder="Descripción de la imagen (opcional)"
                        className="text-sm"
                      />
                    </div>
                  )}

                  {step.type === 'video' && (
                    <div className="space-y-3">
                      {!step.media?.url ? (
                        <button
                          onClick={() => {
                            setSelectedStep(index)
                            fileInputRef.current?.click()
                          }}
                          className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 transition-colors"
                        >
                          <PlayCircle className="w-8 h-8 mb-2" />
                          <span className="text-sm">Seleccionar video</span>
                        </button>
                      ) : (
                        <div className="relative rounded-xl overflow-hidden bg-gray-100">
                          <div className="w-full h-48 bg-black flex items-center justify-center">
                            <PlayCircle className="w-12 h-12 text-white opacity-75" />
                          </div>
                          <button
                            onClick={() => updateStep(index, { media: undefined })}
                            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      <Input
                        value={step.content[activeLanguage] || ''}
                        onChange={(e) => updateStepContent(index, activeLanguage, e.target.value)}
                        placeholder="Descripción del video (opcional)"
                        className="text-sm"
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
            
            {/* Add Step Button */}
            <motion.button
              onClick={addNewStep}
              className="w-full py-4 border-2 border-dashed border-violet-400 rounded-2xl text-violet-600 hover:border-violet-500 hover:text-violet-700 transition-colors flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Añadir paso</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            onClick={() => {
              console.log('🔙 Cancel button clicked');
              onCancel();
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
          >
            Anterior
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                console.log('🎯 MobileStepEditor BOTTOM: Finalizar clicked');
                console.log('🎯 Event:', e);
                console.log('🎯 Steps to save:', steps);
                console.log('🎯 Steps count:', steps.length);
                console.log('🎯 Steps content:', steps.map(s => ({ type: s.type, content: s.content })));
                
                // Filtrar solo los pasos con contenido
                const stepsWithContent = steps.filter(step => 
                  step.content.es?.trim() || step.content.en?.trim() || step.content.fr?.trim()
                );
                
                console.log('🎯 Steps with content:', stepsWithContent.length);
                console.log('🎯 onSave function exists:', typeof onSave === 'function');
                
                if (stepsWithContent.length > 0 && typeof onSave === 'function') {
                  console.log('🎯 Calling onSave...');
                  onSave(stepsWithContent);
                  console.log('🎯 onSave called successfully');
                } else {
                  console.log('⚠️ No steps with content to save or onSave is not a function');
                }
              } catch (error) {
                console.error('❌ Error in Finalizar BOTTOM click:', error);
                console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
              }
            }}
            style={{ backgroundColor: '#484848' }}
            className="flex-1 px-4 py-2 rounded-lg text-white hover:bg-gray-700 disabled:opacity-50"
            disabled={steps.every(step => !step.content.es?.trim())}
          >
            Finalizar
          </button>
        </div>
      </div>

      {/* Media Selection Modal */}
      <MediaSelectionModal />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={selectedStep !== null && steps[selectedStep]?.type === 'video' ? 'video/*' : 'image/*'}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file && selectedStep !== null) {
            const mockUrl = URL.createObjectURL(file)
            updateStep(selectedStep, {
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