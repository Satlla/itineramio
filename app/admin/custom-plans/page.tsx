'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus,
  Edit,
  Users,
  Star,
  Building,
  Euro,
  Settings,
  Check,
  X,
  Eye
} from 'lucide-react'
import { Button } from '../../../src/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/Card'

interface CustomPlan {
  id: string
  name: string
  description: string | null
  pricePerProperty: number
  minProperties: number
  maxProperties: number | null
  features: string[]
  restrictions: any
  isForHotels: boolean
  maxZonesPerProperty: number | null
  isActive: boolean
  requiresApproval: boolean
  createdAt: string
  subscriptions: Array<{
    id: string
    userId: string
    status: string
    startDate: string
    endDate: string | null
    user: {
      name: string
      email: string
    }
  }>
}

interface Stats {
  totalPlans: number
  activePlans: number
  hotelPlans: number
  totalSubscriptions: number
  activeSubscriptions: number
}

export default function CustomPlansAdminPage() {
  const [customPlans, setCustomPlans] = useState<CustomPlan[]>([])
  const [stats, setStats] = useState<Stats>({
    totalPlans: 0,
    activePlans: 0,
    hotelPlans: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0
  })
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<CustomPlan | null>(null)
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)

  useEffect(() => {
    fetchCustomPlans()
  }, [])

  const fetchCustomPlans = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/custom-plans')
      if (response.ok) {
        const data = await response.json()
        setCustomPlans(data.customPlans || [])
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error('Error fetching custom plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePlanStatus = async (planId: string, currentStatus: boolean) => {
    try {
      setProcessingPlan(planId)
      const response = await fetch(`/api/admin/custom-plans/${planId}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })
      
      if (response.ok) {
        await fetchCustomPlans()
      } else {
        const error = await response.json()
        alert(`Error: ${error.message || 'Error al cambiar estado del plan'}`)
      }
    } catch (error) {
      alert('Error al cambiar estado del plan')
    } finally {
      setProcessingPlan(null)
    }
  }

  const formatFeatures = (features: string[]) => {
    const featureLabels: { [key: string]: string } = {
      'priority_support': 'Soporte prioritario',
      'custom_branding': 'Marca personalizada',
      'analytics_reports': 'Reportes analytics',
      'api_access': 'Acceso API',
      'white_label': 'White label',
      'basic_support': 'Soporte básico',
      'extended_zones': 'Zonas extendidas',
      '24_7_support': 'Soporte 24/7',
      'dedicated_manager': 'Manager dedicado'
    }

    return features.map(f => featureLabels[f] || f).join(', ')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planes Personalizados</h1>
          <p className="text-gray-600 mt-2">
            Gestiona planes especiales para hoteles, empresas y clientes VIP
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Plan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">{stats.totalPlans}</h3>
                <p className="text-sm text-gray-600">Total planes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Check className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">{stats.activePlans}</h3>
                <p className="text-sm text-gray-600">Planes activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">{stats.hotelPlans}</h3>
                <p className="text-sm text-gray-600">Planes hotel</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">{stats.totalSubscriptions}</h3>
                <p className="text-sm text-gray-600">Suscripciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Euro className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">{stats.activeSubscriptions}</h3>
                <p className="text-sm text-gray-600">Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Plans List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Planes Personalizados</CardTitle>
        </CardHeader>
        <CardContent>
          {customPlans.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay planes personalizados
              </h3>
              <p className="text-gray-600">
                Crea tu primer plan personalizado para hoteles o empresas
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {customPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-4 ${
                    plan.isActive
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {plan.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          plan.isForHotels
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {plan.isForHotels ? 'Hotel' : 'General'}
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          €{plan.pricePerProperty}/prop
                        </span>
                      </div>
                      
                      {plan.description && (
                        <p className="text-gray-600 mb-3">
                          {plan.description}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-gray-600">Propiedades: </span>
                            <span className="font-medium">
                              {plan.minProperties} - {plan.maxProperties || '∞'}
                            </span>
                          </div>
                          
                          {plan.maxZonesPerProperty && (
                            <div className="text-sm">
                              <span className="text-gray-600">Máx zonas/prop: </span>
                              <span className="font-medium">{plan.maxZonesPerProperty}</span>
                            </div>
                          )}
                          
                          <div className="text-sm">
                            <span className="text-gray-600">Suscripciones: </span>
                            <span className="font-medium">
                              {plan.subscriptions.length} total, {' '}
                              {plan.subscriptions.filter(s => s.status === 'ACTIVE').length} activas
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {plan.features.length > 0 && (
                            <div className="text-sm">
                              <span className="text-gray-600">Características: </span>
                              <span className="font-medium">
                                {formatFeatures(plan.features)}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {plan.requiresApproval && (
                              <div className="flex items-center">
                                <Settings className="w-4 h-4 mr-1" />
                                Requiere aprobación
                              </div>
                            )}
                            
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {plan.isActive ? 'Activo' : 'Inactivo'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Active Subscriptions */}
                      {plan.subscriptions.filter(s => s.status === 'ACTIVE').length > 0 && (
                        <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Suscripciones Activas:
                          </h4>
                          <div className="space-y-1">
                            {plan.subscriptions.filter(s => s.status === 'ACTIVE').map((sub) => (
                              <div key={sub.id} className="text-sm text-gray-600 flex items-center justify-between">
                                <span>{sub.user.name} ({sub.user.email})</span>
                                <span className="text-xs text-gray-500">
                                  Desde {new Date(sub.startDate).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingPlan(plan)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => togglePlanStatus(plan.id, plan.isActive)}
                        disabled={processingPlan === plan.id}
                        className={plan.isActive ? 'text-red-600 border-red-300 hover:bg-red-50' : 'text-green-600 border-green-300 hover:bg-green-50'}
                      >
                        {processingPlan === plan.id ? '...' : (plan.isActive ? 'Desactivar' : 'Activar')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <EditPlanModal
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSave={fetchCustomPlans}
        />
      )}
    </div>
  )
}

// Modal component for editing plans
function EditPlanModal({ 
  plan, 
  onClose, 
  onSave 
}: { 
  plan: CustomPlan
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    name: plan.name,
    description: plan.description || '',
    pricePerProperty: plan.pricePerProperty,
    minProperties: plan.minProperties,
    maxProperties: plan.maxProperties || '',
    maxZonesPerProperty: plan.maxZonesPerProperty || '',
    isForHotels: plan.isForHotels,
    requiresApproval: plan.requiresApproval,
    features: plan.features
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      
      const response = await fetch(`/api/admin/custom-plans/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxProperties: formData.maxProperties ? Number(formData.maxProperties) : null,
          maxZonesPerProperty: formData.maxZonesPerProperty ? Number(formData.maxZonesPerProperty) : null,
        })
      })
      
      if (response.ok) {
        onSave()
        onClose()
      } else {
        const error = await response.json()
        alert(`Error: ${error.message || 'Error al actualizar plan'}`)
      }
    } catch (error) {
      alert('Error al actualizar plan')
    } finally {
      setSaving(false)
    }
  }

  const availableFeatures = [
    { key: 'priority_support', label: 'Soporte prioritario' },
    { key: 'custom_branding', label: 'Marca personalizada' },
    { key: 'analytics_reports', label: 'Reportes analytics' },
    { key: 'api_access', label: 'Acceso API' },
    { key: 'white_label', label: 'White label' },
    { key: 'basic_support', label: 'Soporte básico' },
    { key: 'extended_zones', label: 'Zonas extendidas' },
    { key: '24_7_support', label: 'Soporte 24/7' },
    { key: 'dedicated_manager', label: 'Manager dedicado' }
  ]

  const toggleFeature = (featureKey: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureKey)
        ? prev.features.filter(f => f !== featureKey)
        : [...prev.features, featureKey]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Editar Plan: {plan.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Plan
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio por Propiedad (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pricePerProperty}
                  onChange={(e) => setFormData({ ...formData, pricePerProperty: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Propiedades
                </label>
                <input
                  type="number"
                  value={formData.minProperties}
                  onChange={(e) => setFormData({ ...formData, minProperties: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Propiedades
                </label>
                <input
                  type="number"
                  value={formData.maxProperties}
                  onChange={(e) => setFormData({ ...formData, maxProperties: e.target.value })}
                  placeholder="Ilimitado"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Zonas/Prop
                </label>
                <input
                  type="number"
                  value={formData.maxZonesPerProperty}
                  onChange={(e) => setFormData({ ...formData, maxZonesPerProperty: e.target.value })}
                  placeholder="Ilimitado"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isForHotels}
                  onChange={(e) => setFormData({ ...formData, isForHotels: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Plan específico para hoteles
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.requiresApproval}
                  onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Requiere aprobación admin
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Características Incluidas
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableFeatures.map((feature) => (
                  <div key={feature.key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature.key)}
                      onChange={() => toggleFeature(feature.key)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      {feature.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}