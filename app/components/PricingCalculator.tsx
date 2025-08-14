'use client'

import React, { useState, useEffect } from 'react'
import { Calculator, Check, Minus, Plus } from 'lucide-react'

interface PricingTier {
  minProperties: number
  maxProperties: number | null
  pricePerProperty: number
  label: string
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

export default function PricingCalculator() {
  const [properties, setProperties] = useState(3)
  const [couponCode, setCouponCode] = useState('')
  const [calculation, setCalculation] = useState<CalculationResult | null>(null)
  const [allTiers, setAllTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [couponError, setCouponError] = useState('')

  // Static pricing tiers as fallback
  const staticTiers = [
    { minProperties: 1, maxProperties: 4, pricePerProperty: 8.00, label: '1 - 4 propiedades' },
    { minProperties: 5, maxProperties: 9, pricePerProperty: 6.00, label: '5 - 9 propiedades' },
    { minProperties: 10, maxProperties: 19, pricePerProperty: 5.00, label: '10 - 19 propiedades' },
    { minProperties: 20, maxProperties: null, pricePerProperty: 4.00, label: '20+ propiedades' }
  ]

  // Calculate pricing locally
  useEffect(() => {
    const calculateLocally = () => {
      // Find applicable tier
      const applicableTier = staticTiers.find(tier => 
        properties >= tier.minProperties && 
        (tier.maxProperties === null || properties <= tier.maxProperties)
      )

      if (applicableTier) {
        setCalculation({
          properties,
          pricePerProperty: applicableTier.pricePerProperty,
          totalPrice: properties * applicableTier.pricePerProperty,
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
              couponCode: couponCode.trim()
            })
          })
          data = await response.json()
          
          if (!data.success) {
            setCouponError(data.error || 'Cupón no válido')
            // Still fetch normal pricing without coupon
            response = await fetch(`/api/pricing/calculate?properties=${properties}`)
            data = await response.json()
          }
        } else {
          response = await fetch(`/api/pricing/calculate?properties=${properties}`)
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
  }, [properties, couponCode])

  const handlePropertyChange = (change: number) => {
    const newValue = Math.max(1, properties + change)
    setProperties(newValue)
  }

  const handleDirectPropertyChange = (value: string) => {
    const num = parseInt(value) || 1
    setProperties(Math.max(1, num))
  }

  return (
    <section className="py-20 bg-gradient-to-br from-violet-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Precios transparentes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Paga solo por lo que necesitas. Más propiedades = mejor precio por unidad
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
                        {calculation.coupon.freeMonths} meses gratis (valor: €{Number(calculation.coupon.equivalentValue || 0).toFixed(2)})
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Calculation Result */}
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
                        {properties} propiedad{properties > 1 ? 'es' : ''}
                      </span>
                      <span className="text-gray-700">
                        €{calculation.pricePerProperty}/propiedad
                      </span>
                    </div>
                    
                    {/* Show pricing breakdown if coupon applied */}
                    {calculation.coupon?.applied && calculation.discountAmount !== undefined && (
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Precio original:</span>
                          <span className="text-gray-700">€{Number(calculation.totalPrice).toFixed(2)}</span>
                        </div>
                        {calculation.coupon.type !== 'FREE_MONTHS' && (
                          <>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Descuento:</span>
                              <span className="text-red-600">-€{Number(calculation.discountAmount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Precio final:</span>
                              <span className="text-green-600">€{Number(calculation.finalPrice || calculation.totalPrice).toFixed(2)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    
                    <div className="border-t border-violet-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">
                          {calculation.coupon?.type === 'FREE_MONTHS' ? 'Total mensual' : 'Total a pagar'}
                        </span>
                        <span className="text-3xl font-bold text-violet-600">
                          €{Number(calculation.finalPrice || calculation.totalPrice).toFixed(2)}
                        </span>
                      </div>
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
                ✨ Primera propiedad gratis durante 48 horas
              </p>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="order-1 lg:order-2">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Tramos de precios</h3>
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
                      {tier.label}
                    </h4>
                    <span className="text-2xl font-bold text-violet-600">
                      €{tier.pricePerProperty}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
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
                Incluido en todos los planes
              </h4>
              <ul className="space-y-3">
                {[
                  'Manuales digitales ilimitados',
                  'Códigos QR personalizados',
                  'Soporte multiidioma',
                  'Integración WhatsApp',
                  'Analytics detallados',
                  'Periodo de prueba de 48h',
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