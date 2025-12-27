'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Phone,
  Mail,
  Building2,
  Calendar,
  Clock,
  Eye,
  MessageSquare,
  Plus,
  Edit,
  AlertCircle,
  CheckCircle,
  XCircle,
  Wrench,
  FileText,
  Settings,
  Trash2,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import CallLogModal from './CallLogModal'
import UserNoteModal from './UserNoteModal'
import ChangePlanModal from './ChangePlanModal'
import DeleteUserModal from './DeleteUserModal'

interface UserProfileModalProps {
  userId: string | null
  isOpen: boolean
  onClose: () => void
}

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string | null
  companyName: string | null
  role: string
  status: string
  subscription: string
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
  notes: string | null
  currentSubscription: {
    id: string
    status: string
    startDate: string
    endDate: string
    notes: string | null
    cancelAtPeriodEnd?: boolean
    planId?: string
    plan: {
      id: string
      name: string
      code: string
      priceMonthly: number
      priceSemestral: number | null
      priceYearly: number | null
      maxProperties: number
    }
  } | null
  stats: {
    totalProperties: number
    totalZones: number
    totalViews: number
    totalReviews: number
    recentCallsCount: number
  }
  properties: Array<{
    id: string
    name: string
    propertyCode: string | null
    isPublished: boolean
    _count: {
      zones: number
      propertyViews: number
      reviews: number
    }
  }>
  propertySets: Array<{
    id: string
    name: string
    _count: {
      properties: number
    }
  }>
  recentCallLogs: Array<{
    id: string
    category: string
    status: string
    title: string
    description: string | null
    createdAt: string
    admin: {
      name: string
      email: string
    }
    property: {
      name: string
      propertyCode: string | null
    } | null
  }>
  recentNotes: Array<{
    id: string
    category: string
    title: string | null
    content: string
    isImportant: boolean
    createdAt: string
    admin: {
      name: string
      email: string
    }
  }>
}

export default function UserProfileModal({ userId, isOpen, onClose }: UserProfileModalProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'calls' | 'notes'>('overview')
  const [showCallModal, setShowCallModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showChangePlanModal, setShowChangePlanModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [cancelingSubscription, setCancelingSubscription] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [calls, setCalls] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [loadingCalls, setLoadingCalls] = useState(false)
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [impersonating, setImpersonating] = useState(false)

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserProfile()
    }
  }, [isOpen, userId])

  useEffect(() => {
    if (activeTab === 'calls' && userId && calls.length === 0) {
      fetchCalls()
    }
    if (activeTab === 'notes' && userId && notes.length === 0) {
      fetchNotes()
    }
  }, [activeTab, userId])

  const fetchUserProfile = async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${userId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCalls = async () => {
    if (!userId) return
    
    try {
      setLoadingCalls(true)
      const response = await fetch(`/api/admin/users/${userId}/calls`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setCalls(data.data)
      }
    } catch (error) {
      console.error('Error fetching calls:', error)
    } finally {
      setLoadingCalls(false)
    }
  }

  const fetchNotes = async () => {
    if (!userId) return
    
    try {
      setLoadingNotes(true)
      const response = await fetch(`/api/admin/users/${userId}/notes`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setNotes(data.data)
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoadingNotes(false)
    }
  }

  const refreshCalls = () => {
    setCalls([])
    fetchCalls()
  }

  const refreshNotes = () => {
    setNotes([])
    fetchNotes()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'TECHNICAL': return 'bg-blue-100 text-blue-800'
      case 'BILLING': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLAINT': return 'bg-red-100 text-red-800'
      case 'PRAISE': return 'bg-green-100 text-green-800'
      case 'CONSULTATION': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'text-green-600'
      case 'PENDING': return 'text-yellow-600'
      case 'IN_PROGRESS': return 'text-blue-600'
      case 'ESCALATED': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const handleDeleteSuccess = () => {
    // Refresh parent component after successful deletion
    window.location.reload()
  }

  const handleImpersonate = async (propertyId: string) => {
    if (!userId) {
      console.error('❌ No hay userId disponible')
      return
    }

    console.log('👤 UserID del prop:', userId)
    console.log('🏠 PropertyID:', propertyId)
    console.log('📧 Email del usuario del modal:', user?.email)

    setImpersonating(true)

    try {
      console.log('🔄 Iniciando impersonation para userId:', userId)

      // Llamar a la API de impersonation
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: userId
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al iniciar suplantación')
      }

      const result = await response.json()
      console.log('✅ Impersonation iniciada:', result)
      console.log('👤 Usuario objetivo:', result.user)
      console.log('👮 Suplantado por:', result.impersonatedBy)

      // IMPORTANTE: Usar window.location.replace() para forzar recarga completa
      // Esto elimina la página actual del historial y fuerza una recarga completa
      // Asegurando que las nuevas cookies se lean correctamente
      window.location.replace(`/properties/${propertyId}/zones`)
    } catch (error) {
      console.error('❌ Error en impersonation:', error)
      alert(error instanceof Error ? error.message : 'Error al iniciar suplantación')
      setImpersonating(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!userId || !user) return

    setCancelingSubscription(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/cancel-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          reason: 'Cancelación realizada por administrador',
          immediate: false
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message || 'Suscripción cancelada exitosamente')
        // Refresh user profile to show updated subscription status
        fetchUserProfile()
      } else {
        alert(data.error || 'Error al cancelar suscripción')
      }
    } catch (error) {
      console.error('Error cancelando suscripción:', error)
      alert('Error al cancelar suscripción. Por favor, intenta de nuevo.')
    } finally {
      setCancelingSubscription(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
          </div>
        ) : user ? (
          <>
            {/* Header */}
            <div className="bg-gray-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold">{user.name.charAt(0)}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="flex items-center text-gray-300">
                      <Mail className="h-4 w-4 mr-1" />
                      {user.email}
                    </span>
                    {user.phone && (
                      <span className="flex items-center text-gray-300">
                        <Phone className="h-4 w-4 mr-1" />
                        {user.phone}
                      </span>
                    )}
                    {user.stats.recentCallsCount > 0 && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                        {user.stats.recentCallsCount} llamadas hoy
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowChangePlanModal(true)}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Cambiar Plan
                </button>
                {user.currentSubscription && user.currentSubscription.status === 'ACTIVE' && !user.currentSubscription.cancelAtPeriodEnd && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={cancelingSubscription}
                    className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    {cancelingSubscription ? 'Cancelando...' : 'Cancelar Suscripción'}
                  </button>
                )}
                {user.currentSubscription && user.currentSubscription.cancelAtPeriodEnd && (
                  <div className="bg-orange-100 border-2 border-orange-300 text-orange-800 px-4 py-2 rounded-lg flex items-center text-sm font-medium">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Se cancelará el {new Date(user.currentSubscription.endDate).toLocaleDateString('es-ES')}
                  </div>
                )}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Eliminar
                </button>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 border-b">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{user.stats.totalProperties}</div>
                <div className="text-sm text-gray-600">Propiedades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{user.stats.totalZones}</div>
                <div className="text-sm text-gray-600">Zonas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{user.stats.totalViews}</div>
                <div className="text-sm text-gray-600">Visitas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{user.stats.totalReviews}</div>
                <div className="text-sm text-gray-600">Reseñas</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Resumen', count: null },
                  { id: 'properties', label: 'Propiedades', count: user.properties.length },
                  { id: 'calls', label: 'Llamadas', count: user.recentCallLogs.length },
                  { id: 'notes', label: 'Notas', count: user.recentNotes.length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    {tab.count !== null && (
                      <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User Info */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Información General</h3>
                    <div className="space-y-3">
                      <div>
                        <dt className="text-sm text-gray-500">Estado</dt>
                        <dd className="flex items-center">
                          {user.isActive ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Empresa</dt>
                        <dd>{user.companyName || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Plan</dt>
                        <dd>
                          {(() => {
                            const planName = user.currentSubscription?.plan?.name || user.subscription
                            // Extract billing period from subscription notes
                            const billingPeriod = user.currentSubscription?.notes?.match(/Período:\s*(Mensual|Semestral|Anual)/i)?.[1]
                            return billingPeriod ? `${planName} (${billingPeriod})` : planName
                          })()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Registrado</dt>
                        <dd>{formatDate(user.createdAt)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Último acceso</dt>
                        <dd>{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Nunca'}</dd>
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Acciones Rápidas</h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => setShowCallModal(true)}
                          className="w-full flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                        >
                          <Phone className="h-4 w-4" />
                          <span>Registrar Llamada</span>
                        </button>
                        <button
                          onClick={() => setShowNoteModal(true)}
                          className="w-full flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                        >
                          <FileText className="h-4 w-4" />
                          <span>Añadir Nota</span>
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="w-full flex items-center space-x-2 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Eliminar Usuario</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
                    <div className="space-y-3">
                      {user.recentCallLogs.slice(0, 3).map((call) => (
                        <div key={call.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(call.category)}`}>
                              {call.category}
                            </span>
                            <span className={`text-sm ${getStatusColor(call.status)}`}>
                              {call.status}
                            </span>
                          </div>
                          <p className="font-medium mt-1">{call.title}</p>
                          <p className="text-sm text-gray-600">{formatDate(call.createdAt)}</p>
                        </div>
                      ))}
                      {user.recentCallLogs.length === 0 && (
                        <p className="text-gray-500 text-sm">No hay llamadas recientes</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'properties' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Propiedades ({user.properties.length})</h3>
                  </div>
                  <div className="grid gap-4">
                    {user.properties.map((property) => (
                      <div key={property.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{property.name}</h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <span className="font-mono bg-red-50 text-red-600 px-2 py-1 rounded">
                                {property.propertyCode}
                              </span>
                              <span className="flex items-center">
                                <Building2 className="h-4 w-4 mr-1" />
                                {property._count.zones} zonas
                              </span>
                              <span className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                {property._count.propertyViews} visitas
                              </span>
                              <span className="flex items-center">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                {property._count.reviews} reseñas
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              property.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {property.isPublished ? 'Publicada' : 'Borrador'}
                            </span>
                            <button
                              onClick={() => handleImpersonate(property.id)}
                              disabled={impersonating}
                              className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {impersonating ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span>Conectando...</span>
                                </>
                              ) : (
                                <>
                                  <Wrench className="h-4 w-4" />
                                  <span>Gestionar</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'calls' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Historial de Llamadas ({calls.length})</h3>
                    <button 
                      onClick={() => setShowCallModal(true)}
                      className="flex items-center space-x-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Nueva Llamada</span>
                    </button>
                  </div>
                  {loadingCalls ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                        {calls.map((call) => (
                          <div key={call.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Phone className={`h-4 w-4 ${call.type === 'INCOMING' ? 'text-green-600' : 'text-blue-600'}`} />
                                <span className={`px-2 py-1 rounded-full text-xs ${call.type === 'INCOMING' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                  {call.type === 'INCOMING' ? 'Entrante' : 'Saliente'}
                                </span>
                                {call.duration && (
                                  <span className="flex items-center text-xs text-gray-500">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {call.duration} min
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">{formatDate(call.createdAt)}</span>
                            </div>
                            <h4 className="font-medium mb-1">{call.reason}</h4>
                            {call.resolution && (
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>Resolución:</strong> {call.resolution}
                              </p>
                            )}
                            {call.notes && (
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>Notas:</strong> {call.notes}
                              </p>
                            )}
                            {call.followUpRequired && (
                              <div className="flex items-center text-sm text-orange-600 mb-2">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Requiere seguimiento
                                {call.followUpDate && (
                                  <span className="ml-2">({new Date(call.followUpDate).toLocaleDateString('es-ES')})</span>
                                )}
                              </div>
                            )}
                            <div className="text-sm text-gray-500">
                              <span>Por {call.admin.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              {activeTab === 'notes' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Notas ({notes.length})</h3>
                    <button 
                      onClick={() => setShowNoteModal(true)}
                      className="flex items-center space-x-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Nueva Nota</span>
                    </button>
                  </div>
                  {loadingNotes ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notes.map((note) => (
                        <div key={note.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(note.type)}`}>
                                {note.type}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                note.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                                note.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                note.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {note.priority}
                              </span>
                              {note.isPrivate && (
                                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                  Privada
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">{formatDate(note.createdAt)}</span>
                          </div>
                          <h4 className="font-medium mb-1">{note.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{note.content}</p>
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {note.tags.map((tag: string, index: number) => (
                                <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <span className="text-sm text-gray-500">Por {note.admin.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">No se pudo cargar el perfil del usuario</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <CallLogModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        userId={userId!}
        userName={user?.name || ''}
        onSaved={refreshCalls}
      />
      
      <UserNoteModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        userId={userId!}
        userName={user?.name || ''}
        onSaved={refreshNotes}
      />

      <ChangePlanModal
        isOpen={showChangePlanModal}
        onClose={() => setShowChangePlanModal(false)}
        userId={userId!}
        currentPlanId={user?.currentSubscription?.planId}
        userName={user?.name || ''}
        userEmail={user?.email || ''}
        onSuccess={() => {
          fetchUserProfile()
          setShowChangePlanModal(false)
        }}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        userId={userId}
        userName={user?.name || ''}
        userEmail={user?.email || ''}
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onSuccess={handleDeleteSuccess}
      />

      {/* Cancel Subscription Confirmation Modal */}
      {showCancelModal && user && user.currentSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Cancelar Suscripción
                </h3>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="px-6 py-6">
              <div className="mb-4">
                <p className="text-gray-700 text-base leading-relaxed">
                  ¿Estás seguro de que quieres cancelar la suscripción de <span className="font-bold text-gray-900">{user.name}</span>?
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Plan actual: <span className="font-semibold">{user.currentSubscription.plan?.name}</span>
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">La suscripción seguirá activa hasta:</p>
                    <p className="font-bold">
                      {new Date(user.currentSubscription.endDate).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Esta acción se registrará en el log de actividad del administrador.
              </p>
            </div>

            {/* Footer con botones */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelingSubscription}
                className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await handleCancelSubscription()
                  setShowCancelModal(false)
                }}
                disabled={cancelingSubscription}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
              >
                {cancelingSubscription && <Loader2 className="w-4 h-4 animate-spin" />}
                {cancelingSubscription ? 'Cancelando...' : 'Sí, cancelar suscripción'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}