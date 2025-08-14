'use client'

import React, { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Plus, 
  Edit2,
  Trash2,
  Check,
  X,
  DollarSign,
  MessageSquare,
  Building2,
  Zap,
  Shield,
  Users
} from 'lucide-react'

interface Plan {
  id: string
  name: string
  description: string | null
  priceMonthly: number
  priceYearly: number | null
  aiMessagesIncluded: number
  maxProperties: number
  features: string[]
  isActive: boolean
  _count?: {
    subscriptions: number
  }
}

export default function PlansManagementPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/plans')
      const data = await response.json()
      if (data.success) {
        setPlans(data.plans)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePlanStatus = async (planId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/plans/${planId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })
      
      if (response.ok) {
        fetchPlans()
      }
    } catch (error) {
      console.error('Error toggling plan status:', error)
    }
  }

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('chatbot') || feature.includes('AI')) return <MessageSquare className="w-4 h-4" />
    if (feature.includes('analytics')) return <Zap className="w-4 h-4" />
    if (feature.includes('whatsapp')) return <MessageSquare className="w-4 h-4" />
    if (feature.includes('priority')) return <Shield className="w-4 h-4" />
    if (feature.includes('team')) return <Users className="w-4 h-4" />
    return <Check className="w-4 h-4" />
  }

  const formatFeatureName = (feature: string) => {
    const featureNames: { [key: string]: string } = {
      'ai_chatbot': 'Chatbot IA',
      'analytics': 'Analíticas Avanzadas',
      'whatsapp_notifications': 'Notificaciones WhatsApp',
      'priority_support': 'Soporte Prioritario',
      'custom_branding': 'Branding Personalizado',
      'api_access': 'Acceso API',
      'team_members': 'Miembros del Equipo',
      'advanced_analytics': 'Analíticas Avanzadas',
      'white_label': 'White Label'
    }
    return featureNames[feature] || feature
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Planes</h1>
          <p className="text-gray-600 mt-2">
            {plans.length} planes • {plans.filter(p => p.isActive).length} activos
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`bg-white rounded-lg border-2 ${
            !plan.isActive ? 'border-gray-200 opacity-75' : 
            plan.name === 'Enterprise' ? 'border-purple-500' :
            plan.name === 'Profesional' ? 'border-blue-500' :
            plan.name === 'Premium' ? 'border-green-500' :
            'border-gray-200'
          }`}>
            <div className="p-6">
              {/* Plan Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                  )}
                </div>
                <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                  plan.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {plan.isActive ? 'Activo' : 'Inactivo'}
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">€{plan.priceMonthly}</span>
                  <span className="text-gray-600 ml-1">/mes</span>
                </div>
                {plan.priceYearly && (
                  <p className="text-sm text-gray-600 mt-1">
                    €{plan.priceYearly}/año (ahorra €{(Number(plan.priceMonthly) * 12 - Number(plan.priceYearly)).toFixed(2)})
                  </p>
                )}
              </div>

              {/* Key Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm">
                  <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-700">
                    {plan.maxProperties === -1 ? 'Propiedades ilimitadas' : `${plan.maxProperties} propiedad${plan.maxProperties !== 1 ? 'es' : ''}`}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <MessageSquare className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-700">
                    {plan.aiMessagesIncluded === -1 ? 'Mensajes IA ilimitados' : `${plan.aiMessagesIncluded} mensajes IA/mes`}
                  </span>
                </div>
              </div>

              {/* Features List */}
              {plan.features.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Características</p>
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm">
                        {getFeatureIcon(feature)}
                        <span className="ml-2 text-gray-700">{formatFeatureName(feature)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subscribers Count */}
              {plan._count && (
                <div className="mb-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    <Users className="w-4 h-4 inline mr-1" />
                    {plan._count.subscriptions} suscriptor{plan._count.subscriptions !== 1 ? 'es' : ''}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingPlan(plan)}
                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 flex items-center justify-center"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Editar
                </button>
                <button
                  onClick={() => togglePlanStatus(plan.id, plan.isActive)}
                  className={`px-3 py-2 text-sm rounded-lg flex items-center ${
                    plan.isActive
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {plan.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Plan Modal */}
      {(showCreateModal || editingPlan) && (
        <PlanFormModal
          plan={editingPlan}
          onClose={() => {
            setShowCreateModal(false)
            setEditingPlan(null)
          }}
          onSuccess={() => {
            setShowCreateModal(false)
            setEditingPlan(null)
            fetchPlans()
          }}
        />
      )}
    </div>
  )
}

interface PlanFormModalProps {
  plan: Plan | null
  onClose: () => void
  onSuccess: () => void
}

function PlanFormModal({ plan, onClose, onSuccess }: PlanFormModalProps) {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    description: plan?.description || '',
    priceMonthly: plan?.priceMonthly?.toString() || '',
    priceYearly: plan?.priceYearly?.toString() || '',
    aiMessagesIncluded: plan?.aiMessagesIncluded?.toString() || '0',
    maxProperties: plan?.maxProperties?.toString() || '1',
    features: plan?.features || []
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})

  const availableFeatures = [
    { id: 'ai_chatbot', name: 'Chatbot IA' },
    { id: 'analytics', name: 'Analíticas Básicas' },
    { id: 'advanced_analytics', name: 'Analíticas Avanzadas' },
    { id: 'whatsapp_notifications', name: 'Notificaciones WhatsApp' },
    { id: 'priority_support', name: 'Soporte Prioritario' },
    { id: 'custom_branding', name: 'Branding Personalizado' },
    { id: 'api_access', name: 'Acceso API' },
    { id: 'team_members', name: 'Miembros del Equipo' },
    { id: 'white_label', name: 'White Label' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const url = plan 
        ? `/api/admin/plans/${plan.id}`
        : '/api/admin/plans'
      
      const response = await fetch(url, {
        method: plan ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          priceMonthly: parseFloat(formData.priceMonthly),
          priceYearly: formData.priceYearly ? parseFloat(formData.priceYearly) : null,
          aiMessagesIncluded: formData.aiMessagesIncluded === '-1' ? -1 : parseInt(formData.aiMessagesIncluded),
          maxProperties: formData.maxProperties === '-1' ? -1 : parseInt(formData.maxProperties)
        })
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
      } else {
        setErrors({ general: data.error })
      }
    } catch (error) {
      setErrors({ general: 'Error saving plan. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const toggleFeature = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {plan ? 'Editar Plan' : 'Crear Nuevo Plan'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Plan *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Descripción corta del plan"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Precios</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Precio Mensual (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.priceMonthly}
                    onChange={(e) => setFormData({ ...formData, priceMonthly: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Precio Anual (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.priceYearly}
                    onChange={(e) => setFormData({ ...formData, priceYearly: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Dejar vacío si no hay descuento anual"
                  />
                </div>
              </div>
            </div>

            {/* Limits */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Límites</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Propiedades Máximas
                  </label>
                  <select
                    value={formData.maxProperties}
                    onChange={(e) => setFormData({ ...formData, maxProperties: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="1">1 propiedad</option>
                    <option value="3">3 propiedades</option>
                    <option value="5">5 propiedades</option>
                    <option value="10">10 propiedades</option>
                    <option value="25">25 propiedades</option>
                    <option value="50">50 propiedades</option>
                    <option value="-1">Ilimitadas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Mensajes IA Mensuales
                  </label>
                  <select
                    value={formData.aiMessagesIncluded}
                    onChange={(e) => setFormData({ ...formData, aiMessagesIncluded: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="0">Sin mensajes IA</option>
                    <option value="50">50 mensajes</option>
                    <option value="100">100 mensajes</option>
                    <option value="250">250 mensajes</option>
                    <option value="500">500 mensajes</option>
                    <option value="1000">1,000 mensajes</option>
                    <option value="5000">5,000 mensajes</option>
                    <option value="-1">Ilimitados</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Características</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableFeatures.map((feature) => (
                  <label key={feature.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature.id)}
                      onChange={() => toggleFeature(feature.id)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{feature.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : plan ? 'Guardar Cambios' : 'Crear Plan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}