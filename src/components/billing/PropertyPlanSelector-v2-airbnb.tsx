'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { PLANS, type PlanCode } from '../../config/plans'
import { toast } from 'react-hot-toast'
import { Calculator, Check } from 'lucide-react'

const BILLING_PERIODS = {
  semiannual: { label: 'Semestral', months: 6, discount: 0.10 },
  annual: { label: 'Anual', months: 12, discount: 0.20 }
} as const

type BillingPeriod = keyof typeof BILLING_PERIODS

interface PropertyPlanSelectorProps {
  currentProperties: number
  currentPlan?: {
    code: string
    name: string
    term?: string
    hasActiveSubscription?: boolean
    daysUntilExpiry?: number
    nextPaymentAmount?: number
    nextPaymentDate?: string
    maxProperties?: number
  } | null
  onPlanSelect: (plan: any, billingPeriod: string, propertyCount: number, prorationData?: any) => void
  loading?: boolean
}

export default function PropertyPlanSelector({
  currentProperties,
  currentPlan,
  onPlanSelect,
  loading = false
}: PropertyPlanSelectorProps) {
  const [propertyCount, setPropertyCount] = useState(Math.max(currentProperties || 1, 1))
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('semiannual')
  const [prorationData, setProrationData] = useState<any>(null)

  // Get visible plans (BASIC, HOST, SUPERHOST)
  const visiblePlans = useMemo(() => {
    return Object.values(PLANS)
      .filter(plan => ['BASIC', 'HOST', 'SUPERHOST'].includes(plan.code))
      .sort((a, b) => a.maxProperties - b.maxProperties)
  }, [])

  // Calculate which plan is required for current property count
  const requiredPlan = useMemo(() => {
    return visiblePlans.find(plan => propertyCount <= plan.maxProperties) || visiblePlans[visiblePlans.length - 1]
  }, [propertyCount, visiblePlans])

  // Calculate prices
  const monthlyPrice = requiredPlan.priceMonthly
  const basePrice = monthlyPrice * BILLING_PERIODS[billingPeriod].months
  const discount = basePrice * BILLING_PERIODS[billingPeriod].discount
  const finalPrice = basePrice - discount

  // Check if selection is valid (no downgrade, no same plan)
  const isValidSelection = useMemo(() => {
    if (!currentPlan?.hasActiveSubscription) return true

    const currentPlanObj = visiblePlans.find(p => p.code === currentPlan.code)
    if (!currentPlanObj) return true

    // Map term to billing period
    const currentBillingPeriod = currentPlan.term === 'annual' ? 'annual' :
                                  currentPlan.term === 'semiannual' ? 'semiannual' :
                                  'semiannual'

    // Same plan and same period = not allowed
    if (requiredPlan.code === currentPlan.code && billingPeriod === currentBillingPeriod) {
      return false
    }

    // Check if it's a downgrade
    const currentPlanIndex = visiblePlans.findIndex(p => p.code === currentPlan.code)
    const selectedPlanIndex = visiblePlans.findIndex(p => p.code === requiredPlan.code)

    // Downgrade in plan = not allowed
    if (selectedPlanIndex < currentPlanIndex) {
      return false
    }

    // Same plan but shorter period = downgrade, not allowed
    if (selectedPlanIndex === currentPlanIndex) {
      const periodMonths = BILLING_PERIODS[billingPeriod].months
      const currentPeriodMonths = currentBillingPeriod === 'annual' ? 12 : 6

      if (periodMonths < currentPeriodMonths) {
        return false
      }
    }

    return true
  }, [currentPlan, requiredPlan, billingPeriod, visiblePlans])

  // Check proration when plan changes
  useEffect(() => {
    if (currentPlan?.hasActiveSubscription && requiredPlan.code !== currentPlan.code) {
      fetchProrationPreview()
    } else {
      setProrationData(null)
    }
  }, [requiredPlan.code, billingPeriod, currentPlan])

  const fetchProrationPreview = async () => {
    try {
      const response = await fetch('/api/billing/preview-proration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPlanCode: requiredPlan.code,
          targetBillingPeriod: billingPeriod
        })
      })

      if (response.ok) {
        const data = await response.json()
        setProrationData(data)
      }
    } catch (error) {
      console.error('Error fetching proration preview:', error)
    }
  }

  const handleSelectPlan = () => {
    if (!isValidSelection) {
      if (requiredPlan.code === currentPlan?.code && billingPeriod === currentPlan?.term) {
        toast.error('Este ya es tu plan actual')
      } else {
        toast.error('Solo puedes hacer upgrade de tu plan, no downgrade')
      }
      return
    }

    onPlanSelect(requiredPlan, billingPeriod, propertyCount, prorationData)
  }

  return (
    <section className="py-8 bg-gradient-to-br from-pink-50 to-red-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Current Plan Banner */}
        {currentPlan?.hasActiveSubscription && (
          <div className="mb-8 bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Plan actual</p>
                <p className="font-semibold text-gray-900">
                  {currentPlan.name} - {currentPlan.term === 'annual' ? 'Anual' : 'Semestral'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Propiedades</p>
                <p className="font-semibold text-gray-900">{currentProperties}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Calculator */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <Calculator className="w-6 h-6 text-[#FF385C] mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Selecciona tu plan</h3>
              </div>

              {/* Property Slider */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Número de propiedades
                  </label>
                  <div className="text-2xl font-bold text-gray-900">{propertyCount}</div>
                </div>

                <input
                  type="range"
                  min="1"
                  max="60"
                  value={propertyCount}
                  onChange={(e) => setPropertyCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer airbnb-slider"
                  style={{
                    background: `linear-gradient(to right, #FF385C 0%, #FF385C ${((propertyCount - 1) / 59) * 100}%, #E5E7EB ${((propertyCount - 1) / 59) * 100}%, #E5E7EB 100%)`
                  }}
                />

                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>1</span>
                  <span>30</span>
                  <span>60</span>
                </div>

                {/* Show recommended plan name */}
                <div className="mt-3 text-center">
                  <span className="text-sm text-[#FF385C] font-medium">
                    Plan recomendado: {requiredPlan.name}
                  </span>
                </div>
              </div>

              {/* Billing Period Selector */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Período de facturación
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(BILLING_PERIODS).map(([key, period]) => {
                    const isActive = billingPeriod === key
                    const discountPercent = Math.round(period.discount * 100)

                    return (
                      <button
                        key={key}
                        onClick={() => setBillingPeriod(key as BillingPeriod)}
                        className={`relative p-4 rounded-xl border-2 font-medium transition-all ${
                          isActive
                            ? 'border-[#FF385C] bg-pink-50 text-[#FF385C]'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {discountPercent > 0 && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            -{discountPercent}%
                          </div>
                        )}

                        <div className="text-center">
                          <div className="text-lg font-semibold mb-1">
                            {period.label}
                          </div>
                          <div className="text-xs text-gray-600">
                            {period.months} meses
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-gradient-to-r from-pink-50 to-red-50 rounded-xl p-6 mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-gray-700">
                    <span>{propertyCount} propiedad{propertyCount > 1 ? 'es' : ''} × {BILLING_PERIODS[billingPeriod].label}</span>
                    <span>€{monthlyPrice}/mes</span>
                  </div>

                  {/* Base price */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Precio base:</span>
                    <span className="text-gray-700">€{basePrice.toFixed(2)}</span>
                  </div>

                  {/* Period discount */}
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Descuento por período ({Math.round(BILLING_PERIODS[billingPeriod].discount * 100)}%):</span>
                      <span className="text-green-600">-€{discount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Proration credit */}
                  {prorationData && prorationData.unusedCredit > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Crédito no utilizado:</span>
                      <span className="text-green-600">-€{prorationData.unusedCredit.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">
                        Total a pagar
                      </span>
                      <span className="text-3xl font-bold text-[#FF385C]">
                        €{prorationData && prorationData.immediatePayment !== undefined
                          ? prorationData.immediatePayment.toFixed(2)
                          : finalPrice.toFixed(2)
                        }
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-right">
                      Facturación {billingPeriod === 'semiannual' ? 'semestral' : 'anual'}
                    </p>
                    <p className="text-xs text-gray-500 text-right">
                      €{(finalPrice / BILLING_PERIODS[billingPeriod].months).toFixed(2)}/mes
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleSelectPlan}
                disabled={loading || !isValidSelection}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                  !isValidSelection
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#FF385C] text-white hover:bg-[#E31C5F] shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? 'Procesando...' :
                 !isValidSelection ? (
                   requiredPlan.code === currentPlan?.code && billingPeriod === currentPlan?.term
                     ? 'Ya tienes este plan'
                     : 'Solo upgrades permitidos'
                 ) :
                 currentPlan?.hasActiveSubscription ? 'Actualizar plan' : 'Seleccionar plan'}
              </button>

              {!isValidSelection && (
                <p className="text-center text-sm text-gray-600 mt-3">
                  Para cambiar a un plan inferior, contacta con soporte
                </p>
              )}
            </div>
          </div>

          {/* Right: Plan Cards (Small Squares) */}
          <div className="order-1 lg:order-2">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Planes disponibles</h3>
            <div className="space-y-4">
              {visiblePlans.map((plan) => {
                const isRecommended = plan.code === requiredPlan.code
                const isCurrent = plan.code === currentPlan?.code

                return (
                  <div
                    key={plan.code}
                    className={`border-2 rounded-xl p-6 transition-all cursor-pointer ${
                      isRecommended
                        ? 'border-[#FF385C] bg-pink-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => {
                      // Set property count to trigger this plan
                      const minProps = plan.code === 'BASIC' ? 1 :
                                      plan.code === 'HOST' ? 4 : 11
                      setPropertyCount(minProps)
                    }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {plan.name}
                      </h4>
                      <span className="text-2xl font-bold text-[#FF385C]">
                        €{plan.priceMonthly}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      Hasta {plan.maxProperties} propiedades
                    </p>
                    <p className="text-gray-500 text-xs mb-3">
                      Por mes
                    </p>

                    {/* Features */}
                    <div className="space-y-2">
                      {plan.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                          <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Badges */}
                    <div className="mt-4 flex gap-2">
                      {isRecommended && (
                        <span className="inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full bg-[#FF385C] text-white">
                          Recomendado
                        </span>
                      )}
                      {isCurrent && !isRecommended && (
                        <span className="inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                          Plan actual
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* All plans include */}
            <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Todos los planes incluyen
              </h4>
              <ul className="space-y-3">
                {[
                  'Manuales digitales ilimitados',
                  'Códigos QR personalizados',
                  'Soporte multiidioma',
                  'Integración WhatsApp',
                  'Analytics detallados',
                  'Soporte técnico'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700 text-sm">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .airbnb-slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #FF385C;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(255, 56, 92, 0.4);
          transition: transform 0.2s;
        }

        .airbnb-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        .airbnb-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #FF385C;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(255, 56, 92, 0.4);
          transition: transform 0.2s;
        }

        .airbnb-slider::-moz-range-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>
    </section>
  )
}
