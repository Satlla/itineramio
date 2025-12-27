'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  User,
  Building2,
  Receipt
} from 'lucide-react'
import CreateInvoiceModal from './components/CreateInvoiceModal'
import InvoiceDetailModal from './components/InvoiceDetailModal'

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

const StatusBadge = ({ status }: { status: string }) => {
  // Normalize status to lowercase
  const normalizedStatus = status?.toLowerCase() || 'pending'
  
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  }

  const icons = {
    pending: Clock,
    paid: CheckCircle,
    overdue: AlertCircle,
    cancelled: XCircle
  }

  const labels = {
    pending: 'Pendiente',
    paid: 'Pagada',
    overdue: 'Vencida',
    cancelled: 'Cancelada'
  }

  const Icon = icons[normalizedStatus as keyof typeof icons] || Clock
  const label = labels[normalizedStatus as keyof typeof labels] || 'Desconocido'
  const style = styles[normalizedStatus as keyof typeof styles] || styles.pending

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  )
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [markingAsPaid, setMarkingAsPaid] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/invoices')
      const data = await response.json()
      if (data.success) {
        setInvoices(data.invoices)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchTerm === '' || 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    
    const matchesDate = dateFilter === 'all' || (() => {
      const dueDate = new Date(invoice.dueDate)
      const today = new Date()
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      switch (dateFilter) {
        case 'overdue':
          return dueDate < today && invoice.status === 'pending'
        case 'due_soon':
          const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
          return dueDate >= today && dueDate <= sevenDaysFromNow && invoice.status === 'pending'
        case 'recent':
          return new Date(invoice.createdAt) >= thirtyDaysAgo
        default:
          return true
      }
    })()

    return matchesSearch && matchesStatus && matchesDate
  })

  const calculateStats = () => {
    const total = invoices.reduce((sum, inv) => sum + inv.finalAmount, 0)
    const paid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.finalAmount, 0)
    const pending = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.finalAmount, 0)
    const overdue = invoices.filter(inv => {
      const dueDate = new Date(inv.dueDate)
      return dueDate < new Date() && inv.status === 'pending'
    }).length

    return { total, paid, pending, overdue }
  }

  const stats = calculateStats()

  const handleMarkAsPaid = async (invoiceId: string) => {
    const paymentMethod = prompt('Método de pago (ej: Transferencia, Tarjeta, Efectivo):')
    if (!paymentMethod) return

    const paymentReference = prompt('Referencia del pago (opcional):') || null

    try {
      setMarkingAsPaid(invoiceId)
      
      const response = await fetch(`/api/admin/invoices/${invoiceId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          paymentReference,
          paidDate: new Date().toISOString()
        })
      })

      const data = await response.json()

      if (data.success) {
        // Refresh invoices
        fetchInvoices()
        alert('Factura marcada como pagada correctamente. Se han enviado emails de confirmación y factura al cliente.')
      } else {
        alert(data.error || 'Error al marcar la factura como pagada')
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error)
      alert('Error al marcar la factura como pagada')
    } finally {
      setMarkingAsPaid(null)
    }
  }

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/download`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `factura-${invoiceId}.html`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Error al descargar la factura')
      }
    } catch (error) {
      console.error('Error downloading invoice:', error)
      alert('Error al descargar la factura')
    }
  }

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
            <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 mr-2 text-red-600" />
            Facturación
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1 sm:mt-2">
            Gestiona las facturas y pagos de los usuarios
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Factura
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg border p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm text-gray-600">Total Facturado</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">€{Number(stats.total).toFixed(2)}</p>
            </div>
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm text-gray-600">Cobrado</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">€{Number(stats.paid).toFixed(2)}</p>
            </div>
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm text-gray-600">Pendiente</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-600">€{Number(stats.pending).toFixed(2)}</p>
            </div>
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm text-gray-600">Vencidas</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
            <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número, usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-w-0 text-sm sm:text-base"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="paid">Pagadas</option>
              <option value="overdue">Vencidas</option>
              <option value="cancelled">Canceladas</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-w-0 text-sm sm:text-base"
            >
              <option value="all">Todas las fechas</option>
              <option value="overdue">Vencidas</option>
              <option value="due_soon">Próximas a vencer</option>
              <option value="recent">Últimos 30 días</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Factura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Importe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(invoice.createdAt).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{invoice.user.name}</div>
                      <div className="text-sm text-gray-500">{invoice.user.email}</div>
                      {invoice.user.companyName && (
                        <div className="text-xs text-gray-400 flex items-center mt-1">
                          <Building2 className="w-3 h-3 mr-1" />
                          {invoice.user.companyName}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">€{Number(invoice.finalAmount).toFixed(2)}</div>
                      {invoice.discountAmount > 0 && (
                        <div className="text-xs text-gray-500">
                          Desc: €{Number(invoice.discountAmount).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={invoice.status} />
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(invoice.dueDate).toLocaleDateString('es-ES')}
                    </div>
                    {invoice.paidDate && (
                      <div className="text-xs text-gray-500">
                        Pagada: {new Date(invoice.paidDate).toLocaleDateString('es-ES')}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/admin/billing/${invoice.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDownloadInvoice(invoice.id)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Descargar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                        <button
                          onClick={() => handleMarkAsPaid(invoice.id)}
                          disabled={markingAsPaid === invoice.id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          title="Marcar como pagada"
                        >
                          {markingAsPaid === invoice.id ? (
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent animate-spin rounded-full"></div>
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoices Cards - Mobile & Tablet */}
      <div className="lg:hidden space-y-3 sm:space-y-4">
        {filteredInvoices.map((invoice) => (
          <div key={invoice.id} className="bg-white rounded-lg border p-3 sm:p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center min-w-0 flex-1">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-900 truncate">{invoice.invoiceNumber}</h3>
                  <p className="text-xs text-gray-500">
                    {new Date(invoice.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
              <StatusBadge status={invoice.status} />
            </div>

            <div className="space-y-2 mb-3">
              <div>
                <p className="text-xs text-gray-500">Cliente</p>
                <p className="text-sm font-medium text-gray-900 truncate">{invoice.user.name}</p>
                <p className="text-xs text-gray-500 truncate">{invoice.user.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <p className="text-xs text-gray-500">Importe</p>
                  <p className="text-sm font-medium text-gray-900">€{Number(invoice.finalAmount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Vencimiento</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(invoice.dueDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2 pt-3 border-t border-gray-100">
              <Link
                href={`/admin/billing/${invoice.id}`}
                className="flex items-center text-blue-600 hover:text-blue-900 text-xs sm:text-sm"
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Ver
              </Link>
              <button
                onClick={() => handleDownloadInvoice(invoice.id)}
                className="flex items-center text-gray-600 hover:text-gray-900 text-xs sm:text-sm"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                PDF
              </button>
              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                <button
                  onClick={() => handleMarkAsPaid(invoice.id)}
                  disabled={markingAsPaid === invoice.id}
                  className="flex items-center text-green-600 hover:text-green-900 text-xs sm:text-sm disabled:opacity-50"
                >
                  {markingAsPaid === invoice.id ? (
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-green-600 border-t-transparent animate-spin rounded-full mr-1"></div>
                  ) : (
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  )}
                  Pagada
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-8 sm:py-12 bg-white rounded-lg border">
          <Receipt className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No se encontraron facturas</h3>
          <p className="text-sm sm:text-base text-gray-600">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchInvoices}
      />

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onUpdate={fetchInvoices}
        />
      )}
    </div>
  )
}