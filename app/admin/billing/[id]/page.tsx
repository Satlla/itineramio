'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Download,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  User,
  Building2,
  Receipt,
  Mail,
  Home,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface Invoice {
  id: string
  userId: string
  invoiceNumber: string
  amount: number
  discountAmount: number
  finalAmount: number
  status: string
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
}

interface InvoiceNotes {
  properties?: Array<{
    id: string
    name: string
    type?: string
  }>
  months?: number
  plan?: string
  description?: string
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [parsedNotes, setParsedNotes] = useState<InvoiceNotes | null>(null)

  useEffect(() => {
    fetchInvoice()
  }, [params.id])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/admin/invoices/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setInvoice(data)
        
        // Try to parse notes as JSON
        if (data.notes) {
          try {
            const notes = JSON.parse(data.notes)
            setParsedNotes(notes)
          } catch (e) {
            console.log('Notes are not JSON:', data.notes)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleActivateProperty = async () => {
    if (!parsedNotes?.properties?.[0]?.id) {
      setMessage({ type: 'error', text: 'No se encontró información de propiedad en esta factura' })
      return
    }

    setActionLoading('activate')
    setMessage(null)

    try {
      const propertyId = parsedNotes.properties[0].id
      const response = await fetch(`/api/admin/properties/${propertyId}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          months: parsedNotes.months || 3,
          reason: `Activación desde factura ${invoice?.invoiceNumber}`
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Propiedad activada exitosamente' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al activar propiedad' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al activar propiedad' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleResendInvoice = async () => {
    setActionLoading('resend')
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/invoices/${params.id}/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Factura reenviada exitosamente a ' + invoice?.user.email })
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al reenviar factura' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al reenviar factura' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleMarkAsPaid = async () => {
    setActionLoading('markPaid')
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/invoices/${params.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'Manual',
          paymentReference: 'ADMIN-' + Date.now()
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Factura marcada como pagada' })
        await fetchInvoice() // Refresh invoice data
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al marcar como pagada' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al marcar como pagada' })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status.toUpperCase()
    switch (normalizedStatus) {
      case 'PAID':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'OVERDUE':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-gray-600" />
      default:
        return <Receipt className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toUpperCase()
    switch (normalizedStatus) {
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">
          Factura no encontrada
        </div>
      </div>
    )
  }

  const isPaid = invoice.status.toUpperCase() === 'PAID'

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/billing')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Facturación
        </button>
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Receipt className="w-8 h-8 mr-3 text-red-600" />
            Factura {invoice.invoiceNumber}
          </h1>
          
          <div className={`px-4 py-2 rounded-full border flex items-center ${getStatusColor(invoice.status)}`}>
            {getStatusIcon(invoice.status)}
            <span className="ml-2 font-semibold">{invoice.status.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-900 border-green-200' 
            : 'bg-red-50 text-red-900 border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-gray-600" />
              Información del Cliente
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-medium text-gray-900">{invoice.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{invoice.user.email}</p>
              </div>
              {invoice.user.companyName && (
                <div>
                  <p className="text-sm text-gray-600">Empresa</p>
                  <p className="font-medium text-gray-900">{invoice.user.companyName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-600" />
              Detalles de la Factura
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Fecha de Emisión</p>
                  <p className="font-medium text-gray-900">
                    {new Date(invoice.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha de Vencimiento</p>
                  <p className="font-medium text-gray-900">
                    {new Date(invoice.dueDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
                {invoice.paidDate && (
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Pago</p>
                    <p className="font-medium text-gray-900">
                      {new Date(invoice.paidDate).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                )}
                {invoice.paymentMethod && (
                  <div>
                    <p className="text-sm text-gray-600">Método de Pago</p>
                    <p className="font-medium text-gray-900">{invoice.paymentMethod}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">€{Number(invoice.amount).toFixed(2)}</span>
                </div>
                {Number(invoice.discountAmount) > 0 && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Descuento</span>
                    <span className="font-medium text-green-600">-€{Number(invoice.discountAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>€{Number(invoice.finalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Property Info (if available) */}
          {parsedNotes && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Home className="w-5 h-5 mr-2 text-gray-600" />
                Información de Propiedad
              </h2>
              <div className="space-y-3">
                {parsedNotes.properties?.map((property, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{property.name}</p>
                    <p className="text-sm text-gray-600">ID: {property.id}</p>
                    {property.type && <p className="text-sm text-gray-600">Tipo: {property.type}</p>}
                  </div>
                ))}
                {parsedNotes.months && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duración</span>
                    <span className="font-medium">{parsedNotes.months} meses</span>
                  </div>
                )}
                {parsedNotes.plan && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-medium">{parsedNotes.plan}</span>
                  </div>
                )}
                {parsedNotes.description && (
                  <div>
                    <p className="text-sm text-gray-600">Descripción</p>
                    <p className="font-medium">{parsedNotes.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes (raw) */}
          {invoice.notes && !parsedNotes && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notas</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="space-y-3">
              {/* Download Invoice */}
              <a
                href={`/api/invoices/${invoice.id}/download`}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF
              </a>

              {/* Resend Invoice */}
              <button
                onClick={handleResendInvoice}
                disabled={actionLoading === 'resend'}
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'resend' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Reenviar Factura
              </button>

              {/* Mark as Paid */}
              {!isPaid && (
                <button
                  onClick={handleMarkAsPaid}
                  disabled={actionLoading === 'markPaid'}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading === 'markPaid' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Marcar como Pagada
                </button>
              )}

              {/* Activate Property (if property info available) */}
              {parsedNotes?.properties?.[0] && !isPaid && (
                <button
                  onClick={handleActivateProperty}
                  disabled={actionLoading === 'activate'}
                  className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading === 'activate' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Home className="w-4 h-4 mr-2" />
                  )}
                  Activar Propiedad
                </button>
              )}
            </div>
          </div>

          {/* Help Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Información</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Reenviar Factura:</strong> Envía la factura por email al cliente</li>
              <li>• <strong>Marcar como Pagada:</strong> Confirma el pago manual</li>
              {parsedNotes?.properties?.[0] && (
                <li>• <strong>Activar Propiedad:</strong> Activa la propiedad asociada</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}