'use client'

import React, { useState, useEffect } from 'react'
import { Calculator, Check, Minus, Plus, Upload, X } from 'lucide-react'

interface PricingTier {
  minProperties: number
  maxProperties: number | null
  pricePerProperty: number
  label: string
  name: string
}

interface CalculationResult {
  properties: number
  pricePerProperty: number
  totalPrice: number
  discountAmount?: number
  finalPrice?: number
  tier: {
    minProperties: number
    maxProperties: number | null
    pricePerProperty: number
  }
  coupon?: {
    id: string
    code: string
    name: string
    type: string
    freeMonths?: number
    equivalentValue?: number
    applied: boolean
  }
}

type BillingPeriod = 'monthly' | 'semiannual' | 'annual'
type PaymentMethod = 'stripe' | 'bizum' | 'transferencia'

export default function PricingCalculator() {
  const [properties, setProperties] = useState(3)
  const [couponCode, setCouponCode] = useState('')
  const [calculation, setCalculation] = useState<CalculationResult | null>(null)
  const [allTiers, setAllTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [couponError, setCouponError] = useState('')

  // New states for Period selector (Punto 2)
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')

  // New states for Payment method (Punto 5)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe')
  const [paymentFile, setPaymentFile] = useState<File | null>(null)
  const [fileUploaded, setFileUploaded] = useState(false)

  // Static pricing tiers with named plans (Punto 1)
  const staticTiers: PricingTier[] = [
    { minProperties: 1, maxProperties: 4, pricePerProperty: 8.00, label: '1 - 4 propiedades', name: 'Plan Basic' },
    { minProperties: 5, maxProperties: 9, pricePerProperty: 6.00, label: '5 - 9 propiedades', name: 'Plan Host' },
    { minProperties: 10, maxProperties: 19, pricePerProperty: 5.00, label: '10 - 19 propiedades', name: 'Plan Superhost' },
    { minProperties: 20, maxProperties: null, pricePerProperty: 4.00, label: '20+ propiedades', name: 'Plan Business' }
  ]

  // Calculate period discount (Punto 2)
  const getPeriodDiscount = (): number => {
    switch (billingPeriod) {
      case 'semiannual': return 0.10 // 10% descuento
      case 'annual': return 0.20 // 20% descuento
      default: return 0
    }
  }

  const getPeriodLabel = (): string => {
    switch (billingPeriod) {
      case 'monthly': return 'Mensual'
      case 'semiannual': return 'Semestral'
      case 'annual': return 'Anual'
    }
  }

  const getPeriodMultiplier = (): number => {
    switch (billingPeriod) {
      case 'monthly': return 1
      case 'semiannual': return 6
      case 'annual': return 12
    }
  }

  // Simulated proration credit (Punto 4)
  const getProrationCredit = (): number => {
    // DEMO ONLY: En producción, esto vendría del backend basado en días restantes
    // Por defecto 0 hasta integrar con backend de prorrateo
    return 0
  }

  // Calculate pricing locally with period discount
  useEffect(() => {
    const calculateLocally = () => {
      // Find applicable tier
      const applicableTier = staticTiers.find(tier =>
        properties >= tier.minProperties &&
        (tier.maxProperties === null || properties <= tier.maxProperties)
      )

      if (applicableTier) {
        const baseMonthlyTotal = properties * applicableTier.pricePerProperty
        const periodMultiplier = getPeriodMultiplier()
        const periodDiscount = getPeriodDiscount()
        const prorationCredit = getProrationCredit()

        // Calculate total for selected period
        const baseTotalForPeriod = baseMonthlyTotal * periodMultiplier
        const periodDiscountAmount = baseTotalForPeriod * periodDiscount
        const subtotalAfterPeriodDiscount = baseTotalForPeriod - periodDiscountAmount
        const finalTotal = subtotalAfterPeriodDiscount - prorationCredit

        setCalculation({
          properties,
          pricePerProperty: applicableTier.pricePerProperty,
          totalPrice: baseTotalForPeriod,
          discountAmount: periodDiscountAmount + prorationCredit,
          finalPrice: finalTotal,
          tier: {
            minProperties: applicableTier.minProperties,
            maxProperties: applicableTier.maxProperties,
            pricePerProperty: applicableTier.pricePerProperty
          }
        })
        setAllTiers(staticTiers)
      }
    }

    // Try to fetch from API first, fallback to local calculation
    const fetchCalculation = async () => {
      try {
        setLoading(true)
        setError('')
        setCouponError('')

        let response, data

        // If coupon code is provided, use POST endpoint with coupon
        if (couponCode.trim()) {
          setValidatingCoupon(true)
          response = await fetch(`/api/pricing/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              properties,
              couponCode: couponCode.trim(),
              billingPeriod
            })
          })
          data = await response.json()

          if (!data.success) {
            setCouponError(data.error || 'Cupón no válido')
            // Still fetch normal pricing without coupon
            response = await fetch(`/api/pricing/calculate?properties=${properties}&billingPeriod=${billingPeriod}`)
            data = await response.json()
          }
        } else {
          response = await fetch(`/api/pricing/calculate?properties=${properties}&billingPeriod=${billingPeriod}`)
          data = await response.json()
        }

        if (data.success) {
          setCalculation(data.calculation)
          setAllTiers(data.allTiers || staticTiers)
        } else {
          // Fallback to local calculation
          calculateLocally()
        }
      } catch (err) {
        // Fallback to local calculation
        calculateLocally()
      } finally {
        setLoading(false)
        setValidatingCoupon(false)
      }
    }

    fetchCalculation()
  }, [properties, couponCode, billingPeriod])

  const handlePropertyChange = (change: number) => {
    const newValue = Math.max(1, properties + change)
    setProperties(newValue)
  }

  const handleDirectPropertyChange = (value: string) => {
    const num = parseInt(value) || 1
    setProperties(Math.max(1, num))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPaymentFile(file)
      setFileUploaded(true)
    }
  }

  const removeFile = () => {
    setPaymentFile(null)
    setFileUploaded(false)
  }

  const getCurrentTier = () => {
    return staticTiers.find(tier =>
      properties >= tier.minProperties &&
      (tier.maxProperties === null || properties <= tier.maxProperties)
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-violet-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Banner: 15 días de evaluación */}
        <div className="mb-8 text-center">
          <div className="inline-block bg-violet-100 border-2 border-violet-300 rounded-full px-6 py-2">
            <span className="text-violet-800 font-semibold">✨ 15 días de evaluación para probar la plataforma</span>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Precios transparentes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Planes desde €9/mes. Más propiedades = mejor precio por unidad
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Calculator */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <Calculator className="w-6 h-6 text-violet-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Calculadora de precios</h3>
              </div>

              {/* Property Counter */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Número de propiedades
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handlePropertyChange(-1)}
                    disabled={properties <= 1}
                    className="w-12 h-12 rounded-full border-2 border-violet-200 flex items-center justify-center hover:border-violet-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-5 h-5 text-violet-600" />
                  </button>

                  <div className="flex-1">
                    <input
                      type="number"
                      min="1"
                      value={properties}
                      onChange={(e) => handleDirectPropertyChange(e.target.value)}
                      className="w-full text-center text-3xl font-bold bg-gray-50 border-2 border-gray-200 rounded-lg py-3 focus:border-violet-500 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => handlePropertyChange(1)}
                    className="w-12 h-12 rounded-full border-2 border-violet-200 flex items-center justify-center hover:border-violet-400 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-violet-600" />
                  </button>
                </div>
                {/* Show current plan name */}
                {getCurrentTier() && (
                  <div className="mt-2 text-center">
                    <span className="text-sm text-violet-600 font-medium">
                      {getCurrentTier()?.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Billing Period Selector (Punto 2) */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Período de facturación
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setBillingPeriod('monthly')}
                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                      billingPeriod === 'monthly'
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Mensual
                  </button>
                  <button
                    onClick={() => setBillingPeriod('semiannual')}
                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-all relative ${
                      billingPeriod === 'semiannual'
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div>Semestral</div>
                    <div className="text-xs text-green-600 font-semibold">Descuento -10%</div>
                  </button>
                  <button
                    onClick={() => setBillingPeriod('annual')}
                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-all relative ${
                      billingPeriod === 'annual'
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div>Anual</div>
                    <div className="text-xs text-green-600 font-semibold">Descuento -20%</div>
                  </button>
                </div>
              </div>

              {/* Payment Method Selector (Punto 5) */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Método de pago
                </label>
                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod('stripe')}
                    className={`w-full py-3 px-4 rounded-lg border-2 font-medium text-left transition-all ${
                      paymentMethod === 'stripe'
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    💳 Tarjeta de crédito / débito (Stripe)
                  </button>

                  <button
                    onClick={() => setPaymentMethod('bizum')}
                    className={`w-full py-3 px-4 rounded-lg border-2 font-medium text-left transition-all ${
                      paymentMethod === 'bizum'
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📱 Bizum
                  </button>

                  <button
                    onClick={() => setPaymentMethod('transferencia')}
                    className={`w-full py-3 px-4 rounded-lg border-2 font-medium text-left transition-all ${
                      paymentMethod === 'transferencia'
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    🏦 Transferencia bancaria
                  </button>
                </div>

                {/* File upload for Bizum and Transferencia */}
                {(paymentMethod === 'bizum' || paymentMethod === 'transferencia') && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comprobante de pago
                    </label>
                    {!fileUploaded ? (
                      <label className="flex items-center justify-center w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-violet-400 transition-colors">
                        <Upload className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-gray-600">Subir comprobante (JPG, PNG, PDF)</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                          <Check className="w-5 h-5 text-green-600 mr-2" />
                          <span className="text-sm text-green-700 font-medium">
                            {paymentFile?.name}
                          </span>
                        </div>
                        <button
                          onClick={removeFile}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    {fileUploaded && (
                      <p className="mt-2 text-sm text-green-600">
                        ✓ Comprobante enviado a backoffice para revisión
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Coupon Code */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Código de cupón (opcional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Introduce tu código"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                      couponError
                        ? 'border-red-300 focus:border-red-500'
                        : calculation?.coupon?.applied
                        ? 'border-green-300 focus:border-green-500'
                        : 'border-gray-200 focus:border-violet-500'
                    }`}
                  />
                  {validatingCoupon && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>

                {couponError && (
                  <p className="mt-2 text-sm text-red-600">{couponError}</p>
                )}

                {calculation?.coupon?.applied && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">
                      ✓ {calculation.coupon.name} aplicado
                    </p>
                    {calculation.coupon.type === 'FREE_MONTHS' && calculation.coupon.freeMonths && (
                      <p className="text-xs text-green-600">
                        {calculation.coupon.freeMonths} meses (valor: €{Number(calculation.coupon.equivalentValue || 0).toFixed(2)})
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Calculation Result with Breakdown (Punto 3 y 4) */}
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 mb-6">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-4 text-red-600">
                    {error}
                  </div>
                ) : calculation ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-700">
                        {properties} propiedad{properties > 1 ? 'es' : ''} × {getPeriodLabel()}
                      </span>
                      <span className="text-gray-700">
                        €{calculation.pricePerProperty}/prop/mes
                      </span>
                    </div>

                    {/* Detailed breakdown (Punto 3 y 4) */}
                    <div className="space-y-2 mb-4">
                      {/* Base price */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Precio base ({getPeriodLabel()}):</span>
                        <span className="text-gray-700">€{Number(calculation.totalPrice).toFixed(2)}</span>
                      </div>

                      {/* Period discount (Punto 3) */}
                      {getPeriodDiscount() > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Descuento por período ({(getPeriodDiscount() * 100).toFixed(0)}%):</span>
                          <span className="text-green-600">-€{(calculation.totalPrice * getPeriodDiscount()).toFixed(2)}</span>
                        </div>
                      )}

                      {/* Proration credit (Punto 4) */}
                      {getProrationCredit() > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Crédito por prorrateo:</span>
                          <span className="text-green-600">-€{getProrationCredit().toFixed(2)}</span>
                        </div>
                      )}

                      {/* Coupon discount */}
                      {calculation.coupon?.applied && calculation.discountAmount !== undefined && calculation.coupon.type !== 'FREE_MONTHS' && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Ajuste comercial (cupón):</span>
                          <span className="text-green-600">-€{Number(calculation.discountAmount).toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-violet-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">
                          Total a pagar
                        </span>
                        <span className="text-3xl font-bold text-violet-600">
                          €{Number(calculation.finalPrice || calculation.totalPrice).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-right">
                        Facturación {billingPeriod === 'monthly' ? 'mensual' : billingPeriod === 'semiannual' ? 'semestral' : 'anual'}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Call to Action */}
              <a
                href="/register"
                className="block w-full bg-violet-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-violet-700 transition-colors text-center"
              >
                Empezar ahora
              </a>

              <p className="text-center text-sm text-gray-500 mt-4">
                ✨ 15 días de evaluación para probar la plataforma
              </p>
            </div>
          </div>

          {/* Pricing Tiers (Punto 1 - Named Plans) */}
          <div className="order-1 lg:order-2">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Planes disponibles</h3>
            <div className="space-y-4">
              {allTiers.map((tier, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-xl p-6 transition-all ${
                    calculation &&
                    properties >= tier.minProperties &&
                    (tier.maxProperties === null || properties <= tier.maxProperties)
                      ? 'border-violet-500 bg-violet-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {tier.name}
                    </h4>
                    <span className="text-2xl font-bold text-violet-600">
                      €{tier.pricePerProperty}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    {tier.label}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Por propiedad al mes
                  </p>

                  {calculation &&
                   properties >= tier.minProperties &&
                   (tier.maxProperties === null || properties <= tier.maxProperties) && (
                    <div className="mt-3 flex items-center text-violet-600">
                      <Check className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Tu plan actual</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Features */}
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
                  <li key={index} className="flex items-center text-gray-700">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">Más de 1,000 propietarios confían en nosotros</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-2xl font-bold text-gray-400">🏠 Airbnb</div>
            <div className="text-2xl font-bold text-gray-400">🏢 Booking.com</div>
            <div className="text-2xl font-bold text-gray-400">🏨 VRBO</div>
          </div>
        </div>
      </div>
    </section>
  )
}
