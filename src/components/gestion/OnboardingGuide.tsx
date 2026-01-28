'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  X,
  ChevronRight,
  ChevronLeft,
  Building2,
  Users,
  Home,
  Receipt,
  FileText,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react'

interface OnboardingGuideProps {
  onComplete: () => void
  onDismiss: () => void
  currentProgress?: {
    hasCompany: boolean
    hasClients: boolean
    hasConfiguredProperties: boolean
    hasReservations: boolean
    hasExpenses: boolean
    hasInvoices: boolean
  }
  isFirstTime?: boolean // Si es true, no se puede saltar el wizard
}

interface Step {
  id: string
  title: string
  icon: React.ElementType
  description: string
  action?: {
    label: string
    href: string
  }
  tips?: string[]
  completed?: boolean
}

export function OnboardingGuide({ onComplete, onDismiss, currentProgress, isFirstTime = false }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  const steps: Step[] = [
    {
      id: 'welcome',
      title: '¡Bienvenido a Itineramio Gestión!',
      icon: Sparkles,
      description: 'El módulo de gestión económica de Itineramio. Gestiona propietarios, importa reservas y genera facturas y liquidaciones automáticamente.',
      tips: [
        'Todo lo que configures aquí aparecerá en tus facturas',
        'Podrás gestionar múltiples propietarios y propiedades'
      ]
    },
    {
      id: 'company',
      title: '1. Configura tu empresa',
      icon: Building2,
      description: 'Primero, configura los datos de tu empresa o autónomo. Estos datos aparecerán como emisor en todas tus facturas.',
      action: {
        label: 'Ir a Mi Empresa',
        href: '/gestion/perfil-gestor'
      },
      tips: [
        'Añade tu nombre fiscal, NIF y dirección',
        'Configura tu IBAN para que aparezca en las facturas'
      ],
      completed: currentProgress?.hasCompany
    },
    {
      id: 'client',
      title: '2. Crea tu primer propietario',
      icon: Users,
      description: 'Los propietarios son los dueños de los apartamentos que gestionas. A ellos les facturarás tus servicios de gestión.',
      action: {
        label: 'Ir a Propietarios',
        href: '/gestion/clientes'
      },
      tips: [
        'Cada propietario puede tener uno o más apartamentos',
        'Añade sus datos fiscales para las facturas'
      ],
      completed: currentProgress?.hasClients
    },
    {
      id: 'property',
      title: '3. Configura una propiedad',
      icon: Home,
      description: 'Asigna un propietario a cada propiedad y define las condiciones de gestión: comisión, limpieza, etc.',
      action: {
        label: 'Ir a Configuración',
        href: '/gestion/configuracion'
      },
      tips: [
        'Define el % de comisión que cobras por gestionar',
        'Indica quién recibe el dinero de las reservas',
        'Configura cómo se cobra la limpieza'
      ],
      completed: currentProgress?.hasConfiguredProperties
    },
    {
      id: 'reservations',
      title: '4. Importa reservas',
      icon: Receipt,
      description: 'Importa las reservas de Airbnb o Booking. Selecciona la propiedad y se calcularán automáticamente las comisiones.',
      action: {
        label: 'Ir a Reservas',
        href: '/gestion/reservas'
      },
      tips: [
        'Descarga el CSV de Airbnb/Booking e impórtalo',
        'Selecciona a qué propiedad pertenecen las reservas',
        'Se calculan automáticamente comisión, limpieza y reparto'
      ],
      completed: currentProgress?.hasReservations
    },
    {
      id: 'expenses',
      title: '5. Añade gastos (opcional)',
      icon: FileText,
      description: 'Repercute al propietario gastos adicionales: mantenimiento, compras para el apartamento, reparaciones, etc. según vuestro acuerdo.',
      action: {
        label: 'Ir a Gastos',
        href: '/gestion/gastos'
      },
      tips: [
        'Ejemplos: bombillas, mantas, reparaciones, productos limpieza',
        'Los gastos se incluyen en la factura mensual',
        'Puedes adjuntar el ticket o factura del proveedor'
      ],
      completed: currentProgress?.hasExpenses
    },
    {
      id: 'billing',
      title: '6. Revisa y emite facturas',
      icon: Receipt,
      description: 'En Facturación verás todas las propiedades organizadas por mes. Revisa cada factura y emítela cuando esté lista.',
      action: {
        label: 'Ir a Facturación',
        href: '/gestion/facturacion'
      },
      tips: [
        'Las facturas se crean como borrador',
        'Revisa los importes antes de emitir',
        'Una vez emitida, se asigna número oficial'
      ],
      completed: currentProgress?.hasInvoices
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    try {
      await fetch('/api/gestion/onboarding-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'completed' })
      })
    } catch (e) {
      // Silently fail
    }
    onComplete()
  }

  const handleDismiss = async () => {
    try {
      await fetch('/api/gestion/onboarding-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'skipped' })
      })
    } catch (e) {
      // Silently fail
    }
    onDismiss()
  }

  const step = steps[currentStep]
  const Icon = step.icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={(e) => !isFirstTime && e.target === e.currentTarget && handleDismiss()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Image
                  src="/isotipo-itineramio.svg"
                  alt="Itineramio"
                  width={28}
                  height={28}
                />
              </div>
              <div>
                <h3 className="text-white font-semibold">Guía de inicio</h3>
                <p className="text-white/70 text-xs">Paso {currentStep + 1} de {steps.length}</p>
              </div>
            </div>
            {!isFirstTime && (
              <button
                onClick={handleDismiss}
                className="text-white/70 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-violet-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Icon & Title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    step.completed
                      ? 'bg-green-100 text-green-600'
                      : 'bg-violet-100 text-violet-600'
                  }`}>
                    {step.completed ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      {step.title}
                      {step.completed && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Completado
                        </span>
                      )}
                    </h2>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-5 leading-relaxed">
                  {step.description}
                </p>

                {/* Action button */}
                {step.action && (
                  <Link
                    href={step.action.href}
                    onClick={() => {
                      // Marcar que necesita refrescar cuando vuelva
                      sessionStorage.setItem('gestion-needs-refresh', 'true')
                      onComplete()
                    }}
                    className="inline-flex items-center gap-2 bg-violet-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-violet-700 transition-colors mb-5"
                  >
                    {step.action.label}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}

                {/* Tips */}
                {step.tips && step.tips.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
                      <Lightbulb className="w-4 h-4" />
                      <span className="text-sm">Tips</span>
                    </div>
                    <ul className="space-y-1.5">
                      {step.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                          <span className="text-amber-500 mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentStep === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            <div className="flex items-center gap-2">
              {!isFirstTime && (
                <button
                  onClick={handleDismiss}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Saltar guía
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-1 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
              >
                {currentStep === steps.length - 1 ? 'Empezar' : 'Siguiente'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
