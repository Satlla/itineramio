'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Home, Image, Phone, Wifi, Share2, FolderOpen, QrCode, CheckCircle2 } from 'lucide-react'

interface OnboardingTourProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const tourSteps = [
  {
    icon: Home,
    title: '¡Bienvenido a Itineramio!',
    subtitle: 'Tu plataforma de manuales digitales para alojamientos',
    description: 'Empieza creando tu primera propiedad',
    content: 'Crea manuales digitales interactivos para tus huéspedes en minutos. Añade fotos, información de contacto y toda la información que tus huéspedes necesitan para disfrutar de su estancia.',
    color: 'from-indigo-600 via-purple-600 to-pink-600',
    bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    iconColor: 'text-indigo-600',
    features: [
      '📸 Fotos y descripciones atractivas',
      '📱 Contacto directo por WhatsApp',
      '🏠 Información detallada de tu propiedad'
    ]
  },
  {
    icon: Wifi,
    title: 'Zonas inteligentes pre-configuradas',
    subtitle: 'Ahorra tiempo con nuestras plantillas',
    description: 'Comenzamos el trabajo por ti',
    content: 'Al crear tu propiedad, Itineramio genera automáticamente las zonas más comunes (WiFi, Cocina, Baño, Check-in/out). Solo tienes que personalizarlas con tu información.',
    color: 'from-blue-600 to-cyan-600',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    iconColor: 'text-blue-600',
    features: [
      '🔐 WiFi y accesos',
      '🍳 Electrodomésticos y cocina',
      '🎬 Vídeos de check-in',
      '📝 Instrucciones personalizadas'
    ]
  },
  {
    icon: QrCode,
    title: 'Códigos QR para acceso instantáneo',
    subtitle: 'Facilita la vida a tus huéspedes',
    description: 'Acceso rápido desde cualquier smartphone',
    content: 'Genera códigos QR únicos para cada zona o para toda la propiedad. Tus huéspedes solo tienen que escanear para acceder al manual digital.',
    color: 'from-emerald-600 to-teal-600',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    iconColor: 'text-emerald-600',
    features: [
      '🔲 QR por zona o propiedad completa',
      '🖨️ Descarga e imprime fácilmente',
      '📊 Estadísticas de escaneos',
      '🎯 Sin apps, solo escanear'
    ]
  },
  {
    icon: Share2,
    title: 'Comparte con tus huéspedes',
    subtitle: 'Integración con Airbnb y Booking',
    description: 'Envío automático o manual',
    content: 'Comparte el enlace de tu manual por WhatsApp, email, o añádelo a tus mensajes automáticos de Airbnb y Booking para que tus huéspedes lo reciban antes de llegar.',
    color: 'from-violet-600 to-purple-600',
    bgColor: 'bg-gradient-to-br from-violet-50 to-purple-50',
    iconColor: 'text-violet-600',
    features: [
      '🔗 Enlace único por propiedad',
      '✉️ Envío por email o WhatsApp',
      '🤖 Integración con OTAs',
      '📈 Seguimiento de visualizaciones'
    ]
  },
  {
    icon: FolderOpen,
    title: 'Gestiona múltiples propiedades',
    subtitle: 'Perfecto para gestores y hoteleros',
    description: 'Organiza todo en un solo lugar',
    content: '¿Tienes varios apartamentos o un hotel? Crea conjuntos para agrupar propiedades del mismo edificio y gestiona todo desde un panel centralizado.',
    color: 'from-amber-600 to-orange-600',
    bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
    iconColor: 'text-amber-600',
    features: [
      '🏢 Conjuntos de propiedades',
      '📋 Gestión centralizada',
      '⚡ Duplica y reutiliza contenido',
      '🎨 Personaliza por unidad'
    ]
  }
]

export default function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isExiting, setIsExiting] = useState(false)

  if (!isOpen) return null

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setIsExiting(true)
    setTimeout(() => {
      onComplete()
      onClose()
    }, 300)
  }

  const handleSkip = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const step = tourSteps[currentStep]
  const StepIcon = step.icon

  return (
    <div className={`fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`bg-white rounded-3xl max-w-3xl w-full shadow-2xl transition-all duration-500 transform ${isExiting ? 'scale-90 opacity-0' : 'scale-100 opacity-100'}`}>
        {/* Header */}
        <div className={`bg-gradient-to-r ${step.color} p-8 rounded-t-3xl relative overflow-hidden`}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 animate-pulse" style={{animationDelay: '1s'}} />
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl" />

          <div className="relative">
            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      index === currentStep
                        ? 'w-8 bg-white'
                        : index < currentStep
                        ? 'w-6 bg-white/70'
                        : 'w-4 bg-white/30'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={handleSkip}
                className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all"
                title="Saltar tour"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Icon and title */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 transform hover:scale-110 transition-transform">
                <StepIcon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
                  Paso {currentStep + 1} de {tourSteps.length}
                </div>
                <h2 className="text-3xl font-bold text-white mb-1">{step.title}</h2>
                {step.subtitle && (
                  <p className="text-white/80 text-sm">{step.subtitle}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Description */}
          <div className={`${step.bgColor} rounded-2xl p-6 mb-6 border border-gray-200`}>
            <p className="text-gray-700 text-base leading-relaxed mb-4">
              {step.content}
            </p>

            {/* Features list */}
            {step.features && step.features.length > 0 && (
              <div className="space-y-2 mt-4">
                {step.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm text-gray-600 transform hover:translate-x-1 transition-transform"
                  >
                    <span className="text-lg">{feature.split(' ')[0]}</span>
                    <span>{feature.substring(feature.indexOf(' ') + 1)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleSkip}
              className="px-5 py-2.5 text-gray-500 hover:text-gray-700 font-medium transition-colors rounded-xl hover:bg-gray-100"
            >
              Saltar tour
            </button>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all hover:shadow-md"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Anterior
                </button>
              )}
              <button
                onClick={handleNext}
                className={`flex items-center gap-2 px-8 py-3 bg-gradient-to-r ${step.color} text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all`}
              >
                {currentStep === tourSteps.length - 1 ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    ¡Empezar!
                  </>
                ) : (
                  <>
                    Siguiente
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
