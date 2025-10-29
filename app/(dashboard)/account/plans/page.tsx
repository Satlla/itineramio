'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PropertyPlanSelectorV3 from '../../../../src/components/billing/PropertyPlanSelector-v3'
import PaymentMethodModal from '../../../../src/components/billing/PaymentMethodModal'
import BillingDataModal from '../../../../src/components/billing/BillingDataModal'
import { toast } from 'react-hot-toast'
import { ArrowLeft, AlertTriangle, X, CheckCircle } from 'lucide-react'

const BILLING_PERIODS = {
  monthly: { months: 1, discount: 0, label: 'Mensual' },
  semiannual: { months: 6, discount: 0.10, label: 'Semestral' },
  annual: { months: 12, discount: 0.20, label: 'Anual' }
} as const

type BillingPeriod = keyof typeof BILLING_PERIODS

export default function PlansPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [currentProperties, setCurrentProperties] = useState(0)
  const [currentPlan, setCurrentPlan] = useState<any>(null)
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlanData, setSelectedPlanData] = useState<any>(null)
  const [showBillingConfirmation, setShowBillingConfirmation] = useState(false)
  const [showBillingDataModal, setShowBillingDataModal] = useState(false)
  const [pendingPlanData, setPendingPlanData] = useState<any>(null)

  useEffect(() => {
    // Obtener información actual del usuario usando la API unificada
    fetchBillingOverview()
    fetchSubscriptionDetails()
  }, [])

  // Check if returning from billing page
  useEffect(() => {
    const fromBilling = searchParams.get('from_billing')
    if (fromBilling === 'true') {
      setShowBillingConfirmation(true)
    }
  }, [searchParams])

  const fetchBillingOverview = async () => {
    try {
      console.log('🔄 Fetching billing overview...')
      const response = await fetch('/api/user/billing-overview')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Billing overview data:', data)
        setCurrentProperties(data.totalProperties || 0)
        setCurrentPlan({
          code: data.planCode?.toUpperCase(),
          name: data.planName,
          term: data.term || 'monthly',
          termLabel: data.termLabel,
          hasActiveSubscription: data.hasActiveSubscription,
          daysUntilExpiry: data.daysUntilExpiry,
          nextPaymentAmount: data.nextPaymentAmount,
          nextPaymentDate: data.nextPaymentDate,
          maxProperties: data.maxProperties
        })
      } else {
        console.error('❌ Failed to fetch billing overview:', response.status)
      }
    } catch (error) {
      console.error('❌ Error fetching billing overview:', error)
    }
  }

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await fetch('/api/user/subscriptions')
      if (response.ok) {
        const data = await response.json()
        if (data.subscriptions && data.subscriptions.length > 0) {
          setSubscriptionDetails(data.subscriptions[0])
        }
      }
    } catch (error) {
      console.error('❌ Error fetching subscription details:', error)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscriptionDetails?.id) {
      toast.error('No se encontró la suscripción activa')
      return
    }

    setCancelling(true)
    try {
      const response = await fetch('/api/user/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscriptionDetails.id,
          reason: cancelReason || 'No especificado'
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setShowCancelModal(false)
        setCancelReason('')
        // Refrescar datos
        fetchBillingOverview()
        fetchSubscriptionDetails()
      } else {
        toast.error(data.error || 'Error al cancelar la suscripción')
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      toast.error('Error al cancelar la suscripción')
    } finally {
      setCancelling(false)
    }
  }

  const handleReactivateSubscription = async () => {
    if (!subscriptionDetails?.id) {
      toast.error('No se encontró la suscripción')
      return
    }

    try {
      const response = await fetch(`/api/user/cancel-subscription?subscriptionId=${subscriptionDetails.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        // Refrescar datos
        fetchBillingOverview()
        fetchSubscriptionDetails()
      } else {
        toast.error(data.error || 'Error al reactivar la suscripción')
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      toast.error('Error al reactivar la suscripción')
    }
  }

  const calculatePrice = (monthlyPrice: number, billingPeriod: BillingPeriod): number => {
    const periodInfo = BILLING_PERIODS[billingPeriod]

    // Fallback to monthly if period not found
    if (!periodInfo) {
      console.warn(`Invalid billing period: ${billingPeriod}, defaulting to monthly`)
      return monthlyPrice
    }

    const basePrice = monthlyPrice * periodInfo.months
    const discount = basePrice * periodInfo.discount
    return basePrice - discount
  }

  const handleBillingSaved = async () => {
    // Close billing modal
    setShowBillingDataModal(false)

    // If there's a pending plan, process it automatically
    if (pendingPlanData) {
      const { plan, billingPeriod, propertyCount, prorationData } = pendingPlanData

      // Clear pending data
      setPendingPlanData(null)

      // Process the plan selection
      await handlePlanSelection(plan, billingPeriod, propertyCount, prorationData)
    }
  }

  const handlePlanSelection = async (plan: any, billingPeriod: string, propertyCount: number, prorationData?: any) => {
    setLoading(true)

    try {
      // ⚠️ CRITICAL: Check if billing info is complete FIRST
      console.log('🔍 Checking billing data completion...')
      const billingResponse = await fetch('/api/user/billing-info', { credentials: 'include' })

      if (!billingResponse.ok) {
        console.error('❌ BILLING-CHECK-FAILED: Cannot verify billing data')
        toast.error('Error al verificar los datos de facturación. Por favor, intenta nuevamente.')
        setLoading(false)
        return
      }

      const billingData = await billingResponse.json()
      if (!billingData.isBillingComplete) {
        console.log('❌ BILLING-DATA-INCOMPLETE: Showing billing modal')

        // Save pending plan data to process after billing data is completed
        const tempPlanData = {
          plan,
          billingPeriod,
          propertyCount,
          prorationData
        }
        setPendingPlanData(tempPlanData)

        // Show billing data modal
        setShowBillingDataModal(true)
        setLoading(false)
        return
      }
      console.log('✅ BILLING-DATA-COMPLETE: Proceeding with plan selection')

      // Server-side validation for downgrade prevention
      const validationResponse = await fetch('/api/billing/validate-plan-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetPlanCode: plan.code,
          targetBillingPeriod: billingPeriod
        })
      })

      const validation = await validationResponse.json()

      if (!validation.allowed) {
        console.log(`❌ PLAN-SELECTION-BLOCKED: ${validation.message}`)
        toast.error(validation.message, {
          duration: 5000,
          style: {
            maxWidth: '600px'
          }
        })
        setLoading(false)
        return
      }

      console.log(`✅ PLAN-SELECTION: Plan change validated - ${validation.reason}`)

      // Normalize billing period to ensure it matches our BILLING_PERIODS keys
      const periodMapping: Record<string, BillingPeriod> = {
        'monthly': 'monthly',
        'mensual': 'monthly',
        'semiannual': 'semiannual',
        'semestral': 'semiannual',
        'biannual': 'semiannual',
        'annual': 'annual',
        'yearly': 'annual',
        'anual': 'annual'
      }

      let normalizedPeriod = periodMapping[billingPeriod?.toLowerCase() || 'monthly'] || 'monthly'

      console.log(`📅 Billing period mapping: ${billingPeriod} → ${normalizedPeriod}`)

      // Calcular el precio basado en el plan y período
      const price = calculatePrice(plan.priceMonthly, normalizedPeriod)

      // Obtener el price ID correcto basado en el período de facturación
      const priceId = plan.stripePriceId || plan.priceIds?.[normalizedPeriod] || ''

      console.log('Plan data:', {
        planCode: plan.code,
        planName: plan.name,
        billingPeriod: normalizedPeriod,
        originalBillingPeriod: billingPeriod,
        propertyCount,
        calculatedPrice: price,
        priceId,
        prorationData
      })

      // Prepare plan data for modal
      const planData = {
        code: plan.code,
        name: plan.name,
        price,
        properties: propertyCount,
        billingPeriod: normalizedPeriod,
        priceId,
        features: plan.features || [],
        maxProperties: plan.maxProperties,
        monthlyPrice: plan.priceMonthly,
        hasProration: !!prorationData,
        proratedAmount: prorationData?.finalPrice || null,
        daysRemaining: prorationData?.currentPlan?.daysRemaining || null,
        creditAmount: prorationData?.creditAmount || null
      }

      // Open payment method modal
      setSelectedPlanData(planData)
      setShowPaymentModal(true)
    } catch (error) {
      console.error('Error processing plan selection:', error)
      toast.error(error instanceof Error ? error.message : 'Error al procesar la selección del plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header simple con botón volver */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Volver</span>
          </button>
        </div>
      </div>

      {/* Cancellation Banner */}
      {subscriptionDetails?.cancelAtPeriodEnd && subscriptionDetails?.endDate && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-yellow-900">
                    Suscripción Cancelada
                  </h3>
                  <p className="text-sm text-yellow-800 mt-1">
                    Tu plan {subscriptionDetails.plan?.name} se cancelará automáticamente el{' '}
                    <strong>
                      {new Date(subscriptionDetails.endDate).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </strong>
                    . Seguirás teniendo acceso hasta esa fecha.
                  </p>
                  <button
                    onClick={handleReactivateSubscription}
                    className="mt-3 text-sm font-medium text-yellow-900 hover:text-yellow-700 underline"
                  >
                    Reactivar suscripción
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Button */}
      {subscriptionDetails && subscriptionDetails.status === 'ACTIVE' && !subscriptionDetails.cancelAtPeriodEnd && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  ¿Deseas cancelar tu suscripción?
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Puedes cancelar en cualquier momento. Seguirás teniendo acceso hasta el final de tu período de facturación.
                </p>
              </div>
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg transition-colors"
              >
                Cancelar Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenedor principal con el selector de planes */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <PropertyPlanSelectorV3
          currentProperties={currentProperties}
          currentPlan={currentPlan}
          onPlanSelect={handlePlanSelection}
          loading={loading}
        />
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Cancelar Suscripción
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Lamentamos que te vayas. ¿Podrías decirnos por qué cancelas tu suscripción?
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Motivo de cancelación (opcional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={4}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Tu suscripción se cancelará al final del período actual.
                Seguirás teniendo acceso completo hasta el{' '}
                {subscriptionDetails?.endDate && (
                  <strong>
                    {new Date(subscriptionDetails.endDate).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </strong>
                )}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={cancelling}
              >
                Volver
              </button>
              <button
                onClick={handleCancelSubscription}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                disabled={cancelling}
              >
                {cancelling ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing Confirmation Banner - Shows when returning from billing */}
      {showBillingConfirmation && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-[500px] z-50 bg-white rounded-xl shadow-2xl border-2 border-green-500 p-6 animate-slide-up">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">¡Datos de facturación guardados!</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Revisa que todo esté correcto. <strong>Una vez emitida la factura, no podrás modificarlos.</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Ahora puedes seleccionar tu plan y proceder al pago.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowBillingConfirmation(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => router.push('/account/billing')}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
            >
              Revisar datos
            </button>
            <button
              onClick={() => setShowBillingConfirmation(false)}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && selectedPlanData && (
        <PaymentMethodModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedPlanData(null)
          }}
          planDetails={selectedPlanData}
        />
      )}

      {/* Billing Data Modal */}
      <BillingDataModal
        isOpen={showBillingDataModal}
        onClose={() => {
          setShowBillingDataModal(false)
          setPendingPlanData(null)
        }}
        onSaveSuccess={handleBillingSaved}
      />
    </div>
  )
}
