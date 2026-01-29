'use client'

import { formatCurrency } from '@/lib/format'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Send,
  Eye,
  Euro,
  Calendar,
  User,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  RefreshCw,
  ArrowRight,
  Lock,
  Unlock
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Card, CardContent, Badge } from '../../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardFooter } from '../../../../src/components/layout/DashboardFooter'

interface Owner {
  id: string
  type: 'PERSONA_FISICA' | 'EMPRESA'
  firstName?: string
  lastName?: string
  companyName?: string
}

interface Invoice {
  id: string
  number?: number
  fullNumber?: string
  issueDate: string
  issuedAt?: string
  dueDate?: string
  subtotal: number
  totalVat: number
  total: number
  status: 'DRAFT' | 'ISSUED' | 'SENT' | 'PAID' | 'OVERDUE'
  isLocked: boolean
  isRectifying: boolean
  rectifyingType?: 'SUBSTITUTION' | 'DIFFERENCE'
  rectifyingReason?: string
  rectifies?: { id: string; fullNumber: string }
  rectifiedBy?: Array<{ id: string; fullNumber: string }>
  owner: Owner
  series?: { id: string; name: string; prefix: string; type: string }
  items: Array<{
    concept: string
    total: number
  }>
}

const STATUS_CONFIG = {
  DRAFT: { label: 'Borrador', color: 'bg-gray-100 text-gray-700', icon: Clock },
  ISSUED: { label: 'Emitida', color: 'bg-blue-100 text-blue-700', icon: FileText },
  SENT: { label: 'Enviada', color: 'bg-violet-100 text-violet-700', icon: Send },
  PAID: { label: 'Pagada', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  OVERDUE: { label: 'Vencida', color: 'bg-red-100 text-red-700', icon: AlertCircle }
}

export default function FacturasPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('') // 'normal', 'rectifying', ''
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState<string | null>(null)
  const [confirmIssue, setConfirmIssue] = useState<{ id: string; nextNumber: string } | null>(null)

  useEffect(() => {
    fetchInvoices()
  }, [selectedYear, statusFilter, typeFilter])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ year: selectedYear.toString() })
      if (statusFilter) params.append('status', statusFilter)
      if (typeFilter) params.append('type', typeFilter)

      const response = await fetch(`/api/gestion/invoices?${params}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices || [])
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (invoiceId: string, status: string) => {
    setActionLoading(invoiceId)
    try {
      const response = await fetch(`/api/gestion/invoices/${invoiceId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        fetchInvoices()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al cambiar estado')
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setActionLoading(null)
    }
    setShowDropdown(null)
  }

  const previewIssue = async (invoiceId: string) => {
    setActionLoading(invoiceId)
    try {
      const response = await fetch(`/api/gestion/invoices/${invoiceId}/issue`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setConfirmIssue({ id: invoiceId, nextNumber: data.nextNumber })
      } else {
        const data = await response.json()
        alert(data.error || 'Error al previsualizar')
      }
    } catch (error) {
      console.error('Error previewing issue:', error)
    } finally {
      setActionLoading(null)
    }
    setShowDropdown(null)
  }

  const issueInvoice = async () => {
    if (!confirmIssue) return

    setActionLoading(confirmIssue.id)
    try {
      const response = await fetch(`/api/gestion/invoices/${confirmIssue.id}/issue`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        setConfirmIssue(null)
        fetchInvoices()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al emitir factura')
      }
    } catch (error) {
      console.error('Error issuing invoice:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const deleteInvoice = async (invoiceId: string) => {
    if (!confirm('¿Eliminar este borrador? Esta acción no se puede deshacer.')) return

    setActionLoading(invoiceId)
    try {
      const response = await fetch(`/api/gestion/invoices/${invoiceId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        fetchInvoices()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al eliminar')
      }
    } catch (error) {
      console.error('Error deleting invoice:', error)
    } finally {
      setActionLoading(null)
    }
    setShowDropdown(null)
  }

  const getOwnerName = (owner: Owner) => {
    if (owner.type === 'EMPRESA') return owner.companyName || 'Empresa'
    return `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || 'Cliente'
  }

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (!invoice.fullNumber?.toLowerCase().includes(term) &&
          !getOwnerName(invoice.owner).toLowerCase().includes(term)) {
        return false
      }
    }
    return true
  })

  // Calculate totals (excluding drafts)
  const issuedInvoices = filteredInvoices.filter(inv => inv.status !== 'DRAFT')
  const totals = issuedInvoices.reduce((acc, inv) => ({
    total: acc.total + inv.total,
    pending: acc.pending + (inv.status !== 'PAID' ? inv.total : 0),
    count: acc.count + 1,
    paid: acc.paid + (inv.status === 'PAID' ? 1 : 0)
  }), { total: 0, pending: 0, count: 0, paid: 0 })

  if (loading) {
    return <AnimatedLoadingSpinner text="Cargando facturas..." type="general" />
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
                <FileText className="h-7 w-7 text-violet-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
                  <p className="text-sm text-gray-600">
                    Gestiona todas tus facturas emitidas
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <Link href="/gestion/facturas/nueva">
                  <Button className="bg-violet-600 hover:bg-violet-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva factura
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Totals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6"
          >
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600">Total facturado</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {formatCurrency(totals.total)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600">Pendiente cobro</p>
                  <p className="text-lg sm:text-2xl font-bold text-orange-600">
                    {formatCurrency(totals.pending)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600">Nº facturas</p>
                  <p className="text-lg sm:text-2xl font-bold text-violet-600">
                    {totals.count}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600">Cobradas</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">
                    {totals.paid}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-6"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por número o cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Todos los estados</option>
                    <option value="DRAFT">Borrador</option>
                    <option value="ISSUED">Emitida</option>
                    <option value="SENT">Enviada</option>
                    <option value="PAID">Pagada</option>
                    <option value="OVERDUE">Vencida</option>
                  </select>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="normal">Facturas normales</option>
                    <option value="rectifying">Rectificativas</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Issue Confirmation Modal */}
          {confirmIssue && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Emitir Factura</h3>
                    <p className="text-sm text-gray-500">Se asignará el número</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-center text-2xl font-bold text-violet-600">
                    {confirmIssue.nextNumber}
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                  <div className="flex items-start gap-2">
                    <Lock className="w-4 h-4 text-amber-600 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      Una vez emitida, la factura no podrá ser editada ni eliminada. Solo podrá crear una factura rectificativa.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setConfirmIssue(null)}
                    disabled={actionLoading === confirmIssue.id}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-violet-600 hover:bg-violet-700"
                    onClick={issueInvoice}
                    disabled={actionLoading === confirmIssue.id}
                  >
                    {actionLoading === confirmIssue.id ? 'Emitiendo...' : 'Emitir Factura'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Invoices List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {filteredInvoices.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-700 font-medium mb-2">No hay facturas</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Crea tu primera factura libre o genera desde Facturación
                  </p>
                  <Link href="/gestion/facturas/nueva">
                    <Button className="bg-violet-600 hover:bg-violet-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Crear factura
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredInvoices.map((invoice, index) => {
                  const statusConfig = STATUS_CONFIG[invoice.status]
                  const StatusIcon = statusConfig.icon
                  const isDraft = invoice.status === 'DRAFT'
                  const isIssued = invoice.status === 'ISSUED'
                  const isSent = invoice.status === 'SENT'
                  const isPaid = invoice.status === 'PAID'
                  const isOverdue = invoice.status === 'OVERDUE'

                  return (
                    <motion.div
                      key={invoice.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3 sm:p-4">
                          {/* Mobile Layout */}
                          <div className="sm:hidden">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <span className="font-bold text-gray-900">
                                  {invoice.fullNumber || (
                                    <span className="text-gray-500">#{invoice.id.slice(-6).toUpperCase()}</span>
                                  )}
                                </span>
                                <Badge className={`${statusConfig.color} text-xs ml-2`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusConfig.label}
                                </Badge>
                              </div>
                              <p className="font-bold text-lg text-gray-900">
                                {formatCurrency(invoice.total)}
                              </p>
                            </div>
                            <div className="text-sm text-gray-500 space-y-1">
                              <p className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {getOwnerName(invoice.owner)}
                              </p>
                              <p className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(invoice.issueDate).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                            <div className="flex justify-end gap-1 mt-3 pt-2 border-t border-gray-100">
                              <Link href={`/gestion/facturas/${invoice.id}`}>
                                <button className="p-2 text-gray-400 hover:text-violet-600 transition-colors">
                                  <Eye className="w-5 h-5" />
                                </button>
                              </Link>
                              {!isDraft && (
                                <button className="p-2 text-gray-400 hover:text-violet-600 transition-colors">
                                  <Download className="w-5 h-5" />
                                </button>
                              )}
                              <button
                                onClick={() => setShowDropdown(showDropdown === invoice.id ? null : invoice.id)}
                                className="p-2 text-gray-400 hover:text-violet-600 transition-colors"
                                disabled={actionLoading === invoice.id}
                              >
                                {actionLoading === invoice.id ? (
                                  <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                  <MoreVertical className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Desktop Layout */}
                          <div className="hidden sm:flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-900">
                                  {invoice.fullNumber || (
                                    <span className="text-gray-500">#{invoice.id.slice(-6).toUpperCase()}</span>
                                  )}
                                </span>
                                {invoice.isLocked && (
                                  <Lock className="w-3 h-3 text-gray-400" />
                                )}
                                {invoice.isRectifying && (
                                  <Badge className="bg-orange-100 text-orange-700 text-xs">
                                    {invoice.rectifyingType === 'SUBSTITUTION' ? 'Rectif. Sust.' : 'Rectif. Dif.'}
                                  </Badge>
                                )}
                                {(invoice.rectifiedBy?.length ?? 0) > 0 && (
                                  <Badge className="bg-gray-100 text-gray-600 text-xs">
                                    Rectificada
                                  </Badge>
                                )}
                                <Badge className={`${statusConfig.color} text-xs`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusConfig.label}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {getOwnerName(invoice.owner)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(invoice.issueDate).toLocaleDateString('es-ES')}
                                </span>
                                {invoice.dueDate && (
                                  <span className="text-gray-400">
                                    Vence: {new Date(invoice.dueDate).toLocaleDateString('es-ES')}
                                  </span>
                                )}
                                {invoice.rectifies && (
                                  <span className="flex items-center gap-1 text-orange-600">
                                    <ArrowRight className="w-3 h-3" />
                                    Rectifica: {invoice.rectifies.fullNumber}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-bold text-lg text-gray-900">
                                  {formatCurrency(invoice.total)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Base: {formatCurrency(invoice.subtotal)}
                                </p>
                              </div>

                              <div className="flex items-center gap-1">
                                <Link href={`/gestion/facturas/${invoice.id}`}>
                                  <button className="p-2 text-gray-400 hover:text-violet-600 transition-colors">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </Link>
                                {!isDraft && (
                                  <button className="p-2 text-gray-400 hover:text-violet-600 transition-colors">
                                    <Download className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => setShowDropdown(showDropdown === invoice.id ? null : invoice.id)}
                                  className="p-2 text-gray-400 hover:text-violet-600 transition-colors"
                                  disabled={actionLoading === invoice.id}
                                >
                                  {actionLoading === invoice.id ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <MoreVertical className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Dropdown Menu (shared for mobile and desktop) */}
                          {showDropdown === invoice.id && (
                            <div className="relative">
                              <div className="absolute right-0 top-0 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                {/* Draft actions */}
                                {isDraft && (
                                  <>
                                    <button
                                      onClick={() => previewIssue(invoice.id)}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <FileText className="w-4 h-4 text-blue-500" />
                                      Emitir factura
                                    </button>
                                    <Link href={`/gestion/facturas/${invoice.id}`}>
                                      <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                        <Unlock className="w-4 h-4 text-gray-500" />
                                        Editar borrador
                                      </button>
                                    </Link>
                                    <button
                                      onClick={() => deleteInvoice(invoice.id)}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      Eliminar borrador
                                    </button>
                                  </>
                                )}

                                {/* Issued actions */}
                                {isIssued && (
                                  <>
                                    <button
                                      onClick={() => updateStatus(invoice.id, 'SENT')}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Send className="w-4 h-4 text-violet-500" />
                                      Marcar como enviada
                                    </button>
                                    <button
                                      onClick={() => updateStatus(invoice.id, 'PAID')}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                      Marcar como pagada
                                    </button>
                                    <Link href={`/gestion/facturas/${invoice.id}?rectify=true`}>
                                      <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 text-orange-500" />
                                        Crear rectificativa
                                      </button>
                                    </Link>
                                  </>
                                )}

                                {/* Sent actions */}
                                {isSent && (
                                  <>
                                    <button
                                      onClick={() => updateStatus(invoice.id, 'PAID')}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                      Marcar como pagada
                                    </button>
                                    <Link href={`/gestion/facturas/${invoice.id}?rectify=true`}>
                                      <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 text-orange-500" />
                                        Crear rectificativa
                                      </button>
                                    </Link>
                                  </>
                                )}

                                {/* Overdue actions */}
                                {isOverdue && (
                                  <>
                                    <button
                                      onClick={() => updateStatus(invoice.id, 'PAID')}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                      Marcar como pagada
                                    </button>
                                    <Link href={`/gestion/facturas/${invoice.id}?rectify=true`}>
                                      <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 text-orange-500" />
                                        Crear rectificativa
                                      </button>
                                    </Link>
                                  </>
                                )}

                                {/* Paid actions */}
                                {isPaid && (
                                  <Link href={`/gestion/facturas/${invoice.id}?rectify=true`}>
                                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                      <RefreshCw className="w-4 h-4 text-orange-500" />
                                      Crear rectificativa
                                    </button>
                                  </Link>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  )
}
