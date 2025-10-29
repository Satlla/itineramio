'use client'

import React from 'react'
import { 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  Crown,
  Building2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'

interface SubscriptionCardProps {
  subscription: {
    id: string
    status: string
    startDate: string
    endDate: string
    daysUntilExpiration: number
    plan?: {
      name: string
      priceMonthly: number
      maxProperties: number
    }
  }
  onRenew?: (subscriptionId: string) => void
  isRenewing?: boolean
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onRenew,
  isRenewing = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'EXPIRING_SOON':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle2 className="w-4 h-4" />
      case 'EXPIRING_SOON':
        return <AlertTriangle className="w-4 h-4" />
      case 'EXPIRED':
        return <XCircle className="w-4 h-4" />
      default:
        return <CheckCircle2 className="w-4 h-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Activa'
      case 'EXPIRING_SOON':
        return 'Próxima a vencer'
      case 'EXPIRED':
        return 'Vencida'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const showRenewButton = subscription.status === 'EXPIRING_SOON' || subscription.status === 'EXPIRED'

  // Calcular período de facturación basado en fechas
  const calculateBillingPeriod = () => {
    const start = new Date(subscription.startDate)
    const end = new Date(subscription.endDate)
    const monthsDiff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))

    if (monthsDiff <= 1) return { period: 'Mensual', months: 1 }
    if (monthsDiff >= 5 && monthsDiff <= 7) return { period: 'Semestral', months: 6 }
    if (monthsDiff >= 11 && monthsDiff <= 13) return { period: 'Anual', months: 12 }
    return { period: 'Personalizado', months: monthsDiff }
  }

  const billingPeriod = calculateBillingPeriod()
  const totalPrice = subscription.plan?.priceMonthly
    ? (subscription.plan.priceMonthly * billingPeriod.months * (
        billingPeriod.months === 6 ? 0.9 :  // -10% descuento semestral
        billingPeriod.months === 12 ? 0.8 : // -20% descuento anual
        1
      ))
    : 0

  return (
    <Card className={`hover:shadow-md transition-shadow ${
      subscription.status === 'EXPIRING_SOON' ? 'border-yellow-300' :
      subscription.status === 'EXPIRED' ? 'border-red-300' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">
              {subscription.plan?.name || 'Plan Personalizado'}
            </CardTitle>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(subscription.status)}`}>
            {getStatusIcon(subscription.status)}
            <span className="ml-1">{getStatusText(subscription.status)}</span>
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Plan Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Pago {billingPeriod.period.toLowerCase()}</div>
            <div className="font-semibold text-lg text-green-600">
              €{totalPrice.toFixed(2)}
            </div>
            {billingPeriod.months > 1 && (
              <div className="text-xs text-gray-500 mt-1">
                €{subscription.plan?.priceMonthly?.toFixed(2)}/mes × {billingPeriod.months}
                {billingPeriod.months === 6 && ' (-10%)'}
                {billingPeriod.months === 12 && ' (-20%)'}
              </div>
            )}
          </div>
          <div>
            <div className="text-sm text-gray-600">Propiedades incluidas</div>
            <div className="font-semibold text-lg flex items-center">
              <Building2 className="w-4 h-4 mr-1 text-gray-500" />
              {subscription.plan?.maxProperties || 0}
            </div>
          </div>
        </div>

        {/* Date Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Inicio:</span>
            <span className="font-medium">{formatDate(subscription.startDate)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Vencimiento:</span>
            <span className={`font-medium ${
              subscription.status === 'EXPIRING_SOON' ? 'text-yellow-600' :
              subscription.status === 'EXPIRED' ? 'text-red-600' : 'text-gray-900'
            }`}>
              {formatDate(subscription.endDate)}
            </span>
          </div>
          
          {/* Days until expiration */}
          {subscription.daysUntilExpiration >= 0 && subscription.status !== 'EXPIRED' && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Días restantes:</span>
              <span className={`font-medium ${
                subscription.daysUntilExpiration <= 7 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                <Calendar className="w-4 h-4 inline mr-1" />
                {subscription.daysUntilExpiration} días
              </span>
            </div>
          )}
        </div>

        {/* Renewal Action */}
        {showRenewButton && onRenew && (
          <div className="pt-2 border-t">
            <Button
              onClick={() => onRenew(subscription.id)}
              disabled={isRenewing}
              className={`w-full ${
                subscription.status === 'EXPIRED' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {isRenewing ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {isRenewing ? 'Renovando...' : 'Renovar Suscripción'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}