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
  Play,
  Check,
  ChevronRight,
  CheckCircle,
  X
} from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import { Input } from './Input'
import { Badge } from './Badge'
import { ImageUpload } from './ImageUpload'
import { VideoUpload } from './VideoUpload'
import { MobileStepEditor as MobileStepEditorNew } from './MobileStepEditor'
import { MobileStepEditorSimple } from './MobileStepEditorSimple'

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
  editingStepId?: string | null
}

export function StepEditor({
  zoneTitle,
  initialSteps = [],
  onSave,
  onCancel,
  maxVideos = 5,
  currentVideoCount = 0,
  editingStepId = null
}: StepEditorProps) {
  const [steps, setSteps] = useState<Step[]>(
    initialSteps.length > 0 ? initialSteps : [createNewStep(0)]
  )
  
  // Find the index of the step being edited, or default to 0
  const getInitialActiveStep = () => {
    if (editingStepId && initialSteps.length > 0) {
      // Special case: if adding new step, focus on the last step (the new one)
      if (editingStepId === 'NEW_STEP_FOCUS') {
        console.log('🎯 StepEditor: Focusing on new step at index:', initialSteps.length - 1)
        return initialSteps.length - 1
      }
      
      const stepIndex = initialSteps.findIndex(step => step.id === editingStepId)
      console.log('🎯 StepEditor: Looking for step with ID:', editingStepId)
      console.log('🎯 StepEditor: Steps IDs:', initialSteps.map(s => s.id))
      console.log('🎯 StepEditor: Found at index:', stepIndex)
      return stepIndex >= 0 ? stepIndex : 0
    }
    return 0
  }
  
  const [activeStep, setActiveStep] = useState(getInitialActiveStep())
  const [activeLanguage, setActiveLanguage] = useState<'es' | 'en' | 'fr'>('es')
  const [isAddingStep, setIsAddingStep] = useState(false)
  const [lineProgress, setLineProgress] = useState(0)

  function createNewStep(order: number): Step {
    return {
      id: `step-${Date.now()}-${Math.random()}`,
      type: 'text',
      content: { es: '' },
      order
    }
  }

  // Mobile detection with SSR safety
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      console.log('🖥️ Window width:', window.innerWidth, 'Is mobile:', mobile)
      setIsMobile(mobile)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Use new mobile editor for mobile devices (only after client-side mount)
  if (!isClient) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }
  
  if (isMobile) {
    console.log('📱 Rendering MobileStepEditor')
    
    return (
      <MobileStepEditorNew
        zoneTitle={zoneTitle}
        initialSteps={initialSteps}
        onSave={(steps) => {
          console.log('🔵 StepEditor: onSave called with', steps.length, 'steps')
          console.log('🔵 StepEditor: onSave prop type:', typeof onSave)
          if (typeof onSave === 'function') {
            console.log('🔵 StepEditor: Calling parent onSave')
            onSave(steps)
            console.log('🔵 StepEditor: Parent onSave called')
          } else {
            console.error('🔵 StepEditor: onSave is not a function!')
          }
        }}
        onCancel={onCancel}
        maxVideos={maxVideos}
        currentVideoCount={currentVideoCount}
        editingStepId={editingStepId}
      />
    )
  }

  const addStep = async () => {
    setIsAddingStep(true)
    const newStepIndex = steps.length
    
    // Animate line progress
    setLineProgress(0)
    const duration = 1500 // 1.5 seconds
    const startTime = Date.now()
    
    const animateLine = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      setLineProgress(easeInOutQuad(progress) * 100)
      
      if (progress < 1) {
        requestAnimationFrame(animateLine)
      } else {
        // Line animation complete, add the step with explosion effect
        setTimeout(() => {
          const newStep = createNewStep(newStepIndex)
          setSteps(prev => [...prev, newStep])
          setActiveStep(newStepIndex)
          setIsAddingStep(false)
          setLineProgress(0)
        }, 200)
      }
    }
    
    requestAnimationFrame(animateLine)
  }

  const removeStep = (stepId: string) => {
    if (steps.length <= 1) return
    const newSteps = steps.filter(step => step.id !== stepId)
    setSteps(newSteps.map((step, index) => ({ ...step, order: index })))
    setActiveStep(Math.max(0, Math.min(activeStep, newSteps.length - 1)))
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

  // Mobile Step Editor Component with better spacing
  const MobileStepEditor = ({ 
    step, 
    stepIndex 
  }: any) => (
    <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-6 shadow-sm">
      {/* Step Type Selector - Better mobile layout */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">Tipo de contenido</label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { type: 'text', label: 'Texto', icon: FileText, color: 'blue' },
            { type: 'image', label: 'Imagen', icon: ImageIcon, color: 'green' },
            { type: 'video', label: 'Video', icon: Video, color: 'red', disabled: getVideoCount() >= maxVideos && step.type !== 'video' },
            { type: 'youtube', label: 'YouTube', icon: Youtube, color: 'red' },
            { type: 'link', label: 'Enlace', icon: LinkIcon, color: 'purple' }
          ].map(({ type, label, icon: Icon, color, disabled }, index) => (
            <motion.button
              key={type}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => updateStep(step.id, { type: type as any })}
              disabled={disabled}
              className={`p-5 rounded-xl border-2 transition-all text-sm flex flex-col items-center gap-3 min-h-[80px] ${
                step.type === type
                  ? color === 'blue' ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
                  : color === 'green' ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100'
                  : color === 'red' ? 'border-red-500 bg-red-50 shadow-lg shadow-red-100'
                  : color === 'purple' ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100'
                  : 'border-gray-500 bg-gray-50'
                  : disabled
                  ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
              }`}
            >
              <Icon className={`w-6 h-6 ${
                step.type === type 
                  ? color === 'blue' ? 'text-blue-600'
                  : color === 'green' ? 'text-green-600'
                  : color === 'red' ? 'text-red-600'
                  : color === 'purple' ? 'text-purple-600'
                  : 'text-gray-600'
                  : 'text-gray-600'
              }`} />
              <div className="font-medium text-center leading-tight">{label}</div>
              {disabled && type === 'video' && (
                <div className="text-xs text-red-600">Límite</div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Language Tabs */}
      <div>
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          {languages.map((lang: any) => (
            <button
              key={lang.code}
              onClick={() => setActiveLanguage(lang.code as any)}
              className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
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
          <label className="block text-sm font-medium text-gray-700 mb-3">Contenido</label>
          <textarea
            value={step.content[activeLanguage] || ''}
            onChange={(e) => updateStepContent(step.id, activeLanguage, e.target.value)}
            placeholder={`Escribe las instrucciones...`}
            className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-sm"
          />
        </div>
      )}

      {step.type === 'image' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Imagen</label>
          <ImageUpload
            value={step.media?.url}
            onChange={(url) => {
              if (url) {
                updateStep(step.id, {
                  media: {
                    url,
                    title: 'Uploaded image'
                  }
                })
              } else {
                updateStep(step.id, { media: undefined })
              }
            }}
            className="mb-3"
          />
          <Input
            value={step.content[activeLanguage] || ''}
            onChange={(e) => updateStepContent(step.id, activeLanguage, e.target.value)}
            placeholder="Descripción (opcional)"
            className="mt-3"
          />
        </div>
      )}

      {step.type === 'video' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Video</label>
          <VideoUpload
            value={step.media?.url}
            onChange={(url, metadata) => {
              if (url) {
                updateStep(step.id, {
                  media: {
                    url,
                    thumbnail: metadata?.thumbnail,
                    title: 'Uploaded video'
                  }
                })
              } else {
                updateStep(step.id, { media: undefined })
              }
            }}
            className="mb-3"
            maxSize={50}
            maxDuration={30}
          />
          <Input
            value={step.content[activeLanguage] || ''}
            onChange={(e) => updateStepContent(step.id, activeLanguage, e.target.value)}
            placeholder="Descripción (opcional)"
            className="mt-3"
          />
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
              type="button"
              onClick={(e) => {
                e.preventDefault()
                console.log('💾 Desktop Save button clicked')
                console.log('💾 Steps to save:', steps)
                onSave(steps)
              }}
              className="bg-gray-900 hover:bg-gray-800 text-white"
              disabled={steps.every(step => !step.content.es?.trim())}
            >
              <span className="hidden sm:inline">Guardar Instrucciones</span>
              <span className="sm:hidden">Guardar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Layout: Vertical Timeline with LED Animation */}
      {isMobile ? (
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Steps Timeline with LED effect */}
          <div className="relative">
            {/* Main connecting line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
            
            {/* Animated LED line */}
            {isAddingStep && (
              <motion.div
                className="absolute left-6 w-0.5 bg-gradient-to-b from-violet-500 to-blue-500"
                style={{
                  top: `${activeStep * 120 + 48}px`,
                  height: `${lineProgress}%`,
                  maxHeight: '120px'
                }}
                initial={{ height: 0 }}
                animate={{ height: `${lineProgress}%` }}
              >
                {/* LED dot moving along the line */}
                <motion.div
                  className="absolute -left-1 w-2.5 h-2.5 bg-violet-500 rounded-full shadow-lg"
                  style={{ 
                    bottom: 0,
                    boxShadow: '0 0 10px rgba(139, 92, 246, 0.6)' 
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [1, 0.7, 1]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            )}
            
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                id={`step-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative mb-8 ${
                  activeStep === index ? 'bg-violet-50 rounded-xl p-4 border-2 border-violet-200' : ''
                }`}
              >
                {/* Step number with glow effect */}
                <motion.div 
                  className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
                    activeStep === index ? 'bg-violet-600' : getStepTypeColor(step.type)
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    boxShadow: activeStep === index 
                      ? '0 0 20px rgba(139, 92, 246, 0.4)' 
                      : '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {index + 1}
                </motion.div>
                
                {/* Step Content */}
                <div className="ml-16">
                  <div className="flex items-center gap-2 mb-3">
                    {getStepIcon(step.type)}
                    <span className="text-xs font-medium text-gray-600 uppercase">{step.type}</span>
                    {steps.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStep(step.id)}
                        className="ml-auto text-red-600 hover:bg-red-50 w-8 h-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {activeStep === index ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MobileStepEditor 
                        step={step}
                        stepIndex={index}
                      />
                    </motion.div>
                  ) : (
                    <motion.div 
                      onClick={() => setActiveStep(index)}
                      className="cursor-pointer bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <p className="text-sm text-gray-900">
                        {step.content.es || `Configura el paso ${index + 1}`}
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {/* New step placeholder with explosion effect */}
            <AnimatePresence>
              {isAddingStep && (
                <motion.div
                  className="relative mb-8"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: lineProgress > 90 ? 1 : 0,
                    scale: lineProgress > 90 ? [0, 1.2, 1] : 0
                  }}
                  transition={{ 
                    duration: 0.6,
                    ease: "easeOut"
                  }}
                >
                  <motion.div 
                    className="absolute left-0 w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 flex items-center justify-center text-white font-medium"
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(139, 92, 246, 0.7)',
                        '0 0 0 20px rgba(139, 92, 246, 0)',
                        '0 0 0 0 rgba(139, 92, 246, 0)'
                      ]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  >
                    {steps.length + 1}
                  </motion.div>
                  <div className="ml-16">
                    <div className="bg-gradient-to-r from-violet-100 to-blue-100 rounded-xl p-4 border-2 border-dashed border-violet-300">
                      <p className="text-sm text-violet-700 font-medium">
                        ✨ Nuevo paso añadiéndose...
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* End cap */}
            <div className="relative">
              <div className="absolute left-0 w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
          
          {/* Action Buttons - Mobile Layout */}
          <div className="ml-16 space-y-3">
            <Button
              onClick={addStep}
              disabled={isAddingStep}
              variant="outline"
              className="w-full border-dashed border-gray-300 text-gray-600 hover:border-violet-300 hover:text-violet-600 h-12"
            >
              <Plus className="w-5 h-5 mr-2" />
              {isAddingStep ? 'Añadiendo paso...' : 'Añadir paso'}
            </Button>
            
            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                className="flex-1"
              >
                Anterior
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  onClick={() => onSave(steps)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Finalizar
                </Button>
              ) : (
                <Button
                  onClick={() => setActiveStep(activeStep + 1)}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Layout with corrected button positioning */
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

                        {steps[activeStep].type === 'image' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Subir imagen
                            </label>
                            <ImageUpload
                              value={steps[activeStep].media?.url}
                              onChange={(url) => {
                                if (url) {
                                  updateStep(steps[activeStep].id, {
                                    media: {
                                      url,
                                      title: 'Uploaded image'
                                    }
                                  })
                                } else {
                                  updateStep(steps[activeStep].id, { media: undefined })
                                }
                              }}
                              className="mb-4"
                            />
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción (opcional)
                              </label>
                              <Input
                                value={steps[activeStep].content[activeLanguage] || ''}
                                onChange={(e) => updateStepContent(steps[activeStep].id, activeLanguage, e.target.value)}
                                placeholder="Descripción de la imagen"
                              />
                            </div>
                          </div>
                        )}

                        {steps[activeStep].type === 'video' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Subir video
                            </label>
                            <VideoUpload
                              value={steps[activeStep].media?.url}
                              onChange={(url, metadata) => {
                                if (url) {
                                  updateStep(steps[activeStep].id, {
                                    media: {
                                      url,
                                      thumbnail: metadata?.thumbnail,
                                      title: 'Uploaded video'
                                    }
                                  })
                                } else {
                                  updateStep(steps[activeStep].id, { media: undefined })
                                }
                              }}
                              className="mb-4"
                              maxSize={50}
                              maxDuration={30}
                            />
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción (opcional)
                              </label>
                              <Input
                                value={steps[activeStep].content[activeLanguage] || ''}
                                onChange={(e) => updateStepContent(steps[activeStep].id, activeLanguage, e.target.value)}
                                placeholder="Descripción del video"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Navigation - Desktop with CORRECTED positioning */}
                      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                        {/* LEFT: Previous button */}
                        <Button
                          variant="outline"
                          onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                          disabled={activeStep === 0}
                        >
                          Anterior
                        </Button>
                        
                        <span className="text-sm text-gray-500">
                          Paso {activeStep + 1} de {steps.length}
                        </span>
                        
                        {/* RIGHT: Add Step + Finish/Next */}
                        <div className="flex gap-2">
                          <Button
                            onClick={addStep}
                            disabled={isAddingStep}
                            variant="outline"
                            className="border-dashed border-gray-300 text-gray-600 hover:border-violet-300 hover:text-violet-600"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Añadir paso
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

            {/* Preview Panel - Desktop */}
            <div className="col-span-1 lg:col-span-4">
              <div className="sticky top-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Vista previa del huésped</h3>
                  <p className="text-sm text-gray-600 mb-3">Cómo verá el manual en su móvil</p>
                  <a
                    href={`/z/PREVIEW_${Date.now()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Vista real
                  </a>
                </div>
                
                {/* iPhone Preview */}
                <div className="mx-auto relative" style={{ width: '280px', height: '600px' }}>
                  <div className="absolute inset-0 bg-black rounded-[3rem] p-2">
                    <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                      {/* Dynamic Island */}
                      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10"></div>
                      
                      {/* Screen Content */}
                      <div 
                        className="pt-12 pb-8 px-4 h-full overflow-y-auto scrollbar-none" 
                        style={{ 
                          scrollbarWidth: 'none', 
                          msOverflowStyle: 'none'
                        }}
                      >
                        {/* Zone Header */}
                        <div className="text-center mb-6">
                          <h2 className="text-sm font-bold text-gray-900 mb-1">Manual de instrucciones</h2>
                          <p className="text-xs text-gray-600">{zoneTitle}</p>
                        </div>

                        {/* Steps Preview */}
                        <div className="relative">
                          {steps.map((step, index) => (
                            <div 
                              key={step.id} 
                              className="relative flex items-start gap-3 mb-4 cursor-pointer"
                              onClick={() => setActiveStep(index)}
                            >
                              {/* Timeline container */}
                              <div className="flex flex-col items-center relative">
                                {/* Circle */}
                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#f1f1f1' }} />
                                {/* Line */}
                                {index < steps.length - 1 && (
                                  <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-0.5 h-16 border-l-2 border-dashed" style={{ borderColor: '#f1f1f1' }} />
                                )}
                              </div>
                              
                              {/* Step content */}
                              <div className={`flex-1 bg-gray-50 rounded-lg overflow-hidden transition-all duration-200 ${
                                index === activeStep 
                                  ? 'ring-2 ring-violet-500 bg-violet-50' 
                                  : 'hover:bg-gray-100 hover:ring-1 hover:ring-gray-300'
                              }`}>
                                {/* Show media preview inside iPhone - Full width */}
                                {step.media?.url && (
                                  <div className="w-full">
                                    {step.type === 'image' ? (
                                      <img 
                                        src={step.media.url} 
                                        alt="Contenido" 
                                        className="w-full h-24 object-cover"
                                      />
                                    ) : step.type === 'video' ? (
                                      <div className="w-full h-24 bg-black flex items-center justify-center">
                                        <Play className="w-6 h-6 text-white opacity-75" />
                                      </div>
                                    ) : null}
                                  </div>
                                )}
                                
                                <div className="p-3">
                                  <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: '#484848' }}>
                                      {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="mb-1">
                                        <span className="text-xs text-gray-700 font-medium">Paso {index + 1}</span>
                                      </div>
                                      
                                      <p className="text-xs text-gray-900 leading-relaxed">
                                        {step.content.es || `Añade contenido para este paso`}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
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