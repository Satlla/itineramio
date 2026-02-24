'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  FileText,
  Plus,
  ChevronRight,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  Euro,
  Calendar,
  User,
  Building2,
  MoreVertical,
  Receipt
} from 'lucide-react'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import { AnimatedLoadingSpinner } from '@/components/ui/AnimatedLoadingSpinner'
import { DashboardFooter } from '@/components/layout/DashboardFooter'
import { formatCurrency } from '@/lib/format'
import { useTranslation } from 'react-i18next'
import { PendingSettlementsSection } from './components/PendingSettlementsSection'

interface Owner {
  id: string
  name: string
  email: string
}

interface Liquidation {
  id: string
  year: number
  month: number
  owner: Owner
  totalIncome: number
  totalCommission: number
  totalCommissionVat: number
  totalRetention: number
  totalCleaning: number
  totalExpenses: number
  totalAmount: number
  status: 'DRAFT' | 'GENERATED' | 'SENT' | 'PAID' | 'CANCELLED'
  invoiceNumber?: string
  paidAt?: string
  createdAt: string
  reservationsCount: number
  expensesCount: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface Totals {
  totalIncome: number
  totalCommission: number
  totalRetention: number
  totalAmount: number
}

const STATUS_CONFIG = {
  DRAFT: { key: 'status.draft', color: 'bg-gray-100 text-gray-700', icon: Clock },
  GENERATED: { key: 'status.generated', color: 'bg-blue-100 text-blue-700', icon: FileText },
  SENT: { key: 'status.sent', color: 'bg-violet-100 text-violet-700', icon: Send },
  PAID: { key: 'status.paid', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  CANCELLED: { key: 'status.cancelled', color: 'bg-red-100 text-red-700', icon: XCircle }
}

export default function LiquidacionesPage() {
  const { t } = useTranslation('gestion')
  const [loading, setLoading] = useState(true)
  const [liquidations, setLiquidations] = useState<Liquidation[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [totals, setTotals] = useState<Totals | null>(null)
  const [owners, setOwners] = useState<{ id: string; name: string }[]>([])

  // Filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [selectedOwner, setSelectedOwner] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

  const MONTHS = [
    t('common.months.january'), t('common.months.february'), t('common.months.march'),
    t('common.months.april'), t('common.months.may'), t('common.months.june'),
    t('common.months.july'), t('common.months.august'), t('common.months.september'),
    t('common.months.october'), t('common.months.november'), t('common.months.december')
  ]

  useEffect(() => {
    fetchOwners()
  }, [])

  useEffect(() => {
    fetchLiquidations()
  }, [selectedYear, selectedMonth, selectedOwner, selectedStatus])

  const fetchOwners = async () => {
    try {
      const response = await fetch('/api/gestion/owners', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setOwners(data.owners.map((o: any) => ({
          id: o.id,
          name: o.type === 'EMPRESA' ? o.companyName : `${o.firstName} ${o.lastName}`
        })))
      }
    } catch (error) {
      console.error('Error fetching owners:', error)
    }
  }

  const fetchLiquidations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('year', selectedYear.toString())
      if (selectedMonth) params.set('month', selectedMonth.toString())
      if (selectedOwner) params.set('ownerId', selectedOwner)
      if (selectedStatus) params.set('status', selectedStatus)

      const response = await fetch(`/api/gestion/liquidations?${params}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setLiquidations(data.liquidations || [])
        setPagination(data.pagination)
        setTotals(data.totals)
      }
    } catch (error) {
      console.error('Error fetching liquidations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = async (id: string) => {
    window.open(`/api/gestion/liquidations/${id}/pdf`, '_blank')
  }

  const handleMarkPaid = async (id: string) => {
    try {
      const response = await fetch(`/api/gestion/liquidations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'PAID' })
      })

      if (response.ok) {
        fetchLiquidations()
      }
    } catch (error) {
      console.error('Error updating liquidation:', error)
    }
  }

  // Filter by search term
  const filteredLiquidations = liquidations.filter(l => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return l.owner.name.toLowerCase().includes(term) ||
           l.owner.email?.toLowerCase().includes(term)
  })

  if (loading) {
    return <AnimatedLoadingSpinner text={t('settlements.loading')} type="general" />
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
                <Receipt className="h-7 w-7 text-violet-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {t('settlements.title')}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {t('settlements.subtitle')}
                  </p>
                </div>
              </div>

              <Link href="/gestion/liquidaciones/nueva">
                <Button className="bg-violet-600 hover:bg-violet-700">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('settlements.actions.newSettlement')}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Pending Settlements Section */}
          <PendingSettlementsSection />

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('settlements.search')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  {/* Year */}
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>

                  {/* Month */}
                  <select
                    value={selectedMonth || ''}
                    onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">{t('settlements.filters.allMonths')}</option>
                    {MONTHS.map((month, index) => (
                      <option key={index} value={index + 1}>{month}</option>
                    ))}
                  </select>

                  {/* Owner */}
                  <select
                    value={selectedOwner}
                    onChange={(e) => setSelectedOwner(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 max-w-48"
                  >
                    <option value="">{t('settlements.filters.allOwners')}</option>
                    {owners.map(owner => (
                      <option key={owner.id} value={owner.id}>{owner.name}</option>
                    ))}
                  </select>

                  {/* Status */}
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">{t('settlements.filters.allStatuses')}</option>
                    <option value="DRAFT">{t('settlements.status.draft')}</option>
                    <option value="GENERATED">{t('settlements.status.generated')}</option>
                    <option value="SENT">{t('settlements.status.sent')}</option>
                    <option value="PAID">{t('settlements.status.paid')}</option>
                    <option value="CANCELLED">{t('settlements.status.cancelled')}</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Totals Summary */}
          {totals && filteredLiquidations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
            >
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{t('settlements.stats.totalIncome')}</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(totals.totalIncome)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{t('settlements.stats.commissions')}</p>
                  <p className="text-lg font-bold text-violet-600">{formatCurrency(totals.totalCommission)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{t('settlements.stats.retentions')}</p>
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(totals.totalRetention)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{t('settlements.stats.netOwners')}</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(totals.totalAmount)}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Liquidations List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {filteredLiquidations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Receipt className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-700 font-medium mb-2">{t('settlements.emptyState.title')}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {searchTerm || selectedOwner || selectedStatus
                      ? t('settlements.emptyState.descriptionFiltered')
                      : t('settlements.emptyState.descriptionEmpty')}
                  </p>
                  <Link href="/gestion/liquidaciones/nueva">
                    <Button className="bg-violet-600 hover:bg-violet-700">
                      <Plus className="w-4 h-4 mr-2" />
                      {t('settlements.actions.newSettlement')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredLiquidations.map((liquidation, index) => {
                  const StatusIcon = STATUS_CONFIG[liquidation.status].icon
                  return (
                    <motion.div
                      key={liquidation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Link href={`/gestion/liquidaciones/${liquidation.id}`}>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-violet-500">
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              {/* Period and Owner */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Calendar className="w-4 h-4 text-violet-600" />
                                  <span className="font-semibold text-gray-900">
                                    {MONTHS[liquidation.month - 1]} {liquidation.year}
                                  </span>
                                  <Badge className={STATUS_CONFIG[liquidation.status].color}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {t(`settlements.${STATUS_CONFIG[liquidation.status].key}`)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <User className="w-3 h-3" />
                                  <span className="truncate">{liquidation.owner.name}</span>
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span>{liquidation.reservationsCount} {t('settlements.card.reservations')}</span>
                                  {liquidation.expensesCount > 0 && (
                                    <span>{liquidation.expensesCount} {t('settlements.card.expenses')}</span>
                                  )}
                                </div>
                              </div>

                              {/* Amounts */}
                              <div className="grid grid-cols-3 gap-4 text-center sm:text-right">
                                <div>
                                  <p className="text-xs text-gray-500">{t('settlements.card.income')}</p>
                                  <p className="font-semibold text-gray-900">
                                    {formatCurrency(liquidation.totalIncome)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">{t('settlements.card.commission')}</p>
                                  <p className="font-semibold text-violet-600">
                                    {formatCurrency(liquidation.totalCommission)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">{t('settlements.card.net')}</p>
                                  <p className="font-semibold text-green-600">
                                    {formatCurrency(liquidation.totalAmount)}
                                  </p>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleDownloadPdf(liquidation.id)
                                  }}
                                  className="p-2 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                                  title={t('settlements.actions.downloadPdf')}
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                {liquidation.status !== 'PAID' && liquidation.status !== 'CANCELLED' && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      handleMarkPaid(liquidation.id)
                                    }}
                                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title={t('settlements.actions.markAsPaid')}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                )}
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`px-3 py-1 rounded ${
                    page === pagination.page
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      <DashboardFooter />
    </div>
  )
}
