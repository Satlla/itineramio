'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/format'
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  TrendingUp,
  Calendar,
  Check,
  ChevronRight,
  CalendarDays,
  FileEdit,
  CreditCard,
  Settings,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, Button } from '../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardFooter } from '../../../src/components/layout/DashboardFooter'
import { OnboardingGuide } from '../../../src/components/gestion/OnboardingGuide'

interface DashboardStats {
  totalProperties: number
  totalOwners: number
  totalInvoices: number
  pendingInvoices: number
  yearlyIncome: number
  yearlyCommission: number
  monthlyIncome: number
  monthlyCommission: number
  pendingLiquidations: number
  recentReservations: number
  yearlyReservations: number
  totalExpenses: number
}

interface OnboardingStatus {
  companyConfigured: boolean
  hasClients: boolean
  hasConfiguredProperties: boolean
  hasLiquidations: boolean
  allComplete: boolean
}

interface PendingActions {
  unliquidatedReservations: number
  draftInvoices: number
  unpaidInvoices: number
}

export default function GestionDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [onboarding, setOnboarding] = useState<OnboardingStatus | null>(null)
  const [pendingActions, setPendingActions] = useState<PendingActions | null>(null)
  const [showWizard, setShowWizard] = useState(false)
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().toLocaleDateString('es-ES', { month: 'long' })

  useEffect(() => {
    fetchStats()

    // Polling para detectar cuando el usuario vuelve de hacer algo
    const interval = setInterval(() => {
      const needsRefresh = sessionStorage.getItem('gestion-needs-refresh')
      if (needsRefresh) {
        sessionStorage.removeItem('gestion-needs-refresh')
        fetchStats()
      }
    }, 500)

    return () => clearInterval(interval)
  }, [])

  // Check if should show wizard after data loads
  useEffect(() => {
    if (!loading && onboarding) {
      // Solo mostrar wizard si es PRIMERA VEZ (sin empresa, clientes ni propiedades)
      // Si ya tiene los 3 primeros pasos, NO mostrar automáticamente
      const isFirstTime = !onboarding.companyConfigured && !onboarding.hasClients && !onboarding.hasConfiguredProperties
      setShowWizard(isFirstTime)
    }
  }, [loading, onboarding])

  const handleWizardComplete = () => {
    setShowWizard(false)
    fetchStats() // Reload stats after completing wizard
  }

  const handleWizardDismiss = () => {
    localStorage.setItem('gestion-onboarding-dismissed', 'true')
    setShowWizard(false)
  }

  const handleShowWizard = () => {
    setShowWizard(true)
  }

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/gestion/dashboard', { credentials: 'include' })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setOnboarding(data.onboarding)
        setPendingActions(data.pendingActions)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <AnimatedLoadingSpinner text="Cargando..." type="general" />
  }

  const onboardingSteps = [
    {
      id: 1,
      title: 'Configura tu empresa',
      description: 'Añade tus datos fiscales para poder facturar',
      completed: onboarding?.companyConfigured ?? false,
      href: '/gestion/perfil-gestor'
    },
    {
      id: 2,
      title: 'Crea propietarios',
      description: 'Añade los propietarios de los apartamentos',
      completed: onboarding?.hasClients ?? false,
      href: '/gestion/clientes'
    },
    {
      id: 3,
      title: 'Configura facturación',
      description: 'Asigna propietario, comisión y limpieza a tus propiedades',
      completed: onboarding?.hasConfiguredProperties ?? false,
      href: '/gestion/configuracion'
    },
    {
      id: 4,
      title: 'Primera factura',
      description: 'Cierra el mes y emite tu primera factura',
      completed: onboarding?.hasLiquidations ?? false,
      href: '/gestion/facturacion'
    }
  ]

  // Find the first incomplete step
  const nextStep = onboardingSteps.find(step => !step.completed)

  const hasPendingActions = pendingActions && (
    pendingActions.unliquidatedReservations > 0 ||
    pendingActions.draftInvoices > 0 ||
    pendingActions.unpaidInvoices > 0
  )

  const quickLinks = [
    {
      href: '/gestion/facturacion',
      icon: <Building2 className="w-6 h-6" />,
      title: 'Facturación',
      description: 'Cierre mensual por propiedad',
      color: 'bg-violet-100 text-violet-600'
    },
    {
      href: '/gestion/facturas',
      icon: <FileText className="w-6 h-6" />,
      title: 'Todas las Facturas',
      description: 'Crear y gestionar facturas',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      href: '/gestion/clientes',
      icon: <Users className="w-6 h-6" />,
      title: 'Propietarios',
      description: 'Gestiona los dueños de los apartamentos',
      color: 'bg-green-100 text-green-600'
    },
    {
      href: '/gestion/configuracion',
      icon: <Building2 className="w-6 h-6" />,
      title: 'Configuración',
      description: 'Propiedades y comisiones',
      color: 'bg-orange-100 text-orange-600'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Onboarding Guide Modal (optional, opened from widget) */}
      {showWizard && (
        <OnboardingGuide
          onComplete={handleWizardComplete}
          onDismiss={handleWizardDismiss}
          currentProgress={{
            hasCompany: onboarding?.companyConfigured ?? false,
            hasClients: onboarding?.hasClients ?? false,
            hasConfiguredProperties: onboarding?.hasConfiguredProperties ?? false,
            hasReservations: (stats?.yearlyReservations ?? 0) > 0,
            hasExpenses: (stats?.totalExpenses ?? 0) > 0,
            hasInvoices: (stats?.totalInvoices ?? 0) > 0
          }}
          isFirstTime={!onboarding?.companyConfigured && !onboarding?.hasClients && !onboarding?.hasConfiguredProperties}
        />
      )}

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="flex items-center space-x-3">
              <LayoutDashboard className="h-7 w-7 text-violet-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Panel de Gestión
                </h1>
                <p className="text-sm text-gray-600">
                  Resumen de facturación y contabilidad
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6"
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Ingresos {currentYear}</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.yearlyIncome)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Comisión: {formatCurrency(stats.yearlyCommission)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 capitalize">{currentMonth}</span>
                    <Calendar className="w-4 h-4 text-violet-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.monthlyIncome)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Comisión: {formatCurrency(stats.monthlyCommission)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Propiedades</span>
                    <Building2 className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalProperties}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.totalOwners} propietarios
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Facturas</span>
                    <FileText className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalInvoices}
                  </p>
                  {stats.pendingInvoices > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      {stats.pendingInvoices} pendientes
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Pending Actions Cards */}
          {hasPendingActions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mb-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones pendientes</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingActions.unliquidatedReservations > 0 && (
                  <Link href="/gestion/reservas">
                    <Card className="hover:shadow-md transition-all cursor-pointer border-amber-200 bg-amber-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <CalendarDays className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-2xl font-bold text-amber-700">
                              {pendingActions.unliquidatedReservations}
                            </p>
                            <p className="text-sm font-medium text-amber-800">
                              Reservas sin facturar
                            </p>
                            <p className="text-xs text-amber-600 mt-1">
                              Pendientes de cierre mensual
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-amber-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )}

                {pendingActions.draftInvoices > 0 && (
                  <Link href="/gestion/facturas?status=DRAFT">
                    <Card className="hover:shadow-md transition-all cursor-pointer border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <FileEdit className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-2xl font-bold text-blue-700">
                              {pendingActions.draftInvoices}
                            </p>
                            <p className="text-sm font-medium text-blue-800">
                              Facturas en borrador
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              Pendientes de emitir
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-blue-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )}

                {pendingActions.unpaidInvoices > 0 && (
                  <Link href="/gestion/facturas?status=SENT">
                    <Card className="hover:shadow-md transition-all cursor-pointer border-violet-200 bg-violet-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                            <CreditCard className="w-5 h-5 text-violet-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-2xl font-bold text-violet-700">
                              {pendingActions.unpaidInvoices}
                            </p>
                            <p className="text-sm font-medium text-violet-800">
                              Facturas por cobrar
                            </p>
                            <p className="text-xs text-violet-600 mt-1">
                              Enviadas, pendientes de pago
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-violet-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )}
              </div>
            </motion.div>
          )}

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acceso rápido</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => (
                <Link key={link.href} href={link.href}>
                  <Card className="hover:shadow-md transition-all cursor-pointer h-full">
                    <CardContent className="p-4">
                      <div className={`w-12 h-12 rounded-lg ${link.color} flex items-center justify-center mb-3`}>
                        {link.icon}
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">{link.title}</h3>
                      <p className="text-sm text-gray-500">{link.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Dynamic Onboarding - only show if not all complete */}
          {onboarding && !onboarding.allComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-8"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Cómo empezar</h2>
                    <span className="text-sm text-gray-500">
                      {onboardingSteps.filter(s => s.completed).length} de {onboardingSteps.length} completados
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(onboardingSteps.filter(s => s.completed).length / onboardingSteps.length) * 100}%` }}
                    />
                  </div>
                  <div className="space-y-4">
                    {onboardingSteps.map((step) => {
                      const isNext = nextStep?.id === step.id
                      return (
                        <Link
                          key={step.id}
                          href={step.href}
                          className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                            isNext
                              ? 'bg-violet-50 border border-violet-200 hover:bg-violet-100'
                              : step.completed
                              ? 'opacity-60'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                            step.completed
                              ? 'bg-green-100 text-green-600'
                              : isNext
                              ? 'bg-violet-600 text-white'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {step.completed ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              step.id
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium ${step.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                              {step.title}
                            </p>
                            <p className="text-sm text-gray-500">{step.description}</p>
                          </div>
                          {isNext && (
                            <div className="flex items-center gap-1 text-violet-600 text-sm font-medium">
                              <span>Siguiente</span>
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>

      <DashboardFooter />
    </div>
  )
}
