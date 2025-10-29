'use client'

import React, { useState, useEffect } from 'react'
import { 
  Clock,
  CheckCircle,
  XCircle,
  Euro,
  User,
  Calendar,
  CreditCard,
  Smartphone,
  Building,
  Eye,
  Check,
  X,
  AlertCircle,
  Download,
  FileText
} from 'lucide-react'
import { Button } from '../../../src/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/Card'

interface PaymentRequest {
  id: string
  invoiceNumber: string
  user: {
    id: string
    name: string
    email: string
    phone?: string
  }
  amount: number
  discountAmount: number
  finalAmount: number
  status: string
  paymentMethod: string
  paymentReference?: string
  dueDate: string
  paidDate?: string
  createdAt: string
  notes?: string
  properties?: Array<{
    id: string
    name: string
  }>
}

interface PaymentStats {
  pending: number
  paid: number
  overdue: number
  totalAmount: number
  thisMonth: number
}

export default function PaymentsAdminPage() {
  const [payments, setPayments] = useState<PaymentRequest[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    pending: 0,
    paid: 0,
    overdue: 0,
    totalAmount: 0,
    thisMonth: 0
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'OVERDUE'>('PENDING')
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/payments')
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const confirmPayment = async (invoiceId: string, paymentReference?: string) => {
    try {
      setProcessingPayment(invoiceId)
      
      const response = await fetch(`/api/admin/payments/${invoiceId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          paymentReference: paymentReference || 'Manual confirmation',
          confirmedAt: new Date().toISOString()
        })
      })
      
      if (response.ok) {
        // Refresh payments list
        await fetchPayments()
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      alert('Error al confirmar el pago')
    } finally {
      setProcessingPayment(null)
    }
  }

  const rejectPayment = async (invoiceId: string, reason: string) => {
    try {
      setProcessingPayment(invoiceId)
      
      const response = await fetch(`/api/admin/payments/${invoiceId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      
      if (response.ok) {
        await fetchPayments()
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      alert('Error al rechazar el pago')
    } finally {
      setProcessingPayment(null)
    }
  }

  const downloadInvoice = (invoiceId: string) => {
    const url = `/api/invoices/${invoiceId}/download`
    window.open(url, '_blank')
  }

  const filteredPayments = payments.filter(payment => {
    if (filter === 'ALL') return true
    if (filter === 'PENDING') return payment.status === 'PENDING'
    if (filter === 'PAID') return payment.status === 'PAID'
    if (filter === 'OVERDUE') {
      return payment.status === 'PENDING' && new Date(payment.dueDate) < new Date()
    }
    return true
  })

  const getPaymentMethodIcon = (method: string) => {
    return method === 'BIZUM' ? <Smartphone className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />
  }

  const getStatusColor = (payment: PaymentRequest) => {
    if (payment.status === 'PAID') return 'text-green-600 bg-green-50 border-green-200'
    if (payment.status === 'REJECTED') return 'text-red-600 bg-red-50 border-red-200'
    if (payment.status === 'PENDING' && new Date(payment.dueDate) < new Date()) {
      return 'text-orange-600 bg-orange-50 border-orange-200'
    }
    return 'text-blue-600 bg-blue-50 border-blue-200'
  }

  const getStatusText = (payment: PaymentRequest) => {
    if (payment.status === 'PAID') return 'Pagado'
    if (payment.status === 'REJECTED') return 'Rechazado'
    if (payment.status === 'PENDING' && new Date(payment.dueDate) < new Date()) {
      return 'Vencido'
    }
    return 'Pendiente'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Gestión de Pagos</h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1 sm:mt-2">
            Confirma pagos recibidos y gestiona solicitudes pendientes
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center">
              <Clock className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600 mr-2 sm:mr-3" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{stats.pending}</h3>
                <p className="text-xs sm:text-sm text-gray-600">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-600 mr-2 sm:mr-3" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{stats.paid}</h3>
                <p className="text-xs sm:text-sm text-gray-600">Pagados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-orange-600 mr-2 sm:mr-3" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{stats.overdue}</h3>
                <p className="text-xs sm:text-sm text-gray-600">Vencidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center">
              <Euro className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-purple-600 mr-2 sm:mr-3" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">€{Number(stats.totalAmount).toFixed(2)}</h3>
                <p className="text-xs sm:text-sm text-gray-600">Total pendiente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-600 mr-2 sm:mr-3" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">€{Number(stats.thisMonth).toFixed(2)}</h3>
                <p className="text-xs sm:text-sm text-gray-600">Este mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
        {[
          { key: 'ALL', label: 'Todos' },
          { key: 'PENDING', label: 'Pendientes' },
          { key: 'PAID', label: 'Pagados' },
          { key: 'OVERDUE', label: 'Vencidos' }
        ].map((filterOption) => (
          <Button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key as any)}
            variant={filter === filterOption.key ? 'default' : 'outline'}
            size="sm"
            className="text-xs sm:text-sm"
          >
            {filterOption.label}
          </Button>
        ))}
      </div>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Solicitudes de Pago ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Euro className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                No hay solicitudes de pago
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {filter === 'PENDING' ? 'No hay pagos pendientes' : 'No se encontraron pagos con este filtro'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className={`border rounded-lg p-3 sm:p-4 ${getStatusColor(payment)}`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                        <span className="font-mono text-xs sm:text-sm bg-white px-2 py-1 rounded">
                          {payment.invoiceNumber}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment)}`}>
                          {getStatusText(payment)}
                        </span>
                        <div className="flex items-center text-xs sm:text-sm text-gray-600">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                          <span className="ml-1">{payment.paymentMethod}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-2 sm:mb-3">
                        <div>
                          <div className="flex items-center text-xs sm:text-sm text-gray-700 mb-1">
                            <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="font-medium">{payment.user.name}</span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 ml-4 sm:ml-6">
                            {payment.user.email}
                          </div>
                          {payment.user.phone && (
                            <div className="text-xs sm:text-sm text-gray-600 ml-4 sm:ml-6">
                              {payment.user.phone}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-600">Importe original:</span>
                            <span>€{Number(payment.amount).toFixed(2)}</span>
                          </div>
                          {payment.discountAmount > 0 && (
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-600">Descuento:</span>
                              <span className="text-red-600">-€{Number(payment.discountAmount).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs sm:text-sm font-semibold">
                            <span>Total a pagar:</span>
                            <span>€{Number(payment.finalAmount).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {payment.properties && payment.properties.length > 0 && (
                        <div className="mb-2 sm:mb-3">
                          <div className="text-xs sm:text-sm text-gray-600 mb-1">Propiedades:</div>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {payment.properties.map((property) => (
                              <span
                                key={property.id}
                                className="inline-flex items-center px-2 py-1 bg-white rounded text-xs"
                              >
                                <Building className="h-3 w-3 mr-1" />
                                {property.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Creado:</span> {new Date(payment.createdAt).toLocaleDateString('es-ES')}
                        </div>
                        <div>
                          <span className="font-medium">Vence:</span> {new Date(payment.dueDate).toLocaleDateString('es-ES')}
                        </div>
                        {payment.paidDate && (
                          <div className="md:col-span-2">
                            <span className="font-medium">Pagado:</span> {new Date(payment.paidDate).toLocaleDateString('es-ES')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 w-full lg:w-auto">
                      {payment.status === 'PENDING' && (
                        <>
                          <Button
                            onClick={() => confirmPayment(payment.id, payment.paymentReference)}
                            disabled={processingPayment === payment.id}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 flex-1 lg:flex-none text-xs sm:text-sm"
                          >
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden sm:inline">Confirmar</span>
                            <span className="sm:hidden">OK</span>
                          </Button>

                          <Button
                            onClick={() => {
                              const reason = prompt('Motivo del rechazo:')
                              if (reason) rejectPayment(payment.id, reason)
                            }}
                            disabled={processingPayment === payment.id}
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50 flex-1 lg:flex-none text-xs sm:text-sm"
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden sm:inline">Rechazar</span>
                            <span className="sm:hidden">No</span>
                          </Button>
                        </>
                      )}

                      <Button
                        onClick={() => downloadInvoice(payment.id)}
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        title="Descargar factura"
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}