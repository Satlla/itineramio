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
  Euro
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/Card'
import { Button } from '../../../src/components/ui/Button'
import { Input } from '../../../src/components/ui/Input'

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
  onReject: (requestId: string, notes: string) => void
  loading: boolean
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
  loading
}) => {
  const [notes, setNotes] = useState('')
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)

  if (!isOpen || !request) return null

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(request.id, notes)
    } else if (action === 'reject') {
      onReject(request.id, notes)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Revisar Solicitud de Suscripción
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Request Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Detalles de la Solicitud</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Cliente:</span>
                <span className="font-medium ml-2">{request.user.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="font-medium ml-2">{request.user.email}</span>
              </div>
              <div>
                <span className="text-gray-600">Teléfono:</span>
                <span className="font-medium ml-2">{request.user.phone || 'No especificado'}</span>
              </div>
              <div>
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium ml-2">
                  {request.plan?.name || 'Plan personalizado'}
                  {request.propertiesCount && ` (${request.propertiesCount} props)`}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Importe:</span>
                <span className="font-semibold text-green-600 ml-2">€{Number(request.totalAmount).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">Método:</span>
                <span className="font-medium ml-2">
                  {request.paymentMethod === 'BIZUM' ? 'Bizum' : 'Transferencia'}
                </span>
              </div>
              {request.paymentReference && (
                <div className="col-span-2">
                  <span className="text-gray-600">Referencia:</span>
                  <span className="font-medium ml-2">{request.paymentReference}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Proof */}
          {request.paymentProofUrl && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Justificante de Pago</h3>
              <div className="border rounded-lg p-4">
                <img 
                  src={request.paymentProofUrl} 
                  alt="Justificante de pago"
                  className="max-w-full h-auto max-h-96 rounded"
                />
                <div className="mt-2 text-center">
                  <a 
                    href={request.paymentProofUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Ver en tamaño completo
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Action Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Acción</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAction('approve')}
                className={`p-4 border rounded-lg text-left ${
                  action === 'approve' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <div className="font-medium text-green-900">Aprobar</div>
                    <div className="text-sm text-green-700">Activar suscripción</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setAction('reject')}
                className={`p-4 border rounded-lg text-left ${
                  action === 'reject' 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  <div>
                    <div className="font-medium text-red-900">Rechazar</div>
                    <div className="text-sm text-red-700">Pago no válido</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas administrativas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Agregar notas sobre la revisión..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading || !action}
              className={`flex-1 ${
                action === 'approve' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : action === 'reject'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gray-400'
              }`}
            >
              {loading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              ) : null}
              {loading ? 'Procesando...' : action === 'approve' ? 'Aprobar Solicitud' : action === 'reject' ? 'Rechazar Solicitud' : 'Seleccionar Acción'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SubscriptionRequestsPage() {
  const [requests, setRequests] = useState<SubscriptionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [selectedRequest, setSelectedRequest] = useState<SubscriptionRequest | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [processingAction, setProcessingAction] = useState(false)

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
        fetchRequests() // Refresh the list
        alert('Solicitud aprobada exitosamente')
      } else {
        const error = await response.json()
        alert(`Error: ${error.message || 'No se pudo aprobar la solicitud'}`)
      }
    } catch (error) {
      console.error('Error approving request:', error)
      alert('Error al aprobar la solicitud')
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
        alert('Solicitud rechazada')
      } else {
        const error = await response.json()
        alert(`Error: ${error.message || 'No se pudo rechazar la solicitud'}`)
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('Error al rechazar la solicitud')
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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Suscripción</h1>
          <p className="text-gray-600 mt-2">
            Gestiona las solicitudes de suscripción de los usuarios
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-4">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === status
                    ? 'bg-blue-600 text-white'
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
      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay solicitudes
              </h3>
              <p className="text-gray-600">
                {filter === 'PENDING' 
                  ? 'No hay solicitudes pendientes de revisión'
                  : `No hay solicitudes con estado: ${filter.toLowerCase()}`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="flex items-center mb-1">
                          <User className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="font-medium text-gray-900">{request.user.name}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-1" />
                          {request.user.email}
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
                          ? 'bg-blue-600 hover:bg-blue-700' 
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
          ))
        )}
      </div>

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false)
          setSelectedRequest(null)
        }}
        request={selectedRequest}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        loading={processingAction}
      />
    </div>
  )
}