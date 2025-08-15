'use client'

import React from 'react'
import { 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Calendar,
  Shield,
  ShieldAlert
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'

interface Property {
  id: string
  name: string
  slug: string
  createdAt: string
  isActive: boolean
  isCovered: boolean
  needsSubscription: boolean
  coveringSubscription?: {
    id: string
    planName: string
    endDate: string
    daysUntilExpiration: number
    status: string
  }
}

interface PropertySubscriptionStatusProps {
  properties: Property[]
  usage: {
    freeLimit: number
    usedSlots: number
    availableSlots: number
    totalProperties: number
    uncoveredProperties: number
  }
}

export const PropertySubscriptionStatus: React.FC<PropertySubscriptionStatusProps> = ({
  properties,
  usage
}) => {
  const getPropertyStatusIcon = (property: Property) => {
    if (property.isCovered) {
      if (property.coveringSubscription?.status === 'EXPIRING_SOON') {
        return <ShieldAlert className="w-4 h-4 text-yellow-600" />
      }
      return <Shield className="w-4 h-4 text-green-600" />
    }
    return <AlertCircle className="w-4 h-4 text-red-600" />
  }

  const getPropertyStatusText = (property: Property) => {
    if (property.isCovered) {
      if (property.coveringSubscription?.status === 'EXPIRING_SOON') {
        return 'Próxima a vencer'
      }
      return 'Protegida'
    }
    return 'Sin suscripción'
  }

  const getPropertyStatusColor = (property: Property) => {
    if (property.isCovered) {
      if (property.coveringSubscription?.status === 'EXPIRING_SOON') {
        return 'bg-yellow-50 border-yellow-200'
      }
      return 'bg-green-50 border-green-200'
    }
    return 'bg-red-50 border-red-200'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-blue-600" />
            Resumen de Propiedades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{usage.totalProperties}</div>
              <div className="text-sm text-gray-600">Total Propiedades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{usage.usedSlots}</div>
              <div className="text-sm text-gray-600">Protegidas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{usage.uncoveredProperties}</div>
              <div className="text-sm text-gray-600">Sin Suscripción</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{usage.availableSlots}</div>
              <div className="text-sm text-gray-600">Slots Disponibles</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Uso de suscripciones</span>
              <span>{usage.usedSlots} / {Math.max(usage.availableSlots, usage.totalProperties)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  usage.uncoveredProperties > 0 ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{ 
                  width: `${Math.min(100, (usage.usedSlots / Math.max(usage.totalProperties, 1)) * 100)}%` 
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties List */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Propiedades</CardTitle>
          <p className="text-sm text-gray-600">
            Revisa qué propiedades están cubiertas por tus suscripciones
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {properties.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tienes propiedades
                </h3>
                <p className="text-gray-600">
                  Crea tu primera propiedad para empezar a usar el sistema
                </p>
              </div>
            ) : (
              properties.map((property, index) => (
                <div 
                  key={property.id}
                  className={`p-4 rounded-lg border transition-all ${getPropertyStatusColor(property)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getPropertyStatusIcon(property)}
                      <div>
                        <div className="font-medium text-gray-900">{property.name}</div>
                        <div className="text-sm text-gray-600">
                          Creada el {formatDate(property.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        property.isCovered ? 
                          property.coveringSubscription?.status === 'EXPIRING_SOON' ? 'text-yellow-700' : 'text-green-700'
                        : 'text-red-700'
                      }`}>
                        {getPropertyStatusText(property)}
                      </div>
                      
                      {property.coveringSubscription && (
                        <div className="text-xs text-gray-600 mt-1">
                          <div>{property.coveringSubscription.planName}</div>
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Vence: {formatDate(property.coveringSubscription.endDate)}
                          </div>
                          {property.coveringSubscription.daysUntilExpiration <= 7 && (
                            <div className="text-yellow-600 font-medium">
                              {property.coveringSubscription.daysUntilExpiration} días restantes
                            </div>
                          )}
                        </div>
                      )}
                      
                      {property.needsSubscription && (
                        <div className="text-xs text-red-600 mt-1">
                          Necesita suscripción activa
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}