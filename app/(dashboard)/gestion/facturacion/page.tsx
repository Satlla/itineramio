'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
  AlertCircle,
  Search
} from 'lucide-react'
import Link from 'next/link'
import { Button, Card, CardContent, Badge } from '../../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardFooter } from '../../../../src/components/layout/DashboardFooter'
import { useTranslation } from 'react-i18next'

interface PropertyStats {
  id: string
  name: string
  city: string
  imageUrl?: string
  type?: 'property' | 'billingUnit' | 'group'
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
  unitCount?: number
  units?: { id: string; name: string; reservations: number }[]
}

export default function FacturacionPage() {
  const { t } = useTranslation('gestion')
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<PropertyStats[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [searchTerm, setSearchTerm] = useState('')

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

  // Filter properties by search term
  const filteredProperties = useMemo(() => {
    if (!searchTerm) return properties
    const term = searchTerm.toLowerCase()
    return properties.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.city.toLowerCase().includes(term) ||
      p.owner?.name?.toLowerCase().includes(term)
    )
  }, [properties, searchTerm])

  // Calculate totals from filtered properties
  const totals = filteredProperties.reduce((acc, p) => ({
    totalIncome: acc.totalIncome + p.stats.totalIncome,
    totalReservations: acc.totalReservations + p.stats.totalReservations,
    totalNights: acc.totalNights + p.stats.totalNights
  }), { totalIncome: 0, totalReservations: 0, totalNights: 0 })

  if (loading) {
    return <AnimatedLoadingSpinner text={t('billing.loading')} type="general" />
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
                    {t('billing.title')}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {t('billing.subtitle')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('billing.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 w-48 sm:w-64"
                  />
                </div>
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
          {filteredProperties.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-3 gap-3 sm:gap-4 mb-6"
            >
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-600">{t('billing.stats.income', { year: selectedYear })}</p>
                    <p className="text-lg sm:text-2xl font-bold text-green-600">
                      {formatCurrency(totals.totalIncome)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-600">{t('billing.stats.reservations')}</p>
                    <p className="text-lg sm:text-2xl font-bold text-violet-600">
                      {totals.totalReservations}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-600">{t('billing.stats.nights')}</p>
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
            {filteredProperties.length === 0 && !searchTerm ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Home className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-700 font-medium mb-2">{t('billing.emptyState.title')}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {t('billing.emptyState.description')}
                  </p>
                  <Link href="/gestion/apartamentos">
                    <Button className="bg-violet-600 hover:bg-violet-700">
                      {t('billing.emptyState.action')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : filteredProperties.length === 0 && searchTerm ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-700 font-medium mb-2">{t('billing.noResults.title')}</p>
                  <p className="text-sm text-gray-500">
                    {t('billing.noResults.description', { searchTerm })}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredProperties.map((property, index) => {
                  const hasOwner = !!property.owner
                  const isGroup = property.type === 'group'

                  // Build the correct link based on type
                  let linkHref = ''
                  if (property.type === 'group') {
                    linkHref = `/gestion/facturacion/${property.id.replace('group:', '')}?type=group`
                  } else if (property.type === 'billingUnit') {
                    linkHref = `/gestion/facturacion/${property.id.replace('unit:', '')}?type=unit`
                  } else {
                    linkHref = `/gestion/facturacion/${property.id}`
                  }

                  const cardContent = (
                    <Card className={`transition-all ${hasOwner ? 'hover:shadow-lg cursor-pointer' : 'opacity-80'} ${isGroup ? 'border-l-4 border-l-emerald-500 bg-emerald-50/30' : hasOwner ? 'border-l-4 border-l-violet-500' : 'border-l-4 border-l-yellow-400'}`}>
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
                              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center ${isGroup ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                {isGroup ? (
                                  <Building2 className="w-8 h-8 text-emerald-600" />
                                ) : (
                                  <Home className="w-8 h-8 text-gray-400" />
                                )}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {property.name}
                                </h3>
                                {isGroup && (
                                  <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                                    {property.unitCount} {t('billing.card.apartments')}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{property.city}</p>
                              {property.owner && (
                                <div className="flex items-center gap-1 mt-1">
                                  <User className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {property.owner.name}
                                  </span>
                                </div>
                              )}
                              {isGroup && property.units && (
                                <div className="mt-1 text-xs text-gray-400">
                                  {property.units.map(u => u.name).join(' · ')}
                                </div>
                              )}
                              {!property.owner && (
                                <div className="mt-2 flex items-center gap-2 flex-wrap">
                                  <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {t('billing.card.noOwner')}
                                  </Badge>
                                  <Link
                                    href="/gestion/apartamentos"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-xs text-violet-600 hover:text-violet-800 font-medium underline"
                                  >
                                    {t('billing.card.assignOwner')}
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-4 gap-4 sm:gap-6 text-center">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">{t('billing.card.income')}</p>
                              <p className="font-semibold text-green-600">
                                {formatCurrency(property.stats.totalIncome)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">{t('billing.card.occupancy')}</p>
                              <p className="font-semibold text-violet-600">
                                {property.stats.occupancyRate.toFixed(0)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">{t('billing.card.pricePerNight')}</p>
                              <p className="font-semibold text-gray-900">
                                {Number(property.stats.averageNightPrice).toFixed(2).replace('.', ',')} €
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">{t('billing.card.reservations')}</p>
                              <p className="font-semibold text-gray-900">
                                {property.stats.totalReservations}
                              </p>
                            </div>
                          </div>

                          {/* Pending Badge & Arrow */}
                          <div className="flex items-center gap-3">
                            {hasOwner && property.stats.pendingLiquidations > 0 && (
                              <Badge className="bg-orange-100 text-orange-700">
                                {property.stats.pendingLiquidations} {t('billing.card.pending')}
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
                        <Link href={linkHref}>
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
