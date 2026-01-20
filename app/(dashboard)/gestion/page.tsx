'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Euro,
  TrendingUp,
  Calendar,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, Badge } from '../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardFooter } from '../../../src/components/layout/DashboardFooter'

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
}

export default function GestionDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().toLocaleDateString('es-ES', { month: 'long' })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/gestion/dashboard', { credentials: 'include' })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
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

  const quickLinks = [
    {
      href: '/gestion/facturacion',
      icon: <Building2 className="w-6 h-6" />,
      title: 'Facturación por Propiedad',
      description: 'Ver liquidaciones mensuales',
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
      title: 'Clientes',
      description: 'Propietarios y otros clientes',
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
                    {stats.yearlyIncome.toLocaleString('es-ES')}€
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Comisión: {stats.yearlyCommission.toLocaleString('es-ES')}€
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
                    {stats.monthlyIncome.toLocaleString('es-ES')}€
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Comisión: {stats.monthlyCommission.toLocaleString('es-ES')}€
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

          {/* Alerts */}
          {stats && (stats.pendingLiquidations > 0 || stats.pendingInvoices > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mb-6"
            >
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-800">Acciones pendientes</p>
                      <ul className="text-sm text-orange-700 mt-1 space-y-1">
                        {stats.pendingLiquidations > 0 && (
                          <li>• {stats.pendingLiquidations} liquidaciones por generar</li>
                        )}
                        {stats.pendingInvoices > 0 && (
                          <li>• {stats.pendingInvoices} facturas por enviar/cobrar</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
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

          {/* Recent Activity placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-8"
          >
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Cómo empezar</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center font-semibold text-sm">1</div>
                    <div>
                      <p className="font-medium text-gray-900">Configura tu empresa</p>
                      <p className="text-sm text-gray-500">Añade tu logo y datos fiscales en "Mi Empresa"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center font-semibold text-sm">2</div>
                    <div>
                      <p className="font-medium text-gray-900">Crea tus clientes</p>
                      <p className="text-sm text-gray-500">Añade propietarios en "Clientes" con sus datos fiscales</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center font-semibold text-sm">3</div>
                    <div>
                      <p className="font-medium text-gray-900">Asigna propiedades</p>
                      <p className="text-sm text-gray-500">Configura cada propiedad con su propietario y comisiones</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center font-semibold text-sm">4</div>
                    <div>
                      <p className="font-medium text-gray-900">Genera liquidaciones</p>
                      <p className="text-sm text-gray-500">Entra en "Facturación" y genera las liquidaciones mensuales</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  )
}
