'use client'

import React, { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/format'
import { motion } from 'framer-motion'
import {
  Building2,
  ChevronRight,
  TrendingUp,
  Calendar,
  Euro,
  Percent,
  Home,
  User,
  BarChart3,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { Button, Card, CardContent, Badge } from '../../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardFooter } from '../../../../src/components/layout/DashboardFooter'

interface PropertyStats {
  id: string
  name: string
  city: string
  imageUrl?: string
  owner?: {
    id: string
    name: string
  }
  stats: {
    totalReservations: number
    totalIncome: number
    totalNights: number
    occupancyRate: number
    averageNightPrice: number
    pendingLiquidations: number
  }
  billingConfig?: {
    commissionValue: number
    incomeReceiver: 'OWNER' | 'MANAGER'
  }
}

export default function FacturacionPage() {
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<PropertyStats[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchProperties()
  }, [selectedYear])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/facturacion/properties?year=${selectedYear}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setProperties(data.properties || [])
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

  // Calculate totals
  const totals = properties.reduce((acc, p) => ({
    totalIncome: acc.totalIncome + p.stats.totalIncome,
    totalReservations: acc.totalReservations + p.stats.totalReservations,
    totalNights: acc.totalNights + p.stats.totalNights
  }), { totalIncome: 0, totalReservations: 0, totalNights: 0 })

  if (loading) {
    return <AnimatedLoadingSpinner text="Cargando propiedades..." type="general" />
  }

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Building2 className="h-7 w-7 text-violet-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Facturación
                  </h1>
                  <p className="text-sm text-gray-600">
                    Cierre mensual por propiedad
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Totals */}
          {properties.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-3 gap-3 sm:gap-4 mb-6"
            >
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-600">Ingresos {selectedYear}</p>
                    <p className="text-lg sm:text-2xl font-bold text-green-600">
                      {formatCurrency(totals.totalIncome)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-600">Reservas</p>
                    <p className="text-lg sm:text-2xl font-bold text-violet-600">
                      {totals.totalReservations}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-600">Noches</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">
                      {totals.totalNights}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Properties List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {properties.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Home className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-700 font-medium mb-2">No tienes propiedades configuradas</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Primero debes configurar tus propiedades con sus propietarios y comisiones.
                  </p>
                  <Link href="/gestion/configuracion">
                    <Button className="bg-violet-600 hover:bg-violet-700">
                      Ir a configuración
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {properties.map((property, index) => {
                  const hasOwner = !!property.owner

                  const cardContent = (
                    <Card className={`transition-all ${hasOwner ? 'hover:shadow-lg cursor-pointer border-l-4 border-l-violet-500' : 'border-l-4 border-l-yellow-400 opacity-80'}`}>
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          {/* Property Info */}
                          <div className="flex items-center gap-4 flex-1">
                            {property.imageUrl ? (
                              <img
                                src={property.imageUrl}
                                alt={property.name}
                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Home className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {property.name}
                              </h3>
                              <p className="text-sm text-gray-500">{property.city}</p>
                              {property.owner && (
                                <div className="flex items-center gap-1 mt-1">
                                  <User className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {property.owner.name}
                                  </span>
                                </div>
                              )}
                              {!property.owner && (
                                <div className="mt-2 flex items-center gap-2 flex-wrap">
                                  <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Sin propietario
                                  </Badge>
                                  <Link
                                    href="/gestion/configuracion"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-xs text-violet-600 hover:text-violet-800 font-medium underline"
                                  >
                                    Asignar propietario
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-4 gap-4 sm:gap-6 text-center">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Ingresos</p>
                              <p className="font-semibold text-green-600">
                                {formatCurrency(property.stats.totalIncome)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Ocupación</p>
                              <p className="font-semibold text-violet-600">
                                {property.stats.occupancyRate.toFixed(0)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">€/noche</p>
                              <p className="font-semibold text-gray-900">
                                {property.stats.averageNightPrice.toFixed(0)}€
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Reservas</p>
                              <p className="font-semibold text-gray-900">
                                {property.stats.totalReservations}
                              </p>
                            </div>
                          </div>

                          {/* Pending Badge & Arrow */}
                          <div className="flex items-center gap-3">
                            {hasOwner && property.stats.pendingLiquidations > 0 && (
                              <Badge className="bg-orange-100 text-orange-700">
                                {property.stats.pendingLiquidations} pendientes
                              </Badge>
                            )}
                            {hasOwner ? (
                              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            ) : (
                              <div className="w-5 h-5" /> /* Spacer */
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )

                  return (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      {hasOwner ? (
                        <Link href={`/gestion/facturacion/${property.id}`}>
                          {cardContent}
                        </Link>
                      ) : (
                        cardContent
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  )
}
