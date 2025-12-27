'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PropertyPlanSelector from '../../../../src/components/billing/PropertyPlanSelector-v2-airbnb'
import { toast } from 'react-hot-toast'
import { getPlan, calculatePrice, type BillingPeriod, type PlanCode } from '../../../../src/config/plans'
import { ArrowLeft } from 'lucide-react'

export default function PlansPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentProperties, setCurrentProperties] = useState(0)
  const [currentPlan, setCurrentPlan] = useState<any>(null)

  useEffect(() => {
    // Obtener información actual del usuario usando la API unificada
    fetchBillingOverview()
  }, [])

  const fetchBillingOverview = async () => {
    try {
      console.log('🔄 Fetching billing overview...')
      const response = await fetch('/api/user/billing-overview')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Billing overview data:', data)
        setCurrentProperties(data.totalProperties || 0)
        setCurrentPlan({
          code: data.planCode?.toUpperCase(), // ✅ Normalize plan code to match PLAN_TIERS keys
          name: data.planName,
          term: data.term || 'monthly',
          hasActiveSubscription: data.hasActiveSubscription,
          daysUntilExpiry: data.daysUntilExpiry,
          nextPaymentAmount: data.nextPaymentAmount,
          nextPaymentDate: data.nextPaymentDate,
          maxProperties: data.maxProperties // ✅ Añadir maxProperties de la DB
        })
      } else {
        console.error('❌ Failed to fetch billing overview:', response.status)
      }
    } catch (error) {
      console.error('❌ Error fetching billing overview:', error)
    }
  }

  const handlePlanSelection = async (plan: any, billingPeriod: string, propertyCount: number, prorationData?: any) => {
    setLoading(true)

    try {
      // Server-side validation for downgrade prevention
      const validationResponse = await fetch('/api/billing/validate-plan-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetPlanCode: plan.code,
          targetBillingPeriod: billingPeriod  // ✅ Añadido para permitir cambios de período
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

      // Obtener el price ID correcto basado en el período de facturación
      const priceId = plan.priceIds[billingPeriod]

      // Convertir billing period del frontend al formato del backend
      const periodMap: Record<string, BillingPeriod> = {
        'monthly': 'MONTHLY',
        'semiannual': 'SEMESTRAL',
        'annual': 'YEARLY'
      }
      const backendPeriod = periodMap[billingPeriod] || 'MONTHLY'

      // Usar la función centralizada para obtener el precio
      const planData = getPlan(plan.code as PlanCode)
      const price = calculatePrice(planData, backendPeriod)

      console.log('Plan data:', {
        planCode: plan.code,
        planName: plan.name,
        billingPeriod,
        propertyCount,
        calculatedPrice: price,
        priceId,
        prorationData  // ✅ Log proration data
      })

      // Redirigir a la página de selección de método de pago
      const params = new URLSearchParams({
        plan: plan.code,
        planName: plan.name,
        price: price.toString(),
        properties: propertyCount.toString(),
        billingPeriod: billingPeriod,
        priceId: priceId,
        ...(plan.promotionalCode && {
          promotionalCode: plan.promotionalCode
        }),
        // ✅ Pass proration data if available
        ...(prorationData && {
          hasProration: 'true',
          proratedAmount: prorationData.immediatePayment?.toFixed(2) || '0',
          daysRemaining: prorationData.daysRemaining?.toString() || '0',
          creditAmount: prorationData.unusedCredit?.toFixed(2) || '0'
        })
      })

      router.push(`/pricing-v2/payment-method?${params.toString()}`)
    } catch (error) {
      console.error('Error processing plan selection:', error)
      toast.error(error instanceof Error ? error.message : 'Error al procesar la selección del plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header con navegación */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Volver</span>
          </button>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">Elige tu plan perfecto</h1>
            <p className="text-gray-600 mt-2">
              Encuentra el plan ideal para gestionar tus propiedades con herramientas profesionales
            </p>
          </div>
        </div>
      </div>

      {/* Contenedor principal con el selector de planes Airbnb-style */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <PropertyPlanSelector
          currentProperties={currentProperties}
          currentPlan={currentPlan}
          onPlanSelect={handlePlanSelection}
          loading={loading}
        />
      </div>
    </div>
  )
}
