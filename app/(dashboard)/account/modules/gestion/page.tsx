'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Receipt,
  Check,
  Building2,
  FileText,
  Users,
  BarChart3,
  CalendarDays,
  Sparkles,
  Shield,
  Zap,
  Tag,
  X,
  Loader2,
  Clock,
  Gift,
  AlertTriangle
} from 'lucide-react'
import { MODULES } from '@/config/modules'
import { toast } from 'react-hot-toast'
import { useGestionAccess } from '@/hooks/useModuleAccess'

type BillingPeriod = 'MONTHLY' | 'SEMESTRAL' | 'YEARLY'

interface ValidatedCoupon {
  id: string
  code: string
  name: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_MONTHS'
  discountPercent: number | null
  discountAmount: number | null
  freeMonths: number | null
}

const BILLING_OPTIONS: Record<BillingPeriod, { label: string; months: number; discount: number; badge?: string }> = {
  MONTHLY: { label: 'Mensual', months: 1, discount: 0 },
  SEMESTRAL: { label: 'Semestral', months: 6, discount: 10, badge: '-10%' },
  YEARLY: { label: 'Anual', months: 12, discount: 20, badge: '-20%' }
}

const FEATURES = [
  {
    icon: Users,
    title: 'Gestión de Propietarios',
    description: 'Centraliza la información de tus clientes propietarios'
  },
  {
    icon: CalendarDays,
    title: 'Importación de Reservas',
    description: 'Importa automáticamente desde Airbnb, Booking y otros'
  },
  {
    icon: FileText,
    title: 'Facturas Automáticas',
    description: 'Genera facturas conformes a normativa española'
  },
  {
    icon: Receipt,
    title: 'Liquidaciones Mensuales',
    description: 'Crea liquidaciones detalladas para propietarios'
  },
  {
    icon: Building2,
    title: 'Control de Gastos',
    description: 'Registra y categoriza gastos por propiedad'
  },
  {
    icon: BarChart3,
    title: 'Informes de Rentabilidad',
    description: 'Analiza el rendimiento de cada propiedad'
  }
]

export default function GestionModulePage() {
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>('YEARLY')
  const [loading, setLoading] = useState(false)
  const [trialLoading, setTrialLoading] = useState(false)

  // Check current module access
  const { hasAccess, isLoading: accessLoading, access, trialEndsAt } = useGestionAccess()

  // If user already has active access, redirect to /gestion
  useEffect(() => {
    if (!accessLoading && hasAccess) {
      router.replace('/gestion')
    }
  }, [accessLoading, hasAccess, router])

  // Determine if trial was already used (expired)
  const trialExpired = !hasAccess && trialEndsAt && new Date(trialEndsAt) < new Date()
  const canStartTrial = !hasAccess && !trialEndsAt

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [validatedCoupon, setValidatedCoupon] = useState<ValidatedCoupon | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)

  const module = MODULES.GESTION
  const basePrice = module.basePriceMonthly || 8
  const trialDays = module.trialDays || 14

  const calculatePrice = (period: BillingPeriod): number => {
    const { months, discount } = BILLING_OPTIONS[period]
    const total = basePrice * months
    return total * (1 - discount / 100)
  }

  const calculatePriceWithCoupon = (period: BillingPeriod): { original: number; final: number; savings: number } => {
    const original = calculatePrice(period)

    if (!validatedCoupon) {
      return { original, final: original, savings: 0 }
    }

    let final = original

    if (validatedCoupon.type === 'PERCENTAGE' && validatedCoupon.discountPercent) {
      final = original * (1 - validatedCoupon.discountPercent / 100)
    } else if (validatedCoupon.type === 'FIXED_AMOUNT' && validatedCoupon.discountAmount) {
      final = Math.max(0, original - validatedCoupon.discountAmount)
    } else if (validatedCoupon.type === 'FREE_MONTHS' && validatedCoupon.freeMonths) {
      const monthlyPrice = original / BILLING_OPTIONS[period].months
      final = Math.max(0, original - (monthlyPrice * validatedCoupon.freeMonths))
    }

    return { original, final, savings: original - final }
  }

  const getPricePerMonth = (period: BillingPeriod): number => {
    const total = calculatePrice(period)
    return total / BILLING_OPTIONS[period].months
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Introduce un código de cupón')
      return
    }

    setCouponLoading(true)
    setCouponError(null)

    try {
      const response = await fetch('/api/modules/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          moduleType: 'GESTION',
          amount: calculatePrice(selectedPeriod)
        })
      })

      const result = await response.json()

      if (result.success) {
        setValidatedCoupon(result.coupon)
        setCouponError(null)
        toast.success(`Cupón "${result.coupon.name}" aplicado`)
      } else {
        setCouponError(result.error || 'Cupón no válido')
        setValidatedCoupon(null)
      }
    } catch (error) {
      console.error('Error validating coupon:', error)
      setCouponError('Error al validar el cupón')
      setValidatedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setValidatedCoupon(null)
    setCouponCode('')
    setCouponError(null)
  }

  // Activar trial de 14 días
  const handleStartTrial = async () => {
    setTrialLoading(true)

    try {
      const response = await fetch('/api/modules/activate-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleCode: 'GESTION',
          trialDays
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`¡Trial de ${trialDays} días activado!`)
        router.push('/gestion')
      } else {
        toast.error(result.error || 'Error al activar el trial')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al activar el trial')
    } finally {
      setTrialLoading(false)
    }
  }

  // Ir a checkout de Stripe
  const handleSubscribe = async () => {
    setLoading(true)

    try {
      const { final } = calculatePriceWithCoupon(selectedPeriod)

      const response = await fetch('/api/modules/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleCode: 'GESTION',
          billingPeriod: selectedPeriod,
          couponCode: validatedCoupon?.code || null,
          amount: final
        })
      })

      const result = await response.json()

      if (result.success && result.url) {
        window.location.href = result.url
      } else {
        toast.error(result.error || 'Error al crear sesión de pago')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Volver</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${module.color}15` }}
          >
            <Receipt className="w-10 h-10" style={{ color: module.color }} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {module.name}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {module.description}
          </p>
        </div>

        {/* Loading state */}
        {accessLoading && (
          <div className="bg-gray-100 rounded-2xl p-8 text-center mb-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="text-gray-500 mt-2">Cargando...</p>
          </div>
        )}

        {/* Trial Expired Banner */}
        {!accessLoading && trialExpired && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 md:p-8 text-white text-center mb-8 shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <span className="text-lg font-semibold">Tu prueba gratuita ha expirado</span>
            </div>
            <p className="text-amber-100 mb-4">
              Tu período de prueba terminó el {new Date(trialEndsAt!).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}.
              Suscríbete para seguir usando Gestión.
            </p>
          </div>
        )}

        {/* Trial CTA - Only show if trial not used */}
        {!accessLoading && canStartTrial && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 md:p-8 text-white text-center mb-8 shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Gift className="w-6 h-6" />
              <span className="text-lg font-semibold">Prueba gratis {trialDays} días</span>
            </div>
            <p className="text-emerald-100 mb-6">
              Sin tarjeta de crédito. Cancela cuando quieras.
            </p>
            <button
              onClick={handleStartTrial}
              disabled={trialLoading}
              className="px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {trialLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Activando...
                </span>
              ) : (
                `Empezar prueba gratuita`
              )}
            </button>
          </div>
        )}

        {/* Divider - only show when trial option is available */}
        {!accessLoading && canStartTrial && (
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-500 text-sm">o suscríbete directamente</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        )}

        {/* Pricing Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-12">
          {/* Period Selector */}
          <div className="bg-gray-50 p-4 border-b border-gray-100">
            <div className="flex justify-center gap-2">
              {(Object.keys(BILLING_OPTIONS) as BillingPeriod[]).map((period) => {
                const option = BILLING_OPTIONS[period]
                const isSelected = selectedPeriod === period
                return (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {option.label}
                    {option.badge && (
                      <span className={`absolute -top-2 -right-2 px-1.5 py-0.5 text-xs font-bold rounded-full ${
                        isSelected ? 'bg-yellow-400 text-yellow-900' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {option.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Price Display */}
          <div className="p-8 text-center">
            {(() => {
              const { original, final, savings } = calculatePriceWithCoupon(selectedPeriod)
              const hasCoupon = validatedCoupon && savings > 0

              return (
                <>
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    {hasCoupon && (
                      <span className="text-2xl text-gray-400 line-through">
                        {original.toFixed(2).replace('.', ',')}€
                      </span>
                    )}
                    <span className={`text-5xl font-bold ${hasCoupon ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {final.toFixed(2).replace('.', ',')}€
                    </span>
                    <span className="text-gray-500">
                      / {BILLING_OPTIONS[selectedPeriod].months === 1 ? 'mes' : `${BILLING_OPTIONS[selectedPeriod].months} meses`}
                    </span>
                  </div>

                  {hasCoupon && (
                    <p className="text-emerald-600 font-semibold mb-2">
                      ¡Ahorras {savings.toFixed(2).replace('.', ',')}€!
                    </p>
                  )}

                  {selectedPeriod !== 'MONTHLY' && !hasCoupon && (
                    <p className="text-emerald-600 font-medium">
                      Solo {getPricePerMonth(selectedPeriod).toFixed(2).replace('.', ',')}€/mes
                    </p>
                  )}
                </>
              )
            })()}

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-500" />
                Sin límite de propiedades
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-500" />
                Cancela cuando quieras
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Soporte prioritario
              </div>
            </div>

            {/* Coupon Section */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              {validatedCoupon ? (
                <div className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg">
                  <Tag className="w-4 h-4" />
                  <span className="font-medium">
                    Cupón aplicado: {validatedCoupon.name}
                    {validatedCoupon.type === 'PERCENTAGE' && ` (-${validatedCoupon.discountPercent}%)`}
                    {validatedCoupon.type === 'FIXED_AMOUNT' && ` (-${validatedCoupon.discountAmount}€)`}
                    {validatedCoupon.type === 'FREE_MONTHS' && ` (${validatedCoupon.freeMonths} mes${validatedCoupon.freeMonths === 1 ? '' : 'es'} gratis)`}
                  </span>
                  <button
                    onClick={removeCoupon}
                    className="ml-2 p-1 hover:bg-emerald-100 rounded-full transition-colors"
                    title="Quitar cupón"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="max-w-xs mx-auto">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Código de cupón"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase())
                          setCouponError(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            validateCoupon()
                          }
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm uppercase"
                      />
                    </div>
                    <button
                      onClick={validateCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {couponLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Aplicar'
                      )}
                    </button>
                  </div>
                  {couponError && (
                    <p className="mt-2 text-sm text-red-600">{couponError}</p>
                  )}
                </div>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="mt-8 w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Procesando...' : 'Suscribirme ahora'}
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Todo lo que incluye
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-5 border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${module.color}15` }}
                  >
                    <feature.icon className="w-5 h-5" style={{ color: module.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ or Trust Section */}
        <div className="bg-emerald-50 rounded-2xl p-6 md:p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ¿Tienes dudas?
          </h3>
          <p className="text-gray-600 mb-4">
            Escríbenos y te ayudamos a decidir si Gestión es para ti.
          </p>
          <a
            href="mailto:hola@itineramio.com?subject=Consulta sobre Gestión"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            hola@itineramio.com
          </a>
        </div>
      </div>
    </div>
  )
}
