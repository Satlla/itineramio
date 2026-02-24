'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Receipt,
  User,
  Calendar,
  Download,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  Euro,
  Home,
  Loader2,
  Trash2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import { AnimatedLoadingSpinner } from '@/components/ui/AnimatedLoadingSpinner'
import { formatCurrency } from '@/lib/format'
import { useTranslation } from 'react-i18next'

interface Reservation {
  id: string
  confirmationCode: string
  guestName: string
  checkIn: string
  checkOut: string
  nights: number
  platform: string
  hostEarnings: number
  pricePerNight: number
  commissionRate: number
  commissionType: string
  commissionAmount: number
  commissionVatRate: number
  commissionVatAmount: number
  cleaningAmount: number
  netToOwner: number
  property: string
}

interface Expense {
  id: string
  date: string
  concept: string
  category: string
  amount: number
  vatAmount: number
  property: string
}

interface Owner {
  id: string
  type: string
  name: string
  nif?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  iban?: string
}

interface Totals {
  totalIncome: number
  totalCommission: number
  totalCommissionVat: number
  totalCleaning: number
  totalExpenses: number
  totalAmount: number
  totalRetention: number
}

interface Stats {
  daysInMonth: number
  totalNights: number
  occupancyRate: number
  commissionType: string
  commissionValue: number
  commissionVatRate: number
  cleaningType: string
  cleaningValue: number
  ownerType: string
  retentionRate: number
}

interface Liquidation {
  id: string
  year: number
  month: number
  status: 'DRAFT' | 'SENT' | 'CANCELLED'
  owner: Owner
  totals: Totals
  stats: Stats
  invoiceId?: string
  invoiceNumber?: string
  invoiceDate?: string
  notes?: string
  pdfUrl?: string
  createdAt: string
  updatedAt: string
  reservations: Reservation[]
  expenses: Expense[]
}

const STATUS_CONFIG = {
  DRAFT: { key: 'status.draft', color: 'bg-gray-100 text-gray-700', icon: Clock },
  SENT: { key: 'status.sent', color: 'bg-violet-100 text-violet-700', icon: Send },
  CANCELLED: { key: 'status.cancelled', color: 'bg-red-100 text-red-700', icon: XCircle }
}

export default function LiquidacionDetailPage() {
  const { t } = useTranslation('gestion')
  const params = useParams()
  const router = useRouter()

  const MONTHS = [
    t('common.months.january'), t('common.months.february'), t('common.months.march'),
    t('common.months.april'), t('common.months.may'), t('common.months.june'),
    t('common.months.july'), t('common.months.august'), t('common.months.september'),
    t('common.months.october'), t('common.months.november'), t('common.months.december')
  ]

  const EXPENSE_CATEGORIES: Record<string, string> = {
    MAINTENANCE: t('expenses.categories.MAINTENANCE'),
    SUPPLIES: t('expenses.categories.SUPPLIES'),
    REPAIR: t('expenses.categories.REPAIR'),
    CLEANING: t('expenses.categories.CLEANING'),
    FURNITURE: t('expenses.categories.FURNITURE'),
    TAXES: t('expenses.categories.TAXES'),
    INSURANCE: t('expenses.categories.INSURANCE'),
    OTHER: t('expenses.categories.OTHER')
  }
  const [loading, setLoading] = useState(true)
  const [liquidation, setLiquidation] = useState<Liquidation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [creatingInvoice, setCreatingInvoice] = useState(false)
  const [sendingLink, setSendingLink] = useState(false)
  const [linkSent, setLinkSent] = useState<{ type: 'email' | 'whatsapp', url?: string } | null>(null)
  const [recalculating, setRecalculating] = useState(false)
  const [showOwnerInfo, setShowOwnerInfo] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchLiquidation()
    }
  }, [params.id])

  const fetchLiquidation = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gestion/liquidations/${params.id}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setLiquidation(data.liquidation)
      } else {
        setError('Liquidación no encontrada')
      }
    } catch (error) {
      console.error('Error fetching liquidation:', error)
      setError('Error al cargar la liquidación')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = () => {
    window.open(`/api/gestion/liquidations/${params.id}/pdf`, '_blank')
  }

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setUpdating(true)
      const response = await fetch(`/api/gestion/liquidations/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchLiquidation()
      } else {
        const data = await response.json()
        setError(data.error || 'Error al actualizar')
      }
    } catch (error) {
      console.error('Error updating liquidation:', error)
      setError('Error al actualizar la liquidación')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      const response = await fetch(`/api/gestion/liquidations/${params.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        router.push('/gestion/liquidaciones')
      } else {
        const data = await response.json()
        setError(data.error || 'Error al eliminar')
      }
    } catch (error) {
      console.error('Error deleting liquidation:', error)
      setError('Error al eliminar la liquidación')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleRecalculate = async () => {
    try {
      setRecalculating(true)
      const response = await fetch(`/api/gestion/liquidations/${params.id}/recalculate`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        await fetchLiquidation()
      } else {
        const data = await response.json()
        setError(data.error || 'Error al recalcular')
      }
    } catch (error) {
      console.error('Error recalculating:', error)
      setError('Error al recalcular la liquidación')
    } finally {
      setRecalculating(false)
    }
  }

  const handleCreateInvoice = async () => {
    try {
      setCreatingInvoice(true)
      const response = await fetch(`/api/gestion/liquidations/${params.id}/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/gestion/facturas/${data.invoice.id}`)
      } else {
        const data = await response.json()
        setError(data.error || 'Error al crear factura')
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      setError('Error al crear la factura')
    } finally {
      setCreatingInvoice(false)
    }
  }

  const handleSendToOwner = async (method: 'email' | 'whatsapp') => {
    if (!liquidation) return

    try {
      setSendingLink(true)
      setLinkSent(null)

      const response = await fetch(`/api/gestion/owners/${liquidation.owner.id}/send-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          month: liquidation.month,
          year: liquidation.year,
          sendEmail: method === 'email'
        })
      })

      if (response.ok) {
        const data = await response.json()

        if (method === 'whatsapp') {
          const phone = liquidation.owner.phone?.replace(/\D/g, '') || ''
          const message = encodeURIComponent(
            `Hola ${liquidation.owner.name.split(' ')[0]}, aquí tienes el resumen de ${MONTHS[liquidation.month - 1]} ${liquidation.year}:\n\n${data.portalUrl}`
          )
          const whatsappUrl = phone
            ? `https://wa.me/${phone.startsWith('34') ? phone : '34' + phone}?text=${message}`
            : `https://wa.me/?text=${message}`
          window.open(whatsappUrl, '_blank')
          setLinkSent({ type: 'whatsapp', url: data.portalUrl })
        } else {
          setLinkSent({ type: 'email' })
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Error al enviar')
      }
    } catch (error) {
      console.error('Error sending link:', error)
      setError('Error al enviar el enlace')
    } finally {
      setSendingLink(false)
    }
  }

  // Group reservations by property
  const reservationsByProperty = useMemo(() => {
    if (!liquidation) return []
    const grouped = new Map<string, Reservation[]>()
    for (const res of liquidation.reservations) {
      const existing = grouped.get(res.property) || []
      grouped.set(res.property, [...existing, res])
    }
    const daysInMonth = liquidation.stats.daysInMonth
    return Array.from(grouped.entries()).map(([property, reservations]) => {
      const totalNights = reservations.reduce((sum, r) => sum + r.nights, 0)
      const subtotalIncome = reservations.reduce((sum, r) => sum + r.hostEarnings, 0)
      const subtotalCleaning = reservations.reduce((sum, r) => sum + r.cleaningAmount, 0)
      return {
        property,
        reservations,
        totalNights,
        occupancyRate: Math.min(Math.round((totalNights / daysInMonth) * 100), 100),
        subtotalIncome,
        subtotalCleaning,
        subtotalNetPrice: subtotalIncome - subtotalCleaning,
        subtotalCommission: reservations.reduce((sum, r) => sum + r.commissionAmount, 0),
        subtotalCommissionVat: reservations.reduce((sum, r) => sum + r.commissionVatAmount, 0),
        subtotalNet: reservations.reduce((sum, r) => sum + r.netToOwner, 0),
      }
    })
  }, [liquidation])

  // Group expenses by property
  const expensesByProperty = useMemo(() => {
    if (!liquidation) return []
    const grouped = new Map<string, Expense[]>()
    for (const exp of liquidation.expenses) {
      const existing = grouped.get(exp.property) || []
      grouped.set(exp.property, [...existing, exp])
    }
    return Array.from(grouped.entries()).map(([property, expenses]) => ({
      property,
      expenses,
      subtotal: expenses.reduce((sum, e) => sum + e.amount + e.vatAmount, 0)
    }))
  }, [liquidation])

  // Expenses breakdown for summary
  const expensesTotals = useMemo(() => {
    if (!liquidation) return { base: 0, vat: 0 }
    return {
      base: liquidation.expenses.reduce((sum, e) => sum + e.amount, 0),
      vat: liquidation.expenses.reduce((sum, e) => sum + e.vatAmount, 0),
    }
  }, [liquidation])

  if (loading) {
    return <AnimatedLoadingSpinner text={t('settlementDetail.loading')} type="general" />
  }

  if (error || !liquidation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {error || t('settlementDetail.notFound')}
            </p>
            <Link href="/gestion/liquidaciones">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('settlementDetail.backToSettlements')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const StatusIcon = STATUS_CONFIG[liquidation.status]?.icon || Clock
  const isLocked = !!liquidation.invoiceId // Locked when invoice exists
  const canEdit = liquidation.status === 'DRAFT' && !isLocked
  const canDelete = ['DRAFT', 'CANCELLED'].includes(liquidation.status) && !isLocked
  const canSend = liquidation.status === 'DRAFT' && !isLocked
  const stats = liquidation.stats
  const hasMultipleProperties = reservationsByProperty.length > 1

  // Cleaning detail string for breakdown
  const cleaningDetailStr = stats.cleaningType === 'PER_NIGHT'
    ? t('settlementDetail.breakdown.cleaningPerNight', { value: stats.cleaningValue, nights: stats.totalNights })
    : t('settlementDetail.breakdown.cleaningPerReservation', { value: stats.cleaningValue, count: liquidation.reservations.length })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/gestion/liquidaciones"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t('settlementDetail.backToSettlements')}
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Receipt className="h-7 w-7 text-violet-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('settlementDetail.settlementTitle', { month: MONTHS[liquidation.month - 1], year: liquidation.year })}
                </h1>
                <p className="text-sm text-gray-600">
                  {liquidation.owner.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={STATUS_CONFIG[liquidation.status].color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {t(`settlements.${STATUS_CONFIG[liquidation.status].key}`)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Success - Link Sent */}
        {linkSent && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <p className="text-green-700">
              {linkSent.type === 'email'
                ? t('settlementDetail.linkSent.email', { email: liquidation.owner.email })
                : t('settlementDetail.linkSent.whatsapp')}
            </p>
            <button onClick={() => setLinkSent(null)} className="ml-auto text-green-500 hover:text-green-700">
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Occupancy */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-gray-500 uppercase">{t('settlementDetail.kpi.occupancy')}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(stats.occupancyRate, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('settlementDetail.kpi.occupancyDetail', { totalNights: stats.totalNights, daysInMonth: stats.daysInMonth })}
              </p>
            </CardContent>
          </Card>

          {/* Gross Income */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Euro className="w-4 h-4 text-violet-600" />
                <span className="text-xs font-medium text-gray-500 uppercase">{t('settlementDetail.kpi.grossIncome')}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(liquidation.totals.totalIncome)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {liquidation.reservations.length} {t('settlements.card.reservations')}
              </p>
            </CardContent>
          </Card>

          {/* Commission */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-medium text-gray-500 uppercase">{t('settlementDetail.kpi.commission')}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(liquidation.totals.totalCommission + liquidation.totals.totalCommissionVat)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.commissionType === 'PERCENTAGE'
                  ? t('settlementDetail.kpi.commissionDetail', { rate: stats.commissionValue, vatRate: stats.commissionVatRate })
                  : t('settlementDetail.kpi.commissionFixed', { vatRate: stats.commissionVatRate })}
              </p>
            </CardContent>
          </Card>

          {/* Net to Owner */}
          <Card className="border-2 border-green-200 bg-green-50/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-gray-500 uppercase">{t('settlementDetail.kpi.netOwner')}</span>
              </div>
              <div className="text-2xl font-bold text-green-700">{formatCurrency(liquidation.totals.totalAmount)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {t('settlementDetail.summary.netToTransfer')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={handleDownloadPdf}
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>

              <Button
                variant="outline"
                onClick={() => window.open(`/api/gestion/liquidations/${params.id}/excel`, '_blank')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Excel
              </Button>

              <Button
                variant="outline"
                onClick={() => handleSendToOwner('email')}
                disabled={sendingLink}
                className="border-violet-200 text-violet-700 hover:bg-violet-50"
              >
                {sendingLink ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {t('settlementDetail.actions.sendByEmail')}
              </Button>

              <Button
                variant="outline"
                onClick={() => handleSendToOwner('whatsapp')}
                disabled={sendingLink}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                {sendingLink ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                )}
                {t('settlementDetail.actions.whatsapp')}
              </Button>

              {liquidation.invoiceId && (
                <Link href={`/gestion/facturas/${liquidation.invoiceId}`}>
                  <Button
                    variant="outline"
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {t('settlementDetail.actions.viewInvoice')}
                  </Button>
                </Link>
              )}

              {liquidation.status === 'DRAFT' && !isLocked && (
                <Button
                  variant="outline"
                  onClick={handleRecalculate}
                  disabled={recalculating}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  {recalculating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  {recalculating ? t('settlementDetail.actions.recalculating') : t('settlementDetail.actions.recalculate')}
                </Button>
              )}

              {canEdit && (
                <Button
                  variant="outline"
                  onClick={handleCreateInvoice}
                  disabled={creatingInvoice}
                >
                  {creatingInvoice ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  {t('settlementDetail.actions.issueInvoice')}
                </Button>
              )}

              <div className="flex-1" />

              {canDelete && (
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('settlementDetail.actions.delete')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Full-width content */}
        <div className="space-y-6">
          {/* Reservations Table - Excel style */}
          {liquidation.reservations.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-violet-600" />
                  {t('settlementDetail.reservations.title')} ({liquidation.reservations.length})
                </h3>

                {reservationsByProperty.map((group, groupIndex) => (
                  <div key={group.property} className={groupIndex > 0 ? 'mt-6 pt-6 border-t' : ''}>
                    <div className="flex items-center justify-between mb-3 bg-violet-50 p-3 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-violet-600" />
                          <span className="font-medium text-gray-900">{group.property}</span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700">
                          {group.reservations.length} {t('settlements.card.reservations')}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {group.totalNights} {t('common.nights')} • {group.occupancyRate}% {t('settlementDetail.kpi.occupancy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          {t('settlementDetail.breakdown.netPrice')}: <span className="font-semibold">{formatCurrency(group.subtotalNetPrice)}</span>
                        </span>
                        <span className="font-semibold text-green-700">
                          {t('settlementDetail.kpi.netOwner')}: {formatCurrency(group.subtotalNet)}
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b-2 border-gray-200">
                            <th className="text-left py-2.5 px-3 font-semibold text-gray-700 whitespace-nowrap">{t('settlementDetail.reservations.tableHeaders.platform')}</th>
                            <th className="text-left py-2.5 px-3 font-semibold text-gray-700 whitespace-nowrap">{t('settlementDetail.reservations.tableHeaders.guest')}</th>
                            <th className="text-left py-2.5 px-3 font-semibold text-gray-700 whitespace-nowrap">{t('settlementDetail.reservations.tableHeaders.checkIn')}</th>
                            <th className="text-left py-2.5 px-3 font-semibold text-gray-700 whitespace-nowrap">{t('settlementDetail.reservations.tableHeaders.checkOut')}</th>
                            <th className="text-center py-2.5 px-3 font-semibold text-gray-700 whitespace-nowrap">{t('settlementDetail.reservations.tableHeaders.nights')}</th>
                            <th className="text-right py-2.5 px-3 font-semibold text-gray-700 whitespace-nowrap">{t('settlementDetail.reservations.tableHeaders.income')}</th>
                            {liquidation.totals.totalCleaning > 0 && (
                              <th className="text-right py-2.5 px-3 font-semibold text-gray-700 whitespace-nowrap">{t('settlementDetail.reservations.tableHeaders.cleaning')}</th>
                            )}
                            <th className="text-right py-2.5 px-3 font-semibold text-gray-700 whitespace-nowrap bg-blue-50">{t('settlementDetail.breakdown.netPrice')}</th>
                            <th className="text-right py-2.5 px-3 font-semibold text-gray-700 whitespace-nowrap">{t('settlementDetail.reservations.tableHeaders.commission', { rate: stats.commissionValue })}%</th>
                            <th className="text-right py-2.5 px-3 font-semibold text-green-700 whitespace-nowrap bg-green-50">{t('settlementDetail.reservations.tableHeaders.netOwner')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.reservations.map((res, i) => {
                            const netPrice = res.hostEarnings - res.cleaningAmount
                            return (
                              <tr key={res.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors`}>
                                <td className="py-2 px-3">
                                  <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                                    res.platform === 'AIRBNB' ? 'bg-rose-100 text-rose-700' :
                                    res.platform === 'BOOKING' ? 'bg-blue-100 text-blue-700' :
                                    res.platform === 'VRBO' ? 'bg-purple-100 text-purple-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {res.platform}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-gray-900 whitespace-nowrap">{res.guestName}</td>
                                <td className="py-2 px-3 text-gray-600 whitespace-nowrap">
                                  {new Date(res.checkIn).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                </td>
                                <td className="py-2 px-3 text-gray-600 whitespace-nowrap">
                                  {new Date(res.checkOut).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                </td>
                                <td className="py-2 px-3 text-center text-gray-600">{res.nights}</td>
                                <td className="py-2 px-3 text-right font-medium tabular-nums">{formatCurrency(res.hostEarnings)}</td>
                                {liquidation.totals.totalCleaning > 0 && (
                                  <td className="py-2 px-3 text-right text-red-600 tabular-nums">-{formatCurrency(res.cleaningAmount)}</td>
                                )}
                                <td className="py-2 px-3 text-right font-medium tabular-nums bg-blue-50/50">{formatCurrency(netPrice)}</td>
                                <td className="py-2 px-3 text-right text-red-600 tabular-nums">-{formatCurrency(res.commissionAmount + res.commissionVatAmount)}</td>
                                <td className="py-2 px-3 text-right font-semibold text-green-700 tabular-nums bg-green-50/50">{formatCurrency(res.netToOwner)}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-100 border-t-2 border-gray-300 font-semibold">
                            <td colSpan={4} className="py-2.5 px-3 text-gray-700">
                              {t('settlementDetail.reservations.totals')} ({group.reservations.length} {t('settlements.card.reservations')})
                            </td>
                            <td className="py-2.5 px-3 text-center tabular-nums">{group.totalNights}</td>
                            <td className="py-2.5 px-3 text-right tabular-nums">{formatCurrency(group.subtotalIncome)}</td>
                            {liquidation.totals.totalCleaning > 0 && (
                              <td className="py-2.5 px-3 text-right text-red-600 tabular-nums">-{formatCurrency(group.subtotalCleaning)}</td>
                            )}
                            <td className="py-2.5 px-3 text-right tabular-nums bg-blue-50">{formatCurrency(group.subtotalNetPrice)}</td>
                            <td className="py-2.5 px-3 text-right text-red-600 tabular-nums">-{formatCurrency(group.subtotalCommission + group.subtotalCommissionVat)}</td>
                            <td className="py-2.5 px-3 text-right text-green-700 tabular-nums bg-green-50">{formatCurrency(group.subtotalNet)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Deductions Breakdown */}
          <Card className="border-2 border-violet-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Euro className="w-5 h-5 text-violet-600" />
                {t('settlementDetail.breakdown.title')}
              </h3>
              <div className="max-w-lg space-y-1 text-sm font-mono">
                {/* Gross income */}
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-700">{t('settlementDetail.breakdown.grossIncome')}:</span>
                  <span className="font-semibold tabular-nums">{formatCurrency(liquidation.totals.totalIncome)}</span>
                </div>

                {/* Commission */}
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-600">
                    {stats.commissionType === 'PERCENTAGE'
                      ? t('settlementDetail.breakdown.commissionPct', { rate: stats.commissionValue })
                      : t('settlementDetail.breakdown.commissionFixed')}:
                  </span>
                  <span className="text-red-600 tabular-nums">-{formatCurrency(liquidation.totals.totalCommission)}</span>
                </div>

                {/* VAT on commission */}
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-600">{t('settlementDetail.breakdown.vatCommission', { rate: stats.commissionVatRate })}:</span>
                  <span className="text-red-600 tabular-nums">-{formatCurrency(liquidation.totals.totalCommissionVat)}</span>
                </div>

                {/* Cleaning */}
                {liquidation.totals.totalCleaning > 0 && (
                  <div className="flex justify-between py-1.5">
                    <span className="text-gray-600">{t('settlementDetail.breakdown.cleaning', { detail: cleaningDetailStr })}:</span>
                    <span className="text-red-600 tabular-nums">-{formatCurrency(liquidation.totals.totalCleaning)}</span>
                  </div>
                )}

                {/* Expenses */}
                {liquidation.totals.totalExpenses > 0 && (
                  <>
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-600">{t('settlementDetail.breakdown.expenses')}:</span>
                      <span className="text-red-600 tabular-nums">-{formatCurrency(expensesTotals.base)}</span>
                    </div>
                    {expensesTotals.vat > 0 && (
                      <div className="flex justify-between py-1.5">
                        <span className="text-gray-600">{t('settlementDetail.breakdown.expensesVat')}:</span>
                        <span className="text-red-600 tabular-nums">-{formatCurrency(expensesTotals.vat)}</span>
                      </div>
                    )}
                  </>
                )}

                {/* Divider */}
                <div className="border-t-2 border-gray-300 my-2" />

                {/* Subtotal */}
                <div className="flex justify-between py-1.5">
                  <span className="font-semibold text-gray-800">{t('settlementDetail.breakdown.subtotalNet')}:</span>
                  <span className="font-semibold tabular-nums">{formatCurrency(liquidation.totals.totalAmount)}</span>
                </div>

                {/* Retention (informational) */}
                {stats.retentionRate > 0 && liquidation.totals.totalRetention > 0 && (
                  <div className="flex justify-between py-1.5 text-gray-400">
                    <span>
                      {t('settlementDetail.breakdown.retentionIrpf', { rate: stats.retentionRate })}
                      <span className="ml-2 text-xs italic">← {t('settlementDetail.breakdown.retentionInfo')}</span>
                    </span>
                    <span className="tabular-nums">{formatCurrency(liquidation.totals.totalRetention)}</span>
                  </div>
                )}

                {/* Total divider */}
                <div className="border-t-2 border-violet-300 my-2" />

                {/* Total to transfer */}
                <div className="flex justify-between py-2">
                  <span className="font-bold text-gray-900 text-base">{t('settlementDetail.breakdown.totalTransfer')}:</span>
                  <span className="font-bold text-green-700 text-lg tabular-nums">{formatCurrency(liquidation.totals.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Table - Excel style */}
          {expensesByProperty.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-violet-600" />
                  {t('settlementDetail.expenses.title')} ({liquidation.expenses.length})
                </h3>

                {expensesByProperty.map((group, groupIndex) => (
                  <div key={group.property} className={groupIndex > 0 ? 'mt-6 pt-6 border-t' : ''}>
                    {expensesByProperty.length > 1 && (
                      <div className="flex items-center justify-between mb-3 bg-gray-50 p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">{group.property}</span>
                        </div>
                        <span className="font-medium text-red-600">
                          {formatCurrency(group.subtotal)}
                        </span>
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b-2 border-gray-200">
                            <th className="text-left py-2.5 px-3 font-semibold text-gray-700">{t('settlementDetail.expenses.tableHeaders.date')}</th>
                            <th className="text-left py-2.5 px-3 font-semibold text-gray-700">{t('settlementDetail.expenses.tableHeaders.concept')}</th>
                            <th className="text-left py-2.5 px-3 font-semibold text-gray-700">{t('settlementDetail.expenses.tableHeaders.category')}</th>
                            <th className="text-right py-2.5 px-3 font-semibold text-gray-700">{t('settlementDetail.expenses.tableHeaders.base')}</th>
                            <th className="text-right py-2.5 px-3 font-semibold text-gray-700">{t('settlementDetail.expenses.tableHeaders.vat')}</th>
                            <th className="text-right py-2.5 px-3 font-semibold text-gray-700">{t('settlementDetail.expenses.tableHeaders.total')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.expenses.map((exp, i) => (
                            <tr key={exp.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors`}>
                              <td className="py-2 px-3 text-gray-600">
                                {new Date(exp.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                              </td>
                              <td className="py-2 px-3 text-gray-900">{exp.concept}</td>
                              <td className="py-2 px-3 text-gray-600">
                                {EXPENSE_CATEGORIES[exp.category] || exp.category}
                              </td>
                              <td className="py-2 px-3 text-right tabular-nums">{formatCurrency(exp.amount)}</td>
                              <td className="py-2 px-3 text-right tabular-nums">{formatCurrency(exp.vatAmount)}</td>
                              <td className="py-2 px-3 text-right font-medium tabular-nums">
                                {formatCurrency(exp.amount + exp.vatAmount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-100 border-t-2 border-gray-300 font-semibold">
                            <td colSpan={3} className="py-2.5 px-3 text-gray-700">{t('settlementDetail.reservations.totals')}</td>
                            <td className="py-2.5 px-3 text-right tabular-nums">{formatCurrency(group.expenses.reduce((s, e) => s + e.amount, 0))}</td>
                            <td className="py-2.5 px-3 text-right tabular-nums">{formatCurrency(group.expenses.reduce((s, e) => s + e.vatAmount, 0))}</td>
                            <td className="py-2.5 px-3 text-right tabular-nums">{formatCurrency(group.subtotal)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Collapsible Owner Info + Payment Info + Dates */}
          <Card>
            <CardContent className="p-0">
              <button
                onClick={() => setShowOwnerInfo(!showOwnerInfo)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-violet-600" />
                  {t('settlementDetail.owner.title')}: {liquidation.owner.name}
                </h3>
                {showOwnerInfo ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {showOwnerInfo && (
                <div className="px-4 pb-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    {/* Owner Details */}
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold text-gray-900 mb-2">{t('settlementDetail.owner.title')}</p>
                      <p className="text-gray-700">{liquidation.owner.name}</p>
                      {liquidation.owner.nif && (
                        <p className="text-gray-500">NIF: {liquidation.owner.nif}</p>
                      )}
                      {liquidation.owner.email && (
                        <p className="text-gray-500">{liquidation.owner.email}</p>
                      )}
                      {liquidation.owner.phone && (
                        <p className="text-gray-500">{liquidation.owner.phone}</p>
                      )}
                      {liquidation.owner.address && (
                        <p className="text-gray-500">{liquidation.owner.address}, {liquidation.owner.postalCode} {liquidation.owner.city}</p>
                      )}
                      {liquidation.owner.iban && (
                        <p className="text-gray-500 font-mono text-xs">
                          IBAN: {liquidation.owner.iban.replace(/(.{4})/g, '$1 ').trim()}
                        </p>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="space-y-2 text-sm text-gray-500">
                      <p className="font-semibold text-gray-900 mb-2">{t('settlementDetail.dates.created')}</p>
                      <p>
                        {t('settlementDetail.dates.created')}: {new Date(liquidation.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p>
                        {t('settlementDetail.dates.updated')}: {new Date(liquidation.updatedAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('settlementDetail.deleteModal.title')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('settlementDetail.deleteModal.description')}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('settlementDetail.deleteModal.deleting')}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('common.delete')}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  )
}
