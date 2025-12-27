'use client'

import React, { useState, useEffect } from 'react'
import {
  Check,
  X,
  Eye,
  Clock,
  CreditCard,
  Phone,
  Mail,
  User,
  FileImage,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Building2,
  Euro,
  Bell,
  AlertTriangle,
  UserX,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/Card'
import { Button } from '../../../src/components/ui/Button'
import { Input } from '../../../src/components/ui/Input'
import UserProfileModal from '../users/components/UserProfileModal'
import { SuccessModal } from '../../../src/components/ui/SuccessModal'
import { ErrorModal } from '../../../src/components/ui/ErrorModal'

interface SubscriptionRequest {
  id: string
  userId: string
  planId?: string
  requestType: string
  propertiesCount?: number
  totalAmount: number
  status: string
  paymentMethod: string
  paymentReference?: string
  paymentProofUrl?: string
  requestedAt: string
  paidAt?: string
  approvedAt?: string
  rejectedAt?: string
  reviewedBy?: string
  adminNotes?: string
  metadata?: {
    billingPeriod?: string
  }
  user: {
    name: string
    email: string
    phone?: string
  }
  plan?: {
    name: string
    priceMonthly: number
  }
}

interface ApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  request: SubscriptionRequest | null
  onApprove: (requestId: string, notes: string) => void
  onApproveNoInvoice: (requestId: string, notes: string, reason: string) => void
  onReject: (requestId: string, notes: string) => void
  loading: boolean
}

interface CanceledSubscription {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string | null
  userCompany: string | null
  planName: string
  planCode: string | null
  startDate: string
  endDate: string
  daysRemaining: number
  canceledAt: string
  cancelReason: string | null
  price: number
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  request,
  onApprove,
  onApproveNoInvoice,
  onReject,
  loading
}) => {
  const [userNotes, setUserNotes] = useState(request?.adminNotes || '')
  const [showImageModal, setShowImageModal] = useState(false)
  const [noInvoiceReason, setNoInvoiceReason] = useState('')
  const [showNoInvoiceInput, setShowNoInvoiceInput] = useState(false)

  if (!isOpen || !request) return null

  // Calculate subscription end date based on billing period
  const getSubscriptionEndDate = () => {
    if (!request.approvedAt && !request.paidAt) return 'Pendiente de activación'

    const startDate = request.approvedAt ? new Date(request.approvedAt) : new Date(request.paidAt!)
    const endDate = new Date(startDate)

    // Get billing period from metadata
    const billingPeriod = request.metadata?.billingPeriod?.toLowerCase()

    // Calculate end date based on billing period
    if (billingPeriod === 'semiannual' || billingPeriod === 'semestral' || billingPeriod === 'biannual') {
      endDate.setMonth(endDate.getMonth() + 6)
    } else if (billingPeriod === 'annual' || billingPeriod === 'yearly') {
      endDate.setMonth(endDate.getMonth() + 12)
    } else {
      // Default to monthly
      endDate.setMonth(endDate.getMonth() + 1)
    }

    return endDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  // Get billing period label
  const getBillingPeriodLabel = () => {
    const billingPeriod = request.metadata?.billingPeriod?.toLowerCase()
    if (billingPeriod === 'semiannual' || billingPeriod === 'semestral' || billingPeriod === 'biannual') {
      return 'Semestral (6 meses)'
    } else if (billingPeriod === 'annual' || billingPeriod === 'yearly') {
      return 'Anual (12 meses)'
    } else if (billingPeriod === 'monthly') {
      return 'Mensual (1 mes)'
    }
    return 'No especificado'
  }

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-5">
            <div className="flex items-center justify-between text-white">
              <div>
                <h2 className="text-xl font-bold mb-1">
                  Revisar Solicitud
                </h2>
                <p className="text-red-100 text-xs">
                  ID: {request.id.slice(-12)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white/90 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="approval-modal-content overflow-y-auto max-h-[calc(90vh-180px)] p-5 space-y-5">
            {/* Status Badge */}
            <div className="flex items-center justify-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300' :
                request.status === 'APPROVED' ? 'bg-green-100 text-green-800 border-2 border-green-300' :
                'bg-red-100 text-red-800 border-2 border-red-300'
              }`}>
                {request.status === 'PENDING' && <Clock className="w-4 h-4" />}
                {request.status === 'APPROVED' && <CheckCircle2 className="w-4 h-4" />}
                {request.status === 'REJECTED' && <XCircle className="w-4 h-4" />}
                Estado: {request.status === 'PENDING' ? 'Pendiente' : request.status === 'APPROVED' ? 'Aprobada' : 'Rechazada'}
              </div>
            </div>

            {/* Timeline Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Compra</div>
                </div>
                <div className="text-lg font-bold text-blue-900">
                  {new Date(request.paidAt || request.requestedAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {new Date(request.paidAt || request.requestedAt).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              <div className={`relative rounded-xl p-4 border-2 shadow-sm ${
                request.approvedAt
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    request.approvedAt ? 'bg-green-600' : 'bg-gray-400'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div className={`text-xs font-semibold uppercase tracking-wide ${
                    request.approvedAt ? 'text-green-700' : 'text-gray-500'
                  }`}>Activación</div>
                </div>
                <div className={`text-lg font-bold ${request.approvedAt ? 'text-green-900' : 'text-gray-500'}`}>
                  {request.approvedAt
                    ? new Date(request.approvedAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'Pendiente'}
                </div>
              </div>

              <div className="relative bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Finaliza</div>
                </div>
                <div className="text-lg font-bold text-purple-900">
                  {(() => {
                    if (!request.approvedAt && !request.paidAt) {
                      return <span className="text-sm">Pendiente</span>
                    }

                    const startDate = request.approvedAt ? new Date(request.approvedAt) : new Date(request.paidAt!)
                    const endDate = new Date(startDate)
                    const billingPeriod = request.metadata?.billingPeriod?.toLowerCase()

                    if (billingPeriod === 'semiannual' || billingPeriod === 'semestral' || billingPeriod === 'biannual') {
                      endDate.setMonth(endDate.getMonth() + 6)
                    } else if (billingPeriod === 'annual' || billingPeriod === 'yearly') {
                      endDate.setMonth(endDate.getMonth() + 12)
                    } else {
                      endDate.setMonth(endDate.getMonth() + 1)
                    }

                    return endDate.toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })
                  })()}
                </div>
              </div>
            </div>

            {/* Customer Information Card */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-gray-600" />
                <h3 className="font-bold text-gray-900 text-lg">Información del Cliente</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Nombre</div>
                  <div className="text-base font-semibold text-gray-900">{request.user.name}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Email</div>
                  <div className="text-sm font-medium text-gray-900 break-all">{request.user.email}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Teléfono</div>
                  <div className="text-base font-semibold text-gray-900">
                    {request.user.phone || (
                      <span className="text-gray-400 text-sm font-normal">No especificado</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Details Card */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-gray-600" />
                <h3 className="font-bold text-gray-900 text-lg">Detalles de la Suscripción</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Plan</div>
                  <div className="text-base font-bold text-gray-900">
                    {request.plan?.name || 'Personalizado'}
                  </div>
                  {request.propertiesCount && (
                    <div className="text-xs text-gray-500">{request.propertiesCount} propiedades</div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Importe Total</div>
                  <div className="text-2xl font-bold text-green-600">
                    €{Number(request.totalAmount).toFixed(2)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Período</div>
                  <div className="text-base font-bold text-purple-700">
                    {getBillingPeriodLabel()}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Método de Pago</div>
                  <div className="text-base font-semibold text-gray-900">
                    {request.paymentMethod?.toUpperCase() === 'BIZUM' || request.paymentMethod === 'bizum' ? (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-4 h-4" /> Bizum
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <CreditCard className="w-4 h-4" /> Transferencia
                      </span>
                    )}
                  </div>
                </div>
                {request.paymentReference && (
                  <div className="sm:col-span-2 lg:col-span-4 space-y-1">
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide flex items-center gap-2">
                      <span>⚠️ Referencia de Pago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-mono font-bold bg-amber-50 px-4 py-3 rounded-lg border-2 border-amber-300 break-all flex-1">
                        {request.paymentReference}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(request.paymentReference!)
                          alert('Referencia copiada al portapapeles')
                        }}
                        className="p-3 bg-amber-200 hover:bg-amber-300 rounded-lg transition-colors"
                        title="Copiar referencia"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-amber-700 italic">
                      El usuario debería haber usado esta referencia en el concepto del pago
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Notes */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">📝</div>
                <h3 className="font-bold text-amber-900 text-lg">Notas Administrativas</h3>
              </div>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 text-sm border-2 border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                placeholder="Agregar notas sobre llamadas, comentarios del cliente, seguimiento..."
              />
              <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Estas notas serán visibles para todos los administradores
              </p>
            </div>

            {/* Payment Proof */}
            {request.paymentProofUrl && (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FileImage className="w-5 h-5 text-gray-600" />
                  <h3 className="font-bold text-gray-900 text-lg">Justificante de Pago</h3>
                </div>
                <div className="relative group cursor-pointer" onClick={() => setShowImageModal(true)}>
                  <img
                    src={request.paymentProofUrl}
                    alt="Justificante de pago"
                    className="w-full h-auto max-h-80 object-contain rounded-lg border-2 border-gray-200 group-hover:border-blue-500 transition-all"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-all bg-white px-4 py-2 rounded-lg shadow-lg">
                      <Eye className="w-5 h-5 text-gray-700" />
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 mx-auto"
                  >
                    <Eye className="w-4 h-4" />
                    Ver en tamaño completo
                  </button>
                </div>
              </div>
            )}

            {/* Action Selection */}
            {request.status === 'PENDING' && (
              <>
                <div className="bg-white border-2 border-gray-300 rounded-xl p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 text-xl mb-4">
                    ¿Qué acción deseas realizar?
                  </h3>

                  {/* Approval Options */}
                  <div className="space-y-3 mb-4">
                    <div className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                      Opciones de Aprobación
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Approve WITH Invoice */}
                      <button
                        onClick={() => onApprove(request.id, userNotes || '')}
                        disabled={loading}
                        className={`group relative p-4 border-2 rounded-xl text-left transition-all transform hover:scale-[1.02] ${
                          loading ? 'opacity-50 cursor-not-allowed' : 'border-gray-300 bg-white hover:border-green-400 hover:shadow-lg hover:bg-green-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-green-100 group-hover:bg-green-600 transition-colors">
                            <CheckCircle2 className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-green-900 text-base mb-1">✅ Aprobar con Factura</div>
                            <div className="text-xs text-green-700">
                              {loading ? 'Procesando...' : 'Activa suscripción y genera factura'}
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Approve WITHOUT Invoice */}
                      <button
                        onClick={() => setShowNoInvoiceInput(!showNoInvoiceInput)}
                        disabled={loading}
                        className={`group relative p-4 border-2 rounded-xl text-left transition-all transform hover:scale-[1.02] ${
                          showNoInvoiceInput
                            ? 'border-blue-400 bg-blue-50 shadow-md'
                            : loading
                              ? 'opacity-50 cursor-not-allowed'
                              : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-lg hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg transition-colors ${
                            showNoInvoiceInput
                              ? 'bg-blue-600'
                              : 'bg-blue-100 group-hover:bg-blue-600'
                          }`}>
                            <CheckCircle2 className={`w-5 h-5 transition-colors ${
                              showNoInvoiceInput
                                ? 'text-white'
                                : 'text-blue-600 group-hover:text-white'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className={`font-bold text-base mb-1 ${
                              showNoInvoiceInput ? 'text-blue-900' : 'text-blue-900'
                            }`}>
                              🎁 Activar sin Factura
                            </div>
                            <div className={`text-xs ${
                              showNoInvoiceInput ? 'text-blue-700' : 'text-blue-700'
                            }`}>
                              {loading ? 'Procesando...' : 'Para cortesías, demos, promociones'}
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* No Invoice Reason Input */}
                    {showNoInvoiceInput && (
                      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                        <label className="block">
                          <span className="text-sm font-semibold text-blue-900 mb-1 block">
                            Motivo de activación sin factura:
                          </span>
                          <input
                            type="text"
                            value={noInvoiceReason}
                            onChange={(e) => setNoInvoiceReason(e.target.value)}
                            placeholder="Ej: Cortesía, Demo, Promoción especial..."
                            className="w-full px-3 py-2 text-sm border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </label>
                        <button
                          onClick={() => {
                            if (!noInvoiceReason.trim()) {
                              alert('Debes especificar un motivo')
                              return
                            }
                            onApproveNoInvoice(request.id, userNotes || '', noInvoiceReason)
                          }}
                          disabled={loading || !noInvoiceReason.trim()}
                          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Procesando...' : 'Confirmar Activación sin Factura'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Rejection Option */}
                  <div className="space-y-3 pt-4 border-t-2 border-gray-200">
                    <div className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                      Rechazar Solicitud
                    </div>
                    <button
                      onClick={() => onReject(request.id, userNotes || '')}
                      disabled={loading}
                      className={`group w-full p-4 border-2 rounded-xl text-left transition-all transform hover:scale-[1.02] ${
                        loading ? 'opacity-50 cursor-not-allowed' : 'border-gray-300 bg-white hover:border-red-300 hover:shadow-lg hover:bg-red-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-red-100 group-hover:bg-red-600 transition-colors">
                          <XCircle className="w-5 h-5 text-red-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-red-900 text-base mb-1">❌ Rechazar Solicitud</div>
                          <div className="text-xs text-red-700">
                            {loading ? 'Procesando...' : 'Pago no válido, incorrecto o fraudulento'}
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t-2 border-gray-200 bg-gray-50 p-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full py-4 text-base font-semibold border-2 hover:bg-gray-100"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && request.paymentProofUrl && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-7xl max-h-[95vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={request.paymentProofUrl}
              alt="Justificante de pago"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default function SubscriptionRequestsPage() {
  const [requests, setRequests] = useState<SubscriptionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [selectedRequest, setSelectedRequest] = useState<SubscriptionRequest | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [processingAction, setProcessingAction] = useState(false)

  // Estados para suscripciones canceladas
  const [showCanceledModal, setShowCanceledModal] = useState(false)
  const [canceledSubscriptions, setCanceledSubscriptions] = useState<CanceledSubscription[]>([])
  const [loadingCanceled, setLoadingCanceled] = useState(false)
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<string | null>(null)
  const [showUserProfileModal, setShowUserProfileModal] = useState(false)

  // Estados para modales de éxito/error
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [modalMessage, setModalMessage] = useState({ title: '', message: '' })

  // Helper function to get billing period label
  const getBillingPeriodLabel = (request: SubscriptionRequest) => {
    const billingPeriod = request.metadata?.billingPeriod?.toLowerCase()
    if (billingPeriod === 'semiannual' || billingPeriod === 'semestral' || billingPeriod === 'biannual') {
      return 'Semestral'
    } else if (billingPeriod === 'annual' || billingPeriod === 'yearly') {
      return 'Anual'
    } else if (billingPeriod === 'monthly') {
      return 'Mensual'
    }
    return 'Mensual'
  }

  useEffect(() => {
    fetchRequests()
  }, [filter])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/subscription-requests?status=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      console.error('Error fetching subscription requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCanceledSubscriptions = async () => {
    try {
      setLoadingCanceled(true)
      const response = await fetch('/api/admin/canceled-subscriptions')
      if (response.ok) {
        const data = await response.json()
        setCanceledSubscriptions(data.canceledSubscriptions)
      }
    } catch (error) {
      console.error('Error fetching canceled subscriptions:', error)
    } finally {
      setLoadingCanceled(false)
    }
  }

  const handleViewCanceledSubscriptions = () => {
    setShowCanceledModal(true)
    fetchCanceledSubscriptions()
  }

  const handleViewUserProfile = (userId: string) => {
    setSelectedUserForProfile(userId)
    setShowUserProfileModal(true)
  }

  const handleViewRequest = (request: SubscriptionRequest) => {
    setSelectedRequest(request)
    setShowApprovalModal(true)
  }

  const handleApproveRequest = async (requestId: string, notes: string) => {
    try {
      setProcessingAction(true)
      const response = await fetch(`/api/admin/subscription-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })

      if (response.ok) {
        setShowApprovalModal(false)
        setSelectedRequest(null)
        fetchRequests()
        setModalMessage({
          title: '¡Solicitud Aprobada!',
          message: 'La solicitud ha sido aprobada exitosamente.\nEl usuario recibirá una notificación.'
        })
        setShowSuccessModal(true)
      } else {
        let errorMessage = 'No se pudo aprobar la solicitud'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (parseError) {
          errorMessage = `Error ${response.status}: ${response.statusText}`
        }
        setModalMessage({
          title: 'Error al Aprobar',
          message: errorMessage
        })
        setShowErrorModal(true)
      }
    } catch (error) {
      console.error('Error approving request:', error)
      setModalMessage({
        title: 'Error de Conexión',
        message: 'Hubo un problema al procesar la solicitud.\nPor favor, inténtalo de nuevo.'
      })
      setShowErrorModal(true)
    } finally {
      setProcessingAction(false)
    }
  }

  const handleApproveNoInvoiceRequest = async (requestId: string, notes: string, reason: string) => {
    try {
      setProcessingAction(true)
      const response = await fetch(`/api/admin/subscription-requests/${requestId}/approve-no-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, reason })
      })

      if (response.ok) {
        setShowApprovalModal(false)
        setSelectedRequest(null)
        fetchRequests()
        setModalMessage({
          title: '¡Suscripción Activada!',
          message: `Suscripción activada sin factura exitosamente.\nMotivo: ${reason}`
        })
        setShowSuccessModal(true)
      } else {
        let errorMessage = 'No se pudo activar la suscripción sin factura'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (parseError) {
          errorMessage = `Error ${response.status}: ${response.statusText}`
        }
        setModalMessage({
          title: 'Error al Activar',
          message: errorMessage
        })
        setShowErrorModal(true)
      }
    } catch (error) {
      console.error('Error approving request without invoice:', error)
      setModalMessage({
        title: 'Error de Conexión',
        message: 'Hubo un problema al activar la suscripción.\nPor favor, inténtalo de nuevo.'
      })
      setShowErrorModal(true)
    } finally {
      setProcessingAction(false)
    }
  }

  const handleRejectRequest = async (requestId: string, notes: string) => {
    try {
      setProcessingAction(true)
      const response = await fetch(`/api/admin/subscription-requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })

      if (response.ok) {
        setShowApprovalModal(false)
        setSelectedRequest(null)
        fetchRequests() // Refresh the list
        setModalMessage({
          title: 'Solicitud Rechazada',
          message: 'La solicitud ha sido rechazada.\nSe ha notificado al usuario.'
        })
        setShowErrorModal(true) // Usamos ErrorModal con type warning para el rechazo
      } else {
        const error = await response.json()
        setModalMessage({
          title: 'Error al Rechazar',
          message: error.message || 'No se pudo rechazar la solicitud'
        })
        setShowErrorModal(true)
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      setModalMessage({
        title: 'Error de Conexión',
        message: 'Hubo un problema al rechazar la solicitud.\nPor favor, inténtalo de nuevo.'
      })
      setShowErrorModal(true)
    } finally {
      setProcessingAction(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'APPROVED':
        return <CheckCircle2 className="w-4 h-4" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente'
      case 'APPROVED':
        return 'Aprobada'
      case 'REJECTED':
        return 'Rechazada'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al Dashboard</span>
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
            <Bell className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 mr-2 text-red-600" />
            Suscripciones
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">
            Gestiona las solicitudes de suscripción
          </p>
        </div>
        <Button
          onClick={handleViewCanceledSubscriptions}
          className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2 text-sm"
        >
          <UserX className="w-4 h-4" />
          Ver Canceladas
        </Button>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-xs sm:text-sm ${
                  filter === status
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'ALL' ? 'Todas' :
                 status === 'PENDING' ? 'Pendientes' :
                 status === 'APPROVED' ? 'Aprobadas' : 'Rechazadas'}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-6 sm:p-8 text-center">
            <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              No hay solicitudes
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {filter === 'PENDING'
                ? 'No hay solicitudes pendientes de revisión'
                : `No hay solicitudes con estado: ${filter.toLowerCase()}`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {requests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{getStatusText(request.status)}</span>
                      </span>
                      <p className="text-xs text-gray-500 mt-1">ID: {request.id.slice(-8)}</p>
                    </div>
                    {request.paymentProofUrl && (
                      <a
                        href={request.paymentProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg flex-shrink-0"
                        title="Ver justificante"
                      >
                        <FileImage className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <div className="space-y-2 mb-3">
                    <div>
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <User className="w-3 h-3 mr-1 text-gray-400" />
                        {request.user.name}
                      </div>
                      <div className="flex items-center text-xs text-gray-600 mt-0.5">
                        <Mail className="w-3 h-3 mr-1 text-gray-400" />
                        <span className="truncate">{request.user.email}</span>
                      </div>
                      {request.user.phone && (
                        <div className="flex items-center text-xs text-gray-600 mt-0.5">
                          <Phone className="w-3 h-3 mr-1 text-gray-400" />
                          {request.user.phone}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Plan:</span>
                        <div className="font-medium text-gray-900">
                          {request.plan?.name || 'Custom'}
                          {request.propertiesCount && (
                            <span className="text-gray-500 ml-1">({request.propertiesCount})</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Importe:</span>
                        <div className="font-semibold text-green-600">
                          €{Number(request.totalAmount).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-purple-600 font-medium">
                          {getBillingPeriodLabel(request)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Método:</span>
                        <div className="font-medium text-gray-900">
                          {request.paymentMethod === 'BIZUM' ? 'Bizum' : 'Transfer'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Fecha:</span>
                        <div className="font-medium text-gray-900">
                          {new Date(request.requestedAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewRequest(request)}
                    className={`w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded text-xs font-medium text-white ${
                      request.status === 'PENDING'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>{request.status === 'PENDING' ? 'Revisar' : 'Ver Detalles'}</span>
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Card View */}
          <div className="hidden md:block space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{getStatusText(request.status)}</span>
                        </span>
                        <span className="text-sm text-gray-500">
                          ID: {request.id.slice(-8)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div>
                          <div className="flex items-center mb-1">
                            <User className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="font-medium text-gray-900">{request.user.name}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-1" />
                            <span className="truncate">{request.user.email}</span>
                          </div>
                          {request.user.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-4 h-4 mr-1" />
                              {request.user.phone}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="text-sm text-gray-600">Plan</div>
                          <div className="font-medium">
                            {request.plan?.name || 'Personalizado'}
                            {request.propertiesCount && (
                              <span className="text-sm text-gray-500 ml-1">
                                ({request.propertiesCount} props)
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-600">Importe</div>
                          <div className="font-semibold text-green-600">
                            €{Number(request.totalAmount).toFixed(2)}
                          </div>
                          <div className="text-xs text-purple-600 font-medium">
                            {getBillingPeriodLabel(request)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {request.paymentMethod === 'BIZUM' ? 'Bizum' : 'Transferencia'}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-600">Fecha</div>
                          <div className="text-sm">
                            {new Date(request.requestedAt).toLocaleDateString('es-ES')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(request.requestedAt).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {request.paymentProofUrl && (
                        <a
                          href={request.paymentProofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Ver justificante"
                        >
                          <FileImage className="w-5 h-5" />
                        </a>
                      )}

                      <Button
                        onClick={() => handleViewRequest(request)}
                        size="sm"
                        className={
                          request.status === 'PENDING'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-gray-600 hover:bg-gray-700'
                        }
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {request.status === 'PENDING' ? 'Revisar' : 'Ver Detalles'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false)
          setSelectedRequest(null)
        }}
        request={selectedRequest}
        onApprove={handleApproveRequest}
        onApproveNoInvoice={handleApproveNoInvoiceRequest}
        onReject={handleRejectRequest}
        loading={processingAction}
      />

      {/* Canceled Subscriptions Modal */}
      {showCanceledModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center">
                    <AlertTriangle className="w-6 h-6 text-orange-600 mr-2" />
                    Suscripciones Canceladas
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Usuarios que han cancelado su suscripción y no renovarán
                  </p>
                </div>
                <button
                  onClick={() => setShowCanceledModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {loadingCanceled ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full"></div>
                </div>
              ) : canceledSubscriptions.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    ¡Genial! No hay suscripciones canceladas
                  </h3>
                  <p className="text-gray-600">
                    Todos tus usuarios están contentos con el servicio
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-orange-800">
                          {canceledSubscriptions.length} {canceledSubscriptions.length === 1 ? 'usuario ha' : 'usuarios han'} cancelado
                        </h3>
                        <p className="text-xs text-orange-700 mt-1">
                          Estas suscripciones se desactivarán al finalizar su período actual. Contacta con ellos para recuperarlos.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {canceledSubscriptions.map((subscription) => (
                      <Card key={subscription.id} className="hover:shadow-lg transition-shadow border-l-4 border-orange-500">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              {/* Usuario */}
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="font-semibold text-gray-900 text-lg">
                                      {subscription.userName}
                                    </span>
                                    <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                      CANCELADA
                                    </span>
                                  </div>
                                  {subscription.userCompany && (
                                    <div className="flex items-center text-sm text-gray-600 ml-5">
                                      <Building2 className="w-3 h-3 mr-1" />
                                      {subscription.userCompany}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-orange-600 font-medium">
                                    {subscription.daysRemaining} días restantes
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Vence: {new Date(subscription.endDate).toLocaleDateString('es-ES')}
                                  </div>
                                </div>
                              </div>

                              {/* Contacto */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-5">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                  <a
                                    href={`mailto:${subscription.userEmail}`}
                                    className="hover:text-orange-600 underline"
                                  >
                                    {subscription.userEmail}
                                  </a>
                                </div>
                                {subscription.userPhone && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                    <a
                                      href={`tel:${subscription.userPhone}`}
                                      className="hover:text-orange-600 underline"
                                    >
                                      {subscription.userPhone}
                                    </a>
                                  </div>
                                )}
                              </div>

                              {/* Detalles de suscripción */}
                              <div className="bg-gray-50 rounded-lg p-3 ml-5">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                  <div>
                                    <span className="text-gray-500">Plan:</span>
                                    <div className="font-medium text-gray-900">{subscription.planName}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Precio:</span>
                                    <div className="font-semibold text-green-600">€{Number(subscription.price).toFixed(2)}/mes</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Inicio:</span>
                                    <div className="font-medium text-gray-900">
                                      {new Date(subscription.startDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Cancelada:</span>
                                    <div className="font-medium text-red-600">
                                      {new Date(subscription.canceledAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Motivo de cancelación */}
                              {subscription.cancelReason && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 ml-5">
                                  <div className="text-xs font-semibold text-red-800 mb-1">
                                    Motivo de cancelación:
                                  </div>
                                  <div className="text-sm text-red-700">
                                    {subscription.cancelReason}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Botón de acción */}
                            <div className="flex-shrink-0">
                              <Button
                                onClick={() => handleViewUserProfile(subscription.userId)}
                                className="bg-orange-600 hover:bg-orange-700 text-white w-full lg:w-auto"
                              >
                                <User className="w-4 h-4 mr-2" />
                                Ver Perfil
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}

              <div className="mt-6 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowCanceledModal(false)}
                  className="text-sm"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showUserProfileModal && selectedUserForProfile && (
        <UserProfileModal
          userId={selectedUserForProfile}
          isOpen={showUserProfileModal}
          onClose={() => {
            setShowUserProfileModal(false)
            setSelectedUserForProfile(null)
            fetchCanceledSubscriptions()
          }}
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={modalMessage.title}
        message={modalMessage.message}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={modalMessage.title}
        message={modalMessage.message}
        type="error"
      />
    </div>
  )
}