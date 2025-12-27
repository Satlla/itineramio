'use client'

import React from 'react'
import { 
  Crown, 
  Calendar, 
  Building2, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'

interface BillingOverviewProps {
  currentPlan: string
  planStatus: string
  propertyCount: number
  subscriptionsData: {
    activeSubscriptions: number
    totalSlots: number
    nextExpiration?: {
      date: string
      daysUntil: number
      planName: string
    }
    expiringCount: number
    expiredCount: number
  }
  onBuyNewSubscription?: () => void
  onRenewAll?: () => void
  isLoading?: boolean
}

export const BillingOverview: React.FC<BillingOverviewProps> = ({
  currentPlan,
  planStatus,
  propertyCount,
  subscriptionsData,
  onBuyNewSubscription,
  onRenewAll,
  isLoading = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'FREE':
        return 'Sin plan activo'
      case 'BASIC':
        return 'Plan Básico'
      case 'PREMIUM':
        return 'Plan Premium'
      case 'PRO':
        return 'Plan Pro'
      default:
        return plan
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'FREE':
        return 'text-gray-600'
      case 'BASIC':
        return 'text-blue-600'
      case 'PREMIUM':
        return 'text-purple-600'
      case 'PRO':
        return 'text-gold-600'
      default:
        return 'text-blue-600'
    }
  }

  const getAccountHealthStatus = () => {
    if (subscriptionsData.expiredCount > 0) {
      return {
        status: 'critical',
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
        text: 'Atención requerida',
        description: `Tienes ${subscriptionsData.expiredCount} suscripción(es) vencida(s)`
      }
    }
    
    if (subscriptionsData.expiringCount > 0) {
      return {
        status: 'warning',
        icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
        text: 'Renovación próxima',
        description: `${subscriptionsData.expiringCount} suscripción(es) vencen pronto`
      }
    }
    
    return {
      status: 'good',
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      text: 'Todo en orden',
      description: 'Todas tus suscripciones están activas'
    }
  }

  const accountHealth = getAccountHealthStatus()

  // CORRECCIÓN: Si el usuario tiene suscripciones activas, NO tiene propiedad gratis adicional
  // Solo tiene las propiedades que pagó en su plan
  const hasActiveSubscriptions = subscriptionsData.activeSubscriptions > 0
  const totalAvailableSlots = subscriptionsData.totalSlots  // Ya no sumamos +1 gratis
  const uncoveredProperties = Math.max(0, propertyCount - totalAvailableSlots)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Account Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Plan */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Crown className={`w-6 h-6 ${getPlanColor(currentPlan)}`} />
              </div>
              <div className="ml-4">
                <div className="text-sm text-gray-600">Plan Actual</div>
                <div className={`text-lg font-bold ${getPlanColor(currentPlan)}`}>
                  {getPlanDisplayName(currentPlan)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Usage */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm text-gray-600">Propiedades</div>
                <div className="text-lg font-bold text-gray-900">
                  {propertyCount} / {totalAvailableSlots}
                  <span className="text-sm text-gray-500 ml-1">
                    disponibles
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm text-gray-600">Suscripciones</div>
                <div className="text-lg font-bold text-gray-900">
                  {subscriptionsData.activeSubscriptions}
                  <span className="text-sm text-gray-500 ml-1">activas</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Health */}
        <Card className={`${
          accountHealth.status === 'critical' ? 'border-red-200 bg-red-50' :
          accountHealth.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
          'border-green-200 bg-green-50'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-white rounded-lg">
                {accountHealth.icon}
              </div>
              <div className="ml-4">
                <div className="text-sm text-gray-600">Estado de Cuenta</div>
                <div className="text-sm font-medium">
                  {accountHealth.text}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Status & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Expiration Alert */}
        {subscriptionsData.nextExpiration && (
          <Card className="border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-800">
                <Calendar className="w-5 h-5 mr-2" />
                Próximo Vencimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  Tu suscripción <span className="font-medium">{subscriptionsData.nextExpiration.planName}</span> vence en:
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {subscriptionsData.nextExpiration.daysUntil} días
                </div>
                <div className="text-sm text-gray-600">
                  Fecha de vencimiento: {formatDate(subscriptionsData.nextExpiration.date)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2 text-blue-600" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={onBuyNewSubscription}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Comprar Nueva Suscripción
            </Button>
            
            {(subscriptionsData.expiringCount > 0 || subscriptionsData.expiredCount > 0) && onRenewAll && (
              <Button
                onClick={onRenewAll}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Renovar Todas las Suscripciones
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {uncoveredProperties > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <div className="font-medium text-red-800">
                  {uncoveredProperties} propiedad(es) sin cobertura
                </div>
                <div className="text-sm text-red-600 mt-1">
                  Tienes propiedades que no están cubiertas por ninguna suscripción activa. 
                  Considera comprar una suscripción adicional para proteger todas tus propiedades.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}