'use client'

import { useState, useEffect } from 'react'

interface Property {
  id: string
  name: string
  status: string
  hostId: string
  host: {
    name: string
    email: string
  }
  city: string
  country: string
  subscriptionEndsAt: string | null
}

export default function AdminPropertyManagementPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [actionType, setActionType] = useState<'activate' | 'activate-invoice' | 'deactivate' | null>(null)
  const [formData, setFormData] = useState({
    months: 3,
    reason: '',
    plan: 'Growth',
    amount: 299
  })
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      console.log('🔍 Fetching properties...')
      const response = await fetch('/api/admin/properties')
      console.log('📡 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Properties data:', data)
        setProperties(data.properties || [])
      } else if (response.status === 401) {
        // Not authenticated as admin - redirect to admin login
        console.log('🔐 Not authenticated as admin, redirecting to login')
        window.location.href = '/admin/login'
        return
      } else {
        const errorText = await response.text()
        console.error('❌ Error response:', errorText)
        setMessage({ 
          type: 'error', 
          text: `Error fetching properties: ${response.status} - ${errorText}`
        })
      }
    } catch (error) {
      console.error('🚨 Network error:', error)
      setMessage({ type: 'error', text: 'Network error fetching properties' })
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async () => {
    if (!selectedProperty || !actionType) return

    console.log(`🎯 Starting ${actionType} for property:`, selectedProperty.id)
    setActionLoading(selectedProperty.id)
    setMessage(null)
    
    try {
      let endpoint = ''
      let body: any = {}

      switch (actionType) {
        case 'activate':
          endpoint = `/api/admin/properties/${selectedProperty.id}/activate`
          body = {
            months: formData.months,
            reason: formData.reason.trim() || null
          }
          break
        case 'activate-invoice':
          endpoint = `/api/admin/properties/${selectedProperty.id}/activate-and-invoice`
          body = {
            months: formData.months,
            reason: formData.reason.trim() || null,
            plan: formData.plan,
            amount: formData.amount
          }
          break
        case 'deactivate':
          endpoint = `/api/admin/properties/${selectedProperty.id}/deactivate`
          body = {
            reason: formData.reason.trim()
          }
          break
      }

      console.log('📡 Making request to:', endpoint)
      console.log('📦 With body:', body)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      })
      
      console.log('📨 Response status:', response.status)
      const data = await response.json()
      console.log('📄 Response data:', data)
      
      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        setSelectedProperty(null)
        setActionType(null)
        setFormData({
          months: 3,
          reason: '',
          plan: 'Growth',
          amount: 299
        })
        await fetchProperties() // Refresh the list
      } else if (response.status === 401) {
        // Not authenticated as admin - redirect to admin login
        console.log('🔐 Admin authentication required, redirecting to login')
        window.location.href = '/admin/login'
        return
      } else {
        setMessage({ 
          type: 'error', 
          text: `Error: ${data.error || 'Unknown error'} ${data.details ? `(${data.details})` : ''}`
        })
      }
    } catch (error: any) {
      console.error('🚨 Action error:', error)
      setMessage({ type: 'error', text: `Network error: ${error.message}` })
    } finally {
      setActionLoading(null)
    }
  }

  const openModal = (property: Property, action: 'activate' | 'activate-invoice' | 'deactivate') => {
    console.log(`🎯 Opening ${action} modal for:`, property.name)
    setSelectedProperty(property)
    setActionType(action)
    setFormData({
      months: 3,
      reason: '',
      plan: 'Growth',
      amount: 299
    })
  }

  const closeModal = () => {
    setSelectedProperty(null)
    setActionType(null)
    setFormData({
      months: 3,
      reason: '',
      plan: 'Growth',
      amount: 299
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando propiedades...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🏠 Admin - Gestión de Propiedades</h1>
          <p className="text-gray-600 mt-2">
            Sistema completo de activación/desactivación con notificaciones automáticas
          </p>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              🔐 <strong>Nota:</strong> Esta página requiere autenticación de administrador. 
              Si no estás autenticado, serás redirigido automáticamente al login.
            </p>
          </div>
        </div>
        
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' ? 'bg-green-50 text-green-900 border-green-200' :
            'bg-red-50 text-red-900 border-red-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {message.type === 'success' ? '✅' : '❌'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Propiedades en Base de Datos ({properties.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              ⚡ Notificaciones automáticas + emails para todas las acciones
            </p>
          </div>

          {properties.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="text-6xl mb-4">🏠</div>
              <p>No hay propiedades registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Propiedad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Host
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Suscripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{property.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{property.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{property.host.name}</div>
                        <div className="text-sm text-gray-500">{property.host.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {property.city}, {property.country}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          property.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          property.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          property.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {property.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {property.subscriptionEndsAt ? 
                          new Date(property.subscriptionEndsAt).toLocaleDateString('es-ES') : 
                          'Sin suscripción'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {property.status !== 'ACTIVE' && (
                            <>
                              <button
                                onClick={() => openModal(property, 'activate')}
                                disabled={actionLoading === property.id}
                                className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50 transition-colors"
                              >
                                {actionLoading === property.id ? '⏳' : '✅'} Activar
                              </button>
                              <button
                                onClick={() => openModal(property, 'activate-invoice')}
                                disabled={actionLoading === property.id}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors"
                              >
                                {actionLoading === property.id ? '⏳' : '📄'} + Factura
                              </button>
                            </>
                          )}
                          {property.status === 'ACTIVE' && (
                            <button
                              onClick={() => openModal(property, 'deactivate')}
                              disabled={actionLoading === property.id}
                              className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                              {actionLoading === property.id ? '⏳' : '❌'} Desactivar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {selectedProperty && actionType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {actionType === 'activate' ? '✅ Activar Propiedad' :
                 actionType === 'activate-invoice' ? '📄 Activar con Factura' :
                 '❌ Desactivar Propiedad'}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Propiedad:</strong> {selectedProperty.name}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{selectedProperty.id}</code>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Host:</strong> {selectedProperty.host.name} ({selectedProperty.host.email})
                </p>
              </div>

              {(actionType === 'activate' || actionType === 'activate-invoice') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración (meses)
                  </label>
                  <select
                    value={formData.months}
                    onChange={(e) => setFormData(prev => ({ ...prev, months: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {[1,2,3,6,12].map(m => (
                      <option key={m} value={m}>{m} mes{m > 1 ? 'es' : ''}</option>
                    ))}
                  </select>
                </div>
              )}

              {actionType === 'activate-invoice' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan
                    </label>
                    <select
                      value={formData.plan}
                      onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Starter">Starter</option>
                      <option value="Growth">Growth</option>
                      <option value="Pro">Pro</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad (€)
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      step="0.01"
                    />
                  </div>
                </>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {actionType === 'deactivate' ? 'Motivo (obligatorio)' : 'Motivo (opcional)'}
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder={
                    actionType === 'deactivate' ? 'Motivo de la desactivación...' :
                    'Ej: Cliente VIP, promoción especial, etc.'
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  required={actionType === 'deactivate'}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAction}
                  disabled={actionLoading === selectedProperty.id || (actionType === 'deactivate' && !formData.reason.trim())}
                  className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    actionType === 'activate' ? 'bg-green-600 hover:bg-green-700' :
                    actionType === 'activate-invoice' ? 'bg-blue-600 hover:bg-blue-700' :
                    'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionLoading === selectedProperty.id ? 'Procesando...' : 
                   actionType === 'activate' ? 'Activar' :
                   actionType === 'activate-invoice' ? 'Activar + Facturar' :
                   'Desactivar'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">📧 Sistema de Notificaciones Automáticas:</h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>✅ Activar:</strong> Activa la propiedad sin generar factura. Envía notificación in-app + email.</li>
            <li>• <strong>📄 Activar + Factura:</strong> Activa la propiedad + genera factura automáticamente + 2 emails.</li>
            <li>• <strong>❌ Desactivar:</strong> Desactiva la propiedad + notificación + email al usuario.</li>
            <li>• <strong>🔧 Logs:</strong> Todas las acciones se registran en AdminActivityLog.</li>
            <li>• <strong>📧 Emails:</strong> Se envían automáticamente (requiere RESEND_API_KEY en Vercel).</li>
          </ul>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-md font-semibold text-yellow-900 mb-2">🔍 Debug Info:</h3>
          <p className="text-sm text-yellow-800">
            Esta página muestra las propiedades reales de la base de datos. Los errores 401/500 indican problemas de autenticación o IDs inexistentes.
          </p>
        </div>
      </div>
    </div>
  )
}