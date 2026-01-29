'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  Send,
  Download,
  AlertCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  X,
  CreditCard,
  Eye,
  Mail,
  Check,
  Edit3,
  Printer,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { Button, Card, CardContent, Badge } from '../../../../../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../../../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardFooter } from '../../../../../../../src/components/layout/DashboardFooter'

interface InvoiceItem {
  id: string
  concept: string
  description?: string
  quantity: number
  unitPrice: number
  vatRate: number
  retentionRate: number
  total: number
  reservationId?: string
}

interface PaymentMethod {
  type: string
  label: string
  enabled: boolean
}

interface Invoice {
  id: string
  number?: number
  fullNumber?: string
  propertyId: string
  periodYear: number
  periodMonth: number
  issueDate: string
  dueDate?: string
  issuedAt?: string
  subtotal: number
  totalVat: number
  retentionRate: number
  retentionAmount: number
  total: number
  status: 'DRAFT' | 'PROFORMA' | 'ISSUED' | 'SENT' | 'PAID' | 'CANCELLED'
  isLocked: boolean
  notes?: string
  owner: {
    id: string
    type: string
    firstName?: string
    lastName?: string
    companyName?: string
    email?: string
    nif?: string
    cif?: string
    address?: string
    city?: string
    postalCode?: string
    country?: string
    phone?: string
  }
  property: {
    id: string
    name: string
    city: string
  }
  series: {
    id: string
    name: string
    prefix: string
  }
  items: InvoiceItem[]
}

interface ManagerConfig {
  businessName?: string
  nif?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  email?: string
  phone?: string
  logoUrl?: string
  paymentMethods?: PaymentMethod[]
  defaultPaymentMethod?: string
  iban?: string
  bankName?: string
  bic?: string
  bizumPhone?: string
  paypalEmail?: string
}

const monthNames = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  DRAFT: { label: 'Borrador', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Edit3 },
  PROFORMA: { label: 'Proforma', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: FileText },
  ISSUED: { label: 'Emitida', color: 'text-violet-600', bgColor: 'bg-violet-100', icon: CheckCircle },
  SENT: { label: 'Enviada', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: Mail },
  PAID: { label: 'Pagada', color: 'text-green-600', bgColor: 'bg-green-100', icon: Check },
  CANCELLED: { label: 'Anulada', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle }
}

export default function MonthInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyId = params.propertyId as string
  const year = parseInt(params.year as string)
  const month = parseInt(params.month as string)
  const isUnit = searchParams.get('type') === 'unit'
  const typeParam = isUnit ? '&type=unit' : ''

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [managerConfig, setManagerConfig] = useState<ManagerConfig | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAddItem, setShowAddItem] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [showEditWarning, setShowEditWarning] = useState(false)
  const [hasAcknowledgedWarning, setHasAcknowledgedWarning] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; concept: string } | null>(null)
  const [showIssueConfirm, setShowIssueConfirm] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'general' | 'mensajes' | 'historial'>('general')
  const [detailLevel, setDetailLevel] = useState<'DETAILED' | 'SUMMARY'>('DETAILED')
  const [singleConceptText, setSingleConceptText] = useState('Gestión apartamento turístico')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [newItem, setNewItem] = useState({
    concept: '',
    quantity: '' as string | number,
    unitPrice: '' as string | number,
    vatRate: 21 as string | number,
    retentionRate: '' as string | number
  })

  useEffect(() => {
    fetchInvoice()
  }, [propertyId, year, month, isUnit])

  const fetchInvoice = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/gestion/invoices/property-month?propertyId=${propertyId}&year=${year}&month=${month}${typeParam}`,
        { credentials: 'include' }
      )

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Error al cargar la factura')
        return
      }

      const data = await response.json()
      setInvoice(data.invoice)
      setManagerConfig(data.managerConfig)
      if (data.billingSettings) {
        setDetailLevel(data.billingSettings.detailLevel || 'DETAILED')
        setSingleConceptText(data.billingSettings.singleConceptText || 'Gestión apartamento turístico')
      }
    } catch (err) {
      console.error('Error fetching invoice:', err)
      setError('Error al cargar la factura')
    } finally {
      setLoading(false)
    }
  }

  const regenerateItems = async (newDetailLevel: 'DETAILED' | 'SUMMARY') => {
    if (!invoice || invoice.status !== 'DRAFT') return

    setActionLoading('regenerate')
    try {
      const response = await fetch(
        `/api/gestion/invoices/property-month?propertyId=${propertyId}&year=${year}&month=${month}&detailLevel=${newDetailLevel}&regenerate=true${typeParam}`,
        { credentials: 'include' }
      )

      if (response.ok) {
        const data = await response.json()
        setInvoice(data.invoice)
        setDetailLevel(newDetailLevel)
      } else {
        const data = await response.json()
        alert(data.error || 'Error al regenerar')
      }
    } catch (err) {
      console.error('Error regenerating:', err)
      alert('Error al regenerar')
    } finally {
      setActionLoading(null)
    }
  }

  const saveInvoice = async (showPreviewAfter = true) => {
    if (!invoice) return

    setSaving(true)
    try {
      const response = await fetch(`/api/gestion/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullNumber: invoice.fullNumber,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          notes: invoice.notes,
          items: invoice.items.map((item, index) => ({
            id: item.id,
            concept: item.concept,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            vatRate: item.vatRate,
            retentionRate: item.retentionRate,
            order: index
          }))
        })
      })

      if (response.ok) {
        await fetchInvoice()
        if (showPreviewAfter) {
          setShowPreview(true)
        }
      } else {
        const data = await response.json()
        alert(data.error || 'Error al guardar')
      }
    } catch (err) {
      console.error('Error saving:', err)
      alert('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const confirmIssueInvoice = () => {
    setShowIssueConfirm(true)
  }

  const issueInvoice = async () => {
    if (!invoice) return

    setShowIssueConfirm(false)
    setActionLoading('issue')
    try {
      const response = await fetch(`/api/gestion/invoices/${invoice.id}/issue`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        await fetchInvoice()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al emitir factura')
      }
    } catch (err) {
      console.error('Error issuing:', err)
      alert('Error al emitir factura')
    } finally {
      setActionLoading(null)
    }
  }

  const updateStatus = async (newStatus: string) => {
    if (!invoice) return

    setActionLoading(newStatus)
    try {
      const response = await fetch(`/api/gestion/invoices/${invoice.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await fetchInvoice()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al actualizar estado')
      }
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Error al actualizar estado')
    } finally {
      setActionLoading(null)
    }
  }

  // Email modal state
  const [emailForm, setEmailForm] = useState({
    email: '',
    subject: '',
    message: ''
  })

  const openSendModal = async () => {
    if (!invoice) return

    // Fetch suggested content from API
    setActionLoading('loadingEmail')
    try {
      const response = await fetch(`/api/gestion/invoices/${invoice.id}/send`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setEmailForm({
          email: data.email || '',
          subject: data.suggestedSubject || '',
          message: data.suggestedBody || ''
        })
        setShowSendModal(true)
      }
    } catch (err) {
      console.error('Error loading email data:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const sendEmail = async () => {
    if (!invoice || !emailForm.email) return

    setActionLoading('email')
    try {
      const response = await fetch(`/api/gestion/invoices/${invoice.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: emailForm.email,
          subject: emailForm.subject,
          message: emailForm.message
        })
      })

      if (response.ok) {
        setShowSendModal(false)
        await fetchInvoice()
        alert('Factura enviada correctamente')
      } else {
        const data = await response.json()
        alert(data.error || 'Error al enviar factura')
      }
    } catch (err) {
      console.error('Error sending:', err)
      alert('Error al enviar factura')
    } finally {
      setActionLoading(null)
    }
  }

  const downloadPDF = async () => {
    if (!invoice) return

    setActionLoading('pdf')
    try {
      const response = await fetch(`/api/gestion/invoices/${invoice.id}/pdf`, {
        credentials: 'include'
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${invoice.fullNumber || 'factura'}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
      } else {
        alert('Error al descargar PDF')
      }
    } catch (err) {
      console.error('Error downloading PDF:', err)
      alert('Error al descargar PDF')
    } finally {
      setActionLoading(null)
    }
  }

  const confirmDeleteItem = (itemId: string, concept: string) => {
    setItemToDelete({ id: itemId, concept })
    setShowDeleteConfirm(true)
  }

  const deleteItem = () => {
    if (!invoice || !itemToDelete) return

    const updatedItems = invoice.items.filter(i => i.id !== itemToDelete.id)
    setInvoice({ ...invoice, items: updatedItems })
    setShowDeleteConfirm(false)
    setItemToDelete(null)
  }

  const addItem = () => {
    if (!invoice || !newItem.concept) return

    const quantity = Number(newItem.quantity) || 1
    const unitPrice = Number(newItem.unitPrice) || 0
    const vatRate = Number(newItem.vatRate) || 21
    const retentionRate = Number(newItem.retentionRate) || 0

    const itemTotal = quantity * unitPrice * (1 + vatRate / 100)
    const newItemComplete: InvoiceItem = {
      id: `new-${Date.now()}`,
      concept: newItem.concept,
      quantity,
      unitPrice,
      vatRate,
      retentionRate,
      total: itemTotal
    }

    setInvoice({
      ...invoice,
      items: [...invoice.items, newItemComplete]
    })
    setShowAddItem(false)
    setNewItem({ concept: '', quantity: '', unitPrice: '', vatRate: 21, retentionRate: '' })
  }

  // Check if edit warning should be shown
  const checkEditWarning = (callback: () => void) => {
    if (hasAcknowledgedWarning) {
      callback()
    } else {
      setShowEditWarning(true)
    }
  }

  const acknowledgeWarningAndProceed = () => {
    setHasAcknowledgedWarning(true)
    setShowEditWarning(false)
  }

  const resetMonth = async () => {
    setResetting(true)
    try {
      const response = await fetch('/api/gestion/reservations/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          propertyId,
          year,
          month
        })
      })

      const data = await response.json()

      if (response.ok) {
        setShowResetConfirm(false)
        // Redirect back to property page
        router.push(`/gestion/facturacion/${propertyId}`)
      } else {
        alert(data.error || 'Error al eliminar reservas')
      }
    } catch (err) {
      console.error('Error resetting month:', err)
      alert('Error al eliminar reservas')
    } finally {
      setResetting(false)
    }
  }

  const updateItem = (itemId: string, updates: Partial<InvoiceItem>) => {
    if (!invoice) return

    // If this is a significant value change (price/quantity), show warning first time
    if (!hasAcknowledgedWarning && (updates.unitPrice !== undefined || updates.quantity !== undefined)) {
      setShowEditWarning(true)
      return
    }

    const updatedItems = invoice.items.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, ...updates }
        // Use 0 for NaN values when calculating total
        const qty = Number(updated.quantity) || 0
        const price = Number(updated.unitPrice) || 0
        const vat = Number(updated.vatRate) || 0
        updated.total = qty * price * (1 + vat / 100)
        return updated
      }
      return item
    })

    setInvoice({ ...invoice, items: updatedItems })
  }

  const calculateTotals = () => {
    if (!invoice) return { subtotal: 0, totalVat: 0, totalRetention: 0, total: 0 }

    let subtotal = 0
    let totalVat = 0
    let totalRetention = 0

    invoice.items.forEach(item => {
      const base = item.quantity * item.unitPrice
      subtotal += base
      totalVat += base * (item.vatRate / 100)
      totalRetention += base * (item.retentionRate / 100)
    })

    return {
      subtotal,
      totalVat,
      totalRetention,
      total: subtotal + totalVat - totalRetention
    }
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€'
  }

  const formatIBAN = (iban: string) => {
    return iban.replace(/(.{4})/g, '$1 ').trim()
  }

  const totals = calculateTotals()
  const isEditable = invoice?.status === 'DRAFT'
  const statusConfig = invoice ? STATUS_CONFIG[invoice.status] : STATUS_CONFIG.DRAFT
  const isCompany = invoice?.owner.type === 'EMPRESA' || invoice?.owner.type === 'PERSONA_JURIDICA'
  const enabledPaymentMethods = managerConfig?.paymentMethods?.filter(pm => pm.enabled) || []

  if (loading) {
    return <AnimatedLoadingSpinner text="Cargando factura..." type="general" />
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Link href="/gestion/facturacion">
                <Button variant="outline">Volver a Facturación</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!invoice) return null

  const ownerName = isCompany
    ? invoice.owner.companyName
    : `${invoice.owner.firstName || ''} ${invoice.owner.lastName || ''}`.trim()

  // Preview Modal Component - Holded Style
  const PreviewModal = () => (
    <AnimatePresence>
      {showPreview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex bg-black/50"
          onClick={() => setShowPreview(false)}
        >
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="flex w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Side - Invoice Preview */}
            <div className="flex-1 bg-gray-100 overflow-auto p-4 sm:p-8 relative">
              {/* Close button - mobile */}
              <button
                onClick={() => setShowPreview(false)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors sm:hidden z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
                {/* Invoice Header */}
                <div className="p-6 sm:p-8 border-b border-gray-200">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      {managerConfig?.logoUrl ? (
                        <img src={managerConfig.logoUrl} alt="Logo" className="h-12 sm:h-14 mb-3 object-contain" />
                      ) : (
                        <div className="text-xl font-bold text-gray-900 mb-3">
                          {managerConfig?.businessName || 'Mi Empresa'}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {managerConfig?.businessName && (
                        <p className="font-medium text-gray-900">{managerConfig.businessName}</p>
                      )}
                      {managerConfig?.nif && <p>{managerConfig.nif}</p>}
                      {managerConfig?.address && <p>{managerConfig.address}</p>}
                      {managerConfig?.city && (
                        <p>{managerConfig.postalCode}, {managerConfig.city}, {managerConfig.country}</p>
                      )}
                      {managerConfig?.email && <p>{managerConfig.email}</p>}
                      {managerConfig?.phone && <p>{managerConfig.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Invoice Number + Client + Total */}
                <div className="p-6 sm:p-8 border-b border-gray-200">
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">FACTURA #{invoice.fullNumber || 'BORRADOR'}</p>
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <p>Fecha: {new Date(invoice.issueDate).toLocaleDateString('es-ES')}</p>
                        {invoice.dueDate && (
                          <p>Vencimiento: {new Date(invoice.dueDate).toLocaleDateString('es-ES')}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl sm:text-3xl font-light text-gray-900">Total {formatCurrency(totals.total)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">{ownerName}</p>
                    {(invoice.owner.nif || invoice.owner.cif) && (
                      <p className="text-sm text-gray-600">{isCompany ? invoice.owner.cif : invoice.owner.nif}</p>
                    )}
                    {invoice.owner.address && <p className="text-sm text-gray-600">{invoice.owner.address}</p>}
                    {(invoice.owner.postalCode || invoice.owner.city) && (
                      <p className="text-sm text-gray-600">
                        {invoice.owner.postalCode && `${invoice.owner.postalCode}, `}
                        {invoice.owner.city}, {invoice.owner.country}
                      </p>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <div className="p-6 sm:p-8">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                        <th className="py-2 text-left font-medium">Concepto</th>
                        <th className="py-2 text-right font-medium">Precio</th>
                        <th className="py-2 text-center font-medium">Uds.</th>
                        <th className="py-2 text-right font-medium">Subtotal</th>
                        <th className="py-2 text-center font-medium">IVA</th>
                        <th className="py-2 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-3">
                            <span className="text-gray-900">{item.concept}</span>
                            {item.description && (
                              <p className="text-xs text-gray-500">{item.description}</p>
                            )}
                          </td>
                          <td className="py-3 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                          <td className="py-3 text-right text-gray-600">{formatCurrency(item.unitPrice * item.quantity)}</td>
                          <td className="py-3 text-center text-gray-600">{item.vatRate}%</td>
                          <td className="py-3 text-right font-medium text-gray-900">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals Summary */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-xs sm:text-sm">
                      <div>
                        <p className="text-gray-500 uppercase tracking-wider text-xs mb-1">Base imponible</p>
                        <p className="font-medium">{formatCurrency(totals.subtotal)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 uppercase tracking-wider text-xs mb-1">Impuesto</p>
                        <p className="text-gray-600">IVA {invoice.items[0]?.vatRate || 21}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500 uppercase tracking-wider text-xs mb-1">Total impuesto</p>
                        <p className="font-medium">{formatCurrency(totals.totalVat)}</p>
                      </div>
                    </div>
                    {totals.totalRetention > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                        <span className="text-red-600">Retención</span>
                        <span className="text-red-600 font-medium">-{formatCurrency(totals.totalRetention)}</span>
                      </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-gray-300 flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-bold">{formatCurrency(totals.total)}</span>
                    </div>
                  </div>
                </div>

                {/* PDF Download */}
                <div className="px-6 sm:px-8 pb-6">
                  <button
                    onClick={downloadPDF}
                    disabled={actionLoading === 'pdf'}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Action Panel */}
            <div className="w-full sm:w-80 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
              {/* Close button - desktop */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div />
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                {(['general', 'mensajes', 'historial'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? 'text-gray-900 border-b-2 border-gray-900 bg-white'
                        : 'text-gray-500 hover:text-gray-700 bg-gray-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-auto">
                {activeTab === 'general' && (
                  <div className="p-4 space-y-6">
                    {/* Total */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total</span>
                      <span className="text-xl font-semibold text-gray-900">{formatCurrency(totals.total)}</span>
                    </div>

                    {/* Document Info */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Número de documento</span>
                        <span className="text-sm font-medium">{invoice.fullNumber || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Contacto</span>
                        <Link href="/gestion/clientes" className="text-sm text-blue-600 hover:underline">
                          {ownerName}
                        </Link>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Fecha</span>
                        <span className="text-sm">{new Date(invoice.issueDate).toLocaleDateString('es-ES')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Vencimiento</span>
                        <span className="text-sm text-gray-400">
                          {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('es-ES') : '-'}
                        </span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100" />

                    {/* Pagos */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">Pagos</span>
                        {invoice.status !== 'PAID' && (
                          <button
                            onClick={() => updateStatus('PAID')}
                            disabled={actionLoading === 'PAID'}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {actionLoading === 'PAID' ? 'Registrando...' : 'Añadir pago'}
                          </button>
                        )}
                      </div>
                      {invoice.status === 'PAID' ? (
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                          <Check className="w-4 h-4" />
                          <span>Pagada</span>
                        </div>
                      ) : (
                        <div className="flex justify-between text-sm">
                          <span className="text-amber-600">Pendiente de pago</span>
                          <span className="text-amber-600 font-medium">{formatCurrency(totals.total)}</span>
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100" />

                    {/* Vencimiento */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">Vencimiento</span>
                        {invoice.status === 'DRAFT' && (
                          <button
                            onClick={() => setShowPreview(false)}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Editar
                          </button>
                        )}
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Fecha</span>
                        <p className="text-gray-900">
                          {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('es-ES') : 'No definido'}
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100" />

                    {/* Método de pago */}
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Método de pago</span>
                        <button className="text-sm text-blue-600 hover:underline">Cambiar</button>
                      </div>
                      {enabledPaymentMethods.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          {enabledPaymentMethods.map((pm) => (
                            <div key={pm.type}>
                              {pm.type === 'TRANSFER' && managerConfig?.iban && (
                                <p>Transferencia: {formatIBAN(managerConfig.iban)}</p>
                              )}
                              {pm.type === 'BIZUM' && managerConfig?.bizumPhone && (
                                <p>Bizum: {managerConfig.bizumPhone}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100" />

                    {/* Emails */}
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Emails</span>
                        <button
                          onClick={openSendModal}
                          disabled={actionLoading === 'loadingEmail' || invoice.status === 'DRAFT'}
                          className={`text-sm hover:underline ${
                            invoice.status === 'DRAFT' || !invoice.owner.email
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-blue-600'
                          }`}
                        >
                          {actionLoading === 'email' ? 'Enviando...' : 'Enviar vía email'}
                        </button>
                      </div>
                      {!invoice.owner.email && (
                        <p className="text-xs text-amber-600 mt-1">Sin email configurado</p>
                      )}
                      {invoice.status === 'SENT' && (
                        <p className="text-xs text-green-600 mt-1">Email enviado</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'mensajes' && (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    <Mail className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No hay mensajes</p>
                  </div>
                )}

                {activeTab === 'historial' && (
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${statusConfig.bgColor}`} />
                      <div className="text-sm">
                        <p className="text-gray-900">Estado: {statusConfig.label}</p>
                        <p className="text-gray-500 text-xs">
                          {invoice.issuedAt
                            ? new Date(invoice.issuedAt).toLocaleString('es-ES')
                            : new Date(invoice.issueDate).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    {invoice.status !== 'DRAFT' && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full mt-1.5 bg-gray-300" />
                        <div className="text-sm">
                          <p className="text-gray-900">Factura creada</p>
                          <p className="text-gray-500 text-xs">
                            {new Date(invoice.issueDate).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="p-4 border-t border-gray-200 space-y-2">
                {invoice.status === 'DRAFT' && (
                  <>
                    <Button
                      onClick={() => setShowPreview(false)}
                      variant="outline"
                      className="w-full"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Editar factura
                    </Button>
                    <Button
                      onClick={confirmIssueInvoice}
                      disabled={actionLoading === 'issue' || invoice.items.length === 0 || invoice.total <= 0}
                      className="w-full bg-violet-600 hover:bg-violet-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {actionLoading === 'issue' ? 'Emitiendo...' : 'Emitir factura'}
                    </Button>
                  </>
                )}

                {invoice.status === 'ISSUED' && (
                  <>
                    <Button
                      onClick={openSendModal}
                      disabled={actionLoading === 'loadingEmail'}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {actionLoading === 'loadingEmail' ? 'Cargando...' : 'Enviar por email'}
                    </Button>
                    <Button
                      onClick={() => updateStatus('PAID')}
                      disabled={actionLoading === 'PAID'}
                      variant="outline"
                      className="w-full"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {actionLoading === 'PAID' ? 'Registrando...' : 'Marcar como pagada'}
                    </Button>
                  </>
                )}

                {invoice.status === 'SENT' && (
                  <Button
                    onClick={() => updateStatus('PAID')}
                    disabled={actionLoading === 'PAID'}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {actionLoading === 'PAID' ? 'Registrando...' : 'Marcar como pagada'}
                  </Button>
                )}

                {invoice.status === 'PAID' && (
                  <div className="flex items-center justify-center gap-2 py-3 text-green-600 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Factura pagada</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Send Email Modal Component
  const SendEmailModal = () => (
    <AnimatePresence>
      {showSendModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowSendModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Enviar factura por email</h3>
                <button
                  onClick={() => setShowSendModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destinatario
                </label>
                <input
                  type="email"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                  placeholder="email@ejemplo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asunto
                </label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje
                </label>
                <textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  El cliente recibirá un enlace para ver y descargar la factura
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSendModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={sendEmail}
                disabled={actionLoading === 'email' || !emailForm.email}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                {actionLoading === 'email' ? 'Enviando...' : 'Enviar factura'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Edit Warning Modal Component
  const EditWarningModal = () => (
    <AnimatePresence>
      {showEditWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowEditWarning(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with warning icon */}
            <div className="p-6 bg-amber-50 border-b border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-amber-900">Atención</h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Si modificas manualmente los importes de la factura <strong>sin añadir las reservas o gastos correspondientes</strong>, las cuentas pueden descuadrarse.
              </p>
              <p className="text-sm text-gray-500">
                Los cambios manuales no se reflejarán automáticamente en los informes de rentabilidad ni en las liquidaciones.
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEditWarning(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={acknowledgeWarningAndProceed}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Entendido, continuar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Delete Confirmation Modal Component
  const DeleteConfirmModal = () => (
    <AnimatePresence>
      {showDeleteConfirm && itemToDelete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            setShowDeleteConfirm(false)
            setItemToDelete(null)
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with trash icon */}
            <div className="p-6 bg-red-50 border-b border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-900">Eliminar línea</h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-2">
                ¿Estás seguro de que quieres eliminar esta línea de la factura?
              </p>
              <div className="bg-gray-50 rounded-lg p-3 mt-3">
                <p className="text-sm font-medium text-gray-900">{itemToDelete.concept}</p>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Esta acción no se puede deshacer.
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setItemToDelete(null)
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={deleteItem}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Issue Confirmation Modal Component
  const IssueConfirmModal = () => (
    <AnimatePresence>
      {showIssueConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowIssueConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with warning icon */}
            <div className="p-6 bg-violet-50 border-b border-violet-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="text-lg font-semibold text-violet-900">Emitir factura</h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                ¿Estás seguro de que quieres emitir esta factura?
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 mb-1">
                      Acción irreversible
                    </p>
                    <p className="text-sm text-amber-800">
                      Una vez emitida, la factura <strong>no podrá ser editada ni eliminada</strong>.
                      Solo podrás crear una factura rectificativa si necesitas hacer correcciones.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">
                  <strong>Número de factura:</strong> {invoice?.fullNumber || 'Se asignará automáticamente'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Total:</strong> {formatCurrency(totals.total)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowIssueConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={issueInvoice}
                disabled={actionLoading === 'issue'}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {actionLoading === 'issue' ? 'Emitiendo...' : 'Sí, emitir factura'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <PreviewModal />
      <SendEmailModal />
      <EditWarningModal />
      <DeleteConfirmModal />
      <IssueConfirmModal />

      {/* Reset Month Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowResetConfirm(false)}
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
                  <h3 className="text-lg font-semibold text-red-900">Resetear mes</h3>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  ¿Estás seguro de que quieres eliminar todas las reservas de <strong>{monthNames[month]} {year}</strong> para esta propiedad?
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-amber-800">
                        Las reservas se eliminarán y podrás volver a importarlas con la configuración correcta.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowResetConfirm(false)}
                  disabled={resetting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={resetMonth}
                  disabled={resetting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {resetting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar reservas
                    </>
                  )}
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
              href={`/gestion/facturacion/${propertyId}`}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-4 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Volver a <strong>{invoice.property.name}</strong></span>
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {invoice.fullNumber || `Factura ${monthNames[month]} ${year}`}
                  </h1>
                  <Badge className={`${statusConfig.bgColor} ${statusConfig.color}`}>
                    {statusConfig.label}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {invoice.property.name} • {monthNames[month]} {year}
                </p>
              </div>

              <div className="flex gap-2">
                {isEditable ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowResetConfirm(true)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Resetear mes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(true)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Vista previa
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => saveInvoice(true)}
                      disabled={saving}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {saving ? 'Guardando...' : 'Guardar y revisar'}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(true)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver factura
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Invoice Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden">
              <CardContent className="p-0">
                {/* Header - Logo + Dates in line */}
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

                    {/* Dates in horizontal line */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Fecha:</span>
                        {isEditable ? (
                          <input
                            type="date"
                            value={invoice.issueDate?.split('T')[0] || ''}
                            onChange={(e) => setInvoice({ ...invoice, issueDate: e.target.value })}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        ) : (
                          <span className="font-medium text-gray-900">
                            {new Date(invoice.issueDate).toLocaleDateString('es-ES')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Vencimiento:</span>
                        {isEditable ? (
                          <input
                            type="date"
                            value={invoice.dueDate?.split('T')[0] || ''}
                            min={invoice.issueDate?.split('T')[0] || ''}
                            onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        ) : (
                          <span className="font-medium text-gray-900">
                            {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('es-ES') : '-'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Issuer Info + Invoice Number */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="text-sm text-gray-600 leading-relaxed">
                      {managerConfig?.businessName && managerConfig?.logoUrl && (
                        <p className="font-semibold text-gray-900">{managerConfig.businessName}</p>
                      )}
                      {managerConfig?.nif && <p>NIF: {managerConfig.nif}</p>}
                      {managerConfig?.address && <p>{managerConfig.address}</p>}
                      {managerConfig?.city && (
                        <p>{managerConfig.postalCode} {managerConfig.city}, {managerConfig.country}</p>
                      )}
                      {(managerConfig?.email || managerConfig?.phone) && (
                        <p className="mt-1">{[managerConfig.email, managerConfig.phone].filter(Boolean).join(' · ')}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs uppercase tracking-wider text-gray-500">Factura Nº</span>
                      {isEditable ? (
                        <div className="mt-1">
                          <input
                            type="text"
                            value={invoice.fullNumber || ''}
                            onChange={(e) => setInvoice({ ...invoice, fullNumber: e.target.value || undefined })}
                            placeholder="Ej: F260001"
                            className="text-xl font-bold text-gray-900 text-right border-b border-gray-300 focus:border-violet-500 outline-none w-32 bg-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">Vacío = automático</p>
                        </div>
                      ) : (
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {invoice.fullNumber || <span className="text-gray-400">Pendiente</span>}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recipient Info + Total */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Facturar a</h3>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <p className="font-semibold text-gray-900 text-base">{ownerName || 'Sin nombre'}</p>
                      {(invoice.owner.nif || invoice.owner.cif) && (
                        <p>{isCompany ? 'CIF' : 'NIF'}: {isCompany ? invoice.owner.cif : invoice.owner.nif}</p>
                      )}
                      {invoice.owner.address ? (
                        <p>{invoice.owner.address}</p>
                      ) : (
                        <p className="text-amber-600 text-xs">Sin dirección</p>
                      )}
                      {(invoice.owner.postalCode || invoice.owner.city) ? (
                        <p>
                          {invoice.owner.postalCode && `${invoice.owner.postalCode} `}
                          {invoice.owner.city}
                          {invoice.owner.country && `, ${invoice.owner.country}`}
                        </p>
                      ) : (
                        <p className="text-amber-600 text-xs">Sin ciudad/CP</p>
                      )}
                      {invoice.owner.email && <p className="text-gray-500 mt-1">{invoice.owner.email}</p>}
                    </div>
                    {(!invoice.owner.address || !invoice.owner.city) && (
                      <Link
                        href="/gestion/clientes"
                        className="text-xs text-violet-600 hover:underline mt-2 inline-block"
                      >
                        Completar datos del propietario
                      </Link>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Total</p>
                    <p className="text-3xl font-light text-gray-900">{formatCurrency(totals.total)}</p>
                  </div>
                </div>

                {/* Detail Level Toggle */}
                {isEditable && (
                  <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700">Formato de factura:</span>
                        <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                          <button
                            onClick={() => detailLevel !== 'DETAILED' && regenerateItems('DETAILED')}
                            disabled={actionLoading === 'regenerate'}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                              detailLevel === 'DETAILED'
                                ? 'bg-violet-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            Desglosada
                          </button>
                          <button
                            onClick={() => detailLevel !== 'SUMMARY' && regenerateItems('SUMMARY')}
                            disabled={actionLoading === 'regenerate'}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                              detailLevel === 'SUMMARY'
                                ? 'bg-violet-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            Simplificada
                          </button>
                        </div>
                        <button
                          onClick={() => regenerateItems(detailLevel)}
                          disabled={actionLoading === 'regenerate'}
                          className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors border border-gray-200 flex items-center gap-1.5"
                          title="Regenerar factura con datos actuales"
                        >
                          <RefreshCw className={`w-4 h-4 ${actionLoading === 'regenerate' ? 'animate-spin' : ''}`} />
                          Regenerar
                        </button>
                        {actionLoading === 'regenerate' && (
                          <span className="text-sm text-gray-500">Regenerando...</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {detailLevel === 'DETAILED'
                          ? 'Una línea por cada reserva'
                          : 'Un concepto único para todas las reservas'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="p-6">
                  <div className="grid grid-cols-12 gap-2 text-xs uppercase tracking-wider text-gray-500 pb-3 border-b border-gray-200">
                    <div className="col-span-4">Concepto</div>
                    <div className="col-span-2 text-right">Precio</div>
                    <div className="col-span-1 text-center">Uds.</div>
                    <div className="col-span-1 text-center">IVA</div>
                    <div className="col-span-1 text-center">Ret.</div>
                    <div className="col-span-3 text-right">Total</div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {invoice.items.map((item) => (
                      <div key={item.id} className="py-3 grid grid-cols-12 gap-2 items-center group">
                        <div className="col-span-4">
                          {isEditable ? (
                            <input
                              type="text"
                              value={item.concept}
                              onChange={(e) => updateItem(item.id, { concept: e.target.value })}
                              className="w-full text-sm font-medium text-gray-900 border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-violet-500"
                            />
                          ) : (
                            <span className="font-medium text-gray-900">{item.concept}</span>
                          )}
                        </div>
                        <div className="col-span-2 text-right">
                          {isEditable ? (
                            <input
                              type="text"
                              inputMode="decimal"
                              value={item.unitPrice}
                              onChange={(e) => {
                                const val = e.target.value
                                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                  updateItem(item.id, { unitPrice: val === '' ? '' as any : parseFloat(val) || 0 })
                                }
                              }}
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value) || 0
                                updateItem(item.id, { unitPrice: Math.round(val * 100) / 100 })
                              }}
                              className="w-full text-sm border border-gray-200 rounded px-2 py-1 text-right focus:ring-1 focus:ring-violet-500"
                            />
                          ) : (
                            <span className="text-sm">{formatCurrency(item.unitPrice)}</span>
                          )}
                        </div>
                        <div className="col-span-1 text-center">
                          {isEditable ? (
                            <input
                              type="text"
                              inputMode="numeric"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = e.target.value
                                if (val === '' || /^\d*$/.test(val)) {
                                  updateItem(item.id, { quantity: val === '' ? '' as any : parseInt(val) || 1 })
                                }
                              }}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value) || 1
                                updateItem(item.id, { quantity: val })
                              }}
                              className="w-full text-sm border border-gray-200 rounded px-1 py-1 text-center focus:ring-1 focus:ring-violet-500"
                            />
                          ) : (
                            <span className="text-sm">{item.quantity}</span>
                          )}
                        </div>
                        <div className="col-span-1 text-center">
                          {isEditable ? (
                            <input
                              type="text"
                              inputMode="numeric"
                              value={item.vatRate}
                              onChange={(e) => {
                                const val = e.target.value
                                if (val === '' || /^\d*$/.test(val)) {
                                  updateItem(item.id, { vatRate: val === '' ? '' as any : parseInt(val) || 0 })
                                }
                              }}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value) || 21
                                updateItem(item.id, { vatRate: val })
                              }}
                              className="w-full text-sm border border-gray-200 rounded px-1 py-1 text-center focus:ring-1 focus:ring-violet-500"
                            />
                          ) : (
                            <span className="text-sm text-gray-600">{item.vatRate}%</span>
                          )}
                        </div>
                        <div className="col-span-1 text-center">
                          {isEditable ? (
                            <input
                              type="text"
                              inputMode="decimal"
                              value={item.retentionRate}
                              onChange={(e) => {
                                const val = e.target.value
                                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                  updateItem(item.id, { retentionRate: val === '' ? '' as any : parseFloat(val) || 0 })
                                }
                              }}
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value) || 0
                                updateItem(item.id, { retentionRate: Math.round(val * 100) / 100 })
                              }}
                              className="w-full text-sm border border-gray-200 rounded px-1 py-1 text-center focus:ring-1 focus:ring-violet-500"
                            />
                          ) : (
                            <span className={`text-sm ${item.retentionRate > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                              {item.retentionRate > 0 ? `${item.retentionRate}%` : '0%'}
                            </span>
                          )}
                        </div>
                        <div className="col-span-3 text-right font-medium flex items-center justify-end gap-2">
                          <span>{formatCurrency(item.total)}</span>
                          {isEditable && (
                            <button
                              onClick={() => confirmDeleteItem(item.id, item.concept)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Item */}
                  {isEditable && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {showAddItem ? (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-12 gap-4 items-end">
                            <div className="col-span-4">
                              <label className="block text-xs text-gray-500 mb-1">Concepto</label>
                              <input
                                type="text"
                                value={newItem.concept}
                                onChange={(e) => setNewItem({ ...newItem, concept: e.target.value })}
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
                                placeholder="Concepto..."
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs text-gray-500 mb-1">Precio</label>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={newItem.unitPrice}
                                onChange={(e) => {
                                  const val = e.target.value
                                  if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                    setNewItem({ ...newItem, unitPrice: val })
                                  }
                                }}
                                placeholder="0.00"
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
                              />
                            </div>
                            <div className="col-span-1">
                              <label className="block text-xs text-gray-500 mb-1">Uds.</label>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={newItem.quantity}
                                onChange={(e) => {
                                  const val = e.target.value
                                  if (val === '' || /^\d*$/.test(val)) {
                                    setNewItem({ ...newItem, quantity: val })
                                  }
                                }}
                                placeholder="1"
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
                              />
                            </div>
                            <div className="col-span-1">
                              <label className="block text-xs text-gray-500 mb-1">IVA %</label>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={newItem.vatRate}
                                onChange={(e) => {
                                  const val = e.target.value
                                  if (val === '' || /^\d*$/.test(val)) {
                                    setNewItem({ ...newItem, vatRate: val })
                                  }
                                }}
                                placeholder="21"
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
                              />
                            </div>
                            <div className="col-span-1">
                              <label className="block text-xs text-gray-500 mb-1">Ret. %</label>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={newItem.retentionRate}
                                onChange={(e) => {
                                  const val = e.target.value
                                  if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                    setNewItem({ ...newItem, retentionRate: val })
                                  }
                                }}
                                placeholder="0"
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
                              />
                            </div>
                            <div className="col-span-3 flex gap-2">
                              <Button size="sm" onClick={addItem} className="flex-1">
                                <Plus className="w-4 h-4 mr-1" /> Añadir
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setShowAddItem(false)}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowAddItem(true)}
                          className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Añadir línea
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="p-8 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Base imponible</span>
                        <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">IVA</span>
                        <span className="font-medium">{formatCurrency(totals.totalVat)}</span>
                      </div>
                      {totals.totalRetention > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Retención</span>
                          <span className="font-medium text-red-600">-{formatCurrency(totals.totalRetention)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg pt-2 border-t border-gray-300">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-violet-600">{formatCurrency(totals.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                {managerConfig && (managerConfig.iban || managerConfig.bizumPhone || managerConfig.paypalEmail) && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-blue-50">
                    <h4 className="text-xs uppercase tracking-wider text-blue-800 mb-2 font-medium">Métodos de pago</h4>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {managerConfig.iban && (
                        <div className="flex items-center gap-2">
                          <span className="text-blue-700">IBAN:</span>
                          <span className="font-mono text-blue-900">{managerConfig.iban.replace(/(.{4})/g, '$1 ').trim()}</span>
                          {managerConfig.bankName && <span className="text-blue-600">({managerConfig.bankName})</span>}
                        </div>
                      )}
                      {managerConfig.bizumPhone && (
                        <div className="flex items-center gap-2">
                          <span className="text-blue-700">Bizum:</span>
                          <span className="font-medium text-blue-900">{managerConfig.bizumPhone}</span>
                        </div>
                      )}
                      {managerConfig.paypalEmail && (
                        <div className="flex items-center gap-2">
                          <span className="text-blue-700">PayPal:</span>
                          <span className="font-medium text-blue-900">{managerConfig.paypalEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {isEditable && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                      Notas (opcional)
                    </label>
                    <textarea
                      value={invoice.notes || ''}
                      onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                      rows={2}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Notas adicionales para la factura..."
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  )
}
