'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { PLANS, type PlanCode } from '../../config/plans'
import { toast } from 'react-hot-toast'
import {
  Home,
  Building2,
  Crown,
  Briefcase,
  Check,
  Sparkles,
  Calendar,
  TrendingUp,
  Tag
} from 'lucide-react'

const BILLING_PERIODS = {
  monthly: { label: 'Mensual', months: 1, discount: 0 },
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

// Plan icons mapping
const PLAN_ICONS = {
  BASIC: Home,
  HOST: Building2,
  SUPERHOST: Crown,
  BUSINESS: Briefcase
}

const IVA_RATE = 0.21 // 21% IVA

export default function PropertyPlanSelectorV3({
  currentProperties,
  currentPlan,
  onPlanSelect,
  loading = false
}: PropertyPlanSelectorProps) {
  // Map term to billing period
  const getCurrentBillingPeriod = (): BillingPeriod => {
    if (!currentPlan?.term) return 'semiannual'
    const termMap: Record<string, BillingPeriod> = {
      'monthly': 'monthly',
      'semiannual': 'semiannual',
      'annual': 'annual'
    }
    return termMap[currentPlan.term.toLowerCase()] || 'semiannual'
  }

  const [propertyCount, setPropertyCount] = useState(Math.max(currentProperties || 1, 1))
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(getCurrentBillingPeriod())
  const [prorationData, setProrationData] = useState<any>(null)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  // Get all 4 plans
  const allPlans = useMemo(() => {
    return Object.values(PLANS)
      .filter(plan => ['BASIC', 'HOST', 'SUPERHOST', 'BUSINESS'].includes(plan.code))
      .sort((a, b) => a.maxProperties - b.maxProperties)
  }, [])

  // Calculate which plan is required for current property count
  const requiredPlan = useMemo(() => {
    return allPlans.find(plan => propertyCount <= plan.maxProperties) || allPlans[allPlans.length - 1]
  }, [propertyCount, allPlans])

  // Check if this is the exact same plan + period as current
  const isCurrentPlanAndPeriod = useMemo(() => {
    return requiredPlan.code === currentPlan?.code && billingPeriod === getCurrentBillingPeriod()
  }, [requiredPlan.code, currentPlan?.code, billingPeriod])

  // Calculate base price without IVA
  const calculatePriceWithoutIVA = (price: number) => {
    return price / (1 + IVA_RATE)
  }

  // Calculate IVA amount
  const calculateIVA = (priceWithoutIVA: number) => {
    return priceWithoutIVA * IVA_RATE
  }

  // Pricing calculations
  const monthlyPriceWithIVA = requiredPlan.priceMonthly
  const basePriceWithIVA = monthlyPriceWithIVA * BILLING_PERIODS[billingPeriod].months
  const periodDiscount = basePriceWithIVA * BILLING_PERIODS[billingPeriod].discount
  const priceAfterPeriodDiscount = basePriceWithIVA - periodDiscount

  // Coupon discount
  const couponDiscount = appliedCoupon
    ? appliedCoupon.discountType === 'PERCENTAGE'
      ? priceAfterPeriodDiscount * (appliedCoupon.discountValue / 100)
      : appliedCoupon.discountValue
    : 0

  const priceAfterCoupon = priceAfterPeriodDiscount - couponDiscount

  // Proration credit (usar creditAmount del API)
  const prorationCredit = prorationData?.creditAmount || 0

  // Final price (si hay prorrateo, usar directamente finalPrice del API que ya tiene todo calculado)
  const finalPrice = prorationData?.hasProration
    ? prorationData.finalPrice
    : Math.max(0, priceAfterCoupon - prorationCredit)

  // Calculate without IVA
  const finalPriceWithoutIVA = calculatePriceWithoutIVA(finalPrice)
  const finalIVA = calculateIVA(finalPriceWithoutIVA)

  // Debug logging
  console.log('💰 Price Calculation:', {
    hasProration: prorationData?.hasProration,
    prorationCredit,
    basePriceWithIVA,
    periodDiscount,
    priceAfterPeriodDiscount,
    couponDiscount,
    priceAfterCoupon,
    finalPrice,
    prorationData
  })

  // Check proration when plan or billing period changes
  useEffect(() => {
    if (currentPlan?.hasActiveSubscription) {
      // Llamar al prorrateo siempre que haya suscripción activa
      // El API se encargará de validar si es el mismo plan/período
      fetchProrationPreview()
    } else {
      setProrationData(null)
    }
  }, [requiredPlan.code, billingPeriod, currentPlan?.hasActiveSubscription])

  const fetchProrationPreview = async () => {
    try {
      console.log('🔄 Fetching proration preview:', {
        targetPlanCode: requiredPlan.code,
        targetBillingPeriod: billingPeriod,
        currentPlan: currentPlan?.code
      })

      const response = await fetch('/api/billing/preview-proration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPlanCode: requiredPlan.code,
          targetBillingPeriod: billingPeriod
        })
      })

      const data = await response.json()

      if (response.ok) {
        console.log('✅ Proration data received:', data)
        setProrationData(data)
      } else {
        console.log('❌ Proration error:', data)
        // Si es error de "mismo plan", limpiar prorrateo
        setProrationData(null)
      }
    } catch (error) {
      console.error('Error fetching proration preview:', error)
      setProrationData(null)
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return

    setValidatingCoupon(true)
    try {
      const response = await fetch('/api/billing/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          planCode: requiredPlan.code
        })
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        setAppliedCoupon(data.coupon)
        toast.success(`Cupón aplicado: ${data.coupon.discountValue}${data.coupon.discountType === 'PERCENTAGE' ? '%' : '€'} de descuento`)
      } else {
        toast.error(data.message || 'Cupón inválido')
      }
    } catch (error) {
      toast.error('Error al validar el cupón')
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
  }

  const handleSelectPlan = () => {
    onPlanSelect(requiredPlan, billingPeriod, propertyCount, prorationData)
  }

  // Get plan expiry date
  const getExpiryDate = () => {
    if (!currentPlan?.nextPaymentDate) return null
    return new Date(currentPlan.nextPaymentDate).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section - Current Plan */}
      {currentPlan?.hasActiveSubscription && (
        <div className="mb-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-300" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Tu Plan Actual
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-6">
              {/* Plan Name */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-white/80 text-sm mb-1">Plan</p>
                <p className="text-white text-xl font-bold">
                  {currentPlan.name} {currentPlan.term && BILLING_PERIODS[getCurrentBillingPeriod()].label}
                </p>
              </div>

              {/* Price */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-white/80 text-sm mb-1">Precio</p>
                <p className="text-white text-xl font-bold">
                  €{currentPlan.nextPaymentAmount?.toFixed(2) || '0.00'}
                </p>
              </div>

              {/* Properties */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-white/80 text-sm mb-1">Propiedades</p>
                <p className="text-white text-xl font-bold">
                  {currentProperties} / {currentPlan.maxProperties}
                </p>
              </div>

              {/* Expiry */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-white/80 text-sm mb-1">Finaliza</p>
                <p className="text-white text-sm font-semibold">
                  {getExpiryDate()}
                </p>
                {currentPlan.daysUntilExpiry !== undefined && (
                  <p className="text-white/60 text-xs mt-1">
                    ({currentPlan.daysUntilExpiry} días)
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Elige tu Plan Ideal
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Ajusta el número de propiedades y selecciona el plan que mejor se adapte a tus necesidades
        </p>
      </div>

      {/* Property Slider - HIDDEN (removed as requested) */}
      <div className="hidden mb-12 bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <label className="text-lg font-semibold text-gray-800">
            ¿Cuántas propiedades gestionas?
          </label>
          <div className="text-5xl font-bold text-indigo-600 bg-indigo-50 px-6 py-2 rounded-xl">
            {propertyCount}
          </div>
        </div>

        <input
          type="range"
          min="1"
          max="100"
          value={propertyCount}
          onChange={(e) => setPropertyCount(parseInt(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer property-slider"
          style={{
            background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(propertyCount - 1)}%, #E5E7EB ${(propertyCount - 1)}%, #E5E7EB 100%)`
          }}
        />

        <div className="flex justify-between text-sm text-gray-500 mt-3">
          <span>1 propiedad</span>
          <span>50</span>
          <span>100 propiedades</span>
        </div>

        {/* Recommended Plan */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Plan recomendado para ti:</p>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full font-bold text-lg">
            {React.createElement(PLAN_ICONS[requiredPlan.code as PlanCode], { className: 'w-5 h-5' })}
            {requiredPlan.name}
          </div>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="mb-12 pt-6">
        {/* Mobile: Horizontal scroll with snap */}
        <div className="lg:hidden overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
          <div className="flex gap-4 pb-4 pt-2">
            {allPlans.map((plan) => {
              const Icon = PLAN_ICONS[plan.code as PlanCode]
              const isSelected = plan.code === requiredPlan.code
              const isCurrentPlan = plan.code === currentPlan?.code

              return (
                <div
                  key={plan.code}
                  className={`relative min-w-[280px] aspect-square rounded-2xl border-4 transition-all duration-300 cursor-pointer snap-center overflow-visible ${
                    isSelected
                      ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-2xl'
                      : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-lg'
                  }`}
                  onClick={() => {
                    const newCount = plan.maxProperties
                    if (newCount > currentProperties) {
                      setPropertyCount(newCount)
                    }
                  }}
                >
                  {/* Badge */}
                  {isCurrentPlan && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg z-50 whitespace-nowrap">
                      Plan Actual
                    </div>
                  )}

                  {/* Content */}
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                    {/* Icon */}
                    <div className={`mb-4 p-4 rounded-2xl ${
                      isSelected ? 'bg-indigo-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-12 h-12 ${
                        isSelected ? 'text-indigo-600' : 'text-gray-600'
                      }`} />
                    </div>

                    {/* Plan Name */}
                    <h3 className={`text-2xl font-bold mb-2 ${
                      isSelected ? 'text-indigo-900' : 'text-gray-900'
                    }`}>
                      {plan.name}
                    </h3>

                    {/* Price */}
                    <div className="mb-3">
                      <span className={`text-3xl font-black ${
                        isSelected ? 'text-indigo-600' : 'text-gray-900'
                      }`}>
                        €{plan.priceMonthly}
                      </span>
                      <span className="text-gray-600 text-sm">/mes</span>
                    </div>

                    {/* Properties */}
                    <p className="text-sm text-gray-600 mb-4">
                      Hasta <span className="font-bold text-gray-900">{plan.maxProperties}</span> propiedades
                    </p>

                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="mt-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold">
                          <Check className="w-4 h-4" />
                          Seleccionado
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6 max-w-7xl mx-auto px-4">
          {allPlans.map((plan) => {
            const Icon = PLAN_ICONS[plan.code as PlanCode]
            const isSelected = plan.code === requiredPlan.code
            const isCurrentPlan = plan.code === currentPlan?.code

            return (
              <div
                key={plan.code}
                className={`relative aspect-square rounded-2xl border-4 transition-all duration-300 cursor-pointer overflow-visible ${
                  isSelected
                    ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-2xl scale-105'
                    : isCurrentPlan
                    ? 'border-green-500 bg-green-50 shadow-lg'
                    : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-lg'
                }`}
                onClick={() => setPropertyCount(plan.maxProperties)}
              >
                {isSelected && (
                  <div className="absolute -top-3 -right-3 bg-indigo-600 text-white rounded-full p-2 shadow-lg z-50">
                    <Check className="w-5 h-5" />
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-50 whitespace-nowrap">
                    Plan Actual
                  </div>
                )}

                <div className="h-full flex flex-col items-center justify-center p-6">
                  {/* Icon */}
                  <div className={`mb-4 p-4 rounded-2xl ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    <Icon className="w-12 h-12" />
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    {plan.name}
                  </h3>

                  {/* Properties */}
                  <p className="text-gray-600 text-sm mb-4 text-center">
                    Hasta {plan.maxProperties} propiedades
                  </p>

                  {/* Price */}
                  <div className="text-center">
                    <p className="text-3xl font-bold text-indigo-600">
                      €{plan.priceMonthly}
                    </p>
                    <p className="text-sm text-gray-500">al mes</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Billing Period Selector */}
      <div className="mb-12 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-8">
        <div className="flex items-center gap-3 mb-4 md:mb-6 px-2 md:px-0">
          <Calendar className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
          <h3 className="text-xl md:text-2xl font-bold text-gray-900">
            Período de Facturación
          </h3>
        </div>

        {/* Mobile: Horizontal scroll with snap */}
        <div className="md:hidden overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
          <div className="flex gap-3 pb-2">
            {Object.entries(BILLING_PERIODS).map(([key, period]) => {
              const isActive = billingPeriod === key
              const discountPercent = Math.round(period.discount * 100)

              return (
                <button
                  key={key}
                  onClick={() => setBillingPeriod(key as BillingPeriod)}
                  className={`relative min-w-[240px] p-5 rounded-xl border-2 font-medium transition-all snap-center ${
                    isActive
                      ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {discountPercent > 0 && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      Ahorra {discountPercent}%
                    </div>
                  )}

                  {isActive && (
                    <div className="absolute -top-2 -left-2 bg-indigo-600 text-white rounded-full p-1.5 shadow-lg">
                      <Check className="w-3 h-3" />
                    </div>
                  )}

                  <div className="flex flex-col items-center text-center">
                    <p className={`text-lg font-bold mb-1 ${
                      isActive ? 'text-indigo-900' : 'text-gray-900'
                    }`}>
                      {period.label}
                    </p>
                    <p className="text-sm text-gray-600">
                      {period.months} {period.months === 1 ? 'mes' : 'meses'}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(BILLING_PERIODS).map(([key, period]) => {
            const isActive = billingPeriod === key
            const discountPercent = Math.round(period.discount * 100)

            return (
              <button
                key={key}
                onClick={() => setBillingPeriod(key as BillingPeriod)}
                className={`relative p-6 rounded-xl border-2 font-medium transition-all ${
                  isActive
                    ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg scale-105'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {discountPercent > 0 && (
                  <div className="absolute -top-3 -right-3 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                    Ahorra {discountPercent}%
                  </div>
                )}

                <div className="text-center">
                  {isActive && (
                    <Check className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                  )}
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {period.label}
                  </div>
                  <div className="text-sm text-gray-600">
                    {period.months} {period.months === 1 ? 'mes' : 'meses'}
                  </div>
                  {discountPercent > 0 && (
                    <div className="mt-2 text-green-600 font-semibold text-sm">
                      -{discountPercent}% de descuento
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Coupon Section */}
      <div className="mb-12 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-lg border-2 border-yellow-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Tag className="w-6 h-6 text-orange-600" />
          <h3 className="text-2xl font-bold text-gray-900">
            ¿Tienes un cupón de descuento?
          </h3>
        </div>

        {!appliedCoupon ? (
          <div className="flex gap-3">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Ingresa tu código"
              className="flex-1 px-4 py-3 rounded-lg border-2 border-yellow-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-lg font-mono uppercase"
              disabled={validatingCoupon}
            />
            <button
              onClick={handleApplyCoupon}
              disabled={validatingCoupon || !couponCode.trim()}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {validatingCoupon ? 'Validando...' : 'Aplicar'}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-white rounded-lg p-4 border-2 border-green-500">
            <div className="flex items-center gap-3">
              <Check className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-bold text-gray-900">
                  Cupón "{appliedCoupon.code}" aplicado
                </p>
                <p className="text-sm text-gray-600">
                  Descuento: {appliedCoupon.discountValue}
                  {appliedCoupon.discountType === 'PERCENTAGE' ? '%' : '€'}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
          <h3 className="text-2xl font-bold text-gray-900">
            Desglose de Precios
          </h3>
        </div>

        <div className="space-y-4">
          {/* Base Price */}
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <span className="text-gray-700">
              Plan {requiredPlan.name} × {BILLING_PERIODS[billingPeriod].months} {BILLING_PERIODS[billingPeriod].months === 1 ? 'mes' : 'meses'}
            </span>
            <span className="text-gray-900 font-semibold">
              €{basePriceWithIVA.toFixed(2)}
            </span>
          </div>

          {/* Period Discount */}
          {periodDiscount > 0 && (
            <div className="flex justify-between items-center text-green-600 pb-3 border-b border-gray-200">
              <span>
                Descuento por período ({Math.round(BILLING_PERIODS[billingPeriod].discount * 100)}%)
              </span>
              <span className="font-semibold">
                -€{periodDiscount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Coupon Discount */}
          {couponDiscount > 0 && (
            <div className="flex justify-between items-center text-green-600 pb-3 border-b border-gray-200">
              <span>
                Cupón de descuento ({appliedCoupon.code})
              </span>
              <span className="font-semibold">
                -€{couponDiscount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Proration Credit */}
          {prorationCredit > 0 && (
            <div className="flex justify-between items-center text-green-600 pb-3 border-b border-gray-200">
              <div>
                <p>Crédito no utilizado de plan actual</p>
                <p className="text-xs text-gray-500">
                  ({prorationData.daysRemaining} días restantes)
                </p>
              </div>
              <span className="font-semibold">
                -€{prorationCredit.toFixed(2)}
              </span>
            </div>
          )}

          {/* Subtotal without IVA */}
          <div className="flex justify-between items-center text-gray-700 pb-3 border-b border-gray-200">
            <span>Subtotal (sin IVA)</span>
            <span className="font-semibold">
              €{finalPriceWithoutIVA.toFixed(2)}
            </span>
          </div>

          {/* IVA */}
          <div className="flex justify-between items-center text-gray-700 pb-3 border-b-2 border-gray-300">
            <span>IVA (21%)</span>
            <span className="font-semibold">
              €{finalIVA.toFixed(2)}
            </span>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-4">
            <span className="text-2xl font-bold text-gray-900">
              Total a Pagar
            </span>
            <div className="text-right">
              <div className="text-4xl font-bold text-indigo-600">
                €{finalPrice.toFixed(2)}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                €{(finalPrice / BILLING_PERIODS[billingPeriod].months).toFixed(2)}/mes
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        {isCurrentPlanAndPeriod && (
          <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
            <p className="text-center text-green-800 font-medium flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              Ya tienes este plan activo
            </p>
            <p className="text-center text-sm text-green-600 mt-1">
              Puedes cambiar el período de facturación o elegir un plan superior
            </p>
          </div>
        )}

        <button
          onClick={handleSelectPlan}
          disabled={loading || isCurrentPlanAndPeriod}
          className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <div className="animate-spin w-5 h-5 border-3 border-white border-t-transparent rounded-full" />
              Procesando...
            </>
          ) : isCurrentPlanAndPeriod ? (
            <>
              <Check className="w-5 h-5" />
              Plan Actual
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Seleccionar Plan {requiredPlan.name}
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Todos los precios incluyen IVA. Facturación automática cada {BILLING_PERIODS[billingPeriod].label.toLowerCase()}.
        </p>
      </div>

      <style jsx>{`
        .property-slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
        }

        .property-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        .property-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
        }

        .property-slider::-moz-range-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  )
}
