'use client'

import React, { useState, useEffect } from 'react'
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
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
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

  const Icon = icons[status as keyof typeof icons]

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
      <Icon className="w-3 h-3 mr-1" />
      {labels[status as keyof typeof labels]}
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
          <h1 className="text-3xl font-bold text-gray-900">Facturación</h1>
          <p className="text-gray-600 mt-2">
            Gestiona las facturas y pagos de los usuarios
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Factura
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Facturado</p>
              <p className="text-2xl font-bold text-gray-900">€{stats.total.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cobrado</p>
              <p className="text-2xl font-bold text-green-600">€{stats.paid.toFixed(2)}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendiente</p>
              <p className="text-2xl font-bold text-yellow-600">€{stats.pending.toFixed(2)}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vencidas</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número, usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 lg:gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-w-0"
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-w-0"
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
                      <div className="text-sm font-medium text-gray-900">€{invoice.finalAmount.toFixed(2)}</div>
                      {invoice.discountAmount > 0 && (
                        <div className="text-xs text-gray-500">
                          Desc: €{invoice.discountAmount.toFixed(2)}
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
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-900"
                        title="Descargar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoices Cards - Mobile & Tablet */}
      <div className="lg:hidden space-y-4">
        {filteredInvoices.map((invoice) => (
          <div key={invoice.id} className="bg-white rounded-lg border p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-gray-400 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</h3>
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
                <p className="text-sm font-medium text-gray-900">{invoice.user.name}</p>
                <p className="text-xs text-gray-500">{invoice.user.email}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Importe</p>
                  <p className="text-sm font-medium text-gray-900">€{invoice.finalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Vencimiento</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(invoice.dueDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                onClick={() => setSelectedInvoice(invoice)}
                className="flex items-center text-blue-600 hover:text-blue-900 text-sm"
              >
                <Eye className="w-4 h-4 mr-1" />
                Ver detalles
              </button>
              <button
                className="flex items-center text-gray-600 hover:text-gray-900 text-sm"
              >
                <Download className="w-4 h-4 mr-1" />
                PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron facturas</h3>
          <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
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