'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  ChevronLeft,
  Save,
  Trash2,
  Send,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Lock,
  Eye,
  Plus,
  RefreshCw,
  X,
  AlertTriangle,
  Mail,
  Building2,
  CreditCard,
  Smartphone,
  Banknote
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Button, Card, CardContent, Badge } from '../../../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardFooter } from '../../../../../src/components/layout/DashboardFooter'

interface Owner {
  id: string
  type: 'PERSONA_FISICA' | 'EMPRESA'
  firstName?: string
  lastName?: string
  companyName?: string
  nif?: string
  cif?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
}

interface InvoiceItem {
  id?: string
  concept: string
  description?: string
  quantity: number
  unitPrice: number
  vatRate: number
  retentionRate: number
  total: number
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
  retentionRate: number
  retentionAmount: number
  total: number
  status: 'DRAFT' | 'PROFORMA' | 'ISSUED' | 'SENT' | 'PAID' | 'OVERDUE'
  isLocked: boolean
  isRectifying: boolean
  rectifyingType?: 'SUBSTITUTION' | 'DIFFERENCE'
  rectifyingReason?: string
  originalTotal?: number
  paymentMethodUsed?: string
  notes?: string
  owner: Owner
  series: { id: string; name: string; prefix: string; type: string }
  rectifies?: { id: string; fullNumber: string; total: number }
  rectifiedBy?: Array<{ id: string; fullNumber: string; total: number; status: string }>
  items: InvoiceItem[]
}

interface ManagerConfig {
  businessName: string
  nif: string
  address: string
  city: string
  postalCode: string
  country: string
  email?: string
  phone?: string
  logoUrl?: string
  iban?: string
  bankName?: string
  bic?: string
  paymentMethods?: string[]
  defaultPaymentMethod?: string
  bizumPhone?: string
  paypalEmail?: string
}

const STATUS_CONFIG: Record<string, { label: string; bgColor: string; color: string; icon: any }> = {
  DRAFT: { label: 'Borrador', bgColor: 'bg-gray-100', color: 'text-gray-700', icon: Clock },
  PROFORMA: { label: 'Proforma', bgColor: 'bg-blue-100', color: 'text-blue-700', icon: FileText },
  ISSUED: { label: 'Emitida', bgColor: 'bg-violet-100', color: 'text-violet-700', icon: FileText },
  SENT: { label: 'Enviada', bgColor: 'bg-amber-100', color: 'text-amber-700', icon: Send },
  PAID: { label: 'Pagada', bgColor: 'bg-green-100', color: 'text-green-700', icon: CheckCircle },
  OVERDUE: { label: 'Vencida', bgColor: 'bg-red-100', color: 'text-red-700', icon: AlertCircle }
}

export default function InvoiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const invoiceId = params.id as string
  const showRectifyModal = searchParams.get('rectify') === 'true'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [managerConfig, setManagerConfig] = useState<ManagerConfig | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Modals
  const [showPreview, setShowPreview] = useState(false)
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showRectify, setShowRectify] = useState(showRectifyModal)

  // Issue modal state
  const [nextNumber, setNextNumber] = useState('')
  const [customNumber, setCustomNumber] = useState(0)
  const [seriesPrefix, setSeriesPrefix] = useState('')
  const [seriesYear, setSeriesYear] = useState(0)
  const [numberError, setNumberError] = useState<string | null>(null)
  const [numberWarning, setNumberWarning] = useState<string | null>(null)
  const [validatingNumber, setValidatingNumber] = useState(false)

  // Send modal state
  const [sendEmail, setSendEmail] = useState('')
  const [sendSubject, setSendSubject] = useState('')
  const [sendMessage, setSendMessage] = useState('')

  // Rectify form state
  const [rectifyType, setRectifyType] = useState<'SUBSTITUTION' | 'DIFFERENCE'>('SUBSTITUTION')
  const [rectifyReason, setRectifyReason] = useState('')
  const [rectifyItems, setRectifyItems] = useState<InvoiceItem[]>([])

  useEffect(() => {
    fetchInvoice()
  }, [invoiceId])

  const fetchInvoice = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gestion/invoices/${invoiceId}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setInvoice(data.invoice)
        setManagerConfig(data.managerConfig)
        // Initialize rectify items
        setRectifyItems(data.invoice.items.map((i: InvoiceItem) => ({ ...i, id: undefined })))
        // Initialize send email
        if (data.invoice.owner.email) {
          setSendEmail(data.invoice.owner.email)
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Error al cargar la factura')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€'
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES')
  }

  const getOwnerName = (owner: Owner) => {
    if (owner.type === 'EMPRESA') return owner.companyName || 'Empresa'
    return `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || 'Cliente'
  }

  const getOwnerNif = (owner: Owner) => {
    return owner.type === 'EMPRESA' ? owner.cif : owner.nif
  }

  // Save invoice number
  const saveInvoiceNumber = async (newNumber: string) => {
    if (!invoice) return
    setSaving(true)
    try {
      const response = await fetch(`/api/gestion/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullNumber: newNumber || null
        })
      })
      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Error al guardar')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  // Calculate totals
  const calculateTotals = () => {
    if (!invoice) return { subtotal: 0, totalVat: 0, totalRetention: 0, total: 0 }

    let subtotal = 0
    let totalVat = 0
    let totalRetention = 0

    invoice.items.forEach(item => {
      const base = item.quantity * item.unitPrice
      subtotal += base
      totalVat += base * (item.vatRate / 100)
      totalRetention += base * ((item.retentionRate || 0) / 100)
    })

    return {
      subtotal,
      totalVat,
      totalRetention,
      total: subtotal + totalVat - totalRetention
    }
  }

  const totals = calculateTotals()

  // Action handlers
  const previewIssue = async () => {
    setActionLoading('issue')
    setNumberError(null)
    setNumberWarning(null)
    try {
      const response = await fetch(`/api/gestion/invoices/${invoiceId}/issue`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setNextNumber(data.nextNumber)
        setCustomNumber(data.suggestedNumber)
        setSeriesPrefix(data.seriesPrefix)
        setSeriesYear(data.seriesYear)
        setShowIssueModal(true)
      } else {
        const data = await response.json()
        setError(data.error || 'Error al previsualizar')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setActionLoading(null)
    }
  }

  const handleIssue = async () => {
    if (numberError) return

    setActionLoading('issue')
    try {
      const response = await fetch(`/api/gestion/invoices/${invoiceId}/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ customNumber })
      })

      if (response.ok) {
        setShowIssueModal(false)
        await fetchInvoice()
      } else {
        const data = await response.json()
        setError(data.error || 'Error al emitir')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setActionLoading(null)
    }
  }

  const handleStatusChange = async (status: string) => {
    setActionLoading('status')
    try {
      const response = await fetch(`/api/gestion/invoices/${invoiceId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        await fetchInvoice()
      } else {
        const data = await response.json()
        setError(data.error || 'Error al cambiar estado')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async () => {
    setActionLoading('delete')
    try {
      const response = await fetch(`/api/gestion/invoices/${invoiceId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        router.push('/gestion/facturas')
      } else {
        const data = await response.json()
        setError(data.error || 'Error al eliminar')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setActionLoading(null)
      setShowDeleteConfirm(false)
    }
  }

  const handleDownloadPDF = async () => {
    setActionLoading('pdf')
    try {
      const response = await fetch(`/api/gestion/invoices/${invoiceId}/pdf`, {
        credentials: 'include'
      })

      if (response.ok) {
        const html = await response.text()
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(html)
          printWindow.document.close()
          printWindow.onload = () => {
            setTimeout(() => printWindow.print(), 250)
          }
        }
      } else {
        setError('Error al generar PDF')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setActionLoading(null)
    }
  }

  const openSendModal = async () => {
    if (!invoice) return

    // Set default subject and message
    const ownerName = getOwnerName(invoice.owner)
    const invoiceNum = invoice.fullNumber || 'borrador'
    setSendSubject(`Factura ${invoiceNum}`)
    setSendMessage(`Hola ${ownerName},\n\nAdjunto encontrarás la factura ${invoiceNum}.\n\nUn saludo,\n${managerConfig?.businessName || ''}`)
    setShowSendModal(true)
  }

  const handleSend = async () => {
    if (!sendEmail) {
      setError('El email es requerido')
      return
    }

    setActionLoading('send')
    try {
      const response = await fetch(`/api/gestion/invoices/${invoiceId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: sendEmail,
          subject: sendSubject,
          message: sendMessage
        })
      })

      if (response.ok) {
        setShowSendModal(false)
        await fetchInvoice()
      } else {
        const data = await response.json()
        setError(data.error || 'Error al enviar')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateRectify = async () => {
    if (!rectifyReason.trim()) {
      setError('El motivo de rectificación es obligatorio')
      return
    }

    setActionLoading('rectify')
    try {
      const response = await fetch(`/api/gestion/invoices/${invoiceId}/rectify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          rectifyingType: rectifyType,
          reason: rectifyReason,
          items: rectifyItems.map(item => ({
            concept: item.concept,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            vatRate: item.vatRate,
            retentionRate: item.retentionRate || 0
          }))
        })
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/gestion/facturas/${data.invoice.id}`)
      } else {
        const data = await response.json()
        setError(data.error || 'Error al crear rectificativa')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return <AnimatedLoadingSpinner text="Cargando factura..." type="general" />
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-1 flex items-center justify-center">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-400" />
              <p className="text-gray-700 font-medium mb-2">Factura no encontrada</p>
              <Link href="/gestion/facturas">
                <Button className="mt-4">Volver a facturas</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.DRAFT
  const StatusIcon = statusConfig.icon
  const isDraft = invoice.status === 'DRAFT' || invoice.status === 'PROFORMA'
  const isEditable = isDraft && !invoice.isLocked
  const canIssue = isDraft
  const canSend = invoice.status === 'ISSUED' || invoice.status === 'SENT'
  const canMarkPaid = ['ISSUED', 'SENT', 'OVERDUE'].includes(invoice.status)

  // Payment methods to show
  const paymentMethods = managerConfig?.paymentMethods || []
  const hasPaymentMethods = paymentMethods.length > 0

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 bg-red-50 border-b border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-900">Eliminar borrador</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700">¿Estás seguro de que quieres eliminar este borrador?</p>
                <p className="text-sm text-gray-500 mt-2">Esta acción no se puede deshacer.</p>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={actionLoading === 'delete'}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {actionLoading === 'delete' ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Issue Modal */}
      <AnimatePresence>
        {showIssueModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 bg-violet-50 border-b border-violet-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-violet-900">Emitir Factura</h3>
                    <p className="text-sm text-violet-700">Se asignará el número definitivo</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de factura</label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-medium text-gray-500">{seriesPrefix}{String(seriesYear).slice(-2)}</span>
                    <input
                      type="number"
                      min="1"
                      value={customNumber}
                      onChange={(e) => setCustomNumber(parseInt(e.target.value) || 0)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-lg font-bold text-center text-violet-600 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Número completo: <span className="font-medium">{seriesPrefix}{String(seriesYear).slice(-2)}{String(customNumber).padStart(4, '0')}</span>
                  </p>
                </div>

                {numberError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-800">{numberError}</p>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Lock className="w-4 h-4 text-amber-600 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      Una vez emitida, la factura no podrá ser editada ni eliminada.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowIssueModal(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleIssue}
                  disabled={actionLoading === 'issue' || !!numberError}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {actionLoading === 'issue' ? 'Emitiendo...' : 'Emitir Factura'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Send Modal */}
      <AnimatePresence>
        {showSendModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 bg-blue-50 border-b border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Enviar Factura</h3>
                    <p className="text-sm text-blue-700">Enviar por correo electrónico</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email destinatario</label>
                  <input
                    type="email"
                    value={sendEmail}
                    onChange={(e) => setSendEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="email@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                  <input
                    type="text"
                    value={sendSubject}
                    onChange={(e) => setSendSubject(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                  <textarea
                    value={sendMessage}
                    onChange={(e) => setSendMessage(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    rows={5}
                  />
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowSendModal(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={actionLoading === 'send' || !sendEmail}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {actionLoading === 'send' ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Link
              href="/gestion/facturas"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Volver a facturas
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {invoice.fullNumber || `Factura #${invoice.id.slice(-6).toUpperCase()}`}
                  </h1>
                  <Badge className={`${statusConfig.bgColor} ${statusConfig.color}`}>
                    {statusConfig.label}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {getOwnerName(invoice.owner)}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                  <Eye className="w-4 h-4 mr-1" />
                  Vista previa
                </Button>
                {!isDraft && (
                  <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={actionLoading === 'pdf'}>
                    <Download className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                )}
                {canIssue && (
                  <Button
                    size="sm"
                    onClick={previewIssue}
                    disabled={actionLoading === 'issue' || invoice.items.length === 0}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Emitir
                  </Button>
                )}
                {canSend && (
                  <Button size="sm" onClick={openSendModal} className="bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4 mr-1" />
                    Enviar
                  </Button>
                )}
                {canMarkPaid && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange('PAID')}
                    disabled={actionLoading === 'status'}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Cobrada
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Error Alert */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 flex-1">{error}</p>
                  <button onClick={() => setError(null)}>
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Rectification Info */}
          {invoice.isRectifying && invoice.rectifies && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <p className="text-sm text-orange-800">
                    <strong>Factura rectificativa</strong> de{' '}
                    <Link href={`/gestion/facturas/${invoice.rectifies.id}`} className="underline">
                      {invoice.rectifies.fullNumber}
                    </Link>
                    {invoice.rectifyingReason && <> — {invoice.rectifyingReason}</>}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Invoice Card - Same format as facturacion page */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden">
              <CardContent className="p-0">
                {/* Header - Logo + Dates */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      {managerConfig?.logoUrl ? (
                        <img src={managerConfig.logoUrl} alt="Logo" className="h-12 object-contain" />
                      ) : (
                        <div className="text-xl font-bold text-gray-900">
                          {managerConfig?.businessName || 'Mi Empresa'}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Fecha:</span>
                        <span className="font-medium">{formatDate(invoice.issueDate)}</span>
                      </div>
                      {invoice.dueDate && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Vencimiento:</span>
                          <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Issuer + Invoice Number + Recipient */}
                <div className="p-6 border-b border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Issuer */}
                    <div>
                      <span className="text-xs uppercase tracking-wider text-gray-500">Emisor</span>
                      <div className="mt-2 text-sm">
                        <p className="font-semibold text-gray-900">{managerConfig?.businessName}</p>
                        {managerConfig?.nif && <p className="text-gray-600">NIF: {managerConfig.nif}</p>}
                        {managerConfig?.address && <p className="text-gray-600">{managerConfig.address}</p>}
                        {managerConfig?.city && (
                          <p className="text-gray-600">{managerConfig.postalCode} {managerConfig.city}</p>
                        )}
                      </div>
                    </div>

                    {/* Invoice Number */}
                    <div className="text-right">
                      <span className="text-xs uppercase tracking-wider text-gray-500">Factura Nº</span>
                      {isDraft ? (
                        <div className="mt-1">
                          <input
                            type="text"
                            value={invoice.fullNumber || ''}
                            onChange={(e) => setInvoice({ ...invoice, fullNumber: e.target.value || undefined })}
                            onBlur={(e) => saveInvoiceNumber(e.target.value)}
                            placeholder="Ej: F260001"
                            className="text-xl font-bold text-gray-900 text-right border-b border-gray-300 focus:border-violet-500 outline-none w-32 bg-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">Vacío = automático</p>
                        </div>
                      ) : (
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {invoice.fullNumber || <span className="text-gray-400">Pendiente de asignar</span>}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Recipient */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <span className="text-xs uppercase tracking-wider text-gray-500">Cliente</span>
                    <div className="mt-2 text-sm">
                      <p className="font-semibold text-gray-900">{getOwnerName(invoice.owner)}</p>
                      {getOwnerNif(invoice.owner) && (
                        <p className="text-gray-600">
                          {invoice.owner.type === 'EMPRESA' ? 'CIF' : 'NIF'}: {getOwnerNif(invoice.owner)}
                        </p>
                      )}
                      {invoice.owner.address && <p className="text-gray-600">{invoice.owner.address}</p>}
                      {invoice.owner.city && (
                        <p className="text-gray-600">{invoice.owner.postalCode} {invoice.owner.city}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
                          <th className="text-left py-3 font-medium">Concepto</th>
                          <th className="text-right py-3 font-medium w-24">Precio</th>
                          <th className="text-center py-3 font-medium w-16">Uds.</th>
                          <th className="text-center py-3 font-medium w-16">IVA</th>
                          <th className="text-center py-3 font-medium w-16">Ret.</th>
                          <th className="text-right py-3 font-medium w-24">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.items.map((item, index) => {
                          const lineBase = item.quantity * item.unitPrice
                          const lineVat = lineBase * (item.vatRate / 100)
                          const lineRetention = lineBase * ((item.retentionRate || 0) / 100)
                          const lineTotal = lineBase + lineVat - lineRetention

                          return (
                            <tr key={index} className="border-b border-gray-100 last:border-0">
                              <td className="py-3">
                                <p className="font-medium text-gray-900">{item.concept}</p>
                                {item.description && (
                                  <p className="text-xs text-gray-500">{item.description}</p>
                                )}
                              </td>
                              <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                              <td className="py-3 text-center">{item.quantity}</td>
                              <td className="py-3 text-center">{item.vatRate}%</td>
                              <td className="py-3 text-center">{item.retentionRate || 0}%</td>
                              <td className="py-3 text-right font-medium">{formatCurrency(lineTotal)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-end">
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Base imponible</span>
                          <span>{formatCurrency(totals.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">IVA</span>
                          <span>{formatCurrency(totals.totalVat)}</span>
                        </div>
                        {totals.totalRetention > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Retención</span>
                            <span className="text-red-600">-{formatCurrency(totals.totalRetention)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg pt-2 border-t border-gray-300">
                          <span className="font-semibold">Total</span>
                          <span className="font-bold text-violet-600">{formatCurrency(totals.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                {hasPaymentMethods && !isDraft && (
                  <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Formas de pago</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {paymentMethods.includes('TRANSFERENCIA') && managerConfig?.iban && (
                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                          <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Transferencia bancaria</p>
                            <p className="text-xs text-gray-500 font-mono mt-1">
                              {managerConfig.iban.replace(/(.{4})/g, '$1 ').trim()}
                            </p>
                            {managerConfig.bankName && (
                              <p className="text-xs text-gray-500">{managerConfig.bankName}</p>
                            )}
                          </div>
                        </div>
                      )}
                      {paymentMethods.includes('BIZUM') && managerConfig?.bizumPhone && (
                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                          <Smartphone className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Bizum</p>
                            <p className="text-xs text-gray-500 mt-1">{managerConfig.bizumPhone}</p>
                          </div>
                        </div>
                      )}
                      {paymentMethods.includes('EFECTIVO') && (
                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                          <Banknote className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Efectivo</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {invoice.notes && (
                  <div className="p-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Notas</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions for drafts */}
          {isDraft && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <Card className="border-red-200">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Zona peligrosa</p>
                    <p className="text-xs text-gray-500">Eliminar este borrador permanentemente</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Create rectifying invoice */}
          {!isDraft && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Factura rectificativa</p>
                    <p className="text-xs text-gray-500">Crear una factura que rectifique esta</p>
                  </div>
                  <Button variant="outline" onClick={() => setShowRectify(true)}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Crear rectificativa
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>

      <DashboardFooter />

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Vista previa de factura</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={actionLoading === 'pdf'}>
                    <Download className="w-4 h-4 mr-1" />
                    Descargar PDF
                  </Button>
                  <button onClick={() => setShowPreview(false)} className="p-2 text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-8 bg-gray-100">
                <div className="bg-white shadow-lg max-w-2xl mx-auto p-8">
                  {/* Preview content - simplified version */}
                  <div className="text-center mb-8">
                    {managerConfig?.logoUrl ? (
                      <img src={managerConfig.logoUrl} alt="Logo" className="h-16 mx-auto" />
                    ) : (
                      <h1 className="text-2xl font-bold">{managerConfig?.businessName}</h1>
                    )}
                  </div>

                  <div className="text-center mb-8">
                    <h2 className="text-xl font-bold text-gray-900">
                      FACTURA {isDraft ? 'BORRADOR' : invoice.fullNumber}
                    </h2>
                    <p className="text-gray-600">Fecha: {formatDate(invoice.issueDate)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h4 className="text-xs uppercase text-gray-500 mb-2">De</h4>
                      <p className="font-semibold">{managerConfig?.businessName}</p>
                      <p className="text-sm text-gray-600">NIF: {managerConfig?.nif}</p>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase text-gray-500 mb-2">Para</h4>
                      <p className="font-semibold">{getOwnerName(invoice.owner)}</p>
                      <p className="text-sm text-gray-600">{invoice.owner.type === 'EMPRESA' ? 'CIF' : 'NIF'}: {getOwnerNif(invoice.owner)}</p>
                    </div>
                  </div>

                  <table className="w-full text-sm mb-8">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-2">Concepto</th>
                        <th className="text-right py-2">Importe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item, i) => (
                        <tr key={i} className="border-b border-gray-200">
                          <td className="py-2">{item.concept}</td>
                          <td className="py-2 text-right">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="text-right">
                    <p className="text-sm text-gray-600">Base: {formatCurrency(totals.subtotal)}</p>
                    <p className="text-sm text-gray-600">IVA: {formatCurrency(totals.totalVat)}</p>
                    {totals.totalRetention > 0 && (
                      <p className="text-sm text-red-600">Retención: -{formatCurrency(totals.totalRetention)}</p>
                    )}
                    <p className="text-xl font-bold mt-2">Total: {formatCurrency(totals.total)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rectify Modal */}
      <AnimatePresence>
        {showRectify && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Crear Factura Rectificativa</h3>
                    <p className="text-sm text-gray-500">De la factura {invoice.fullNumber}</p>
                  </div>
                </div>
                <button onClick={() => setShowRectify(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Type selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de rectificativa</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRectifyType('SUBSTITUTION')}
                      className={`p-4 rounded-lg border-2 text-left transition-colors ${
                        rectifyType === 'SUBSTITUTION' ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium text-gray-900">Por sustitución</p>
                      <p className="text-xs text-gray-500 mt-1">Reemplaza completamente la factura original</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRectifyType('DIFFERENCE')}
                      className={`p-4 rounded-lg border-2 text-left transition-colors ${
                        rectifyType === 'DIFFERENCE' ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium text-gray-900">Por diferencias</p>
                      <p className="text-xs text-gray-500 mt-1">Solo refleja la diferencia de importes</p>
                    </button>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de rectificación *</label>
                  <textarea
                    value={rectifyReason}
                    onChange={(e) => setRectifyReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    rows={2}
                    placeholder="Ej: Error en el importe de la comisión"
                  />
                </div>

                {/* Items */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {rectifyType === 'SUBSTITUTION' ? 'Nuevas líneas' : 'Líneas de diferencia'}
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {rectifyItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <input
                            type="text"
                            value={item.concept}
                            onChange={(e) => {
                              const updated = [...rectifyItems]
                              updated[index] = { ...updated[index], concept: e.target.value }
                              setRectifyItems(updated)
                            }}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            placeholder="Concepto"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const updated = [...rectifyItems]
                              updated[index] = { ...updated[index], unitPrice: parseFloat(e.target.value) || 0 }
                              setRectifyItems(updated)
                            }}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-right"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-2">
                          <select
                            value={item.vatRate}
                            onChange={(e) => {
                              const updated = [...rectifyItems]
                              updated[index] = { ...updated[index], vatRate: parseInt(e.target.value) }
                              setRectifyItems(updated)
                            }}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value={0}>0%</option>
                            <option value={4}>4%</option>
                            <option value={10}>10%</option>
                            <option value={21}>21%</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={item.retentionRate || 0}
                            onChange={(e) => {
                              const updated = [...rectifyItems]
                              updated[index] = { ...updated[index], retentionRate: parseInt(e.target.value) || 0 }
                              setRectifyItems(updated)
                            }}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-center"
                            placeholder="Ret."
                          />
                        </div>
                        <div className="col-span-1">
                          <button
                            onClick={() => {
                              if (rectifyItems.length > 1) {
                                setRectifyItems(rectifyItems.filter((_, i) => i !== index))
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-500"
                            disabled={rectifyItems.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setRectifyItems([...rectifyItems, { concept: '', quantity: 1, unitPrice: 0, vatRate: 21, retentionRate: 0, total: 0 }])}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Añadir línea
                  </Button>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowRectify(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateRectify}
                  disabled={actionLoading === 'rectify' || !rectifyReason.trim()}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {actionLoading === 'rectify' ? 'Creando...' : 'Crear Rectificativa'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
