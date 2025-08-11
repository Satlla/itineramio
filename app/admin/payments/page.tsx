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
  AlertCircle
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pagos</h1>
          <p className="text-gray-600 mt-2">
            Confirma pagos recibidos y gestiona solicitudes pendientes
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">{stats.pending}</h3>
                <p className="text-sm text-gray-600">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">{stats.paid}</h3>
                <p className="text-sm text-gray-600">Pagados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">{stats.overdue}</h3>
                <p className="text-sm text-gray-600">Vencidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Euro className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">€{stats.totalAmount.toFixed(2)}</h3>
                <p className="text-sm text-gray-600">Total pendiente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">€{stats.thisMonth.toFixed(2)}</h3>
                <p className="text-sm text-gray-600">Este mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6">
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
          >
            {filterOption.label}
          </Button>
        ))}
      </div>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Pago ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <Euro className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay solicitudes de pago
              </h3>
              <p className="text-gray-600">
                {filter === 'PENDING' ? 'No hay pagos pendientes' : 'No se encontraron pagos con este filtro'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className={`border rounded-lg p-4 ${getStatusColor(payment)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-mono text-sm bg-white px-2 py-1 rounded">
                          {payment.invoiceNumber}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment)}`}>
                          {getStatusText(payment)}
                        </span>
                        <div className="flex items-center text-sm text-gray-600">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                          <span className="ml-1">{payment.paymentMethod}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="flex items-center text-sm text-gray-700 mb-1">
                            <User className="w-4 h-4 mr-2" />
                            <span className="font-medium">{payment.user.name}</span>
                          </div>
                          <div className="text-sm text-gray-600 ml-6">
                            {payment.user.email}
                          </div>
                          {payment.user.phone && (
                            <div className="text-sm text-gray-600 ml-6">
                              {payment.user.phone}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Importe original:</span>
                            <span>€{payment.amount.toFixed(2)}</span>
                          </div>
                          {payment.discountAmount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Descuento:</span>
                              <span className="text-red-600">-€{payment.discountAmount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm font-semibold">
                            <span>Total a pagar:</span>
                            <span>€{payment.finalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {payment.properties && payment.properties.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm text-gray-600 mb-1">Propiedades:</div>
                          <div className="flex flex-wrap gap-2">
                            {payment.properties.map((property) => (
                              <span
                                key={property.id}
                                className="inline-flex items-center px-2 py-1 bg-white rounded text-xs"
                              >
                                <Building className="w-3 h-3 mr-1" />
                                {property.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
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
                    
                    {payment.status === 'PENDING' && (
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          onClick={() => confirmPayment(payment.id, payment.paymentReference)}
                          disabled={processingPayment === payment.id}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Confirmar Pago
                        </Button>
                        
                        <Button
                          onClick={() => {
                            const reason = prompt('Motivo del rechazo:')
                            if (reason) rejectPayment(payment.id, reason)
                          }}
                          disabled={processingPayment === payment.id}
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    )}
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