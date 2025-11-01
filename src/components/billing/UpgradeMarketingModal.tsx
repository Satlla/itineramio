/**
 * Modal de marketing estilo Ionos para upgrades de plan
 * Muestra ahorro por propiedad y mensaje de prorrateo
 */

import React from 'react'
import { X, TrendingUp, Euro, Calendar } from 'lucide-react'
import { generateUpgradeMessages } from '../../lib/billing/upgradeService'
import { PLANS } from '../../config/plans'

interface UpgradeMarketingModalProps {
  preview: {
    fromPlan: { name: string; monthly: number }
    toPlan: { name: string; monthly: number }
    totalProperties: number
    currentUnitPrice: number
    newUnitPrice: number
    savingsPerProperty: number
    prorationRefund: number
    immediateCharge: number
  }
  onClose: () => void
  onConfirm: () => void
}

export function UpgradeMarketingModal({ preview, onClose, onConfirm }: UpgradeMarketingModalProps) {
  const messages = generateUpgradeMessages(preview)
  
  // Función helper para obtener máximo de propiedades por plan
  const getMaxProperties = (planName: string): number => {
    // Buscar el plan por nombre (case insensitive)
    const plan = Object.values(PLANS).find(p => 
      p.name.toLowerCase() === planName.toLowerCase()
    )
    return plan?.maxProperties || 0
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-[90vw] sm:max-w-sm md:max-w-md w-full p-3 sm:p-4 md:p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2">
            {messages.headline}
          </h3>

          <p className="text-gray-600">
            {messages.savings}
          </p>
        </div>

        {/* Ahorro destacado */}
        {preview.savingsPerProperty > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-600 font-medium">Ahorro por propiedad</div>
                <div className="text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl font-bold text-green-700">
                  €{preview.savingsPerProperty.toFixed(2)}
                </div>
              </div>
              <Euro className="w-8 h-8 text-green-500" />
            </div>
          </div>
        )}

        {/* Comparación de precios */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Plan actual</div>
            <div className="font-semibold text-gray-900">{preview.fromPlan.name}</div>
            <div className="text-sm text-gray-600">€{preview.currentUnitPrice}/prop</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="text-xs text-blue-600 mb-1">Nuevo plan</div>
            <div className="font-semibold text-blue-900">{preview.toPlan.name}</div>
            <div className="text-sm text-blue-700">€{preview.newUnitPrice.toFixed(2)}/prop</div>
          </div>
        </div>

        {/* Mensaje de prorrateo */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Calendar className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-900 mb-1">Prorrateo automático</div>
              <div className="text-blue-700">
                {messages.proration}
              </div>
            </div>
          </div>
        </div>

        {/* Resumen financiero */}
        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <div className="text-sm font-medium text-gray-900 mb-3">Resumen del upgrade</div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Plan {preview.toPlan.name}</span>
              <span className="text-gray-900">€{preview.toPlan.monthly}/mes</span>
            </div>
            
            <div className="flex justify-between text-green-600">
              <span>Descuento prorrateo</span>
              <span>-€{preview.prorationRefund.toFixed(2)}</span>
            </div>
            
            <hr className="my-2" />
            
            <div className="flex justify-between font-medium text-gray-900">
              <span>Cargo inmediato</span>
              <span>€{preview.immediateCharge.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancelar
          </button>
          
          <button
            onClick={onConfirm}
            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
          >
            Confirmar Upgrade
          </button>
        </div>

        {/* Nota legal */}
        <p className="text-xs text-gray-500 text-center mt-4">
          El upgrade será efectivo inmediatamente. Podrás gestionar hasta {getMaxProperties(preview.toPlan.name)} propiedades.
        </p>
      </div>
    </div>
  )
}