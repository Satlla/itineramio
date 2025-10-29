'use client'

import React, { useState } from 'react'
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Eye,
  Calendar,
  Euro,
  CreditCard
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  discountAmount: number
  finalAmount: number
  status: string
  paymentMethod?: string
  paymentReference?: string
  dueDate: string
  paidDate?: string
  createdAt: string
  subscription?: {
    id: string
    plan?: {
      name: string
    }
  }
}

interface InvoiceTableProps {
  invoices: Invoice[]
  summary: {
    totalPaid: number
    pendingAmount: number
    totalInvoices: number
  }
  onDownloadInvoice?: (invoiceId: string) => void
  onViewInvoice?: (invoice: Invoice) => void
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  summary,
  onDownloadInvoice,
  onViewInvoice
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'OVERDUE'>('ALL')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle2 className="w-4 h-4" />
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'OVERDUE':
        return <XCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Pagada'
      case 'PENDING':
        return 'Pendiente'
      case 'OVERDUE':
        return 'Vencida'
      case 'CANCELLED':
        return 'Cancelada'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const filteredInvoices = invoices.filter(invoice => {
    if (filter === 'ALL') return true
    return invoice.status === filter
  })

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Euro className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm text-gray-600">Total Pagado</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.totalPaid)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm text-gray-600">Pendiente</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(summary.pendingAmount)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm text-gray-600">Total Facturas</div>
                <div className="text-2xl font-bold text-blue-600">
                  {summary.totalInvoices}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Historial de Facturas
            </CardTitle>
            
            {/* Filter Buttons */}
            <div className="flex space-x-2">
              {(['ALL', 'PAID', 'PENDING', 'OVERDUE'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'ALL' ? 'Todas' : 
                   status === 'PAID' ? 'Pagadas' :
                   status === 'PENDING' ? 'Pendientes' : 'Vencidas'}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay facturas
              </h3>
              <p className="text-gray-600">
                {filter === 'ALL' 
                  ? 'No tienes facturas generadas aún'
                  : `No hay facturas con estado: ${filter.toLowerCase()}`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInvoices.map((invoice) => (
                <div 
                  key={invoice.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          <span className="ml-1">{getStatusText(invoice.status)}</span>
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </span>
                        <span className="text-sm text-gray-500">
                          {invoice.subscription?.plan?.name || 'Plan personalizado'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Importe:</span>
                          <span className="font-semibold text-green-600 ml-2">
                            {formatCurrency(invoice.finalAmount)}
                          </span>
                          {invoice.discountAmount > 0 && (
                            <div className="text-xs text-gray-500">
                              Descuento: -{formatCurrency(invoice.discountAmount)}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <span className="text-gray-600">Fecha:</span>
                          <span className="ml-2">{formatDate(invoice.createdAt)}</span>
                        </div>
                        
                        <div>
                          <span className="text-gray-600">Vencimiento:</span>
                          <span className="ml-2">{formatDate(invoice.dueDate)}</span>
                        </div>
                        
                        {invoice.paymentMethod && (
                          <div>
                            <span className="text-gray-600">Método:</span>
                            <span className="ml-2 flex items-center">
                              <CreditCard className="w-3 h-3 mr-1" />
                              {invoice.paymentMethod === 'BIZUM' ? 'Bizum' : 'Transferencia'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {invoice.paidDate && (
                        <div className="text-xs text-green-600 mt-2">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          Pagada el {formatDate(invoice.paidDate)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {onViewInvoice && (
                        <Button
                          onClick={() => onViewInvoice(invoice)}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      )}
                      
                      {onDownloadInvoice && (
                        <Button
                          onClick={() => onDownloadInvoice(invoice.id)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                      )}
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