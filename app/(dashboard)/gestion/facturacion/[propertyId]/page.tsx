'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Euro,
  FileText,
  Plus,
  TrendingUp,
  Percent,
  Home,
  User,
  BarChart3,
  Check,
  Clock,
  AlertCircle,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { Button, Card, CardContent, Badge } from '../../../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardFooter } from '../../../../../src/components/layout/DashboardFooter'

interface PropertyDetail {
  id: string
  name: string
  city: string
  imageUrl?: string
  owner?: {
    id: string
    name: string
    email?: string
  }
  billingConfig?: {
    commissionType: string
    commissionValue: number
    incomeReceiver: 'OWNER' | 'MANAGER'
    cleaningValue: number
  }
}

interface MonthData {
  month: number
  monthName: string
  reservations: number
  income: number
  nights: number
  commission: number
  cleaning: number
  expenses: number
  liquidation?: {
    id: string
    status: 'DRAFT' | 'SENT' | 'PAID'
    totalAmount: number
    invoiceNumber?: string
  }
}

interface YearData {
  year: number
  months: MonthData[]
  totals: {
    reservations: number
    income: number
    nights: number
    commission: number
    occupancyRate: number
    averageNightPrice: number
  }
}

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const statusLabels: Record<string, string> = {
  DRAFT: 'Borrador',
  SENT: 'Enviada',
  PAID: 'Pagada'
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SENT: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700'
}

export default function PropertyFacturacionPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.propertyId as string

  const [loading, setLoading] = useState(true)
  const [property, setProperty] = useState<PropertyDetail | null>(null)
  const [yearData, setYearData] = useState<YearData[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [expandedYears, setExpandedYears] = useState<number[]>([new Date().getFullYear()])
  const [creatingLiquidation, setCreatingLiquidation] = useState<string | null>(null)

  useEffect(() => {
    fetchPropertyData()
  }, [propertyId])

  const fetchPropertyData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/facturacion/properties/${propertyId}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setProperty(data.property)
        setYearData(data.years || [])
      } else if (response.status === 404) {
        router.push('/gestion/facturacion')
      }
    } catch (error) {
      console.error('Error fetching property data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleYear = (year: number) => {
    setExpandedYears(prev =>
      prev.includes(year)
        ? prev.filter(y => y !== year)
        : [...prev, year]
    )
  }

  const handleCreateLiquidation = async (year: number, month: number) => {
    if (!property?.owner) {
      alert('Esta propiedad no tiene un propietario asignado')
      return
    }

    try {
      setCreatingLiquidation(`${year}-${month}`)
      const response = await fetch('/api/liquidations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ownerId: property.owner.id,
          propertyId,
          year,
          month
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Navigate to liquidation detail
        router.push(`/gestion/liquidaciones/${data.liquidation.id}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Error al crear la liquidación')
      }
    } catch (error) {
      console.error('Error creating liquidation:', error)
      alert('Error al crear la liquidación')
    } finally {
      setCreatingLiquidation(null)
    }
  }

  if (loading) {
    return <AnimatedLoadingSpinner text="Cargando propiedad..." type="general" />
  }

  if (!property) {
    return null
  }

  const currentYearData = yearData.find(y => y.year === selectedYear)

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
            <Link
              href="/gestion/facturacion"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Volver a propiedades
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {property.imageUrl ? (
                  <img
                    src={property.imageUrl}
                    alt={property.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Home className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {property.name}
                  </h1>
                  <p className="text-sm text-gray-500">{property.city}</p>
                  {property.owner ? (
                    <div className="flex items-center gap-1 mt-2">
                      <User className="w-4 h-4 text-violet-500" />
                      <span className="text-sm text-gray-700">
                        {property.owner.name}
                      </span>
                    </div>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-700 text-xs mt-2">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Sin propietario asignado
                    </Badge>
                  )}
                </div>
              </div>

              {property.billingConfig && (
                <div className="bg-violet-50 rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-gray-500">Comisión:</span>
                      <span className="font-semibold text-violet-700 ml-1">
                        {property.billingConfig.commissionValue}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Limpieza:</span>
                      <span className="font-semibold text-violet-700 ml-1">
                        {property.billingConfig.cleaningValue}€
                      </span>
                    </div>
                    <Badge className={property.billingConfig.incomeReceiver === 'MANAGER' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
                      {property.billingConfig.incomeReceiver === 'MANAGER' ? 'Gestor cobra' : 'Propietario cobra'}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Year Stats */}
          {currentYearData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6"
            >
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-600">Ingresos {selectedYear}</p>
                    <p className="text-lg sm:text-2xl font-bold text-green-600">
                      {currentYearData.totals.income.toLocaleString('es-ES')}€
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-600">Ocupación</p>
                    <p className="text-lg sm:text-2xl font-bold text-violet-600">
                      {currentYearData.totals.occupancyRate.toFixed(0)}%
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-600">€/noche</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">
                      {currentYearData.totals.averageNightPrice.toFixed(0)}€
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-600">Reservas</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">
                      {currentYearData.totals.reservations}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Years with Months */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {yearData.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No hay datos de facturación para esta propiedad</p>
                </CardContent>
              </Card>
            ) : (
              yearData.map(year => (
                <Card key={year.year}>
                  <CardContent className="p-0">
                    {/* Year Header */}
                    <button
                      onClick={() => toggleYear(year.year)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-gray-900">{year.year}</span>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{year.totals.reservations} reservas</span>
                          <span className="text-green-600 font-medium">
                            {year.totals.income.toLocaleString('es-ES')}€
                          </span>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedYears.includes(year.year) ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Months */}
                    {expandedYears.includes(year.year) && (
                      <div className="border-t border-gray-200">
                        {year.months.map(month => (
                          <div
                            key={month.month}
                            className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-4">
                                <div className="w-24">
                                  <span className="font-medium text-gray-900">
                                    {month.monthName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-gray-500">
                                    {month.reservations} res.
                                  </span>
                                  <span className="text-gray-500">
                                    {month.nights} noches
                                  </span>
                                  <span className="text-green-600 font-medium">
                                    {month.income.toLocaleString('es-ES')}€
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                {month.liquidation ? (
                                  <>
                                    <Badge className={statusColors[month.liquidation.status]}>
                                      {statusLabels[month.liquidation.status]}
                                    </Badge>
                                    {month.liquidation.invoiceNumber && (
                                      <span className="text-xs text-gray-500 font-mono">
                                        {month.liquidation.invoiceNumber}
                                      </span>
                                    )}
                                    <Link href={`/gestion/liquidaciones/${month.liquidation.id}`}>
                                      <Button size="sm" variant="outline">
                                        Ver liquidación
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                      </Button>
                                    </Link>
                                  </>
                                ) : month.reservations > 0 ? (
                                  <Button
                                    size="sm"
                                    onClick={() => handleCreateLiquidation(year.year, month.month)}
                                    disabled={creatingLiquidation === `${year.year}-${month.month}` || !property.owner}
                                    className="bg-violet-600 hover:bg-violet-700"
                                  >
                                    {creatingLiquidation === `${year.year}-${month.month}` ? (
                                      'Creando...'
                                    ) : (
                                      <>
                                        <Plus className="w-4 h-4 mr-1" />
                                        Crear liquidación
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <span className="text-sm text-gray-400">Sin reservas</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </motion.div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  )
}
