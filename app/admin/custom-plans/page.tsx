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
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={plan.isActive ? 'text-red-600' : 'text-green-600'}
                      >
                        {plan.isActive ? 'Desactivar' : 'Activar'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}