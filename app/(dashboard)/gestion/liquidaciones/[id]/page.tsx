'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Receipt,
  User,
  Calendar,
  Download,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  Euro,
  Home,
  Loader2,
  CreditCard,
  MoreVertical,
  Trash2,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import { AnimatedLoadingSpinner } from '@/components/ui/AnimatedLoadingSpinner'
import { formatCurrency } from '@/lib/format'

interface Reservation {
  id: string
  confirmationCode: string
  guestName: string
  checkIn: string
  checkOut: string
  nights: number
  platform: string
  hostEarnings: number
  property: string
}

interface Expense {
  id: string
  date: string
  concept: string
  category: string
  amount: number
  vatAmount: number
  property: string
}

interface Owner {
  id: string
  type: string
  name: string
  nif?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  iban?: string
}

interface Totals {
  totalIncome: number
  totalCommission: number
  totalCommissionVat: number
  totalCleaning: number
  totalExpenses: number
  totalAmount: number
}

interface Liquidation {
  id: string
  year: number
  month: number
  status: 'DRAFT' | 'GENERATED' | 'SENT' | 'PAID' | 'CANCELLED'
  owner: Owner
  totals: Totals
  invoiceNumber?: string
  invoiceDate?: string
  paidAt?: string
  paymentMethod?: string
  paymentReference?: string
  notes?: string
  pdfUrl?: string
  createdAt: string
  updatedAt: string
  reservations: Reservation[]
  expenses: Expense[]
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const STATUS_CONFIG = {
  DRAFT: { label: 'Borrador', color: 'bg-gray-100 text-gray-700', icon: Clock },
  GENERATED: { label: 'Generada', color: 'bg-blue-100 text-blue-700', icon: FileText },
  SENT: { label: 'Enviada', color: 'bg-violet-100 text-violet-700', icon: Send },
  PAID: { label: 'Pagada', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-700', icon: XCircle }
}

const EXPENSE_CATEGORIES: Record<string, string> = {
  MAINTENANCE: 'Mantenimiento',
  SUPPLIES: 'Suministros',
  REPAIR: 'Reparaciones',
  CLEANING: 'Limpieza',
  FURNITURE: 'Mobiliario',
  TAXES: 'Impuestos',
  INSURANCE: 'Seguros',
  OTHER: 'Otros'
}

export default function LiquidacionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [liquidation, setLiquidation] = useState<Liquidation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentReference, setPaymentReference] = useState('')
  const [creatingInvoice, setCreatingInvoice] = useState(false)
  const [sendingLink, setSendingLink] = useState(false)
  const [linkSent, setLinkSent] = useState<{ type: 'email' | 'whatsapp', url?: string } | null>(null)
  const [recalculating, setRecalculating] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchLiquidation()
    }
  }, [params.id])

  const fetchLiquidation = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gestion/liquidations/${params.id}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setLiquidation(data.liquidation)
      } else {
        setError('Liquidación no encontrada')
      }
    } catch (error) {
      console.error('Error fetching liquidation:', error)
      setError('Error al cargar la liquidación')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = () => {
    window.open(`/api/gestion/liquidations/${params.id}/pdf`, '_blank')
  }

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setUpdating(true)
      const body: any = { status: newStatus }

      if (newStatus === 'PAID' && paymentMethod) {
        body.paymentMethod = paymentMethod
        body.paymentReference = paymentReference
      }

      const response = await fetch(`/api/gestion/liquidations/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      })

      if (response.ok) {
        fetchLiquidation()
        setShowPaymentModal(false)
        setPaymentMethod('')
        setPaymentReference('')
      } else {
        const data = await response.json()
        setError(data.error || 'Error al actualizar')
      }
    } catch (error) {
      console.error('Error updating liquidation:', error)
      setError('Error al actualizar la liquidación')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      const response = await fetch(`/api/gestion/liquidations/${params.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        router.push('/gestion/liquidaciones')
      } else {
        const data = await response.json()
        setError(data.error || 'Error al eliminar')
      }
    } catch (error) {
      console.error('Error deleting liquidation:', error)
      setError('Error al eliminar la liquidación')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleRecalculate = async () => {
    try {
      setRecalculating(true)
      const response = await fetch(`/api/gestion/liquidations/${params.id}/recalculate`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        await fetchLiquidation()
      } else {
        const data = await response.json()
        setError(data.error || 'Error al recalcular')
      }
    } catch (error) {
      console.error('Error recalculating:', error)
      setError('Error al recalcular la liquidación')
    } finally {
      setRecalculating(false)
    }
  }

  const handleCreateInvoice = async () => {
    try {
      setCreatingInvoice(true)
      const response = await fetch(`/api/gestion/liquidations/${params.id}/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/gestion/facturas/${data.invoice.id}`)
      } else {
        const data = await response.json()
        setError(data.error || 'Error al crear factura')
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      setError('Error al crear la factura')
    } finally {
      setCreatingInvoice(false)
    }
  }

  const handleSendToOwner = async (method: 'email' | 'whatsapp') => {
    if (!liquidation) return

    try {
      setSendingLink(true)
      setLinkSent(null)

      const response = await fetch(`/api/gestion/owners/${liquidation.owner.id}/send-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          month: liquidation.month,
          year: liquidation.year,
          sendEmail: method === 'email'
        })
      })

      if (response.ok) {
        const data = await response.json()

        if (method === 'whatsapp') {
          // Open WhatsApp with the link
          const phone = liquidation.owner.phone?.replace(/\D/g, '') || ''
          const message = encodeURIComponent(
            `Hola ${liquidation.owner.name.split(' ')[0]}, aquí tienes el resumen de ${MONTHS[liquidation.month - 1]} ${liquidation.year}:\n\n${data.portalUrl}`
          )
          const whatsappUrl = phone
            ? `https://wa.me/${phone.startsWith('34') ? phone : '34' + phone}?text=${message}`
            : `https://wa.me/?text=${message}`
          window.open(whatsappUrl, '_blank')
          setLinkSent({ type: 'whatsapp', url: data.portalUrl })
        } else {
          setLinkSent({ type: 'email' })
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Error al enviar')
      }
    } catch (error) {
      console.error('Error sending link:', error)
      setError('Error al enviar el enlace')
    } finally {
      setSendingLink(false)
    }
  }

  // Group reservations by property
  const reservationsByProperty = useMemo(() => {
    if (!liquidation) return []
    const grouped = new Map<string, Reservation[]>()
    for (const res of liquidation.reservations) {
      const existing = grouped.get(res.property) || []
      grouped.set(res.property, [...existing, res])
    }
    return Array.from(grouped.entries()).map(([property, reservations]) => ({
      property,
      reservations,
      subtotal: reservations.reduce((sum, r) => sum + r.hostEarnings, 0)
    }))
  }, [liquidation])

  // Group expenses by property
  const expensesByProperty = useMemo(() => {
    if (!liquidation) return []
    const grouped = new Map<string, Expense[]>()
    for (const exp of liquidation.expenses) {
      const existing = grouped.get(exp.property) || []
      grouped.set(exp.property, [...existing, exp])
    }
    return Array.from(grouped.entries()).map(([property, expenses]) => ({
      property,
      expenses,
      subtotal: expenses.reduce((sum, e) => sum + e.amount + e.vatAmount, 0)
    }))
  }, [liquidation])

  if (loading) {
    return <AnimatedLoadingSpinner text="Cargando liquidación..." type="general" />
  }

  if (error || !liquidation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Liquidación no encontrada'}
            </p>
            <Link href="/gestion/liquidaciones">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a liquidaciones
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const StatusIcon = STATUS_CONFIG[liquidation.status].icon
  const canEdit = ['DRAFT', 'GENERATED'].includes(liquidation.status)
  const canDelete = ['DRAFT', 'CANCELLED'].includes(liquidation.status)
  const canMarkPaid = ['GENERATED', 'SENT'].includes(liquidation.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/gestion/liquidaciones"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a liquidaciones
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Receipt className="h-7 w-7 text-violet-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Liquidación {MONTHS[liquidation.month - 1]} {liquidation.year}
                </h1>
                <p className="text-sm text-gray-600">
                  {liquidation.owner.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={STATUS_CONFIG[liquidation.status].color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {STATUS_CONFIG[liquidation.status].label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Success - Link Sent */}
        {linkSent && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <p className="text-green-700">
              {linkSent.type === 'email'
                ? `Enlace enviado por email a ${liquidation.owner.email}`
                : 'Enlace generado. Se ha abierto WhatsApp para enviarlo.'}
            </p>
            <button onClick={() => setLinkSent(null)} className="ml-auto text-green-500 hover:text-green-700">
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Actions Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={handleDownloadPdf}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF
              </Button>

              <Button
                variant="outline"
                onClick={() => handleSendToOwner('email')}
                disabled={sendingLink}
                className="border-violet-200 text-violet-700 hover:bg-violet-50"
              >
                {sendingLink ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Enviar por email
              </Button>

              <Button
                variant="outline"
                onClick={() => handleSendToOwner('whatsapp')}
                disabled={sendingLink}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                {sendingLink ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                )}
                WhatsApp
              </Button>

              {canMarkPaid && (
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={updating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Marcar como pagada
                </Button>
              )}

              {liquidation.status === 'DRAFT' && (
                <Button
                  variant="outline"
                  onClick={handleRecalculate}
                  disabled={recalculating}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  {recalculating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Recalcular
                </Button>
              )}

              {canEdit && (
                <Button
                  variant="outline"
                  onClick={handleCreateInvoice}
                  disabled={creatingInvoice}
                >
                  {creatingInvoice ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  Emitir factura
                </Button>
              )}

              <div className="flex-1" />

              {canDelete && (
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Reservations by Property */}
            {reservationsByProperty.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-violet-600" />
                    Reservas ({liquidation.reservations.length})
                  </h3>

                  {reservationsByProperty.map((group, groupIndex) => (
                    <div key={group.property} className={groupIndex > 0 ? 'mt-6 pt-6 border-t' : ''}>
                      {reservationsByProperty.length > 1 && (
                        <div className="flex items-center justify-between mb-3 bg-gray-50 p-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Home className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{group.property}</span>
                          </div>
                          <span className="font-medium text-violet-600">
                            {formatCurrency(group.subtotal)}
                          </span>
                        </div>
                      )}

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 font-medium text-gray-600">Código</th>
                              <th className="text-left py-2 font-medium text-gray-600">Huésped</th>
                              <th className="text-left py-2 font-medium text-gray-600">Entrada</th>
                              <th className="text-left py-2 font-medium text-gray-600">Salida</th>
                              <th className="text-center py-2 font-medium text-gray-600">Noches</th>
                              <th className="text-right py-2 font-medium text-gray-600">Importe</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.reservations.map(res => (
                              <tr key={res.id} className="border-b border-gray-100">
                                <td className="py-2 text-gray-500 font-mono text-xs">{res.confirmationCode}</td>
                                <td className="py-2 text-gray-900">{res.guestName}</td>
                                <td className="py-2 text-gray-500">
                                  {new Date(res.checkIn).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                </td>
                                <td className="py-2 text-gray-500">
                                  {new Date(res.checkOut).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                </td>
                                <td className="py-2 text-center text-gray-500">{res.nights}</td>
                                <td className="py-2 text-right font-medium">{formatCurrency(res.hostEarnings)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Expenses by Property */}
            {expensesByProperty.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-violet-600" />
                    Gastos repercutidos ({liquidation.expenses.length})
                  </h3>

                  {expensesByProperty.map((group, groupIndex) => (
                    <div key={group.property} className={groupIndex > 0 ? 'mt-6 pt-6 border-t' : ''}>
                      {expensesByProperty.length > 1 && (
                        <div className="flex items-center justify-between mb-3 bg-gray-50 p-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Home className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{group.property}</span>
                          </div>
                          <span className="font-medium text-red-600">
                            {formatCurrency(group.subtotal)}
                          </span>
                        </div>
                      )}

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 font-medium text-gray-600">Fecha</th>
                              <th className="text-left py-2 font-medium text-gray-600">Concepto</th>
                              <th className="text-left py-2 font-medium text-gray-600">Categoría</th>
                              <th className="text-right py-2 font-medium text-gray-600">Base</th>
                              <th className="text-right py-2 font-medium text-gray-600">IVA</th>
                              <th className="text-right py-2 font-medium text-gray-600">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.expenses.map(exp => (
                              <tr key={exp.id} className="border-b border-gray-100">
                                <td className="py-2 text-gray-500">
                                  {new Date(exp.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                </td>
                                <td className="py-2 text-gray-900">{exp.concept}</td>
                                <td className="py-2 text-gray-500">
                                  {EXPENSE_CATEGORIES[exp.category] || exp.category}
                                </td>
                                <td className="py-2 text-right">{formatCurrency(exp.amount)}</td>
                                <td className="py-2 text-right">{formatCurrency(exp.vatAmount)}</td>
                                <td className="py-2 text-right font-medium">
                                  {formatCurrency(exp.amount + exp.vatAmount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Info */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-violet-600" />
                  Propietario
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-gray-900">{liquidation.owner.name}</p>
                  {liquidation.owner.nif && (
                    <p className="text-gray-500">NIF: {liquidation.owner.nif}</p>
                  )}
                  {liquidation.owner.email && (
                    <p className="text-gray-500">{liquidation.owner.email}</p>
                  )}
                  {liquidation.owner.phone && (
                    <p className="text-gray-500">{liquidation.owner.phone}</p>
                  )}
                  {liquidation.owner.iban && (
                    <p className="text-gray-500 font-mono text-xs">
                      IBAN: {liquidation.owner.iban.replace(/(.{4})/g, '$1 ').trim()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Totals */}
            <Card className="border-2 border-violet-200">
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Euro className="w-5 h-5 text-violet-600" />
                  Resumen
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Total ingresos</span>
                    <span className="font-medium">{formatCurrency(liquidation.totals.totalIncome)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Comisión</span>
                    <span className="font-medium text-red-600">
                      - {formatCurrency(liquidation.totals.totalCommission)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">IVA comisión</span>
                    <span className="font-medium text-red-600">
                      - {formatCurrency(liquidation.totals.totalCommissionVat)}
                    </span>
                  </div>
                  {liquidation.totals.totalCleaning > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Limpiezas</span>
                      <span className="font-medium text-red-600">
                        - {formatCurrency(liquidation.totals.totalCleaning)}
                      </span>
                    </div>
                  )}
                  {liquidation.totals.totalExpenses > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Gastos</span>
                      <span className="font-medium text-red-600">
                        - {formatCurrency(liquidation.totals.totalExpenses)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 border-t-2 border-violet-200 mt-2">
                    <span className="font-semibold text-gray-900">Neto a transferir</span>
                    <span className="font-bold text-lg text-green-600">
                      {formatCurrency(liquidation.totals.totalAmount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info (if paid) */}
            {liquidation.status === 'PAID' && liquidation.paidAt && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <h3 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Pago registrado
                  </h3>
                  <div className="space-y-2 text-sm text-green-700">
                    <p>
                      <span className="font-medium">Fecha:</span>{' '}
                      {new Date(liquidation.paidAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    {liquidation.paymentMethod && (
                      <p>
                        <span className="font-medium">Método:</span> {liquidation.paymentMethod}
                      </p>
                    )}
                    {liquidation.paymentReference && (
                      <p>
                        <span className="font-medium">Referencia:</span> {liquidation.paymentReference}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dates */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2 text-sm text-gray-500">
                  <p>
                    Creada: {new Date(liquidation.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  <p>
                    Actualizada: {new Date(liquidation.updatedAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Eliminar liquidación
            </h3>
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de que quieres eliminar esta liquidación?
              Las reservas y gastos asociados volverán a estar disponibles para futuras liquidaciones.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Registrar pago
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de pago
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="TRANSFER">Transferencia bancaria</option>
                  <option value="BIZUM">Bizum</option>
                  <option value="CASH">Efectivo</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referencia (opcional)
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Ej: Transferencia del 15/01"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPaymentModal(false)
                  setPaymentMethod('')
                  setPaymentReference('')
                }}
                disabled={updating}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handleUpdateStatus('PAID')}
                disabled={updating}
                className="bg-green-600 hover:bg-green-700"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Confirmar pago
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
