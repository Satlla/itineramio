'use client'

import { formatCurrency } from '@/lib/format'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Euro,
  Home,
  Users,
  FileText,
  Calendar,
  Download,
  Building2,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { Button, Card, CardContent, Badge } from '../../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardFooter } from '../../../../src/components/layout/DashboardFooter'
import { useTranslation } from 'react-i18next'

interface DashboardStats {
  totalProperties: number
  totalOwners: number
  totalInvoices: number
  pendingInvoices: number
  pendingToInvoice: number
  yearlyIncome: number
  yearlyCommission: number
  yearlyOwnerAmount: number
  yearlyCleaningAmount: number
  yearlyReservations: number
  monthlyIncome: number
  monthlyCommission: number
  monthlyOwnerAmount: number
  monthlyCleaningAmount: number
  monthlyReservations: number
  pendingLiquidations: number
  recentReservations: number
  avgCommission: number
}

interface ProfitabilityData {
  properties: Array<{
    property: { id: string; name: string; city: string }
    owner: any
    commissionValue: number
    reservations: number
    nights: number
    hostEarnings: number
    managerAmount: number
    ownerAmount: number
    cleaningAmount: number
    invoiced: number
    pending: number
  }>
  totals: {
    reservations: number
    nights: number
    hostEarnings: number
    managerAmount: number
    ownerAmount: number
    cleaningAmount: number
    invoiced: number
    pending: number
  }
}

export default function RentabilidadPage() {
  const { t } = useTranslation('gestion')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [profitability, setProfitability] = useState<ProfitabilityData | null>(null)
  const [year, setYear] = useState(new Date().getFullYear())
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [year])

  const fetchData = async () => {
    try {
      setLoading(true)

      const [statsRes, profitRes] = await Promise.all([
        fetch('/api/gestion/dashboard', { credentials: 'include' }),
        fetch(`/api/gestion/reports/profitability?startDate=${year}-01-01&endDate=${year}-12-31`, {
          credentials: 'include'
        })
      ])

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.stats)
      }

      if (profitRes.ok) {
        const data = await profitRes.json()
        setProfitability(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = async () => {
    try {
      setExporting(true)
      const response = await fetch(
        `/api/gestion/reports/profitability?startDate=${year}-01-01&endDate=${year}-12-31&format=csv`,
        { credentials: 'include' }
      )

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `rentabilidad_${year}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting CSV:', error)
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return <AnimatedLoadingSpinner text={t('profitability.loading')} type="general" />
  }

  const currentMonth = new Date().getMonth()
  const monthNames = [
    t('common.months.january'),
    t('common.months.february'),
    t('common.months.march'),
    t('common.months.april'),
    t('common.months.may'),
    t('common.months.june'),
    t('common.months.july'),
    t('common.months.august'),
    t('common.months.september'),
    t('common.months.october'),
    t('common.months.november'),
    t('common.months.december')
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('profitability.title')}</h1>
              <p className="text-sm text-gray-500">{t('profitability.subtitle')}</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={exportCSV}
                disabled={exporting}
              >
                <Download className="w-4 h-4 mr-2" />
                {exporting ? t('profitability.exporting') : t('profitability.export')}
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid - Year */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6"
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Euro className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{t('profitability.stats.income', { year })}</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(stats.yearlyIncome)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-violet-100 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-violet-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{t('profitability.stats.yourCommission', { year })}</p>
                  <p className="text-xl font-bold text-violet-600">
                    {formatCurrency(stats.yearlyCommission)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{t('profitability.stats.owners', { year })}</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(stats.yearlyOwnerAmount)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{t('profitability.stats.reservations', { year })}</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.yearlyReservations}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <FileText className="w-4 h-4 text-yellow-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{t('profitability.stats.pendingToInvoice')}</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {stats.pendingToInvoice}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Home className="w-4 h-4 text-orange-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{t('profitability.stats.properties')}</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.totalProperties}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* This Month Card */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {monthNames[currentMonth]} {year}
                    </h3>
                    <Badge className="bg-violet-100 text-violet-700">
                      {t('profitability.thisMonth.avgCommission')}: {stats.avgCommission}%
                    </Badge>
                  </div>

                  <div className="grid sm:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t('profitability.thisMonth.netIncome')}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(stats.monthlyIncome)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t('profitability.thisMonth.yourCommission')}</p>
                      <p className="text-2xl font-bold text-violet-600">
                        {formatCurrency(stats.monthlyCommission)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t('profitability.thisMonth.owners')}</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(stats.monthlyOwnerAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t('profitability.thisMonth.reservations')}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.monthlyReservations}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Properties Breakdown */}
          {profitability && profitability.properties.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t('profitability.table.title')}
                    </h3>
                    <div className="text-sm text-gray-500">
                      {profitability.totals.reservations} {t('profitability.table.totalReservations')}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 font-medium text-gray-500">{t('profitability.table.property')}</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-500">{t('profitability.table.reservations')}</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-500">{t('profitability.table.nights')}</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-500">{t('profitability.table.income')}</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-500">{t('profitability.table.yourCommission')}</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-500">{t('profitability.table.owner')}</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-500">{t('profitability.table.invoiced')}</th>
                          <th className="w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {profitability.properties.map((p) => (
                          <tr key={p.property.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-2">
                              <span className="font-medium text-gray-900">{p.property.name}</span>
                              <span className="block text-xs text-gray-500">
                                {p.property.city} · {p.commissionValue}%
                              </span>
                            </td>
                            <td className="text-right py-3 px-2">{p.reservations}</td>
                            <td className="text-right py-3 px-2">{p.nights}</td>
                            <td className="text-right py-3 px-2 font-medium">
                              {formatCurrency(p.hostEarnings)}
                            </td>
                            <td className="text-right py-3 px-2 font-medium text-violet-600">
                              {formatCurrency(p.managerAmount)}
                            </td>
                            <td className="text-right py-3 px-2 font-medium text-blue-600">
                              {formatCurrency(p.ownerAmount)}
                            </td>
                            <td className="text-right py-3 px-2">
                              <Badge
                                className={
                                  p.invoiced === p.reservations
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }
                              >
                                {p.invoiced}/{p.reservations}
                              </Badge>
                            </td>
                            <td className="py-3 px-2">
                              <Link
                                href={`/gestion/propiedades/${p.property.id}/calendario`}
                                className="text-violet-600 hover:text-violet-800"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 font-semibold">
                          <td className="py-3 px-2">{t('profitability.table.total')}</td>
                          <td className="text-right py-3 px-2">{profitability.totals.reservations}</td>
                          <td className="text-right py-3 px-2">{profitability.totals.nights}</td>
                          <td className="text-right py-3 px-2">
                            {formatCurrency(profitability.totals.hostEarnings)}
                          </td>
                          <td className="text-right py-3 px-2 text-violet-600">
                            {formatCurrency(profitability.totals.managerAmount)}
                          </td>
                          <td className="text-right py-3 px-2 text-blue-600">
                            {formatCurrency(profitability.totals.ownerAmount)}
                          </td>
                          <td className="text-right py-3 px-2">
                            {profitability.totals.invoiced}/{profitability.totals.reservations}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Empty State */}
          {profitability && profitability.properties.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-12 text-center">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('profitability.emptyState.title')}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {t('profitability.emptyState.description')}
                  </p>
                  <Link href="/gestion/integraciones">
                    <Button variant="default" size="sm">
                      {t('profitability.emptyState.action')}
                    </Button>
                  </Link>
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
