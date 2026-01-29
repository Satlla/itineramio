'use client'

import React, { useState, useEffect } from 'react'
import {
  CreditCard,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Ban,
  Gift,
  RotateCcw,
  Eye,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react'

interface Subscription {
  id: string
  userId: string
  planId: string
  status: string
  startDate: string
  endDate: string
  cancelAtPeriodEnd: boolean
  canceledAt?: string
  cancelReason?: string
  stripeSubscriptionId?: string
  notes?: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    companyName?: string
    status: string
  }
  plan?: {
    id: string
    name: string
    code: string
    priceMonthly: number
  }
}

interface Metrics {
  total: number
  active: number
  canceling: number
  expired: number
  mrr: number
}

const StatusBadge = ({ status, cancelAtPeriodEnd }: { status: string; cancelAtPeriodEnd?: boolean }) => {
  const normalizedStatus = status?.toUpperCase() || 'UNKNOWN'

  if (normalizedStatus === 'ACTIVE' && cancelAtPeriodEnd) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
        <Clock className="w-3 h-3 mr-1" />
        Cancelará
      </span>
    )
  }

  const styles: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    CANCELED: 'bg-red-100 text-red-800',
    PAST_DUE: 'bg-yellow-100 text-yellow-800',
    UNPAID: 'bg-red-100 text-red-800',
    EXPIRED: 'bg-gray-100 text-gray-800'
  }

  const icons: Record<string, React.ReactNode> = {
    ACTIVE: <CheckCircle className="w-3 h-3 mr-1" />,
    CANCELED: <XCircle className="w-3 h-3 mr-1" />,
    PAST_DUE: <AlertCircle className="w-3 h-3 mr-1" />,
    UNPAID: <Ban className="w-3 h-3 mr-1" />,
    EXPIRED: <Clock className="w-3 h-3 mr-1" />
  }

  const labels: Record<string, string> = {
    ACTIVE: 'Activa',
    CANCELED: 'Cancelada',
    PAST_DUE: 'Impago',
    UNPAID: 'Sin pagar',
    EXPIRED: 'Expirada'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[normalizedStatus] || 'bg-gray-100 text-gray-800'}`}>
      {icons[normalizedStatus] || <Clock className="w-3 h-3 mr-1" />}
      {labels[normalizedStatus] || status}
    </span>
  )
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Modal states
  const [showRefundModal, setShowRefundModal] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null)
  const [showExtendModal, setShowExtendModal] = useState<string | null>(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [extendDays, setExtendDays] = useState('30')
  const [extendReason, setExtendReason] = useState('')

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/subscriptions')
      const data = await response.json()
      if (data.success) {
        setSubscriptions(data.subscriptions)
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefund = async (id: string) => {
    setActionLoading(id)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/subscriptions/${id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: refundAmount ? parseFloat(refundAmount) : undefined,
          reason: 'requested_by_customer'
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        fetchSubscriptions()
        setShowRefundModal(null)
        setRefundAmount('')
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al procesar reembolso' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (id: string, immediate: boolean) => {
    setActionLoading(id)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/subscriptions/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: cancelReason || 'Cancelación por admin',
          immediate
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        fetchSubscriptions()
        setShowCancelModal(null)
        setCancelReason('')
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al cancelar suscripción' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleExtend = async (id: string) => {
    setActionLoading(id)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/subscriptions/${id}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          days: parseInt(extendDays) || 30,
          reason: extendReason || 'Cortesía admin'
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        fetchSubscriptions()
        setShowExtendModal(null)
        setExtendDays('30')
        setExtendReason('')
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al extender suscripción' })
    } finally {
      setActionLoading(null)
    }
  }

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch =
      searchTerm === '' ||
      sub.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.stripeSubscriptionId?.toLowerCase().includes(searchTerm.toLowerCase())

    const now = new Date()
    const isExpired = new Date(sub.endDate) < now

    let matchesStatus = statusFilter === 'all'
    if (statusFilter === 'active') matchesStatus = sub.status === 'ACTIVE' && !sub.cancelAtPeriodEnd && !isExpired
    if (statusFilter === 'canceling') matchesStatus = sub.status === 'ACTIVE' && sub.cancelAtPeriodEnd
    if (statusFilter === 'canceled') matchesStatus = sub.status === 'CANCELED' || isExpired

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
            <CreditCard className="h-6 w-6 lg:h-7 lg:w-7 mr-2 text-red-600" />
            Suscripciones
          </h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">
            Gestiona suscripciones, reembolsos y extensiones
          </p>
        </div>

        <button
          onClick={fetchSubscriptions}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-green-50 text-green-900 border-green-200'
            : 'bg-red-50 text-red-900 border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.total}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-green-600">{metrics.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancelando</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.canceling}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expiradas</p>
                <p className="text-2xl font-bold text-red-600">{metrics.expired}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">MRR</p>
                <p className="text-2xl font-bold text-blue-600">€{metrics.mrr.toFixed(0)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o ID de Stripe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          >
            <option value="all">Todas</option>
            <option value="active">Activas</option>
            <option value="canceling">Cancelando</option>
            <option value="canceled">Canceladas/Expiradas</option>
          </select>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="space-y-4">
        {filteredSubscriptions.map((subscription) => {
          const isExpanded = expandedId === subscription.id
          const now = new Date()
          const endDate = new Date(subscription.endDate)
          const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

          return (
            <div key={subscription.id} className="bg-white rounded-lg border overflow-hidden">
              {/* Main Row */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(isExpanded ? null : subscription.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{subscription.user.name}</h3>
                      <p className="text-sm text-gray-500">{subscription.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right hidden sm:block">
                      <p className="font-medium text-gray-900">{subscription.plan?.name || 'Sin plan'}</p>
                      <p className="text-sm text-gray-500">
                        €{subscription.plan?.priceMonthly || 0}/mes
                      </p>
                    </div>

                    <StatusBadge status={subscription.status} cancelAtPeriodEnd={subscription.cancelAtPeriodEnd} />

                    <div className="text-right hidden md:block">
                      <p className="text-sm text-gray-500">Expira</p>
                      <p className={`font-medium ${daysRemaining < 7 ? 'text-red-600' : 'text-gray-900'}`}>
                        {endDate.toLocaleDateString('es-ES')}
                      </p>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t bg-gray-50 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">ID Suscripción</p>
                      <p className="font-mono text-xs text-gray-900">{subscription.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Stripe ID</p>
                      {subscription.stripeSubscriptionId ? (
                        <a
                          href={`https://dashboard.stripe.com/subscriptions/${subscription.stripeSubscriptionId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-blue-600 hover:underline flex items-center"
                        >
                          {subscription.stripeSubscriptionId.substring(0, 20)}...
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      ) : (
                        <p className="text-sm text-gray-500">Sin Stripe</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Días restantes</p>
                      <p className={`font-medium ${daysRemaining < 0 ? 'text-red-600' : daysRemaining < 7 ? 'text-orange-600' : 'text-green-600'}`}>
                        {daysRemaining < 0 ? `Expirado hace ${Math.abs(daysRemaining)} días` : `${daysRemaining} días`}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Inicio</p>
                      <p className="font-medium">{new Date(subscription.startDate).toLocaleDateString('es-ES')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fin</p>
                      <p className="font-medium">{endDate.toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>

                  {subscription.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Notas</p>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap bg-white p-2 rounded border">
                        {subscription.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {/* Extend Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowExtendModal(subscription.id)
                      }}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Gift className="w-4 h-4 mr-1" />
                      Extender
                    </button>

                    {/* Cancel Button */}
                    {subscription.status === 'ACTIVE' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowCancelModal(subscription.id)
                        }}
                        className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Cancelar
                      </button>
                    )}

                    {/* Refund Button */}
                    {subscription.stripeSubscriptionId && subscription.status === 'ACTIVE' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowRefundModal(subscription.id)
                        }}
                        className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Reembolsar
                      </button>
                    )}

                    {/* View in Stripe */}
                    {subscription.stripeSubscriptionId && (
                      <a
                        href={`https://dashboard.stripe.com/subscriptions/${subscription.stripeSubscriptionId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Ver en Stripe
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filteredSubscriptions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron suscripciones</h3>
            <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Procesar Reembolso</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad a reembolsar (€)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Dejar vacío para reembolso completo"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Si dejas vacío, se reembolsará el importe completo de la última factura
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Atención:</strong> El reembolso cancelará la suscripción automáticamente.
                Stripe NO devuelve las comisiones de transacción.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRefundModal(null)
                  setRefundAmount('')
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRefund(showRefundModal)}
                disabled={actionLoading === showRefundModal}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === showRefundModal ? 'Procesando...' : 'Confirmar Reembolso'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cancelar Suscripción</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo de cancelación
              </label>
              <input
                type="text"
                placeholder="Ej: Solicitud del cliente"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(null)
                  setCancelReason('')
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Volver
              </button>
              <button
                onClick={() => handleCancel(showCancelModal, false)}
                disabled={actionLoading === showCancelModal}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                Al final del período
              </button>
              <button
                onClick={() => handleCancel(showCancelModal, true)}
                disabled={actionLoading === showCancelModal}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Inmediatamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Extender Suscripción</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Días a extender
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo (opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: Compensación por incidencia"
                value={extendReason}
                onChange={(e) => setExtendReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                Esto extenderá la fecha de finalización sin generar ningún cargo.
                Si la suscripción estaba cancelada, se reactivará.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowExtendModal(null)
                  setExtendDays('30')
                  setExtendReason('')
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleExtend(showExtendModal)}
                disabled={actionLoading === showExtendModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading === showExtendModal ? 'Procesando...' : 'Extender'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
