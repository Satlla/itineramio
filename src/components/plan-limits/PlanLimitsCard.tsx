'use client'

import React from 'react'
import { AlertCircle, Crown, CheckCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import Link from 'next/link'

interface PlanLimitsCardProps {
  limits: {
    maxProperties: number
    currentProperties: number
    canCreateMore: boolean
    planName: string
    monthlyFee: number
    upgradeRequired: boolean
    upgradeMessage?: string
    canCreateProperty: boolean
    creationBlockedReason?: string
    upgradeUrl?: string
  }
}

export function PlanLimitsCard({ limits }: PlanLimitsCardProps) {
  const progressPercentage = (limits.currentProperties / Math.max(limits.maxProperties, 1)) * 100
  
  const getStatusColor = () => {
    if (limits.canCreateMore) return 'text-green-600'
    if (limits.upgradeRequired) return 'text-orange-600'
    return 'text-red-600'
  }

  const getProgressColor = () => {
    if (progressPercentage < 80) return 'bg-green-500'
    if (progressPercentage < 100) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <Card className="mb-6 border-2 border-dashed border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Crown className="w-5 h-5 mr-2 text-yellow-600" />
          Tu Plan: {limits.planName}
          {limits.monthlyFee > 0 && (
            <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
              €{limits.monthlyFee}/mes por propiedad
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Propiedades utilizadas
            </span>
            <span className={`text-sm font-semibold ${getStatusColor()}`}>
              {limits.currentProperties} / {limits.maxProperties === 999 ? '∞' : limits.maxProperties}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Status Message */}
        <div className={`p-4 rounded-lg border ${
          limits.canCreateMore 
            ? 'bg-green-50 border-green-200' 
            : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex items-start">
            {limits.canCreateMore ? (
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
            )}
            
            <div className="flex-1">
              {limits.canCreateMore ? (
                <div>
                  <h4 className="font-semibold text-green-900">✅ Puedes crear más propiedades</h4>
                  <p className="text-sm text-green-700 mt-1">
                    {limits.planName === 'Gratuito' 
                      ? '¡Tu primera propiedad es completamente gratuita!'
                      : `Tienes espacio para ${limits.maxProperties - limits.currentProperties} propiedades más.`
                    }
                  </p>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold text-orange-900">⚠️ Límite alcanzado</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    {limits.creationBlockedReason || 'Has alcanzado el límite de tu plan actual.'}
                  </p>
                  
                  {limits.upgradeRequired && (
                    <div className="mt-3 flex items-center space-x-3">
                      <Link href={limits.upgradeUrl || '/account/billing'}>
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                          <Crown className="w-4 h-4 mr-1" />
                          Actualizar Plan
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                      
                      <div className="text-xs text-orange-600">
                        Solo €{limits.monthlyFee}/mes por propiedad adicional
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Plan Benefits */}
        {limits.planName === 'Gratuito' && limits.currentProperties === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-semibold text-blue-900 text-sm mb-2">🎉 Plan Gratuito incluye:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 1 propiedad completamente gratis</li>
              <li>• Zonas ilimitadas</li>
              <li>• QR codes personalizados</li>
              <li>• Analytics básicos</li>
            </ul>
          </div>
        )}

        {limits.upgradeRequired && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h4 className="font-semibold text-purple-900 text-sm mb-2">🚀 Plan Growth incluye:</h4>
            <ul className="text-xs text-purple-700 space-y-1">
              <li>• Propiedades ilimitadas</li>
              <li>• Soporte prioritario</li>
              <li>• Analytics avanzados</li>
              <li>• Facturas automáticas</li>
              <li>• Descuentos por volumen (10+ propiedades: €2.00/mes)</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}