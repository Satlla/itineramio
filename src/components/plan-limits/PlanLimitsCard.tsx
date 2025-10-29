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

  return (
    <Card className="mb-6 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center text-base">
          <Crown className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-gray-600 font-normal">Plan:</span>
          <span className="text-[#00A699] underline underline-offset-4 decoration-1 font-[family-name:var(--font-satisfy)] font-normal ml-1.5 text-xl">{limits.planName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-sm font-medium text-gray-700">
              Propiedades utilizadas
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {limits.currentProperties} / {limits.maxProperties === 999 ? '∞' : limits.maxProperties}
            </span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-300 bg-gray-900"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Status Message */}
        <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
          <div className="flex items-start">
            {limits.canCreateMore ? (
              <CheckCircle className="w-5 h-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
            )}

            <div className="flex-1">
              {limits.canCreateMore ? (
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Puedes crear más propiedades</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {limits.planName === null
                      ? 'Incluye tu primera propiedad para comenzar'
                      : `Espacio para ${limits.maxProperties - limits.currentProperties} propiedades más`
                    }
                  </p>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Límite alcanzado</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {limits.creationBlockedReason || 'Has alcanzado el límite de tu plan actual'}
                  </p>

                  {limits.upgradeRequired && (
                    <div className="mt-3 flex items-center space-x-3">
                      <Link href={limits.upgradeUrl || '/account/billing'}>
                        <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
                          Actualizar Plan
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>

                      <div className="text-xs text-gray-600">
                        €{Number(limits.monthlyFee).toFixed(2)}/mes
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Plan Benefits */}
        {limits.planName === null && limits.currentProperties === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5">
            <h4 className="font-semibold text-gray-900 text-sm mb-2.5">Evaluación incluye</h4>
            <ul className="text-xs text-gray-700 space-y-1.5">
              <li>• 15 días de prueba</li>
              <li>• Zonas ilimitadas</li>
              <li>• QR codes personalizados</li>
              <li>• Analytics básicos</li>
            </ul>
          </div>
        )}

        {limits.upgradeRequired && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5">
            <h4 className="font-semibold text-gray-900 text-sm mb-2.5">Plan HOST incluye</h4>
            <ul className="text-xs text-gray-700 space-y-1.5">
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