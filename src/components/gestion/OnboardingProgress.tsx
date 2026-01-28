'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  X,
  ChevronUp,
  ChevronDown,
  Building2,
  Users,
  Home,
  Receipt,
  FileText,
  CheckCircle2,
  Circle,
  Sparkles,
  HelpCircle
} from 'lucide-react'

interface OnboardingProgressProps {
  progress: {
    hasCompany: boolean
    hasClients: boolean
    hasConfiguredProperties: boolean
    hasReservations: boolean
  }
}

interface Step {
  id: string
  title: string
  shortTitle: string
  icon: React.ElementType
  href: string
  tip: string
  completed: boolean
}

export function OnboardingProgress({ progress }: OnboardingProgressProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('gestion-onboarding-widget-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }
  }, [])

  const steps: Step[] = [
    {
      id: 'company',
      title: 'Configura tu empresa',
      shortTitle: 'Mi Empresa',
      icon: Building2,
      href: '/gestion/perfil-gestor',
      tip: 'Añade tus datos fiscales e IBAN',
      completed: progress.hasCompany
    },
    {
      id: 'client',
      title: 'Crea un cliente',
      shortTitle: 'Clientes',
      icon: Users,
      href: '/gestion/clientes',
      tip: 'El propietario del apartamento',
      completed: progress.hasClients
    },
    {
      id: 'property',
      title: 'Configura propiedad',
      shortTitle: 'Configuración',
      icon: Home,
      href: '/gestion/configuracion',
      tip: 'Asigna cliente y define comisión',
      completed: progress.hasConfiguredProperties
    },
    {
      id: 'reservations',
      title: 'Importa reservas',
      shortTitle: 'Reservas',
      icon: Receipt,
      href: '/gestion/reservas',
      tip: 'Desde Airbnb o Booking',
      completed: progress.hasReservations
    },
    {
      id: 'billing',
      title: 'Emite facturas',
      shortTitle: 'Facturación',
      icon: FileText,
      href: '/gestion/facturacion',
      tip: 'Revisa y emite la factura mensual',
      completed: false // This is the final goal
    }
  ]

  const completedCount = steps.filter(s => s.completed).length
  const allComplete = completedCount >= 4 // First 4 steps
  const currentStepIndex = steps.findIndex(s => !s.completed)
  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : steps[steps.length - 1]

  const handleDismiss = () => {
    localStorage.setItem('gestion-onboarding-widget-dismissed', 'true')
    setIsDismissed(true)
  }

  const handleShow = () => {
    localStorage.removeItem('gestion-onboarding-widget-dismissed')
    setIsDismissed(false)
  }

  // If all complete or dismissed, show minimal button
  if (allComplete || isDismissed) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={handleShow}
        className="fixed bottom-4 right-4 z-40 bg-violet-600 text-white p-3 rounded-full shadow-lg hover:bg-violet-700 transition-colors"
        title="Ver guía de inicio"
      >
        <HelpCircle className="w-5 h-5" />
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-40 w-72 sm:w-80"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div
          className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium text-sm">Guía de inicio</span>
            <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
              {completedCount}/4
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
              className="text-white/70 hover:text-white p-1"
              title="Cerrar guía"
            >
              <X className="w-4 h-4" />
            </button>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-white/70" />
            ) : (
              <ChevronUp className="w-4 h-4 text-white/70" />
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${(completedCount / 4) * 100}%` }}
          />
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Current step highlight */}
              <div className="p-3 bg-violet-50 border-b border-violet-100">
                <p className="text-xs text-violet-600 font-medium mb-1">Siguiente paso:</p>
                <Link
                  href={currentStep.href}
                  className="flex items-center gap-2 group"
                >
                  <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                    <currentStep.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm group-hover:text-violet-600 transition-colors">
                      {currentStep.title}
                    </p>
                    <p className="text-xs text-gray-500">{currentStep.tip}</p>
                  </div>
                </Link>
              </div>

              {/* Steps list */}
              <div className="p-2">
                {steps.slice(0, 4).map((step, index) => {
                  const Icon = step.icon
                  const isCurrent = index === currentStepIndex

                  return (
                    <Link
                      key={step.id}
                      href={step.href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                        step.completed
                          ? 'text-gray-400'
                          : isCurrent
                          ? 'bg-violet-50 text-violet-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className={`w-4 h-4 flex-shrink-0 ${isCurrent ? 'text-violet-500' : 'text-gray-300'}`} />
                      )}
                      <span className={`text-sm ${step.completed ? 'line-through' : ''}`}>
                        {step.shortTitle}
                      </span>
                    </Link>
                  )
                })}
              </div>

              {/* Tip */}
              <div className="px-3 pb-3">
                <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                  💡 Cuando termines cada paso, vuelve aquí para ver el siguiente.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
