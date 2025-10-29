'use client'

import React, { useState } from 'react'
import { 
  X, 
  FileText, 
  User, 
  Building2, 
  Calendar, 
  CreditCard,
  DollarSign,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Clock
} from 'lucide-react'

interface Invoice {
  id: string
  userId: string
  subscriptionId?: string
  invoiceNumber: string
  amount: number
  discountAmount: number
  finalAmount: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | string
  paymentMethod?: string
  paymentReference?: string
  dueDate: string
  paidDate?: string
  notes?: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    companyName?: string
  }
  subscription?: {
    plan: {
      name: string
    }
  }
}

interface InvoiceDetailModalProps {
  invoice: Invoice
  onClose: () => void
  onUpdate: () => void
}

export default function InvoiceDetailModal({ invoice, onClose, onUpdate }: InvoiceDetailModalProps) {
  const [loading, setLoading] = useState(false)
  const [editingPayment, setEditingPayment] = useState(false)
  const [paymentData, setPaymentData] = useState({
    paymentMethod: invoice.paymentMethod || 'transfer',
    paymentReference: invoice.paymentReference || '',
    paidDate: invoice.paidDate || new Date().toISOString().split('T')[0]
  })

  const getStatusIcon = () => {
    switch (invoice.status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusLabel = () => {
    switch (invoice.status) {
      case 'paid':
        return 'Pagada'
      case 'pending':
        return 'Pendiente'
      case 'overdue':
        return 'Vencida'
      case 'cancelled':
        return 'Cancelada'
    }
  }

  const getStatusColor = () => {
    switch (invoice.status) {
      case 'paid':
        return 'text-green-600'
      case 'pending':
        return 'text-yellow-600'
      case 'overdue':
        return 'text-red-600'
      case 'cancelled':
        return 'text-gray-600'
    }
  }

  const handleMarkAsPaid = async () => {
    if (!paymentData.paymentMethod) {
      alert('Por favor selecciona un método de pago')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/invoices/${invoice.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: paymentData.paymentMethod,
          paymentReference: paymentData.paymentReference,
          paidDate: paymentData.paidDate
        })
      })

      const data = await response.json()
      if (data.success) {
        onUpdate()
        setEditingPayment(false)
      } else {
        alert(data.error || 'Error al marcar como pagada')
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error)
      alert('Error al marcar como pagada')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelInvoice = async () => {
    if (!confirm('¿Estás seguro de cancelar esta factura?')) return

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/invoices/${invoice.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()
      if (data.success) {
        onUpdate()
      } else {
        alert(data.error || 'Error al cancelar la factura')
      }
    } catch (error) {
      console.error('Error cancelling invoice:', error)
      alert('Error al cancelar la factura')
    } finally {
      setLoading(false)
    }
  }

  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status === 'pending'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Factura {invoice.invoiceNumber}</h2>
              <div className="flex items-center mt-2 space-x-2">
                {getStatusIcon()}
                <span className={`font-medium ${getStatusColor()}`}>
                  {getStatusLabel()}
                </span>
                {isOverdue && (
                  <span className="text-sm text-red-600 ml-2">
                    (Vencida hace {Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))} días)
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Customer Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Cliente
              </h3>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">{invoice.user.name}</p>
                <p className="text-sm text-gray-600">{invoice.user.email}</p>
                {invoice.user.companyName && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Building2 className="w-3 h-3 mr-1" />
                    {invoice.user.companyName}
                  </p>
                )}
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Detalles
              </h3>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="text-gray-600">Fecha emisión:</span>{' '}
                  <span className="font-medium">{new Date(invoice.createdAt).toLocaleDateString('es-ES')}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Vencimiento:</span>{' '}
                  <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString('es-ES')}</span>
                </p>
                {invoice.subscription && (
                  <p className="text-sm">
                    <span className="text-gray-600">Plan:</span>{' '}
                    <span className="font-medium">{invoice.subscription.plan.name}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Pago
              </h3>
              <div className="space-y-1">
                {invoice.status === 'paid' ? (
                  <>
                    <p className="text-sm">
                      <span className="text-gray-600">Método:</span>{' '}
                      <span className="font-medium capitalize">{invoice.paymentMethod || 'No especificado'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Fecha pago:</span>{' '}
                      <span className="font-medium">
                        {invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString('es-ES') : 'No especificada'}
                      </span>
                    </p>
                    {invoice.paymentReference && (
                      <p className="text-sm">
                        <span className="text-gray-600">Referencia:</span>{' '}
                        <span className="font-medium">{invoice.paymentReference}</span>
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No pagada</p>
                )}
              </div>
            </div>
          </div>

          {/* Amount Summary */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">€{Number(invoice.amount).toFixed(2)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span>Descuento:</span>
                  <span className="font-medium">-€{Number(invoice.discountAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-gray-900">€{Number(invoice.finalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Notas</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{invoice.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center"
                title="Descargar PDF"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {invoice.status === 'pending' && !editingPayment && (
                <>
                  <button
                    onClick={() => setEditingPayment(true)}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar como Pagada
                  </button>
                  <button
                    onClick={handleCancelInvoice}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Payment Form */}
          {editingPayment && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4">Registrar Pago</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="transfer">Transferencia</option>
                    <option value="card">Tarjeta</option>
                    <option value="cash">Efectivo</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referencia (opcional)</label>
                  <input
                    type="text"
                    value={paymentData.paymentReference}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentReference: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: TRF-12345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Pago</label>
                  <input
                    type="date"
                    value={paymentData.paidDate}
                    onChange={(e) => setPaymentData({ ...paymentData, paidDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setEditingPayment(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleMarkAsPaid}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? 'Procesando...' : 'Confirmar Pago'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}